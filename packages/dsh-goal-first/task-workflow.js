/** Task alignment and human file review. Markdown remains the sole task-status source.
 * confirm/approve are user actions; this module never registers model tools or starts agents. */
import { constants } from 'node:fs';
import { lstat, open, readFile, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { atomicWrite } from './project-store.js';
import { safePath } from './lib/records.js';
import { readTaskFile } from './task-files.js';

const DOCUMENT_LIMIT = 256 * 1024, HASH_TIMEOUT = 5000, DELIVERY_LIMIT = 200;
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
const own = (object, key) => object && Object.hasOwn(object, key) ? object[key] : undefined;
const within = (root, path) => { const part = relative(root, path); return part !== '..' && !part.startsWith('..' + sep) && !isAbsolute(part); };
const normalize = value => String(value || '').replace(/\r\n?/g, '\n').split('\n').map(line => line.trimEnd()).join('\n').trim();
const contractHash = contract => hash({ goal: normalize(contract.goal), deliverables: contract.deliverables.map(normalize), acceptance: normalize(contract.acceptance) });
const conflict = () => new Error('任务资料版本已变化，请刷新后重新对齐（revision conflict）');
function baseline(actual, expected) { if (typeof expected !== 'string' || actual !== expected) throw conflict(); }
function validId(value, label) {
  if (typeof value !== 'string' || !value || value.length > 128 || ['__proto__', 'constructor', 'prototype'].includes(value)) throw new Error(`${label}无效`);
  return value;
}
function inputText(value, label, maximum) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum || value.includes('\0')) throw new Error(`${label}必须是有效的非空文本（最多 ${maximum} 字符）`);
  return normalize(value);
}
function proposalContract(input) {
  if (!Array.isArray(input.deliverables) || !input.deliverables.length || input.deliverables.length > 100) throw new Error('预期交付物需要 1–100 项');
  const deliverables = input.deliverables.map(item => {
    const text = inputText(item, '预期交付物', 4000);
    if (/[\r\n]/.test(text)) throw new Error('每项预期交付物必须单独一行');
    return text;
  });
  let acceptance = input.acceptance;
  if (Array.isArray(acceptance)) {
    if (!acceptance.length || acceptance.length > 100) throw new Error('验收要求数组需要 1–100 项');
    acceptance = acceptance.map(item => inputText(item, '验收要求', 4000)).join('\n');
  }
  return { goal: inputText(input.goal, '目标', 20000), deliverables, acceptance: inputText(acceptance, '验收要求', 40000) };
}

