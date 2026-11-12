import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { promisify } from 'node:util';
import { checkTaskIds, ensureTaskId, parseTaskIndex, resolveTaskIds } from '../scripts/task-id.mjs';

const run = promisify(execFile);
const script = fileURLToPath(new URL('../scripts/task-id.mjs', import.meta.url));
const id = 'GFT-a1b2c3d4';
const secondId = 'GFT-z9y8x7w6';

async function fixture(t) {
  const parent = await realpath(await mkdtemp(join(tmpdir(), 'gft-test-')));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const root = join(parent, 'ops');
  await mkdir(root);
  async function task(name, content = '---\nstatus: pending\n---\n# 任务\n', feature = '目标') {
    const directory = join(root, 'projects', '项目', 'features', feature, 'tasks', name);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.md'), content);
    return directory;
  }
  return { root, parent, task };
}

test('ensure 只添加身份，保留状态、注释、CRLF、BOM 与正文；重复执行不改文件', async t => {
  const { root, task } = await fixture(t);
  const original = '\uFEFF---\r\n# 原始注释\r\nstatus: done\r\nowner: "例子"\r\n---\r\n# 已完成\r\n正文 GFT-z9y8x7w6\r\n';
  const directory = await task('01-任务', original);
  const assigned = await ensureTaskId(directory, { root, generateId: () => id });
  assert.equal(assigned.task_id, id);
  assert.equal(assigned.changed, true);
  const saved = await readFile(join(directory, 'index.md'), 'utf8');
  assert.equal(saved.replace(`task_id: ${id}\r\n`, ''), original);
  const again = await ensureTaskId(directory, { root, generateId: () => { throw Error('不应重新生成'); } });
  assert.equal(again.changed, false);
  assert.equal(await readFile(join(directory, 'index.md'), 'utf8'), saved);
  assert.deepEqual((await readdir(directory)).sort(), ['index.md']);
  assert.equal((await readdir(root)).includes('.task-id.lock'), false);
});

test('null 占位按需填入，保留行注释；没有 frontmatter 的旧任务不伪造状态', async t => {
  const { root, task } = await fixture(t);
  const directory = await task('01-占位', '---\ntask_id: null # 创建时分配\nstatus: review\n---\n正文\n');
  await ensureTaskId(directory, { root, generateId: () => id });
  assert.equal(await readFile(join(directory, 'index.md'), 'utf8'), `---\ntask_id: ${id} # 创建时分配\nstatus: review\n---\n正文\n`);
  const legacy = await task('02-旧任务', '# 旧入口\n已有状态在旧契约中。\n');
  await ensureTaskId(legacy, { root, generateId: () => secondId });
  assert.equal(await readFile(join(legacy, 'index.md'), 'utf8'), `---\ntask_id: ${secondId}\n---\n# 旧入口\n已有状态在旧契约中。\n`);
});

test('只从顶层 frontmatter 定位，多个 ID 去重保序，旧任务和正文引用不构成命中', async t => {
  const { root, task } = await fixture(t);
  const first = await task('01-第一项', `---\n"task_id": "${id}" # 注释\nstatus: running\n---\n`);
  await task('02-第二项', `---\ntask_id: '${secondId}'\nstatus: pending\n---\n`);
  const legacy = await task('03-旧任务', `---\nstatus: done\n---\n引用 ${id}\ntask_id: GFT-11111111\n`);
  const before = await readFile(join(legacy, 'index.md'));
  const result = await resolveTaskIds([secondId, id, secondId], { root });
  assert.deepEqual(result.tasks.map(x => x.task_id), [secondId, id]);
  assert.equal(result.tasks[1].directory, first);
  assert.equal(result.tasks[1].project, '项目');
  assert.equal(result.tasks[1].feature, '目标');
  assert.match(result.tasks[1].indexSha256, /^[0-9a-f]{64}$/);
  await assert.rejects(resolveTaskIds(['GFT-11111111'], { root }), { code: 'NOT_FOUND' });
  await assert.rejects(resolveTaskIds([id, 'GFT-11111111'], { root }), { code: 'NOT_FOUND' });
  const checked = await checkTaskIds(root);
  assert.equal(checked.valid, true);
  assert.equal(checked.identified, 2);
  assert.equal(checked.missing.length, 1);
  assert.deepEqual(await readFile(join(legacy, 'index.md')), before);
});

