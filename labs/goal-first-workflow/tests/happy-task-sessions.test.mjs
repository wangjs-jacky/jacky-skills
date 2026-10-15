import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
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
  const tasks = ['01-research', '02-compare'];
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
});

test('model parameters are inherited, validated, and can be explicitly changed in a new proposal', () => {
  assert.deepEqual(resolveSettings({ ...source, model: 'gpt-6-astra', effort: 'medium' }),
    { model: 'gpt-6-astra', effort: 'medium', permissionMode: 'default', fast: false });
  assert.equal(resolveSettings(source, { effort: 'high' }).effort, 'high');
  assert.throws(() => resolveSettings(source, { effort: 'xhgih' }), /supported --effort/);
  assert.throws(() => resolveSettings(source, { model: 'not-in-catalog' }), /catalog/);
  assert.throws(() => resolveSettings({ ...source, model: undefined }), /unknown/);
});

test('missing execution instruction, wrong digest, or modified plan cannot create a session', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  for (const executionInstruction of [undefined, '', '  ', null, true]) {
    await assert.rejects(launchBatch(plan, { digest: plan.digest, executionInstruction }, f.runtime), /execution instruction/);
  }
  await assert.rejects(launchBatch(plan, { ...f.approve(plan), digest: 'wrong' }, f.runtime), /exact prepared batch/);
  const changed = structuredClone(plan);
  changed.tasks[0].effort = 'low';
  await assert.rejects(launchBatch(changed, f.approve(plan), f.runtime), /exact prepared batch/);
  assert.equal(f.calls.length, 0);
});

test('whole-batch preflight detects changed task files or goals before spawning any task', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  await writeFile(join(plan.tasks[1].directory, 'PROMPT.md'), 'Changed scope');
  await assert.rejects(launchBatch(plan, f.approve(plan), f.runtime), /Task files changed/);
  assert.equal(f.calls.length, 0);
  const newPlan = await prepareBatch(f.options, f.runtime);
  await writeFile(join(f.workspace, 'problem.md'), 'Different goal');
  await assert.rejects(launchBatch(newPlan, f.approve(newPlan), f.runtime), /Goal documents changed/);
  assert.equal(f.calls.length, 0);
});

test('source account/machine drift and task symlinks cannot silently redirect execution', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  await assert.rejects(launchBatch(plan, f.approve(plan), { ...f.runtime,
    source: async () => ({ ...source, accountProfileId: 'different-account' }) }), /account changed/);
  const outside = join(f.temporary, 'outside');
  await mkdir(outside);
  await symlink(outside, join(f.workspace, 'tasks', '03-symlink'), 'dir');
  await assert.rejects(prepareBatch({ ...f.options, tasks: ['03-symlink'] }, f.runtime), /inside this workspace/);
  await assert.rejects(prepareBatch({ ...f.options, tasks: ['../outside'] }, f.runtime), /direct NN/);
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
    assert.match(attempt.reason.message, /execution instruction/);
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
  assert.match(sends[0].text, /Execute 01-research/);
  assert.match(sends[0].text, /AGENTS.md and problem.md/);
  assert.match(sends[0].text, /separate user execution instruction/);
  assert.equal(sends[0].meta.effort, 'xhigh');
  await writeFile(join(plan.tasks[0].directory, 'index.md'), '---\nstatus: running\n---\nChild started.\n');
  const repeat = await launchBatch(plan, f.approve(plan), f.runtime);
  assert.equal(f.calls.length, 4);
  assert.ok(repeat.results.every(x => x.reused));
  const next = await prepareBatch(f.options, f.runtime);
  await assert.rejects(launchBatch(next, f.approve(next), f.runtime), /already has a Happy launch receipt/);
});

test('uncertain creation is recorded and cannot create a duplicate on retry', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const uncertain = { ...f.runtime, spawn: async task => { f.calls.push(task); throw Error('Creation timed out'); } };
  const result = await launchBatch(plan, f.approve(plan), uncertain);
  assert.equal(result.failedTask, '01-research');
  await assert.rejects(launchBatch(plan, f.approve(plan), uncertain), /creation is unresolved/);
  assert.equal(f.calls.length, 1);
});

test('message retry reuses its existing session and stable localId, then proceeds with remaining tasks', async t => {
  const f = await fixture(t), plan = await prepareBatch(f.options, f.runtime);
  const failedSend = { ...f.runtime, send: async task => { f.calls.push({ kind: 'failed-send', ...task }); throw Error('Message timed out'); } };
  const result = await launchBatch(plan, f.approve(plan), failedSend);
  assert.equal(result.sessionId, 'child-1');
  const repeat = await launchBatch(plan, f.approve(plan), f.runtime);
  assert.equal(repeat.results[0].sessionId, 'child-1');
  assert.equal(f.calls.filter(x => x.kind === 'spawn').length, 2);
  assert.equal(f.calls.find(x => x.kind === 'failed-send').localId, f.calls.find(x => x.kind === 'send').localId);
});

test('concurrent launches cannot create more than one session per task', async t => {
  const f = await fixture(t);
  const plan = await prepareBatch({ ...f.options, tasks: ['01-research'] }, f.runtime);
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
      error => error.code === 1 && /execution instruction/.test(error.stderr));
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
  assert.match(delivered[0].message.content.text, /Execute 01-research/);
  assert.equal(delivered[0].message.meta.model, 'gpt-6.1-sol');
  const receipt = await readFile(join(plan.tasks[0].directory, 'happy-session.local.json'), 'utf8');
  assert.equal(JSON.parse(receipt).executionInstruction, executionInstruction);
  assert.ok(!receipt.includes('fixture-token') && !receipt.includes('g'.repeat(43)));
  const repeat = JSON.parse((await promisify(execFile)(process.execPath, args, cliOptions)).stdout);
  assert.ok(repeat.results.every(x => x.reused));
  assert.equal(requests.filter(x => x.pathname === '/spawn-session').length, 2);
  assert.equal(delivered.length, 2, 'repeated CLI launch must not resend prompts');
});
