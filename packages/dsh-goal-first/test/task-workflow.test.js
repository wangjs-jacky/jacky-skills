import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, link, writeFile, unlink, rename, chmod, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join } from 'node:path';
import { createHash } from 'node:crypto';
import { ProjectStore } from '../project-store.js';
import { readTaskFile } from '../task-files.js';

let TaskWorkflow;
try { ({ TaskWorkflow } = await import('../task-workflow.js')); }
catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !error.message.includes('/task-workflow.js')) throw error; }

const PREFIX = 'goal-first-task-workflow-';
const goal = '生成可以核对来源的图文卡片';
const deliverables = ['cards/report.md'];
const acceptance = '每张卡片包含可回溯的原始时间点。';
const originalIndex = `---
status: pending
owner: human
---
# 保留任务标题

原始引言需要保留。

## 目标
旧目标

## 预期交付物
- 旧交付

## 验收要求
旧验收

## 导航
- [原始依据](PROMPT.md)
- [已产出报告](cards/report.md)

## 执行结果
仍待实测。

## 历史与授权
用户原话：只执行原先明确选择的这一个任务。
\`\`\`markdown
## 目标
示例中的标题不是契约。
\`\`\`
`;
const originalPrompt = '# 完整任务说明\n\n原始用户材料原文。\n\n执行依据：用户明确选择当前任务，授权不扩展到其他任务。\n\n目标：旧目标\n\n交付物：\n- 旧交付\n\n验收要求：旧验收\n';

async function fixture(t, { index = originalIndex, prompt = originalPrompt } = {}) {
  assert.equal(typeof TaskWorkflow, 'function', 'TaskWorkflow must export the requested class');
  const temporaryParent = await realpath(tmpdir());
  const temporary = await realpath(await mkdtemp(join(temporaryParent, PREFIX)));
  t.after(async () => {
    const target = await realpath(temporary);
    assert.ok(isAbsolute(target));
    assert.equal(target, temporary);
    assert.equal(dirname(target), temporaryParent);
    assert.ok(basename(target).startsWith(PREFIX));
    await rm(target, { recursive: true, force: true });
  });
  const stateFile = join(temporary, 'state', 'projects.json');
  const store = new ProjectStore({ stateFile });
  await store.ready;
  const project = await store.create({ root: temporary });
  await store.activate(project.id, '临时项目');
  let current = await store.beginReview(project.id, store.metadata(project.id).revision);
  current = await store.savePlan(project.id, { summary: '仅测试任务协议', tasks: [
    { code: 'T1', title: '测试任务', goal: '旧目标', deliverables: ['旧交付'], acceptance: '旧验收', stage: 1 },
    { code: 'T2', title: '相邻任务', goal: '邻居目标', deliverables: ['neighbor.txt'], acceptance: '邻居验收', stage: 1 },
  ] }, current.revision);
  const taskId = current.tasks[0].id;
  const taskDirectory = current.tasks[0].path;
  const siblingDirectory = current.tasks[1].path;
  await mkdir(join(taskDirectory, 'cards'));
  await writeFile(join(taskDirectory, 'index.md'), index);
  if (prompt === null) await unlink(join(taskDirectory, 'PROMPT.md'));
  else await writeFile(join(taskDirectory, 'PROMPT.md'), prompt);
  await writeFile(join(taskDirectory, 'cards', 'report.md'), '真实文件 v1\n');
  await writeFile(join(siblingDirectory, 'neighbor.txt'), '隔离的相邻任务文件');
  const otherProject = await store.create({ root: temporary });
  const artifacts = [];
  const resolveWith = activeStore => async id => {
    const project = await activeStore.view(current.id);
    const task = project.tasks.find(item => item.id === id);
    if (!task) throw new Error('task not found');
    return { project, task: { ...task, artifacts: structuredClone(artifacts) }, cwd: task.path, mode: 'stage' };
  };
  const resolveTask = resolveWith(store);
  const workflow = new TaskWorkflow(store, { resolveTask });
  const info = () => resolveTask(taskId);
  const snapshot = async () => workflow.snapshot(await info());
  const alignment = async (extra = {}) => store.reserveTaskConversation({ taskId, projectId: current.id, cwd: taskDirectory, title: '目标对齐', intent: 'alignment', requestId: `align-${Math.random()}`, ...extra });
  const propose = async (extra = {}) => {
    const session = await alignment();
    const baseline = await snapshot();
    return workflow.propose(taskId, { sessionId: session.sessionId, baseRevision: baseline.revision, goal, deliverables, acceptance, ...extra });
  };
  const confirm = async () => {
    const draft = await propose();
    return workflow.confirm(taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision });
  };
  const register = async path => workflow.registerDelivery(taskId, { path, baseRevision: (await snapshot()).revision });
  return { temporary, stateFile, store, projectId: current.id, otherProjectId: otherProject.id, taskId, taskDirectory, siblingDirectory, workflow, resolveWith, info, snapshot, artifacts, alignment, propose, confirm, register };
}

