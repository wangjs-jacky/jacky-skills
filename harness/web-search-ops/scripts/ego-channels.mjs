// Import only inside an ego-browser nodejs round with an already-owned Page.
const SITES = {
  douyin: { host: 'www.douyin.com' },
  xiaohongshu: { host: 'www.xiaohongshu.com' },
  bilibili: { host: 'search.bilibili.com' },
};

function checkSite(site) {
  if (!Object.hasOwn(SITES, site)) throw new Error('Supported Ego sites: douyin, xiaohongshu, bilibili');
}

function limits({ limit = 3, timeout = 15000 } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('Ego result limit must be from 1 to 10');
  if (!Number.isFinite(timeout) || timeout < 1 || timeout > 30000) throw new Error('Ego timeout must be positive and at most 30000 ms');
  return { limit, timeout };
}

export function buildSearchUrl(site, query) {
  checkSite(site);
  if (typeof query !== 'string' || !query.trim()) throw new Error('A nonempty search query is required');
  const encoded = encodeURIComponent(query);
  if (site === 'douyin') return `https://www.douyin.com/search/${encoded}`;
  if (site === 'xiaohongshu') return `https://www.xiaohongshu.com/search_result?keyword=${encoded}&source=web_search_result_notes`;
  return `https://search.bilibili.com/all?keyword=${encoded}`;
}

function cleanSourceUrl(site, value) {
  const url = new URL(value);
  const allowed = site === 'bilibili' ? ['search.bilibili.com', 'www.bilibili.com'] : [SITES[site].host];
  if (url.protocol !== 'https:' || !allowed.includes(url.hostname)) throw new Error('Page is outside the requested Ego site');
  const clean = new URL(url.origin + url.pathname);
  for (const name of site === 'xiaohongshu' ? ['keyword', 'source', 'type'] : site === 'bilibili' ? ['keyword', 'page'] : []) {
    if (url.searchParams.has(name)) clean.searchParams.set(name, url.searchParams.get(name));
  }
  return clean.href;
}

export function normalizeRows(site, rows, limit = 3) {
  checkSite(site); limits({ limit });
  const items = []; const seen = new Set();
  for (const row of rows || []) {
    if (typeof row?.title !== 'string' || !row.title.trim() || typeof row.url !== 'string') continue;
    let url;
    try {
      const parsed = new URL(row.url);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) continue;
      if (site === 'xiaohongshu' && parsed.hostname === SITES[site].host) {
        const id = parsed.pathname.match(/^\/(?:explore|search_result)\/([a-z0-9]+)\/?$/i)?.[1];
        if (id) url = `https://www.xiaohongshu.com/explore/${id}`;
      } else if (site === 'douyin' && parsed.hostname === SITES[site].host) {
        const id = parsed.pathname.match(/^\/video\/(\d{19})\/?$/)?.[1];
        if (id) url = `https://www.douyin.com/video/${id}`;
      } else if (site === 'bilibili' && ['www.bilibili.com', 'bilibili.com'].includes(parsed.hostname)) {
        const id = parsed.pathname.match(/^\/video\/(BV[a-z0-9]+)\/?$/i)?.[1];
        if (id) url = `https://www.bilibili.com/video/${id}/`;
      }
    } catch { continue; }
    if (!url || seen.has(url)) continue;
    seen.add(url);
    items.push({ title: row.title.trim(), url, author: typeof row.author === 'string' && row.author.trim() ? row.author.trim() : null });
    if (items.length >= limit) break;
  }
  return items;
}

