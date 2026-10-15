import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { launchBatch, localHappyRuntime, prepareBatch, resolveSettings } from '../scripts/happy-task-sessions.mjs';

const source = { agent: 'codex', machineId: 'machine-fixture', accountProfileId: 'account-fixture',
  model: 'gpt-6.1-sol', effort: 'xhigh', models: ['gpt-6.1-sol', 'gpt-6-astra'], permissionMode: 'default', fast: false };

async function fixture(t) {
  const temporary = await realpath(await mkdtemp(join(tmpdir(), 'goal-first-happy-')));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const workspace = join(temporary, 'goal');
  await mkdir(workspace);
  await writeFile(join(workspace, 'AGENTS.md'), '# Workspace rules\n');
  await writeFile(join(workspace, 'problem.md'), '# Goal\nUser confirmed: compare the two approaches.\n');
  const tasks = ['01-方案调研', '02-compare'];
  for (const name of tasks) {
    const directory = join(workspace, 'tasks', name);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.md'), '---\nstatus: pending\n---\n');
    await writeFile(join(directory, 'PROMPT.md'), `Execute ${name}; save evidence and result.md here.\n`);
  }
  const calls = [];
  const runtime = { source: async () => ({ ...source }),
    spawn: async task => { calls.push({ kind: 'spawn', ...task }); return `child-${calls.length}`; },
    send: async task => { calls.push({ kind: 'send', ...task }); return { seq: 1 }; } };
  const options = { workspace, sourceSessionId: 'parent-fixture', tasks };
  const approve = plan => ({ digest: plan.digest, executionInstruction: 'Please run both listed tasks with these settings.' });
  return { temporary, workspace, tasks, runtime, options, calls, approve };
}

test('prepare inherits effective model and effort without creating sessions or execution receipts', async t => {
  const f = await fixture(t);
  const plan = await prepareBatch(f.options, f.runtime);
  assert.equal(f.calls.length, 0);
  assert.deepEqual(plan.tasks.map(x => [x.model, x.effort]), [['gpt-6.1-sol', 'xhigh'], ['gpt-6.1-sol', 'xhigh']]);
  await assert.rejects(readFile(join(plan.tasks[0].directory, 'happy-session.local.json')), { code: 'ENOENT' });
  assert.equal(plan.accountProfileId, 'account-fixture');
  assert.equal(plan.version, 2);
  assert.ok(plan.tasks.every(task => task.progressHash === null), 'missing PROGRESS is bound explicitly');
});

test('model parameters are inherited, validated, and can be explicitly changed in a new proposal', () => {
  assert.deepEqual(resolveSettings({ ...source, model: 'gpt-6-astra', effort: 'medium' }),
    { model: 'gpt-6-astra', effort: 'medium', permissionMode: 'default', fast: false });
  assert.equal(resolveSettings(source, { effort: 'high' }).effort, 'high');
  assert.throws(() => resolveSettings(source, { effort: 'xhgih' }), /--effort/);
  assert.throws(() => resolveSettings(source, { model: 'not-in-catalog' }), /模型目录/);
  assert.throws(() => resolveSettings({ ...source, model: undefined }), /当前模型未知/);
});

test('missing execution instruction, wrong digest, or modified plan cannot create a session', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  for (const executionInstruction of [undefined, '', '  ', null, true]) {
    await assert.rejects(launchBatch(plan, { digest: plan.digest, executionInstruction }, f.runtime), /用户执行指令/);
  }
  await assert.rejects(launchBatch(plan, { ...f.approve(plan), digest: 'wrong' }, f.runtime), /完全一致的批次摘要/);
  const changed = structuredClone(plan);
  changed.tasks[0].effort = 'low';
  await assert.rejects(launchBatch(changed, f.approve(plan), f.runtime), /完全一致的批次摘要/);
  assert.equal(f.calls.length, 0);
});