async function approveReport(f) {
  const registered = await f.register('cards/report.md');
  const artifact = registered.deliveries.find(item => item.relativePath === 'cards/report.md');
  return f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision });
}

const retainedSections = originalIndex.slice(originalIndex.indexOf('## 导航'));

test('snapshot is read-only and does not invent confirmation, approval or execution from status', async t => {
  const f = await fixture(t, { index: originalIndex.replace('status: pending', 'status: done') });
  const before = await readFile(f.stateFile, 'utf8');
  const state = structuredClone(f.store.state);
  const snapshot = await f.snapshot();
  assert.match(snapshot.revision, /^[a-f0-9]{64}$/);
  assert.match(snapshot.contractRevision, /^[a-f0-9]{64}$/);
  assert.deepEqual(snapshot.contract, { goal: '旧目标', deliverables: ['旧交付'], acceptance: '旧验收' });
  assert.equal(snapshot.agreement.confirmed, false);
  assert.equal(snapshot.agreement.stale, false);
  assert.equal(snapshot.proposal, null);
  assert.deepEqual(snapshot.deliveries, []);
  assert.equal(snapshot.hasExecution, false);
  assert.equal(snapshot.executionSessionId, null);
  assert.deepEqual(f.store.state, state);
  assert.equal(await readFile(f.stateFile, 'utf8'), before);
});

test('propose saves only a task-scoped draft and leaves task documents, plans and status intact', async t => {
  const f = await fixture(t);
  const projects = structuredClone(f.store.state.projects);
  const draft = await f.propose();
  assert.equal(draft.proposal.baseRevision, draft.revision);
  assert.equal(draft.proposal.goal, goal);
  assert.deepEqual(draft.proposal.deliverables, deliverables);
  assert.equal(draft.proposal.acceptance, acceptance);
  assert.equal(draft.proposal.status, 'proposed');
  assert.equal(draft.proposal.stale, false);
  assert.equal(typeof draft.proposal.id, 'string');
  assert.equal(typeof draft.proposal.createdAt, 'number');
  assert.equal(draft.agreement.confirmed, false);
  assert.equal(await readFile(join(f.taskDirectory, 'index.md'), 'utf8'), originalIndex);
  assert.equal(await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8'), originalPrompt);
  assert.deepEqual(f.store.state.projects, projects);
  assert.equal(f.store.state.taskReviews[f.taskId].status, undefined);
});

test('proposal requires the exact alignment session task, cwd and intent', async t => {
  const f = await fixture(t);
  const baseline = await f.snapshot();
  const invalid = [
    await f.alignment({ intent: 'conversation' }),
    await f.alignment({ intent: 'execution-draft' }),
    await f.alignment({ taskId: 'other-task' }),
    await f.alignment({ cwd: f.siblingDirectory }),
    await f.alignment({ cwd: f.taskDirectory + '/.' }),
  ];
  for (const session of invalid) {
    await assert.rejects(f.workflow.propose(f.taskId, { sessionId: session.sessionId, baseRevision: baseline.revision, goal, deliverables, acceptance }), /alignment|对齐|会话|目录/);
  }
  await assert.rejects(f.workflow.propose(f.taskId, { sessionId: 'missing', baseRevision: baseline.revision, goal, deliverables, acceptance }), /会话|alignment|对齐/);
  assert.equal(f.store.state.taskReviews?.[f.taskId], undefined);
});

test('confirmation edits only contract sections and appends a marked PROMPT supplement while preserving evidence', async t => {
  const f = await fixture(t);
  const projects = structuredClone(f.store.state.projects);
  const confirmed = await f.confirm();
  const source = await readFile(join(f.taskDirectory, 'index.md'), 'utf8');
  assert.ok(source.startsWith('---\nstatus: pending\nowner: human\n---\n# 保留任务标题\n\n原始引言需要保留。\n'));
  assert.ok(source.includes(retainedSections));
  assert.ok(source.includes(`## 目标\n${goal}`));
  assert.ok(source.includes(`## 预期交付物\n- ${deliverables[0]}`));
  assert.ok(source.includes(`## 验收要求\n${acceptance}`));
  const prompt = await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8');
  assert.ok(prompt.startsWith(originalPrompt));
  assert.match(prompt.slice(originalPrompt.length), /goal-first.*contract|任务目标确认补充/i);
  assert.ok(prompt.includes(goal));
  assert.deepEqual(confirmed.contract, { goal, deliverables, acceptance });
  assert.equal(confirmed.agreement.confirmed, true);
  assert.equal(confirmed.agreement.stale, false);
  assert.equal(confirmed.proposal.status, 'confirmed');
  assert.equal(confirmed.proposal.stale, false);
  assert.deepEqual(f.store.state.projects, projects);
  assert.equal((await f.info()).task.status, 'pending');
  assert.equal(f.store.state.taskReviews[f.taskId].status, undefined);
});

test('confirmation appends missing contract sections without replacing old navigation or authorization', async t => {
  const index = '---\nstatus: pending\n---\n# 老任务\n\n## 执行授权\n用户原话：执行我选定的这项任务。\n\n## 资料\n保留全部材料。\n';
  const f = await fixture(t, { index });
  const confirmed = await f.confirm();
  const source = await readFile(join(f.taskDirectory, 'index.md'), 'utf8');
  assert.ok(source.startsWith(index));
  assert.deepEqual(confirmed.contract, { goal, deliverables, acceptance });
});

test('a full-document baseline rejects stale proposals, confirmation and registration even after status-only edits', async t => {
  const f = await fixture(t);
  const draft = await f.propose();
  await writeFile(join(f.taskDirectory, 'index.md'), originalIndex.replace('status: pending', 'status: review'));
  const changed = await f.snapshot();
  assert.notEqual(changed.revision, draft.revision);
  assert.equal(changed.contractRevision, draft.contractRevision);
  assert.equal(changed.proposal.stale, true);
  await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision }), /revision|版本|变化|过期/);
  await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: changed.revision }), /revision|版本|变化|过期/);
  const session = await f.alignment();
  await assert.rejects(f.workflow.propose(f.taskId, { sessionId: session.sessionId, baseRevision: draft.revision, goal, deliverables, acceptance }), /revision|版本|变化|过期/);
  await assert.rejects(f.workflow.registerDelivery(f.taskId, { path: 'cards/report.md', baseRevision: draft.revision }), /revision|版本|变化|过期/);
  assert.equal((await f.snapshot()).agreement.confirmed, false);
});

