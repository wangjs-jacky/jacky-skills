import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';

const script = fileURLToPath(new URL('../scripts/resources.mjs', import.meta.url));
const hash = data => createHash('sha256').update(data).digest('hex');
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

async function project(t, storage = { provider: 'same-origin', prefix: 'demo', publicBaseURL: '/assets' }) {
  const root = await mkdtemp(join(tmpdir(), 'static-publish-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'public/covers'), { recursive: true });
  await writeFile(join(root, 'public/covers/卡 片.webp'), 'cover-one');
  const config = { version: 1, publicDir: './public', files: ['covers/卡 片.webp'], storage };
  const path = join(root, 'publish.json');
  await writeFile(path, JSON.stringify(config));
  return { root, config, path, save: () => writeFile(path, JSON.stringify(config)) };
}

test('计划只包含显式资源，输出可用于页面的内容哈希地址', async t => {
  const p = await project(t);
  await writeFile(join(p.root, 'public/ignored.png'), 'unused');
  const result = run('plan', p.path);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(result.stdout);
  assert.equal(manifest.files.length, 1);
  const entry = manifest.files[0];
  assert.equal(entry.source, 'covers/卡 片.webp');
  assert.equal(entry.sha256, hash('cover-one'));
  assert.equal(entry.publicURL, `/assets/demo/objects/${hash('cover-one')}.webp`);
  assert.equal(entry.bytes, 9);
  assert.equal(entry.contentType, 'image/webp');
  assert.ok(!result.stdout.includes(p.root));
});

test('重复计划完全一致，只有资源内容变化才改变内容地址', async t => {
  const p = await project(t);
  const before = run('plan', p.path);
  assert.equal(before.status, 0, before.stderr);
  assert.equal(run('plan', p.path).stdout, before.stdout);
  await writeFile(join(p.root, 'public/covers/卡 片.webp'), 'cover-two');
  const after = JSON.parse(run('plan', p.path).stdout);
  assert.notEqual(after.files[0].key, JSON.parse(before.stdout).files[0].key);
});

test('两个项目的前缀隔离，同站准备复制真实资源且保留无关文件', async t => {
  const a = await project(t);
  const b = await project(t, { provider: 'same-origin', prefix: 'second-project', publicBaseURL: '/assets' });
  const out = join(a.root, 'release');
  await mkdir(out);
  await writeFile(join(out, 'keep.txt'), 'keep');
  assert.equal(run('prepare', a.path, out).status, 0);
  assert.equal(run('prepare', b.path, out).status, 0);
  const ma = JSON.parse(run('plan', a.path).stdout);
  const mb = JSON.parse(run('plan', b.path).stdout);
  assert.notEqual(ma.files[0].key, mb.files[0].key);
  assert.equal(await readFile(join(out, ma.files[0].key), 'utf8'), 'cover-one');
  assert.equal(await readFile(join(out, mb.files[0].key), 'utf8'), 'cover-one');
  assert.equal(await readFile(join(out, 'keep.txt'), 'utf8'), 'keep');
  assert.equal(run('prepare', a.path, out).status, 0);
});

test('准备目录已有同名错误内容时拒绝覆盖', async t => {
  const p = await project(t);
  const entry = JSON.parse(run('plan', p.path).stdout).files[0];
  const out = join(p.root, 'release');
  await mkdir(join(out, 'demo/objects'), { recursive: true });
  await writeFile(join(out, entry.key), 'different');
  const result = run('prepare', p.path, out);
  assert.notEqual(result.status, 0);
  assert.equal(await readFile(join(out, entry.key), 'utf8'), 'different');
});

test('资源路径不能越界或经由符号链接读取未选中的目录', async t => {
  const p = await project(t);
  await writeFile(join(p.root, 'private.webp'), 'private');
  for (const path of ['../private.webp', '/private.webp', 'covers/../secret.webp', '.env', 'covers\\private.webp']) {
    p.config.files = [path];
    await p.save();
    const r = run('plan', p.path);
    assert.notEqual(r.status, 0, path);
    assert.match(r.stderr, /路径|类型/);
  }
  await symlink(join(p.root, 'private.webp'), join(p.root, 'public/covers/link.webp'));
  p.config.files = ['covers/link.webp'];
  await p.save();
  const linked = run('plan', p.path);
  assert.notEqual(linked.status, 0);
  assert.match(linked.stderr, /符号链接/);
});

test('输出目录中的符号链接不能把写入引向其他目录', async t => {
  const p = await project(t);
  const out = join(p.root, 'release');
  const outside = join(p.root, 'outside');
  await mkdir(out);
  await mkdir(outside);
  await symlink(outside, join(out, 'demo'));
  assert.notEqual(run('prepare', p.path, out).status, 0);
  await assert.rejects(readFile(join(outside, 'objects', `${hash('cover-one')}.webp`)), { code: 'ENOENT' });
});

test('凭据字段、带签名的地址和无项目范围的配置在任何联网前被拒绝', async t => {
  const p = await project(t, { provider: 'oss', prefix: 'demo', publicBaseURL: 'https://assets.example.org', bucket: 'example-assets', region: 'cn-shanghai' });
  const variants = [
    () => { p.config.storage.accessKeySecret = 'DO-NOT-PRINT-THIS'; },
    () => { delete p.config.storage.accessKeySecret; p.config.storage.publicBaseURL = 'https://assets.example.org?signature=secret'; },
    () => { p.config.storage.publicBaseURL = 'https://user:password@assets.example.org'; },
    () => { p.config.storage.publicBaseURL = 'https://assets.example.org'; p.config.storage.prefix = ''; },
    () => { p.config.storage.prefix = '../other-project'; },
  ];
  for (const mutate of variants) {
    mutate();
    await p.save();
    const r = run('plan', p.path);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /配置|地址|前缀/);
    assert.ok(!`${r.stdout}${r.stderr}`.includes('DO-NOT-PRINT-THIS'));
  }
});

test('同名重复输入和非资源文件不被静默发布', async t => {
  const p = await project(t);
  p.config.files.push(p.config.files[0]);
  await p.save();
  assert.notEqual(run('plan', p.path).status, 0);
  await writeFile(join(p.root, 'public/demo.html'), '<html>private origin</html>');
  p.config.files = ['demo.html'];
  await p.save();
  assert.notEqual(run('plan', p.path).status, 0);
});

test('OSS 发布缺少 apply 时停止，不能自动建桶或更改配置', async t => {
  const p = await project(t, { provider: 'oss', prefix: 'demo', publicBaseURL: 'https://assets.example.org', bucket: 'example-assets', region: 'cn-shanghai' });
  const result = run('publish', p.path);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /apply/);
});