test('whole-batch preflight detects changed task files or goals before spawning any task', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  await writeFile(join(plan.tasks[1].directory, 'PROMPT.md'), 'Changed scope');
  await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /任务文件已变化/);
  assert.equal(f.calls.length, 0);
  const newPlan = await prepareBatch(f.options, f.runtime);
  await writeFile(join(f.workspace, 'problem.md'), 'Different goal');
  await assert.rejects(launchBatch(newPlan, f.approve(newPlan), f.runtime), /目标文档已变化/);
  assert.equal(f.calls.length, 0);
});

test('PROGRESS absence, creation, editing, and deletion are bound to each prepared batch', async t => {
  const f = await fixture(t);
  const path = join(f.workspace, 'tasks', f.tasks[1], 'PROGRESS.md');
  const absent = await prepareBatch(f.options, f.runtime);
  await writeFile(path, '时间：实际收到用户执行指令\n依据：原始用户来源\n');
  await assert.rejects(launchBatch(absent, f.approve(absent), f.runtime), /过程记录已变化/);
  const present = await prepareBatch(f.options, f.runtime);
  assert.match(present.tasks[1].progressHash, /^[a-f0-9]{64}$/);
  assert.notEqual(present.digest, absent.digest);
  await writeFile(path, '新增重要事件\n');
  await assert.rejects(launchBatch(present, f.approve(present), f.runtime), /过程记录已变化/);
  const edited = await prepareBatch(f.options, f.runtime);
  await unlink(path);
  await assert.rejects(launchBatch(edited, f.approve(edited), f.runtime), /过程记录已变化/);
  assert.equal(f.calls.length, 0, 'every task is checked before any spawn');
});

test('Chinese and existing English names work while separators, traversal, and empty slugs fail', async t => {
  const f = await fixture(t);
  const plan = await prepareBatch(f.options, f.runtime);
  assert.deepEqual(plan.tasks.map(task => task.task), ['01-方案调研', '02-compare']);
  for (const name of ['01-', '01--任务', '01-任务-', '01-../任务', '../01-任务', '01-任务/子项', '01-任务\\子项', '01-任 务', '01-任务.md', '1-任务', '', null]) {
    await assert.rejects(prepareBatch({ ...f.options, tasks: [name] }, f.runtime), /直系 NN/);
  }
  const missing = join(f.workspace, 'tasks', f.tasks[1], 'PROMPT.md');
  await unlink(missing);
  await assert.rejects(prepareBatch(f.options, f.runtime), { code: 'ENOENT' });
  assert.equal(f.calls.length, 0);
});

test('required and optional task files cannot escape through symlinks or hide dangling records', async t => {
  const f = await fixture(t);
  const external = join(f.temporary, 'external.md');
  await writeFile(external, 'outside');
  const directory = join(f.workspace, 'tasks', f.tasks[1]);
  for (const name of ['PROMPT.md', 'index.md', 'PROGRESS.md']) {
    const path = join(directory, name);
    let original;
    try { original = await readFile(path, 'utf8'); await unlink(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await symlink(external, path);
    await assert.rejects(prepareBatch(f.options, f.runtime), /符号链接越界/);
    await unlink(path);
    if (original !== undefined) await writeFile(path, original);
  }
  const progress = join(directory, 'PROGRESS.md');
  await symlink(join(f.temporary, 'nonexistent.md'), progress);
  await assert.rejects(prepareBatch(f.options, f.runtime), { code: 'ENOENT' });
  await unlink(progress);
  const plan = await prepareBatch(f.options, f.runtime);
  await symlink(external, progress);
  await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /符号链接越界/);
  assert.equal(f.calls.length, 0);
});

test('symlinked launch receipts cannot be followed or overwritten', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const external = join(f.temporary, 'receipt.json');
  await writeFile(external, '{}');
  await symlink(external, join(plan.tasks[1].directory, 'happy-session.local.json'));
  await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /启动记录必须是普通文件/);
  assert.equal(await readFile(external, 'utf8'), '{}');
  assert.equal(f.calls.length, 0);
});