test('confirmation rejects a superseded proposal id without changing documents', async t => {
  const f = await fixture(t);
  const first = await f.propose();
  const second = await f.propose({ goal: goal + '第二稿' });
  assert.notEqual(first.proposal.id, second.proposal.id);
  await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: first.proposal.id, baseRevision: second.revision }), /提案|草案|proposal/);
  assert.equal(await readFile(join(f.taskDirectory, 'index.md'), 'utf8'), originalIndex);
});

test('running task status freezes confirmation but does not invent submitted execution', async t => {
  const f = await fixture(t, { index: originalIndex.replace('status: pending', 'status: running') });
  const draft = await f.propose();
  await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision }), /执行|冻结|running/);
  assert.equal((await f.snapshot()).hasExecution, false);
  assert.equal(await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8'), originalPrompt);
});

test('an unfinished owning run freezes confirmation and preserves original plan and snapshots', async t => {
  const f = await fixture(t);
  const project = await f.store.view(f.projectId);
  const granted = await f.store.grantTask(project.id, f.taskId, project.revision, 'run-freeze', project.reviewToken);
  const runs = structuredClone(f.store.metadata(f.projectId).runs);
  const plan = structuredClone(f.store.metadata(f.projectId).plan);
  const draft = await f.propose();
  await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision }), /执行|冻结|run/);
  assert.equal((await f.snapshot()).hasExecution, false);
  await f.store.updateRun(f.projectId, granted.runs[0].id, { state: 'complete' });
  await f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision });
  assert.deepEqual(f.store.metadata(f.projectId).runs[0].snapshots, runs[0].snapshots);
  assert.deepEqual(f.store.metadata(f.projectId).plan, plan);
});

test('execution history requires an actually submitted execution binding or owning run task', async t => {
  const f = await fixture(t);
  await f.alignment();
  await f.alignment({ intent: 'conversation' });
  const execution = await f.alignment({ intent: 'execution', executionPrompt: '冻结执行依据' });
  assert.equal((await f.snapshot()).hasExecution, false);
  await f.store.markTaskExecutionSubmitted(execution.sessionId);
  let snapshot = await f.snapshot();
  assert.equal(snapshot.hasExecution, true);
  assert.equal(snapshot.executionSessionId, execution.sessionId);
  const project = await f.store.view(f.projectId);
  const granted = await f.store.grantTask(project.id, f.taskId, project.revision, 'submitted-stage', project.reviewToken);
  await f.store.updateRun(project.id, granted.runs[0].id, { submittedTaskId: f.taskId });
  snapshot = await f.snapshot();
  assert.equal(snapshot.hasExecution, true);
  assert.ok([execution.sessionId, granted.runs[0].tasks[0].sessionId].includes(snapshot.executionSessionId));
});