test('HTTP 200 必须同时满足真实字节与类型；错误页不能算资源发布成功', async t => {
  const { verifyEntry } = await import('../scripts/resources.mjs');
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', req.url === '/wrong-type' ? 'text/html' : 'image/webp');
    if (req.url === '/missing') res.statusCode = 404;
    res.end(req.url === '/wrong-body' ? 'error-page' : req.url === '/wrong-hash' ? 'cover-two' : 'cover-one');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const entry = { bytes: 9, sha256: hash('cover-one'), contentType: 'image/webp' };
  const result = await verifyEntry({ ...entry, publicURL: url + '/ok' });
  assert.equal(result.verified, true);
  await assert.rejects(verifyEntry({ ...entry, key: 'demo/failed.webp', publicURL: url + '/wrong-body' }), error => /demo\/failed.webp/.test(error.message) && /内容|字节|哈希/.test(error.message));
  await assert.rejects(verifyEntry({ ...entry, publicURL: url + '/wrong-type' }), /类型/);
  await assert.rejects(verifyEntry({ ...entry, publicURL: url + '/wrong-hash' }), /哈希/);
  await assert.rejects(verifyEntry({ ...entry, publicURL: url + '/missing' }), /HTTP 404/);
});

test('计划后源文件变更会中止准备，不生成成功清单', async t => {
  const { createPlan, preparePlan } = await import('../scripts/resources.mjs');
  const p = await project(t);
  const plan = await createPlan(p.path);
  await writeFile(join(p.root, 'public/covers/卡 片.webp'), 'changed-after-plan');
  const out = join(p.root, 'staging');
  await assert.rejects(preparePlan(plan, out), /源文件已变化/);
  await assert.rejects(readFile(join(out, 'demo/assets-manifest.json')), { code: 'ENOENT' });
});

test('通过安装链接及无关工作目录调用仍会真实执行 CLI', async t => {
  const p = await project(t);
  const entry = join(p.root, 'linked-tool.mjs');
  await symlink(script, entry);
  const r = spawnSync(process.execPath, [entry, 'plan', p.path], { encoding: 'utf8', cwd: tmpdir() });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).files[0].sha256, hash('cover-one'));
});
