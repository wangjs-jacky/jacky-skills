#!/usr/bin/env node
// Documented HTTP services / official feeds. Browser work belongs to Ego.
import { execFile } from 'node:child_process';
import { constants, realpathSync } from 'node:fs';
import { access, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import * as http from 'node:http';
import { delimiter, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'config.local.json');
const MAX_OUTPUT = 2 * 1024 * 1024;
const ENDPOINTS = { tavily: 'https://api.tavily.com/search', exa: 'https://mcp.exa.ai/mcp', producthunt: 'https://www.producthunt.com/feed' };
let environmentProxyEnabled = false;
// Python is only the existing account-pool Keychain backend; its stdout stays in process memory.
const POOL_BRIDGE = `import importlib.util, json, sys
try:
    spec = importlib.util.spec_from_file_location("account_pool", sys.argv[1])
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    pool = module.Pool()
    configured = any(row.get("enabled") for row in pool.list_entries("tavily"))
    out = {"configured": configured}
    if configured and sys.argv[2] == "secret":
        out["secret"] = pool.get_secret("tavily")
    print(json.dumps(out))
except Exception:
    print(json.dumps({"error": "ACCOUNT_POOL_UNAVAILABLE"}))
    sys.exit(1)
`;

class Failure extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export async function loadConfig(path = CONFIG_PATH) {
  let content;
  try { content = await readFile(path, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw new Failure('CONFIG_ERROR', 'Cannot read local configuration'); }
  let config;
  try { config = JSON.parse(content); } catch { throw new Failure('CONFIG_ERROR', 'Local configuration must be valid JSON'); }
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Failure('CONFIG_ERROR', 'Invalid local configuration');
  for (const key of ['ghCommand', 'pythonCommand', 'accountPoolScript']) {
    if (config[key] !== undefined && (typeof config[key] !== 'string' || !config[key].trim())) throw new Failure('CONFIG_ERROR', `Invalid nonsecret field: ${key}`);
  }
  if (config.systemCaCommands !== undefined && (!Array.isArray(config.systemCaCommands) || config.systemCaCommands.some(name => name !== 'gh'))) {
    throw new Failure('CONFIG_ERROR', 'systemCaCommands accepts only gh');
  }
  if (config.useEnvironmentProxy !== undefined && typeof config.useEnvironmentProxy !== 'boolean') throw new Failure('CONFIG_ERROR', 'useEnvironmentProxy must be boolean');
  return config;
}

export function commandEnvironment(name, config = {}, env = process.env) {
  const out = { ...env };
  if (name === 'gh' && config.systemCaCommands?.includes('gh')) { delete out.SSL_CERT_FILE; delete out.SSL_CERT_DIR; }
  return out;
}

function safeMessage(value, secrets = []) {
  let out = String(value ?? '');
  for (const secret of secrets) if (secret) out = out.split(secret).join('[redacted]');
  return out.replace(/https?:\/\/[^\s/@]+:[^\s/@]+@/gi, 'https://[redacted]@')
    .replace(/([?&](?:api[_-]?key|access[_-]?token|token|password|secret|xsec_token|signature)=)[^&\s]+/gi, '$1[redacted]')
    .replace(/\b(?:tvly-[\w-]+|gh[pousr]_[\w]+)\b/g, '[redacted]')
    .replace(/\b(Bearer\s+)\S+/gi, '$1[redacted]').trim().slice(0, 500);
}

function options(input = {}) {
  const out = { config: {}, env: process.env, limit: 5, timeoutMs: 20000, transport: globalThis.fetch, ...input };
  if (!Number.isInteger(out.limit) || out.limit < 1 || out.limit > 20) throw new Failure('BAD_INPUT', 'limit must be an integer from 1 to 20');
  if (!Number.isFinite(out.timeoutMs) || out.timeoutMs <= 0 || out.timeoutMs > 60000) throw new Failure('BAD_INPUT', 'timeout must be positive and at most 60 seconds');
  return out;
}

function runCommand(name, args, opts) {
  const executable = opts.config[name === 'gh' ? 'ghCommand' : 'pythonCommand'] || name;
  return new Promise(resolveRun => execFile(executable, args, {
    env: commandEnvironment(name, opts.config, opts.env), shell: false, timeout: opts.timeoutMs,
    killSignal: 'SIGKILL', maxBuffer: MAX_OUTPUT, encoding: 'utf8',
  }, (error, stdout, stderr) => {
    const failure = !error ? null : error.code === 'ENOENT' ? new Failure('UNAVAILABLE', `${name} is not available`)
      : error.killed ? new Failure('TIMEOUT', 'Subprocess timed out')
      : new Failure('COMMAND_FAILED', name === 'gh' ? safeMessage(stderr) || 'gh failed' : 'Secure credential lookup failed');
    resolveRun({ stdout, error: failure });
  }));
}

async function executablePath(command, env) {
  const candidates = command.includes('/') ? [isAbsolute(command) ? command : resolve(command)]
    : (env.PATH || '').split(delimiter).filter(Boolean).map(dir => join(dir, command));
  for (const path of candidates) { try { await access(path, constants.X_OK); if ((await stat(path)).isFile()) return path; } catch {} }
  return null;
}

async function accountPoolPath(opts) {
  const candidates = opts.config.accountPoolScript ? [opts.config.accountPoolScript] : [
    join(opts.env.CODEX_HOME || join(homedir(), '.codex'), 'skills/account-pool-ops/scripts/account_pool.py'),
    join(homedir(), '.agents/skills/account-pool-ops/scripts/account_pool.py'),
    join(homedir(), '.claude/skills/account-pool-ops/scripts/account_pool.py'),
  ];
  for (const path of candidates) { try { if ((await stat(path)).isFile()) return path; } catch {} }
  return null;
}

async function lookupTavily(opts, mode = 'secret') {
  if (mode === 'secret' && opts.getCredential) return await opts.getCredential();
  const path = await accountPoolPath(opts);
  if (!path) return null;
  const run = await runCommand('python3', ['-c', POOL_BRIDGE, path, mode], opts);
  if (run.error) throw new Failure(run.error.code, 'Secure credential lookup unavailable');
  let value;
  try { value = JSON.parse(run.stdout); } catch { throw new Failure('ACCOUNT_POOL_UNAVAILABLE', 'Secure credential lookup returned invalid metadata'); }
  if (value.error) throw new Failure('ACCOUNT_POOL_UNAVAILABLE', 'Secure credential lookup unavailable');
  return mode === 'probe' ? value.configured === true : value.configured === true && typeof value.secret === 'string' ? value.secret : null;
}

export function normalizeSourceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (/^(?:localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)
      || /(?:\.localhost|\.local|\.internal)$/.test(host) || host.startsWith('[')) return null;
    if ([...url.searchParams.keys()].some(key => /^(?:api[_-]?key|access[_-]?token|token|password|secret|xsec_token|signature)$/i.test(key))) return null;
    url.hash = '';
    return url.href;
  } catch { return null; }
}