test('registration merges actual output links by canonical task-relative path and never changes index or status', async t => {
  const f = await fixture(t);
  f.artifacts.push(
    { id: 'linked', name: '实际报告', path: join(f.taskDirectory, 'cards/report.md'), relation: 'output', kind: 'text' },
    { id: 'alias', name: '重复入口', path: join(f.taskDirectory, 'cards', '..', 'cards', 'report.md'), relation: 'output', kind: 'text' },
    { id: 'input', name: '参考资料', path: join(f.taskDirectory, 'PROMPT.md'), relation: 'reference', kind: 'text' },
  );
  const before = await f.snapshot();
  assert.equal(before.deliveries.length, 1);
  assert.equal(before.deliveries[0].approved, false);
  const after = await f.register('cards/report.md');
  assert.equal(after.deliveries.length, 1);
  const file = after.deliveries[0];
  assert.equal(file.relativePath, 'cards/report.md');
  assert.equal(file.path, await realpath(join(f.taskDirectory, 'cards/report.md')));
  assert.equal(file.kind, 'text');
  assert.equal(file.available, true);
  assert.match(file.version, /^[a-f0-9]{64}$/);
  assert.match(file.revision, /^[a-f0-9]{64}$/);
  assert.equal(file.version, createHash('sha256').update('真实文件 v1\n').digest('hex'));
  assert.equal(file.id, before.deliveries[0].id);
  assert.equal(await readFile(join(f.taskDirectory, 'index.md'), 'utf8'), originalIndex);
  assert.equal((await f.info()).task.status, 'pending');
});

test('approval is evidence for an exact real file version and contract and cannot be inferred from done', async t => {
  const f = await fixture(t, { index: originalIndex.replace('status: pending', 'status: done') });
  let snapshot = await f.register('cards/report.md');
  let artifact = snapshot.deliveries[0];
  assert.equal(artifact.approved, false);
  snapshot = await f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision });
  assert.equal(snapshot.deliveries[0].approved, true);
  assert.equal(snapshot.agreement.confirmed, false);
  await writeFile(join(f.taskDirectory, 'cards/report.md'), '真实文件 v2\n');
  snapshot = await f.snapshot();
  assert.equal(snapshot.deliveries[0].approved, false);
  assert.notEqual(snapshot.deliveries[0].version, artifact.version);
  await assert.rejects(f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision }), /revision|版本|变化|过期/);
  artifact = snapshot.deliveries[0];
  await f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision });
  const confirmed = await f.confirm();
  assert.equal(confirmed.deliveries[0].approved, false);
  assert.notEqual(confirmed.contractRevision, snapshot.contractRevision);
  await assert.rejects(f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision }), /revision|版本|变化|过期/);
});

test('approval rejects a task whose authoritative index status is running without persisting approval evidence', async t => {
  const index = originalIndex.replace('status: pending', 'status: running');
  const f = await fixture(t, { index });
  const registered = await f.register('cards/report.md');
  const artifact = registered.deliveries[0];
  const before = await readFile(f.stateFile, 'utf8');
  await assert.rejects(f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision }), /running|执行|运行/);
  assert.equal((await f.snapshot()).deliveries[0].approved, false);
  assert.deepEqual(f.store.state.taskReviews[f.taskId].approvals, {});
  assert.equal(await readFile(f.stateFile, 'utf8'), before);
  assert.equal(await readFile(join(f.taskDirectory, 'index.md'), 'utf8'), index);
});

test('status, results, navigation and unrelated PROMPT updates keep same-contract confirmation and file approval valid', async t => {
  const f = await fixture(t);
  await f.confirm();
  const approved = await approveReport(f);
  const indexPath = join(f.taskDirectory, 'index.md');
  const index = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, index.replace('status: pending', 'status: done').replace('仍待实测。', '已经产生实际结果。').replace('## 导航', '## 阅读入口'));
  const promptPath = join(f.taskDirectory, 'PROMPT.md');
  await writeFile(promptPath, (await readFile(promptPath, 'utf8')) + '\n## 执行结果\n补充真实结果。\n');
  const refreshed = await f.snapshot();
  assert.notEqual(refreshed.revision, approved.revision);
  assert.equal(refreshed.contractRevision, approved.contractRevision);
  assert.equal(refreshed.agreement.confirmed, true);
  assert.equal(refreshed.agreement.stale, false);
  assert.equal(refreshed.deliveries[0].approved, true);
  assert.equal(refreshed.deliveries[0].revision, approved.deliveries[0].revision);
  await writeFile(indexPath, (await readFile(indexPath, 'utf8')).replace(goal, goal + '（范围变化）'));
  const changed = await f.snapshot();
  assert.equal(changed.agreement.confirmed, false);
  assert.equal(changed.agreement.stale, true);
  assert.equal(changed.deliveries[0].approved, false);
});

