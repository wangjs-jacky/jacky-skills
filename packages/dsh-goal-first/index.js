/** Host entry. Reads authoritative Markdown through owner-only Harness API routes. */
import { dirname, join } from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { readCatalog, parseBoard, digest, safePath, readDocument, goalBoardTaskPrompt } from './lib/records.js';
import { ProjectStore } from './project-store.js';
import { DialogueRuntime } from './dialogue-runtime.js';
import { readSources, sourceRoots, saveSources } from './sources.js';
import { listTaskFiles, readTaskFile } from './task-files.js';
import { taskSessionHistory } from './task-sessions.js';
import { TaskWorkflow } from './task-workflow.js';

const covers = new Map([['视频图文', 'video-stories'], ['期货学习', 'futures-learning'], ['调研方法', 'research-methods']]);
const coverKeys = new Set(covers.values());

export const name = 'goal-first';
export const inject = ['connection', 'tools', 'agents', 'sessionController', 'workspaceRegistry'];

/** A fresh catalog is used for each user action; no timers or task-state writes. */
export async function catalogFor(config = {}) {
  const { roots, warnings } = await sourceRoots(config);
  const entries = [];
  for (const root of roots) {
    try { entries.push(...await readCatalog([root])); }
    catch (error) { warnings.push('无法读取资料来源 ' + root + '：' + error.message); }
  }
  const projects = new Map();
  for (const entry of entries) {
    const projectPath = dirname(dirname(entry.featurePath));
    const projectId = digest(projectPath);
    let project = projects.get(projectId);
    if (!project) {
      project = { id: projectId, title: entry.projectTitle, coverKey: covers.get(entry.projectTitle) || null, path: projectPath, features: [], tasks: [], updatedAt: 0 };
      projects.set(projectId, project);
    }
    try {
      const { snapshot } = await parseBoard(entry);
      const featureId = digest(entry.featurePath);
      const info = await stat(join(entry.featurePath, 'index.md'));
      project.updatedAt = Math.max(project.updatedAt, info.mtimeMs);
      project.features.push({ id: featureId, title: entry.title, path: entry.featurePath, root: entry.root });
      for (const task of snapshot.tasks) project.tasks.push({ ...task, featureId, featureTitle: entry.title, featurePath: entry.featurePath, root: entry.root });
      warnings.push(...snapshot.warnings.map(warning => `${entry.title}: ${warning}`));
    } catch (error) {
      warnings.push(`${entry.title}: ${error.message}`);
    }
  }
  return { roots, projects: [...projects.values()], warnings };
}

/** Resolve only catalogued task identities, never paths supplied by the browser. */
export async function taskFor(config, id, store = new ProjectStore(config)) {
  for (const project of await store.list()) {
    const task = project.tasks.find(item => item.id === id);
    if (task) return { project, task, mode: 'stage' };
  }
  const catalog = await catalogFor(config);
  for (const project of catalog.projects) {
    const task = project.tasks.find(item => item.id === id);
    if (task) return { project, task };
  }
  throw new Error('任务已移动或不可读取，请刷新项目列表。');
}

const json = (value, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'no-store' } });

