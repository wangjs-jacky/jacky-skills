/** Shared, dependency-free workbench identities; used by the generated Client bundle. */
export function workbenchAlignmentActive(mode, sessionId, intent, filesVisible = false) {
  return mode === 'work' && !!sessionId && intent === 'alignment' && !filesVisible;
}

export function taskIsRunning(task) {
  return task.status === 'running' || task.review?.executionActive === true;
}

export function taskMatchesStatus(task, status) {
  return status === 'running' ? taskIsRunning(task) : task.status === status;
}

export function taskResumeTarget(task, project = {}) {
  const submitted = [...(project.runs || [])].reverse().flatMap(run => run.tasks || []).find(item => item.id === task.id && item.submitted && item.sessionId);
  const sessionId = task.review?.executionSessionId || task.sessionId || submitted?.sessionId;
  if (sessionId) return { kind: 'execution', sessionId };
  return task.review?.hasExecution || taskIsRunning(task) || task.status === 'done' ? { kind: 'history', sessionId: null } : null;
}

export function detailTabForKey(current, key) {
  const tabs = ['taskInfo', 'files'];
  if (key === 'Home') return tabs[0];
  if (key === 'End') return tabs[1];
  if (!['ArrowLeft', 'ArrowRight'].includes(key)) return null;
  return tabs[(tabs.indexOf(current) + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
}

export function imagePreviewResult(files, taskId, path, version, loaded) {
  return files.map(file => file.taskId === taskId && file.path === path && file.version === version ? { ...file, previewed: loaded, previewFailed: !loaded } : file);
}

export function deliveryReviewState(delivery, files, taskId, running = false) {
  const revision = deliveryApprovalRevision(delivery, files, taskId);
  const viewed = files.find(file => file.taskId === taskId && file.path === delivery.relativePath && ['text', 'image'].includes(file.kind));
  let reason = 'ready';
  if (!delivery.available) reason = 'unavailable';
  else if (running) reason = 'running';
  else if (viewed && (viewed.version !== delivery.version || viewed.reviewRevision !== delivery.revision)) reason = 'changed';
  else if (viewed?.kind === 'image' && viewed.previewFailed) reason = 'failed';
  else if (viewed?.kind === 'image' && !viewed.previewed) reason = 'loading';
  else if (delivery.approved) reason = 'approved';
  else if (!revision) reason = 'changed';
  return { reason, canApprove: reason === 'ready' && !!revision, revision: reason === 'ready' ? revision : null };
}

export function cachedTaskFile(files, taskId, path, version) {
  return files.find(file => file.taskId === taskId && file.path === path && (!version || file.version === version));
}

/** An already displayed preview must never silently inherit a newer approval token. */
export function deliveryApprovalRevision(delivery, files, taskId) {
  const viewed = files.find(file => file.taskId === taskId && file.path === delivery.relativePath && ['text', 'image'].includes(file.kind));
  if (!viewed) return delivery.revision;
  return viewed.version && viewed.version === delivery.version && viewed.reviewRevision === delivery.revision && viewed.previewed === true ? viewed.reviewRevision : null;
}

export function taskMatchesSearch(task, query) {
  const values = [task.title, task.featureTitle, task.goal, task.review?.summary, task.review?.contract?.goal,
    ...(task.expectedDeliverables || []), ...(task.review?.contract?.deliverables || []),
    ...(task.artifacts || []).map(file => file.name), ...(task.review?.deliveries || []).map(file => file.name)];
  return values.filter(Boolean).join(' ').toLocaleLowerCase().includes(String(query || '').trim().toLocaleLowerCase());
}

/** Public sessionFileAddress contract from @deepseek-ai/dsh-util-workspace-path. */
export function sessionFileAddress(sessionId, path) {
  if (typeof sessionId !== 'string' || !sessionId || typeof path !== 'string' || !path || path.includes('\0')) throw new Error('文件与会话位置不可用');
  const encodeSegment = value => encodeURIComponent(value).replace(/%3A/gi, ':');
  const normalized = path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '');
  return 'dsh-resource://file/session/' + encodeSegment(sessionId) + '/' + normalized.split('/').map(encodeSegment).join('/');
}
