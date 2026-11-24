import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { commandEnvironment, feed, gh, loadConfig, normalizeSourceUrl, parseExaResponse, parseProductHuntFeed, read, search } from '../scripts/web-search.mjs';

const source = 'https://example.com/source';
const exa = (text = `Title: Official source\nURL: ${source}\nText:\nA useful excerpt`) => JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text }] } });
const reply = (body, status = 200) => new Response(body, { status });

async function fixture(t, body) {
  const dir = await mkdtemp(join(tmpdir(), 'web-search-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, 'command.mjs');
  await writeFile(path, `#!${process.execPath}\n${body}`, { mode: 0o755 });
  return { dir, path };
}

test('Tavily is primary, authenticated in memory, and returns normalized sources', async () => {
  const secret = 'synthetic-secret'; const calls = [];
  const out = await search('literal $(not a command)', { getCredential: async () => secret, transport: async (url, init) => {
    calls.push({ url, init });
    return reply(JSON.stringify({ results: [{ title: 'Source', url: 'HTTPS://EXAMPLE.COM:443/source#fragment', content: 'Excerpt' }] }));
  } });
  assert.equal(out.ok, true); assert.equal(out.backend, 'tavily'); assert.equal(out.items[0].url, source);
  assert.equal(calls.length, 1); assert.equal(calls[0].url, 'https://api.tavily.com/search');
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${secret}`);
  assert.equal(JSON.parse(calls[0].init.body).query, 'literal $(not a command)');
  assert.ok(!JSON.stringify(out).includes(secret));
});

for (const [label, first, code] of [
  ['empty results', () => reply('{"results":[]}'), 'EMPTY_RESULTS'],
  ['malformed JSON', () => reply('broken'), 'MALFORMED_JSON'],
  ['failure envelope with items', () => reply('{"ok":false,"results":[{"title":"bad","url":"https://example.com"}]}'), 'UPSTREAM_ERROR'],
  ['rate limit', () => reply('not logged', 429), 'HTTP_429'],
]) {
  test(`direct Exa fallback follows Tavily ${label} once`, async () => {
    const calls = [];
    const out = await search('query', { getCredential: async () => 'synthetic-key', transport: async (url, init) => {
      calls.push(url); return url.includes('tavily') ? first() : reply(`event: message\ndata: ${exa()}\n\n`);
    } });
    assert.equal(out.backend, 'exa'); assert.equal(out.items[0].url, source);
    assert.equal(out.meta.attempts[0].error.code, code);
    assert.deepEqual(calls, ['https://api.tavily.com/search', 'https://mcp.exa.ai/mcp']);
  });
}

test('missing secure credential skips Tavily without an unauthorized request', async () => {
  const calls = [];
  const out = await search('query', { getCredential: async () => null, transport: async url => { calls.push(url); return reply(exa()); } });
  assert.equal(out.ok, true); assert.equal(out.meta.attempts[0].error.code, 'NOT_CONFIGURED');
  assert.deepEqual(calls, ['https://mcp.exa.ai/mcp']);
});

test('HTTP deadline is bounded even for a transport ignoring AbortSignal; errors redact secrets', async () => {
  const secret = 'synthetic-nonstandard-secret'; const calls = [];
  const out = await search('query', { timeoutMs: 30, getCredential: async () => secret, transport: async url => {
    calls.push(url);
    if (url.includes('tavily')) return new Promise(() => {});
    throw new Error(`Authorization Bearer ${secret}`);
  } });
  assert.equal(out.ok, false); assert.equal(out.meta.attempts[0].error.code, 'TIMEOUT');
  assert.equal(calls.length, 2); assert.ok(!JSON.stringify(out).includes(secret));
  assert.ok(out.meta.attempts.every(row => Number.isFinite(row.elapsed_ms)));
});

test('Exa rejects malformed/error/empty payloads and unsafe source URLs', () => {
  assert.throws(() => parseExaResponse('not JSON'), /malformed/);
  assert.throws(() => parseExaResponse('{"error":{"code":429}}'), /MCP error/);
  assert.throws(() => parseExaResponse(exa('Title: Empty\nURL: javascript:alert(1)')), /no usable/);
  for (const url of ['file:///etc/hosts', 'http://127.0.0.1/a', 'http://10.0.0.1/a', 'https://user:pass@example.com', 'https://example.com/?xsec_token=signature']) assert.equal(normalizeSourceUrl(url), null);
});

test('Jina public document read rejects login, challenge and empty content', async () => {
  const valid = await read(source, { transport: async (url, init) => {
    assert.equal(url, 'https://r.jina.ai/https://example.com/source');
    assert.equal(init.headers.Authorization, undefined);
    return reply('Title: Official document\nMarkdown Content:\nReadable body');
  } });
  assert.equal(valid.ok, true); assert.equal(valid.items[0].text, 'Readable body');
  for (const body of ['', 'Title: Empty shell\nURL Source: https://example.com', 'Title: Just a moment\nMarkdown Content:\nPerforming security verification', 'Title: Log in\nMarkdown Content:\nPlease log in to continue']) {
    const out = await read(source, { transport: async () => reply(body) });
    assert.equal(out.ok, false); assert.equal(out.meta.attempts[0].error.code, 'CONTENT_BLOCKED');
  }
});

test('document read falls back to official Exa plain Markdown and keeps transport cause code', async () => {
  const calls = [];
  const out = await read(source, { transport: async (url, init) => {
    calls.push(url);
    if (url.startsWith('https://r.jina.ai/')) throw new Error('fetch failed', { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } });
    const payload = JSON.parse(init.body);
    assert.equal(payload.params.name, 'web_fetch_exa'); assert.deepEqual(payload.params.arguments.urls, [source]);
    return reply(exa(`# Official source\nURL: ${source}\n\nReadable Markdown body`));
  } });
  assert.equal(out.ok, true); assert.equal(out.backend, 'exa'); assert.equal(out.items[0].title, 'Official source');
  assert.equal(out.items[0].url, source); assert.equal(out.meta.attempts[0].error.code, 'UND_ERR_CONNECT_TIMEOUT');
  assert.deepEqual(calls, [`https://r.jina.ai/${source}`, 'https://mcp.exa.ai/mcp']);
});

