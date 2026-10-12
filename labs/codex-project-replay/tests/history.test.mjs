import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dayAt, exportEvidence, listCandidates, scan } from '../scripts/codex-history.mjs';
import { readThread } from '../scripts/native-history.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'project-replay-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const record = (type, payload, timestamp = '2026-10-11T15:59:00Z', ordinal = 0) => ({ type, payload, timestamp, ordinal });
const meta = (id, cwd, extra = {}) => record('session_meta', { id, session_id: 'shared-tree', cwd, ...extra });
const message = (text, timestamp) => record('response_item', { type: 'message', role: 'user', content: [{ type: 'input_text', text }] }, timestamp);
async function rollout(root, name, records, archive = false) {
  const folder = join(root, archive ? 'archived_sessions' : 'sessions', '2026', '10', '11');
  await mkdir(folder, { recursive: true });
  const path = join(folder, `rollout-${name}.jsonl`);
  await writeFile(path, records.map((entry) => typeof entry === 'string' ? entry : JSON.stringify(entry)).join('\n') + '\n');
  return path;
}
async function events(out) { return (await readFile(join(out, 'events.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse); }

test('date filtering uses timezone and all activity, not the rollout filename', async (t) => {
  const root = await fixture(t);
  const project = join(root, 'project');
  await rollout(root, 'spanning', [meta('a', project), message('private text', '2026-10-11T16:01:00Z')]);
  const found = await listCandidates({ home: root, project, from: '2026-10-12', to: '2026-10-12', timezone: 'Asia/Shanghai' });
  assert.equal(found.candidates.length, 1);
  assert.equal(found.candidates[0].metadata.id, 'a');
  assert.ok(!JSON.stringify(found).includes('private text'));
  assert.equal((await listCandidates({ home: root, project, from: '2026-10-12', timezone: 'UTC' })).candidates.length, 0);
  assert.equal(dayAt('2026-10-11T16:01:00Z', 'Asia/Shanghai'), '2026-10-12');
});

test('thread IDs remain distinct in a shared session tree; archives and changed cwd are discoverable', async (t) => {
  const root = await fixture(t);
  const project = join(root, 'project');
  await rollout(root, 'parent', [meta('parent', project)]);
  await rollout(root, 'fork', [meta('fork', join(root, 'elsewhere')), record('turn_context', { cwd: project })], true);
  const found = await listCandidates({ home: root, project });
  assert.deepEqual(found.candidates.map((c) => c.metadata.id).sort(), ['fork', 'parent']);
  assert.equal((await listCandidates({ home: root, sessions: ['fork'] })).candidates[0].match, 'explicit_thread');
});

test('project matching handles path boundaries and marks shared parent as a candidate only', async (t) => {
  const root = await fixture(t);
  const project = join(root, 'app');
  await rollout(root, 'sibling', [meta('sibling', join(root, 'app-other'))]);
  await rollout(root, 'parent', [meta('parent', root)]);
  await rollout(root, 'child', [meta('child', join(project, 'src'))]);
  const found = await listCandidates({ home: root, project });
  assert.deepEqual(found.candidates.map((c) => [c.metadata.id, c.match]).sort(), [['child', 'cwd_inside_project'], ['parent', 'shared_parent_candidate']]);
});

test('invalid dates, timezone and unbounded discovery fail before scanning', async () => {
  for (const options of [{ from: '2026-02-31' }, { from: '2026-10-12', to: '2026-10-11' }, { timezone: 'Imaginary/Zone' }]) {
    await assert.rejects(listCandidates({ home: '/nonexistent', project: '/project', ...options }));
  }
  await assert.rejects(listCandidates({ home: '/nonexistent' }), /bound discovery/);
});

test('export retains full call/result evidence, repeated user messages and exact line references', async (t) => {
  const root = await fixture(t);
  const largeOutput = 'x'.repeat(30_000);
  const source = await rollout(root, 'one', [
    meta('one', root), message('try again'), message('try again'),
    record('response_item', { type: 'function_call', call_id: 'call-1', name: 'exec_command', arguments: '{"cmd":"npm test"}' }),
    record('response_item', { type: 'function_call_output', call_id: 'call-1', output: largeOutput }),
    record('response_item', { type: 'reasoning', encrypted_content: 'secret-ciphertext' }),
  ]);
  const before = await readFile(source);
  const out = join(root, 'export');
  const result = await exportEvidence({ source, out, home: root, readNative: () => assert.fail('Legacy log needs no native reader') });
  const data = await events(out);
  assert.equal(result.eventCount, 5);
  assert.equal(data[4].record.payload.output, largeOutput);
  assert.equal(data[4].ref.line, 5);
  assert.equal(data[3].record.payload.call_id, data[4].record.payload.call_id);
  assert.equal(data.filter((e) => e.record.payload.type === 'message').length, 2);
  assert.ok(!JSON.stringify(data).includes('secret-ciphertext'));
  const manifest = JSON.parse(await readFile(join(out, 'source.json')));
  assert.equal(manifest.sha256, createHash('sha256').update(before).digest('hex'));
  assert.deepEqual(await readFile(source), before);
  assert.equal((await stat(join(out, 'events.jsonl'))).mode & 0o777, 0o600);
});

test('corrupt lines and interrupted writes are visible, valid evidence survives', async (t) => {
  const root = await fixture(t);
  const source = await rollout(root, 'broken', [meta('b', root), '{broken', message('retained')]);
  await writeFile(source, (await readFile(source, 'utf8')) + '{partial');
  const out = join(root, 'out');
  const result = await exportEvidence({ source, out, home: root });
  assert.equal(result.coverage, 'needs_review');
  assert.ok(result.warnings.includes('invalid_json:line:2'));
  assert.ok(result.warnings.includes('unterminated_last_line'));
  assert.equal((await events(out)).length, 2);
});

test('source append during scan is bounded and reported', async (t) => {
  const root = await fixture(t);
  const source = await rollout(root, 'live', [meta('live', root)]);
  const result = await scan(source, async () => { await writeFile(source, JSON.stringify(message('later')) + '\n', { flag: 'a' }); });
  assert.equal(result.records, 1);
  assert.ok(result.warnings.includes('source_changed_during_read'));
});

test('export cannot overwrite a report, a source directory, or a symlink destination', async (t) => {
  const root = await fixture(t);
  const source = await rollout(root, 'one', [meta('one', root)]);
  const out = join(root, 'existing');
  await mkdir(out);
  await writeFile(join(out, 'notes.md'), 'user notes');
  await assert.rejects(exportEvidence({ source, out, home: root }), { code: 'EEXIST' });
  const link = join(root, 'linked');
  await symlink(out, link);
  await assert.rejects(exportEvidence({ source, out: link, home: root }), { code: 'EEXIST' });
  assert.equal(await readFile(join(out, 'notes.md'), 'utf8'), 'user notes');
});

test('paginated/fork history automatically uses native visible history with stable evidence IDs', async (t) => {
  const root = await fixture(t);
  const source = await rollout(root, 'fork', [meta('fork', root, { history_mode: 'paginated', history_base: { thread_id: 'parent', end_ordinal_exclusive: 4 } })]);
  let called = 0;
  const out = join(root, 'out');
  const result = await exportEvidence({ source, out, home: root, readNative: async (id) => {
    called++;
    assert.equal(id, 'fork');
    return { method: 'paged', thread: { id, path: source, forkedFromId: 'parent', turns: [{ id: 'turn-a', status: 'completed', items: [{ type: 'userMessage', id: 'item-a', content: [] }] }] } };
  } });
  assert.equal(called, 1);
  assert.equal(result.coverage, 'readable_snapshot');
  assert.deepEqual((await events(out))[1].ref, { threadId: 'fork', turnId: 'turn-a', itemId: 'item-a' });
});

test('native failure, empty history or wrong source never silently establishes complete coverage', async (t) => {
  const root = await fixture(t);
  const source = await rollout(root, 'paged', [meta('paged', root, { history_mode: 'paginated' })]);
  const readers = [
    async () => { throw new Error('missing index'); },
    async () => ({ method: 'paged', thread: { id: 'paged', turns: [] } }),
    async () => ({ method: 'paged', thread: { id: 'paged', path: join(root, 'other.jsonl'), turns: [] } }),
  ];
  for (const [i, readNative] of readers.entries()) {
    const result = await exportEvidence({ source, home: root, out: join(root, `out-${i}`), readNative });
    assert.equal(result.coverage, 'needs_review');
    assert.ok(result.warnings.length);
  }
  const skipped = await exportEvidence({ source, home: root, out: join(root, 'skipped'), native: 'never' });
  assert.ok(skipped.warnings.includes('native_required_but_skipped'));
});

test('native reader traverses all pages and requests full items without mutating methods', async () => {
  const calls = [];
  const result = await readThread(async (method, params) => {
    calls.push([method, params]);
    if (method === 'thread/read') return { thread: { id: 'thread' } };
    if (method === 'thread/turns/list') {
      assert.equal(params.itemsView, 'full');
      return params.cursor === null
        ? { data: [{ id: 't1', items: [{ id: 'i1', text: 'same' }], itemsView: 'full' }], nextCursor: 'page2' }
        : { data: [{ id: 't2', items: [], itemsView: 'summary' }], nextCursor: null };
    }
    assert.equal(method, 'thread/items/list');
    return { data: [{ turnId: 't2', item: { id: 'i2', text: 'same' } }], nextCursor: null };
  }, 'thread');
  assert.equal(result.thread.turns.length, 2);
  assert.equal(result.thread.turns[1].items[0].id, 'i2');
  assert.deepEqual(calls.map(([method]) => method), ['thread/read', 'thread/turns/list', 'thread/turns/list', 'thread/items/list']);
});

test('repeated cursors and wrong-turn items fail rather than looping or mixing histories', async () => {
  await assert.rejects(readThread(async (method) => method === 'thread/read'
    ? { thread: { id: 'thread' } }
    : { data: [], nextCursor: 'same' }, 'thread'), /repeated/);
  await assert.rejects(readThread(async (method) => {
    if (method === 'thread/read') return { thread: { id: 'thread' } };
    if (method === 'thread/turns/list') return { data: [{ id: 't1', items: [], itemsView: 'notLoaded' }], nextCursor: null };
    return { data: [{ turnId: 'wrong-turn', item: { id: 'bad' } }], nextCursor: null };
  }, 'thread'), /different turn/);
});

test('legacy fallback is only for unsupported methods, not missing indexes or denied reads', async () => {
  const read = async (method, params) => {
    if (method === 'thread/turns/list') throw Object.assign(new Error('not supported'), { code: -32601 });
    return { thread: { id: 'thread', turns: params.includeTurns ? [{ id: 't1', items: [] }] : [] } };
  };
  assert.equal((await readThread(read, 'thread')).method, 'legacy');
  await assert.rejects(readThread(async (method) => {
    if (method === 'thread/read') return { thread: { id: 'thread' } };
    throw Object.assign(new Error('missing index'), { code: -32000 });
  }, 'thread'), /missing index/);
});

test('CLI rejects invalid native mode and unknown flags without creating output', async (t) => {
  const root = await fixture(t);
  const source = await rollout(root, 'one', [meta('one', root)]);
  const script = fileURLToPath(new URL('../scripts/codex-history.mjs', import.meta.url));
  for (const args of [['--native', 'typo'], ['--typo', 'value']]) {
    const result = spawnSync(process.execPath, [script, 'export', '--source', source, '--out', join(root, 'out'), '--codex-home', root, ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    await assert.rejects(stat(join(root, 'out')), { code: 'ENOENT' });
  }
});
