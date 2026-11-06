#!/usr/bin/env node
// Explicit-file static snapshots; official Wrangler owns authentication and release operations.
import { copyFile, mkdir, readFile, realpath, readdir, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFile, keys, resourcePath, sourceFile, types, verifyEntry } from './resources.mjs';
import { diagnostic, problem, readJSON } from './diagnostics.mjs';
import { checkReferences } from './references.mjs';

const fail = message => { throw new Error(message); };
const pageTypes = { ...types, '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.txt': 'text/plain', '.wasm': 'application/wasm', '.ico': 'image/x-icon' };
const urlPath = path => '/' + path.split('/').map(encodeURIComponent).join('/');
const canonical = path => path === 'index.html' ? '/' : path.endsWith('/index.html') ? urlPath(path.slice(0, -10)) : path.endsWith('.html') ? urlPath(path.slice(0, -5)) : urlPath(path);

export async function planSite(configPath) {
  const config = await readJSON(configPath, '页面配置');
  keys(config, ['version', 'publicDir', 'files', 'immutable', 'worker'], '页面配置');
  keys(config.worker, ['name', 'accountId', 'compatibilityDate', 'plan'], 'Worker 配置');
  const w = config.worker;
  if (config.version !== 1 || typeof config.publicDir !== 'string' || !config.publicDir ||
      !/^[a-z][a-z0-9-]{0,62}$/.test(w.name) || !/^\d{4}-\d{2}-\d{2}$/.test(w.compatibilityDate) ||
      !Number.isFinite(Date.parse(w.compatibilityDate)) ||
      (w.accountId !== undefined && !/^[a-f0-9]{32}$/.test(w.accountId)) ||
      (w.plan !== undefined && !['free', 'paid'].includes(w.plan))) fail('页面配置需要 version=1、publicDir、有效 Worker 名称/日期；accountId、plan 可选。');
  if (!Array.isArray(config.files) || !config.files.length || new Set(config.files).size !== config.files.length) fail('files 需要无重复的显式公开页面及依赖列表。');
  const maxFiles = w.plan === 'paid' ? 100000 : 20000;
  if (config.files.length + 1 > maxFiles) throw problem('STATIC_FILE_LIMIT', `公开文件数连同生成的 _headers 超过 ${maxFiles}。`, '减少选定文件或分流重资源；只有已核对 Workers 付费账号时才设置 worker.plan=paid，此设置不会购买套餐。');
  if (config.immutable !== undefined && (!Array.isArray(config.immutable) || new Set(config.immutable).size !== config.immutable.length)) fail('immutable 必须为无重复的文件列表。');
  const immutable = new Set(config.immutable || []);
  if ([...immutable].some(path => !config.files.includes(path))) fail('immutable 必须属于公开文件集合。');
  const root = await realpath(resolve(dirname(configPath), config.publicDir));
  const files = [], urls = new Set();
  for (const source of [...config.files].sort()) {
    resourcePath(source, '页面');
    const contentType = pageTypes[extname(source).toLowerCase()];
    if (!contentType || /[*:\r\n]/.test(source) || /(?:^|\/)(?:AGENTS|CLAUDE)\.md$/i.test(source) || basename(source).startsWith('_')) fail('文件类型或控制路径不受支持；_headers 由快照工具生成，现有规则须人工合并。');
    const path = await sourceFile(root, source);
    const digest = await hashFile(path);
    if (digest.bytes > 25 * 1024 * 1024) throw problem('STATIC_SIZE_LIMIT', `文件 ${source} 超过 Static Assets 的 25 MiB 单文件限制。`, '将该重资源分流至自己可用的 OSS/其他已支持存储，接入公开 URL；不能直接降级为同站上传。');
    if (immutable.has(source) && !basename(source).match(/[a-f0-9]{12,64}/g)?.some(token => digest.sha256.startsWith(token))) fail('immutable 文件名必须包含与实际字节匹配的内容摘要（12–64 位）。');
    const url = canonical(source);
    if (urls.has(url)) fail('公开文件的规范 URL 冲突；先消除 HTML 别名冲突。');
    urls.add(url);
    files.push({ source, ...digest, contentType, immutable: immutable.has(source), url });
  }
  const references = await checkReferences(files, source => sourceFile(root, source).then(path => readFile(path, 'utf8')));
  return { config, root, files, references };
}

