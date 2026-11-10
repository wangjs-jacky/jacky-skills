import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { ProjectStore } from '../project-store.js';

test('managed task views reuse the existing artifact parser without treating references as outputs', async t => {
  const parent = await realpath(tmpdir()), root = await mkdtemp(join(parent, 'goal-stage-artifacts-'));
  t.after(async () => { const actual = await realpath(root); assert.equal(dirname(actual), parent); assert.ok(basename(actual).startsWith('goal-stage-artifacts-')); assert.equal(actual, resolve(root)); await rm(actual, { recursive: true }); });
  const path = join(root, 'tasks', 'stable-task'); await mkdir(path, { recursive: true });
  const source = '---\nstatus: done\n---\n# 阶段成果\n\n## 目标\n真实交付\n\n## 预期交付物\n- 可查看的页面\n\n## 实际产物\n- [页面](result.html)\n\n## 参考材料\n- [原始资料](notes.md)\n';
  await writeFile(join(path, 'index.md'), source); await writeFile(join(path, 'PROMPT.md'), '# 保留的执行依据\n');
  await writeFile(join(path, 'result.html'), '<h1>真实结果</h1>'); await writeFile(join(path, 'notes.md'), '参考资料');
  const store = new ProjectStore({ stateFile: join(root, 'state.json') }); await store.ready;
  const value = await store.taskView({ root, path: root }, { id: 'stable-task', path, code: 'T1', stage: 1, dependencies: [] });
  assert.equal(value.status, 'done'); assert.equal(value.id, 'stable-task'); assert.equal(value.instructions.index, source);
  assert.equal(value.artifacts?.filter(file => file.relation === 'output').length, 1);
  assert.equal(value.artifacts?.filter(file => file.relation === 'reference').length, 1);
  assert.equal(value.artifacts.find(file => file.relation === 'output').path, join(path, 'result.html'));
});

test('thin navigation summaries stay concise and mixed process sections never masquerade as deliverables',async t=>{
  const parent=await realpath(tmpdir()),root=await mkdtemp(join(parent,'goal-card-contract-'));
  t.after(async()=>{const actual=await realpath(root);assert.equal(dirname(actual),parent);assert.ok(basename(actual).startsWith('goal-card-contract-'));assert.equal(actual,resolve(root));await rm(actual,{recursive:true});});
  const path=join(root,'tasks','01-result');await mkdir(path,{recursive:true});
  await writeFile(join(root,'index.md'),'# 真实目标\n\n- [任务](tasks/01-result/index.md)\n');
  await writeFile(join(path,'index.md'),'---\nstatus: done\n---\n# 高价值任务\n\n目标：已沉淀完成的实际结果。\n\n## 看实际结果\n- [已归档页面](result.html)\n');
  await writeFile(join(path,'PROMPT.md'),'# 完整任务\n\n## 目标\n完整目标及原始要求，不是卡片的结果摘要。\n\n## 交付与验收\n1. 制作组件。\n2. 运行测试。\n');
  await writeFile(join(path,'result.html'),'<h1>结果</h1>');
  const {parseBoard}=await import('../lib/records.js'),{TaskWorkflow}=await import('../task-workflow.js');
  const {snapshot}=await parseBoard({root,featurePath:root,title:'目标',projectTitle:'项目'});
  const task=snapshot.tasks[0];assert.deepEqual(task.expectedDeliverables,[]);
  const store=new ProjectStore({stateFile:join(root,'state.json')});await store.ready;
  const info={project:{id:'project',root,runs:[]},task,cwd:path};
  const review=await new TaskWorkflow(store,{resolveTask:async()=>info}).snapshot(info);
  assert.equal(review.summary,'已沉淀完成的实际结果。');assert.equal(review.contract.goal,'完整目标及原始要求，不是卡片的结果摘要。');
});
