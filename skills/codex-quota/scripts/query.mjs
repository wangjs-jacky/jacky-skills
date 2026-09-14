import { createReadStream, realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

export function quotaRecord(record) {
  if (record?.type !== 'event_msg' || record.payload?.type !== 'token_count') return null;
  const q = record.payload.rate_limits;
  const time = Date.parse(record.timestamp);
  if (!q || !Number.isFinite(time) || (q.limit_id != null && q.limit_id !== 'codex')) return null;
  const windows = ['primary', 'secondary'].flatMap(bucket => {
    const w = q[bucket];
    if (!w || !Number.isFinite(w.used_percent) || w.used_percent < 0 || w.used_percent > 100) return [];
    const reset = Number.isFinite(w.resets_at) ? new Date(w.resets_at * 1000) : null;
    return [{ bucket, windowMinutes: Number.isFinite(w.window_minutes) && w.window_minutes > 0 ? w.window_minutes : null,
      usedPercent: w.used_percent, remainingPercent: 100 - w.used_percent,
      resetsAt: reset && Number.isFinite(reset.getTime()) ? reset.toISOString() : null }];
  });
  return windows.length ? { observedAt: new Date(time).toISOString(), windows } : null;
}

export async function scanQuota(root) {
  let latest = null;
  let filesScanned = 0;
  let readErrors = 0;
  let malformedLines = 0;
  async function walk(dir, optionalRoot = false) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch (error) { if (!(optionalRoot && error.code === 'ENOENT')) readErrors++; return; }
    for (const entry of entries) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) { await walk(file); continue; }
      if (!entry.isFile() || !entry.name.endsWith('.jsonl')) continue;
      try {
        const input = createReadStream(file, { encoding: 'utf8' });
        const lines = createInterface({ input, crlfDelay: Infinity });
        // Forward asynchronous file errors to readline's async iterator.
        input.on('error', error => lines.emit('error', error));
        try {
          for await (const line of lines) {
            if (!line.includes('token_count')) continue;
            let record;
            try { record = JSON.parse(line); } catch { malformedLines++; continue; }
            const candidate = quotaRecord(record);
            if (candidate && (!latest || candidate.observedAt > latest.observedAt)) latest = candidate;
          }
          filesScanned++;
        } finally { lines.close(); input.destroy(); }
      } catch { readErrors++; }
    }
  }
  await walk(join(root, 'sessions'), true);
  await walk(join(root, 'archived_sessions'), true);
  const scannedAt = new Date().toISOString();
  return { source: resolve(root), scannedAt, status: latest ? 'found' : 'unknown',
    observedAt: latest?.observedAt ?? null,
    windows: (latest?.windows ?? []).map(w => ({ ...w, expired: w.resetsAt ? w.resetsAt <= scannedAt : null })),
    filesScanned, partial: readErrors > 0 || malformedLines > 0, readErrors, malformedLines };
}

async function main() {
  const args = process.argv.slice(2);
  let root = process.env.CODEX_HOME || join(homedir(), '.codex');
  let compare = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--compare-default') compare = true;
    else if (args[i] === '--home' && args[i + 1] && !args[i + 1].startsWith('--')) root = args[++i];
    else if (args[i] === '--help') { console.log('node query.mjs [--home DIRECTORY] [--compare-default]'); return; }
    else throw new Error('Usage: node query.mjs [--home DIRECTORY] [--compare-default]');
  }
  const roots = [...new Set([root, ...(compare ? [join(homedir(), '.codex')] : [])].map(p => resolve(p)))];
  for (const directory of roots) console.log(JSON.stringify(await scanQuota(directory), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