test('source account/machine drift and task symlinks cannot silently redirect execution', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  await assert.rejects(launchBatch(plan, f.approve(plan), { ...f.runtime,
    source: async () => ({ ...source, accountProfileId: 'different-account' }) }), /机器或账号已变化/);
  const outside = join(f.temporary, 'outside');
  await mkdir(outside);
  await symlink(outside, join(f.workspace, 'tasks', '03-symlink'), 'dir');
  await assert.rejects(prepareBatch({ ...f.options, tasks: ['03-symlink'] }, f.runtime), /直系目录内/);
  await assert.rejects(prepareBatch({ ...f.options, tasks: ['../outside'] }, f.runtime), /直系 NN/);
  assert.equal(f.calls.length, 0);
});

test('plan or task confirmation alone cannot spawn sessions or send prompts', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const result = await Promise.allSettled([
    launchBatch(plan, { digest: plan.digest, confirmation: 'These two tasks are confirmed. Inherit the current model and reasoning settings.' }, f.runtime),
    launchBatch(plan, { digest: plan.digest, confirmation: 'Task 1 must deliver actual design files today.' }, f.runtime),
  ]);
  assert.equal(f.calls.filter(x => x.kind === 'spawn').length, 0);
  assert.equal(f.calls.filter(x => x.kind === 'send').length, 0);
  for (const attempt of result) {
    assert.equal(attempt.status, 'rejected');
    assert.match(attempt.reason.message, /用户执行指令/);
  }
  await assert.rejects(readFile(join(plan.tasks[0].directory, 'happy-session.local.json')), { code: 'ENOENT' });
});

test('separate execution instruction is recorded while plan confirmation remains context only', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const approval = { ...f.approve(plan), confirmation: 'The task arrangement looks good.' };
  const result = await launchBatch(plan, approval, f.runtime);
  assert.equal(result.results.length, 2);
  const receipt = JSON.parse(await readFile(join(plan.tasks[0].directory, 'happy-session.local.json'), 'utf8'));
  assert.equal(receipt.executionInstruction, approval.executionInstruction);
  assert.equal(receipt.confirmation, approval.confirmation);
  assert.equal(f.calls.filter(x => x.kind === 'spawn').length, 2);
  assert.equal(f.calls.filter(x => x.kind === 'send').length, 2);
});

test('approved batch opens separate sessions, sends task prompts, and reuses recorded launches', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const result = await launchBatch(plan, f.approve(plan), f.runtime);
  assert.equal(result.results.length, 2);
  assert.notEqual(result.results[0].sessionId, result.results[1].sessionId);
  const sends = f.calls.filter(x => x.kind === 'send');
  assert.match(sends[0].text, /Execute 01-方案调研/);
  assert.match(sends[0].text, /AGENTS.md、problem.md/);
  assert.match(sends[0].text, /独立用户执行指令/);
  assert.match(sends[0].text, /新工作区由 PROMPT.md 承载执行契约/);
  assert.match(sends[0].text, /旧工作区继续读取其 index.md 契约/);
  assert.equal(sends[0].meta.effort, 'xhigh');
  await writeFile(join(plan.tasks[0].directory, 'index.md'), '---\nstatus: running\n---\nChild started.\n');
  const repeat = await launchBatch(plan, f.approve(plan), f.runtime);
  assert.equal(f.calls.length, 4);
  assert.ok(repeat.results.every(x => x.reused));
  const next = await prepareBatch(f.options, f.runtime);
  const continued = await launchBatch(next, f.approve(next), f.runtime);
  assert.deepEqual(continued.results, repeat.results);
  assert.equal(f.calls.length, 4);
});

