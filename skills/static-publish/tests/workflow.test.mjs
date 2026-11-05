import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const scripts = fileURLToPath(new URL('../scripts/', import.meta.url));
const run = (script, ...args) => spawnSync(process.execPath, [join(scripts, script + '.mjs'), ...args], { encoding: 'utf8' });
const sha = x => createHash('sha256').update(x).digest('hex');
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'publish-workflow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'dist/assets'), { recursive: true });
  const data = 'console.log("public");';
  const asset = `assets/${sha(data)}.js`;
  await writeFile(join(root, 'dist', asset), data);
  await writeFile(join(root, 'dist/index.html'), `<script src="/${asset}"></script>`);
  await writeFile(join(root, 'dist/private.txt'), 'not selected');
  const config = { version: 1, publicDir: './dist', files: ['index.html', asset], immutable: [asset], worker: { name: 'example-static-project', compatibilityDate: '2026-11-04' } };
  const path = join(root, 'site.json');
  const save = () => writeFile(path, JSON.stringify(config));
  await save();
  return { root, config, path, save, output: join(root, 'release') };
}

test('明确的页面快照仅包含选定公开文件，Wrangler 配置和摘要留在公开根外', async t => {
  const f = await fixture(t);
  const r = run('site', 'prepare', f.path, f.output);
  assert.equal(r.status, 0, r.stderr);
  const m = JSON.parse(await readFile(join(f.output, 'release-manifest.json')));
  assert.equal(m.files.length, 2);
  assert.equal(await readFile(join(f.output, 'public/index.html'), 'utf8'), await readFile(join(f.root, 'dist/index.html'), 'utf8'));
  await assert.rejects(readFile(join(f.output, 'public/private.txt')), { code: 'ENOENT' });
  const c = JSON.parse(await readFile(join(f.output, 'wrangler.json')));
  assert.equal(c.assets.directory, './public');
  assert.equal(c.name, f.config.worker.name);
  assert.equal(c.main, undefined);
  assert.equal(run('site', 'prepare', f.path, f.output).status, 1, '不能覆盖旧回退快照');
});

test('入口保留再验证和 no-transform，只有内容哈希匹配的资源可 immutable', async t => {
  const f = await fixture(t);
  assert.equal(run('site', 'prepare', f.path, f.output).status, 0);
  const headers = await readFile(join(f.output, 'public/_headers'), 'utf8');
  assert.match(headers, /no-transform/);
  assert.match(headers, /! Cache-Control/);
  assert.match(headers, /immutable/);
  f.config.immutable = ['index.html']; await f.save();
  const bad = run('site', 'plan', f.path);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /内容摘要/);
});

test('页面快照拒绝私有路径、符号链接和伪造摘要，不静默套用旧忽略规则', async t => {
  const f = await fixture(t);
  for (const file of ['../secret.txt', '.env', '_headers', '.assetsignore', 'AGENTS.md']) {
    f.config.files = [file]; f.config.immutable = []; await f.save();
    assert.equal(run('site', 'plan', f.path).status, 1, file);
  }
  await symlink(join(f.root, 'dist/private.txt'), join(f.root, 'dist/link.txt'));
  f.config.files = ['link.txt']; await f.save();
  assert.equal(run('site', 'plan', f.path).status, 1);
  f.config.files = ['index.html']; f.config.worker.token = 'DO-NOT-PRINT'; await f.save();
  const r = run('site', 'plan', f.path);
  assert.equal(r.status, 1); assert.ok(!r.stderr.includes('DO-NOT-PRINT'));
});

test('核验失败时给出失败结果；HTTP200错误页面不能代替发布字节', async t => {
  const f = await fixture(t);
  assert.equal(run('site', 'prepare', f.path, f.output).status, 0);
  const { verifySite } = await import('../scripts/site.mjs');
  const { createServer } = await import('node:http');
  const server = createServer((q, s) => { s.setHeader('Content-Type', q.url.endsWith('.js') ? 'application/javascript' : 'text/html'); s.end('wrong'); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => server.close(r)));
  await assert.rejects(verifySite(f.output, `http://127.0.0.1:${server.address().port}`), error => /字节|哈希/.test(error.message) && error.progress?.failed?.length === 1 && error.progress?.notAttempted?.length === 1);
});

