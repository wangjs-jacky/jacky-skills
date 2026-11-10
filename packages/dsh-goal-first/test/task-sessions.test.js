import test from 'node:test';
import assert from 'node:assert/strict';
import { taskSessionHistory } from '../task-sessions.js';

const taskId = 'task-a';
const cwd = '/records/project/tasks/01-task';
const summary = (sessionId, extra = {}) => ({ sessionId, updatedAt: 100, running: false, blank: false, ...extra });
const entry = (sessionId, extra = {}) => ({ sessionId, taskId, cwd, title: '绑定任务标题', intent: 'conversation', createdAt: 10, ...extra });

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

test('includes an exact task conversation binding backed by a native summary', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('bound')], summaries: [summary('bound', { running: true, blank: true })] }), [
    { sessionId: 'bound', title: '绑定任务标题', intent: 'conversation', createdAt: 10, updatedAt: 100, running: true, blank: true },
  ]);
});

test('requires both task identity and normalized cwd for a conversation binding', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('other-task', { taskId: 'task-b' }), entry('other-cwd', { cwd: '/elsewhere' })], summaries: [summary('other-task'), summary('other-cwd')] }), []);
});

test('discovers native conversations by normalized exact absolute cwd', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd: cwd + '/./', summaries: [summary('native', { cwd: cwd + '/nested/..', projections: { values: { title: '原生会话标题' } }, createdAt: 4 })] }), [
    { sessionId: 'native', title: '原生会话标题', intent: 'conversation', createdAt: 4, updatedAt: 100, running: false, blank: false },
  ]);
});

test('does not discover parent, child or sibling folders by prefix', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, summaries: [summary('parent', { cwd: '/records/project/tasks' }), summary('child', { cwd: cwd + '/output' }), summary('sibling', { cwd: cwd + '-other' })] }), []);
});

test('an explicit other-task conversation binding excludes a same-cwd native session', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('sibling', { taskId: 'task-b' })], summaries: [summary('sibling', { cwd })] }), []);
});

test('subagent summaries are excluded even when the task binding matches', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('child')], summaries: [summary('child', { cwd, origin: 'subagent' })] }), []);
});

test('old conversation and stage mappings without a native summary are omitted', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('missing-conversation')], runs: [{ createdAt: 8, tasks: [{ id: taskId, sessionId: 'missing-stage' }] }] }), []);
});

test('includes stage execution sessions by exact task identity with snapshot title', () => {
  const runs = [{ createdAt: 7, snapshots: [{ id: taskId, title: '阶段任务标题' }], tasks: [{ id: taskId, sessionId: 'stage' }, { id: 'task-b', sessionId: 'other-stage' }] }];
  assert.deepEqual(taskSessionHistory({ taskId, cwd, runs, summaries: [summary('stage', { cwd: '/records/project' }), summary('other-stage', { cwd })] }), [
    { sessionId: 'stage', title: '阶段任务标题', intent: 'execution', createdAt: 7, updatedAt: 100, running: false, blank: false },
  ]);
});

test('prefers the native title projection and preserves the binding execution intent', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('renamed', { intent: 'execution' })], summaries: [summary('renamed', { projections: { values: { title: '用户重命名' } } })] }), [
    { sessionId: 'renamed', title: '用户重命名', intent: 'execution', createdAt: 10, updatedAt: 100, running: false, blank: false },
  ]);
});

test('falls back from an empty native title to binding title or the generic label', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, entries: [entry('bound')], summaries: [summary('bound', { projections: { values: { title: '  ' } } }), summary('native', { cwd, updatedAt: 90 })] }).map(({ sessionId, title, createdAt }) => ({ sessionId, title, createdAt })), [
    { sessionId: 'bound', title: '绑定任务标题', createdAt: 10 },
    { sessionId: 'native', title: '任务对话', createdAt: 0 },
  ]);
});

test('deduplicates session identities and sorts by the newest native update', () => {
  const result = taskSessionHistory({ taskId, cwd, entries: [entry('a'), entry('a'), entry('b')], summaries: [summary('a', { updatedAt: 20 }), summary('b', { updatedAt: 30 }), summary('a', { updatedAt: 40, projections: { values: { title: '最新摘要' } } })] });
  assert.deepEqual(result.map(({ sessionId, title, updatedAt }) => ({ sessionId, title, updatedAt })), [
    { sessionId: 'a', title: '最新摘要', updatedAt: 40 },
    { sessionId: 'b', title: '绑定任务标题', updatedAt: 30 },
  ]);
});

test('uses deterministic session ordering for equal update times', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd, summaries: [summary('z', { cwd }), summary('a', { cwd })] }).map(item => item.sessionId), ['a', 'z']);
});

test('keeps deeply frozen input records unchanged', () => {
  const input = { taskId, cwd, entries: [entry('bound')], summaries: [summary('bound'), summary('native', { cwd, updatedAt: 1 })], runs: [{ createdAt: 2, tasks: [{ id: taskId, sessionId: 'bound' }], snapshots: [{ id: taskId, title: '快照标题' }] }] };
  const original = structuredClone(input);
  const result = taskSessionHistory(freeze(input));
  assert.equal(result.length, 2);
  assert.deepEqual(input, original);
});

test('rejects missing task identity or non-absolute directories without reading process cwd', () => {
  assert.deepEqual(taskSessionHistory({ taskId: '', cwd, summaries: [summary('native', { cwd })] }), []);
  assert.deepEqual(taskSessionHistory({ taskId, cwd: 'relative', summaries: [summary('native', { cwd: 'relative' })] }), []);
  assert.deepEqual(taskSessionHistory({ taskId, cwd: '', summaries: [summary('native', { cwd: '' })] }), []);
});

test('returns an empty history when no summaries were supplied', () => {
  assert.deepEqual(taskSessionHistory({ taskId, cwd }), []);
});