test('uncertain creation is recorded and cannot create a duplicate on retry', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const uncertain = { ...f.runtime, spawn: async task => { f.calls.push(task); throw Error('Creation timed out'); } };
  const result = await launchBatch(plan, f.approve(plan), uncertain);
  assert.equal(result.failedTask, '01-方案调研');
  await assert.rejects(launchBatch(plan, f.approve(plan), uncertain), /创建结果尚未查明/);
  await writeFile(join(plan.tasks[0].directory, 'PROGRESS.md'), '补充事件');
  const next = await prepareBatch(f.options, uncertain);
  await assert.rejects(launchBatch(next, f.approve(next), uncertain), /创建结果尚未查明/);
  assert.equal(f.calls.length, 1);
});

test('message retry reuses its existing session and stable localId, then proceeds with remaining tasks', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const failedSend = { ...f.runtime, send: async task => { f.calls.push({ kind: 'failed-send', ...task }); throw Error('Message timed out'); } };
  const result = await launchBatch(plan, f.approve(plan), failedSend);
  assert.equal(result.sessionId, 'child-1');
  await writeFile(join(plan.tasks[0].directory, 'PROGRESS.md'), '已创建会话，首条消息结果待确认\n');
  await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /过程记录已变化/);
  const next = await prepareBatch(f.options, f.runtime);
  const repeat = await launchBatch(next, f.approve(next), f.runtime);
  assert.equal(repeat.results[0].sessionId, 'child-1');
  assert.equal(f.calls.filter(x => x.kind === 'spawn').length, 2);
  assert.equal(f.calls.find(x => x.kind === 'failed-send').localId, f.calls.find(x => x.kind === 'send').localId);
  assert.equal(f.calls.find(x => x.kind === 'failed-send').text, f.calls.find(x => x.kind === 'send').text);
  assert.equal(f.approve(next).executionInstruction, f.approve(plan).executionInstruction, 'reprepare reuses the same in-scope execution instruction');
});

test('completed sessions survive PROGRESS additions and reprepare without new sessions or messages', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const launched = await launchBatch(plan, f.approve(plan), f.runtime);
  await writeFile(join(plan.tasks[0].directory, 'PROGRESS.md'), '实际完成一轮检查\n');
  await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /过程记录已变化/);
  const next = await prepareBatch(f.options, f.runtime);
  const resumed = await launchBatch(next, f.approve(next), f.runtime);
  assert.deepEqual(resumed.results.map(task => task.sessionId), launched.results.map(task => task.sessionId));
  assert.ok(resumed.results.every(task => task.reused));
  assert.equal(f.calls.length, 4);
});

test('changed Prompt after an uncertain send preserves the original session and refuses a changed first message', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  await launchBatch(plan, f.approve(plan), { ...f.runtime, send: async () => { throw Error('No acknowledgement'); } });
  await writeFile(join(plan.tasks[0].directory, 'PROMPT.md'), '不同任务范围');
  const next = await prepareBatch(f.options, f.runtime);
  await assert.rejects(launchBatch(next, f.approve(next), f.runtime), /Prompt 已变化/);
  const record = JSON.parse(await readFile(join(plan.tasks[0].directory, 'happy-session.local.json'), 'utf8'));
  assert.equal(record.sessionId, 'child-1');
  assert.equal(f.calls.filter(call => call.kind === 'spawn').length, 1);
});

test('execution identity prevents automatic reuse after source, model, effort, permission, or path changes', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  await launchBatch(plan, f.approve(plan), f.runtime);
  for (const patch of [{ machineId: 'other-machine' }, { accountProfileId: 'other-account' },
    { model: 'gpt-6-astra' }, { effort: 'high' }, { permissionMode: 'other-mode' }, { fast: true }]) {
    const runtime = { ...f.runtime, source: async () => ({ ...source, ...patch }) };
    const next = await prepareBatch(f.options, runtime);
    await assert.rejects(launchBatch(next, f.approve(next), runtime), /执行身份/);
  }
  const otherSource = await prepareBatch({ ...f.options, sourceSessionId: 'another-parent' }, f.runtime);
  await assert.rejects(launchBatch(otherSource, f.approve(otherSource), f.runtime), /执行身份/);
  const recordFile = join(plan.tasks[0].directory, 'happy-session.local.json');
  const record = JSON.parse(await readFile(recordFile, 'utf8'));
  for (const patch of [{ workspace: f.temporary }, { directory: f.temporary }, { task: '99-other' }]) {
    await writeFile(recordFile, JSON.stringify({ ...record, executionIdentity: { ...record.executionIdentity, ...patch } }));
    await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /执行身份/);
  }
  await writeFile(recordFile, JSON.stringify(record));
  await assert.rejects(launchBatch(plan, f.approve(plan), { ...f.runtime,
    source: async () => ({ ...source, permissionMode: 'changed' }) }), /运行权限/);
  assert.equal(f.calls.length, 4);
});

