#!/usr/bin/env node
import { copyFile, lstat, mkdtemp, realpath, rm, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hashFile } from './resources.mjs';

export async function deriveImage(input, output, { width, quality = 82 } = {}) {
  if (!Number.isInteger(width) || width < 1 || width > 8192 || !Number.isInteger(quality) || quality < 1 || quality > 100) throw new Error('width 需为 1–8192；quality 需为 1–100。');
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(extname(input).toLowerCase()) || extname(output).toLowerCase() !== '.webp' || resolve(input) === resolve(output)) throw new Error('只接受 PNG/JPEG/WebP 输入及独立 WebP 输出。');
  const stat = await lstat(input);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('输入必须为选定的普通图片文件。');
  const original = await hashFile(input);
  const temp = await mkdtemp(join(tmpdir(), 'publish-image-'));
  try {
    const source = join(temp, 'input' + extname(input).toLowerCase());
    await copyFile(input, source, constants.COPYFILE_EXCL);
    if ((await hashFile(source)).sha256 !== original.sha256) throw new Error('读取时源图片已变化。');
    const target = join(temp, 'output.webp');
    const cli = spawnSync('cwebp', ['-quiet', '-q', String(quality), '-resize', String(width), '0', source, '-o', target], { timeout: 60_000, encoding: 'utf8' });
    if (cli.error || cli.status !== 0) throw new Error('需要可用的 cwebp；编码失败，未修改原图。');
    const bytes = await readFile(target);
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('派生文件不是 WebP。');
    await copyFile(target, output, constants.COPYFILE_EXCL);
    return { source: input, output, original, derived: await hashFile(output), transform: { format: 'webp', width, quality },
      bytesSaved: original.bytes - bytes.length, recommended: bytes.length < original.bytes };
  } finally { await rm(temp, { recursive: true, force: true }); }
}

export async function main(args) {
  if (!args.length || args[0] === '--help') { console.log('用法：node images.mjs INPUT NEW_OUTPUT.webp --width 640 [--quality 82]\n输出目录需已存在；不覆盖文件，JSON 输出可保存为私有派生记录。'); return; }
  const [input, output, ...rest] = args;
  const options = {};
  if (!input || !output || rest.length % 2) throw new Error('缺少图片参数。');
  for (let i = 0; i < rest.length; i += 2) {
    if (!['--width', '--quality'].includes(rest[i]) || options[rest[i].slice(2)] !== undefined) throw new Error('图片选项不受支持或重复。');
    options[rest[i].slice(2)] = Number(rest[i + 1]);
  }
  console.log(JSON.stringify(await deriveImage(resolve(input), resolve(output), options), null, 2));
}
if (process.argv[1] && await realpath(resolve(process.argv[1])).catch(() => '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(`失败：${error.code ? '本地图片读取/输出失败；不覆盖已有文件。' : error.message}`); process.exitCode = 1; });
}
