#!/usr/bin/env node
// Read the selected knowledge indexes on demand; never open a browser or run a site action.
import { readFile, realpath, stat } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const slug = /^[a-z0-9][a-z0-9-]*$/;
const discovery = /^(?:read|search|sort|filter|inspect|review|extract|collect|capture|load-more|paginate|seek|switch|find|query|compare|study|browse)(?:-|$)|^follow-video-hashtags$/;
const nonDiscovery = /^(?:login|logout|like|unlike|follow-user|subscribe|unsubscribe|publish|post|create|delete|remove|update|edit|send|buy|pay|checkout|add-to-cart|save-to-favorites)(?:-|$)/;
const clean = value => value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`/g, '').trim();
class CatalogError extends Error { constructor(code, message) { super(message); this.code = code; } }

export function parseOperations(markdown) {
  const section = markdown.match(/^## 操作目录\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] || '';
  const lines = section.split('\n').filter(line => line.trim().startsWith('|'));
  if (!lines.length) return [];
  const cells = line => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(cell => cell.trim());
  const headers = cells(lines[0]).map(clean);
  const column = names => headers.findIndex(header => names.includes(header));
  const operation = column(['operation', '操作']);
  const intent = column(['intent', '标题', '用途']);
  const risk = column(['risk', '风险']);
  const date = column(['last_verified', '最近验证']);
  if (operation < 0 || intent < 0) throw new CatalogError('INVALID_INDEX', 'Operation table has unsupported columns');
  const out = [];
  for (const line of lines.slice(1)) {
    const row = cells(line);
    if (!row.length || /^:?-+/.test(row[0])) continue;
    const name = clean(row[operation] || '');
    const reference = row.join(' ').match(/\]\((operations\/[a-z0-9-]+\.md)\)/)?.[1];
    if (!slug.test(name) || !reference || reference !== `operations/${name}.md`) throw new CatalogError('INVALID_INDEX', 'Operation identity and reference differ');
    const lastVerified = row[date] && /^\d{4}-\d{2}-\d{2}$/.test(row[date]) ? row[date] : null;
    out.push({ operation: name, summary: clean(row[intent] || ''), risk: risk < 0 ? null : clean(row[risk]), last_verified: lastVerified, reference });
  }
  return out;
}

export async function listSites({ opsDir = ROOT, counts = false, ...options } = {}) {
  const body = await readFile(join(opsDir, 'references/sites/index.md'), 'utf8');
  const sites = [];
  for (const line of body.split('\n')) {
    const match = line.match(/^\|\s*\[([a-z0-9-]+)\]\(\1\/index\.md\)\s*\|\s*([^|]+)\|\s*([^|]+)\|/);
    if (match) sites.push({ id: match[1], title: match[2].trim(), use_when: match[3].trim(), reference: `references/sites/${match[1]}/index.md` });
  }
  if (!sites.length) throw new CatalogError('INVALID_INDEX', 'Site directory contains no entries');
  if (!counts) return sites;
  return Promise.all(sites.map(async site => {
    try { const result = await listSite(site.id, { opsDir, ...options }); return { ...site, count: result.items.length, source_notes: result.source_notes }; }
    catch (error) { return { ...site, count: null, error: { code: error.code || 'CATALOG_UNAVAILABLE', message: error.message } }; }
  }));
}

async function egoRoot(options) {
  const explicit = options.egoDir || process.env.EGO_OPS_DIR;
  const candidates = explicit ? [explicit] : [resolve(ROOT, '../ego-ops'),
    join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills/ego-ops'),
    join(homedir(), '.agents/skills/ego-ops'), join(homedir(), '.claude/skills/ego-ops')];
  for (const path of candidates) {
    try { if ((await stat(join(path, 'references/sites/index.md'))).isFile()) return await realpath(path); } catch {}
  }
  throw new CatalogError('EGO_OPS_UNAVAILABLE', 'Locate the installed ego-ops knowledge source before selecting browser operations');
}

export async function listSite(site, { opsDir = ROOT, query = '', ...options } = {}) {
  if (!slug.test(site)) throw new CatalogError('UNKNOWN_SITE', 'Invalid site identity');
  const known = (await listSites({ opsDir })).find(item => item.id === site);
  if (!known) throw new CatalogError('UNKNOWN_SITE', 'Site is not in this information-discovery directory; inspect Ego site navigation or explore within scope');
  const ownRoot = join(opsDir, 'references/sites', site);
  const body = await readFile(join(ownRoot, 'index.md'), 'utf8');
  const items = parseOperations(body).map(item => ({ ...item, id: `web-search-ops:${site}/${item.operation}`, source: 'web-search-ops', site, path: join(ownRoot, item.reference) }));
  const sourceNotes = [];
  const egoSite = body.match(/^ego_site:\s*([a-z0-9-]+)\s*$/m)?.[1];
  if (egoSite) {
    const root = await egoRoot(options);
    const siteRoot = join(root, 'references/sites', egoSite);
    const index = await readFile(join(siteRoot, 'index.md'), 'utf8');
    for (const item of parseOperations(index)) {
      if (nonDiscovery.test(item.operation)) continue;
      items.push({ ...item, id: `ego-ops:${egoSite}/${item.operation}`, source: 'ego-ops', site: egoSite,
        scope_hint: discovery.test(item.operation) ? 'discovery' : 'review_intent', path: join(siteRoot, item.reference) });
    }
    sourceNotes.push({ source: 'ego-ops', index: join(siteRoot, 'index.md'), scope: 'current indexed discovery entries and unclassified candidates; authentication and known write actions excluded; inspect intent and authority before acting' });
  }
  const filtered = query ? items.filter(item => `${item.id} ${item.summary}`.toLowerCase().includes(query.toLowerCase())) : items;
  return { ok: true, site, items: filtered, source_notes: sourceNotes, scope: 'knowledge_index; verify current page and authorization before execution', matched: filtered.length };
}

export async function getReference(id, options = {}) {
  const match = String(id).match(/^(ego-ops|web-search-ops):([a-z0-9-]+)\/([a-z0-9-]+)$/);
  if (!match) throw new CatalogError('INVALID_REFERENCE', 'Use a precise source:site/operation identity');
  const [, source, site] = match;
  const result = await listSite(site, options);
  const item = result.items.find(item => item.id === id && item.source === source);
  if (!item) throw new CatalogError('NOT_INDEXED', 'This operation is not an indexed information-discovery entry');
  const file = await realpath(item.path);
  const allowed = source === 'ego-ops' ? await egoRoot(options) : await realpath(options.opsDir || ROOT);
  if (!file.startsWith(allowed + sep)) throw new CatalogError('INVALID_REFERENCE', 'Reference resolves outside its knowledge source');
  return { ...item, path: file, content: await readFile(file, 'utf8') };
}

async function main(args) {
  const [action, ...rest] = args; const options = {}; const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (['--site', '--query'].includes(arg)) { const value = rest[++i]; if (!value || value.startsWith('--')) throw new CatalogError('BAD_INPUT', 'Missing option value'); options[arg.slice(2)] = value; }
    else if (arg === '--counts') options.counts = true;
    else if (arg.startsWith('--')) throw new CatalogError('BAD_INPUT', 'Unknown catalog option');
    else positional.push(arg);
  }
  if (action === 'sites' && !positional.length) return { ok: true, sites: await listSites(options) };
  if (action === 'list' && options.site && !positional.length) return listSite(options.site, options);
  if (action === 'get' && positional.length === 1) return getReference(positional[0], options);
  throw new CatalogError('BAD_INPUT', 'Usage: sites [--counts] | list --site SLUG [--query TEXT] | get SOURCE:SITE/OPERATION');
}

let direct = false;
try { direct = Boolean(process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)); } catch {}
if (direct) {
  try { console.log(JSON.stringify(await main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.log(JSON.stringify({ ok: false, error: { code: error.code || 'CATALOG_UNAVAILABLE', message: error.code ? error.message : 'Knowledge source could not be read; inspect the selected site index' } })); process.exitCode = 1; }
}
