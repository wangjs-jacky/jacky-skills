#!/usr/bin/env node
import { mkdir, open, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { nativeHistory } from './native-history.mjs';

const usage = `Usage (Node.js 20+):
  codex-history.mjs list --project PATH [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--timezone ZONE]
  codex-history.mjs list --session THREAD_ID [--session THREAD_ID ...]
  codex-history.mjs export --source ROLLOUT.jsonl --out NEW_DIRECTORY [--native auto|always|never]
  Both commands: [--codex-home PATH]; export: [--codex-bin EXECUTABLE]
Only candidate metadata is printed. Export writes private analysis evidence, not a finished replay.`;

const pick = (value, keys) => Object.fromEntries(keys.filter((key) => value?.[key] !== undefined).map((key) => [key, value[key]]));
const metaKeys = ['id', 'session_id', 'timestamp', 'cwd', 'history_mode', 'history_base', 'forked_from_id', 'cli_version'];
const timeValue = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;

export function dayAt(value, timezone) {
  const time = timeValue(value);
  if (time === null) return null;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(time);
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${values.year}-${values.month}-${values.day}`;
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid date: ${value}`);
  }
}

async function canonical(path) {
  let parent = resolve(path);
  const suffix = [];
  for (;;) {
    try { return join(await realpath(parent), ...suffix); }
    catch (error) { if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error; }
    const next = dirname(parent);
    if (next === parent) return resolve(path);
    suffix.unshift(basename(parent));
    parent = next;
  }
}
function contains(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
}

async function* rollouts(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* rollouts(path);
    else if (entry.isFile() && /^rollout-.*\.jsonl$/.test(entry.name)) yield path;
  }
}

export async function scan(path, onRecord = async () => {}) {
  const input = await open(path, 'r');
  let lines;
  try {
    const before = await input.stat();
    if (!before.isFile()) throw new Error('Source must be a regular file');
    const hash = createHash('sha256');
    const summary = { path: await realpath(path), bytes: 0, lines: 0, records: 0, metadata: null, cwds: [], firstTimestamp: null, lastTimestamp: null, warnings: [] };
    const cwds = new Set();
    let lastByte;
    // Freeze the read length so a live conversation cannot make this scan unbounded.
    const stream = before.size ? input.createReadStream({ start: 0, end: before.size - 1, autoClose: false }) : null;
    if (stream) {
      stream.on('data', (chunk) => { hash.update(chunk); summary.bytes += chunk.length; lastByte = chunk.at(-1); });
      lines = createInterface({ input: stream, crlfDelay: Infinity });
      for await (const line of lines) {
        summary.lines++;
        if (!line.trim()) continue;
        let record;
        try { record = JSON.parse(line); }
        catch { summary.warnings.push(`invalid_json:line:${summary.lines}`); continue; }
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
          summary.warnings.push(`invalid_record:line:${summary.lines}`); continue;
        }
        summary.records++;
        if (record.type === 'session_meta') {
          const metadata = pick(record.payload, metaKeys);
          if (summary.metadata && metadata.id !== summary.metadata.id) summary.warnings.push('conflicting_thread_metadata');
          summary.metadata ??= metadata;
        }
        if (['session_meta', 'turn_context'].includes(record.type) && typeof record.payload?.cwd === 'string') cwds.add(record.payload.cwd);
        const time = timeValue(record.timestamp);
        if (time !== null) {
          if (summary.firstTimestamp === null || time < Date.parse(summary.firstTimestamp)) summary.firstTimestamp = record.timestamp;
          if (summary.lastTimestamp === null || time > Date.parse(summary.lastTimestamp)) summary.lastTimestamp = record.timestamp;
        }
        await onRecord(record, summary.lines);
      }
    }
    const after = await input.stat();
    summary.sha256 = hash.digest('hex');
    summary.cwds = [...cwds];
    if (summary.bytes !== before.size || before.size !== after.size || before.mtimeMs !== after.mtimeMs) summary.warnings.push('source_changed_during_read');
    if (lastByte !== undefined && lastByte !== 10) summary.warnings.push('unterminated_last_line');
    if (!summary.metadata?.id) summary.warnings.push('missing_thread_id');
    if (!summary.firstTimestamp) summary.warnings.push('missing_timestamps');
    return summary;
  } finally { lines?.close(); await input.close(); }
}