test('改任务名、feature 名和资料根后，同一个 ID 仍定位原内容', async t => {
  const { root, parent, task } = await fixture(t);
  const directory = await task('01-原任务');
  await ensureTaskId(directory, { root, generateId: () => id });
  await rename(directory, join(dirname(directory), '02-新名称'));
  const feature = join(root, 'projects', '项目', 'features', '目标');
  await rename(feature, join(dirname(feature), '新目标'));
  const moved = join(parent, 'moved-ops');
  await rename(root, moved);
  const [found] = (await resolveTaskIds([id], { root: moved })).tasks;
  assert.equal(found.task, '02-新名称');
  assert.equal(found.feature, '新目标');
  assert.equal(found.task_id, id);
  assert.match(await readFile(found.indexPath, 'utf8'), /status: pending/);
});

test('冲突重抽；真实重复 ID 阻止定位和补 ID，不选择第一个结果', async t => {
  const { root, task } = await fixture(t);
  await task('01-已有', `---\ntask_id: ${id}\nstatus: done\n---\n`);
  const target = await task('02-待分配');
  const candidates = [id, secondId];
  assert.equal((await ensureTaskId(target, { root, generateId: () => candidates.shift() })).task_id, secondId);
  await task('03-误复制', `---\ntask_id: ${id}\nstatus: done\n---\n`);
  const untouched = await task('04-未改');
  const before = await readFile(join(untouched, 'index.md'));
  const check = await checkTaskIds(root);
  assert.equal(check.valid, false);
  assert.equal(check.duplicates.length, 1);
  assert.equal(check.duplicates[0].paths.length, 2);
  await assert.rejects(resolveTaskIds([id], { root }), { code: 'INVALID_LIBRARY' });
  await assert.rejects(ensureTaskId(untouched, { root }), { code: 'INVALID_LIBRARY' });
  assert.deepEqual(await readFile(join(untouched, 'index.md')), before);
});

test('字段重复、非法 ID、损坏或不支持的 YAML 都拒绝，不把它当作未分配', () => {
  for (const text of [
    `---\ntask_id: ${id}\n"task_id": ${secondId}\n---\n`,
    '---\nstatus: done\nstatus: pending\n---\n',
    '---\ntask_id: GFT-ABCDEF12\n---\n',
    '---\ntask_id: GFT-12345678extra\n---\n',
    '---\ntask_id: [broken\n---\n',
    '---\nmeta:\n  task_id: GFT-12345678\n---\n',
    '---\ntask_id: |\n  GFT-12345678\n---\n',
    '---\nstatus: pending\n',
  ]) assert.throws(() => parseTaskIndex(text));
  assert.equal(parseTaskIndex(`---\ntask_id: '${id}'\n---\n`).taskId, id);
  assert.equal(parseTaskIndex(`---\nnotes: 'it''s preserved'\n---\n引用 ${id}`).taskId, null);
});

test('损坏的入口使整个检索失败，不掩盖可能隐藏的重复 ID', async t => {
  const { root, task } = await fixture(t);
  await task('01-正常', `---\ntask_id: ${id}\n---\n`);
  const broken = await task('02-损坏', '---\ntask_id: [broken\n---\n');
  const before = await readFile(join(broken, 'index.md'));
  assert.equal((await checkTaskIds(root)).errors.length, 1);
  await assert.rejects(resolveTaskIds([id], { root }), { code: 'INVALID_LIBRARY' });
  await assert.rejects(ensureTaskId(broken, { root }), { code: 'INVALID_LIBRARY' });
  assert.deepEqual(await readFile(join(broken, 'index.md')), before);
});

test('同一任务的符号链接去重；越界链接拒绝；普通非任务文件不扫描', async t => {
  const { root, parent, task } = await fixture(t);
  const directory = await task('01-真实', `---\ntask_id: ${id}\nstatus: done\n---\n`);
  await symlink(directory, join(dirname(directory), '02-兼容'));
  assert.equal((await resolveTaskIds([id], { root })).tasks.length, 1);
  const outside = join(parent, 'outside');
  await mkdir(outside);
  await writeFile(join(outside, 'index.md'), `---\ntask_id: ${secondId}\n---\n`);
  await writeFile(join(root, 'projects', 'index.md'), `引用 ${secondId}`);
  await assert.rejects(resolveTaskIds([secondId], { root }), { code: 'NOT_FOUND' });
  await assert.rejects(ensureTaskId(outside, { root }), { code: 'OUTSIDE_ROOT' });
  await symlink(outside, join(dirname(directory), '03-越界'));
  const checked = await checkTaskIds(root);
  assert.equal(checked.valid, false);
  assert.equal(checked.errors[0].code, 'OUTSIDE_ROOT');
});

