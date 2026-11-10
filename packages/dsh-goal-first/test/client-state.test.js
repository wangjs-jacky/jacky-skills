import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { readTaskFile } from '../task-files.js';
import { taskMatchesSearch, cachedTaskFile, deliveryApprovalRevision, sessionFileAddress, workbenchAlignmentActive } from '../client-state.js';

async function fixture(t) {
  const parent=await realpath(tmpdir()),root=await mkdtemp(join(parent,'goal-client-files-'));
  t.after(async()=>{const actual=await realpath(root);assert.equal(dirname(actual),parent);assert.ok(basename(actual).startsWith('goal-client-files-'));assert.equal(actual,resolve(root));await rm(actual,{recursive:true});});
  const a=join(root,'A'),b=join(root,'B');await mkdir(a);await mkdir(b);return {root,a,b};
}

test('same relative filename in two actual task directories never reuses another task preview',async t=>{
  const f=await fixture(t);await writeFile(join(f.a,'result.md'),'A 的真实内容');await writeFile(join(f.b,'result.md'),'B 的真实内容');
  const a={...await readTaskFile(f.a,'result.md'),taskId:'A'};
  assert.equal(cachedTaskFile([a],'B','result.md'),undefined);
  const b={...await readTaskFile(f.b,'result.md'),taskId:'B'};
  assert.notEqual(a.text,b.text);assert.equal(cachedTaskFile([a,b],'B','result.md').text,'B 的真实内容');
});

test('preview receipts identify the actual bytes rather than merely their relative filename',async t=>{
  const f=await fixture(t);await writeFile(join(f.a,'result.md'),'版本一');
  const first=await readTaskFile(f.a,'result.md');
  assert.equal(first.version,createHash('sha256').update('版本一').digest('hex'));
  await writeFile(join(f.a,'result.md'),'版本二');
  const second=await readTaskFile(f.a,'result.md');assert.notEqual(second.version,first.version);
});

test('a visible old preview cannot approve a newly observed file or contract',async t=>{
  const f=await fixture(t);await writeFile(join(f.a,'result.md'),'版本一');const first=await readTaskFile(f.a,'result.md');
  const files=[{...first,taskId:'A',reviewRevision:'review-v1',previewed:true}];
  const v1={relativePath:'result.md',version:first.version,revision:'review-v1'};assert.equal(deliveryApprovalRevision(v1,files,'A'),'review-v1');
  await writeFile(join(f.a,'result.md'),'版本二');const second=await readTaskFile(f.a,'result.md');
  const v2={relativePath:'result.md',version:second.version,revision:'review-v2'};assert.equal(deliveryApprovalRevision(v2,files,'A'),null);
  assert.equal(deliveryApprovalRevision({...v1,revision:'new-contract'},files,'A'),null);
  const updated=[{...second,taskId:'A',reviewRevision:'review-v2',previewed:true}];assert.equal(deliveryApprovalRevision(v2,updated,'A'),'review-v2');
});

test('an image metadata response is not treated as a successfully displayed image',()=>{
  const delivery={relativePath:'image.png',version:'bytes',revision:'review'};
  const image={taskId:'A',path:'image.png',kind:'image',version:'bytes',reviewRevision:'review',previewed:false};
  assert.equal(deliveryApprovalRevision(delivery,[image],'A'),null);
  assert.equal(deliveryApprovalRevision(delivery,[{...image,previewed:true}],'A'),'review');
});

test('returning to task list restores normal details while retaining the alignment session identity',()=>{
  assert.equal(workbenchAlignmentActive('list','alignment-A','alignment'),false);
  assert.equal(workbenchAlignmentActive('work','alignment-A','alignment'),true);
  assert.equal(workbenchAlignmentActive('work','discussion-A','conversation'),false);
});

test('native resource addresses preserve session authority, absolute roots and encoded file characters',()=>{
  assert.equal(sessionFileAddress('s','/tmp/中文 #%.md'),'dsh-resource://file/session/s//tmp/%E4%B8%AD%E6%96%87%20%23%25.md');
  assert.equal(sessionFileAddress('session A','C:\\folder\\a b.md'),'dsh-resource://file/session/session%20A/C:/folder/a%20b.md');
  assert.equal(sessionFileAddress('s','./relative/path.md'),'dsh-resource://file/session/s/relative/path.md');
});

test('the actual Client filter searches condensed summaries and real delivery filenames',async()=>{
  const {runInNewContext}=await import('node:vm');
  const source=await readFile(new URL('../client.js',import.meta.url),'utf8');
  const expression=source.match(/const matches = (.+);$/m)?.[1];assert.ok(expression);
  const task={title:'任务',goal:'完整原始目标',expectedDeliverables:[],artifacts:[],review:{summary:'用户认可展示效果',contract:{goal:'完整目标',deliverables:['结果']},deliveries:[{name:'归档页面.html'}]}};
  for(const needle of ['用户认可','归档页面.html']){const matches=runInNewContext('('+expression+')',{needle,taskMatchesSearch});assert.equal(matches(task),true,needle);}
});