export async function listCandidates({ home, project, sessions = [], from, to, timezone = 'UTC' }) {
  new Intl.DateTimeFormat('en', { timeZone: timezone }); // validate the IANA zone before scanning
  if (from) validateDate(from);
  if (to) validateDate(to);
  if (from && to && from > to) throw new Error('--from must not be after --to');
  if (!project && !sessions.length) throw new Error('Provide --project or --session to bound discovery');
  const target = project ? await canonical(project) : null;
  const candidates = [];
  for (const folder of ['sessions', 'archived_sessions']) {
    for await (const path of rollouts(join(home, folder))) {
      const source = await scan(path);
      if (sessions.length && !sessions.includes(source.metadata?.id)) continue;
      const first = dayAt(source.firstTimestamp, timezone);
      const last = dayAt(source.lastTimestamp, timezone);
      if ((to && first && first > to) || (from && last && last < from)) continue;
      let match = sessions.length ? 'explicit_thread' : null;
      if (!match && target) {
        const cwds = await Promise.all(source.cwds.map(canonical));
        if (cwds.includes(target)) match = 'exact_cwd';
        else if (cwds.some((cwd) => contains(target, cwd))) match = 'cwd_inside_project';
        else if (cwds.some((cwd) => contains(cwd, target))) match = 'shared_parent_candidate';
      }
      if (!match) continue;
      candidates.push({ ...source, match });
    }
  }
  candidates.sort((a, b) => (timeValue(a.firstTimestamp) ?? 0) - (timeValue(b.firstTimestamp) ?? 0) || a.path.localeCompare(b.path));
  return { timezone, from: from ?? null, to: to ?? null, candidates };
}

function relevant(record) {
  if (['world_state', 'token_usage_record'].includes(record.type)) return false;
  if (record.type === 'response_item' && record.payload?.type === 'reasoning') return false;
  if (record.type === 'event_msg' && ['token_count', 'agent_reasoning', 'agent_reasoning_raw_content', 'agent_reasoning_section_break'].includes(record.payload?.type)) return false;
  if (record.type === 'event_msg' && record.payload?.item?.type === 'reasoning') return false;
  return true;
}

function prepareRecord(record) {
  if (record.type === 'session_meta') return { ...record, payload: pick(record.payload, metaKeys) };
  if (record.type === 'turn_context') return { ...record, payload: pick(record.payload, ['turn_id', 'root_turn_id', 'cwd', 'model', 'current_date', 'timezone']) };
  return record;
}

