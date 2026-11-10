import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { ProjectStore } from '../project-store.js';
import { DialogueRuntime } from '../dialogue-runtime.js';

async function fixture(t) {
  const parent = await realpath(tmpdir());
  const directory = await mkdtemp(join(parent, 'goal-alignment-runtime-'));
  t.after(async () => { const actual = await realpath(directory); assert.equal(dirname(actual), parent); assert.ok(basename(actual).startsWith('goal-alignment-runtime-')); assert.equal(actual, resolve(directory)); await rm(actual, { recursive: true }); });
  const store = new ProjectStore({ stateFile: join(directory, 'projects.json') }); await store.ready;
  const native = new Map(), events = new Map(), definitions = new Map(), acceptedPrompts = new Set(); let promptCount = 0;
  const ctx = {
    tools: { register(definition) { definitions.set(definition.name, definition); return () => definitions.delete(definition.name); } },
    on(name, handler) { events.set(name, handler); return () => events.delete(name); },
    logger: { warn() {} },
    workspaceRegistry: { async create(path) { assert.equal(path, directory); return { id: 'workspace', async attachSession() {} }; } },
    sessionController: {
      async state({ sessionId }) { if (!native.has(sessionId)) throw Object.assign(new Error('missing'), { code: 'session/not-found' }); return { running: false }; },
      async create({ sessionId }) { native.set(sessionId, {}); return { sessionId }; }, async rename() {},
      async prompt({ requestId }) { if (!acceptedPrompts.has(requestId)) { acceptedPrompts.add(requestId); promptCount++; } },
    },
  };
  const info = { project: { id: 'p', runs: [] }, task: { id: 't', title: '凝练交付', status: 'pending' }, cwd: directory };
  const workflow = {
    async snapshot(value) { assert.equal(value.task.id, 't'); return { revision: 'base', contract: { goal: '目标', deliverables: ['成果'], acceptance: ['可查看'] } }; },
    async propose(taskId, value) { assert.equal(taskId, 't'); return { proposal: { id: 'draft', ...value } }; },
  };
  const runtime = new DialogueRuntime(ctx, store, { resolveTask: async () => info, workflow });
  return { directory, store, native, events, definitions, ctx, info, runtime, prompts: () => promptCount };
}

test('alignment conversations reserve a recoverable identity without submitting a prompt', async t => {
  const f = await fixture(t);
  const value = await f.runtime.createTaskConversation(f.info, 'alignment', 'align-request');
  assert.equal(value.intent, 'alignment'); assert.equal(f.prompts(), 0);
  const restored = new ProjectStore({ stateFile: f.store.stateFile }); await restored.ready;
  assert.equal(restored.forSession(value.sessionId).intent, 'alignment');
});

test('managed stage tasks may discuss alignment without granting or submitting a stage', async t => {
  const f = await fixture(t);
  const value = await f.runtime.createTaskConversation({ ...f.info, mode: 'stage' }, 'alignment', 'stage-alignment');
  assert.equal(value.intent, 'alignment'); assert.equal(f.prompts(), 0); assert.equal(f.store.state.projects.length, 0);
});

test('a submitted legacy execution is opened again instead of resubmitted after it becomes idle', async t => {
  const f = await fixture(t);
  const first = await f.runtime.executeLegacyTask(f.info, 'exec-first', '冻结快照');
  assert.equal(f.prompts(), 1);
  const second = await f.runtime.executeLegacyTask(f.info, 'exec-second', '不应另发的快照');
  assert.equal(second.sessionId, first.sessionId); assert.equal(f.prompts(), 1);
});

test('alignment tools stage drafts but expose no confirmation or delivery approval tool', async t => {
  const f = await fixture(t);
  const value = await f.runtime.createTaskConversation(f.info, 'alignment', 'align-tools');
  f.runtime.install();
  const context = f.definitions.get('goal_task_context'), propose = f.definitions.get('goal_task_propose');
  assert.ok(context); assert.ok(propose);
  const exec = { agent: { session: { id: value.sessionId } } };
  const current = await context.execute({}, exec); assert.equal(current.revision, 'base');
  const staged = await propose.execute({ baseRevision: 'base', goal: '新目标', deliverables: ['新成果'], acceptance: ['可核验'] }, exec);
  assert.equal(staged.proposal.id, 'draft'); assert.equal(f.prompts(), 0);
  assert.equal(f.definitions.has('goal_task_confirm'), false); assert.equal(f.definitions.has('goal_task_approve'), false);
  await assert.rejects(() => propose.execute({ baseRevision: 'base', goal: '越权', deliverables: [], acceptance: [] }, { agent: { session: { id: 'other-session' } } }), /对齐|任务|会话/);
});

