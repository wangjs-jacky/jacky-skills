#!/usr/bin/env node

// Optional Happy adapter. The portable workspace does not depend on this file.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { lstat, open, readFile, realpath, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const efforts = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
const hash = value => createHash('sha256').update(value).digest('hex');
const json = file => readFile(file, 'utf8').then(JSON.parse);
const fingerprint = plan => hash(JSON.stringify({ ...plan, digest: undefined }));

export function resolveSettings(source, overrides = {}) {
  const model = overrides.model ?? source.model;
  const effort = overrides.effort ?? source.effort;
  if (typeof model !== 'string' || !model.trim()) throw Error('Current model is unknown; specify --model.');
  if (!efforts.has(effort)) throw Error('Specify a supported --effort: low, medium, high, xhigh, max.');
  if (!source.models?.includes(model)) throw Error('Model is absent from the source session catalog; refresh its catalog before preparing a batch.');
  return { model, effort, permissionMode: source.permissionMode ?? 'default', fast: source.fast ?? false };
}

async function readTask(workspace, name) {
  if (!/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw Error('Task must be a direct NN-short-description directory.');
  const directory = await realpath(join(workspace, 'tasks', name));
  if (dirname(directory) !== join(workspace, 'tasks')) throw Error('Task directory must stay inside this workspace.');
  const files = {};
  for (const file of ['PROMPT.md', 'index.md']) {
    const target = await realpath(join(directory, file));
    if (dirname(target) !== directory) throw Error('Task files must stay inside their task directory.');
    files[file] = await readFile(target, 'utf8');
  }
  return { task: name, directory, promptHash: hash(files['PROMPT.md']), indexHash: hash(files['index.md']), prompt: files['PROMPT.md'] };
}

async function goalHash(workspace) {
  const texts = await Promise.all(['AGENTS.md', 'problem.md'].map(file => readFile(join(workspace, file), 'utf8')));
  return hash(JSON.stringify(texts));
}

export async function prepareBatch(options, runtime) {
  const workspace = await realpath(options.workspace);
  if (!options.tasks?.length || new Set(options.tasks).size !== options.tasks.length) throw Error('Choose a non-empty batch of distinct tasks.');
  const source = await runtime.source(options.sourceSessionId);
  if (source.agent !== 'codex') throw Error('This adapter currently supports Codex Happy sessions.');
  const settings = resolveSettings(source, options);
  const tasks = await Promise.all(options.tasks.map(async name => {
    const { prompt, ...task } = await readTask(workspace, name);
    return { ...task, ...settings };
  }));
  const plan = { version: 1, workspace, sourceSessionId: options.sourceSessionId, machineId: source.machineId,
    accountProfileId: source.accountProfileId ?? null, goalHash: await goalHash(workspace), tasks };
  return { ...plan, digest: fingerprint(plan) };
}

export async function launchBatch(plan, approval, runtime) {
  // This field separates execution intent from plan review; the calling AI must
  // verify its meaning and provenance against the user's conversation/records.
  if (plan.version !== 1 || typeof approval?.executionInstruction !== 'string' || !approval.executionInstruction.trim() || approval.digest !== plan.digest || fingerprint(plan) !== plan.digest) {
    throw Error('Launch requires the exact prepared batch digest and a separately verified user execution instruction.');
  }
  const workspace = await realpath(plan.workspace);
  if (workspace !== plan.workspace || await goalHash(workspace) !== plan.goalHash) throw Error('Goal documents changed; reprepare and check whether the existing execution instruction still applies.');
  if (!plan.tasks?.length || new Set(plan.tasks.map(t => t.task)).size !== plan.tasks.length) throw Error('Invalid task batch.');
  const source = await runtime.source(plan.sourceSessionId);
  if (source.agent !== 'codex' || source.machineId !== plan.machineId || (source.accountProfileId ?? null) !== plan.accountProfileId) {
    throw Error('Source agent, machine, or account changed; realign the affected execution settings.');
  }
  // Validate the whole batch before creating any session.
  const tasks = await Promise.all(plan.tasks.map(async expected => {
    resolveSettings(source, expected);
    const actual = await readTask(workspace, expected.task);
    const receipt = join(actual.directory, 'happy-session.local.json');
    let previous;
    try {
      if (!(await lstat(receipt)).isFile()) throw Error('Launch receipt must be a regular file, not a symlink.');
      previous = await json(receipt);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (previous && previous.batchDigest !== plan.digest) throw Error('Task already has a Happy launch receipt; reconcile it before proposing another session.');
    if (previous && !previous.sessionId) throw Error('A previous session creation is unresolved; check Happy before retrying.');
    // A completed launch can be inspected again after the child updates index.md.
    if (actual.directory !== expected.directory || actual.promptHash !== expected.promptHash || (!previous?.messageSeq && actual.indexHash !== expected.indexHash)) {
      throw Error('Task files changed; reprepare and check whether the existing execution instruction still applies.');
    }
    return { ...actual, ...expected, receipt, previous };
  }));
  const results = [];
  for (const task of tasks) {
    const record = task.previous ?? { batchDigest: plan.digest, task: task.task, sourceSessionId: plan.sourceSessionId,
      model: task.model, effort: task.effort, confirmation: approval.confirmation,
      executionInstruction: approval.executionInstruction, createdAt: new Date().toISOString() };
    if (record.messageSeq) { results.push({ task: task.task, sessionId: record.sessionId, messageSeq: record.messageSeq, reused: true }); continue; }
    record.executionInstruction = approval.executionInstruction;
    if (!task.previous) {
      // Exclusive receipt creation prevents concurrent invocations from duplicating a task.
      const reservation = await open(task.receipt, 'wx', 0o600);
      try { await reservation.writeFile(JSON.stringify(record, null, 2) + '\n'); } finally { await reservation.close(); }
    }
    try {
      if (!record.sessionId) {
        record.sessionId = await runtime.spawn({ directory: task.directory, sourceSessionId: plan.sourceSessionId,
          accountProfileId: plan.accountProfileId, machineId: plan.machineId, model: task.model, effort: task.effort });
        await writeFile(task.receipt, JSON.stringify(record, null, 2) + '\n');
      }
      const text = `Goal workspace: ${workspace}\nAssigned task: ${task.directory}\nRead the workspace AGENTS.md and problem.md, then this task's index.md and PROMPT.md. Before execution, verify goal confirmation and a separate user execution instruction for this task in index.md or the original user conversation. Receiving a copied prompt or this launch message is not authorization. If execution evidence is missing, keep the task pending and report the missing decision. Execute only the authorized task and write results back to its records directory.\n\n${task.prompt}`;
      const sent = await runtime.send({ sessionId: record.sessionId, accountProfileId: plan.accountProfileId,
        directory: task.directory, localId: `goal-first-${plan.digest}-${task.task}`, text,
        meta: { sentFrom: 'goal-first-workflow', model: task.model, effort: task.effort, permissionMode: task.permissionMode, fast: task.fast } });
      record.messageSeq = sent.seq;
      await writeFile(task.receipt, JSON.stringify(record, null, 2) + '\n');
      results.push({ task: task.task, sessionId: record.sessionId, messageSeq: record.messageSeq });
    } catch (error) {
      // Never retry an uncertain creation or switch model/account automatically.
      return { results, failedTask: task.task, sessionId: record.sessionId ?? null, error: error.message };
    }
  }
  return { results };
}

function decrypt(value, entry) {
  if (entry?.encryptionVariant !== 'dataKey') throw Error('A local Happy dataKey cache is required; this adapter does not support legacy encryption.');
  const key = Buffer.from(entry.encryptionKey, 'base64');
  const b = Buffer.from(value, 'base64');
  if (key.length !== 32 || b[0] !== 0 || b.length < 29) throw Error('Invalid Happy encrypted data.');
  const d = createDecipheriv('aes-256-gcm', key, b.subarray(1, 13));
  d.setAuthTag(b.subarray(-16));
  return JSON.parse(Buffer.concat([d.update(b.subarray(13, -16)), d.final()]));
}

function encrypt(value, entry) {
  if (entry?.encryptionVariant !== 'dataKey') throw Error('A local Happy dataKey cache is required.');
  const nonce = randomBytes(12), c = createCipheriv('aes-256-gcm', Buffer.from(entry.encryptionKey, 'base64'), nonce);
  return Buffer.concat([Buffer.from([0]), nonce, c.update(JSON.stringify(value)), c.final(), c.getAuthTag()]).toString('base64');
}

export async function localHappyRuntime(env = process.env) {
  const happyHome = resolve((env.HAPPY_HOME_DIR ?? join(homedir(), '.happy')).replace(/^~(?=$|\/)/, homedir()));
  const [auth, settings, daemon] = await Promise.all(['access.key', 'settings.json', 'daemon.state.json'].map(f => json(join(happyHome, f))));
  if (!auth.token || !settings.machineId || !daemon.httpPort) throw Error('Happy local credentials and a running daemon are required.');
  process.kill(daemon.pid, 0);
  const serverUrl = env.HAPPY_SERVER_URL ?? settings.serverUrl;
  if (!serverUrl) throw Error('Set HAPPY_SERVER_URL to the same backend used by the current Happy session.');
  const server = new URL(serverUrl);
  if (!['http:', 'https:'].includes(server.protocol) || server.username || server.password) throw Error('Invalid Happy backend URL.');
  const request = async (url, body, authenticated = true, timeout = 15000) => {
    const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', redirect: 'error',
      headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${auth.token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(timeout) });
    if (!response.ok) throw Error(`Happy request failed (HTTP ${response.status}); check the session/account before retrying.`);
    return response.json();
  };
  const api = (path, body) => request(new URL(path, server), body);
  const entryFor = async id => (await json(join(happyHome, 'sessions.json'))).sessions?.[id];
  const session = async id => {
    const entry = await entryFor(id);
    if (!entry) throw Error('Session is absent from this machine\'s Happy encryption cache.');
    const result = await api(`/v2/sessions/${encodeURIComponent(id)}`);
    const raw = result.session;
    if (!raw || raw.id !== id) throw Error('Unexpected Happy session response.');
    return { raw, metadata: decrypt(raw.metadata, entry), entry };
  };
  return {
    async source(id) {
      const { raw, metadata: m, entry } = await session(id);
      if (m.machineId !== settings.machineId) throw Error('Source session belongs to a different execution machine.');
      let after = Math.max(0, raw.seq - 200), latest = {};
      for (;;) {
        const page = await api(`/v3/sessions/${encodeURIComponent(id)}/messages?after_seq=${after}&limit=100`);
        let cursor = after;
        for (const message of page.messages ?? []) {
          if (message.seq > raw.seq) continue;
          cursor = Math.max(cursor, message.seq);
          if (message.content?.t === 'encrypted') {
            const body = decrypt(message.content.c, entry);
            if (body.role === 'user') latest = body.meta ?? {};
          }
        }
        if (!page.hasMore || cursor >= raw.seq) break;
        if (cursor === after) throw Error('Happy message pagination stalled.');
        after = cursor;
      }
      return { agent: m.flavor, machineId: m.machineId, accountProfileId: m.codexAccountProfileId,
        model: m.currentModelCode ?? latest.model, effort: m.currentThoughtLevelCode ?? latest.effort,
        models: m.models?.map(x => x.value ?? x.code), permissionMode: m.currentOperatingModeCode ?? latest.permissionMode, fast: latest.fast };
    },
    async spawn(task) {
      // Preserve a managed source account with an exact-account grant kept only in memory.
      let grant;
      if (task.accountProfileId) grant = (await api('/v1/codex-session-grants', { machineId: task.machineId, sourceSessionId: task.sourceSessionId })).grant;
      if (task.accountProfileId && !/^[A-Za-z0-9_-]{43}$/.test(grant ?? '')) throw Error('Source-account launch grant is unavailable.');
      const result = await request(`http://127.0.0.1:${daemon.httpPort}/spawn-session`, {
        directory: task.directory, agent: 'codex', model: task.model, effort: task.effort,
        ...(grant ? { codexSessionGrant: grant } : {}) }, false, 120000);
      if (!result.success || !result.sessionId) throw Error('Happy did not return a new session ID.');
      return result.sessionId;
    },
    async send(task) {
      // Daemon cache registration can follow the session creation acknowledgement.
      const deadline = Date.now() + 10000;
      while (!await entryFor(task.sessionId)) {
        if (Date.now() >= deadline) throw Error('New session cache is not ready; reuse its recorded ID when retrying.');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      const { metadata: m, entry } = await session(task.sessionId);
      if (m.machineId !== settings.machineId || m.flavor !== 'codex' || resolve(m.path) !== task.directory || (m.codexAccountProfileId ?? null) !== task.accountProfileId) {
        throw Error('New session machine, directory, agent, or account differs from the approved task.');
      }
      const result = await api(`/v3/sessions/${encodeURIComponent(task.sessionId)}/messages`, { messages: [{
        localId: task.localId, content: encrypt({ role: 'user', content: { type: 'text', text: task.text }, meta: task.meta }, entry) }] });
      const message = result.messages?.find(m => m.localId === task.localId);
      if (!Number.isInteger(message?.seq) || message.seq <= 0) throw Error('Task message acknowledgement is missing; retry with the same recorded session.');
      return message;
    },
  };
}

async function main(args) {
  const [command, ...flags] = args;
  const options = { tasks: [] };
  const names = { '--workspace': 'workspace', '--source-session': 'sourceSessionId', '--model': 'model', '--effort': 'effort',
    '--plan': 'planFile', '--approved-digest': 'digest', '--task-confirmation': 'confirmation', '--confirmation': 'confirmation',
    '--execution-instruction': 'executionInstruction', '--output': 'outputFile' };
  for (let i = 0; i < flags.length; i += 2) {
    const flag = flags[i], value = flags[i + 1];
    if (!value || value.startsWith('--') || (flag !== '--task' && !names[flag])) throw Error('Invalid command arguments.');
    if (flag === '--task') options.tasks.push(value);
    else { if (options[names[flag]] !== undefined) throw Error('Duplicate argument.'); options[names[flag]] = value; }
  }
  if (!['prepare', 'launch'].includes(command)) throw Error('Usage: prepare --workspace DIR --source-session ID --task NN-name [--task NN-name] [--model MODEL --effort xhigh]; launch --plan FILE --approved-digest DIGEST --execution-instruction TEXT [--task-confirmation TEXT]');
  if (command === 'prepare' && (!options.workspace || !options.sourceSessionId)) throw Error('Workspace and source Happy session ID are required.');
  if (command === 'launch' && (!options.planFile || !options.digest || !options.executionInstruction?.trim())) throw Error('Prepared plan, matching digest, and a separately verified user execution instruction are required.');
  const permitted = command === 'prepare' ? new Set(['tasks', 'workspace', 'sourceSessionId', 'model', 'effort', 'outputFile']) : new Set(['tasks', 'planFile', 'digest', 'confirmation', 'executionInstruction']);
  if (Object.keys(options).some(key => !permitted.has(key)) || (command === 'launch' && options.tasks.length)) throw Error('Argument is not supported for this command.');
  const runtime = await localHappyRuntime();
  const result = command === 'prepare' ? await prepareBatch(options, runtime) : await launchBatch(await json(options.planFile), options, runtime);
  const output = JSON.stringify(result, null, 2) + '\n';
  if (options.outputFile) {
    await writeFile(resolve(options.outputFile), output, { flag: 'wx', mode: 0o600 });
  }
  console.log(output.trimEnd());
  if (result.failedTask) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
