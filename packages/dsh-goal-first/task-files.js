/** Read-only, task-scoped directory and bounded file previews. */
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { lstat, stat, opendir, open } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { safePath } from './lib/records.js';

const TEXT_LIMIT = 256 * 1024, IMAGE_LIMIT = 8 * 1024 * 1024, ENTRY_LIMIT = 200;
const images = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const binaryFormats = new Set(['.pdf', '.zip', '.gz', '.7z', '.mp3', '.mp4', '.mov', '.woff', '.woff2', '.docx', '.xlsx', '.pptx']);

async function taskPath(root, input = '') {
  const path = input ?? '';
  if (typeof path !== 'string' || path.length > 4096 || /[\\\0]/.test(path) || path.startsWith('/') || /^[a-z]:/i.test(path) || path.split('/').some(part => part === '.' || part === '..' || (!part && path))) throw new Error('只能读取当前任务目录中的相对路径');
  let candidate = root;
  for (const part of path.split('/').filter(Boolean)) {
    candidate = join(candidate, part);
    if ((await lstat(candidate)).isSymbolicLink()) throw new Error('目录内的符号链接不展开');
  }
  return { path, actual: await safePath(root, candidate) };
}

export async function listTaskFiles(root, input) {
  const { path, actual } = await taskPath(root, input);
  const entries = []; let truncated = false;
  const directory = await opendir(actual);
  for await (const entry of directory) {
    if (entry.name === '.DS_Store') continue;
    if (entries.length === ENTRY_LIMIT) { truncated = true; break; }
    const kind = entry.isSymbolicLink() ? 'link' : entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'unsupported';
    entries.push({ name: entry.name, path: path ? path + '/' + entry.name : entry.name, kind });
  }
  // A task path exchanged while listing cannot become the next preview root.
  if (await safePath(root, actual) !== actual) throw new Error('任务目录位置已变化，请刷新');
  entries.sort((a, b) => Number(b.kind === 'directory') - Number(a.kind === 'directory') || a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
  return { root, path, entries, truncated };
}

function imageMatches(type, data) {
  if (type === 'image/png') return data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  if (type === 'image/jpeg') return data.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  if (type === 'image/gif') return /^GIF8[79]a$/.test(data.subarray(0, 6).toString('ascii'));
  return data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP';
}

export async function readTaskFile(root, input) {
  const { path, actual } = await taskPath(root, input);
  if (!(await lstat(actual)).isFile()) throw new Error('请选择普通文件');
  // NONBLOCK also covers a regular file swapped for a FIFO between lstat and open.
  const handle = await open(actual, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (!info.isFile()) throw new Error('请选择普通文件');
    const named = await stat(actual);
    if (named.dev !== info.dev || named.ino !== info.ino || await safePath(root, actual) !== actual) throw new Error('文件位置已变化，请刷新');
    const metadata = { name: basename(path), path, size: info.size };
    const ext = extname(path).toLowerCase(), contentType = images[ext];
    const limit = contentType ? IMAGE_LIMIT : TEXT_LIMIT;
    if (info.size > limit) return { ...metadata, kind: 'unsupported', reason: 'large', limit };
    if (binaryFormats.has(ext)) return { ...metadata, kind: 'unsupported', reason: 'format' };
    const data = Buffer.alloc(info.size + 1); let length = 0;
    while (length < data.length) {
      const read = await handle.read(data, length, data.length - length, length);
      if (!read.bytesRead) break; length += read.bytesRead;
    }
    const after = await handle.stat(), current = await stat(actual);
    if (length !== info.size || [after, current].some(value => value.dev !== info.dev || value.ino !== info.ino || value.size !== info.size || value.mtimeMs !== info.mtimeMs || value.ctimeMs !== info.ctimeMs) || await safePath(root, actual) !== actual) throw new Error('文件在读取时变化，请重试');
    const bytes = data.subarray(0, length);
    metadata.version = createHash('sha256').update(bytes).digest('hex');
    if (contentType) return imageMatches(contentType, bytes) ? { ...metadata, kind: 'image', contentType, data: bytes } : { ...metadata, kind: 'unsupported', reason: 'binary' };
    try {
      if (bytes.includes(0)) throw new Error('binary');
      return { ...metadata, kind: 'text', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
    } catch { return { ...metadata, kind: 'unsupported', reason: 'binary' }; }
  } finally { await handle.close(); }
}