/** Recognize headings outside frontmatter, comments and fenced examples. Offsets keep other text verbatim. */
function headings(source, visit) {
  const result = []; let offset = 0, fence = null, comment = false;
  const front = source.match(/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/)?.[0].length || 0;
  for (const match of source.matchAll(/[^\n]*(?:\n|$)/g)) {
    const line = match[0], start = offset; offset += line.length;
    if (!line || start < front) continue;
    const trimmed = line.trim();
    if (comment) { if (trimmed.includes('-->')) comment = false; continue; }
    if (trimmed.startsWith('<!--')) { comment = !trimmed.includes('-->'); continue; }
    const marker = line.replace(/\r?\n$/, '').match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      continue;
    }
    if (fence) continue;
    visit?.(line, start);
    const heading = line.match(/^(#{1,6})[ \t]+(.+?)[ \t]*\r?\n?$/);
    if (heading) result.push({ level: heading[1].length, name: heading[2].replace(/[ \t]+#+[ \t]*$/, '').trim(), start, body: offset });
  }
  return result;
}
function protectedRegion(source, heading, end, all) {
  const nested = all.find(item => item.start > heading.start && item.start < end && /授权|历史|执行依据|用户原话/.test(item.name));
  const line = source.slice(heading.body, end).match(/^[ \t]*(?:[-*][ \t]+)?(?:用户(?:原话|确认|指令)|(?:原始|既有|历史|旧)?(?:执行(?:授权|依据)|授权(?:来源|依据|原文|记录)))[ \t]*[:：]/m);
  const inlineStart = line ? heading.body + line.index : end;
  return nested && nested.start <= inlineStart ? { start: nested.start, inline: false } : { start: inlineStart, inline: inlineStart < end };
}
function section(source, names) {
  const all = headings(source), start = all.findIndex(item => item.level === 2 && names.includes(item.name));
  if (start < 0) return undefined;
  const heading = all[start], end = all.slice(start + 1).find(item => item.level <= 2)?.start ?? source.length;
  return normalize(source.slice(heading.body, protectedRegion(source, heading, end, all).start));
}
function field(source, names) {
  const pattern = new RegExp(`^(?:[-*]\\s+)?(?:\\*\\*)?(?:${names.join('|')})(?:\\*\\*)?\\s*[:：]\\s*(.+)$`, 'm');
  const end = headings(source).find(heading => heading.level === 2)?.start ?? source.length;
  return source.slice(0, end).match(pattern)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}
function list(value) { return value === undefined ? undefined : value.split('\n').map(line => line.replace(/^\s*(?:[-*]|\d+[.)、])\s*/, '').trim()).filter(Boolean); }
function thinNavigation(index) {
  const all = headings(index);
  const contractNames = new Set(['目标', '目标摘要', '目标与范围', '预期交付物', '计划交付', '预期产物', '交付物', '验收要求', '验收', '验收方法与证据', '验收与权限']);
  if (all.some(heading => heading.level === 2 && contractNames.has(heading.name))) return null;
  const end = all.find(heading => heading.level === 2)?.start ?? index.length;
  let summary = null;
  headings(index, (line, start) => {
    if (summary || start >= end) return;
    const match = line.match(/^([ \t]{0,3}(?:[-*][ \t]+)?(?:\*\*)?(?:目标摘要|目标)(?:\*\*)?[ \t]*[:：][ \t]*)([^\r\n]*)/);
    if (match) summary = { start: start + match[1].length, end: start + match[0].length, text: match[2].trim() };
  });
  return summary;
}
function promptSupplementContract(prompt) {
  const opening = [...prompt.matchAll(/^<!-- goal-first:contract [^>\r\n]+ -->[ \t]*\r?\n/gm)].at(-1);
  if (!opening) return null;
  const remaining = prompt.slice(opening.index + opening[0].length);
  const closing = remaining.match(/^<!-- \/goal-first:contract -->[ \t]*(?:\r?\n|$)/m);
  if (!closing) throw new Error('当前任务目标确认补充段不完整，请核对原始 PROMPT');
  const source = remaining.slice(0, closing.index), all = headings(source);
  const fields = ['当前目标', '当前预期交付物', '当前验收要求'].map(name => all.filter(heading => heading.level === 3 && heading.name === name));
  if (fields.some(items => items.length !== 1) || fields[0][0].start >= fields[1][0].start || fields[1][0].start >= fields[2][0].start) throw new Error('当前任务目标确认补充段字段不完整，请核对原始 PROMPT');
  const values = fields.map((items, i) => normalize(source.slice(items[0].body, fields[i + 1]?.[0].start ?? source.length)));
  return { goal: values[0], deliverables: list(values[1]), acceptance: values[2] };
}
function editSummary(index, summary, goal) {
  const firstLine = normalize(goal).split('\n')[0].replace(/^\s*(?:#{1,6}|[-*])\s+/, '').trim();
  const sentence = firstLine.match(/^.*?[。！？!?]/)?.[0] || firstLine;
  const characters = Array.from(sentence), text = characters.length > 160 ? characters.slice(0, 159).join('') + '…' : sentence;
  return index.slice(0, summary.start) + text + index.slice(summary.end);
}
function currentContract(task, documents) {
  const index = documents.index, prompt = documents.prompt || '';
  if (thinNavigation(index)) {
    const supplemented = promptSupplementContract(prompt);
    if (supplemented) return supplemented;
    return {
      goal: section(prompt, ['目标', '目标与范围']) ?? field(prompt, ['goal', '目标']) ?? field(index, ['目标摘要', '目标']) ?? normalize(task.goal),
      deliverables: list(section(prompt, ['预期交付物', '交付物'])) ?? task.expectedDeliverables?.map(normalize) ?? task.deliverables?.map(normalize) ?? [],
      acceptance: section(prompt, ['验收要求', '验收', '验收方法与证据', '验收与权限']) ?? field(prompt, ['验收要求']) ?? normalize(task.acceptanceCriteria ?? task.acceptance),
    };
  }
  return {
    goal: section(index, ['目标']) ?? field(index, ['goal', '目标摘要', '目标']) ?? section(index, ['目标摘要']) ?? section(prompt, ['目标', '目标与范围']) ?? field(prompt, ['goal', '目标']) ?? normalize(task.goal),
    deliverables: list(section(index, ['预期交付物']) ?? section(index, ['计划交付', '预期产物', '交付物'])) ?? list(section(prompt, ['预期交付物', '交付物'])) ?? task.expectedDeliverables?.map(normalize) ?? task.deliverables?.map(normalize) ?? [],
    acceptance: section(index, ['验收要求']) ?? section(index, ['验收', '验收方法与证据', '验收与权限']) ?? section(prompt, ['验收要求', '验收', '验收方法与证据', '验收与权限']) ?? field(prompt, ['验收要求']) ?? normalize(task.acceptanceCriteria ?? task.acceptance),
  };
}
function taskStatus(index) { return index.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)?.[1]?.match(/^status:[ \t]*['"]?([a-z]+)['"]?[ \t]*$/m)?.[1]; }
function sameFile(a, b) { return a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs && a.nlink === b.nlink; }

async function noLinks(root, path) {
  let current = root;
  if ((await lstat(root)).isSymbolicLink()) throw new Error('任务目录不能是符号链接');
  for (const part of path.split('/').filter(Boolean)) {
    current = join(current, part);
    const info = await lstat(current);
    if (info.isSymbolicLink()) throw new Error('目录内的符号链接不展开');
  }
  return current;
}
async function regularFile(root, path) {
  const candidate = await noLinks(root, path);
  const actual = await safePath(root, candidate), info = await lstat(actual);
  if (actual !== candidate || !info.isFile()) throw new Error('请选择当前任务目录中的普通文件');
  if (info.nlink !== 1) throw new Error('不能将硬链接文件登记为任务交付物');
  return { actual, info };
}
async function document(root, path, optional = false) {
  try {
    const before = await regularFile(root, path);
    const preview = await readTaskFile(root, path);
    const after = await regularFile(root, path);
    if (!sameFile(before.info, after.info)) throw new Error('任务文档在读取时变化，请刷新');
    if (preview.kind !== 'text') throw new Error('任务文档不可读取，文本仍限 256 KB');
    if (Buffer.byteLength(preview.text) !== before.info.size) throw new Error('任务文档在读取时变化，请刷新');
    return preview.text;
  } catch (error) { if (optional && error.code === 'ENOENT') return null; throw error; }
}
async function documents(context) { return { index: await document(context.cwd, 'index.md'), prompt: await document(context.cwd, 'PROMPT.md', true) }; }
async function contextFor(info) {
  const task = info?.task, project = info?.project;
  validId(task?.id, '任务标识');
  const indexPath = task.indexPath, cwd = info.cwd || (indexPath && dirname(indexPath));
  const root = task.root || project?.root;
  if (!isAbsolute(cwd || '') || !isAbsolute(root || '') || indexPath !== join(cwd, 'index.md') || resolve(cwd) !== cwd || await safePath(root, cwd) !== cwd) throw new Error('任务目录范围已变化，请重新读取');
  return { ...info, task, project, cwd };
}

/** Preview policy is reused unchanged. The separately streamed digest also covers large/binary files. */
async function fileVersion(root, path) {
  const deadline = performance.now() + HASH_TIMEOUT;
  const before = await regularFile(root, path);
  const preview = await readTaskFile(root, path);
  const handle = await open(before.actual, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (!info.isFile() || !sameFile(before.info, info)) throw new Error('文件版本在读取时变化，请刷新');
    const afterPreview = await regularFile(root, path);
    if (!sameFile(info, afterPreview.info) || performance.now() >= deadline) throw new Error('文件版本检查超时或已变化');
    const digest = createHash('sha256'); let length = 0;
    const stream = handle.createReadStream({ autoClose: false, start: 0, end: info.size, highWaterMark: 256 * 1024, signal: AbortSignal.timeout(Math.max(1, Math.ceil(deadline - performance.now()))) });
    for await (const chunk of stream) {
      length += chunk.length;
      if (length > info.size || performance.now() >= deadline) throw new Error('文件在哈希时变化或检查超时');
      digest.update(chunk);
    }
    const named = await regularFile(root, path);
    if (length !== info.size || !sameFile(info, await handle.stat()) || !sameFile(info, named.info)) throw new Error('文件在哈希时变化，请刷新');
    return { path: before.actual, kind: preview.kind, version: digest.digest('hex'), size: info.size };
  } finally { await handle.close(); }
}
function artifactPath(root, path) {
  if (typeof path !== 'string' || !path || path.length > 4096 || /[\\\0]/.test(path) || /^[a-z][a-z0-9+.-]*:/i.test(path)) return null;
  const absolute = isAbsolute(path) ? resolve(path) : resolve(root, path);
  if (!within(root, absolute) || absolute === root) return null;
  return relative(root, absolute).split(sep).join('/');
}
async function deliveriesFor(context, review, contractRevision) {
  const merged = new Map();
  for (const artifact of context.task.artifacts || []) {
    if (artifact.relation !== 'output') continue;
    const relativePath = artifactPath(context.cwd, artifact.path || artifact.relativePath);
    if (relativePath && !merged.has(relativePath)) merged.set(relativePath, { name: artifact.name || basename(relativePath), relativePath });
  }
  for (const artifact of review?.registeredDeliveries || []) {
    const relativePath = artifactPath(context.cwd, artifact.relativePath);
    if (relativePath && !merged.has(relativePath)) merged.set(relativePath, { name: artifact.name || basename(relativePath), relativePath });
  }
  return Promise.all([...merged.values()].map(async artifact => {
    const id = hash({ taskId: context.task.id, relativePath: artifact.relativePath }).slice(0, 24);
    const delivery = { id, ...artifact, path: join(context.cwd, artifact.relativePath), kind: 'unsupported', version: null, revision: null, approved: false, available: false };
    try {
      Object.assign(delivery, await fileVersion(context.cwd, artifact.relativePath));
      delivery.available = true;
      delivery.revision = hash({ id, version: delivery.version, contractRevision });
      const approval = own(review?.approvals, id);
      delivery.approved = !!(approval && Number.isFinite(approval.approvedAt) && approval.version === delivery.version && approval.contractRevision === contractRevision && approval.revision === delivery.revision);
    } catch (error) { delivery.unavailableReason = error.message; }
    return delivery;
  }));
}
function executionFor(state, context) {
  const candidates = (state.taskConversations || []).filter(entry => entry.taskId === context.task.id && entry.cwd === context.cwd && entry.intent === 'execution' && entry.submitted === true && entry.sessionId).map(entry => ({ sessionId: entry.sessionId, at: entry.submittedAt || entry.createdAt || 0 }));
  for (const project of state.projects || []) {
    if (project.id !== context.project.id) continue;
    for (const run of project.runs || []) for (const task of run.tasks || []) if (task.id === context.task.id && task.submitted === true && task.sessionId) candidates.push({ sessionId: task.sessionId, at: task.submittedAt || run.createdAt || 0 });
  }
  candidates.sort((a, b) => b.at - a.at || a.sessionId.localeCompare(b.sessionId));
  return { hasExecution: candidates.length > 0, executionSessionId: candidates[0]?.sessionId || null };
}
function reviewFor(state, context, create = false) {
  let review = own(state.taskReviews, context.task.id);
  if (review && (review.cwd !== context.cwd || review.projectId !== context.project.id)) {
    if (create) throw new Error('任务审阅记录与原任务目录不匹配');
    return undefined;
  }
  if (!review && create) {
    state.taskReviews ||= {};
    review = { cwd: context.cwd, projectId: context.project.id, registeredDeliveries: [], approvals: {} };
    Object.defineProperty(state.taskReviews, context.task.id, { value: review, enumerable: true, writable: true, configurable: true });
  }
  return review;
}
function frozen(state, context, index) {
  if (taskStatus(index) === 'running' || state.projects.some(project => project.runs?.some(run => run.state !== 'complete' && (run.tasks?.some(task => task.id === context.task.id) || run.snapshots?.some(task => task.id === context.task.id))))) throw new Error('任务正在执行或所属 run 未完成，不能修改冻结的执行依据');
}
function editContract(index, contract) {
  const newline = index.includes('\r\n') ? '\r\n' : '\n';
  let result = index;
  for (const [name, body] of [['目标', contract.goal], ['预期交付物', contract.deliverables.map(value => '- ' + value).join('\n')], ['验收要求', contract.acceptance]]) {
    const all = headings(result), positions = all.filter(heading => heading.level === 2 && heading.name === name);
    if (positions.length > 1) throw new Error(`任务中存在多个“${name}”段落，请先核对原文`);
    const value = body.replace(/\n/g, newline);
    if (!positions.length) { result += `${result.endsWith(newline + newline) ? '' : result.endsWith(newline) ? newline : newline + newline}## ${name}${newline}${value}${newline}`; continue; }
    const heading = positions[0], end = all.find(item => item.start > heading.start && item.level <= 2)?.start ?? result.length;
    // Authorization embedded in an old contract stays verbatim under its own nested heading.
    const protectedPart = protectedRegion(result, heading, end, all);
    const marker = protectedPart.inline ? `### 既有授权与历史（原文保留）${newline}` : '';
    result = result.slice(0, heading.body) + value + newline + newline + marker + result.slice(protectedPart.start);
  }
  return result;
}
function supplement(prompt, contract, id) {
  const original = prompt || '', newline = original.includes('\r\n') ? '\r\n' : '\n';
  const block = `<!-- goal-first:contract ${id} -->\n## 任务目标确认补充\n\n以下为本次用户确认的当前任务契约；执行授权仍以原始授权入口为准。\n\n### 当前目标\n${contract.goal}\n\n### 当前预期交付物\n${contract.deliverables.map(value => '- ' + value).join('\n')}\n\n### 当前验收要求\n${contract.acceptance}\n<!-- /goal-first:contract -->\n`;
  return original + (original.endsWith(newline + newline) ? '' : original.endsWith(newline) ? newline : newline + newline) + block.replace(/\n/g, newline);
}

/** Uses the same Store queue/lease as project operations. No shadow task status is persisted. */
export class TaskWorkflow {
  constructor(store, { resolveTask } = {}) {
    if (!store?.transaction || typeof resolveTask !== 'function') throw new Error('TaskWorkflow 需要 ProjectStore 与 resolveTask');
    this.store = store; this.resolveTask = resolveTask;
  }
  async snapshot(info) {
    await this.store.ready;
    return this.readSnapshot(await contextFor(info), this.store.state);
  }
  async readSnapshot(context, state, source) {
    source ||= await documents(context);
    const revision = hash(source), contract = currentContract(context.task, source), contractRevision = contractHash(contract);
    const review = reviewFor(state, context), evidence = review?.agreement;
    const witnessed = !!(evidence && evidence.confirmed === true && evidence.proposalId && Number.isFinite(evidence.confirmedAt) && evidence.contractRevision);
    const agreement = { ...(evidence ? structuredClone(evidence) : {}), confirmed: witnessed && evidence.contractRevision === contractRevision, stale: witnessed && evidence.contractRevision !== contractRevision };
    const proposal = review?.proposal ? structuredClone(review.proposal) : null;
    if (proposal) proposal.stale = proposal.status === 'confirmed' ? proposal.contractRevision !== contractRevision : proposal.baseRevision !== revision;
    return { revision, contractRevision, summary: thinNavigation(source.index)?.text || contract.goal, contract, agreement, proposal, deliveries: await deliveriesFor(context, review, contractRevision), ...executionFor(state, context) };
  }
  async propose(taskId, input = {}) {
    validId(taskId, '任务标识');
    const contract = proposalContract(input);
    await this.store.transaction(async state => {
      const context = await contextFor(await this.resolveTask(taskId));
      const binding = this.store.forSession(input.sessionId);
      if (!binding || binding.taskId !== taskId || binding.cwd !== context.cwd || binding.intent !== 'alignment') throw new Error('草案只能由当前任务目录的 alignment 目标对齐会话提交');
      const snapshot = await this.readSnapshot(context, state);
      baseline(snapshot.revision, input.baseRevision);
      const review = reviewFor(state, context, true);
      review.proposal = { id: randomUUID(), baseRevision: snapshot.revision, ...contract, sessionId: input.sessionId, createdAt: Date.now(), status: 'proposed' };
      return context.project.id;
    }, false);
    return this.snapshot(await this.resolveTask(taskId));
  }
  /** User-only confirmation; calling this never creates a session, prompt, plan or execution grant. */
  async confirm(taskId, { proposalId, baseRevision } = {}) {
    validId(taskId, '任务标识'); validId(proposalId, '提案标识');
    let context, edits = [], backups = [], evidence;
    const savedStateFile = this.store.stateFile;
    try {
      await this.store.transaction(async state => {
        context = await contextFor(await this.resolveTask(taskId));
        const source = await documents(context), snapshot = await this.readSnapshot(context, state, source);
        baseline(snapshot.revision, baseRevision);
        const review = reviewFor(state, context), proposal = review?.proposal;
        if (!proposal || proposal.id !== proposalId || proposal.status !== 'proposed') throw new Error('目标草案已变化，请审阅当前提案');
        baseline(snapshot.revision, proposal.baseRevision);
        frozen(state, context, source.index);
        const contract = proposalContract(proposal), summary = thinNavigation(source.index);
        const nextIndex = summary ? editSummary(source.index, summary, contract.goal) : editContract(source.index, contract);
        const nextPrompt = supplement(source.prompt, contract, proposal.id);
        if ([nextIndex, nextPrompt].some(value => Buffer.byteLength(value) > DOCUMENT_LIMIT)) throw new Error('确认补充将超过原文件文本读取限制，请先整理任务材料');
        if (contractHash(currentContract({}, { index: nextIndex, prompt: nextPrompt })) !== contractHash(contract)) throw new Error('草案内容不能安全写入任务段落，请先核对 Markdown 标题结构');
        edits = [{ name: 'index.md', before: source.index, after: nextIndex }, { name: 'PROMPT.md', before: source.prompt, after: nextPrompt }];
        for (const edit of edits) {
          if (edit.before === null) continue;
          const path = join(context.cwd, `${edit.name}.${randomUUID()}.goal-first-backup`);
          await writeFile(path, edit.before, { flag: 'wx', mode: 0o600 });
          backups.push({ path, info: await lstat(path) });
        }
        baseline(hash(await documents(context)), snapshot.revision);
        for (const edit of edits) {
          if (await document(context.cwd, edit.name, edit.before === null) !== edit.before) throw conflict();
          edit.attempted = true;
          await atomicWrite(join(context.cwd, edit.name), edit.after);
        }
        evidence = { confirmed: true, proposalId, contractRevision: contractHash(contract), confirmedAt: Date.now(), sessionId: proposal.sessionId };
        if (summary) {
          review.contractHistory ||= [];
          review.contractHistory.push({ contract: snapshot.contract, summary: summary.text, contractRevision: snapshot.contractRevision, supersededAt: evidence.confirmedAt, proposalId });
        }
        review.agreement = evidence;
        review.proposal = { ...proposal, status: 'confirmed', contractRevision: evidence.contractRevision, confirmedAt: evidence.confirmedAt };
        return context.project.id;
      }, false);
    } catch (cause) {
      if (!edits.some(edit => edit.attempted)) { await this.cleanBackups(context, backups); throw cause; }
      let persisted = false;
      try { persisted = JSON.parse(await readFile(savedStateFile, 'utf8')).taskReviews?.[taskId]?.agreement?.proposalId === proposalId; } catch { /* Do not assume a cross-file commit. */ }
      if (persisted) {
        const error = new Error('确认资料已写入，但保存事务报告失败；原始材料备份已保留，请刷新核对后再操作', { cause });
        error.code = 'TASK_WORKFLOW_PARTIAL_WRITE'; error.backups = backups.map(item => item.path); throw error;
      }
      const errors = [];
      for (const edit of edits.filter(item => item.attempted).reverse()) {
        try {
          const current = await document(context.cwd, edit.name, true);
          if (current === edit.before) continue;
          if (current !== edit.after) throw new Error(`${edit.name} 已被其他操作更改，保留原文备份并停止恢复`);
          const path = join(context.cwd, edit.name);
          if (await safePath(context.cwd, path) !== path || !isAbsolute(path) || dirname(path) !== context.cwd) throw new Error('恢复位置已变化');
          if (edit.before === null) await unlink(path);
          else await atomicWrite(path, edit.before);
        } catch (error) { errors.push(error.message); }
      }
      if (!errors.length) await this.cleanBackups(context, backups);
      const error = new Error(errors.length ? `目标确认保存失败，部分文件不能恢复；原始材料备份已保留：${errors.join('；')}` : '目标确认保存失败，原始任务材料已恢复；未完成确认', { cause });
      error.code = errors.length ? 'TASK_WORKFLOW_PARTIAL_WRITE' : 'TASK_WORKFLOW_CONFIRM_FAILED';
      error.backups = errors.length ? backups.map(item => item.path) : [];
      throw error;
    }
    const warnings = await this.cleanBackups(context, backups);
    const snapshot = await this.snapshot(await this.resolveTask(taskId));
    return warnings.length ? { ...snapshot, warnings } : snapshot;
  }
  async cleanBackups(context, backups) {
    const warnings = [];
    for (const backup of backups) {
      try {
        if (!context || !isAbsolute(backup.path) || dirname(backup.path) !== context.cwd || !backup.path.endsWith('.goal-first-backup') || await safePath(context.cwd, backup.path) !== backup.path || !sameFile(backup.info, await lstat(backup.path))) throw new Error('原始材料备份位置或内容已变化');
        await unlink(backup.path);
      } catch (error) { warnings.push(`保留原始材料备份 ${backup.path}：${error.message}`); }
    }
    return warnings;
  }
  async registerDelivery(taskId, { path, baseRevision } = {}) {
    validId(taskId, '任务标识');
    await this.store.transaction(async state => {
      const context = await contextFor(await this.resolveTask(taskId)), snapshot = await this.readSnapshot(context, state);
      baseline(snapshot.revision, baseRevision);
      // This call is deliberately first: the existing task-file syntax/link boundary is authoritative.
      await readTaskFile(context.cwd, path);
      const file = await fileVersion(context.cwd, path);
      const relativePath = relative(context.cwd, file.path).split(sep).join('/');
      const review = reviewFor(state, context, true);
      review.registeredDeliveries ||= [];
      if (!review.registeredDeliveries.some(item => item.relativePath === relativePath)) {
        if (review.registeredDeliveries.length >= DELIVERY_LIMIT) throw new Error('当前任务显式交付物已达上限');
        review.registeredDeliveries.push({ relativePath, name: basename(relativePath), createdAt: Date.now() });
      }
      return context.project.id;
    }, false);
    return this.snapshot(await this.resolveTask(taskId));
  }
  /** User-only file approval: a status change never counts as approval. */
  async approve(taskId, { artifactId, revision } = {}) {
    validId(taskId, '任务标识'); validId(artifactId, '交付物标识');
    await this.store.transaction(async state => {
      const context = await contextFor(await this.resolveTask(taskId)), source = await documents(context);
      if (taskStatus(source.index) === 'running') throw new Error('任务仍在执行（status: running），请结束执行后再认可交付文件');
      const snapshot = await this.readSnapshot(context, state, source);
      const artifact = snapshot.deliveries.find(item => item.id === artifactId);
      if (!artifact?.available || !artifact.version) throw new Error('交付文件不可读取，不能记录认可');
      baseline(artifact.revision, revision);
      const review = reviewFor(state, context, true);
      review.approvals ||= {};
      review.approvals[artifactId] = { version: artifact.version, revision: artifact.revision, contractRevision: snapshot.contractRevision, approvedAt: Date.now() };
      return context.project.id;
    }, false);
    return this.snapshot(await this.resolveTask(taskId));
  }
}
