import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

// This client has no method for starting, resuming or mutating a thread.
const allowed = new Set(['initialize', 'thread/read', 'thread/turns/list', 'thread/items/list']);

export function connect({ executable = 'codex', home, timeoutMs = 20_000 } = {}) {
  const child = spawn(executable, ['app-server', '--listen', 'stdio://'], {
    env: { ...process.env, ...(home ? { CODEX_HOME: home } : {}) },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const pending = new Map();
  let nextId = 1;
  let closed = false;
  const fail = (error) => {
    closed = true;
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    pending.clear();
  };
  // Stderr can contain private configuration; drain it without copying to reports.
  child.stderr.resume();
  child.stdin.on('error', () => fail(new Error('Codex history input closed')));
  child.on('error', () => fail(new Error('Cannot start the selected Codex executable')));
  child.on('exit', () => fail(new Error('Codex history process exited')));
  const lines = createInterface({ input: child.stdout });
  lines.on('line', (line) => {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    if (message.method && message.id !== undefined) {
      // Refuse unsolicited server requests, including approvals.
      child.stdin.write(JSON.stringify({ id: message.id, error: { code: -32601, message: 'History reader only' } }) + '\n');
      return;
    }
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error) {
      const error = new Error(`Codex ${entry.method} failed (code ${message.error.code ?? 'unknown'})`);
      error.code = message.error.code;
      entry.reject(error);
    } else entry.resolve(message.result);
  });
  return {
    request(method, params) {
      if (!allowed.has(method)) return Promise.reject(new Error(`Disallowed history method: ${method}`));
      if (closed) return Promise.reject(new Error('Codex history connection is closed'));
      return new Promise((resolve, reject) => {
        const id = nextId++;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Codex ${method} timed out`));
        }, timeoutMs);
        pending.set(id, { resolve, reject, timer, method });
        child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
      });
    },
    initialized() { child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n'); },
    close() {
      lines.close();
      child.stdin.end();
      child.kill('SIGTERM');
      const timer = setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 1000);
      timer.unref();
      fail(new Error('History read finished'));
    },
  };
}

async function pages(request, method, params) {
  const results = [];
  const cursors = new Set();
  let cursor = null;
  for (let page = 0; page < 10_000; page++) {
    const response = await request(method, { ...params, cursor, limit: 100, sortDirection: 'asc' });
    if (!Array.isArray(response?.data) || !Object.hasOwn(response, 'nextCursor')) {
      throw new Error(`Unexpected ${method} response; pagination completeness unknown`);
    }
    results.push(...response.data);
    cursor = response.nextCursor;
    if (cursor === null) return results;
    if (typeof cursor !== 'string' || !cursor || cursors.has(cursor)) throw new Error(`Invalid or repeated ${method} cursor`);
    cursors.add(cursor);
  }
  throw new Error(`Too many ${method} pages`);
}

function uniqueById(items, label) {
  const result = new Map();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id) throw new Error(`Missing ${label} ID`);
    if (result.has(item.id) && JSON.stringify(result.get(item.id)) !== JSON.stringify(item)) {
      throw new Error(`${label} changed between pages; read again after the turn settles`);
    }
    result.set(item.id, item);
  }
  return [...result.values()];
}

export async function readThread(request, threadId) {
  const response = await request('thread/read', { threadId, includeTurns: false });
  if (response?.thread?.id !== threadId) throw new Error('Codex returned a different thread');
  let turns;
  let method = 'paged';
  try {
    turns = await pages(request, 'thread/turns/list', { threadId, itemsView: 'full' });
  } catch (error) {
    // Do not hide corrupt indexes, permissions or timeouts behind a legacy read.
    if (error.code !== -32601) throw error;
    const full = await request('thread/read', { threadId, includeTurns: true });
    if (full?.thread?.id !== threadId || !Array.isArray(full.thread.turns)) throw new Error('Invalid legacy thread history');
    turns = full.thread.turns;
    method = 'legacy';
  }
  turns = uniqueById(turns, 'turn');
  for (const turn of turns) {
    if (turn.itemsView && turn.itemsView !== 'full') {
      const entries = await pages(request, 'thread/items/list', { threadId, turnId: turn.id });
      turn.items = entries.map((entry) => {
        if (entry.turnId !== turn.id || !entry.item) throw new Error('Item belongs to a different turn');
        return entry.item;
      });
      turn.itemsView = 'full';
    }
    if (!Array.isArray(turn.items)) throw new Error('Turn items are missing');
    turn.items = uniqueById(turn.items, 'item');
  }
  return { thread: { ...response.thread, turns }, method };
}

export async function nativeHistory(threadId, options = {}) {
  const client = connect(options);
  try {
    await client.request('initialize', {
      clientInfo: { name: 'codex_project_replay', title: 'Project Replay', version: '0.1.0' },
      capabilities: { experimentalApi: true },
    });
    client.initialized();
    return await readThread(client.request, threadId);
  } finally { client.close(); }
}
