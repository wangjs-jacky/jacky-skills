import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const skillDirectory = fileURLToPath(new URL('..', import.meta.url));
const localLinks = markdown => [...markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]);

test('移除 Skill 源并移动工作区后，可从本地模板创建中文任务并沿导航读取任务约定和产物', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'goal-first-portable-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const source = join(temporary, 'skill-source');
  await mkdir(join(source, 'scripts'), { recursive: true });
  await cp(join(skillDirectory, 'scripts/init-goal-project.mjs'), join(source, 'scripts/init-goal-project.mjs'));
  await cp(join(skillDirectory, 'assets'), join(source, 'assets'), { recursive: true });
  const original = join(temporary, 'original-workspace');
  await run(process.execPath, [join(source, 'scripts/init-goal-project.mjs'), original]);
  assert.deepEqual((await readdir(original)).sort(), ['AGENTS.md', 'PROMPT.md', 'problem.md', 'tasks', 'templates']);
  assert.deepEqual((await readdir(join(original, 'templates'))).sort(), ['task-index.template.md', 'task-prompt.template.md']);
  assert.deepEqual(await readdir(join(original, 'tasks')), []);
  await rm(source, { recursive: true });
  const workspace = join(temporary, 'moved-workspace');
  await rename(original, workspace);

  const agents = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
  const templates = localLinks(agents).filter(path => path.startsWith('templates/'));
  assert.equal(templates.length, 2, '工作区规则必须能找到两份本地任务模板');
  const taskName = '01-比较方案';
  const taskDirectory = join(workspace, 'tasks', taskName);
  await mkdir(taskDirectory);
  const outputs = new Map([
    ['task-index.template.md', 'index.md'],
    ['task-prompt.template.md', 'PROMPT.md'],
  ]);
  for (const template of templates) {
    const output = outputs.get(basename(template));
    assert.ok(output, `未识别的任务模板：${template}`);
    await cp(resolve(workspace, template), join(taskDirectory, output));
  }

  const indexPath = join(taskDirectory, 'index.md');
  const index = await readFile(indexPath, 'utf8');
  assert.deepEqual(index.match(/^---\n([\s\S]*?)\n---/)[1].split('\n'), ['status: pending']);
  const promptLink = localLinks(index).find(link => link === 'PROMPT.md');
  assert.ok(promptLink, '任务导航必须指向完整任务说明，而不是在 index 另存一份契约');
  const executionDirectory = join(temporary, '代码目录');
  await mkdir(executionDirectory);
  await writeFile(join(executionDirectory, '输入.txt'), '甲方案与乙方案使用同一组数据。\n');
  const promptPath = resolve(taskDirectory, promptLink);
  const prompt = (await readFile(promptPath, 'utf8'))
    .replaceAll('<工作区路径>', workspace)
    .replaceAll('NN-中文任务名', taskName)
    .replaceAll('<执行目录>', executionDirectory);
  await writeFile(promptPath, prompt);

  // 沿生成的导航读取约定中的实际路径，不再访问已移除的 Skill 源。
  const taskPrompt = await readFile(promptPath, 'utf8');
  const contractPath = label => {
    const match = taskPrompt.match(new RegExp(`^- ${label}：[\\t ]*(.+)$`, 'm'));
    assert.ok(match, `任务 PROMPT 缺少可交接的${label}`);
    return match[1].replace(/^`|`$/g, '');
  };
  const recordsDirectory = resolve(contractPath('工作区路径'), contractPath('任务记录目录'));
  assert.equal(recordsDirectory, taskDirectory);
  const input = await readFile(join(contractPath('执行目录'), '输入.txt'), 'utf8');
  await writeFile(join(recordsDirectory, '方案对比.md'), `# 方案对比\n\n${input}本结论适用于上述输入。\n`);
  await writeFile(indexPath, `${index}\n- [比较结论](方案对比.md)：比较依据与结论，供后续选择方案（当前）。\n`);
  assert.deepEqual((await readdir(taskDirectory)).sort(), ['PROMPT.md', 'index.md', '方案对比.md']);

  for (const path of [join(workspace, 'AGENTS.md'), join(workspace, 'PROMPT.md'), indexPath, promptPath]) {
    for (const link of localLinks(await readFile(path, 'utf8'))) {
      const linkedPath = resolve(dirname(path), link);
      assert.ok(linkedPath.startsWith(workspace + '/'), `记录入口离开了已移动的工作区：${link}`);
      await stat(linkedPath);
    }
  }
  const resultLink = localLinks(await readFile(indexPath, 'utf8')).find(link => link === '方案对比.md');
  assert.equal(await readFile(resolve(taskDirectory, resultLink), 'utf8'),
    '# 方案对比\n\n甲方案与乙方案使用同一组数据。\n本结论适用于上述输入。\n');
});
