import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(SKILL_ROOT, relativePath), 'utf8'));
}

test('catalog metadata covers every and only published category', async () => {
  const [metadata, library] = await Promise.all([
    readJson('gallery/catalog-metadata.json'),
    readJson('gallery/api/library.json'),
  ]);

  assert.equal(metadata.schemaVersion, 1);
  assert.match(metadata.catalogVersion, /^\d{4}-\d{2}-\d{2}\.\d+$/);
  assert.equal(Number(metadata.catalogVersion.split('.').at(-1)), library.effects.length);

  const publishedCategories = [...new Set(library.effects.map((effect) => effect.category))].sort();
  assert.deepEqual(Object.keys(metadata.categories).sort(), publishedCategories);

  for (const [categoryId, category] of Object.entries(metadata.categories)) {
    assert.match(categoryId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(typeof category.title.en, 'string');
    assert.equal(typeof category.title.zh, 'string');
    assert.ok(category.title.en.trim());
    assert.ok(category.title.zh.trim());
    assert.match(category.accent, /^#[0-9A-F]{6}$/);
  }
});