test('registration rejects neighboring tasks, traversal, absolute paths, directories, symlinks and hardlinks', async t => {
  const f = await fixture(t);
  await symlink(join(f.taskDirectory, 'cards/report.md'), join(f.taskDirectory, 'internal-link.md'));
  await symlink(f.siblingDirectory, join(f.taskDirectory, 'neighbor-link'), 'dir');
  await link(join(f.siblingDirectory, 'neighbor.txt'), join(f.taskDirectory, 'hardlink.txt'));
  for (const path of ['../neighbor.txt', join(f.taskDirectory, 'cards/report.md'), 'cards/../index.md', 'cards', 'internal-link.md', 'neighbor-link/neighbor.txt', 'hardlink.txt']) {
    await assert.rejects(f.register(path), /相对路径|普通文件|链接|link|范围/);
  }
  f.artifacts.push(
    { id: 'outside', name: '别的任务', path: join(f.siblingDirectory, 'neighbor.txt'), relation: 'output', kind: 'text' },
    { id: 'link', name: '符号链接', path: join(f.taskDirectory, 'internal-link.md'), relation: 'output', kind: 'text' },
  );
  const snapshot = await f.snapshot();
  assert.ok(!snapshot.deliveries.some(file => file.path === join(f.siblingDirectory, 'neighbor.txt')));
  assert.ok(snapshot.deliveries.every(file => !file.available));
  assert.equal(await readFile(join(f.siblingDirectory, 'neighbor.txt'), 'utf8'), '隔离的相邻任务文件');
});

test('deleted or unreadable linked files never keep approval and cannot be approved', async t => {
  const f = await fixture(t);
  const approved = await approveReport(f);
  const artifact = approved.deliveries[0];
  const filePath = join(f.taskDirectory, 'cards/report.md');
  const saved = join(f.taskDirectory, 'cards/report.saved.md');
  assert.equal(await realpath(filePath), filePath);
  assert.ok(isAbsolute(saved) && dirname(saved) === join(f.taskDirectory, 'cards'));
  await rename(filePath, saved);
  let snapshot = await f.snapshot();
  assert.equal(snapshot.deliveries[0].available, false);
  assert.equal(snapshot.deliveries[0].approved, false);
  await assert.rejects(f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision }), /不可|文件|读取/);
  await symlink(saved, filePath);
  snapshot = await f.snapshot();
  assert.equal(snapshot.deliveries[0].available, false);
  assert.equal(snapshot.deliveries[0].approved, false);
});

test('large files use their actual streamed content hash without lifting the existing preview bound', async t => {
  const f = await fixture(t);
  const data = Buffer.alloc(2 * 1024 * 1024 + 7, 97);
  await writeFile(join(f.taskDirectory, 'large.txt'), data);
  const registered = await f.register('large.txt');
  const artifact = registered.deliveries[0];
  assert.equal(artifact.available, true);
  assert.equal(artifact.kind, 'unsupported');
  assert.equal(artifact.version, createHash('sha256').update(data).digest('hex'));
  assert.equal((await readTaskFile(f.taskDirectory, 'large.txt')).reason, 'large');
  const approved = await f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision });
  assert.equal(approved.deliveries[0].approved, true);
});

test('evidence and explicit registrations survive a real ProjectStore reload without altering any project', async t => {
  const f = await fixture(t);
  const before = structuredClone(f.store.state.projects);
  await f.confirm();
  const approved = await approveReport(f);
  const reloaded = new ProjectStore({ stateFile: f.stateFile });
  await reloaded.ready;
  const resolveTask = f.resolveWith(reloaded);
  const workflow = new TaskWorkflow(reloaded, { resolveTask });
  const restored = await workflow.snapshot(await resolveTask(f.taskId));
  assert.equal(restored.agreement.confirmed, true);
  assert.equal(restored.proposal.id, approved.proposal.id);
  assert.equal(restored.proposal.status, 'confirmed');
  assert.equal(restored.deliveries[0].approved, true);
  assert.deepEqual(reloaded.state.projects, before);
  assert.equal(reloaded.state.taskReviews[f.taskId].status, undefined);
  assert.deepEqual(Object.keys(reloaded.state.taskReviews), [f.taskId]);
});

