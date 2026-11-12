#!/usr/bin/env node

// Deliberately supports flat scalar YAML frontmatter, not arbitrary YAML.
// Reject unsupported syntax instead of guessing identity or rewriting metadata.
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { lstat, open, readFile, readdir, realpath, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TASK_ID_PATTERN = /^GFT-[a-z0-9]{8}$/;
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const digest = text => createHash('sha256').update(text).digest('hex');

export class TaskIdError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
const fail = (code, message, details) => { throw new TaskIdError(code, message, details); };

function scalar(source) {
  const quoted = source.match(/^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')[ \t]*(?:#.*)?$/);
  if (quoted) {
    const value = quoted[1];
    try { return value[0] === '"' ? JSON.parse(value) : value.slice(1, -1).replaceAll("''", "'"); }
    catch { fail('UNSUPPORTED_YAML', '双引号标量使用 JSON 兼容转义；请保留原文并人工核对。'); }
  }
  const value = source.replace(/(?:^|[ \t]+)#.*$/, '').trim();
  if (/^["'\[\]{}&*!|>@`%,?]/.test(value) || /:[ \t]|[\r\n]/.test(value) || /^-(?:[ \t]|$)/.test(value)) {
    fail('UNSUPPORTED_YAML', '仅支持扁平标量 YAML；复杂元数据不自动解释或改写。');
  }
  if (/^(?:null|Null|NULL|~)?$/.test(value)) return null;
  return value;
}

export function parseTaskIndex(text) {
  const bom = text.startsWith('\uFEFF') ? '\uFEFF' : '';
  const content = text.slice(bom.length);
  const eol = content.match(/\r?\n/)?.[0] ?? '\n';
  const opening = content.match(/^---[ \t]*(?:\r?\n|$)/);
  if (!opening) return { taskId: null, fields: new Map(), insertion: bom.length, eol, hasFrontmatter: false };
  const rest = content.slice(opening[0].length);
  const closing = /^---[ \t]*(?:\r?\n|$)/m.exec(rest);
  if (!closing) fail('INVALID_FRONTMATTER', 'YAML frontmatter 缺少结束分隔符。');
  const fields = new Map();
  let offset = bom.length + opening[0].length;
  for (const lineWithEol of rest.slice(0, closing.index).match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const line = lineWithEol.replace(/\r?\n$/, '');
    if (!/^[ \t]*(?:#.*)?$/.test(line)) {
      const match = line.match(/^([A-Za-z_][\w-]*|"(?:[^"\\]|\\.)*"|'(?:[^']|'')*')[ \t]*:[ \t]*(.*)$/);
      if (!match) fail('UNSUPPORTED_YAML', '仅支持顶层标量键值；不读取正文中的 ID，也不猜测复杂 YAML。');
      const key = scalar(match[1]);
      if (fields.has(key)) fail('DUPLICATE_FIELD', `YAML 字段重复：${key}`);
      fields.set(key, { value: scalar(match[2]), start: offset, end: offset + line.length, line });
    }
    offset += lineWithEol.length;
  }
  const taskId = fields.get('task_id')?.value ?? null;
  if (taskId !== null && !TASK_ID_PATTERN.test(taskId)) fail('INVALID_ID', `非法 task_id：${taskId}`);
  return { taskId, fields, insertion: bom.length + opening[0].length + closing.index, eol, hasFrontmatter: true };
}

export function generateTaskId() {
  return 'GFT-' + Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
}

export async function defaultRoot() {
  return realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
}

async function canonicalPath(path, root) {
  const actual = await realpath(path);
  const rel = relative(root, actual);
  if (rel === '..' || rel.startsWith('..' + sep) || rel.startsWith(sep)) {
    fail('OUTSIDE_ROOT', '符号链接或目标路径离开了指定资料根。', { path, actual, root });
  }
  return actual;
}

async function directories(path, root) {
  // A missing container is an empty scope; an existing dangling link is not.
  try { await lstat(path); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const entries = await readdir(await canonicalPath(path, root), { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const actual = await canonicalPath(join(path, entry.name), root);
    if ((await stat(actual)).isDirectory()) names.push(entry.name);
  }
  return names.sort();
}

async function taskRecord(indexPath, root) {
  // The discoverable entry may be a same-root legacy worktree compatibility link.
  // Its logical hierarchy supplies context; its real file supplies identity.
  const entryPath = resolve(indexPath);
  const parts = relative(root, entryPath).split(sep);
  if (parts.length !== 7 || parts[0] !== 'projects' || parts[2] !== 'features' || parts[4] !== 'tasks' || parts[6] !== 'index.md') {
    fail('INVALID_TASK_PATH', '任务入口须位于 projects/<project>/features/<feature>/tasks/<task>/index.md。', { indexPath: entryPath });
  }
  const actual = await canonicalPath(entryPath, root);
  if (!(await stat(actual)).isFile()) fail('INVALID_TASK_FILE', '任务入口不是普通文件。', { indexPath: actual });
  const text = await readFile(actual, 'utf8');
  const parsed = parseTaskIndex(text);
  return { task_id: parsed.taskId, project: parts[1], feature: parts[3], task: parts[5],
    directory: dirname(actual), entryPath, indexPath: actual, indexSha256: digest(text) };
}

export async function scanTasks(root = undefined) {
  root = await realpath(root ?? await defaultRoot());
  const tasks = new Map();
  const errors = [];
  try {
    for (const project of await directories(join(root, 'projects'), root)) {
      const features = join(root, 'projects', project, 'features');
      for (const feature of await directories(features, root)) {
        const container = join(features, feature, 'tasks');
        for (const task of await directories(container, root)) {
          const index = join(container, task, 'index.md');
          try {
            // Missing index is not a task; a dangling symlink is an error.
            try { await lstat(index); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
            const record = await taskRecord(index, root);
            if (!tasks.has(record.indexPath) || record.entryPath === record.indexPath) tasks.set(record.indexPath, record);
          } catch (error) { errors.push({ path: index, code: error.code ?? 'IO_ERROR', message: error.message }); }
        }
      }
    }
  } catch (error) { errors.push({ path: root, code: error.code ?? 'IO_ERROR', message: error.message }); }
  const groups = new Map();
  for (const task of tasks.values()) if (task.task_id) {
    if (!groups.has(task.task_id)) groups.set(task.task_id, []);
    groups.get(task.task_id).push(task.indexPath);
  }
  const duplicates = [...groups].filter(([, paths]) => paths.length > 1).map(([task_id, paths]) => ({ task_id, paths }));
  return { root, tasks: [...tasks.values()], errors, duplicates };
}

function assertHealthy(scan) {
  if (scan.errors.length || scan.duplicates.length) {
    fail('INVALID_LIBRARY', '资料根存在无法读取的任务元数据或重复 ID，停止定位和写入；请先核对。',
      { errors: scan.errors, duplicates: scan.duplicates });
  }
}

export async function checkTaskIds(root = undefined) {
  const scan = await scanTasks(root);
  return { root: scan.root, valid: !scan.errors.length && !scan.duplicates.length, total: scan.tasks.length,
    identified: scan.tasks.filter(task => task.task_id).length,
    missing: scan.tasks.filter(task => !task.task_id).map(task => task.indexPath), errors: scan.errors, duplicates: scan.duplicates };
}

export async function resolveTaskIds(ids, { root } = {}) {
  if (!ids.length || ids.some(id => !TASK_ID_PATTERN.test(id))) fail('INVALID_ID', '请提供完整的 GFT-加八位小写字母或数字标识。');
  const scan = await scanTasks(root);
  assertHealthy(scan);
  const tasks = [...new Set(ids)].map(id => {
    const task = scan.tasks.find(candidate => candidate.task_id === id);
    if (!task) fail('NOT_FOUND', `未找到任务 ${id}；未猜测其他任务或修改文件。`, { task_id: id, root: scan.root });
    return task;
  });
  return { root: scan.root, tasks };
}

export async function ensureTaskId(directory, { root, expectedSha256, generateId = generateTaskId } = {}) {
  root = await realpath(root ?? await defaultRoot());
  directory = await canonicalPath(directory, root);
  const indexPath = join(directory, 'index.md');
  const lockPath = join(root, '.task-id.lock');
  let lock;
  try { lock = await open(lockPath, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') fail('BUSY', '此资料根已有 ID 写入锁；本次不等待、不删锁、不重试。请核对原操作。');
    throw error;
  }
  let temporary;
  try {
    const scan = await scanTasks(root);
    assertHealthy(scan);
    const record = scan.tasks.find(task => task.directory === directory && task.indexPath === indexPath);
    if (!record) fail('INVALID_TASK_PATH', '目标不在可检索的任务集合内。');
    const metadata = await lstat(indexPath);
    if (!metadata.isFile() || metadata.nlink !== 1) fail('INVALID_TASK_FILE', '写入只接受非符号链接、非硬链接的普通任务入口。');
    const original = await readFile(indexPath, 'utf8');
    const beforeHash = digest(original);
    if (record.indexSha256 !== beforeHash || (expectedSha256 !== undefined && expectedSha256 !== beforeHash)) {
      fail('CHANGED', '任务入口已变化，请重新读取后处理；未覆盖原文。');
    }
    const parsed = parseTaskIndex(original);
    if (parsed.taskId) return { ...record, changed: false };
    const assigned = new Set(scan.tasks.map(task => task.task_id).filter(Boolean));
    let taskId;
    for (let attempt = 0; attempt < 100; attempt++) {
      const candidate = generateId();
      if (!TASK_ID_PATTERN.test(candidate)) fail('INVALID_ID', '生成器返回了非法 ID。');
      if (!assigned.has(candidate)) { taskId = candidate; break; }
    }
    if (!taskId) fail('COLLISION', '未生成未占用的 ID；未写入。');
    let updated;
    const existing = parsed.fields.get('task_id');
    if (existing) {
      const comment = existing.line.match(/[ \t]+#.*$/)?.[0] ?? '';
      updated = original.slice(0, existing.start) + `task_id: ${taskId}${comment}` + original.slice(existing.end);
    } else if (parsed.hasFrontmatter) {
      updated = original.slice(0, parsed.insertion) + `task_id: ${taskId}${parsed.eol}` + original.slice(parsed.insertion);
    } else {
      const bom = original.startsWith('\uFEFF') ? '\uFEFF' : '';
      updated = bom + `---${parsed.eol}task_id: ${taskId}${parsed.eol}---${parsed.eol}` + original.slice(bom.length);
    }
    temporary = join(directory, `.index.task-id.${randomUUID()}.tmp`);
    const output = await open(temporary, 'wx', metadata.mode & 0o777);
    try { await output.writeFile(updated, 'utf8'); await output.sync(); } finally { await output.close(); }
    const current = await lstat(indexPath);
    if (!current.isFile() || current.ino !== metadata.ino || current.dev !== metadata.dev ||
        await canonicalPath(directory, root) !== directory || await canonicalPath(record.entryPath, root) !== indexPath ||
        digest(await readFile(indexPath, 'utf8')) !== beforeHash) {
      fail('CHANGED', '写入前发现入口身份或内容变化；未覆盖原文。');
    }
    await rename(temporary, indexPath);
    temporary = undefined;
    const saved = await taskRecord(record.entryPath, root);
    if (saved.task_id !== taskId || saved.indexSha256 !== digest(updated)) fail('VERIFY_FAILED', 'ID 写入后读回不一致，请核对文件。');
    return { ...saved, changed: true };
  } finally {
    try { if (temporary) await unlink(temporary); }
    finally { await lock.close(); await unlink(lockPath); }
  }
}

export async function main(args = process.argv.slice(2)) {
  const [command, ...rest] = args;
  const operands = [];
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--root' || rest[i] === '--expect-sha256') {
      const key = rest[i] === '--root' ? 'root' : 'expectedSha256';
      if (options[key] !== undefined || !rest[i + 1] || rest[i + 1].startsWith('--')) fail('USAGE', '选项需要唯一的参数值。');
      options[key] = rest[++i];
    } else if (rest[i].startsWith('--')) fail('USAGE', `未知选项：${rest[i]}`);
    else operands.push(rest[i]);
  }
  let result;
  if (command === 'check' && !operands.length && !options.expectedSha256) result = await checkTaskIds(options.root);
  else if (command === 'resolve' && operands.length && !options.expectedSha256) result = await resolveTaskIds(operands, options);
  else if (command === 'ensure' && operands.length === 1) result = await ensureTaskId(operands[0], options);
  else fail('USAGE', '用法：task-id.mjs check | resolve <GFT-ID...> | ensure <任务目录> [--expect-sha256 <读取时哈希>]；均可指定 --root <OPS资料根>。');
  console.log(JSON.stringify(result, null, 2));
  if (result.valid === false) process.exitCode = 1;
}

// argv[1] may be an installed Skill symlink; resolve it before comparing.
if (process.argv[1] && await realpath(process.argv[1]).catch(() => null) === fileURLToPath(import.meta.url)) {
  try { await main(); }
  catch (error) {
    console.error(JSON.stringify({ error: error.code ?? 'IO_ERROR', message: error.message, details: error.details }, null, 2));
    process.exitCode = 1;
  }
}