test('冻结后新增、删除或修改文件均阻止后续发布检查', async t => {
  const f = await fixture(t);
  assert.equal(run('site', 'prepare', f.path, f.output).status, 0);
  assert.equal(run('site', 'check', f.output).status, 0);
  await writeFile(join(f.output, 'public/private.txt'), 'accidental');
  assert.equal(run('site', 'check', f.output).status, 1);
  await rm(join(f.output, 'public/private.txt'));
  await writeFile(join(f.output, 'public/index.html'), 'changed');
  assert.equal(run('site', 'check', f.output).status, 1);
  await rm(join(f.output, 'public/index.html'));
  assert.equal(run('site', 'check', f.output).status, 1);
});

test('同站诊断无需 Aliyun；缺 Wrangler 返回明确依赖缺口而非伪造认证通过', async t => {
  const f = await fixture(t);
  const r = run('doctor', f.path, '--wrangler', join(f.root, 'missing-wrangler'));
  assert.equal(r.status, 1);
  const d = JSON.parse(r.stdout);
  assert.equal(d.checks.some(x => x.name === 'aliyun'), false);
  assert.equal(d.checks.find(x => x.name === 'wrangler').ok, false);
  assert.equal(d.ready, false);
});

test('入口拒绝长期或冲突缓存，并接受平台合并的一致再验证头', async t => {
  const f = await fixture(t);
  assert.equal(run('site', 'prepare', f.path, f.output).status, 0);
  const { verifySite } = await import('../scripts/site.mjs');
  const { createServer } = await import('node:http');
  const manifest = JSON.parse(await readFile(join(f.output, 'release-manifest.json')));
  const content = new Map(await Promise.all(manifest.files.map(async e => [e.url, { ...e, data: await readFile(join(f.output, 'public', e.source)) }])));
  let fixedHeader = 'public, max-age=604800';
  const server = createServer((q, s) => {
    const e = content.get(q.url);
    s.setHeader('Content-Type', e.contentType);
    s.setHeader('Cache-Control', e.immutable ? 'public, max-age=31536000, immutable' : fixedHeader);
    s.end(e.data);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => server.close(r)));
  await assert.rejects(verifySite(f.output, `http://127.0.0.1:${server.address().port}`), /缓存|再验证/);
  fixedHeader = 'public, max-age=0, must-revalidate, no-transform, public, max-age=0, must-revalidate';
  assert.equal((await verifySite(f.output, `http://127.0.0.1:${server.address().port}`)).bytesVerified, true);
  fixedHeader += ', max-age=604800';
  await assert.rejects(verifySite(f.output, `http://127.0.0.1:${server.address().port}`), /缓存|再验证/);
});

test('真实图片派生保留原图，记录变换与摘要，拒绝覆盖和输入输出相同', async t => {
  const f = await fixture(t);
  // A small portable PPM fixture is encoded by the real system cwebp, not a stub.
  const ppm = join(f.root, 'source.ppm');
  const pixels = Buffer.alloc(64 * 48 * 3, 130);
  await writeFile(ppm, Buffer.concat([Buffer.from('P6\n64 48\n255\n'), pixels]));
  const png = join(f.root, 'source.png');
  const ff = spawnSync('ffmpeg', ['-v', 'error', '-i', ppm, '-y', png]);
  assert.equal(ff.status, 0, String(ff.stderr));
  const original = await readFile(png);
  const out = join(f.root, 'derived.webp');
  const result = run('images', png, out, '--width', '32', '--quality', '82');
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.transform.width, 32);
  assert.equal(report.original.sha256, sha(original));
  assert.equal(report.derived.sha256, sha(await readFile(out)));
  assert.match((await readFile(out)).subarray(0, 12).toString(), /RIFF....WEBP/s);
  assert.deepEqual(await readFile(png), original);
  assert.equal(run('images', png, out, '--width', '32').status, 1);
  assert.equal(run('images', png, png, '--width', '32').status, 1);
});
