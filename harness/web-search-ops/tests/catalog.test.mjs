import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm, symlink, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listSites, listSite, getReference, parseOperations } from '../scripts/catalog.mjs';

const table = rows => `## 操作目录\n\n| operation | intent | risk | last_verified | reference |\n|---|---|---|---|---|\n${rows.map(([id,summary,date]) => `| ${id} | ${summary} | low | ${date} | [说明](operations/${id}.md) |`).join('\n')}\n\n## 站点级陷阱\nnone`;

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'search-ops-catalog-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const opsDir = join(dir, 'ops'); const egoDir = join(dir, 'ego');
  for (const path of [join(opsDir, 'references/sites/bilibili'), join(opsDir, 'references/sites/web/operations'), join(egoDir, 'references/sites/bilibili/operations')]) await mkdir(path, { recursive: true });
  await writeFile(join(opsDir, 'references/sites/index.md'), '| [bilibili](bilibili/index.md) | B站 | 热搜、热门与视频 |\n| [web](web/index.md) | 全网 | 全网搜索 |\n');
  await writeFile(join(opsDir, 'references/sites/bilibili/index.md'), '---\nsite: bilibili\nego_site: bilibili\n---\n# B站');
  await writeFile(join(opsDir, 'references/sites/web/index.md'), table([['search-web', '全网关键词搜索', '2026-11-24']]));
  await writeFile(join(opsDir, 'references/sites/web/operations/search-web.md'), '# Search procedure');
  await writeFile(join(egoDir, 'references/sites/index.md'), '# Ego sites');
  const index = join(egoDir, 'references/sites/bilibili/index.md');
  await writeFile(index, table([['read-hot-search', '读取真实热搜词', '2026-11-20'], ['like-video', '点赞写操作', '2026-11-20']]));
  return { dir, opsDir, egoDir, index };
}

test('site navigation lists only registered sources without reading an unavailable Ego installation', async t => {
  const f = await fixture(t);
  const sites = await listSites({ opsDir: f.opsDir, egoDir: join(f.dir, 'missing') });
  assert.deepEqual(sites.map(site => site.id), ['bilibili', 'web']);
  const counts = await listSites({ opsDir: f.opsDir, egoDir: join(f.dir, 'missing'), counts: true });
  assert.equal(counts[0].count, null); assert.equal(counts[0].error.code, 'EGO_OPS_UNAVAILABLE');
  assert.equal(counts[1].count, 1);
});

test('selected site reads live index metadata, preserves dates, and excludes auth/write actions', async t => {
  const f = await fixture(t);
  const first = await listSite('bilibili', f);
  assert.equal(first.items.length, 1); assert.equal(first.items[0].id, 'ego-ops:bilibili/read-hot-search');
  assert.equal(first.items[0].last_verified, '2026-11-20');
  // No operation body exists yet: index navigation must not expand every leaf.
  await writeFile(f.index, table([['read-hot-search', '读取真实热搜词', '2026-11-20'], ['get-recommendations', '读取每周精选', '2026-11-25'], ['login-with-google', '登录', '2026-11-20']]));
  const next = await listSite('bilibili', f);
  assert.equal(next.items.length, 2); assert.equal(next.items[1].operation, 'get-recommendations');
  assert.equal(next.items[1].scope_hint, 'review_intent');
  assert.equal((await listSite('bilibili', { ...f, query: '热搜' })).items[0].id, first.items[0].id);
  assert.equal(next.items[0].last_verified, '2026-11-20');
});

test('get expands one precise source identity and never copies or rewrites browser knowledge', async t => {
  const f = await fixture(t);
  const path = join(f.egoDir, 'references/sites/bilibili/operations/read-hot-search.md');
  await writeFile(path, '# Current procedure\nVerified in the original source');
  const item = await getReference('ego-ops:bilibili/read-hot-search', f);
  assert.equal(item.path, await realpath(path)); assert.equal(item.last_verified, '2026-11-20');
  assert.ok(item.content.includes('Current procedure'));
  const native = await getReference('web-search-ops:web/search-web', f);
  assert.equal(native.content, '# Search procedure');
  await assert.rejects(getReference('ego-ops:bilibili/like-video', f), { code: 'NOT_INDEXED' });
  await assert.rejects(getReference('ego-ops:bilibili/../../outside', f), { code: 'INVALID_REFERENCE' });
});

test('unknown sites, damaged index identities, and escaping source links remain explicit failures', async t => {
  const f = await fixture(t);
  await assert.rejects(listSite('unknown', f), { code: 'UNKNOWN_SITE' });
  assert.throws(() => parseOperations(table([['read-a', 'A', '2026-11-20']]).replace('operations/read-a.md', 'operations/read-b.md')), { code: 'INVALID_INDEX' });
  const outside = join(f.dir, 'outside.md'); await writeFile(outside, 'not a source entry');
  await symlink(outside, join(f.egoDir, 'references/sites/bilibili/operations/read-hot-search.md'));
  await assert.rejects(getReference('ego-ops:bilibili/read-hot-search', f), { code: 'INVALID_REFERENCE' });
});