function legacyPlan(plan) {
  const old = structuredClone(plan);
  old.version = 1;
  for (const task of old.tasks) delete task.progressHash;
  old.digest = createHash('sha256').update(JSON.stringify({ ...old, digest: undefined })).digest('hex');
  return old;
}

test('old workspaces without PROGRESS and version 1 plans remain usable', async t => {
  const f = await fixture(t);
  const old = legacyPlan(await prepareBatch(f.options, f.runtime));
  const result = await launchBatch(old, f.approve(old), f.runtime);
  assert.equal(result.results.length, 2);
  assert.match(f.calls.find(call => call.kind === 'send').text, /旧工作区继续读取其 index.md 契约和原有证据/);
});

test('legacy receipts require their original batch to recover missing identity before reprepare reuse', async t => {
  const f = await fixture(t);
  const old = legacyPlan(await prepareBatch(f.options, f.runtime));
  await launchBatch(old, f.approve(old), f.runtime);
  for (const task of old.tasks) {
    const path = join(task.directory, 'happy-session.local.json');
    const receipt = JSON.parse(await readFile(path, 'utf8'));
    delete receipt.version; delete receipt.executionIdentity; delete receipt.localId; delete receipt.promptHash;
    await writeFile(path, JSON.stringify(receipt));
  }
  const next = await prepareBatch(f.options, f.runtime);
  await assert.rejects(launchBatch(next, f.approve(next), f.runtime), /旧启动记录缺少完整执行身份/);
  const recovered = await launchBatch(old, f.approve(old), f.runtime);
  assert.ok(recovered.results.every(task => task.reused));
  const reused = await launchBatch(next, f.approve(next), f.runtime);
  assert.ok(reused.results.every(task => task.reused));
  assert.equal(f.calls.length, 4, 'legacy receipt recovery must not spawn or send');
});

test('a version 1 plan with a new PROGRESS cannot create unbound sessions', async t => {
  const f = await fixture(t), old = legacyPlan(await prepareBatch(f.options, f.runtime));
  await writeFile(join(old.tasks[0].directory, 'PROGRESS.md'), '新授权记录');
  await assert.rejects(launchBatch(old, f.approve(old), f.runtime), /旧批次未绑定该记录/);
  const next = await prepareBatch(f.options, f.runtime);
  assert.equal((await launchBatch(next, f.approve(next), f.runtime)).results.length, 2);
});

test('unacknowledged legacy messages retain their original format and localId across recovery and reprepare', async t => {
  const f = await fixture(t);
  const old = legacyPlan(await prepareBatch({ ...f.options, tasks: [f.tasks[0]] }, f.runtime));
  const task = old.tasks[0];
  await writeFile(join(task.directory, 'happy-session.local.json'), JSON.stringify({
    batchDigest: old.digest, task: task.task, sourceSessionId: old.sourceSessionId,
    model: task.model, effort: task.effort, sessionId: 'legacy-child',
  }));
  const failed = { ...f.runtime, send: async value => { f.calls.push({ kind: 'failed-send', ...value }); throw Error('Send uncertain'); } };
  await launchBatch(old, f.approve(old), failed);
  await writeFile(join(task.directory, 'PROGRESS.md'), '已恢复原会话，送达结果待确认');
  const next = await prepareBatch({ ...f.options, tasks: [f.tasks[0]] }, f.runtime);
  const result = await launchBatch(next, f.approve(next), f.runtime);
  assert.equal(result.results[0].sessionId, 'legacy-child');
  assert.equal(f.calls.filter(call => call.kind === 'spawn').length, 0);
  const initial = f.calls.find(call => call.kind === 'failed-send');
  const retried = f.calls.find(call => call.kind === 'send');
  assert.match(initial.text, /^Goal workspace:/, 'legacy retry preserves the original message prefix');
  assert.equal(retried.text, initial.text);
  assert.equal(retried.localId, `goal-first-${old.digest}-${task.task}`);
  assert.equal(retried.localId, initial.localId);
});

