import { isAbsolute, resolve } from 'node:path';

const directory = value => typeof value === 'string' && isAbsolute(value) ? resolve(value) : null;
const timestamp = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
const title = value => typeof value === 'string' ? value.trim() : '';
const identity = value => typeof value === 'string' && value.length > 0;

/**
 * Project task history from already loaded Session summaries without opening an Agent.
 * Directory matching is lexical and absolute; no filesystem or process-cwd lookup occurs.
 * Explicit other-task bindings override cwd discovery. Missing creation times remain 0.
 */
export function taskSessionHistory({ taskId, cwd, entries = [], summaries = [], runs = [] }) {
  const target = directory(cwd);
  if (!identity(taskId) || target === null) return [];
  const bindings = new Map();
  const excluded = new Set();

  for (const run of runs) {
    for (const task of run.tasks || []) {
      if (!identity(task.sessionId)) continue;
      if (identity(task.id) && task.id !== taskId) {
        excluded.add(task.sessionId);
      } else if (task.id === taskId) {
        bindings.set(task.sessionId, {
          title: title(run.snapshots?.find(snapshot => snapshot.id === taskId)?.title) || title(task.title),
          intent: 'execution',
          createdAt: timestamp(run.createdAt),
        });
      }
    }
  }
  for (const entry of entries) {
    if (!identity(entry.sessionId)) continue;
    if (identity(entry.taskId) && entry.taskId !== taskId) excluded.add(entry.sessionId);
    else if (entry.taskId === taskId && directory(entry.cwd) === target) bindings.set(entry.sessionId, entry);
  }

  const native = new Map();
  for (const summary of summaries) {
    if (!identity(summary.sessionId)) continue;
    if (summary.origin === 'subagent') excluded.add(summary.sessionId);
    const previous = native.get(summary.sessionId);
    if (!previous || (timestamp(summary.updatedAt) ?? 0) > (timestamp(previous.updatedAt) ?? 0)) native.set(summary.sessionId, summary);
  }

  const history = [];
  for (const [sessionId, summary] of native) {
    const binding = bindings.get(sessionId);
    if (excluded.has(sessionId) || (!binding && directory(summary.cwd) !== target)) continue;
    const createdAt = timestamp(binding?.createdAt) ?? timestamp(summary.createdAt) ?? 0;
    history.push({
      sessionId,
      title: title(summary.projections?.values?.title) || title(binding?.title) || '任务对话',
      intent: title(binding?.intent) || 'conversation',
      createdAt,
      updatedAt: timestamp(summary.updatedAt) ?? createdAt,
      running: summary.running === true,
      blank: summary.blank === true,
    });
  }
  return history.sort((a, b) => b.updatedAt - a.updatedAt || (a.sessionId < b.sessionId ? -1 : a.sessionId > b.sessionId ? 1 : 0));
}
