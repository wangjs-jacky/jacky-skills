import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import * as state from '../client-state.js';

const receipt={taskId:'A',path:'result.md',kind:'text',version:'bytes-v1',reviewRevision:'review-v1',previewed:true};
const delivery={relativePath:'result.md',available:true,approved:false,version:'bytes-v1',revision:'review-v1'};

test('reading a final delivery after alignment keeps task details available without changing session authority',()=>{
  assert.equal(state.workbenchAlignmentActive('work','alignment-A','alignment',true),false);
  assert.equal(state.workbenchAlignmentActive('work','alignment-A','alignment',false),true);
});

test('the running filter includes real execution activity before the document changes status',()=>{
  const active={status:'pending',review:{executionActive:true}},discussion={status:'pending',review:{executionActive:false}};
  assert.equal(state.taskMatchesStatus(active,'running'),true);assert.equal(state.taskMatchesStatus(discussion,'running'),false);
  assert.equal(state.taskMatchesStatus({status:'running'},'running'),true);assert.equal(state.taskMatchesStatus({status:'blocked'},'blocked'),true);
});

test('existing executions are directly recoverable and old completed tasks offer history without creating a discussion',()=>{
  assert.deepEqual(state.taskResumeTarget({id:'A',status:'done',review:{executionSessionId:'execution-A'}}),{kind:'execution',sessionId:'execution-A'});
  assert.deepEqual(state.taskResumeTarget({id:'A',status:'done'}),{kind:'history',sessionId:null});
  assert.equal(state.taskResumeTarget({id:'A',status:'pending'}),null);
  assert.deepEqual(state.taskResumeTarget({id:'A',mode:'stage',status:'review'},{runs:[{tasks:[{id:'A',submitted:true,sessionId:'stage-A'}]}]}),{kind:'execution',sessionId:'stage-A'});
});

test('a changed file or agreement explains why approval is unavailable and preserves the viewed token',()=>{
  assert.equal(state.deliveryReviewState(delivery,[receipt],'A').reason,'ready');
  const changed=state.deliveryReviewState({...delivery,version:'bytes-v2',revision:'review-v2'},[receipt],'A');
  assert.equal(changed.reason,'changed');assert.equal(changed.canApprove,false);assert.equal(changed.revision,null);
  assert.equal(state.deliveryReviewState({...delivery,revision:'new-agreement'},[receipt],'A').reason,'changed');
});

test('unavailable, executing and failed image previews provide distinct recovery states',()=>{
  assert.equal(state.deliveryReviewState({...delivery,available:false},[receipt],'A').reason,'unavailable');
  assert.equal(state.deliveryReviewState(delivery,[receipt],'A',true).reason,'running');
  const image={...receipt,kind:'image',previewed:false};
  assert.equal(state.deliveryReviewState(delivery,[image],'A').reason,'loading');
  assert.equal(state.deliveryReviewState(delivery,[{...image,previewFailed:true}],'A').reason,'failed');
});

test('late image outcomes cannot mark another task or another byte version as displayed',()=>{
  const current={...receipt,kind:'image',version:'bytes-v2',previewed:false};
  const files=[current];
  assert.equal(state.imagePreviewResult(files,'B','result.md','bytes-v2',true)[0].previewed,false);
  assert.equal(state.imagePreviewResult(files,'A','result.md','bytes-v1',true)[0].previewed,false);
  const failed=state.imagePreviewResult(files,'A','result.md','bytes-v2',false);assert.equal(failed[0].previewFailed,true);
  const loaded=state.imagePreviewResult(failed,'A','result.md','bytes-v2',true);assert.equal(loaded[0].previewed,true);assert.equal(loaded[0].previewFailed,false);
});

test('detail tabs support keyboard movement while other keys retain their normal behavior',()=>{
  assert.equal(state.detailTabForKey('taskInfo','ArrowRight'),'files');assert.equal(state.detailTabForKey('taskInfo','ArrowLeft'),'files');
  assert.equal(state.detailTabForKey('files','Home'),'taskInfo');assert.equal(state.detailTabForKey('taskInfo','End'),'files');assert.equal(state.detailTabForKey('files','Tab'),null);
});

test('the actual execution callback leaves a previous alignment view before history returns',async()=>{
  const source=await readFile(new URL('../client.js',import.meta.url),'utf8');const start=source.indexOf('async function executeTask(item)'),end=source.indexOf('function selectSession(',start);assert.ok(start>=0&&end>start);
  let intent='alignment',session=null;
  const execute=runInNewContext('('+source.slice(start,end).trim()+')',{creating:false,selectTask(){},viewGeneration:{current:0},setCreating(){},setError(){},onExecute:async()=>({sessionId:'execution-B',intent:'execution'}),project:{revision:1,reviewToken:'r'},mounted:{current:true},setTaskId(){},setSessionId:value=>{session=value;},setSessionIntent:value=>{intent=value;},setMode(){},setSideOpen(){},loadHistory(){},t:value=>value});
  await execute({id:'B'});assert.equal(session,'execution-B');assert.equal(intent,'execution');
});

test('the actual resume action opens the original identity without creating or sending a task',async()=>{
  const source=await readFile(new URL('../client.js',import.meta.url),'utf8'),start=source.indexOf('function resumeTask('),end=source.indexOf('function updateReview(',start);assert.ok(start>=0&&end>start);
  let session,intent,history,created=0,lookups=0;
  const resume=runInNewContext('('+source.slice(start,end).trim()+')',{taskResumeTarget:state.taskResumeTarget,project:{runs:[]},selectTask(){},setFilesVisible(){},setMode(){},setSessionId:value=>{session=value;},setSessionIntent:value=>{intent=value;},setHistoryOpen:value=>{history=value;},loadHistory(){lookups++;},onCreate(){created++;}});
  resume({id:'A',status:'done',review:{executionSessionId:'original-execution'}});assert.equal(session,'original-execution');assert.equal(intent,'execution');assert.equal(history,false);
  resume({id:'B',status:'done'});assert.equal(session,null);assert.equal(history,true);assert.equal(created,0);assert.equal(lookups,2);
});

test('refreshing an actual final-file preview binds fresh bytes to the returned read-only review',async()=>{
  const source=await readFile(new URL('../client.js',import.meta.url),'utf8'),start=source.indexOf('async function openFile('),end=source.indexOf('async function openArtifact(',start);assert.ok(start>=0&&end>start);
  const selected={id:'A',review:{deliveries:[{relativePath:'result.md',version:'v1',revision:'r1'}]}},fresh={deliveries:[{relativePath:'result.md',version:'v2',revision:'r2'}]};
  let files=[],reviewUpdated=null;const reads=[];
  const open=runInNewContext('('+source.slice(start,end).trim()+')',{task:selected,setFilesVisible(){},setMode(){},setActiveFile(){},setFileError(){},fileRequest:{current:null},setFileBusy(){},deliveryItems:task=>task.review.deliveries,cachedTaskFile:state.cachedTaskFile,openedFiles:[],AbortController,read:async(...args)=>{assert.equal(args.length,2);reads.push(args[0]);return args[0].startsWith('task-file?')?{path:'result.md',name:'result.md',kind:'text',version:'v2',text:'新内容'}:fresh;},updateReview:(id,value)=>{assert.equal(id,'A');reviewUpdated=value;},setOpenedFiles:fn=>{files=fn(files);},t:value=>value});
  await open('result.md',true,selected);assert.equal(files[0].version,'v2');assert.equal(files[0].reviewRevision,'r2');assert.equal(files[0].text,'新内容');assert.equal(reviewUpdated,fresh);assert.equal(reads.length,2);
});