/** Register routes with Connection so both Electron and Web use owner authentication. */
export function apply(ctx, config = {}) {
  if (config.roots !== undefined && (!Array.isArray(config.roots) || config.roots.some(root => typeof root !== 'string' || !root.trim()))) {
    throw new Error('goal-first.roots must be an array of absolute projects-directory paths');
  }
  const store = new ProjectStore(config);
  const resolveTask = async id => {
    const info = await taskFor(config, id, store);
    return { ...info, cwd: await safePath(info.task.root || info.project.root, dirname(info.task.indexPath)) };
  };
  const workflow = new TaskWorkflow(store, { resolveTask });
  const runtime = ctx.tools && ctx.sessionController ? new DialogueRuntime(ctx, store, { resolveTask, workflow }) : null;
  runtime?.install();
  const register = (path, handler, methods = ['GET']) => ctx.connection.fetch.register({
    path: `/api/goal-first/${path}`, methods, requestBody: 'buffered',
    fetch: async request => {
      try {
        const url = new URL(request.url);
        if (request.method !== 'GET') {
          const origin = request.headers.get('origin');
          let sameOrigin = !origin;
          if (origin) { try { const source = new URL(origin); sameOrigin = ['http:', 'https:'].includes(source.protocol) && source.host === new URL(source.protocol + '//' + (request.headers.get('host') || url.host)).host; } catch { sameOrigin = false; } }
          if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: '跨站请求不可修改项目。' }, 403);
          if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: '需要 JSON 格式。' }, 415);
        }
        return await handler(url, request);
      }
      catch (error) { return json({ error: error.message || 'Goal First 读取失败' }, 400); }
    },
  });
  register('sources', async (url, request) => {
    if (request.method === 'GET') return json(await readSources(config));
    const body = await request.text();
    if (body.length > 70000) return json({ error: '资料来源配置过大。' }, 413);
    return json(await saveSources(config, JSON.parse(body)));
  }, ['GET', 'POST']);
  register('discussion', async url => {
    await store.ready;
    const binding = store.forSession(url.searchParams.get('session'));
    if (!binding) return json({ project: null });
    if (binding.role === 'task-conversation') {
      try { const { project, task } = await resolveTask(binding.taskId); return json({ binding, project, task, parent: null, children: [] }); }
      catch { return json({ binding, project: null, unavailable: '原任务已变化或不可读取' }); }
    }
    const project = await store.view(binding.projectId);
    const all = await store.list();
    const relation = p => ({ id: p.id, title: p.title, sessionId: p.sessionId, unavailable: p.unavailable || null });
    let parent = project.parentId ? all.find(p => p.id === project.parentId) : null;
    if (parent) parent = relation(parent);
    else if (project.parentId) {
      const catalog = await catalogFor(config);
      const old = catalog.projects.find(p => p.id === project.parentId);
      parent = { id: project.parentId, title: old?.title || '父项目当前不可用', sessionId: null };
    }
    return json({ binding, project, parent, children: all.filter(p => p.parentId === project.id).map(relation) });
  });
  register('projects', async (_url, request) => {
    if (!runtime) throw new Error('目标对话需要完整 Harness 宿主');
    await runtime.ready;
    const source = await request.text();
    if (source.length > 70000) return json({ error: '项目请求过大。' }, 413);
    const body = JSON.parse(source);
    let project;
    switch (body.action) {
      case 'create': {
        const settings = await readSources(config);
        const root = body.parentId ? store.metadata(body.parentId).root : settings.defaultRoot;
        if (!root) throw new Error('请先在资料来源中设置新项目默认保存目录');
        project = await store.create({ root, parentId: body.parentId });
        break;
      }
      case 'adopt': {
        const catalog = await catalogFor(config);
        const entry = catalog.projects.flatMap(p => p.features).find(item => item.id === body.id);
        if (!entry) throw new Error('原子项目不在当前资料来源内');
        project = await store.create({ root: entry.root, existing: { id: body.id, path: entry.path, parentId: digest(dirname(dirname(entry.path))) } });
        break;
      }
      case 'open': project = await store.view(body.id); break;
      case 'finish': return json({ project: await runtime.finish(body.id, body.revision) });
      case 'align': return json({ project: await store.transition(body.id, 'aligning', body.revision) });
      case 'stage':
        if (typeof body.reviewToken !== 'string') throw new Error('请先读取并审阅完整任务草案');
        return json({ project: await runtime.startStage(body.id, body.stage, body.revision, body.requestId, body.reviewToken) });
      case 'resume': return json({ project: await runtime.resume(body.id, body.runId) });
      default: throw new Error('未知项目动作');
    }
    await runtime.open(project.id);
    return json({ project, sessionId: project.sessionId });
  }, ['POST']);
  register('events', async (_url, request) => {
    let stop;
    const stream = new ReadableStream({
      start(controller) {
        const send = event => controller.enqueue(new TextEncoder().encode('data: ' + JSON.stringify(event) + '\n\n'));
        send({ connected: true });
        stop = store.onChange(send);
        request.signal.addEventListener('abort', () => { stop(); try { controller.close(); } catch {} }, { once: true });
      },
      cancel() { stop?.(); },
    });
    return new Response(stream, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store', 'x-accel-buffering': 'no' } });
  });
  register('cover', async url => {
    const key = url.searchParams.get('key');
    if (!coverKeys.has(key)) return json({ error: '封面不存在。' }, 404);
    return new Response(await readFile(new URL(`./assets/covers/${key}.png`, import.meta.url)), {
      headers: { 'content-type': 'image/png', 'cache-control': 'private, max-age=86400', 'x-content-type-options': 'nosniff' },
    });
  });
  register('task-review', async (url, request) => {
    if (request.method === 'GET') return json(await workflow.snapshot(await resolveTask(url.searchParams.get('task'))));
    const raw = await request.text(); if (raw.length > 70000) throw new Error('任务约定请求过大');
    const body = JSON.parse(raw); const info = await resolveTask(body.taskId);
    if (['confirm', 'approve'].includes(body.action) && ctx.sessionController) {
      const sessions = await ctx.sessionController.list({}, request.signal);
      const executions = new Set((store.state.taskConversations || []).filter(entry => entry.taskId === body.taskId && entry.intent === 'execution').map(entry => entry.sessionId));
      for (const run of info.project.runs || []) for (const task of run.tasks || []) if (task.id === body.taskId && task.submitted) executions.add(task.sessionId);
      if (sessions.items.some(session => executions.has(session.sessionId) && session.running)) throw new Error('任务正在执行，请结束当前执行后再确认调整或认可交付。');
    }
    if (body.action === 'confirm') return json(await workflow.confirm(body.taskId, { proposalId: body.proposalId, baseRevision: body.baseRevision }));
    if (body.action === 'register') return json(await workflow.registerDelivery(body.taskId, { path: body.path, baseRevision: body.baseRevision }));
    if (body.action === 'approve') return json(await workflow.approve(body.taskId, { artifactId: body.artifactId, revision: body.revision }));
    throw new Error('未知任务约定操作');
  }, ['GET', 'POST']);
  register('catalog', async (url, request) => {
    const catalog = await catalogFor(config);
    const discussions = await store.list();
    const selected = url.searchParams.get('project');
    if (selected && !discussions.some(p => p.id === selected) && store.state.projects.some(p => p.id === selected)) discussions.push(await store.view(selected));
    let summaries = [];
    if (ctx.sessionController) { try { summaries = (await ctx.sessionController.list({}, request.signal)).items; } catch { catalog.warnings.push('暂时无法读取执行会话活动，请打开会话核对。'); } }
    const native = new Map(summaries.map(session => [session.sessionId, session]));
    async function decorate(project, task, mode) {
      try {
        const cwd = await safePath(task.root || project.root, dirname(task.indexPath));
        const review = await workflow.snapshot({ project, task, mode, cwd });
        const executions = (store.state.taskConversations || []).filter(entry => entry.taskId === task.id && entry.intent === 'execution').map(entry => entry.sessionId);
        for (const run of project.runs || []) for (const entry of run.tasks || []) if (entry.id === task.id && entry.submitted) executions.push(entry.sessionId);
        review.executionActive = executions.some(id => native.get(id)?.running === true);
        return { ...task, review };
      } catch (error) { return { ...task, reviewError: error.message }; }
    }
    const legacy = await Promise.all(catalog.projects.map(async project => ({ ...project, tasks: await Promise.all(project.tasks.map(async task => { const { root, ...view } = await decorate(project, task); return view; })) })));
    for (const project of discussions) project.tasks = await Promise.all(project.tasks.map(task => decorate(project, task, 'stage')));
    const plannedTasks = p => p.tasks.map(t => ({ ...t, mode: 'stage', projectId: p.id, expectedDeliverables: t.deliverables, artifacts: t.artifacts || [], acceptanceCriteria: t.acceptance,
      sessionId: p.runs.flatMap(run => run.tasks).find(task => task.id === t.id && task.submitted)?.sessionId || null }));
    const children = p => discussions.filter(child => child.parentId === p.id).map(child => ({ id: child.id, title: child.title }));
    const legacyChildren = legacy.flatMap(parent => parent.features.map(feature => {
      const p = discussions.find(d => d.id === feature.id);
      return { ...feature, ...p, parentId: parent.id, dialogueId: p?.id || null, legacyFeatureId: feature.id, features: p ? children(p) : [],
        tasks: p?.plan ? plannedTasks(p) : parent.tasks.filter(t => t.featureId === feature.id) };
    }));
    const newProjects = discussions.filter(p => !p.legacy).map(p => ({ ...p, dialogueId: p.id, features: children(p), tasks: plannedTasks(p) }));
    return json({ ...catalog, discussions, projects: [...legacy, ...legacyChildren, ...newProjects] });
  });
  register('task', async url => {
    const { project, task, mode, cwd } = await resolveTask(url.searchParams.get('id'));
    if (mode === 'stage') return json({ mode, task, cwd, title: task.title, stage: task.stage, projectId: project.id,
      sessionId: project.runs.flatMap(run => run.tasks).find(item => item.id === task.id && item.submitted)?.sessionId || null });
    const prompt = [
      '这是从 Goal First 项目看板创建的独立任务会话。请先读取 goal-first-ops Skill、任务 index.md 与完整 PROMPT，再按原有目标、授权和验收要求继续。',
      '先复核当前机器上的路径、前置条件和工程指令。创建会话不表示任务已开始或已完成；只在实际任务入口维护状态。',
      `项目：${project.title}`,
      goalBoardTaskPrompt(task, task.featurePath),
      task.expectedDeliverables.length ? `预期交付物：\n${task.expectedDeliverables.map(value => `- ${value}`).join('\n')}` : '任务未单列预期交付物，请从完整任务文档核对，不虚构交付要求。',
    ].join('\n\n');
    return json({ title: task.title, cwd, prompt });
  });
  register('task-sessions', async (url, request) => {
    const info = await resolveTask(url.searchParams.get('task'));
    await store.ready;
    const { items } = await ctx.sessionController.list({}, request.signal);
    return json({ sessions: taskSessionHistory({ taskId: info.task.id, cwd: info.cwd,
      entries: store.state.taskConversations || [], summaries: items,
      runs: store.state.projects.flatMap(project => project.runs || []) }) });
  });
  register('task-conversation', async (_url, request) => {
    if (!runtime) throw new Error('任务对话需要完整 Harness 宿主');
    const raw = await request.text(); if (raw.length > 4096) throw new Error('任务对话请求过大');
    const body = JSON.parse(raw), info = await resolveTask(body.taskId);
    if(!['conversation','execution-draft','alignment',undefined].includes(body.intent))throw new Error('请使用明确的任务执行入口');
    const result = await runtime.createTaskConversation(info, body.intent || 'conversation', body.requestId);
    if (result.intent === 'execution-draft') {
      result.prompt = [
        '这是从 Goal First 看板选择带入执行提示词的独立任务会话。先读取 goal-first-ops Skill、任务 index.md 与完整 PROMPT，复核当前机器路径、原目标、已有授权和验收要求。创建会话不表示任务已开始或完成。',
        `项目：${info.project.title}`, goalBoardTaskPrompt(info.task, info.task.featurePath),
      ].join('\n\n');
    }
    return json(result);
  }, ['POST']);
  register('task-execute',async(_url,request)=>{
    if(!runtime)throw new Error('执行任务需要完整Harness宿主');
    const raw=await request.text();if(raw.length>4096)throw new Error('任务执行请求过大');
    const body=JSON.parse(raw),info=await resolveTask(body.taskId);
    if(info.mode==='stage'){
      if(!Number.isInteger(body.revision)||typeof body.reviewToken!=='string'||!body.reviewToken)throw new Error('请先刷新并审阅任务');
      const p=await runtime.startTask(info.project.id,info.task.id,body.revision,body.requestId,body.reviewToken),run=p.runs.find(r=>r.requestId===body.requestId);
      return json({sessionId:run.tasks[0].sessionId,runId:run.id,intent:'execution'});
    }
    return json(await runtime.executeLegacyTask(info,body.requestId,async()=>{
    const index=await readTaskFile(info.cwd,'index.md');let prompt;
    try{prompt=await readTaskFile(info.cwd,'PROMPT.md')}catch(e){if(e.code!=='ENOENT')throw e;}
    if(index.kind!=='text'||(prompt&&prompt.kind!=='text'))throw new Error('任务说明不可读取，未发送执行请求');
    const frozen=[
      '用户已点击任务卡片上的“执行任务”，授权你现在执行这一个任务。先读取适用技能和工程指令，按以下冻结任务说明完成，不执行其他任务。',
      `项目：${info.project.title}\n任务：${info.task.title}\n任务目录：${info.cwd}`,
      `授权任务快照：${JSON.stringify({index:index.text,prompt:prompt?.text||null})}`,
      `实际执行后在 ${info.cwd}/index.md 记录结果与产物，有证据完成才设status: done，受阻则blocked。不把已发送请求当成任务完成，不把参考资料当成其他任务的授权。`,
    ].join('\n\n');
    return frozen;
    }));
  },['POST']);
  const directoryFor = async id => {
    const { project, task } = await taskFor(config, id, store);
    return safePath(task.root || project.root, dirname(task.indexPath));
  };
  register('task-files', async url => json(await listTaskFiles(await directoryFor(url.searchParams.get('task')), url.searchParams.get('path'))));
  register('task-file', async url => {
    const file = await readTaskFile(await directoryFor(url.searchParams.get('task')), url.searchParams.get('path'));
    if (url.searchParams.get('version') && url.searchParams.get('version') !== file.version) return json({ error: '文件已更新，请刷新后查看当前版本。' }, 409);
    if (url.searchParams.get('raw') === '1') {
      if (file.kind !== 'image') return json({ error: '此文件不提供图片预览' }, 415);
      return new Response(file.data, { headers: { 'content-type': file.contentType, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
    }
    const { data, ...metadata } = file;
    return json(metadata);
  });
  register('artifact', async url => {
    const { task, project } = await taskFor(config, url.searchParams.get('task'), store);
    const root = task.root || project.root;
    const artifact = task.artifacts?.find(item => item.id === url.searchParams.get('id'));
    if (!artifact?.path || !artifact.available) return json({ error: '产物文件不可用，请先核对任务文档中的原始路径。' }, 404);
    const path = await safePath(root, artifact.path);
    if (artifact.kind !== 'text') return json({ error: '此版本支持文本产物预览；其他格式请在任务会话内打开原文件。' }, 415);
    return json({ title: artifact.name, path, text: await readDocument(root, path) });
  });
}