async function request(url, init, opts) {
  if (opts.config.useEnvironmentProxy && opts.transport === globalThis.fetch && !environmentProxyEnabled) {
    if (typeof http.setGlobalProxyFromEnv !== 'function') throw new Failure('UNSUPPORTED_RUNTIME', 'This proxy opt-in requires a Node runtime with setGlobalProxyFromEnv');
    http.setGlobalProxyFromEnv();
    environmentProxyEnabled = true;
  }
  const controller = new AbortController();
  let timer;
  const operation = async () => {
    const response = await opts.transport(url, { ...init, signal: controller.signal, redirect: 'error' });
    if (!response.ok) throw new Failure(`HTTP_${response.status}`, `Service returned HTTP ${response.status}`);
    if (Number(response.headers?.get('content-length')) > MAX_OUTPUT) throw new Failure('OUTPUT_LIMIT', 'Response is too large');
    const reader = response.body?.getReader();
    if (!reader) return '';
    const chunks = []; let length = 0;
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.length;
      if (length > MAX_OUTPUT) { await reader.cancel(); throw new Failure('OUTPUT_LIMIT', 'Response is too large'); }
      chunks.push(Buffer.from(part.value));
    }
    return Buffer.concat(chunks).toString('utf8');
  };
  try {
    return await Promise.race([operation(), new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Failure('TIMEOUT', 'HTTP request timed out')); }, opts.timeoutMs);
    })]);
  } finally { clearTimeout(timer); }
}

