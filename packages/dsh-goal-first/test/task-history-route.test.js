import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join } from 'node:path';
import { apply } from '../index.js';
import { digest } from '../lib/records.js';

const PREFIX = 'goal-first-task-history-route-';
const taskText = '---\nstatus: pending\n---\n# 测试任务\n\n## 目标\n只验证历史读取。\n';

async function fixture(t) {
  const temporaryParent = await realpath(tmpdir());
  const temporary = await realpath(await mkdtemp(join(temporaryParent, PREFIX)));
  t.after(async () => {
    const target = await realpath(temporary);
    assert.ok(isAbsolute(target));
    assert.equal(target, temporary);
    assert.equal(dirname(target), temporaryParent);
    assert.ok(basename(target).startsWith(PREFIX));
    await rm(target, { recursive: true, force: true });
  });
  const library = join(temporary, 'library');
  const project = join(library, 'project');
  const feature = join(project, 'features', 'feature');
  const cwd = join(feature, 'tasks', '01-task');
  await mkdir(cwd, { recursive: true });
  await writeFile(join(project, 'index.md'), '# 临时测试项目\n');
  await writeFile(join(feature, 'index.md'), '# 临时测试目标\n\n- [测试任务](tasks/01-task/index.md)\n');
  const indexPath = join(cwd, 'index.md');
  await writeFile(indexPath, taskText);
  await writeFile(join(cwd, 'PROMPT.md'), '# 任务说明\n\n## 验收\n历史读取不启动执行。\n');
  const config = { roots: [library], sourcesFile: join(temporary, 'sources.json'), stateFile: join(temporary, 'state.json') };
  const before = (await readdir(temporary, { recursive: true })).sort();
  return { temporary, cwd, indexPath, taskId: digest(indexPath), config, before };
}

function routesFor(config, items, listError) {
  const routes = new Map();
  const listCalls = [], activationCalls = [];
  const forbidden = name => () => { activationCalls.push(name); throw new Error('Unexpected Agent activation: ' + name); };
  apply({
    tools: undefined,
    connection: { fetch: { register(route) { routes.set(route.path, route); return () => {}; } } },
    sessionController: {
      async list(request, signal) { listCalls.push({ request, signal }); if (listError) throw listError; return { items }; },
      create: forbidden('create'), prompt: forbidden('prompt'), resolveAgent: forbidden('resolveAgent'),
    },
  }, config);
  const route = routes.get('/api/goal-first/task-sessions');
  assert.ok(route, 'task history route was registered');
  assert.deepEqual(route.methods, ['GET']);
  return { route, listCalls, activationCalls };
}

async function unchanged(f) {
  assert.equal(await readFile(f.indexPath, 'utf8'), taskText, 'task status and document stay unchanged');
  assert.deepEqual((await readdir(f.temporary, { recursive: true })).sort(), f.before, 'no new files or directories');
  await assert.rejects(stat(f.config.stateFile), { code: 'ENOENT' });
  await assert.rejects(stat(f.config.sourcesFile), { code: 'ENOENT' });
}

test('GET task-sessions uses real task discovery and returns only exact-cwd native sessions without writes', async t => {
  const f = await fixture(t);
  const { route, listCalls, activationCalls } = routesFor(f.config, [
    { sessionId: 'included', cwd: f.cwd + '/./', updatedAt: 30, running: true, blank: false, projections: { values: { title: '原生历史对话' } } },
    { sessionId: 'blank', cwd: f.cwd, updatedAt: 20, running: false, blank: true },
    { sessionId: 'sibling', cwd: f.cwd + '-sibling', updatedAt: 100 },
    { sessionId: 'child-directory', cwd: join(f.cwd, 'output'), updatedAt: 100 },
    { sessionId: 'subagent', cwd: f.cwd, origin: 'subagent', updatedAt: 100 },
  ]);
  const request = new Request('http://example/api/goal-first/task-sessions?task=' + f.taskId);
  const response = await route.fetch(request);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { sessions: [
    { sessionId: 'included', title: '原生历史对话', intent: 'conversation', createdAt: 0, updatedAt: 30, running: true, blank: false },
    { sessionId: 'blank', title: '任务对话', intent: 'conversation', createdAt: 0, updatedAt: 20, running: false, blank: true },
  ] });
  assert.deepEqual(listCalls.map(call => call.request), [{}]);
  assert.equal(listCalls[0].signal, request.signal);
  assert.deepEqual(activationCalls, []);
  await unchanged(f);
});

test('unknown, missing and path-shaped task identities never reach Session list or Agent methods', async t => {
  const f = await fixture(t);
  const { route, listCalls, activationCalls } = routesFor(f.config, []);
  for (const query of ['?task=unknown', '', '?task=' + encodeURIComponent(f.indexPath), '?task=..%2Foutside']) {
    const response = await route.fetch(new Request('http://example/api/goal-first/task-sessions' + query));
    assert.equal(response.status, 400, query);
    assert.match((await response.json()).error, /任务.*(?:移动|不可读取)/);
  }
  assert.deepEqual(listCalls, []);
  assert.deepEqual(activationCalls, []);
  await unchanged(f);
});

test('Session list failures are returned explicitly without starting an Agent or writing task state', async t => {
  const f = await fixture(t);
  const { route, listCalls, activationCalls } = routesFor(f.config, [], new Error('native list unavailable'));
  const response = await route.fetch(new Request('http://example/api/goal-first/task-sessions?task=' + f.taskId));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'native list unavailable' });
  assert.equal(listCalls.length, 1);
  assert.deepEqual(activationCalls, []);
  await unchanged(f);
});
