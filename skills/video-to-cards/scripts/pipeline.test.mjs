import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const cli = join(dirname(fileURLToPath(import.meta.url)), 'video-cards.mjs');
test('排版实际使用原文摘选，并拒绝直接传入的改写', () => {
  const renderer = join(dirname(cli), 'render.py');
  const python = process.env.VIDEO_CARDS_PYTHON || 'python3';
  const result = JSON.parse(execFileSync(python, ['-c', `import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('renderer',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
font=m.ImageFont.truetype(m.find_font(None),44)
rows={'s0001':{'text':'那第一个方法，我觉得特别简单'}}
block={'evidence':['s0001'],'excerpts':{'s0001':'第一个方法'}}
shown=m.subtitle_lines(block,rows,font)
block['excerpts']['s0001']='虚构的方法'
try:
 m.subtitle_lines(block,rows,font)
except ValueError:
 rejected=True
else:
 rejected=False
print(json.dumps({'shown':shown,'rejected':rejected},ensure_ascii=False))`, renderer], { encoding: 'utf8' }));
  assert.deepEqual(result, { shown: ['第一个方法'], rejected: true });
});
test('中文排版换行保留小数和百分比，不把数值拆到两行', () => {
  const renderer = join(dirname(cli), 'render.py');
  const python = process.env.VIDEO_CARDS_PYTHON || 'python3';
  const result = JSON.parse(execFileSync(python, ['-c', `import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('renderer',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
font=m.ImageFont.truetype(m.find_font(None),44)
text='平均值63.5英寸，覆盖99.7%的数据。'
print(json.dumps(m.lines(text,font,220),ensure_ascii=False))`, renderer], { encoding: 'utf8' }));
  assert.equal(result.join(''), '平均值63.5英寸，覆盖99.7%的数据。');
  assert.ok(result.some(line => line.includes('63.5')));
  assert.ok(result.some(line => line.includes('99.7%')));
});
test('本地视频与已有字幕能完成准备、引用验证、选帧和真实PNG导出', async () => {
  const root = await mkdtemp(join(tmpdir(), 'video-cards-test-'));
  try {
    const input = join(root, 'input.mp4');
    const subtitles = join(root, 'input.srt');
    const out = join(root, 'out');
    // 合成素材仅用于回归媒体处理，不冒充真实视频样例。
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=640x360:r=10', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=16000', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', input]);
    await writeFile(subtitles, '1\n00:00:00,200 --> 00:00:01,800\n这里是一段完整解释。\n');
    const run = args => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    run(['prepare', '--input', input, '--out', out, '--transcript', subtitles, '--author', '测试作者']);
    const transcript = JSON.parse(await readFile(join(out, 'transcript.json')));
    assert.equal(transcript.source, 'provided');
    const planPath = join(root, 'plan.json');
    await writeFile(planPath, JSON.stringify({ cards: [{ id: 'lesson', visual: { time: 1, role: 'demonstration', reason: '回归验证画面提取' }, blocks: [{ evidence: ['s0001'] }] }] }));
    run(['validate', '--out', out, '--plan', planPath]);
    run(['frames', '--out', out, '--plan', planPath]);
    const frames = JSON.parse(await readFile(join(out, 'frames.json')));
    assert.equal(frames.length, 1);
    assert.equal(frames[0].candidates.length, 3);
    run(['render', '--out', out, '--plan', planPath, '--python', process.env.VIDEO_CARDS_PYTHON || 'python3']);
    const cards = JSON.parse(await readFile(join(out, 'cards.json')));
    assert.equal(cards.length, 1);
    const png = await readFile(join(out, cards[0].file));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), 1080);
    assert.ok(png.readUInt32BE(20) > 1000 && png.readUInt32BE(20) <= 2600);
    assert.ok((await readFile(join(out, 'evidence.json'))).includes('这里是一段完整解释。'));
  } finally { await rm(root, { recursive: true, force: true }); }
});
