import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, basename, join, resolve } from 'node:path';
import { apply } from '../index.js';
import { ProjectStore } from '../project-store.js';
import { digest } from '../lib/records.js';

async function fixture(t) {
  const parent=await realpath(tmpdir()),root=await mkdtemp(join(parent,'goal-review-route-'));
  t.after(async()=>{const actual=await realpath(root);assert.equal(dirname(actual),parent);assert.ok(basename(actual).startsWith('goal-review-route-'));assert.equal(actual,resolve(root));await rm(actual,{recursive:true});});
  const library=join(root,'library'),project=join(library,'project'),feature=join(project,'features','feature'),cwd=join(feature,'tasks','01-task');
  await mkdir(cwd,{recursive:true});await writeFile(join(project,'index.md'),'# 测试项目\n');await writeFile(join(feature,'index.md'),'# 测试目标\n\n- [任务](tasks/01-task/index.md)\n');
  const original='---\nstatus: pending\n---\n# 真实任务\n\n## 目标\n原目标\n\n## 预期交付物\n- 真实页面\n\n## 验收要求\n能打开查看。\n\n## 原始授权\n只推进当前任务。\n';
  await writeFile(join(cwd,'index.md'),original);await writeFile(join(cwd,'PROMPT.md'),'# 任务依据\n\n用户原始范围保留。\n');await writeFile(join(cwd,'result.html'),'<h1>第一版</h1>');
  const config={roots:[library],sourcesFile:join(root,'sources.json'),stateFile:join(root,'state.json')};
  const store=new ProjectStore(config);await store.ready;const taskId=digest(join(cwd,'index.md')),projectId=digest(project);
  const alignment=await store.reserveTaskConversation({taskId,projectId,cwd,title:'对齐测试',intent:'alignment',requestId:'align'});
  return {root,library,project,feature,cwd,original,config,store,taskId,projectId,alignment};
}
function mount(f,items=[]) {
  const routes=new Map(),tools=new Map(),activation=[];
  const forbidden=name=>()=>{activation.push(name);throw new Error('Unexpected Agent activation '+name);};
  apply({connection:{fetch:{register(route){routes.set(route.path,route);return()=>{};}}},tools:{register(tool){tools.set(tool.name,tool);return()=>{};}},on(){return()=>{};},logger:{warn(){}},agents:{get:forbidden('getAgent')},workspaceRegistry:{create:forbidden('workspace')},sessionController:{async list(){return {items};},create:forbidden('create'),prompt:forbidden('prompt'),state:forbidden('state'),rename:forbidden('rename')}},f.config);
  async function request(name,body,query='',origin='http://example') {
    const req=new Request('http://example/api/goal-first/'+name+query,body===undefined?{}:{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
    const response=await routes.get('/api/goal-first/'+name).fetch(req);return {status:response.status,value:await response.json()};
  }
  return {request,tools,activation};
}

test('HTTP and real model tools complete proposal, user confirmation, registration and exact-version approval without starting an Agent',async t=>{
  const f=await fixture(t),app=mount(f,[{sessionId:f.alignment.sessionId,cwd:f.cwd,running:true}]);
  const initial=await app.request('task-review',undefined,'?task='+f.taskId);assert.equal(initial.status,200);assert.equal(initial.value.agreement.confirmed,false);
  const proposal=await app.tools.get('goal_task_propose').execute({baseRevision:initial.value.revision,goal:'当前用户确认的结果',deliverables:['可阅读的页面'],acceptance:['页面可打开']},{agent:{session:{id:f.alignment.sessionId}}});
  assert.equal(await readFile(join(f.cwd,'index.md'),'utf8'),f.original);
  const confirmed=await app.request('task-review',{taskId:f.taskId,action:'confirm',proposalId:proposal.proposal.id,baseRevision:proposal.proposal.baseRevision});
  assert.equal(confirmed.status,200);assert.equal(confirmed.value.agreement.confirmed,true);assert.match(await readFile(join(f.cwd,'index.md'),'utf8'),/status: pending/);
  const registered=await app.request('task-review',{taskId:f.taskId,action:'register',path:'result.html',baseRevision:confirmed.value.revision});
  assert.equal(registered.status,200);const delivery=registered.value.deliveries[0];
  const approved=await app.request('task-review',{taskId:f.taskId,action:'approve',artifactId:delivery.id,revision:delivery.revision});assert.equal(approved.status,200);assert.equal(approved.value.deliveries[0].approved,true);
  await writeFile(join(f.cwd,'result.html'),'<h1>第二版</h1>');
  const stale=await app.request('task-review',{taskId:f.taskId,action:'approve',artifactId:delivery.id,revision:delivery.revision});assert.equal(stale.status,400);
  const current=await app.request('task-review',undefined,'?task='+f.taskId);assert.equal(current.value.deliveries[0].approved,false);assert.deepEqual(app.activation,[]);
});

test('a real execution summary blocks confirmation while an alignment reply does not, and cross-origin writes fail',async t=>{
  const f=await fixture(t),execution=await f.store.reserveTaskConversation({taskId:f.taskId,projectId:f.projectId,cwd:f.cwd,title:'执行',intent:'execution',executionPrompt:'原冻结范围',requestId:'execution'});await f.store.markTaskExecutionSubmitted(execution.sessionId);
  const app=mount(f,[{sessionId:execution.sessionId,cwd:f.cwd,running:true}]);
  const context=await app.request('task-review',undefined,'?task='+f.taskId);
  const proposal=await app.tools.get('goal_task_propose').execute({baseRevision:context.value.revision,goal:'后续草案',deliverables:['结果'],acceptance:['可验证']},{agent:{session:{id:f.alignment.sessionId}}});
  const denied=await app.request('task-review',{taskId:f.taskId,action:'confirm',proposalId:proposal.proposal.id,baseRevision:proposal.proposal.baseRevision});assert.equal(denied.status,400);assert.match(denied.value.error,/正在执行/);
  const cross=await app.request('task-review',{taskId:f.taskId,action:'register',path:'result.html',baseRevision:context.value.revision},'','https://unrelated.example');assert.equal(cross.status,403);
  assert.equal(await readFile(join(f.cwd,'index.md'),'utf8'),f.original);assert.deepEqual(app.activation,[]);
});

test('managed task external reference previews use the existing project root boundary',async t=>{
  const f=await fixture(t);await writeFile(join(f.feature,'guide.md'),'真实项目级参考资料');await writeFile(join(f.feature,'plan.md'),'# 原计划\n');
  await writeFile(join(f.cwd,'index.md'),f.original+'\n## 参考材料\n- [原资料](../../guide.md)\n');
  await f.store.transaction(state=>{state.projects.push({id:'stage-project',root:f.library,path:f.feature,parentId:null,sessionId:'stage-discussion',visible:true,legacy:false,document:'index.md',phase:'review',revision:0,plan:{version:'stable-plan',path:f.feature,tasks:[{id:'stage-task',code:'T1',stage:1,dependencies:[],path:f.cwd}]},planHistory:[],runs:[],createdAt:1,updatedAt:1});return 'stage-project';},false);
  const app=mount(f),catalog=await app.request('catalog');assert.equal(catalog.status,200);
  const stage=catalog.value.projects.find(project=>project.id==='stage-project').tasks[0],artifact=stage.artifacts.find(file=>file.relation==='reference');assert.ok(artifact);
  const result=await app.request('artifact',undefined,'?task=stage-task&id='+artifact.id);assert.equal(result.status,200);assert.equal(result.value.text,'真实项目级参考资料');assert.deepEqual(app.activation,[]);
});