function normalizedItems(rows, source, limit) {
  if (!Array.isArray(rows)) throw new Failure('INVALID_PAYLOAD', 'Provider did not return a results array');
  const seen = new Set(); const items = [];
  for (const row of rows) {
    const url = normalizeSourceUrl(row?.url);
    const title = typeof row?.title === 'string' ? row.title.trim() : '';
    const text = typeof row?.text === 'string' ? row.text.trim() : '';
    if (!url || seen.has(url) || (!title && !text)) continue;
    seen.add(url); items.push({ title: title || null, url, text: text || null, source });
    if (items.length >= limit) break;
  }
  if (!items.length) throw new Failure('EMPTY_RESULTS', 'Provider returned no usable results with public source URLs');
  return items;
}

function exaText(body) {
  let payload;
  try {
    const messages = body.includes('\ndata:') || body.startsWith('data:')
      ? body.split(/\r?\n\r?\n/).map(event => event.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n')).filter(Boolean).filter(text => text !== '[DONE]').map(text => JSON.parse(text))
      : [JSON.parse(body)];
    payload = messages.findLast(message => message?.result || message?.error);
  } catch { throw new Failure('MALFORMED_JSON', 'Exa returned malformed JSON/MCP events'); }
  if (!payload || payload.error || payload.result?.isError) throw new Failure('UPSTREAM_ERROR', 'Exa reported an MCP error');
  return (payload.result.content || []).filter(block => block.type === 'text').map(block => block.text || '').join('\n');
}

export function parseExaResponse(body, limit = 5) {
  const text = exaText(body);
  const rows = text.split(/\n(?=Title:)/).map(block => {
    const title = block.match(/^Title:\s*(.*)$/m)?.[1];
    const url = block.match(/^URL:\s*(.*)$/m)?.[1];
    const excerpt = block.replace(/^(?:Title|URL|Published|Author):.*$/gm, '').replace(/^(?:Text|Highlights):\s*$/gm, '').trim();
    return { title, url, text: excerpt };
  });
  return normalizedItems(rows, 'exa', limit);
}

function result(action, started, attempts, success = null, extra = {}) {
  return { ok: Boolean(success), action, backend: success?.backend ?? null, items: success?.items ?? [],
    meta: { elapsed_ms: Math.round(performance.now() - started), attempts, ...extra },
    error: success ? null : { code: 'NO_USABLE_RESULT', message: 'No usable result; inspect meta.attempts' } };
}

async function attempt(backend, action, secrets = []) {
  const started = performance.now();
  try { return { backend, items: await action(), attempt: { backend, ok: true, elapsed_ms: Math.round(performance.now() - started) } }; }
  catch (error) { return { attempt: { backend, ok: false, elapsed_ms: Math.round(performance.now() - started), error: { code: safeMessage(error.code || error.cause?.code || 'REQUEST_FAILED'), message: safeMessage(error.message, secrets) } } }; }
}

export async function search(query, input = {}) {
  if (typeof query !== 'string' || !query.trim()) throw new Failure('BAD_INPUT', 'A nonempty search query is required');
  const opts = options(input); const started = performance.now(); const attempts = []; const secrets = [];
  const tavily = await attempt('tavily', async () => {
    const secret = await lookupTavily(opts);
    if (!secret) throw new Failure('NOT_CONFIGURED', 'Tavily has no usable account-pool entry');
    secrets.push(secret);
    const body = await request(ENDPOINTS.tavily, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ query, max_results: opts.limit, search_depth: 'basic', include_answer: false }) }, opts);
    let payload;
    try { payload = JSON.parse(body); } catch { throw new Failure('MALFORMED_JSON', 'Tavily returned malformed JSON'); }
    if (payload.error || payload.ok === false) throw new Failure('UPSTREAM_ERROR', 'Tavily reported a search error');
    return normalizedItems(payload.results?.map(row => ({ title: row.title, url: row.url, text: row.content })), 'tavily', opts.limit);
  }, secrets);
  attempts.push(tavily.attempt);
  if (tavily.attempt.ok) return result('search', started, attempts, tavily);
  const exa = await attempt('exa', async () => parseExaResponse(await request(ENDPOINTS.exa, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'web_search_exa', arguments: { query, numResults: opts.limit } } }),
  }, opts), opts.limit), secrets);
  attempts.push(exa.attempt);
  return result('search', started, attempts, exa.attempt.ok ? exa : null);
}

