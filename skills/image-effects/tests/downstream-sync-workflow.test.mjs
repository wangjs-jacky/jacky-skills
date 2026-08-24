import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.resolve(skillRoot, '../../.github/workflows/sync-image-effects-downstream.yml');

test('downstream sync automatically merges in release order and waits for delivery', async () => {
  const workflow = await readFile(workflowPath, 'utf8');
  const publicMerge = workflow.indexOf('name: Merge public repository PR');
  const galleryDelivery = workflow.indexOf('name: Wait for Gallery deployment');
  const pawsGeneration = workflow.indexOf('name: Generate Paws snapshot');
  const pawsMerge = workflow.indexOf('name: Merge Paws PR');
  const pawsDelivery = workflow.indexOf('name: Wait for Paws production delivery');

  assert.ok(publicMerge >= 0, 'public PR must be merged automatically');
  assert.ok(galleryDelivery > publicMerge, 'Gallery deployment must follow the public merge');
  assert.ok(pawsGeneration > galleryDelivery, 'Paws generation must wait for Gallery delivery');
  assert.ok(pawsMerge > pawsGeneration, 'Paws PR must be merged after snapshot generation');
  assert.ok(pawsDelivery > pawsMerge, 'Paws production delivery must follow the Paws merge');
  assert.match(workflow, /gh pr merge "\$public_pr"[\s\S]*--squash/);
  assert.match(workflow, /gh pr merge "\$app_pr"[\s\S]*--squash/);
  assert.match(workflow, /gh run watch "\$gallery_run_id"[\s\S]*--exit-status/);
  assert.match(workflow, /gh run watch "\$ota_run_id"[\s\S]*--exit-status/);
  assert.match(workflow, /gh run watch "\$web_run_id"[\s\S]*--exit-status/);
  assert.doesNotMatch(workflow, /node --test tests\/\*\.test\.mjs/);
  assert.match(workflow, /--test-name-pattern='从 HEAD Git 对象导出精确白名单'/);
});