test('concurrent launches cannot create more than one session per task', async t => {
  const f = await fixture(t);
  const plan = await prepareBatch({ ...f.options, tasks: ['01-方案调研'] }, f.runtime);
  await Promise.allSettled([launchBatch(plan, f.approve(plan), f.runtime), launchBatch(plan, f.approve(plan), f.runtime)]);
  assert.equal(f.calls.filter(x => x.kind === 'spawn').length, 1);
});

function seal(value, key) {
  const nonce = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, nonce);
  return Buffer.concat([Buffer.from([0]), nonce, cipher.update(JSON.stringify(value)), cipher.final(), cipher.getAuthTag()]).toString('base64');
}
function unseal(value, key) {
  const b = Buffer.from(value, 'base64'), d = createDecipheriv('aes-256-gcm', key, b.subarray(1, 13));
  d.setAuthTag(b.subarray(-16));
  return JSON.parse(Buffer.concat([d.update(b.subarray(13, -16)), d.final()]));
}

test('local Happy transport preserves account grant, applies model parameters, and sends encrypted task content', async t => {
  const f = await fixture(t), happyHome = join(f.temporary, 'happy');
  await mkdir(happyHome);
  const keys = new Map([['parent-fixture', randomBytes(32)]]), directories = new Map();
  const cache = () => ({ sessions: Object.fromEntries([...keys].map(([id, key]) => [id, { encryptionVariant: 'dataKey', encryptionKey: key.toString('base64') }])) });
  const saveCache = () => writeFile(join(happyHome, 'sessions.json'), JSON.stringify(cache()));
  await saveCache();
  const requests = [], delivered = [];
  const server = createServer(async (req, res) => {
    try {
      let body = '';
      for await (const chunk of req) body += chunk;
      const input = body ? JSON.parse(body) : null, pathname = new URL(req.url, 'http://localhost').pathname;
      requests.push({ pathname, input });
      const reply = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
      if (pathname === '/spawn-session') {
        assert.equal(req.headers.authorization, undefined);
        assert.equal(input.codexSessionGrant, 'g'.repeat(43));
        assert.equal(input.model, 'gpt-6.1-sol');
        assert.equal(input.effort, 'xhigh');
        const id = `child-${keys.size}`;
        keys.set(id, randomBytes(32)); directories.set(id, input.directory); await saveCache();
        return reply({ success: true, sessionId: id });
      }
      assert.equal(req.headers.authorization, 'Bearer fixture-token');
      if (pathname === '/v1/codex-session-grants') {
        assert.deepEqual(input, { machineId: source.machineId, sourceSessionId: 'parent-fixture' });
        return reply({ grant: 'g'.repeat(43) });
      }
      const sessionMatch = pathname.match(/^\/v2\/sessions\/([^/]+)$/);
      if (sessionMatch) {
        const id = sessionMatch[1], metadata = { flavor: 'codex', machineId: source.machineId,
          codexAccountProfileId: source.accountProfileId, path: directories.get(id) ?? f.workspace,
          currentModelCode: source.model, currentThoughtLevelCode: source.effort,
          models: source.models.map(value => ({ value })) };
        return reply({ session: { id, seq: id === 'parent-fixture' ? 1 : 0, metadata: seal(metadata, keys.get(id)) } });
      }
      const messageMatch = pathname.match(/^\/v3\/sessions\/([^/]+)\/messages$/);
      if (messageMatch) {
        const id = messageMatch[1];
        if (req.method === 'GET') return reply({ hasMore: false, messages: [{ seq: 1,
          content: { t: 'encrypted', c: seal({ role: 'user', meta: { model: 'stale-model', effort: 'low', permissionMode: 'default' } }, keys.get(id)) } }] });
        delivered.push({ id, message: unseal(input.messages[0].content, keys.get(id)) });
        return reply({ messages: [{ seq: 1, localId: input.messages[0].localId }] });
      }
      res.statusCode = 404; res.end('{}');
    } catch (error) { res.statusCode = 500; res.end('{}'); server.testError = error; }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const port = server.address().port;
  await writeFile(join(happyHome, 'access.key'), JSON.stringify({ token: 'fixture-token' }));
  await writeFile(join(happyHome, 'settings.json'), JSON.stringify({ machineId: source.machineId }));
  await writeFile(join(happyHome, 'daemon.state.json'), JSON.stringify({ pid: process.pid, httpPort: port }));
  const runtime = await localHappyRuntime({ HAPPY_HOME_DIR: happyHome, HAPPY_SERVER_URL: `http://127.0.0.1:${port}` });
  const plan = await prepareBatch(f.options, runtime);
  assert.equal(plan.tasks[0].model, 'gpt-6.1-sol');
  assert.equal(plan.tasks[0].effort, 'xhigh');
  const planFile = join(f.temporary, 'batch.local.json');
  await writeFile(planFile, JSON.stringify(plan));
  const cli = fileURLToPath(new URL('../scripts/happy-task-sessions.mjs', import.meta.url));
  const launchArgs = [cli, 'launch', '--plan', planFile, '--approved-digest', plan.digest];
  const cliOptions = { env: { ...process.env, HAPPY_HOME_DIR: happyHome, HAPPY_SERVER_URL: `http://127.0.0.1:${port}` }, timeout: 15000 };
  const beforeLaunch = requests.length;
  for (const flag of ['--task-confirmation', '--confirmation']) {
    await assert.rejects(promisify(execFile)(process.execPath, [...launchArgs, flag, 'Both tasks are confirmed; inherit current model settings.'], cliOptions),
      error => error.code === 1 && /用户执行指令/.test(error.stderr));
  }
  assert.equal(requests.length, beforeLaunch, 'plan-only launch must fail before calling Happy');
  assert.equal(delivered.length, 0);
  const executionInstruction = 'Start both listed tasks now using the reviewed settings.';
  const args = [...launchArgs, '--task-confirmation', 'Both tasks are confirmed; inherit current model settings.', '--execution-instruction', executionInstruction];
  const launched = await promisify(execFile)(process.execPath, args, cliOptions);
  const result = JSON.parse(launched.stdout);
  assert.ifError(server.testError);
  assert.equal(result.results.length, 2);
  assert.equal(requests.filter(x => x.pathname === '/v1/codex-session-grants').length, 2);
  assert.equal(delivered.length, 2);
  assert.match(delivered[0].message.content.text, /Execute 01-方案调研/);
  assert.equal(delivered[0].message.meta.model, 'gpt-6.1-sol');
  const receipt = await readFile(join(plan.tasks[0].directory, 'happy-session.local.json'), 'utf8');
  assert.equal(JSON.parse(receipt).executionInstruction, executionInstruction);
  assert.ok(!receipt.includes('fixture-token') && !receipt.includes('g'.repeat(43)));
  const repeat = JSON.parse((await promisify(execFile)(process.execPath, args, cliOptions)).stdout);
  assert.ok(repeat.results.every(x => x.reused));
  assert.equal(requests.filter(x => x.pathname === '/spawn-session').length, 2);
  assert.equal(delivered.length, 2, 'repeated CLI launch must not resend prompts');
});