test('stale hash、现有写入锁及写前外部修改都不覆盖任务', async t => {
  const { root, task } = await fixture(t);
  const directory = await task('01-任务');
  const file = join(directory, 'index.md');
  const original = await readFile(file, 'utf8');
  await assert.rejects(ensureTaskId(directory, { root, expectedSha256: '0'.repeat(64) }), { code: 'CHANGED' });
  assert.equal(await readFile(file, 'utf8'), original);
  await writeFile(join(root, '.task-id.lock'), '另一个操作');
  await assert.rejects(ensureTaskId(directory, { root }), { code: 'BUSY' });
  assert.equal(await readFile(join(root, '.task-id.lock'), 'utf8'), '另一个操作');
  await rm(join(root, '.task-id.lock'));
  const changed = original + '\n另一个会话的新内容\n';
  await assert.rejects(ensureTaskId(directory, { root, generateId: () => {
    writeFileSync(file, changed);
    return id;
  } }), { code: 'CHANGED' });
  assert.equal(await readFile(file, 'utf8'), changed);
  assert.deepEqual(await readdir(directory), ['index.md']);
});

test('断开的 tasks 容器链接不能伪装成空库或无重复', async t => {
  const { root, task } = await fixture(t);
  const directory = await task('01-任务');
  const container = dirname(directory);
  await rm(container, { recursive: true });
  await symlink(join(root, 'missing-container'), container);
  const result = await checkTaskIds(root);
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].code, 'ENOENT');
});

test('既有同根 worktree 兼容入口可读取和分配 ID，不扫描其中其他归档副本', async t => {
  const { root, task } = await fixture(t);
  const placeholder = await task('01-兼容');
  const actual = join(root, 'projects', '项目', 'features', '目标', '.worktrees', '旧执行目录', 'task');
  await mkdir(dirname(actual), { recursive: true });
  await rename(placeholder, actual);
  await symlink(actual, placeholder);
  const archive = join(root, 'projects', '项目', 'features', '目标', '.worktrees', '未引用备份');
  await mkdir(archive);
  await writeFile(join(archive, 'index.md'), `---\ntask_id: ${id}\n---\n`);
  const assigned = await ensureTaskId(placeholder, { root, generateId: () => id });
  assert.equal(assigned.indexPath, join(actual, 'index.md'));
  const found = (await resolveTaskIds([id], { root })).tasks[0];
  assert.equal(found.task, '01-兼容');
  assert.equal(found.entryPath, join(placeholder, 'index.md'));
  assert.equal((await checkTaskIds(root)).total, 1);
});

test('真实 CLI 经 Skill 软链接启动也执行；只读查询零写入且参数错误非零退出', async t => {
  const { root, parent, task } = await fixture(t);
  const directory = await task('01-任务');
  const linked = join(parent, 'installed-cli.mjs');
  await symlink(script, linked);
  const assigned = JSON.parse((await run(process.execPath, [linked, 'ensure', directory, '--root', root])).stdout);
  assert.match(assigned.task_id, /^GFT-[a-z0-9]{8}$/);
  const before = await readFile(join(directory, 'index.md'));
  const found = JSON.parse((await run(process.execPath, [linked, 'resolve', assigned.task_id, '--root', root])).stdout);
  assert.equal(found.tasks[0].indexSha256, assigned.indexSha256);
  const checked = JSON.parse((await run(process.execPath, [linked, 'check', '--root', root])).stdout);
  assert.equal(checked.valid, true);
  assert.deepEqual(await readFile(join(directory, 'index.md')), before);
  await assert.rejects(run(process.execPath, [linked, 'resolve', '--root', root]), error => {
    assert.equal(JSON.parse(error.stderr).error, 'USAGE');
    return true;
  });
  await assert.rejects(run(process.execPath, [linked, 'resolve', assigned.task_id, '--root', root, '--root', root]));
});