test('alignment tool guards deny shell execution and preserve proposal operations', async t => {
  const f = await fixture(t);
  const value = await f.runtime.createTaskConversation(f.info, 'alignment', 'align-guard'); f.runtime.install();
  const agent = { session: { id: value.sessionId } };
  const guard = f.events.get('tools/pre-execute'); assert.ok(guard);
  assert.equal((await guard({ agent, name: 'bash' }, () => ({ kind: 'allow' }))).kind, 'deny');
  assert.equal((await guard({ agent, name: 'goal_task_propose' }, () => ({ kind: 'allow' }))).kind, 'allow');
});

test('deleting a submitted execution session never unlocks another submission',async t=>{
  const f=await fixture(t),first=await f.runtime.executeLegacyTask(f.info,'original','冻结快照');f.native.delete(first.sessionId);
  await assert.rejects(()=>f.runtime.executeLegacyTask(f.info,'after-delete','另一份快照'),/已提交|原会话|历史/);
  assert.equal(f.prompts(),1);assert.equal(f.store.state.taskConversations.length,1);
});

test('a lost persistence receipt recovers with the original native identity and idempotency key',async t=>{
  const f=await fixture(t),mark=f.store.markTaskExecutionSubmitted.bind(f.store);let failed=false;
  f.store.markTaskExecutionSubmitted=async(...args)=>{if(!failed){failed=true;throw new Error('lost persistence receipt');}return mark(...args);};
  await assert.rejects(()=>f.runtime.executeLegacyTask(f.info,'before-reload','原冻结快照'),/lost persistence/);
  const original=f.store.state.taskConversations[0];
  const recovered=await f.runtime.executeLegacyTask(f.info,'new-page-request','不应替换的快照');
  assert.equal(recovered.sessionId,original.sessionId);assert.equal(f.prompts(),1);assert.equal(f.store.state.taskConversations.length,1);
  assert.equal(f.store.state.taskConversations[0].executionPrompt,'原冻结快照');
});

test('fresh completed and externally running task records cannot be silently executed by stale cards',async t=>{
  const f=await fixture(t);
  for(const status of ['done','running']){f.info.task.status=status;await assert.rejects(()=>f.runtime.executeLegacyTask(f.info,'stale-'+status,'不可重复执行'),/完成|执行/);}
  assert.equal(f.prompts(),0);assert.equal((f.store.state.taskConversations||[]).length,0);
});

test('an unsubmitted reservation cannot bypass a freshly completed task after Host creation failed',async t=>{
  const f=await fixture(t),create=f.ctx.sessionController.create;let fail=true;
  f.ctx.sessionController.create=async input=>{if(fail){fail=false;throw new Error('creation interrupted');}return create(input);};
  await assert.rejects(()=>f.runtime.executeLegacyTask(f.info,'before-create','原快照'),/creation interrupted/);
  assert.equal(f.store.state.taskConversations[0].submissionAttempted,false);f.info.task.status='done';
  await assert.rejects(()=>f.runtime.executeLegacyTask(f.info,'after-create','新快照'),/完成/);assert.equal(f.prompts(),0);
});

test('execution activity publishes both transitions without treating a discussion reply as execution',async t=>{
  const f=await fixture(t),execution=await f.runtime.executeLegacyTask(f.info,'execution-activity','冻结快照');f.runtime.install();
  const notifications=[];f.store.onChange(value=>notifications.push(value));
  const changed=f.events.get('agent/status');
  await changed({agent:{session:{id:execution.sessionId}},status:'running'});await changed({agent:{session:{id:execution.sessionId}},status:'idle'});
  assert.equal(notifications.length,2);assert.equal(f.prompts(),1);
  const discussion=await f.runtime.createTaskConversation(f.info,'conversation','ordinary-discussion');notifications.length=0;
  await changed({agent:{session:{id:discussion.sessionId}},status:'running'});assert.equal(notifications.length,0);
});