export async function prepareSite(plan, output) {
  await mkdir(dirname(output), { recursive: true });
  await mkdir(output); // Never replace an older release or rollback snapshot.
  try {
    const publicRoot = join(output, 'public');
    await mkdir(publicRoot);
    for (const entry of plan.files) {
      const target = join(publicRoot, entry.source);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(await sourceFile(plan.root, entry.source), target, constants.COPYFILE_EXCL);
      const actual = await hashFile(target);
      if (actual.sha256 !== entry.sha256 || actual.bytes !== entry.bytes) fail('计划后源文件变化，停止生成快照。');
    }
    let headers = '/*\n  Cache-Control: public, max-age=0, must-revalidate\n';
    for (const e of plan.files) {
      if (!e.immutable && e.contentType !== 'text/html') continue;
      for (const url of new Set([urlPath(e.source), e.url])) {
        headers += `\n${url}\n  ! Cache-Control\n  Cache-Control: public, ${e.immutable ? 'max-age=31536000, immutable' : 'max-age=0, must-revalidate'}${e.contentType === 'text/html' ? ', no-transform' : ''}\n`;
      }
    }
    if (headers.split('\n').filter(line => line.startsWith('/')).length > 100) fail('默认缓存规则超过 _headers 的 100 条限制；需在项目内设计受限目录规则，不能直接发布本快照。');
    await writeFile(join(publicRoot, '_headers'), headers, { flag: 'wx' });
    const wrangler = { name: plan.config.worker.name, compatibility_date: plan.config.worker.compatibilityDate,
      workers_dev: true, assets: { directory: './public' } };
    if (plan.config.worker.accountId) wrangler.account_id = plan.config.worker.accountId;
    await writeFile(join(output, 'wrangler.json'), JSON.stringify(wrangler, null, 2) + '\n', { flag: 'wx' });
    const manifest = { version: 1, worker: plan.config.worker, files: plan.files,
      controls: { headers: await hashFile(join(publicRoot, '_headers')), wrangler: await hashFile(join(output, 'wrangler.json')) } };
    await writeFile(join(output, 'release-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    return { output, files: plan.files.length, worker: plan.config.worker.name, pagePublished: false };
  } catch (error) { await rm(output, { recursive: true, force: true }); throw error; }
}

export async function checkSite(output) {
  const manifest = JSON.parse(await readFile(join(output, 'release-manifest.json'), 'utf8'));
  const root = await realpath(join(output, 'public'));
  const expected = new Map(manifest.files.map(e => [e.source, e]));
  expected.set('_headers', manifest.controls.headers);
  async function walk(dir, prefix = '') {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const source = prefix + item.name;
      if (item.isSymbolicLink()) fail('快照内出现符号链接，停止发布。');
      if (item.isDirectory()) { await walk(join(dir, item.name), source + '/'); continue; }
      const entry = expected.get(source);
      if (!entry || !item.isFile()) fail('快照内出现未选定文件，停止发布。');
      const actual = await hashFile(join(dir, item.name));
      if (actual.sha256 !== entry.sha256 || actual.bytes !== entry.bytes) fail('快照文件字节或哈希已变化。');
      expected.delete(source);
    }
  }
  await walk(root);
  if (expected.size) fail('快照缺少文件，停止发布。');
  const w = await hashFile(join(output, 'wrangler.json'));
  if (w.sha256 !== manifest.controls.wrangler.sha256) fail('Wrangler 配置变化，重新生成并审阅快照。');
  await checkReferences(manifest.files, source => sourceFile(root, source).then(path => readFile(path, 'utf8')));
  return manifest;
}

export async function verifySite(output, origin) {
  const url = new URL(origin);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === '127.0.0.1'))) fail('核验需要无凭据的 HTTPS origin；仅本地测试允许 127.0.0.1 HTTP。');
  const manifest = await checkSite(output);
  const releaseManifestSHA256 = (await hashFile(join(output, 'release-manifest.json'))).sha256;
  const results = [];
  for (const [index, entry] of manifest.files.entries()) {
    try {
      const result = await verifyEntry({ ...entry, key: entry.source, publicURL: new URL(entry.url, url).href });
      const directives = (result.cacheControl || '').toLowerCase().split(',').map(x => x.trim());
      const maxAges = directives.filter(x => /^max-age\s*=/.test(x));
      if (entry.immutable && (!directives.includes('immutable') || !maxAges.length || maxAges.some(x => !/^max-age\s*=\s*31536000$/.test(x)))) fail('内容版本资源的长期 immutable 缓存不匹配。');
      if (!entry.immutable && (directives.includes('immutable') || !directives.includes('must-revalidate') || !maxAges.length || maxAges.some(x => !/^max-age\s*=\s*0$/.test(x)) || directives.some(x => /^s-maxage\s*=/.test(x) && !/^s-maxage\s*=\s*0$/.test(x)))) fail('固定入口或依赖的再验证缓存不匹配。');
      if (entry.contentType === 'text/html' && !directives.includes('no-transform')) fail('HTML 缺少预期的 no-transform 缓存指令。');
      results.push(result);
    } catch (error) {
      error.progress = { origin: url.origin, verified: results, failed: [{ key: entry.source, error: error.message }], notAttempted: manifest.files.slice(index + 1).map(e => e.source), bytesVerified: false };
      throw error;
    }
  }
  if ((await hashFile(join(output, 'release-manifest.json'))).sha256 !== releaseManifestSHA256) throw problem('SNAPSHOT_CHANGED', '核验期间发布清单发生变化。', '保留失败记录，重新检查冻结快照后显式核验。');
  return { origin: url.origin, releaseManifestSHA256, files: results, bytesVerified: true, browserVerified: false, activeVersionVerified: false };
}

const usage = '用法：node site.mjs plan CONFIG | prepare CONFIG NEW_OUTPUT | check OUTPUT | verify OUTPUT https://site.example.org';
export async function main(args) {
  const [cmd, path, value, ...extra] = args;
  if (!cmd || cmd === '--help') { console.log(usage); return; }
  if (!path || extra.length || !['plan', 'prepare', 'check', 'verify'].includes(cmd) ||
      (['prepare', 'verify'].includes(cmd) ? !value : value !== undefined)) fail(usage);
  let result;
  if (cmd === 'plan') { const p = await planSite(resolve(path)); result = { worker: p.config.worker, files: p.files, references: p.references }; }
  if (cmd === 'prepare') result = await prepareSite(await planSite(resolve(path)), resolve(value));
  if (cmd === 'check') { const m = await checkSite(resolve(path)); result = { checked: true, files: m.files.length, worker: m.worker.name }; }
  if (cmd === 'verify') result = await verifySite(resolve(path), value);
  console.log(JSON.stringify(result, null, 2));
}
if (process.argv[1] && await realpath(resolve(process.argv[1])).catch(() => '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { if (error.progress) console.log(JSON.stringify(error.progress, null, 2)); const d = diagnostic(error); console.error(`失败 [${d.code}]：${d.message} 下一步：${d.nextStep} 未执行云端发布。`); process.exitCode = 1; });
}
