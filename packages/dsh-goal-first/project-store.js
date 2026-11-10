/** Durable project identity, reviewed plan revisions and human execution grants.
 * Task status lives only in each task's Markdown index. */
import { mkdir, readFile, writeFile, rename, rm, realpath, stat, access, open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, isAbsolute, relative, sep, resolve } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID, createHash } from 'node:crypto';
import { safePath, readTaskArtifacts } from './lib/records.js';

const clone = value => structuredClone(value);
const statuses = new Set(['pending', 'running', 'review', 'done', 'blocked']);
const inside = (root, path) => { const r = relative(root, path); return !r.startsWith(`..${sep}`) && r !== '..' && !isAbsolute(r); };
function text(value, label, max = 20000) {
  if (typeof value !== 'string' || value.length > max || value.includes('\0')) throw new Error(`${label}必须是有效文本（最多 ${max} 字符）`);
  return value.trim();
}
const heading = value => text(value, '名称', 180).replace(/[\r\n]+/g, ' ').replace(/^#+\s*/, '') || '新项目';
const section = (source, name) => source.match(new RegExp(`^## ${name}\\r?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'))?.[1]?.trim() || '';
const bullets = values => values.map(value => `- ${value}`).join('\n');
function strings(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100) throw new Error(`${label}必须为数组，最多 100 项`);
  return value.map(item => text(item, label, 4000)).filter(Boolean);
}
export async function atomicWrite(path, body) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, body, { flag: 'wx', mode: 0o600 }); await rename(temporary, path); }
  finally { await rm(temporary, { force: true }); }
}
async function document(root, path) {
  const actual = await safePath(root, path);
  if ((await stat(actual)).size > 1024 * 1024) throw new Error('资料超过 1 MB，请拆分后读取');
  return readFile(actual, 'utf8');
}
async function ensureDirectory(root, path) {
  if (!inside(root, path)) throw new Error('Path escapes authorized Goal root');
  let current = root;
  for (const part of relative(root, path).split(sep).filter(Boolean)) {
    current = join(current, part);
    try { if (await safePath(root, current) !== current) throw new Error('项目写入目录不能通过符号链接重定向'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; await mkdir(current); await safePath(root, current); }
  }
  return current;
}
function summary(source) {
  return { title: source.match(/^#\s+(.+)$/m)?.[1]?.trim() || '新项目', goal: section(source, '目标'), notes: section(source, '讨论结论') };
}

const reviewToken = (info,tasks) => createHash('sha256').update(JSON.stringify({ info, tasks: tasks.map(({status,results,...task}) => task) })).digest('hex');

export class ProjectStore {
  constructor(config = {}) {
    this.stateFile = config.stateFile || join(config.sourcesFile ? dirname(config.sourcesFile) : join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'goal-first'), 'projects.json');
    this.state = { version: 1, projects: [] };
    this.queue = Promise.resolve(); this.listeners = new Set();
    this.ready = this.reload();
  }
  async reload() {
    let value;
    try { value = JSON.parse(await readFile(this.stateFile, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return; throw new Error(`项目关联文件无法读取：${error.message}`); }
    if (value.version !== 1 || !Array.isArray(value.projects)) throw new Error('不支持的项目关联文件');
    const ids = new Set(); const sessions = new Set();
    for (const p of value.projects) {
      if (!p.id || ids.has(p.id) || !isAbsolute(p.root || '') || !inside(p.root, p.path || '') || !Number.isInteger(p.revision) || !['aligning', 'review'].includes(p.phase) || !Array.isArray(p.runs) || !Array.isArray(p.planHistory)) throw new Error('项目关联文件结构错误');
      ids.add(p.id);
      for (const id of [p.sessionId, ...p.runs.flatMap(run => run.tasks.map(task => task.sessionId))].filter(Boolean)) {
        if (sessions.has(id)) throw new Error('项目会话关联重复'); sessions.add(id);
      }
    }
    if (value.taskConversations !== undefined && (!Array.isArray(value.taskConversations) || value.taskConversations.length > 10000)) throw new Error('任务会话关联结构错误');
    const requests = new Set();
    for (const entry of value.taskConversations || []) {
      if (!entry.sessionId || sessions.has(entry.sessionId) || !entry.taskId || !entry.projectId || !entry.requestId || requests.has(entry.requestId) || !isAbsolute(entry.cwd || '') || !['conversation','execution-draft','execution','alignment'].includes(entry.intent)) throw new Error('任务会话关联结构错误');
      if (entry.intent === 'execution' && (typeof entry.executionPrompt !== 'string' || !entry.executionPrompt || entry.executionPrompt.length > 600000)) throw new Error('任务执行快照无效');
      sessions.add(entry.sessionId); requests.add(entry.requestId);
    }
    this.state = value;
  }
  onChange(callback) { this.listeners.add(callback); return () => this.listeners.delete(callback); }
  notify(id) { for (const fn of this.listeners) { try { fn({ projectId: id }); } catch { /* Observers do not own the commit. */ } } }
  metadata(id) { const row = this.state.projects.find(p => p.id === id); if (!row) throw new Error('项目不存在，请刷新'); return row; }
  forSession(sessionId) {
    for (const project of this.state.projects) {
      if (project.sessionId === sessionId) return { projectId: project.id, role: 'discussion' };
      for (const run of project.runs) for (const task of run.tasks) if (task.sessionId === sessionId) return { projectId: project.id, role: 'task', runId: run.id, taskId: task.id };
    }
    const entry = this.state.taskConversations?.find(item => item.sessionId === sessionId);
    if (entry) return { ...clone(entry), role: 'task-conversation' };
  }
  async reserveTaskConversation({ taskId, projectId, cwd, title, intent, requestId, executionPrompt }) {
    if (!taskId || !projectId || !isAbsolute(cwd || '') || !['conversation','execution-draft','execution','alignment'].includes(intent)) throw new Error('任务会话参数无效');
    if (intent === 'execution') executionPrompt = text(executionPrompt,'执行快照',600000);
    requestId = text(requestId, '请求标识', 128); if (!requestId) throw new Error('需要请求标识');
    await this.transaction(state => {
      const entries = state.taskConversations ||= [];
      const previous = entries.find(entry => entry.requestId === requestId);
      if (previous) {
        if (previous.taskId !== taskId || previous.projectId !== projectId || previous.cwd !== cwd || previous.intent !== intent) throw new Error('请求与原任务会话关联冲突');
      } else {
        if (entries.length >= 10000) throw new Error('任务会话关联已达上限');
        entries.push({ taskId, projectId, cwd, title: heading(title), intent, requestId, sessionId: randomUUID(), createdAt: Date.now(), ...(intent === 'execution' ? { executionPrompt, submitted: false, submissionAttempted: false } : {}) });
      }
      return projectId;
    }, false);
    return clone(this.state.taskConversations.find(entry => entry.requestId === requestId));
  }
  async markTaskExecutionSubmitting(sessionId) {
    return this.transaction(state => {
      const entry = state.taskConversations?.find(item => item.sessionId === sessionId && item.intent === 'execution');
      if (!entry) throw new Error('执行会话不存在'); entry.submissionAttempted = true; return entry.projectId;
    }, false);
  }
  async markTaskExecutionSubmitted(sessionId) {
    return this.transaction(state => {
      const entry=state.taskConversations?.find(e=>e.sessionId===sessionId && e.intent==='execution');
      if(!entry) throw new Error('执行会话不存在');entry.submitted=true;entry.submittedAt=Date.now();return entry.projectId;
    },false);
  }
  async transaction(operation, projectResult = true) {
    await this.ready;
    const job = this.queue.then(async () => {
      await mkdir(dirname(this.stateFile), { recursive: true, mode: 0o700 });
      const lockPath = `${this.stateFile}.lock`;
      let lock;
      try { lock = await open(lockPath, 'wx', 0o600); }
      catch (error) {
        if (error.code !== 'EEXIST') throw error;
        // Recovery is a single action guarded separately; never steal a live lease.
        let recovery;
        try { recovery = await open(lockPath + '.recovery', 'wx', 0o600); }
        catch { throw new Error('另一个项目操作正在保存或恢复，请稍后重试'); }
        try {
          const previous = await readFile(lockPath, 'utf8');
          const owner = JSON.parse(previous);
          if (!Number.isSafeInteger(owner.pid) || owner.pid <= 0) throw new Error('项目保存锁无法核实，请检查运行记录');
          let dead = false;
          try { process.kill(owner.pid, 0); } catch (e) { if (e.code === 'ESRCH') dead = true; }
          if (!dead) throw new Error('另一个项目操作正在保存，请稍后重试');
          if (await readFile(lockPath, 'utf8') !== previous) throw new Error('项目保存锁已变化，请重试');
          await rm(lockPath); lock = await open(lockPath, 'wx', 0o600);
        } finally { await recovery.close(); await rm(lockPath + '.recovery', { force: true }); }
      }
      try {
        await lock.writeFile(JSON.stringify({ pid: process.pid }));
        await this.reload();
        const next = clone(this.state);
        const id = await operation(next);
        await atomicWrite(this.stateFile, `${JSON.stringify(next, null, 2)}\n`);
        this.state = next; this.notify(id);
        return projectResult ? this.view(id) : id;
      } finally { await lock.close(); await rm(lockPath, { force: true }); }
    });
    this.queue = job.catch(() => {});
    return job;
  }
  async change(id, revision, operation, duplicateRequestId, validateDuplicate) {
    return this.transaction(async state => {
      const row = state.projects.find(p => p.id === id);
      if (!row) throw new Error('项目不存在');
      const duplicate = duplicateRequestId && row.runs.find(run => run.requestId === duplicateRequestId);
      if (duplicate) { validateDuplicate?.(duplicate); return id; }
      if (revision !== undefined && row.revision !== revision) throw new Error('项目版本已变化，请刷新后重试（revision conflict）');
      if (await safePath(row.root, row.path) !== row.path) throw new Error('项目目录范围已变化，请核对原资料位置');
      await operation(row);
      row.revision++; row.updatedAt = Date.now();
      return id;
    });
  }
  async create({ root, sessionId = randomUUID(), parentId = null, existing = null }) {
    const actualRoot = await realpath(root);
    if (!isAbsolute(root) || actualRoot !== resolve(root)) throw new Error('已保存的默认目录位置发生变化，请在资料来源中重新选择');
    await access(actualRoot, constants.W_OK);
    return this.transaction(async state => {
      if (existing) {
        const found = state.projects.find(p => p.path === existing.path);
        if (found) return found.id;
      }
      if (state.projects.some(p => p.sessionId === sessionId)) throw new Error('会话已经关联到项目');
      const parent = parentId ? state.projects.find(p => p.id === parentId) : null;
      if (parentId && !parent) throw new Error('父项目不存在');
      if (parent && parent.root !== actualRoot) throw new Error('子项目必须使用父项目的资料目录');
      const id = existing?.id || randomUUID();
      if (await realpath(root) !== actualRoot) throw new Error('默认目录位置发生变化，请重新选择');
      if (parent && await safePath(parent.root, parent.path) !== parent.path) throw new Error('父项目目录范围已变化');
      const base = parent ? join(parent.path, 'subprojects') : actualRoot;
      await ensureDirectory(parent ? parent.path : actualRoot, base);
      const path = existing ? await safePath(actualRoot, existing.path) : join(base, `project-${id}`);
      if (!existing) await mkdir(path);
      const row = { id, root: actualRoot, path, parentId: existing?.parentId || parentId, sessionId, visible: !!existing, legacy: !!existing, document: existing ? '.goal-first/goal.md' : 'index.md', phase: 'aligning', revision: 0, plan: null, planHistory: [], runs: [], createdAt: Date.now(), updatedAt: Date.now() };
      if (!existing) await atomicWrite(join(path, 'index.md'), '# 新项目\n\n## 目标\n待讨论\n\n## 讨论结论\n\n');
      state.projects.push(row); return id;
    });
  }
  async goalDocument(row) {
    try { return await document(row.path, join(row.path, row.document)); }
    catch (error) { if (!row.legacy || error.code !== 'ENOENT') throw error; return document(row.root, join(row.path, 'index.md')); }
  }
  async activate(id, firstMessage) {
    await this.ready;
    if (this.metadata(id).visible) return this.view(id);
    return this.change(id, undefined, async row => {
      if (row.visible) return;
      const title = heading(text(firstMessage, '首条消息', 100000).split('\n')[0].slice(0, 64));
      if (!row.legacy) await atomicWrite(join(row.path, row.document), `# ${title}\n\n## 目标\n待讨论\n\n## 讨论结论\n\n`);
      row.visible = true;
    });
  }
  async update(id, changes, revision) {
    return this.change(id, revision, async row => {
      const current = summary(await this.goalDocument(row));
      const next = { title: changes.title === undefined ? current.title : heading(changes.title), goal: changes.goal === undefined ? current.goal : text(changes.goal, '目标'), notes: changes.notes === undefined ? current.notes : text(changes.notes, '讨论结论', 60000) };
      const folder = dirname(join(row.path, row.document));
      await ensureDirectory(row.path, folder);
      const target = join(row.path, row.document);
      try { await safePath(row.path, target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      await atomicWrite(target, `# ${next.title}\n\n## 目标\n${next.goal}\n\n## 讨论结论\n${next.notes}\n\n`);
    });
  }
  async transition(id, phase, revision) {
    if (!['aligning', 'review'].includes(phase)) throw new Error('无效的讨论阶段');
    return this.change(id, revision, row => { row.phase = phase; if (phase === 'aligning') delete row.reviewRequest; });
  }
  async beginReview(id, revision) {
    await this.ready;
    if (this.metadata(id).phase === 'review' && this.metadata(id).reviewRequest?.fromRevision === revision) return this.view(id);
    return this.change(id, revision, row => {
      row.phase = 'review'; row.reviewRequest = { id: randomUUID(), fromRevision: revision };
    });
  }
  async savePlan(id, input, revision) {
    return this.change(id, revision, async row => {
      if (row.phase !== 'review') throw new Error('仍处于目标对齐，请先结束本轮目标对齐再生成任务（review）');
      if (row.runs.some(run => run.state !== 'complete')) throw new Error('已授权阶段仍在执行，先保留新想法，不能覆盖执行依据');
      const title = text(input.summary, '任务结论', 40000);
      if (!Array.isArray(input.tasks) || input.tasks.length < 1 || input.tasks.length > 60) throw new Error('任务草案需要 1–60 项任务');
      const tasks = input.tasks.map((task, i) => ({ code: task.code || `T${i + 1}`, title: heading(task.title), goal: text(task.goal, '任务目标'), stage: task.stage, deliverables: strings(task.deliverables, '交付物'), acceptance: text(task.acceptance, '验收要求'), dependencies: strings(task.dependencies, '依赖'), references: strings(task.references, '资料引用') }));
      const codes = new Map();
      for (const task of tasks) {
        if (!/^T[1-9]\d*$/.test(task.code) || codes.has(task.code)) throw new Error('任务编号必须唯一且形如 T1');
        if (!Number.isSafeInteger(task.stage) || task.stage < 1 || task.stage > 30) throw new Error('任务阶段必须为 1–30 的整数');
        if (!task.goal || !task.acceptance || !task.deliverables.length) throw new Error('每个任务都需要目标、交付物和验收要求');
        codes.set(task.code, task);
      }
      const visited = new Set(); const visiting = new Set();
      const visit = task => { if (visiting.has(task.code)) throw new Error('任务依赖存在循环'); if (visited.has(task.code)) return; visiting.add(task.code); for (const code of task.dependencies) { const dep = codes.get(code); if (!dep || dep.stage > task.stage) throw new Error('依赖必须来自本阶段或前置阶段'); visit(dep); } visiting.delete(task.code); visited.add(task.code); };
      for (const task of tasks) {
        visit(task);
        for (const ref of task.references) {
          if (/^https?:\/\//i.test(ref)) { new URL(ref); continue; }
          await safePath(row.root, isAbsolute(ref) ? ref : join(row.path, ref));
        }
      }
      const version = randomUUID();
      const plans = join(row.path, '.goal-first', 'plans');
      await ensureDirectory(row.path, plans);
      const destination = join(plans, version); await mkdir(destination);
      const records = [];
      for (const task of tasks) {
        const taskId = randomUUID(); const path = join(destination, 'tasks', taskId); await mkdir(path, { recursive: true });
        const refs = task.references.map((ref, i) => `- [资料 ${i + 1}](${ref})`).join('\n');
        await atomicWrite(join(path, 'index.md'), `---\nstatus: pending\n---\n# ${task.title}\n\n## 目标\n${task.goal}\n\n## 预期交付物\n${bullets(task.deliverables)}\n\n## 验收要求\n${task.acceptance}\n\n## 依赖\n${bullets(task.dependencies)}\n\n## 参考材料\n${refs}\n`);
        await atomicWrite(join(path, 'PROMPT.md'), `# ${task.title}\n\n本任务只在用户明确选择所属阶段后执行。\n\n目标：${task.goal}\n\n交付物：\n${bullets(task.deliverables)}\n\n验收要求：${task.acceptance}\n\n任务入口：[index.md](index.md)\n`);
        records.push({ id: taskId, code: task.code, stage: task.stage, dependencies: task.dependencies, path });
      }
      await atomicWrite(join(destination, 'plan.md'), `# 任务草案\n\n${title}\n\n${tasks.map((task, i) => `- 阶段 ${task.stage} · ${task.code} [${task.title}](tasks/${records[i].id}/index.md)`).join('\n')}\n`);
      if (row.plan) row.planHistory.push(row.plan);
      row.plan = { version, path: destination, tasks: records }; row.visible = true;
    });
  }
  async taskView(row, task) {
    const indexPath = join(task.path, 'index.md'); const source = await document(row.path, indexPath);
    const prompt = await document(row.path, join(task.path, 'PROMPT.md'));
    const frontmatter = source.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)?.[1];
    const fields = frontmatter?.split(/\r?\n/).filter(line => /^status\s*:/.test(line)) || [];
    const value = fields.length === 1 ? fields[0].match(/^status:[ \t]*([a-z]+)[ \t]*$/)?.[1] : undefined;
    const instructions = { index: source, prompt };
    const instructionHash = createHash('sha256').update(JSON.stringify(instructions)).digest('hex');
    return { ...task, indexPath, instructions, instructionHash, artifacts: await readTaskArtifacts(row.root, indexPath, source, new Set()), title: summary(source).title, goal: section(source, '目标'), acceptance: section(source, '验收要求'), deliverables: section(source, '预期交付物').split('\n').map(v => v.replace(/^[-*]\s*/, '')).filter(Boolean), references: section(source, '参考材料'), results: section(source, '执行结果'), status: statuses.has(value) ? value : 'unknown' };
  }

  async view(id) {
    await this.ready; const row = clone(this.metadata(id));
    if (await safePath(row.root, row.path) !== row.path) throw new Error('项目目录范围已变化，请核对原资料位置');
    const info = summary(await this.goalDocument(row));
    const tasks = await Promise.all((row.plan?.tasks || []).map(task => this.taskView(row, task)));
    const planText = row.plan ? await document(row.root, join(row.plan.path, 'plan.md')) : '';
    return { ...row, ...info, tasks, planText, reviewToken: reviewToken(info,tasks) };
  }
  async list() {
    await this.ready;
    return Promise.all(this.state.projects.filter(p => p.visible).map(async p => {
      try { return await this.view(p.id); } catch (error) { return { ...clone(p), title: '资料暂不可用', unavailable: error.message, tasks: [] }; }
    }));
  }
  async grantTask(id, taskId, revision, requestId, expectedContent) {
    const p=await this.view(id), task=p.tasks.find(t=>t.id===taskId);if(!task)throw new Error('任务已变化，请刷新');
    return this.grantStage(id,task.stage,revision,requestId,expectedContent,taskId);
  }
  async grantStage(id, stage, revision, requestId, expectedContent, selectedTaskId) {
    text(requestId, '请求标识', 128);
    if (!requestId) throw new Error('需要请求标识');
    await this.ready;
    const validateDuplicate=previous=>{if(previous.stage!==stage || (selectedTaskId ? previous.scope!=='task' || previous.tasks[0]?.id!==selectedTaskId : previous.scope==='task'))throw new Error('请求与原执行范围冲突');};
    const previous=this.metadata(id).runs.find(run=>run.requestId===requestId);
    if (previous) { validateDuplicate(previous); return this.view(id); }
    return this.change(id, revision, async row => {
      if (row.phase !== 'review' || !row.plan) throw new Error('请先结束目标对齐并审阅任务草案');
      if (row.runs.some(run => run.state !== 'complete')) throw new Error('已有授权阶段正在执行，请继续原任务');
      const tasks = await Promise.all(row.plan.tasks.map(task => this.taskView(row, task)));
      if (expectedContent !== undefined && expectedContent !== reviewToken(summary(await this.goalDocument(row)),tasks)) throw new Error('审阅后的资料内容已变化，请刷新并重新审阅');
      if (tasks.some(task => task.stage < stage && task.status !== 'done')) throw new Error('前置阶段尚未完成');
      const selected = tasks.filter(task => task.stage === stage && task.status !== 'done' && (!selectedTaskId || task.id===selectedTaskId));
      if (!selected.length) throw new Error('此阶段没有待执行任务');
      if(selectedTaskId && selected[0].dependencies.some(code=>tasks.find(t=>t.code===code)?.status!=='done'))throw new Error('任务的前置依赖尚未完成');
      const pending = new Map(selected.map(task => [task.code, task])); const ordered = [];
      while (pending.size) {
        const task = [...pending.values()].find(item => item.dependencies.every(dep => !pending.has(dep)));
        if (!task) throw new Error('阶段任务依赖无法排序');
        ordered.push(task); pending.delete(task.code);
      }
      row.runs.push({ id: randomUUID(), requestId, stage, scope: selectedTaskId?'task':'stage', planVersion: row.plan.version, state: 'queued', goalSnapshot: summary(await this.goalDocument(row)).goal, snapshots: ordered.map(task => ({ id: task.id, title: task.title, goal: task.goal, acceptance: task.acceptance, deliverables: task.deliverables, references: task.references, instructionHash: task.instructionHash, instructions: task.instructions })), createdAt: Date.now(), tasks: ordered.map(task => ({ id: task.id, sessionId: randomUUID(), promptRequestId: randomUUID(), submitted: false })) });
    }, requestId, validateDuplicate);
  }
  async updateRun(id, runId, patch) {
    return this.change(id, undefined, row => {
      const run = row.runs.find(item => item.id === runId); if (!run) throw new Error('阶段授权不存在');
      if (patch.model !== undefined && !run.model) run.model = clone(patch.model);
      if (patch.state !== undefined) { if (!['queued', 'running', 'attention', 'complete'].includes(patch.state)) throw new Error('无效启动状态'); run.state = patch.state; }
      if (patch.error !== undefined) run.error = text(patch.error, '启动信息', 8000);
      if (patch.submittedTaskId) { const task = run.tasks.find(item => item.id === patch.submittedTaskId); if (!task) throw new Error('任务不在授权阶段内'); task.submitted = true; }
      if (patch.currentTaskId !== undefined) run.currentTaskId = patch.currentTaskId;
    });
  }
}