test('a real persistence failure after document writes is reported and original materials are restored', async t => {
  const f = await fixture(t);
  const draft = await f.propose();
  const originalStateFile = f.store.stateFile;
  const failTarget = join(f.temporary, 'cannot-replace-directory');
  await mkdir(failTarget);
  const originalTransaction = f.store.transaction.bind(f.store);
  f.store.transaction = (operation, projectResult) => originalTransaction(async state => {
    const result = await operation(state);
    f.store.stateFile = failTarget;
    return result;
  }, projectResult);
  try {
    await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision }), /保存|恢复|事务|原始|原文/);
  } finally { f.store.stateFile = originalStateFile; f.store.transaction = originalTransaction; }
  assert.equal(await readFile(join(f.taskDirectory, 'index.md'), 'utf8'), originalIndex);
  assert.equal(await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8'), originalPrompt);
  const restored = await f.snapshot();
  assert.equal(restored.agreement.confirmed, false);
  assert.equal(restored.proposal.status, 'proposed');
});

test('confirmation preserves authorization embedded within contract sections and excludes it from current contract semantics', async t => {
  for (const embedded of ['### 旧授权与历史\n用户原话：请执行这个原始任务。\n', '执行依据：用户原话“只执行我选择的当前任务”。\n']) {
    const index = originalIndex.replace('旧目标\n\n## 预期交付物', `旧目标\n\n${embedded}\n## 预期交付物`);
    const f = await fixture(t, { index });
    const confirmed = await f.confirm();
    assert.deepEqual(confirmed.contract, { goal, deliverables, acceptance });
    assert.ok((await readFile(join(f.taskDirectory, 'index.md'), 'utf8')).includes(embedded));
    assert.equal(confirmed.agreement.confirmed, true);
  }
});

test('confirmation handles CRLF documents without replacing existing material', async t => {
  const index = originalIndex.replace(/\n/g, '\r\n');
  const f = await fixture(t, { index, prompt: originalPrompt.replace(/\n/g, '\r\n') });
  const before = await f.snapshot();
  const confirmed = await f.confirm();
  const source = await readFile(join(f.taskDirectory, 'index.md'), 'utf8');
  assert.ok(source.includes(retainedSections.replace(/\n/g, '\r\n')));
  assert.deepEqual(confirmed.contract, { goal, deliverables, acceptance });
  assert.notEqual(before.revision, confirmed.revision);
  assert.match(await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8'), /goal-first:contract/);
});

test('PROMPT-only semantic contract changes invalidate file review, while a full PROMPT text change invalidates a proposal baseline', async t => {
  const index = '---\nstatus: pending\n---\n# 薄导航\n\n[任务说明](PROMPT.md)\n';
  const prompt = '# 任务说明\n\n## 目标\n原始目标\n\n## 预期交付物\n- cards/report.md\n\n## 验收要求\n需要人工核对。\n';
  const f = await fixture(t, { index, prompt });
  let snapshot = await approveReport(f);
  assert.deepEqual(snapshot.contract, { goal: '原始目标', deliverables: ['cards/report.md'], acceptance: '需要人工核对。' });
  assert.equal(snapshot.deliveries[0].approved, true);
  const draft = await f.propose();
  await writeFile(join(f.taskDirectory, 'PROMPT.md'), prompt.replace('需要人工核对。', '需要逐条人工核对。'));
  snapshot = await f.snapshot();
  assert.equal(snapshot.deliveries[0].approved, false);
  assert.equal(snapshot.proposal.stale, true);
  await assert.rejects(f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision }), /revision|版本|变化|过期/);
});

test('a genuinely unreadable file cannot retain or receive approval', async t => {
  const f = await fixture(t);
  const approved = await approveReport(f);
  const artifact = approved.deliveries[0], path = join(f.taskDirectory, 'cards/report.md');
  await chmod(path, 0);
  try {
    const snapshot = await f.snapshot();
    assert.equal(snapshot.deliveries[0].available, false);
    assert.equal(snapshot.deliveries[0].approved, false);
    await assert.rejects(f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision }), /不可|读取|文件/);
  } finally { await chmod(path, 0o600); }
});

test('a file that changes during streamed hashing is unavailable and never receives fabricated approval', async t => {
  const f = await fixture(t);
  const path = join(f.taskDirectory, 'changing.txt');
  await writeFile(path, Buffer.alloc(16 * 1024 * 1024, 97));
  const registered = await f.register('changing.txt');
  const artifact = registered.deliveries[0];
  await f.workflow.approve(f.taskId, { artifactId: artifact.id, revision: artifact.revision });
  const handle = await open(path, 'r+');
  let stopped = false, counter = 0;
  const deadline = performance.now() + 3000;
  const writer = (async () => {
    while (!stopped && performance.now() < deadline) {
      await handle.write(Buffer.from(String(++counter).padStart(20, '0')), 0, 20, 0);
      await new Promise(resolve => setImmediate(resolve));
    }
  })();
  try {
    const snapshot = await f.snapshot();
    assert.equal(snapshot.deliveries[0].available, false);
    assert.equal(snapshot.deliveries[0].approved, false);
  } finally { stopped = true; await writer; await handle.close(); }
});

