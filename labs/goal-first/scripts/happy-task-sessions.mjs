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
  if (typeof model !== 'string' || !model.trim()) throw Error('当前模型未知，请明确提供 --model。');
  if (!efforts.has(effort)) throw Error('--effort 必须是 low、medium、high、xhigh 或 max。');
  if (!source.models?.includes(model)) throw Error('模型不在源会话目录中，请刷新模型目录后重新准备批次。');
  return { model, effort, permissionMode: source.permissionMode ?? 'default', fast: source.fast ?? false };
}

async function readTask(workspace, name) {
  if (typeof name !== 'string' || !/^\d{2}-[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(name)) {
    throw Error('任务必须是 tasks 的直系 NN-中文任务名（或已有英文名）目录，名称只含文字、数字和词间连字符。');
  }
  const directory = await realpath(join(workspace, 'tasks', name));
  if (dirname(directory) !== join(workspace, 'tasks')) throw Error('任务目录必须位于当前工作区 tasks 的直系目录内。');
  const files = {};
  for (const file of ['PROMPT.md', 'index.md', 'PROGRESS.md']) {
    const path = join(directory, file);
    try { await lstat(path); } catch (error) {
      // A dangling symlink is an invalid file, not an absent optional record.
      if (file === 'PROGRESS.md' && error.code === 'ENOENT') { files[file] = null; continue; }
      throw error;
    }
    const target = await realpath(path);
    if (dirname(target) !== directory) throw Error('任务文件必须位于本任务目录内，不能通过符号链接越界。');
    files[file] = await readFile(target, 'utf8');
  }
  return { task: name, directory, promptHash: hash(files['PROMPT.md']), indexHash: hash(files['index.md']),
    progressHash: files['PROGRESS.md'] === null ? null : hash(files['PROGRESS.md']), prompt: files['PROMPT.md'] };
}

function executionIdentity(plan, task) {
  return { workspace: plan.workspace, task: task.task, directory: task.directory, sourceSessionId: plan.sourceSessionId,
    machineId: plan.machineId, accountProfileId: plan.accountProfileId, model: task.model, effort: task.effort,
    permissionMode: task.permissionMode, fast: task.fast };
}

function firstMessage(workspace, task, legacy = false) {
  // An old unacknowledged send must retain its original bytes and localId.
  if (legacy) return `Goal workspace: ${workspace}\nAssigned task: ${task.directory}\nRead the workspace AGENTS.md and problem.md, then this task's index.md and PROMPT.md. Before execution, verify goal confirmation and a separate user execution instruction for this task in index.md or the original user conversation. Receiving a copied prompt or this launch message is not authorization. If execution evidence is missing, keep the task pending and report the missing decision. Execute only the authorized task and write results back to its records directory.\n\n${task.prompt}`;
  return `目标工作区：${workspace}\n分配任务：${task.directory}\n先读工作区 AGENTS.md、problem.md，再读本任务 index.md 和 PROMPT.md。按本地 AGENTS 判断契约与授权归属：新工作区由 PROMPT.md 承载执行契约，并指向实际 PROGRESS.md 或原始用户来源；旧工作区继续读取其 index.md 契约和原有证据，不自动迁移。执行前核对目标确认及本任务的独立用户执行指令；缺少 PROGRESS.md 本身不代表旧工作区没有授权。收到 Prompt 或本启动消息不构成执行授权。缺少真实执行依据时保持 pending，报告待决事项。只执行已授权范围；结果按用途保存，重要事件按需记入 PROGRESS.md，有价值的决策与机制解释归 FAQ.md；仅维护 index.md 的唯一 status。\n\n${task.prompt}`;
}

async function goalHash(workspace) {
  const texts = await Promise.all(['AGENTS.md', 'problem.md'].map(file => readFile(join(workspace, file), 'utf8')));
  return hash(JSON.stringify(texts));
}

export async function prepareBatch(options, runtime) {
  const workspace = await realpath(options.workspace);
  if (!options.tasks?.length || new Set(options.tasks).size !== options.tasks.length) throw Error('请选择至少一个任务，同一批次不能重复选择任务。');
  const source = await runtime.source(options.sourceSessionId);
  if (source.agent !== 'codex') throw Error('此适配器目前仅支持 Codex Happy 会话。');
  const settings = resolveSettings(source, options);
  const tasks = await Promise.all(options.tasks.map(async name => {
    const { prompt, ...task } = await readTask(workspace, name);
    return { ...task, ...settings };
  }));
  const plan = { version: 2, workspace, sourceSessionId: options.sourceSessionId, machineId: source.machineId,
    accountProfileId: source.accountProfileId ?? null, goalHash: await goalHash(workspace), tasks };
  return { ...plan, digest: fingerprint(plan) };
}

export async function launchBatch(plan, approval, runtime) {
  // This field separates execution intent from plan review; the calling AI must
  // verify its meaning and provenance against the user's conversation/records.
  if (![1, 2].includes(plan.version) || typeof approval?.executionInstruction !== 'string' || !approval.executionInstruction.trim() || approval.digest !== plan.digest || fingerprint(plan) !== plan.digest) {
    throw Error('启动需要与准备结果完全一致的批次摘要，以及单独核验过来源和范围的用户执行指令。');
  }
  const workspace = await realpath(plan.workspace);
  if (workspace !== plan.workspace || await goalHash(workspace) !== plan.goalHash) throw Error('目标文档已变化，请重新准备批次并核对原执行指令是否仍适用。');
  if (!plan.tasks?.length || new Set(plan.tasks.map(t => t.task)).size !== plan.tasks.length) throw Error('任务批次无效。');
  const source = await runtime.source(plan.sourceSessionId);
  if (source.agent !== 'codex' || source.machineId !== plan.machineId || (source.accountProfileId ?? null) !== plan.accountProfileId) {
    throw Error('源会话的代理、机器或账号已变化，请重新对齐受影响的执行设置。');
  }
  // Validate the whole batch before creating any session.
  const tasks = await Promise.all(plan.tasks.map(async expected => {
    const settings = resolveSettings(source, expected);
    if (settings.permissionMode !== expected.permissionMode || settings.fast !== expected.fast) {
      throw Error('源会话的运行权限或 fast 设置已变化，请重新核对执行设置。');
    }
    const actual = await readTask(workspace, expected.task);
    const receipt = join(actual.directory, 'happy-session.local.json');
    let previous;
    try {
      if (!(await lstat(receipt)).isFile()) throw Error('启动记录必须是普通文件，不能是符号链接。');
      previous = await json(receipt);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (previous && !previous.sessionId) throw Error('上次会话创建结果尚未查明，请先核对 Happy，不能自动重建。');
    const identity = executionIdentity(plan, expected);
    if (previous) {
      if (previous.task !== expected.task || previous.sourceSessionId !== plan.sourceSessionId || previous.model !== expected.model || previous.effort !== expected.effort) {
        throw Error('任务已有启动记录，但执行身份不一致；请核对原会话，不能自动复用或另建会话。');
      }
      if (previous.executionIdentity) {
        if (JSON.stringify(previous.executionIdentity) !== JSON.stringify(identity)) throw Error('任务执行身份已变化，请核对原会话及授权，不能自动换参或另建会话。');
      } else if (previous.batchDigest !== plan.digest) {
        throw Error('旧启动记录缺少完整执行身份，请先用原准备批次核对并补齐记录，不能忽略旧记录另建会话。');
      }
      if (!previous.messageSeq && previous.promptHash && previous.promptHash !== expected.promptHash) {
        throw Error('首条消息尚未确认送达且 Prompt 已变化，请核对原会话和消息结果后接续。');
      }
    }
    // A completed launch can be inspected again after the child updates index.md.
    if (actual.directory !== expected.directory || actual.promptHash !== expected.promptHash || (!previous?.messageSeq && actual.indexHash !== expected.indexHash)) {
      throw Error('任务文件已变化，请重新准备批次并核对原执行指令是否仍适用。');
    }
    if (plan.version === 2 ? actual.progressHash !== expected.progressHash : actual.progressHash !== null && !previous?.messageSeq) {
      throw Error('任务过程记录已变化或旧批次未绑定该记录，请重新准备批次并核对原执行指令是否仍适用。');
    }
    const text = firstMessage(workspace, actual, previous ? previous.version !== 2 : false);
    if (previous?.messageHash && !previous.messageSeq && previous.messageHash !== hash(text)) {
      throw Error('首条消息内容与原发送记录不一致，请先核对原会话和消息结果。');
    }
    return { ...actual, ...expected, receipt, previous, identity, text };
  }));
  const results = [];
  for (const task of tasks) {
    const record = task.previous ?? { version: 2, batchDigest: plan.digest, task: task.task, sourceSessionId: plan.sourceSessionId,
      model: task.model, effort: task.effort, confirmation: approval.confirmation,
      executionInstruction: approval.executionInstruction, createdAt: new Date().toISOString() };
    // Keep the original message identity across record-only changes and reprepare.
    const upgradeReceipt = !record.executionIdentity;
    record.executionIdentity = task.identity;
    record.localId ??= `goal-first-${record.batchDigest}-${task.task}`;
    record.promptHash ??= task.promptHash;
    record.messageHash ??= hash(task.text);
    if (record.messageSeq) {
      if (upgradeReceipt) await writeFile(task.receipt, JSON.stringify(record, null, 2) + '\n');
      results.push({ task: task.task, sessionId: record.sessionId, messageSeq: record.messageSeq, reused: true }); continue;
    }
    record.executionInstruction = approval.executionInstruction;
    if (!task.previous) {
      // Exclusive receipt creation prevents concurrent invocations from duplicating a task.
      const reservation = await open(task.receipt, 'wx', 0o600);
      try { await reservation.writeFile(JSON.stringify(record, null, 2) + '\n'); } finally { await reservation.close(); }
    } else if (upgradeReceipt) await writeFile(task.receipt, JSON.stringify(record, null, 2) + '\n');
    try {
      if (!record.sessionId) {
        record.sessionId = await runtime.spawn({ directory: task.directory, sourceSessionId: plan.sourceSessionId,
          accountProfileId: plan.accountProfileId, machineId: plan.machineId, model: task.model, effort: task.effort });
        await writeFile(task.receipt, JSON.stringify(record, null, 2) + '\n');
      }
      const sent = await runtime.send({ sessionId: record.sessionId, accountProfileId: plan.accountProfileId,
        directory: task.directory, localId: record.localId, text: task.text,
        meta: { sentFrom: 'goal-first', model: task.model, effort: task.effort, permissionMode: task.permissionMode, fast: task.fast } });
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
  if (entry?.encryptionVariant !== 'dataKey') throw Error('需要本地 Happy dataKey 缓存，此适配器不支持旧加密格式。');
  const key = Buffer.from(entry.encryptionKey, 'base64');
  const b = Buffer.from(value, 'base64');
  if (key.length !== 32 || b[0] !== 0 || b.length < 29) throw Error('Happy 加密数据无效。');
  const d = createDecipheriv('aes-256-gcm', key, b.subarray(1, 13));
  d.setAuthTag(b.subarray(-16));
  return JSON.parse(Buffer.concat([d.update(b.subarray(13, -16)), d.final()]));
}

function encrypt(value, entry) {
  if (entry?.encryptionVariant !== 'dataKey') throw Error('需要本地 Happy dataKey 缓存。');
  const nonce = randomBytes(12), c = createCipheriv('aes-256-gcm', Buffer.from(entry.encryptionKey, 'base64'), nonce);
  return Buffer.concat([Buffer.from([0]), nonce, c.update(JSON.stringify(value)), c.final(), c.getAuthTag()]).toString('base64');
}

export async function localHappyRuntime(env = process.env) {
  const happyHome = resolve((env.HAPPY_HOME_DIR ?? join(homedir(), '.happy')).replace(/^~(?=$|\/)/, homedir()));
  const [auth, settings, daemon] = await Promise.all(['access.key', 'settings.json', 'daemon.state.json'].map(f => json(join(happyHome, f))));
  if (!auth.token || !settings.machineId || !daemon.httpPort) throw Error('需要本地 Happy 凭据和正在运行的 daemon。');
  process.kill(daemon.pid, 0);
  const serverUrl = env.HAPPY_SERVER_URL ?? settings.serverUrl;
  if (!serverUrl) throw Error('请将 HAPPY_SERVER_URL 设置为当前 Happy 会话使用的后端。');
  const server = new URL(serverUrl);
  if (!['http:', 'https:'].includes(server.protocol) || server.username || server.password) throw Error('Happy 后端 URL 无效。');
  const request = async (url, body, authenticated = true, timeout = 15000) => {
    const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', redirect: 'error',
      headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${auth.token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(timeout) });
    if (!response.ok) throw Error(`Happy 请求失败（HTTP ${response.status}），请核对会话和账号后重试。`);
    return response.json();
  };
  const api = (path, body) => request(new URL(path, server), body);
  const entryFor = async id => (await json(join(happyHome, 'sessions.json'))).sessions?.[id];
  const session = async id => {
    const entry = await entryFor(id);
    if (!entry) throw Error('当前机器的 Happy 加密缓存中没有该会话。');
    const result = await api(`/v2/sessions/${encodeURIComponent(id)}`);
    const raw = result.session;
    if (!raw || raw.id !== id) throw Error('Happy 会话响应与请求不一致。');
    return { raw, metadata: decrypt(raw.metadata, entry), entry };
  };
  return {
    async source(id) {
      const { raw, metadata: m, entry } = await session(id);
      if (m.machineId !== settings.machineId) throw Error('源会话属于另一台执行机器。');
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
        if (cursor === after) throw Error('Happy 消息分页没有继续推进。');
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
      if (task.accountProfileId && !/^[A-Za-z0-9_-]{43}$/.test(grant ?? '')) throw Error('无法取得源账号的会话启动 grant。');
      const result = await request(`http://127.0.0.1:${daemon.httpPort}/spawn-session`, {
        directory: task.directory, agent: 'codex', model: task.model, effort: task.effort,
        ...(grant ? { codexSessionGrant: grant } : {}) }, false, 120000);
      if (!result.success || !result.sessionId) throw Error('Happy 未返回新会话 ID。');
      return result.sessionId;
    },
    async send(task) {
      // Daemon cache registration can follow the session creation acknowledgement.
      const deadline = Date.now() + 10000;
      while (!await entryFor(task.sessionId)) {
        if (Date.now() >= deadline) throw Error('新会话缓存尚未就绪，重试时必须复用已记录的会话 ID。');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      const { metadata: m, entry } = await session(task.sessionId);
      if (m.machineId !== settings.machineId || m.flavor !== 'codex' || resolve(m.path) !== task.directory || (m.codexAccountProfileId ?? null) !== task.accountProfileId) {
        throw Error('新会话的机器、目录、代理或账号与已核对任务不一致。');
      }
      const result = await api(`/v3/sessions/${encodeURIComponent(task.sessionId)}/messages`, { messages: [{
        localId: task.localId, content: encrypt({ role: 'user', content: { type: 'text', text: task.text }, meta: task.meta }, entry) }] });
      const message = result.messages?.find(m => m.localId === task.localId);
      if (!Number.isInteger(message?.seq) || message.seq <= 0) throw Error('缺少任务消息送达确认，重试时必须使用同一已记录会话。');
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
    if (!value || value.startsWith('--') || (flag !== '--task' && !names[flag])) throw Error('命令参数无效。');
    if (flag === '--task') options.tasks.push(value);
    else { if (options[names[flag]] !== undefined) throw Error('参数不能重复。'); options[names[flag]] = value; }
  }
  if (!['prepare', 'launch'].includes(command)) throw Error('用法：prepare --workspace DIR --source-session ID --task NN-中文任务名 [--task NN-中文任务名] [--model MODEL --effort xhigh]；launch --plan FILE --approved-digest DIGEST --execution-instruction TEXT [--task-confirmation TEXT]');
  if (command === 'prepare' && (!options.workspace || !options.sourceSessionId)) throw Error('必须提供工作区和源 Happy 会话 ID。');
  if (command === 'launch' && (!options.planFile || !options.digest || !options.executionInstruction?.trim())) throw Error('必须提供已准备批次、匹配摘要及单独核验过的用户执行指令。');
  const permitted = command === 'prepare' ? new Set(['tasks', 'workspace', 'sourceSessionId', 'model', 'effort', 'outputFile']) : new Set(['tasks', 'planFile', 'digest', 'confirmation', 'executionInstruction']);
  if (Object.keys(options).some(key => !permitted.has(key)) || (command === 'launch' && options.tasks.length)) throw Error('此命令不支持该参数。');
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