export async function read(target, input = {}) {
  let host;
  try { host = new URL(target).hostname; } catch { throw new Failure('BAD_INPUT', 'A public HTTP(S) URL is required'); }
  if (['douyin.com', 'iesdouyin.com', 'xiaohongshu.com', 'xhslink.com', 'bilibili.com', 'b23.tv'].some(domain => host === domain || host.endsWith('.' + domain))) {
    throw new Failure('EGO_REQUIRED', 'This site must be read in the existing Ego Page');
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) throw new Failure('UNSUPPORTED_SITE', 'LinkedIn is outside the supported scope');
  const url = normalizeSourceUrl(target);
  if (!url) throw new Failure('BAD_INPUT', 'A public HTTP(S) URL without credentials is required');
  const opts = options(input); const started = performance.now(); const attempts = [];
  const readable = (title, text) => {
    if (!text || /^(?:just a moment|attention required|access denied|security verification|sign in|log in|登录|安全验证)[.!…\s|-]*(?:cloudflare)?$/i.test(title || '')
      || /requiring captcha|performing security verification|\/cdn-cgi\/challenge-platform\//i.test(text.slice(0, 3000))
      || /^(?:(?:please\s+)?(?:sign in|log in)(?: to continue)?[.!\s]*|请?登录后继续[。\s]*)+$/i.test(text)) {
      throw new Failure('CONTENT_BLOCKED', 'Reader returned empty content or a login/challenge page');
    }
    return [{ title, url, text, source: 'jina' }];
  };
  const out = await attempt('jina', async () => {
    const body = await request(`https://r.jina.ai/${url}`, { headers: { Accept: 'text/plain' } }, opts);
    const title = body.match(/^Title:\s*(.*)$/m)?.[1]?.trim() || null;
    const text = (body.includes('Markdown Content:') ? body.split('Markdown Content:').slice(1).join('Markdown Content:')
      : body.replace(/^(?:Title|URL Source|Published Time):.*$/gm, '')).trim();
    return readable(title, text);
  });
  attempts.push(out.attempt);
  if (out.attempt.ok) return result('read', started, attempts, out);
  const exa = await attempt('exa', async () => {
    const body = await request(ENDPOINTS.exa, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'web_fetch_exa', arguments: { urls: [url], maxCharacters: 20000 } } }),
    }, opts);
    const text = exaText(body).trim();
    let item;
    try { item = parseExaResponse(body, 1)[0]; }
    catch (error) { if (error.code !== 'EMPTY_RESULTS') throw error; }
    const content = item?.text || text.replace(/^#{1,2}\s+.*$/m, '').replace(/^URL:.*$/gm, '').trim();
    const rows = readable(item?.title || text.match(/^#{1,2}\s+(.*)$/m)?.[1]?.trim() || null, content);
    return rows.map(row => ({ ...row, source: 'exa' }));
  });
  attempts.push(exa.attempt);
  return result('read', started, attempts, exa.attempt.ok ? exa : null);
}

function xmlText(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
    if (named[entity]) return named[entity];
    const number = entity.startsWith('&#x') ? parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1));
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '';
  }).replace(/<[^>]*>/g, '').trim();
}

export function parseProductHuntFeed(body, limit = 5) {
  if (!/<feed\b/i.test(body) || /<!DOCTYPE|<!ENTITY/i.test(body)) throw new Failure('INVALID_FEED', 'Product Hunt did not return an Atom feed');
  const entries = [...body.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)];
  const items = [];
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index][1];
    const field = name => entry.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '';
    const links = [...entry.matchAll(/<link\b([^>]+)\/?\s*>/gi)].map(match => match[1]);
    const link = links.find(value => /\brel=["']alternate["']/i.test(value)) || links[0] || '';
    const url = normalizeSourceUrl(xmlText(link.match(/\bhref=["']([^"']+)["']/i)?.[1] || field('id')));
    const title = xmlText(field('title'));
    if (!url || !title || !/(^|\.)producthunt\.com$/.test(new URL(url).hostname)) continue;
    items.push({ title, url, text: xmlText(field('content') || field('summary')) || null,
      author: xmlText(field('author').match(/<name\b[^>]*>([\s\S]*?)<\/name>/i)?.[1]) || null,
      published_at: xmlText(field('published')) || null, updated_at: xmlText(field('updated')) || null,
      rank: index + 1, source: 'producthunt-feed' });
    if (items.length >= limit) break;
  }
  if (!items.length) throw new Failure('EMPTY_RESULTS', 'Official feed returned no usable entries');
  return items;
}

