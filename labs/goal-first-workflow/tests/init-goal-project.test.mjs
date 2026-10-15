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

test('a moved workspace can create and resume a task after its source skill is removed', async t => {
  const temporary = await mkdtemp(join(tmpdir(), 'goal-first-portable-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const source = join(temporary, 'skill-source');
  await mkdir(join(source, 'scripts'), { recursive: true });
  await cp(join(skillDirectory, 'scripts/init-goal-project.mjs'), join(source, 'scripts/init-goal-project.mjs'));
  await cp(join(skillDirectory, 'assets'), join(source, 'assets'), { recursive: true });
  const original = join(temporary, 'original-workspace');
  await run(process.execPath, [join(source, 'scripts/init-goal-project.mjs'), original]);
  await rm(source, { recursive: true });
  const workspace = join(temporary, 'moved-workspace');
  await rename(original, workspace);

  const agents = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
  const templates = localLinks(agents).filter(path => path.startsWith('templates/'));
  assert.equal(templates.length, 2, 'workspace rules must link to both locally available task templates');
  assert.deepEqual(await readdir(join(workspace, 'tasks')), []);
  const taskDirectory = join(workspace, 'tasks/01-compare');
  await mkdir(taskDirectory);
  const outputs = new Map([
    ['task-index.template.md', 'index.md'],
    ['task-prompt.template.md', 'PROMPT.md'],
  ]);
  for (const template of templates) {
    const output = outputs.get(basename(template));
    assert.ok(output, `unexpected task template: ${template}`);
    await cp(resolve(workspace, template), join(taskDirectory, output));
  }

  const indexPath = join(taskDirectory, 'index.md');
  const index = await readFile(indexPath, 'utf8');
  assert.deepEqual(index.match(/^---\n([\s\S]*?)\n---/)[1].split('\n'), ['status: pending']);
  await writeFile(join(taskDirectory, 'result.md'), '# Result\nThe compared options are equivalent for the fixture.\n');
  await writeFile(indexPath, `${index}\n[Comparison result](result.md)\n`);

  // Resume from the moved task's records, resolving every link against its owning file.
  for (const path of [join(workspace, 'AGENTS.md'), join(workspace, 'PROMPT.md'), indexPath, join(taskDirectory, 'PROMPT.md')]) {
    for (const link of localLinks(await readFile(path, 'utf8'))) {
      const linkedPath = resolve(dirname(path), link);
      assert.ok(linkedPath.startsWith(workspace + '/'), `record escaped the moved workspace: ${link}`);
      await stat(linkedPath);
    }
  }
  const resultLink = localLinks(await readFile(indexPath, 'utf8')).find(link => link === 'result.md');
  assert.equal(await readFile(resolve(taskDirectory, resultLink), 'utf8'),
    '# Result\nThe compared options are equivalent for the fixture.\n');
});