test('approval revision is bound to a concrete artifact even when two files have identical bytes', async t => {
  const f = await fixture(t);
  await writeFile(join(f.taskDirectory, 'cards/copy.md'), '真实文件 v1\n');
  await f.register('cards/report.md');
  const snapshot = await f.register('cards/copy.md');
  const first = snapshot.deliveries.find(item => item.relativePath === 'cards/report.md');
  const second = snapshot.deliveries.find(item => item.relativePath === 'cards/copy.md');
  assert.equal(first.version, second.version);
  assert.notEqual(first.revision, second.revision);
  await assert.rejects(f.workflow.approve(f.taskId, { artifactId: second.id, revision: first.revision }), /revision|版本|变化|过期/);
});

test('result-section fields cannot override the authoritative PROMPT contract of a thin task index', async t => {
  const index = '---\nstatus: pending\n---\n# 薄导航\n\n## 执行结果\n目标：记录一次真实执行结果\n验收要求：本段只是结果记录。\n';
  const prompt = '# 完整任务说明\n\n## 目标\n真实契约目标\n\n## 预期交付物\n- cards/report.md\n\n## 验收要求\n真实契约验收\n';
  const f = await fixture(t, { index, prompt });
  const approved = await approveReport(f);
  assert.equal(approved.contract.goal, '真实契约目标');
  await writeFile(join(f.taskDirectory, 'index.md'), index.replace('记录一次真实执行结果', '新增第二次实际结果'));
  const refreshed = await f.snapshot();
  assert.equal(refreshed.contractRevision, approved.contractRevision);
  assert.equal(refreshed.deliveries[0].approved, true);
});

test('appended canonical contract sections take precedence over retained legacy aliases', async t => {
  const index = originalIndex.replace('## 预期交付物', '## 交付物').replace('## 验收要求', '## 验收');
  const f = await fixture(t, { index });
  const confirmed = await f.confirm();
  assert.deepEqual(confirmed.contract, { goal, deliverables, acceptance });
  const source = await readFile(join(f.taskDirectory, 'index.md'), 'utf8');
  assert.ok(source.includes('## 交付物\n- 旧交付'));
  assert.ok(source.includes('## 验收\n旧验收'));
  assert.ok(source.includes(`## 预期交付物\n- ${deliverables[0]}`));
  assert.ok(source.includes(`## 验收要求\n${acceptance}`));
});

test('proposal accepts bounded acceptance arrays and normalizes them into stable multiline text', async t => {
  const f = await fixture(t);
  const proposed = await f.propose({ acceptance: [' 核对真实文件。 ', '来源可回溯。'] });
  assert.equal(proposed.proposal.acceptance, '核对真实文件。\n来源可回溯。');
  const confirmed = await f.workflow.confirm(f.taskId, { proposalId: proposed.proposal.id, baseRevision: proposed.revision });
  assert.equal(confirmed.contract.acceptance, '核对真实文件。\n来源可回溯。');
  for (const acceptance of [[], [''], ['有效', null], Array(101).fill('要求'), ['x'.repeat(20001), 'x'.repeat(20001)]]) {
    await assert.rejects(f.propose({ acceptance }), /验收|文本|长度|最多|数组/);
  }
});