export async function exportEvidence({ source, out, home, native = 'auto', executable, readNative = nativeHistory }) {
  if (!['auto', 'always', 'never'].includes(native)) throw new Error('--native must be auto, always or never');
  const sourcePath = await realpath(source);
  const sourceStat = await stat(sourcePath);
  if (!sourceStat.isFile()) throw new Error('Source must be a regular file');
  const destination = resolve(out);
  // No recursive create here: EEXIST protects both existing reports and source dirs.
  await mkdir(destination, { mode: 0o700 });
  const evidence = await open(join(destination, 'events.jsonl'), 'wx', 0o600);
  const append = (value) => evidence.writeFile(JSON.stringify(value) + '\n');
  let metadata;
  let hasCompaction = false;
  const observedTurns = new Set();
  let eventCount = 0;
  try {
    metadata = await scan(sourcePath, async (record, line) => {
      if (record.type === 'compacted' || record.payload?.type === 'context_compacted') hasCompaction = true;
      const turnId = record.payload?.turn_id;
      if (typeof turnId === 'string') observedTurns.add(turnId);
      if (!relevant(record)) return;
      await append({ source: 'rollout', ref: { path: sourcePath, line, ordinal: record.ordinal ?? null }, record: prepareRecord(record) });
      eventCount++;
    });
    const meta = metadata.metadata ?? {};
    const needsNative = meta.history_mode === 'paginated' || Boolean(meta.history_base || meta.forked_from_id) || hasCompaction;
    const warnings = [...metadata.warnings];
    let projection = null;
    if (native === 'always' || (native === 'auto' && needsNative)) {
      if (!meta.id) warnings.push('native_unavailable:missing_thread_id');
      else {
        try {
          const result = await readNative(meta.id, { home, executable });
          if (result.thread.id !== meta.id) throw new Error('Native thread ID mismatch');
          if (result.thread.path && await canonical(result.thread.path) !== sourcePath) {
            throw new Error('Native source path differs; select the matching Codex home');
          }
          const turns = result.thread.turns;
          const nativeTurns = new Set(turns.map((turn) => turn.id));
          if (!turns.length) warnings.push('native_history_empty');
          if ([...observedTurns].some((id) => !nativeTurns.has(id))) warnings.push('rollout_turns_absent_from_native:check_rollback_or_missing_history');
          for (const turn of turns) {
            if (turn.status !== 'completed') warnings.push(`turn_not_completed:${turn.id}`);
            for (const item of turn.items) {
              if (item.type === 'reasoning') continue;
              await append({ source: 'native', ref: { threadId: meta.id, turnId: turn.id, itemId: item.id }, turn: pick(turn, ['status', 'startedAt', 'completedAt', 'durationMs', 'error']), item });
              eventCount++;
            }
          }
          projection = { method: result.method, readAt: new Date().toISOString(), turns: turns.length, forkedFromId: result.thread.forkedFromId ?? null };
        } catch (error) { warnings.push(`native_unavailable:${error.message}`); }
      }
    } else if (needsNative) warnings.push('native_required_but_skipped');
    const afterNative = await stat(sourcePath);
    if (afterNative.size !== metadata.bytes || afterNative.mtimeMs !== sourceStat.mtimeMs) warnings.push('source_changed_during_export');
    const manifest = {
      format: 'codex-project-replay-evidence-v1', exportedAt: new Date().toISOString(),
      ...metadata, warnings: [...new Set(warnings)], projection, eventCount,
      coverage: warnings.length ? 'needs_review' : 'readable_snapshot',
      note: 'Coverage describes captured records, not proof that all historical actions or attachments were recorded. Rollout and native entries can be mirrors; reconcile by IDs before counting actions.',
    };
    await writeFile(join(destination, 'source.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return { directory: destination, threadId: meta.id ?? null, eventCount, coverage: manifest.coverage, warnings: manifest.warnings };
  } finally { await evidence.close(); }
}

export async function main(argv) {
  const [command, ...args] = argv;
  if (!command || ['--help', '-h'].includes(command)) { console.log(usage); return; }
  if (!['list', 'export'].includes(command)) throw new Error(usage);
  const allowed = command === 'list'
    ? new Set(['project', 'session', 'from', 'to', 'timezone', 'codex-home'])
    : new Set(['source', 'out', 'native', 'codex-home', 'codex-bin']);
  const options = { sessions: [] };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    if (!args[i].startsWith('--') || !allowed.has(key) || !value || value.startsWith('--')) throw new Error(`Invalid option: ${args[i]}`);
    if (key === 'session') options.sessions.push(value);
    else if (options[key] !== undefined) throw new Error(`Duplicate option: ${key}`);
    else options[key] = value;
  }
  const home = resolve(options['codex-home'] ?? process.env.CODEX_HOME ?? join(homedir(), '.codex'));
  if (!(await stat(home)).isDirectory()) throw new Error('Codex home must be an existing directory');
  let result;
  if (command === 'list') result = await listCandidates({ ...options, home });
  else {
    if (!options.source || !options.out) throw new Error('export requires --source and --out');
    result = await exportEvidence({ ...options, home, executable: options['codex-bin'] });
  }
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
