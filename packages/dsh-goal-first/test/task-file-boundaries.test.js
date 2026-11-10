import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join } from 'node:path';
import { listTaskFiles, readTaskFile } from '../task-files.js';

const PREFIX = 'goal-first-task-file-boundaries-';
const TEXT_LIMIT = 256 * 1024;
const IMAGE_LIMIT = 8 * 1024 * 1024;

async function fixture(t) {
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
  const root = join(temporary, 'task');
  await mkdir(join(root, 'nested'), { recursive: true });
  await writeFile(join(root, 'index.md'), '---\nstatus: pending\n---\n# 临时任务\n');
  await writeFile(join(root, 'nested', 'notes.md'), '# 子目录资料\n\n仅做预览。\n');
  await writeFile(join(temporary, 'outside.txt'), 'outside task root');
  return { temporary, root };
}

test('lists task-relative subdirectories and reads nested UTF-8 text', async t => {
  const f = await fixture(t);
  const result = await listTaskFiles(f.root);
  assert.equal(result.root, f.root);
  assert.equal(result.path, '');
  assert.equal(result.truncated, false);
  assert.deepEqual(result.entries, [
    { name: 'nested', path: 'nested', kind: 'directory' },
    { name: 'index.md', path: 'index.md', kind: 'file' },
  ]);
  assert.deepEqual((await listTaskFiles(f.root, 'nested')).entries, [
    { name: 'notes.md', path: 'nested/notes.md', kind: 'file' },
  ]);
  const text = '# 子目录资料\n\n仅做预览。\n';
  assert.deepEqual(await readTaskFile(f.root, 'nested/notes.md'), {
    name: 'notes.md', path: 'nested/notes.md', size: Buffer.byteLength(text), kind: 'text', text, version: createHash('sha256').update(text).digest('hex'),
  });
});

test('returns HTML verbatim as source text', async t => {
  const f = await fixture(t);
  const html = '<!doctype html><html><script>globalThis.taskPreviewExecuted = true;</script><p>源码</p></html>';
  await writeFile(join(f.root, 'preview.html'), html);
  const result = await readTaskFile(f.root, 'preview.html');
  assert.equal(result.kind, 'text');
  assert.equal(result.text, html);
  assert.equal(result.contentType, undefined);
  assert.equal(result.data, undefined);
});

test('rejects absolute, parent traversal, dot-segment and malformed relative paths', async t => {
  const f = await fixture(t);
  const attacks = [
    '../outside.txt', 'nested/../../outside.txt', join(f.temporary, 'outside.txt'),
    'C:/outside.txt', 'C:\\outside.txt', '.', './index.md', 'nested/../index.md',
    'nested//notes.md', 'nested\\notes.md', 'index.md\0suffix',
  ];
  for (const path of attacks) {
    await assert.rejects(readTaskFile(f.root, path), /只能读取当前任务目录中的相对路径/, JSON.stringify(path));
    await assert.rejects(listTaskFiles(f.root, path), /只能读取当前任务目录中的相对路径/, JSON.stringify(path));
  }
  assert.equal(await readFile(join(f.temporary, 'outside.txt'), 'utf8'), 'outside task root');
});

test('lists symbolic links as links and refuses to follow internal or escaping file and directory links', async t => {
  const f = await fixture(t);
  const outsideDirectory = join(f.temporary, 'external');
  await mkdir(outsideDirectory);
  await writeFile(join(outsideDirectory, 'secret.txt'), 'external directory');
  await symlink(join(f.temporary, 'outside.txt'), join(f.root, 'outside-link.txt'));
  await symlink(join(f.root, 'index.md'), join(f.root, 'inside-link.md'));
  await symlink(outsideDirectory, join(f.root, 'directory-link'), 'dir');
  const entries = (await listTaskFiles(f.root)).entries;
  for (const name of ['outside-link.txt', 'inside-link.md', 'directory-link']) {
    assert.equal(entries.find(entry => entry.name === name)?.kind, 'link');
    await assert.rejects(readTaskFile(f.root, name), /符号链接不展开/);
    await assert.rejects(listTaskFiles(f.root, name), /符号链接不展开/);
  }
  await assert.rejects(readTaskFile(f.root, 'directory-link/secret.txt'), /符号链接不展开/);
  await assert.rejects(listTaskFiles(f.root, 'directory-link/nested'), /符号链接不展开/);
});

test('rejects directories as ordinary files', async t => {
  const f = await fixture(t);
  await assert.rejects(readTaskFile(f.root, 'nested'), /请选择普通文件/);
  await assert.rejects(readTaskFile(f.root, ''), /请选择普通文件/);
});

test('accepts text at its size bound and returns unsupported above text and image bounds', async t => {
  const f = await fixture(t);
  await writeFile(join(f.root, 'at-limit.txt'), Buffer.alloc(TEXT_LIMIT, 97));
  await writeFile(join(f.root, 'large.txt'), Buffer.alloc(TEXT_LIMIT + 1, 97));
  await writeFile(join(f.root, 'large.png'), Buffer.alloc(IMAGE_LIMIT + 1));
  const atLimit = await readTaskFile(f.root, 'at-limit.txt');
  assert.equal(atLimit.kind, 'text');
  assert.equal(atLimit.text.length, TEXT_LIMIT);
  assert.deepEqual(await readTaskFile(f.root, 'large.txt'), {
    name: 'large.txt', path: 'large.txt', size: TEXT_LIMIT + 1, kind: 'unsupported', reason: 'large', limit: TEXT_LIMIT,
  });
  assert.deepEqual(await readTaskFile(f.root, 'large.png'), {
    name: 'large.png', path: 'large.png', size: IMAGE_LIMIT + 1, kind: 'unsupported', reason: 'large', limit: IMAGE_LIMIT,
  });
});

test('returns unsupported for known binary formats, invalid UTF-8 and disguised images', async t => {
  const f = await fixture(t);
  await writeFile(join(f.root, 'file.pdf'), '%PDF-test');
  await writeFile(join(f.root, 'binary.txt'), Buffer.from([0xff, 0xfe]));
  await writeFile(join(f.root, 'nul.txt'), Buffer.from([65, 0, 66]));
  await writeFile(join(f.root, 'fake.png'), 'plain text, not an image');
  for (const [path, reason] of [['file.pdf', 'format'], ['binary.txt', 'binary'], ['nul.txt', 'binary'], ['fake.png', 'binary']]) {
    const result = await readTaskFile(f.root, path);
    assert.equal(result.kind, 'unsupported', path);
    assert.equal(result.reason, reason, path);
    assert.equal(result.text, undefined, path);
    assert.equal(result.data, undefined, path);
  }
});