export async function feed(provider, input = {}) {
  if (provider !== 'producthunt') throw new Failure('BAD_INPUT', 'Supported official feed: producthunt');
  const opts = options(input); const started = performance.now();
  const out = await attempt('producthunt-feed', async () => parseProductHuntFeed(await request(ENDPOINTS.producthunt, { headers: { Accept: 'application/atom+xml, application/xml' } }, opts), opts.limit));
  return result('feed', started, [out.attempt], out.attempt.ok ? out : null, { feed_url: ENDPOINTS.producthunt, ranking: 'feed_order' });
}

export async function gh(args, input = {}) {
  if (!Array.isArray(args) || !args.length || args.some(arg => typeof arg !== 'string')) throw new Failure('BAD_INPUT', 'Native gh arguments are required after --');
  const opts = options(input); const started = performance.now();
  const run = await runCommand('gh', args, opts);
  const row = { backend: 'gh', ok: !run.error, elapsed_ms: Math.round(performance.now() - started), ...(run.error ? { error: { code: run.error.code, message: safeMessage(run.error.message) } } : {}) };
  const out = result('gh', started, [row], !run.error ? { backend: 'gh', items: [] } : null);
  if (!run.error) { try { out.data = JSON.parse(run.stdout); } catch { out.data = run.stdout.trim(); } }
  return out;
}

export async function doctor(input = {}) {
  const opts = options(input); const started = performance.now();
  const ghPath = await executablePath(opts.config.ghCommand || 'gh', opts.env);
  const poolPath = await accountPoolPath(opts); let configured = false; let warning;
  try { configured = await lookupTavily(opts, 'probe') === true; } catch (error) { warning = { code: error.code, message: 'Secure credential metadata lookup unavailable' }; }
  return { ok: true, action: 'doctor', items: [{ capability: 'gh', available: Boolean(ghPath), path: ghPath },
    { capability: 'account-pool', available: Boolean(poolPath) }, { capability: 'tavily', configured },
    { capability: 'exa/jina/producthunt-feed', available: typeof opts.transport === 'function', network_verified: false }],
    meta: { elapsed_ms: Math.round(performance.now() - started), network_checked: false }, ...(warning ? { warnings: [warning] } : {}) };
}

function parseOptions(args) {
  const out = { positional: [], limit: 5, timeoutMs: 20000 };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--') { out.positional.push(...args.slice(index + 1)); break; }
    if (arg === '--limit' || arg === '--timeout') { const value = Number(args[++index]); out[arg === '--limit' ? 'limit' : 'timeoutMs'] = arg === '--limit' ? value : value * 1000; }
    else if (arg.startsWith('--')) throw new Failure('BAD_INPUT', 'Unknown helper option');
    else out.positional.push(arg);
  }
  return out;
}

async function main(args) {
  const [action, ...rest] = args; const config = await loadConfig();
  if (action === 'gh') {
    const index = rest.indexOf('--');
    if (index < 0) throw new Failure('BAD_INPUT', 'Usage: web-search.mjs gh [--timeout 20] -- native arguments');
    const parsed = parseOptions(rest.slice(0, index));
    if (parsed.positional.length) throw new Failure('BAD_INPUT', 'Unexpected helper argument');
    return gh(rest.slice(index + 1), { config, ...parsed });
  }
  const parsed = parseOptions(rest); const opts = { config, ...parsed };
  if (action === 'doctor' && !parsed.positional.length) return doctor(opts);
  if (action === 'search') return search(parsed.positional.join(' '), opts);
  if (action === 'read' && parsed.positional.length === 1) return read(parsed.positional[0], opts);
  if (action === 'feed' && parsed.positional.length === 1) return feed(parsed.positional[0], opts);
  throw new Failure('BAD_INPUT', 'Usage: search QUERY | read URL | feed producthunt | gh -- ARGS | doctor');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try { const out = await main(process.argv.slice(2)); process.stdout.write(JSON.stringify(out, null, 2) + '\n'); process.exitCode = out.ok ? 0 : 1; }
  catch (error) { process.stdout.write(JSON.stringify({ ok: false, error: { code: error.code || 'BAD_INPUT', message: safeMessage(error.message) } }, null, 2) + '\n'); process.exitCode = 2; }
}
