import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchUrl, normalizeRows, readVisible, search } from '../scripts/ego-channels.mjs';

test('three explicit Ego search routes encode literal input and reject excluded sites', () => {
  const query = 'AI 视频 & a/b?#';
  assert.equal(buildSearchUrl('douyin', query), `https://www.douyin.com/search/${encodeURIComponent(query)}`);
  assert.equal(new URL(buildSearchUrl('xiaohongshu', query)).searchParams.get('keyword'), query);
  assert.equal(new URL(buildSearchUrl('bilibili', query)).searchParams.get('keyword'), query);
  assert.throws(() => buildSearchUrl('linkedin', query), /Supported Ego sites/);
  assert.throws(() => buildSearchUrl('xiaohongshu', ''), /nonempty/);
});

test('social result normalization never returns signatures or unrelated source types', () => {
  const xhs = normalizeRows('xiaohongshu', [
    { title: 'Visible note', url: 'https://www.xiaohongshu.com/search_result/abcdef123456?xsec_token=synthetic-signature', author: 'Maker' },
    { title: 'Duplicate', url: 'https://www.xiaohongshu.com/explore/abcdef123456' },
    { title: 'Wrong origin', url: 'https://example.com/explore/abcdef123456' },
  ]);
  assert.deepEqual(xhs, [{ title: 'Visible note', url: 'https://www.xiaohongshu.com/explore/abcdef123456', author: 'Maker' }]);
  assert.ok(!JSON.stringify(xhs).includes('synthetic-signature'));
  assert.deepEqual(normalizeRows('bilibili', [
    { title: 'Video', url: 'https://www.bilibili.com/video/BV123abc?tracking=ignored' },
    { title: 'Course', url: 'https://www.bilibili.com/cheese/play/ss123' },
    { title: 'Live', url: 'https://live.bilibili.com/123' },
  ]), [{ title: 'Video', url: 'https://www.bilibili.com/video/BV123abc/', author: null }]);
  assert.deepEqual(normalizeRows('douyin', [{ title: 'Video', url: 'https://www.douyin.com/video/1234567890123456789?tracking=ignored' }]), [
    { title: 'Video', url: 'https://www.douyin.com/video/1234567890123456789', author: null },
  ]);
});

test('existing owned Page is reused with one bounded state wait and limited extraction', async () => {
  const calls = []; let current;
  const page = {
    goto: async (url, opts) => { calls.push(['goto', opts]); current = url + '&type=51'; },
    waitForFunction: async (fn, arg, opts) => { assert.equal(typeof fn, 'function'); assert.equal(arg.site, 'xiaohongshu'); calls.push(['wait', opts]); },
    url: async () => current,
    evaluate: async (_fn, arg) => { calls.push(['evaluate', arg]); return [
      { title: 'First', url: 'https://www.xiaohongshu.com/explore/abcdef123456', author: 'Maker' },
      { title: 'Second', url: 'https://www.xiaohongshu.com/explore/abcdef234567' },
    ]; },
  };
  const out = await search(page, 'xiaohongshu', 'AI', { limit: 1, timeout: 1000 });
  assert.equal(out.ok, true); assert.equal(out.items.length, 1);
  assert.equal(new URL(out.sourceUrl).searchParams.get('type'), '51');
  assert.deepEqual(calls.map(call => call[0]), ['goto', 'wait', 'evaluate']);
  assert.ok(calls[1][1].timeout > 0 && calls[1][1].timeout <= 1000);
  assert.equal(calls[2][1].limit, 1);
});

test('reading an unrelated Page stops before DOM extraction', async () => {
  let evaluated = false;
  const page = { url: async () => 'https://example.com', evaluate: async () => { evaluated = true; return []; } };
  await assert.rejects(readVisible(page, 'douyin'), /outside/);
  assert.equal(evaluated, false);
});

test('Ego user-control errors propagate without extraction or recovery attempts', async () => {
  let extracted = false;
  const error = Object.assign(new Error('user controls the Page'), { code: 'EGO_USER_CONTROLLED' });
  const page = { goto: async () => {}, waitForFunction: async () => { throw error; }, evaluate: async () => { extracted = true; } };
  await assert.rejects(search(page, 'bilibili', 'AI'), { code: 'EGO_USER_CONTROLLED' });
  assert.equal(extracted, false);
});