test('thin navigation reads its full PROMPT contract and confirmation updates only the one-line goal summary', async t => {
  const previousContract = { goal: '原始完整目标。\n这里保留原始目标的边界与适用范围。', deliverables: ['cards/report.md'], acceptance: '核对原始完整验收要求。' };
  const prompt = `# 原始任务契约\n\n## 目标\n${previousContract.goal}\n\n## 预期交付物\n- cards/report.md\n\n## 验收要求\n${previousContract.acceptance}\n\n## 执行依据\n用户原话：“只执行我选定的任务”。\n`;
  for (const label of ['目标：', '目标摘要：']) {
    const summary = '旧的一句话摘要。';
    const index = `---\nstatus: pending\n---\n# 薄导航任务\n\n${label}${summary}\n\n## 阅读入口\n- [完整任务契约](PROMPT.md)：核对目标与原授权。\n\n## 实际产物\n- [报告](cards/report.md)：查看当前可回溯产物。\n\n## 历史与授权\n用户原话：“只执行我选定的任务”。\n`;
    const f = await fixture(t, { index, prompt });
    const before = await f.snapshot();
    assert.deepEqual(before.contract, previousContract);
    const fullGoal = '生成完整可回溯的图文卡片。\n保留视频时间点与引用材料。\n只覆盖当前用户选定任务。';
    const draft = await f.propose({ goal: fullGoal });
    const confirmed = await f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision });
    const expectedContract = { goal: fullGoal, deliverables, acceptance };
    const source = await readFile(join(f.taskDirectory, 'index.md'), 'utf8');
    assert.equal(source, index.replace(summary, fullGoal.split('\n')[0]));
    assert.doesNotMatch(source, /^## (?:目标|预期交付物|验收要求)$/m);
    assert.deepEqual(confirmed.contract, expectedContract);
    assert.equal(confirmed.contractRevision, createHash('sha256').update(JSON.stringify(expectedContract)).digest('hex'));
    assert.equal(confirmed.agreement.confirmed, true);
    assert.equal(confirmed.proposal.stale, false);
    const supplemented = await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8');
    assert.ok(supplemented.startsWith(prompt));
    assert.ok(supplemented.includes(fullGoal));
    const history = f.store.state.taskReviews[f.taskId].contractHistory;
    assert.equal(history.length, 1);
    assert.deepEqual(history[0].contract, previousContract);
    assert.equal(history[0].summary, summary);
    assert.equal(typeof history[0].supersededAt, 'number');
    assert.equal(f.store.state.taskReviews[f.taskId].status, undefined);
    const approved = await approveReport(f);
    await writeFile(join(f.taskDirectory, 'index.md'), source.replace('status: pending', 'status: done').replace(fullGoal.split('\n')[0], '缩短的当前目标摘要。'));
    const refreshed = await f.snapshot();
    assert.equal(refreshed.contractRevision, approved.contractRevision);
    assert.equal(refreshed.deliveries[0].approved, true);
  }
});

test('thin navigation reload and repeated confirmation use the latest marked PROMPT contract without copying it into index', async t => {
  const index = '---\nstatus: pending\n---\n# 薄导航任务\n\n目标摘要：旧摘要。\n\n[完整说明](PROMPT.md)：查看完整契约与执行授权。\n';
  const f = await fixture(t, { index });
  await f.confirm();
  const firstPrompt = await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8');
  const fullGoal = '第二轮确认的完整目标。\n第二轮独有的范围说明。';
  const draft = await f.propose({ goal: fullGoal, acceptance: ['第二轮验收。', '检查真实引用。'] });
  const confirmed = await f.workflow.confirm(f.taskId, { proposalId: draft.proposal.id, baseRevision: draft.revision });
  assert.deepEqual(confirmed.contract, { goal: fullGoal, deliverables, acceptance: '第二轮验收。\n检查真实引用。' });
  assert.equal(await readFile(join(f.taskDirectory, 'index.md'), 'utf8'), index.replace('旧摘要。', fullGoal.split('\n')[0]));
  assert.ok((await readFile(join(f.taskDirectory, 'PROMPT.md'), 'utf8')).startsWith(firstPrompt));
  const history = f.store.state.taskReviews[f.taskId].contractHistory;
  assert.equal(history.length, 2);
  assert.deepEqual(history[1].contract, { goal, deliverables, acceptance });
  assert.equal(history[1].summary, goal);
  const reloaded = new ProjectStore({ stateFile: f.stateFile }); await reloaded.ready;
  const resolveTask = f.resolveWith(reloaded);
  const restored = await new TaskWorkflow(reloaded, { resolveTask }).snapshot(await resolveTask(f.taskId));
  assert.deepEqual(restored.contract, confirmed.contract);
  assert.equal(restored.contractRevision, confirmed.contractRevision);
  assert.equal(restored.agreement.confirmed, true);
});

test('another project may execute while current-task confirmation preserves both project records', async t => {
  const f = await fixture(t);
  let other = await f.store.beginReview(f.otherProjectId, f.store.metadata(f.otherProjectId).revision);
  other = await f.store.savePlan(other.id, { summary: '独立项目', tasks: [{ code: 'T1', title: '独立任务', goal: '独立目标', deliverables: ['other.txt'], acceptance: '独立验收', stage: 1 }] }, other.revision);
  await f.store.grantTask(other.id, other.tasks[0].id, other.revision, 'other-project-run', other.reviewToken);
  const projects = structuredClone(f.store.state.projects);
  const confirmed = await f.confirm();
  assert.equal(confirmed.agreement.confirmed, true);
  assert.equal(confirmed.hasExecution, false);
  assert.deepEqual(f.store.state.projects, projects);
});
