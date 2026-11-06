#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { constants, copyFile, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { diagnostic, problem, readJSON, ossFailure } from './diagnostics.mjs';

export const types = {
  '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.zip': 'application/zip', '.pdf': 'application/pdf',
};
const fail = message => { throw new Error(message); };
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
export function keys(value, allowed, label) {
  if (!plain(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    fail(`${label}字段不受支持；仅记录非敏感配置，不接受密钥字段。`);
  }
}
export function resourcePath(value, label) {
  if (typeof value !== 'string' || !value || isAbsolute(value) || value.includes('\\') || value.includes('\0') ||
      value.split('/').some(part => !part || part.startsWith('.'))) fail(`${label}路径必须为不含隐藏项或越界片段的相对路径。`);
  return value;
}
export function baseURL(value, allowRelative) {
  if (typeof value !== 'string' || /[?#\\\s]/u.test(value)) fail('公开地址必须无凭据、查询参数、片段或空白。');
  if (allowRelative && value.startsWith('/') && !value.startsWith('//')) {
    resourcePath(value.slice(1).replace(/\/$/, ''), '公开地址');
    return value.replace(/\/$/, '');
  }
  let url;
  try { url = new URL(value); } catch { fail('公开地址必须是有效 HTTPS URL。'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) fail('公开地址必须是无凭据的 HTTPS URL。');
  return url.href.replace(/\/$/, '');
}

export async function hashFile(path) {
  const digest = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(path)) { bytes += chunk.length; digest.update(chunk); }
  return { bytes, sha256: digest.digest('hex') };
}

export async function loadConfig(path) {
  const config = await readJSON(path, '资源配置');
  keys(config, ['version', 'publicDir', 'files', 'storage'], '项目配置');
  if (config.version !== 1 || typeof config.publicDir !== 'string' || !config.publicDir) fail('配置需要 version=1 和明确的 publicDir。');
  if (!Array.isArray(config.files) || !config.files.length || new Set(config.files).size !== config.files.length) fail('files 必须是非空、无重复的显式公开资源列表。');
  const storage = config.storage;
  keys(storage, ['provider', 'prefix', 'publicBaseURL', 'bucket', 'region', 'profile'], '存储配置');
  if (!['oss', 'same-origin'].includes(storage.provider)) fail('provider 仅支持 oss 或 same-origin。');
  resourcePath(storage.prefix, '项目前缀');
  if (!/^[a-z0-9][a-z0-9._/-]*$/.test(storage.prefix)) fail('项目前缀使用小写字母、数字、连字符或分层路径。');
  const publicBaseURL = baseURL(storage.publicBaseURL, storage.provider === 'same-origin');
  if (storage.provider === 'oss') {
    if (typeof storage.bucket !== 'string' || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(storage.bucket)) fail('OSS 配置需要有效 bucket 名称。');
    if (typeof storage.region !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(storage.region) || storage.region.startsWith('oss-')) fail('OSS region 使用 cn-shanghai 等地域 ID，不包含 oss- 前缀。');
    if (storage.profile !== undefined && (typeof storage.profile !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(storage.profile))) fail('profile 必须是官方 CLI 中已有的配置名称。');
  } else if (['bucket', 'region', 'profile'].some(field => storage[field] !== undefined)) {
    fail('同站模式不需要云账号字段。');
  }
  return { ...config, storage: { ...storage, publicBaseURL } };
}

export async function sourceFile(root, source) {
  resourcePath(source, '资源');
  let path = root;
  const parts = source.split('/');
  for (const [index, part] of parts.entries()) {
    path = join(path, part);
    const stat = await lstat(path);
    if (stat.isSymbolicLink() || (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())) fail('资源必须是公开目录内的普通文件，不接受子路径符号链接。');
  }
  return path;
}

export async function createPlan(configPath) {
  const config = await loadConfig(configPath);
  const root = await realpath(resolve(dirname(configPath), config.publicDir));
  const files = [], sources = new Map();
  for (const source of [...config.files].sort()) {
    const contentType = types[extname(source).toLowerCase()];
    if (!contentType) fail('资源类型不支持；HTML、脚本和目录数据应留给页面构建处理。');
    const path = await sourceFile(root, source);
    const digest = await hashFile(path);
    const key = `${config.storage.prefix}/objects/${digest.sha256}${extname(source).toLowerCase()}`;
    const publicURL = `${config.storage.publicBaseURL}/${key.split('/').map(encodeURIComponent).join('/')}`;
    files.push({ source, key, publicURL, ...digest, contentType });
    sources.set(source, path);
  }
  return { config, sources, manifest: { version: 1, files } };
}

async function safeDirectory(root, parts) {
  let path = root;
  for (const part of parts) {
    path = join(path, part);
    try { await mkdir(path); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = await lstat(path);
    if (stat.isSymbolicLink() || !stat.isDirectory()) fail('输出目录包含符号链接或非目录项，停止写入。');
  }
  return path;
}

export async function preparePlan(plan, output) {
  await mkdir(output, { recursive: true });
  const root = await realpath(output);
  for (const entry of plan.manifest.files) {
    await safeDirectory(root, entry.key.split('/').slice(0, -1));
    const target = join(root, entry.key);
    try {
      const stat = await lstat(target);
      if (stat.isSymbolicLink() || !stat.isFile()) fail('输出对象不是普通文件，停止写入。');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    try { await copyFile(plan.sources.get(entry.source), target, constants.COPYFILE_EXCL); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    const digest = await hashFile(target);
    if (digest.bytes !== entry.bytes || digest.sha256 !== entry.sha256) fail('输出对象内容冲突或源文件已变化，未覆盖原文件，停止发布。');
  }
  const dir = await safeDirectory(root, plan.config.storage.prefix.split('/'));
  const temp = join(dir, `.manifest-${randomUUID()}.tmp`);
  const manifestPath = join(dir, 'assets-manifest.json');
  await writeFile(temp, JSON.stringify(plan.manifest, null, 2) + '\n', { flag: 'wx' });
  await rename(temp, manifestPath);
  return { root, manifestPath };
}

export async function verifyEntry(entry, { origin } = {}) {
  try { return await readEntry(entry, { origin }); }
  catch (error) { throw new Error(`对象 ${JSON.stringify(entry.key || entry.source || '未命名')} 核验失败：${error.code ? '网络或本地读取失败。' : error.message}`); }
}

async function readEntry(entry, { origin } = {}) {
  const publicURL = entry.publicURL.startsWith('/') ? origin ? new URL(entry.publicURL, origin).href : fail('相对资源地址需要 --origin 指定正式 HTTPS 站点。') : entry.publicURL;
  const response = await fetch(publicURL, { signal: AbortSignal.timeout(20_000) });
  const cancel = async message => { await response.body?.cancel(); fail(message); };
  if (!response.ok) return cancel(`资源 GET 失败：HTTP ${response.status}。`);
  if (publicURL.startsWith('https:') && !response.url.startsWith('https:')) return cancel('资源跳转到了非 HTTPS 地址。');
  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== entry.contentType && !(entry.contentType === 'application/javascript' && contentType === 'text/javascript')) return cancel('资源类型不一致，不能将错误页或下载成功当作资源可用。');
  const digest = createHash('sha256');
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > entry.bytes) fail('资源字节超过预期，内容校验失败。');
    digest.update(chunk);
  }
  const sha256 = digest.digest('hex');
  if (bytes !== entry.bytes || sha256 !== entry.sha256) fail('资源字节或哈希不一致，内容校验失败。');
  return { key: entry.key, verified: true, bytes, sha256, contentType,
    cacheControl: response.headers.get('cache-control'),
    contentDisposition: response.headers.get('content-disposition'),
    forceDownload: response.headers.get('x-oss-force-download') };
}

export function ossCommand(storage, command, args) {
  const options = ['-e', `https://oss-${storage.region}.aliyuncs.com`, '--region', storage.region];
  if (storage.profile) options.push('--profile', storage.profile);
  const result = spawnSync('aliyun', ['oss', command, ...args, ...options], { encoding: 'utf8', timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
  const message = `${result.stdout}\n${result.stderr}`;
  const failure = ossFailure(message, result.error);
  return { ok: !result.error && result.status === 0, missing: !result.error && failure.code === 'NoSuchKey', failure };
}

export async function publishPlan(plan) {
  if (plan.config.storage.provider !== 'oss') fail('同站模式使用 prepare，然后随页面构建发布。');
  const temp = await mkdtemp(join(tmpdir(), 'static-publish-'));
  const results = [];
  let index = -1;
  try {
    await preparePlan(plan, temp);
    for (const [i, entry] of plan.manifest.files.entries()) {
      index = i;
      const target = `oss://${plan.config.storage.bucket}/${entry.key}`;
      const existing = ossCommand(plan.config.storage, 'stat', [target]);
      if (existing.ok) {
        results.push({ ...await verifyEntry(entry), action: 'reused' });
        continue;
      }
      if (!existing.missing) throw problem(existing.failure.code, existing.failure.message, existing.failure.nextStep);
      const upload = ossCommand(plan.config.storage, 'cp', [join(temp, entry.key), target, '--acl', 'public-read', '--meta', `Content-Type:${entry.contentType}#Cache-Control:public,max-age=31536000,immutable`]);
      if (!upload.ok) throw problem(upload.failure.code, upload.failure.message, upload.failure.nextStep);
      results.push({ ...await verifyEntry(entry), action: 'uploaded' });
    }
  } catch (error) {
    const d = diagnostic(error);
    error.progress = { complete: false, pagePublished: false, verified: results,
      failed: [{ key: index < 0 ? null : plan.manifest.files[index].key, stage: index < 0 ? 'prepare' : 'publish', ...d }],
      notAttempted: plan.manifest.files.slice(index + 1).map(e => e.key) };
    throw error;
  } finally { await rm(temp, { recursive: true, force: true }); }
  return { manifest: plan.manifest, results, complete: true, pagePublished: false };
}

export async function renderHTML(manifestPath, input, output) {
  const manifest = await readJSON(manifestPath, '资源清单');
  keys(manifest, ['version', 'files'], '资源清单');
  if (manifest.version !== 1 || !Array.isArray(manifest.files)) fail('资源清单需要 version=1 和 files。');
  const urls = new Map();
  for (const entry of manifest.files) {
    keys(entry, ['source', 'key', 'publicURL', 'bytes', 'sha256', 'contentType'], '资源清单条目');
    resourcePath(entry.source, '资源清单 source');
    if (urls.has(entry.source)) fail('资源清单有重复 source。');
    urls.set(entry.source, baseURL(entry.publicURL, true));
  }
  if (extname(input).toLowerCase() !== '.html' || extname(output).toLowerCase() !== '.html' || resolve(input) === resolve(output)) fail('render 需要独立的 HTML 模板和新 HTML 输出。');
  const original = await readFile(input, 'utf8'); let replaced = 0;
  const escaped = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const html = original.replace(/\{\{asset:([^{}]+)\}\}/g, (_, source) => {
    if (!urls.has(source)) throw problem('UNKNOWN_ASSET', 'HTML 占位符在资源清单中不存在。', '核对占位符 source 和实际清单，不要手拼哈希 URL。');
    replaced++; return escaped(urls.get(source));
  });
  if (!replaced) fail('模板没有 {{asset:source}} 占位符；普通网页无需 render。');
  await writeFile(output, html, { flag: 'wx' });
  return { output, replaced, pagePublished: false };
}

const usage = `用法（配置路径相对当前目录，资源路径相对配置文件）：
  node resources.mjs plan CONFIG
  node resources.mjs prepare CONFIG OUTPUT
  node resources.mjs publish CONFIG --apply
  node resources.mjs verify CONFIG [--origin https://site.example.org]
  node resources.mjs render MANIFEST TEMPLATE.html NEW_OUTPUT.html
仅 publish --apply 写入云端；不建桶，不修改已有权限，不发布页面。`;

export async function main(args) {
  const [command, configPath, ...rest] = args;
  if (command === '--help' || command === 'help' || !command) { console.log(usage); return; }
  if (command === 'render') {
    if (!configPath || rest.length !== 2) fail(usage);
    console.log(JSON.stringify(await renderHTML(resolve(configPath), resolve(rest[0]), resolve(rest[1])), null, 2)); return;
  }
  if (!['plan', 'prepare', 'publish', 'verify'].includes(command) || !configPath) fail(usage);
  if (command === 'publish' && (rest.length !== 1 || rest[0] !== '--apply')) fail('云写入需要明确 --apply；先运行 plan 审阅精确文件与目标。');
  if ((command === 'plan' && rest.length) || (command === 'prepare' && rest.length !== 1) || (command === 'verify' && rest.length && (rest.length !== 2 || rest[0] !== '--origin'))) fail(usage);
  let origin;
  if (command === 'verify' && rest.length) {
    origin = baseURL(rest[1], false);
    if (new URL(origin).pathname !== '/') fail('--origin 只接受站点 origin，不含路径。');
  }
  const plan = await createPlan(resolve(configPath));
  let result;
  if (command === 'plan') result = plan.manifest;
  if (command === 'prepare') result = await preparePlan(plan, resolve(rest[0]));
  if (command === 'publish') result = await publishPlan(plan);
  if (command === 'verify') {
    result = { verified: [] };
    for (const [index, entry] of plan.manifest.files.entries()) {
      try { result.verified.push(await verifyEntry(entry, { origin })); }
      catch (error) { error.progress = { ...result, complete: false, failed: [{ key: entry.key, error: error.message }], notAttempted: plan.manifest.files.slice(index + 1).map(e => e.key) }; throw error; }
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

// realpath 两侧兼容 Skill 安装时使用的符号链接入口。
if (process.argv[1] && await realpath(resolve(process.argv[1])).catch(() => '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    if (error.progress) console.log(JSON.stringify(error.progress, null, 2));
    const d = diagnostic(error);
    console.error(`失败 [${d.code}]：${d.message} 下一步：${d.nextStep}`);
    process.exitCode = 1;
  });
}