// Entire function runs in the owned Page; raw signed hrefs never leave it.
function extractRendered({ site, limit, readyOnly = false }) {
  const visible = node => node && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
  const text = node => visible(node) ? (node.innerText || '').trim() : '';
  const rows = [];
  if (site === 'xiaohongshu') {
    for (const card of document.querySelectorAll('section.note-item')) {
      if (!visible(card)) continue;
      const title = text(card.querySelector('.title'));
      const link = card.querySelector('a[href*="/search_result/"], a[href*="/explore/"]');
      const id = link?.pathname?.match(/^\/(?:search_result|explore)\/([a-z0-9]+)\/?$/i)?.[1];
      if (title && id) rows.push({ title, url: `https://www.xiaohongshu.com/explore/${id}`, author: text(card.querySelector('.author .name')) || null });
      if (rows.length >= limit) break;
    }
  } else if (site === 'bilibili') {
    for (const link of document.querySelectorAll('a[href*="bilibili.com/video/BV"]')) {
      const title = text(link.querySelector('h3'));
      const id = link.pathname?.match(/^\/video\/(BV[a-z0-9]+)\/?$/i)?.[1];
      if (visible(link) && title && id) rows.push({ title, url: `https://www.bilibili.com/video/${id}/`, author: null });
      if (rows.length >= limit) break;
    }
  } else {
    for (const image of document.querySelectorAll('.videoImage')) {
      const card = image.parentElement;
      const cardText = text(card);
      if (!cardText) continue;
      const fiberKey = Object.keys(card).find(key => key.startsWith('__reactFiber$'));
      let fiber = fiberKey ? card[fiberKey] : null;
      let info = null;
      for (let hop = 0; fiber && hop < 12; hop++, fiber = fiber.return) {
        const candidate = fiber.memoizedProps?.data?.awemeInfo;
        if (candidate) { info = candidate; break; }
      }
      const id = typeof info?.awemeId === 'string' && /^\d{19}$/.test(info.awemeId) ? info.awemeId : null;
      const title = typeof info?.desc === 'string' ? info.desc.trim() : '';
      const prefix = title.replace(/\s+/g, ' ').slice(0, 32);
      if (!id || !prefix || info.isAds || !cardText.replace(/\s+/g, ' ').includes(prefix)) continue;
      const name = info.authorInfo?.nickname || info.authorInfo?.nickName;
      const visibleName = typeof name === 'string' && cardText.includes(name) ? name : null;
      const authorLine = cardText.match(/(?:^|\n)\s*@([^\n]+)/)?.[1]?.trim();
      const author = visibleName || (authorLine ? authorLine.replace(/\s*[·•]\s*\d.*$/, '').trim() : null);
      rows.push({ title, url: `https://www.douyin.com/video/${id}`, author });
      if (rows.length >= limit) break;
    }
  }
  return readyOnly ? rows.length > 0 : rows;
}

export async function readVisible(page, site, input = {}) {
  checkSite(site); const { limit } = limits(input);
  if (!page || typeof page.evaluate !== 'function' || typeof page.url !== 'function') throw new Error('An existing owned Ego Page is required');
  const sourceUrl = cleanSourceUrl(site, await page.url());
  const items = normalizeRows(site, await page.evaluate(extractRendered, { site, limit }), limit);
  return { ok: items.length > 0, site, sourceUrl, items, meta: { scope: 'rendered_cards', count: items.length },
    error: items.length ? null : { code: 'NO_VISIBLE_RESULTS', message: 'No readable result cards; inspect the current Ego Page' } };
}

export async function search(page, site, query, input = {}) {
  const { limit, timeout } = limits(input); const target = buildSearchUrl(site, query); const started = performance.now();
  if (!page || typeof page.goto !== 'function' || typeof page.waitForFunction !== 'function') throw new Error('An existing owned Ego Page is required');
  await page.goto(target, { timeout });
  let readinessError = null;
  try { await page.waitForFunction(extractRendered, { site, limit: 1, readyOnly: true }, { timeout: Math.max(1, timeout - (performance.now() - started)) }); }
  catch (error) {
    const code = error.code || String(error.message).match(/EGO_[A-Z_]+/)?.[0];
    if (code && code !== 'EGO_WAIT_TIMEOUT') throw error;
    readinessError = 'Result readiness was not reached within the bounded wait';
  }
  const actual = new URL(await page.url()); const expected = new URL(target);
  if (actual.origin !== expected.origin || actual.pathname !== expected.pathname || (site !== 'douyin' && actual.searchParams.get('keyword') !== query)) {
    return { ok: false, site, items: [], error: { code: 'UNEXPECTED_PAGE', message: 'Navigation did not reach the requested search page' } };
  }
  const out = await readVisible(page, site, { limit });
  out.meta.elapsed_ms = Math.round(performance.now() - started);
  if (readinessError) out.meta.readiness = readinessError;
  return out;
}
