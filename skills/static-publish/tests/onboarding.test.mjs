import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, open, chmod, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const scripts = fileURLToPath(new URL('../scripts/', import.meta.url));
const run = (name, args, env) => spawnSync(process.execPath, [join(scripts, name + '.mjs'), ...args], { encoding: 'utf8', ...(env && { env }) });
const hash = x => createHash('sha256').update(x).digest('hex');
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'publish-onboarding-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const pub = join(root, 'public'); await mkdir(pub);
  await writeFile(join(pub, 'index.html'), '<link href="style.css" rel="stylesheet"><img src="cover.svg"><a href="detail.html">detail</a>');
  await writeFile(join(pub, 'style.css'), 'body { background: url("cover.svg"); }');
  await writeFile(join(pub, 'cover.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(join(pub, 'detail.html'), '<p>details</p>');
  const config = { version: 1, publicDir: './public', files: ['index.html', 'style.css', 'cover.svg', 'detail.html'], worker: { name: 'example-static', compatibilityDate: '2026-11-04' } };
  const path = join(root, 'site.json');
  const save = () => writeFile(path, JSON.stringify(config)); await save();
  return { root, pub, config, path, save };
}
test('无配置预检只报告分支依赖；缺Wrangler不伪造登录或云发布', async t => {
  const f = await fixture(t); const bin = join(f.root, 'empty'); await mkdir(bin);
  const r = run('doctor', ['--preflight'], { PATH: bin });
  assert.ok(r.stdout.startsWith('{'), r.stderr);
  const d = JSON.parse(r.stdout); assert.equal(d.configChecked, false); assert.equal(d.authenticationChecked, false); assert.equal(d.cloudWriteChecked, false);
  assert.equal(d.checks.find(x => x.name === 'wrangler').ok, false); assert.equal(d.checks.some(x => x.name === 'aliyun'), false);
});
test('缺配置给出明确初始化下一步，且不输出配置内容', async t => {
  const f = await fixture(t); const r = run('doctor', [join(f.root, 'missing.json')]);
  assert.equal(r.status, 1); assert.match(r.stdout + r.stderr, /CONFIG_NOT_FOUND/); assert.match(r.stdout + r.stderr, /project.*init/);
});
test('项目初始化生成可检查快照的配置，管理资料不能落进公开根，不覆盖既有目录', async t => {
  const f = await fixture(t); const project = join(f.root, 'publish');
  const args = ['init', project, '--public-dir', f.pub, '--name', 'example-static', ...f.config.files.flatMap(x => ['--file', x])];
  const r = run('project', args); assert.equal(r.status, 0, r.stderr);
  assert.equal(run('site', ['plan', join(project, 'site.json')]).status, 0);
  assert.equal(run('project', args).status, 1); assert.equal(run('project', ['init', join(f.pub, 'oops'), '--public-dir', f.pub, '--name', 'example-static', '--file', 'index.html']).status, 1);
  assert.match(await readFile(join(project, 'index.md'), 'utf8'), /site.json/);
});
test('页面引用存在于磁盘但未被选中，也必须在上传前停止', async t => {
  const f = await fixture(t); f.config.files = ['index.html']; await f.save();
  const r = run('site', ['plan', f.path]); assert.equal(r.status, 1); assert.match(r.stderr, /引用|REFERENCE/);
});
test('CSS依赖与srcset不能漏选，规范HTML路径和查询串能正确解析', async t => {
  const f = await fixture(t);
  await writeFile(join(f.pub, 'index.html'), '<a href="/detail?view=1#part">go</a><img srcset="cover.svg 1x, missing.svg 2x">');
  assert.equal(run('site', ['plan', f.path]).status, 1);
  await writeFile(join(f.pub, 'index.html'), '<a href="/detail?view=1#part">go</a><img src="cover.svg?v=1">');
  assert.equal(run('site', ['plan', f.path]).status, 0);
  await writeFile(join(f.pub, 'style.css'), '@import "missing.css";');
  assert.equal(run('site', ['plan', f.path]).status, 1);
});
test('超过25MiB或免费文件总数的同站计划提前失败', async t => {
  const f = await fixture(t); const h = await open(join(f.pub, 'large.zip'), 'w'); await h.truncate(25 * 1024 * 1024 + 1); await h.close();
  f.config.files.push('large.zip'); await f.save(); const big = run('site', ['plan', f.path]); assert.equal(big.status, 1); assert.match(big.stderr, /25 MiB/);
  f.config.files = Array.from({ length: 20000 }, (_, i) => `f${i}.txt`); await f.save(); const count = run('site', ['plan', f.path]); assert.equal(count.status, 1); assert.match(count.stderr, /文件数|20000|20,000/);
});
test('资源清单只替换显式HTML占位符；未知项及旧输出不被覆盖', async t => {
  const f = await fixture(t); const manifest = join(f.root, 'manifest.json'); const input = join(f.root, 'template.html'); const output = join(f.root, 'rendered.html');
  await writeFile(manifest, JSON.stringify({ version: 1, files: [{ source: 'cover.svg', publicURL: '/assets/demo/objects/abc.svg' }] }));
  await writeFile(input, '<img src="{{asset:cover.svg}}"><p>keep</p>');
  const r = run('resources', ['render', manifest, input, output]); assert.equal(r.status, 0, r.stderr); assert.equal(await readFile(output, 'utf8'), '<img src="/assets/demo/objects/abc.svg"><p>keep</p>');
  assert.equal(run('resources', ['render', manifest, input, output]).status, 1);
  await writeFile(input, '<img src="{{asset:unknown.svg}}">'); assert.equal(run('resources', ['render', manifest, input, join(f.root, 'bad.html')]).status, 1);
});
async function ossFixture(f, scenario) {
  const bin = join(f.root, 'bin'); await mkdir(bin);
  const cli = `#!${process.execPath}\nconst fs=require('node:fs');const a=process.argv.slice(2);if(a[0]==='version'){console.log('stub');process.exit(0)}if(a[1]==='stat'){console.error('ErrorCode=${scenario} PRIVATE-CREDENTIAL-MARKER');process.exit(1)}process.exit(0);`;
  await writeFile(join(bin, 'aliyun'), cli); await chmod(join(bin, 'aliyun'), 0o700);
  const c = { version: 1, publicDir: './public', files: ['cover.svg'], storage: { provider: 'oss', bucket: 'example-assets', region: 'cn-shanghai', prefix: 'demo', publicBaseURL: 'https://assets.example.invalid' } };
  const path = join(f.root, 'resources.json'); await writeFile(path, JSON.stringify(c)); return { path, env: { PATH: bin }, c };
}
test('已知桶不存在与权限拒绝分别提供安全下一步，不泄露CLI原文', async t => {
  const f = await fixture(t); const o = await ossFixture(f, 'NoSuchBucket');
  const r = run('doctor', [o.path, '--auth'], o.env); assert.equal(r.status, 1); assert.match(r.stdout, /NoSuchBucket/); assert.match(r.stdout, /同站|same-origin|建桶/); assert.ok(!(r.stdout + r.stderr).includes('PRIVATE-CREDENTIAL-MARKER'));
  const p = run('resources', ['publish', o.path, '--apply'], o.env); assert.equal(p.status, 1); assert.match(p.stdout + p.stderr, /NoSuchBucket/);
});
test('批量publish中途失败保留已完成、失败和未尝试，不访问真实网络', async t => {
  const f = await fixture(t); const o = await ossFixture(f, 'NoSuchKey');
  await writeFile(join(f.pub, 'second.svg'), 'second'); await writeFile(join(f.pub, 'third.svg'), 'third'); o.c.files.push('second.svg', 'third.svg'); await writeFile(o.path, JSON.stringify(o.c));
  const preload = join(f.root, 'fetch.mjs');
  const first = await readFile(join(f.pub, 'cover.svg'), 'utf8');
  await writeFile(preload, `globalThis.fetch=async(url)=>{if(!url.startsWith('https://assets.example.invalid/'))throw Error('FORBIDDEN');const data=url.includes('${hash(first)}')?${JSON.stringify(first)}:'bad';const r=new Response(data,{headers:{'content-type':'image/svg+xml'}});Object.defineProperty(r,'url',{value:url});return r;};`);
  const r = spawnSync(process.execPath, ['--import', preload, join(scripts, 'resources.mjs'), 'publish', o.path, '--apply'], { encoding: 'utf8', env: o.env });
  assert.equal(r.status, 1); assert.ok(r.stdout.startsWith('{'), r.stderr); const d = JSON.parse(r.stdout); assert.equal(d.complete, false); assert.equal(d.verified.length, 1); assert.equal(d.failed.length, 1); assert.equal(d.notAttempted.length, 1); assert.equal(d.pagePublished, false);
});
test('发布回执绑定快照和所提供的版本/字节证据；status只读本地且拒绝假UUID', async t => {
  const f = await fixture(t); const project = join(f.root, 'publish');
  assert.equal(run('project', ['init', project, '--public-dir', f.pub, '--name', 'example-static', ...f.config.files.flatMap(x => ['--file', x])]).status, 0);
  const release = join(project, 'releases/a'); assert.equal(run('site', ['prepare', join(project, 'site.json'), release]).status, 0);
  await mkdir(join(project, 'evidence'));
  const uuid = '11111111-1111-4111-8111-111111111111'; const deployment = { versions: [{ version_id: uuid, percentage: 100 }] };
  await writeFile(join(project, 'evidence/deployment.json'), JSON.stringify(deployment));
  const m = JSON.parse(await readFile(join(release, 'release-manifest.json')));
  const verification = { origin: 'https://example.example.invalid', releaseManifestSHA256: hash(await readFile(join(release, 'release-manifest.json'))), bytesVerified: true, activeVersionVerified: false, browserVerified: false, files: m.files.map(e => ({ key: e.source, verified: true, bytes: e.bytes, sha256: e.sha256, contentType: e.contentType })) };
  await writeFile(join(project, 'evidence/verification.json'), JSON.stringify(verification));
  const spec = join(f.root, 'record.json'); await writeFile(spec, JSON.stringify({ version: 1, release: 'releases/a', deployment: 'evidence/deployment.json', verification: 'evidence/verification.json' }));
  const r = run('project', ['record', project, spec, 'release-a']); assert.equal(r.status, 0, r.stderr);
  const receipt = JSON.parse(await readFile(join(project, 'receipts/release-a.json'))); assert.equal(receipt.activeVersion, uuid); assert.equal(receipt.cloudQueried, false); assert.equal(receipt.browserVerified, false); assert.equal(receipt.releaseManifestSHA256, hash(await readFile(join(release, 'release-manifest.json'))));
  assert.equal(run('project', ['record', project, spec, 'release-a']).status, 1);
  verification.complete = false; verification.failed = [{ key: 'index.html' }]; await writeFile(join(project, 'evidence/verification.json'), JSON.stringify(verification));
  assert.equal(run('project', ['record', project, spec, 'contradictory']).status, 1);
  const status = run('project', ['status', project], { PATH: '' }); assert.equal(status.status, 0, status.stderr); assert.equal(JSON.parse(status.stdout).cloudQueried, false);
  deployment.versions[0].version_id = 'made-up'; await writeFile(join(project, 'evidence/deployment.json'), JSON.stringify(deployment)); assert.equal(run('project', ['record', project, spec, 'bad']).status, 1);
});
test('回执拒绝将旧版字节核验绑定到同长度的新快照', async t => {
  const f = await fixture(t); await writeFile(join(f.pub, 'index.html'), '<p>OLD</p>');
  const project = join(f.root, 'project'); assert.equal(run('project', ['init', project, '--public-dir', f.pub, '--name', 'example-static', '--file', 'index.html']).status, 0);
  const { verifySite } = await import('../scripts/site.mjs'); const old = join(project, 'releases/old'); assert.equal(run('site', ['prepare', join(project, 'site.json'), old]).status, 0);
  const original = globalThis.fetch; t.after(() => globalThis.fetch = original);
  globalThis.fetch = async url => { assert.ok(url.startsWith('https://example.example.invalid/')); const r = new Response('<p>OLD</p>', { headers: { 'content-type': 'text/html', 'cache-control': 'public,max-age=0,must-revalidate,no-transform' } }); Object.defineProperty(r, 'url', { value: url }); return r; };
  const verified = await verifySite(old, 'https://example.example.invalid'); await mkdir(join(project, 'evidence'));
  await writeFile(join(project, 'evidence/old.json'), JSON.stringify(verified)); await writeFile(join(project, 'evidence/deployment.json'), JSON.stringify({ versions: [{ version_id: '11111111-1111-4111-8111-111111111111', percentage: 100 }] }));
  await writeFile(join(f.pub, 'index.html'), '<p>NEW</p>'); assert.equal(run('site', ['prepare', join(project, 'site.json'), join(project, 'releases/new')]).status, 0);
  const spec = join(f.root, 'record.json'); await writeFile(spec, JSON.stringify({ version: 1, release: 'releases/new', deployment: 'evidence/deployment.json', verification: 'evidence/old.json' }));
  const r = run('project', ['record', project, spec, 'bad']); assert.equal(r.status, 1); assert.match(r.stderr, /INCOMPLETE_BYTES|SHA|快照/);
});
test('工程根的本地Wrangler可用于初始化后的子目录配置，不借用全局CLI', async t => {
  const f = await fixture(t); const bin = join(f.root, 'node_modules/wrangler/bin'); await mkdir(bin, { recursive: true }); await writeFile(join(bin, 'wrangler.js'), 'console.log("4.151.1 offline stub")');
  const project = join(f.root, '.publish'); assert.equal(run('project', ['init', project, '--public-dir', f.pub, '--name', 'example-static', ...f.config.files.flatMap(x => ['--file', x])]).status, 0);
  const r = run('doctor', [join(project, 'site.json')], { PATH: '' }); assert.equal(r.status, 0, r.stdout + r.stderr); assert.equal(JSON.parse(r.stdout).checks.find(x => x.name === 'wrangler').ok, true);
});
test('CSS字符串和HTML原始文本中的伪URL或标签不阻止发布，真正URL仍检查', async t => {
  const f = await fixture(t);
  await writeFile(join(f.pub, 'index.html'), '<textarea><img src="missing.svg"></textarea><style>body::before{content:\'<img src="missing.svg">\'}</style>');
  await writeFile(join(f.pub, 'style.css'), 'body::before{content:"url(missing.svg)"}');
  const r = run('site', ['plan', f.path]); assert.equal(r.status, 0, r.stderr);
  await writeFile(join(f.pub, 'style.css'), 'body{background:url(missing.svg)}'); assert.equal(run('site', ['plan', f.path]).status, 1);
});
test('目录入口的无尾斜杠引用可解析，HTML注释中的style不作为运行依赖', async t => {
  const f = await fixture(t); await mkdir(join(f.pub, 'guide')); await writeFile(join(f.pub, 'guide/index.html'), '<p>guide</p>');
  f.config.files.push('guide/index.html'); await f.save(); await writeFile(join(f.pub, 'index.html'), '<a href="/guide">guide</a><!-- <style>body{background:url(unused.png)}</style> -->');
  const r = run('site', ['plan', f.path]); assert.equal(r.status, 0, r.stderr);
});
test('status在读取目录前拒绝指向其他资料的receipts符号链接', async t => {
  const f = await fixture(t); const project = join(f.root, 'project'); await mkdir(project); await writeFile(join(project, 'site.json'), JSON.stringify(f.config));
  const outside = join(f.root, 'outside'); await mkdir(outside); await symlink(outside, join(project, 'receipts'));
  const r = run('project', ['status', project]); assert.equal(r.status, 1); assert.match(r.stderr, /符号链接|UNSAFE_RECEIPTS/);
});
test('随包例子从新目录真实完成资源清单接入与完整公开快照，不需要云CLI', async t => {
  const f = await fixture(t); const build = fileURLToPath(new URL('../assets/example/build.mjs', import.meta.url)); const output = join(f.root, 'new-demo');
  const r = spawnSync(process.execPath, [build, output], { encoding: 'utf8', env: { PATH: '' } }); assert.equal(r.status, 0, r.stderr);
  const result = JSON.parse(r.stdout); assert.equal(result.pagePublished, false); assert.equal(run('site', ['check', result.release]).status, 0);
  const html = await readFile(join(result.release, 'public/index.html'), 'utf8'); assert.ok(!html.includes('{{asset:')); assert.match(html, /\/assets\/example-demo\/objects\/[a-f0-9]{64}\.svg/);
  assert.equal(spawnSync(process.execPath, [build, output], { encoding: 'utf8' }).status, 1);
});
