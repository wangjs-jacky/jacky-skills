import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timestamp, normalizeTranscript, toSrt, validatePlan } from './lib.mjs';

test('导入多行字幕并保留毫秒，SRT 往返不改变时间与文本', () => {
  const rows = normalizeTranscript('WEBVTT\n\n00:01.250 --> 00:03.500 align:start\n先看图表\n再解释数据\n', 'vtt');
  assert.deepEqual(rows, [{ id: 's0001', start: 1.25, end: 3.5, text: '先看图表 再解释数据' }]);
  assert.deepEqual(normalizeTranscript(toSrt(rows), 'srt'), rows);
});
test('导入平台字幕 JSON 与转写 JSON 得到相同片段', () => {
  assert.deepEqual(normalizeTranscript({ body: [{ from: 2, to: 4, content: '同一观点' }] }),
    normalizeTranscript({ segments: [{ start: 2, end: 4, text: '同一观点' }] }));
});
test('拒绝无效时间与反向字幕', () => {
  for (const value of [-1, NaN, '01:99', 'abc']) assert.throws(() => timestamp(value));
  assert.throws(() => normalizeTranscript([{ start: 3, end: 2, text: '不能使用' }]));
});
const rows = normalizeTranscript([{ start: 2, end: 5, text: '不是所有数据都服从正态分布。' }]);
const source = { duration: 10 };
const plan = () => ({ cards: [{ id: 'distribution', visual: { time: 3, role: 'chart', reason: '图表显示数据分布' }, blocks: [{ evidence: ['s0001'] }] }] });
test('选段返回原字幕，不生成或改写正文', () => {
  const result = validatePlan(plan(), rows, source);
  assert.equal(result[0].segments[0].text, rows[0].text);
});
test('连续原文摘选保留完整来源，拒绝伪造、空白和未引用片段', () => {
  const p = plan();
  p.cards[0].blocks[0].excerpts = { s0001: '不是所有数据都服从正态分布' };
  const result = validatePlan(p, rows, source);
  assert.equal(result[0].segments[0].text, rows[0].text);
  assert.equal(result[0].excerpts.s0001, '不是所有数据都服从正态分布');
  for (const excerpts of [{ s0001: '所有数据都服从均匀分布' }, { s0001: '' }, { s0001: ' ' }, { s9999: '其他内容' }, []]) {
    p.cards[0].blocks[0].excerpts = excerpts;
    assert.throws(() => validatePlan(p, rows, source));
  }
});
test('拒绝虚构引用、额外正文、额外标题和错位画面', () => {
  let p = plan(); p.cards[0].blocks[0].evidence = ['s9999']; assert.throws(() => validatePlan(p, rows, source));
  p = plan(); p.cards[0].blocks[0].text = '另一段讲解'; assert.throws(() => validatePlan(p, rows, source));
  p = plan(); p.cards[0].title = '另加标题'; assert.throws(() => validatePlan(p, rows, source));
  p = plan(); p.cards[0].visual.time = 9; assert.throws(() => validatePlan(p, rows, source));
});
test('拒绝不带图像的卡片与可逃逸目录的标识', () => {
  let p = plan(); delete p.cards[0].visual; assert.throws(() => validatePlan(p, rows, source));
  p = plan(); p.cards[0].id = '../escaped'; assert.throws(() => validatePlan(p, rows, source));
});