test('browser-only social sites and excluded LinkedIn never enter the HTTP reader', async () => {
  let requested = false;
  const transport = async () => { requested = true; return reply('unexpected'); };
  for (const url of ['https://www.douyin.com/video/123', 'https://www.xiaohongshu.com/explore/abc?xsec_token=synthetic-signature', 'https://www.bilibili.com/video/BV123', 'https://b23.tv/example']) {
    await assert.rejects(read(url, { transport }), { code: 'EGO_REQUIRED' });
  }
  await assert.rejects(read('https://www.linkedin.com/in/example', { transport }), { code: 'UNSUPPORTED_SITE' });
  assert.equal(requested, false);
});

const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><id>https://www.producthunt.com/posts/first</id><title>First &amp; Useful</title><link rel="alternate" href="https://www.producthunt.com/posts/first"/><published>2026-11-24T00:00:00Z</published><updated>2026-11-24T01:00:00Z</updated><author><name>Maker</name></author><content type="html">&lt;p&gt;Summary&lt;/p&gt;</content></entry><entry><title>Second</title><link href="https://www.producthunt.com/posts/second"/><updated>2026-11-23T00:00:00Z</updated></entry></feed>`;
test('Product Hunt official Atom retains dates, author and feed order without claiming live rank', async () => {
  const items = parseProductHuntFeed(atom);
  assert.equal(items[0].title, 'First & Useful'); assert.equal(items[0].text, 'Summary');
  assert.equal(items[0].author, 'Maker'); assert.equal(items[0].published_at, '2026-11-24T00:00:00Z');
  assert.equal(items[1].published_at, null); assert.deepEqual(items.map(row => row.rank), [1, 2]);
  const out = await feed('producthunt', { limit: 1, transport: async url => { assert.equal(url, 'https://www.producthunt.com/feed'); return reply(atom); } });
  assert.equal(out.ok, true); assert.equal(out.items.length, 1); assert.equal(out.meta.ranking, 'feed_order');
  assert.throws(() => parseProductHuntFeed('<html>login</html>'), /Atom feed/);
  await assert.rejects(feed('linkedin'), /Supported official feed/);
});

test('native gh remains shell-free and its CA repair is strictly scoped', async t => {
  const f = await fixture(t, 'console.log(JSON.stringify({args:process.argv.slice(2),ca:process.env.SSL_CERT_FILE??null,other:process.env.CURL_CA_BUNDLE??null}));');
  const env = { ...process.env, SSL_CERT_FILE: '/synthetic/ca', SSL_CERT_DIR: '/synthetic/dir', CURL_CA_BUNDLE: '/synthetic/other' };
  const config = { ghCommand: f.path, systemCaCommands: ['gh'] };
  const args = ['api', 'repos/example/repo; $(touch SHOULD_NOT_EXIST)'];
  const out = await gh(args, { config, env });
  assert.deepEqual(out.data.args, args); assert.equal(out.data.ca, null); assert.equal(out.data.other, env.CURL_CA_BUNDLE);
  assert.equal(env.SSL_CERT_FILE, '/synthetic/ca'); assert.deepEqual(commandEnvironment('python3', config, env), env);
});

test('secure Pool bridge is an in-memory pipe and does not expose the returned key', async t => {
  const f = await fixture(t, 'console.log(JSON.stringify({configured:true,secret:"fixture-value"}));');
  const pool = join(f.dir, 'account_pool.py'); await writeFile(pool, '# fixture');
  const out = await search('query', { config: { pythonCommand: f.path, accountPoolScript: pool }, transport: async (_url, init) => {
    assert.equal(init.headers.Authorization, 'Bearer fixture-value');
    return reply(JSON.stringify({ results: [{ title: 'Source', url: source, content: 'Excerpt' }] }));
  } });
  assert.equal(out.ok, true); assert.ok(!JSON.stringify(out).includes('fixture-value'));
  assert.deepEqual((await readdir(f.dir)).sort(), ['account_pool.py', 'command.mjs']);
});

test('optional config validates CA scope and installed symlink entry emits JSON', async t => {
  const f = await fixture(t, ''); const configPath = join(f.dir, 'config.local.json');
  assert.deepEqual(await loadConfig(configPath), {});
  await writeFile(configPath, '{"systemCaCommands":["agent-reach"]}');
  await assert.rejects(loadConfig(configPath), /only gh/);
  const linked = join(f.dir, 'linked-scripts');
  await symlink(fileURLToPath(new URL('../scripts', import.meta.url)), linked, 'dir');
  const run = await new Promise(resolve => execFile(process.execPath, [join(linked, 'web-search.mjs'), 'search'], { timeout: 3000 }, (error, stdout) => resolve({ error, stdout })));
  assert.equal(run.error?.code, 2); assert.equal(JSON.parse(run.stdout).error.code, 'BAD_INPUT');
});
