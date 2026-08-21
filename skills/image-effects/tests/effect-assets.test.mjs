import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadEffects, parseEffect } from '../scripts/effect-library.mjs';
import { EXPECTED_CATALOG_REFS, MIGRATED_EFFECT_IDS } from './catalog-fixture.mjs';

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL_PATH = path.join(SKILL_ROOT, 'SKILL.md');
const EFFECT_CARD_PATH = path.join(
  SKILL_ROOT,
  'references/effects/healing-anime-scribble-v3.md',
);
const PREVIEW_PATH = path.join(
  SKILL_ROOT,
  'assets/previews/healing-anime-scribble-v3.jpg',
);
const LICENSES_PATH = path.join(SKILL_ROOT, 'references/licenses');
const EFFECTS_PATH = path.join(SKILL_ROOT, 'references/effects');
const PREVIEW_SHA256 = '70a3c534832532faed62cb80816df56002382cb661b51d2077d7eab429760daf';
const GENERATED_PREVIEWS = {
  'photo-illustration-editorial-echo.png': { width: 1024, height: 768 },
  'photo-illustration-diptych-lakeside.png': { width: 1024, height: 1536 },
  'photo-illustration-diptych.png': { width: 1024, height: 1536 },
  'scenes-gathered-zine-sea.png': { width: 1536, height: 1024 },
  'scenes-gathered-zine.png': { width: 1024, height: 1536 },
  'scene-distillation-zine.png': { width: 1024, height: 1536 },
  'minimal-zine-poster.png': { width: 1024, height: 1536 },
  'torn-paper-editorial-photo-collage.jpg': { width: 615, height: 1024 },
};
const SOURCE_LICENSE_NOTICE_SHA256 =
  '1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685';
const LICENSE_HASHES = {
  'conardli-garden-skills-mit.txt': SOURCE_LICENSE_NOTICE_SHA256,
  'gathered-scenes-zine-contributors-mit.txt':
    '7d063a2fe4a45ac0adf349ab8d568de5bc93206aaa3982a243dd8d067a3e2f4a',
  'happy-coder-contributors-mit.txt':
    'e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00',
  'liamgvchi-mit.txt': 'd15c81ae8fa9a0b4b1db46c66e4490cc92e4898fb1f55e030559fbd2a2e2a232',
};

const EXPECTED_EFFECT = {
  ref: 'healing-anime-scribble-v3@1.0.0',
  id: 'healing-anime-scribble-v3',
  version: '1.0.0',
  title: {
    en: 'Healing Anime Scribble',
    zh: '治愈系潦草淡彩',
  },
  summary: {
    en: 'Redraw one portrait as an airy anime construction sketch with dense searching lines, sparse pale color, and quiet warm paper.',
    zh: '将一张人物照片重绘为留白通透的动漫结构草图，以密集探索线条、稀薄淡彩和暖白纸张为核心。',
  },
  category: 'portrait',
  executionKind: 'host-image-generation',
  input: { mode: 'image', min: 1, max: 1, formats: ['jpeg', 'png'] },
  outputCount: 1,
  preview: 'assets/previews/healing-anime-scribble-v3.jpg',
  sourceRepository: 'ConardLi/garden-skills',
  sourceRevision: 'aaf9a82f5efd73e87cc0998edc398e75bfc35901',
  sources: [
    {
      path: 'skills/gpt-image-2/references/avatars-and-profile/style-transfer-selfie.md',
      sha256: '67021faabdbd9e5d5db6851eb2e5bc6a650a76ef399a4f0949fdae0f93989461',
    },
    {
      path: 'LICENSE',
      sha256: SOURCE_LICENSE_NOTICE_SHA256,
    },
  ],
  sourceLicense: {
    spdx: 'MIT',
    url: 'https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE',
  },
  sourceLicenseNotice: 'references/licenses/conardli-garden-skills-mit.txt',
  adaptationNotice:
    'Preserves the one-photo anime construction sketch behavior and adds fixed v3 ratios, host-neutral delivery, privacy gates, and one targeted retry.',
  previewProvenance: {
    origin:
      'Text-only image generation of a fictional young adult with glasses, not based on a real person.',
    author: 'wangjs-jacky',
    licenseSpdx: 'CC-BY-4.0',
    sha256: PREVIEW_SHA256,
  },
};

const EXPECTED_SECTIONS = [
  '适用场景',
  '输入契约',
  '视觉编译规则',
  '硬性禁止项',
  '质量检查',
  '交付要求',
];

async function loadImageTools() {
  return import('../scripts/image-metadata.mjs');
}

async function loadSharp() {
  return (await import('sharp')).default;
}

function jpegSegment(marker, payload) {
  const body = Buffer.from(payload);
  const segment = Buffer.alloc(4 + body.length);
  segment[0] = 0xff;
  segment[1] = marker;
  segment.writeUInt16BE(body.length + 2, 2);
  body.copy(segment, 4);
  return segment;
}

function injectJpegSegment(buffer, marker, payload) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8);
  return Buffer.concat([buffer.subarray(0, 2), jpegSegment(marker, payload), buffer.subarray(2)]);
}

function insertAfterFirstJpegSegment(buffer, marker, payload) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8);
  assert.equal(buffer[2], 0xff);
  const length = buffer.readUInt16BE(4);
  const end = 4 + length;
  return Buffer.concat([
    buffer.subarray(0, end),
    jpegSegment(marker, payload),
    buffer.subarray(end),
  ]);
}

function removeJpegEntropyTail(buffer, byteCount) {
  assert.equal(buffer.readUInt16BE(buffer.length - 2), 0xffd9);
  assert.ok(buffer.length > byteCount + 2);
  return Buffer.concat([buffer.subarray(0, buffer.length - byteCount - 2), buffer.subarray(-2)]);
}

const CRC32_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, payload) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const data = Buffer.from(payload);
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function injectPngChunk(buffer, type, payload) {
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const chunkType = buffer.toString('ascii', offset + 4, offset + 8);
    if (chunkType === 'IEND') {
      return Buffer.concat([buffer.subarray(0, offset), pngChunk(type, payload), buffer.subarray(offset)]);
    }
    offset += 12 + length;
  }
  throw new Error('Fixture PNG is missing IEND');
}

function corruptPngChunkCrc(buffer, targetType) {
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === targetType) {
      const corrupted = Buffer.from(buffer);
      corrupted[offset + 8 + length] ^= 0x01;
      return corrupted;
    }
    offset += 12 + length;
  }
  throw new Error(`Fixture PNG is missing ${targetType}`);
}

function pngChunkPayload(buffer, targetType) {
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === targetType) return buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
  }
  throw new Error(`Fixture PNG is missing ${targetType}`);
}

function replacePngChunk(buffer, targetType, replacement) {
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (type === targetType) {
      return Buffer.concat([buffer.subarray(0, offset), replacement, buffer.subarray(end)]);
    }
    offset = end;
  }
  throw new Error(`Fixture PNG is missing ${targetType}`);
}

function oversizedPngHeader(buffer, width, height) {
  const ihdr = Buffer.from(pngChunkPayload(buffer, 'IHDR'));
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  return replacePngChunk(buffer, 'IHDR', pngChunk('IHDR', ihdr));
}

function splitPngIdatWithAncillaryChunk(buffer) {
  const data = pngChunkPayload(buffer, 'IDAT');
  const splitAt = Math.max(1, Math.floor(data.length / 2));
  return replacePngChunk(
    buffer,
    'IDAT',
    Buffer.concat([
      pngChunk('IDAT', data.subarray(0, splitAt)),
      pngChunk('aaAa', Buffer.alloc(0)),
      pngChunk('IDAT', data.subarray(splitAt)),
    ]),
  );
}

async function createFixtures(directory) {
  const sharp = await loadSharp();
  const input = {
    create: {
      width: 7,
      height: 5,
      channels: 3,
      background: { r: 214, g: 180, b: 140 },
    },
  };
  const jpegPath = path.join(directory, 'clean.jpg');
  const progressiveJpegPath = path.join(directory, 'progressive.jpg');
  const pngPath = path.join(directory, 'clean.png');

  await sharp(input).jpeg({ quality: 90 }).toFile(jpegPath);
  await sharp(input).jpeg({ quality: 90, progressive: true }).toFile(progressiveJpegPath);
  await sharp(input).png().toFile(pngPath);

  return {
    jpeg: await readFile(jpegPath),
    progressiveJpeg: await readFile(progressiveJpegPath),
    png: await readFile(pngPath),
  };
}

async function createEntropyRichJpeg(directory) {
  const sharp = await loadSharp();
  const width = 256;
  const height = 256;
  const pixels = Buffer.alloc(width * height * 3);
  let state = 0x12345678;
  for (let offset = 0; offset < pixels.length; offset += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    pixels[offset] = state >>> 24;
  }

  const filePath = path.join(directory, 'entropy-rich.jpg');
  await sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 90 })
    .toFile(filePath);
  return readFile(filePath);
}

test('效果卡严格解析全部 frontmatter 并包含固定六节正文', async () => {
  const markdown = await readFile(EFFECT_CARD_PATH, 'utf8');
  const effect = parseEffect(markdown, EFFECT_CARD_PATH);
  const { body, filePath, ...parsed } = effect;

  assert.equal(filePath, EFFECT_CARD_PATH);
  assert.deepEqual(parsed, EXPECTED_EFFECT);
  assert.deepEqual(
    [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
    EXPECTED_SECTIONS,
  );
});

test('完整目录的协议、来源许可证和预览字节均可独立验证', async () => {
  const effects = await loadEffects(EFFECTS_PATH);

  assert.deepEqual(
    effects.map((effect) => effect.ref),
    EXPECTED_CATALOG_REFS,
  );

  for (const effect of effects) {
    assert.doesNotMatch(effect.ref, /grade-images/i);
    assert.doesNotMatch(effect.body, /grade-images/i);
    if (MIGRATED_EFFECT_IDS.includes(effect.id)) {
      assert.doesNotMatch(effect.body, /dog|tiramisu|狗狗|提拉米苏/i);
      assert.doesNotMatch(effect.previewProvenance.origin, /dog|tiramisu|狗狗|提拉米苏/i);
    }
    assert.deepEqual(
      [...effect.body.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
      EXPECTED_SECTIONS,
      effect.ref,
    );

    const licenseSource = effect.sources.find(({ path: sourcePath }) => sourcePath === 'LICENSE');
    assert.ok(licenseSource, `${effect.ref} must map the fixed source LICENSE`);
    const noticeBytes = await readFile(path.join(SKILL_ROOT, effect.sourceLicenseNotice));
    assert.equal(
      licenseSource.sha256,
      createHash('sha256').update(noticeBytes).digest('hex'),
      `${effect.ref} LICENSE mapping`,
    );

    const previewBytes = await readFile(path.join(SKILL_ROOT, effect.preview));
    assert.equal(
      effect.previewProvenance.sha256,
      createHash('sha256').update(previewBytes).digest('hex'),
      `${effect.ref} preview mapping`,
    );
  }
});

test('Scene Distillation 保留无预设的作者型 Typography Director', async () => {
  const effects = await loadEffects(EFFECTS_PATH);
  const effect = effects.find(({ ref }) => ref === 'scene-distillation-zine@1.0.0');

  assert.ok(effect, 'missing Scene Distillation card');
  assert.match(
    effect.body,
    /Do not impose a preset language, word count, character count, copy length, type voice, hierarchy, or legibility threshold/,
  );
  assert.match(
    effect.body,
    /tiny, oversized, cropped, scattered, stacked, rotated, curved, obscured, fragmented, or overwritten/,
  );
  assert.match(effect.body, /one type voice or many/);
  assert.match(
    effect.body,
    /Accidental tool-generated gibberish is a failure only when it was not deliberately chosen as authorial invented language, marks, or fragments/,
  );
  assert.doesNotMatch(
    effect.body,
    /at most one short title|large display type|pseudo-text|typography is authorial, correct, and subordinate|invalid text/i,
  );
});

test('完整的固定来源许可证目录只包含已审核的 notice 字节', async () => {
  assert.deepEqual((await readdir(LICENSES_PATH)).sort(), Object.keys(LICENSE_HASHES).sort());

  for (const [fileName, expectedHash] of Object.entries(LICENSE_HASHES)) {
    const notice = await readFile(path.join(LICENSES_PATH, fileName));
    assert.equal(createHash('sha256').update(notice).digest('hex'), expectedHash, fileName);
  }
});

test('两阶段 layout 路由在 Stage A 和 Stage B 之间共享一次定向重试额度', async () => {
  const skill = await readFile(SKILL_PATH, 'utf8');
  const layoutBranch = skill.match(
    /### `host-image-generation-and-layout`\n(?<protocol>[\s\S]+?)\nDo not substitute/,
  )?.groups?.protocol;

  assert.ok(layoutBranch, 'missing host-image-generation-and-layout protocol');
  assert.match(layoutBranch, /Stage A and Stage B share one total targeted retry budget/);
  assert.match(
    layoutBranch,
    /Stage A regeneration after an image-tool error or hard-quality failure[^\n]+Stage B repair and recapture after a layout or screenshot tool error or hard-quality failure, never both/,
  );
  assert.match(
    layoutBranch,
    /If Stage A spends the budget, report any Stage B failure without another retry/,
  );
  assert.match(
    layoutBranch,
    /When Stage B spends the budget, do not regenerate an already acceptable motif/,
  );
});

test('Skill 只接受精确版本引用，裸 ID 必须回到 INDEX 选择', async () => {
  const skill = await readFile(SKILL_PATH, 'utf8');
  const resolveProtocol = skill.match(
    /## Resolve the effect\n(?<protocol>[\s\S]+?)\n## Validate the input/,
  )?.groups?.protocol;

  assert.ok(resolveProtocol, 'missing effect resolution protocol');
  assert.match(resolveProtocol, /complete `<id>@<version>`/);
  assert.match(
    resolveProtocol,
    /ID without a version[\s\S]+references\/INDEX\.md[\s\S]+exact version/,
  );
  assert.doesNotMatch(resolveProtocol, /exactly one version[\s\S]+resolve/i);
});

test('Minimal Zine 保留固定来源的版式与字体变化能力', async () => {
  const effects = await loadEffects(EFFECTS_PATH);
  const effect = effects.find(({ ref }) => ref === 'minimal-zine-poster@1.0.0');

  assert.ok(effect, 'missing Minimal Zine card');
  assert.match(effect.body, /center-fragment[\s\S]+dual-panel[\s\S]+type-led/);
  assert.match(effect.body, /optional tiny date, location, weather, or signature/i);
  assert.match(effect.body, /semi-legible microtext|fragmented letters/i);
  assert.match(effect.body, /headline-as-object/i);
  assert.match(
    effect.body,
    /variation recipe[\s\S]+layout[\s\S]+anchor[\s\S]+typography[\s\S]+texture[\s\S]+mood/i,
  );
  assert.doesNotMatch(effect.body, /Keep it subordinate, legible/);
  assert.doesNotMatch(effect.body, /Add no metadata[\s\S]+second text block/);
  assert.doesNotMatch(effect.body, /large display copy|pseudo-text|signatures, watermarks/i);
});

test('撕纸编辑影像拼贴保留单图输入、核心构图与拟像检查', async () => {
  const effects = await loadEffects(EFFECTS_PATH);
  const effect = effects.find(
    ({ ref }) => ref === 'torn-paper-editorial-photo-collage@1.0.0',
  );

  assert.ok(effect, 'missing Torn Paper Editorial Photo Collage card');
  assert.equal(effect.executionKind, 'host-image-generation');
  assert.deepEqual(effect.input, { mode: 'image', min: 1, max: 1, formats: ['jpeg', 'png'] });
  assert.equal(effect.sourceRepository, 'wangjs-jacky/happy');
  assert.equal(effect.sourceRevision, 'd1259c69fdc5494553f31b6736b640d597a89bfb');
  assert.equal(effect.preview, 'assets/previews/torn-paper-editorial-photo-collage.jpg');
  assert.match(effect.body, /45% to 65%/);
  assert.match(effect.body, /exactly one broad opaque dry-brush swash/i);
  assert.match(effect.body, /face-like pareidolia/i);
  assert.match(effect.body, /host's native image-delivery path/i);
});

test('真实编码的干净 JPEG 和 PNG 可完整解码并通过元数据检查', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-media-'));
  try {
    const { inspectImage, assertMetadataFreeImage } = await loadImageTools();
    const fixtures = await createFixtures(directory);

    assert.deepEqual(await inspectImage(fixtures.jpeg, 'jpeg'), {
      format: 'jpeg',
      width: 7,
      height: 5,
    });
    assert.deepEqual(await assertMetadataFreeImage(fixtures.png, 'png'), {
      format: 'png',
      width: 7,
      height: 5,
    });
    assert.deepEqual(await assertMetadataFreeImage(fixtures.progressiveJpeg, 'jpeg'), {
      format: 'jpeg',
      width: 7,
      height: 5,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 拒绝 EXIF、XMP、COM、GPS 和设备文本元数据', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-metadata-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);
    const samples = [
      ['EXIF', 0xe1, Buffer.from('Exif\0\0II*\0', 'binary')],
      [
        'XMP',
        0xe1,
        Buffer.from('http://ns.adobe.com/xap/1.0/\0<x:xmpmeta>private</x:xmpmeta>'),
      ],
      ['COM', 0xfe, Buffer.from('private comment')],
      ['GPS', 0xed, Buffer.from('GPSLatitude=31.2304;GPSLongitude=121.4737')],
      ['设备文本', 0xed, Buffer.from('Make=Example;Model=Camera Device')],
      ['APP13 IPTC', 0xed, Buffer.from('Photoshop 3.0\0IPTC private record')],
      ['APP2 Camera Model Phone', 0xe2, Buffer.from('Camera Model Phone')],
      ['APP15 Device NUL Phone', 0xef, Buffer.from('Device\0Phone')],
    ];

    for (const [name, marker, payload] of samples) {
      await t.test(name, async () => {
        await assert.rejects(
          () => assertMetadataFreeImage(injectJpegSegment(jpeg, marker, payload), 'jpeg'),
          /metadata|EXIF|XMP|comment|GPS|device/i,
        );
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 接受结构合法的 APP14 Adobe 白名单段', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-app-allowlist-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);
    const adobe = Buffer.alloc(12);
    adobe.write('Adobe', 0, 'ascii');
    adobe.writeUInt16BE(100, 5);
    adobe[11] = 1;

    assert.deepEqual(
      await assertMetadataFreeImage(injectJpegSegment(jpeg, 0xee, adobe), 'jpeg'),
      { format: 'jpeg', width: 7, height: 5 },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 拒绝普通 JFXX 和嵌入 EXIF 或 COM 的 JFXX JPEG 缩略图', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-jfxx-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);
    const jfxxPrefix = Buffer.from('JFXX\0', 'binary');
    const nestedExif = injectJpegSegment(jpeg, 0xe1, Buffer.from('Exif\0\0II*\0', 'binary'));
    const nestedComment = injectJpegSegment(jpeg, 0xfe, Buffer.from('private comment'));
    const samples = [
      [
        '普通 JFXX RGB 缩略图',
        Buffer.concat([jfxxPrefix, Buffer.from([0x13, 1, 1, 12, 34, 56])]),
      ],
      ['嵌入 EXIF', Buffer.concat([jfxxPrefix, Buffer.from([0x10]), nestedExif])],
      ['嵌入 COM', Buffer.concat([jfxxPrefix, Buffer.from([0x10]), nestedComment])],
    ];

    for (const [name, jfxx] of samples) {
      await t.test(name, async () => {
        await assert.rejects(
          () =>
            assertMetadataFreeImage(insertAfterFirstJpegSegment(jpeg, 0xe0, jfxx), 'jpeg'),
          /APP0|JFXX|metadata/i,
        );
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 拒绝 JFIF APP0 内嵌的 1x1 RGB 缩略图', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-jfif-thumbnail-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);
    const jfif = Buffer.alloc(17);
    jfif.write('JFIF\0', 0, 'binary');
    jfif[5] = 1;
    jfif[6] = 2;
    jfif.writeUInt16BE(1, 8);
    jfif.writeUInt16BE(1, 10);
    jfif[12] = 1;
    jfif[13] = 1;
    jfif.set([12, 34, 56], 14);

    await assert.rejects(
      () => assertMetadataFreeImage(injectJpegSegment(jpeg, 0xe0, jfif), 'jpeg'),
      { message: 'JPEG APP0 contains an invalid JFIF structure' },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 拒绝版本字段非法的 JFIF 和 Adobe 白名单段', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-app-structure-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);

    const jfif = Buffer.alloc(14);
    jfif.write('JFIF\0', 0, 'binary');
    jfif[5] = 0;
    jfif.writeUInt16BE(1, 8);
    jfif.writeUInt16BE(1, 10);

    const adobe = Buffer.alloc(12);
    adobe.write('Adobe', 0, 'ascii');
    adobe.writeUInt16BE(99, 5);
    adobe[11] = 1;

    await t.test('JFIF version', async () => {
      await assert.rejects(
        () => assertMetadataFreeImage(injectJpegSegment(jpeg, 0xe0, jfif), 'jpeg'),
        { message: 'JPEG APP0 contains an invalid JFIF structure' },
      );
    });
    await t.test('Adobe version', async () => {
      await assert.rejects(
        () => assertMetadataFreeImage(injectJpegSegment(jpeg, 0xee, adobe), 'jpeg'),
        /JPEG APP|Adobe|structure/i,
      );
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 拒绝 SOS 前的 restart marker', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-state-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);
    const invalid = Buffer.concat([
      jpeg.subarray(0, 2),
      Buffer.from([0xff, 0xd0]),
      jpeg.subarray(2),
    ]);

    await assert.rejects(
      () => assertMetadataFreeImage(invalid, 'jpeg'),
      /JPEG structure|restart|scan/i,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 严格解码拒绝保留 EOI 但删除 1 到 1024 字节熵数据的图片', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-truncated-scan-'));
  try {
    const { inspectImage } = await loadImageTools();
    const jpeg = await createEntropyRichJpeg(directory);

    for (const byteCount of [1, 8, 64, 512, 1024]) {
      await t.test(`删除 ${byteCount} 字节`, async () => {
        await assert.rejects(
          () => inspectImage(removeJpegEntropyTail(jpeg, byteCount), 'jpeg'),
          /warning|truncat|corrupt|decode|scan/i,
        );
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JPEG 拒绝 EOI 后追加的 COM 段和任意尾随字节', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-jpeg-trailing-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);
    const samples = [
      ['COM 段', jpegSegment(0xfe, Buffer.from('private trailing comment'))],
      ['任意字节', Buffer.from([0xde, 0xad, 0xbe, 0xef])],
    ];

    for (const [name, suffix] of samples) {
      await t.test(name, async () => {
        await assert.rejects(
          () => assertMetadataFreeImage(Buffer.concat([jpeg, suffix]), 'jpeg'),
          /JPEG structure|trailing|EOI/i,
        );
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('PNG 拒绝 eXIf、tEXt、zTXt 和 iTXt 元数据块', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-png-metadata-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { png } = await createFixtures(directory);
    const samples = [
      ['eXIf', Buffer.from('II*\0Exif')],
      ['tEXt', Buffer.from('Comment\0private')],
      ['zTXt', Buffer.from('Comment\0\0compressed')],
      ['iTXt', Buffer.from('Description\0\0\0\0\0private')],
    ];

    for (const [type, payload] of samples) {
      await t.test(type, async () => {
        await assert.rejects(
          () => assertMetadataFreeImage(injectPngChunk(png, type, payload), 'png'),
          new RegExp(`metadata|${type}`, 'i'),
        );
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('PNG 拒绝 ancillary chunk 和 IEND 的损坏 CRC', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-png-crc-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { png } = await createFixtures(directory);
    const withAncillary = injectPngChunk(
      png,
      'pHYs',
      Buffer.from([0, 0, 0x0e, 0xc4, 0, 0, 0x0e, 0xc4, 1]),
    );
    const samples = [
      ['ancillary pHYs', corruptPngChunkCrc(withAncillary, 'pHYs')],
      ['IEND', corruptPngChunkCrc(png, 'IEND')],
    ];

    for (const [name, sample] of samples) {
      await t.test(name, async () => {
        await assert.rejects(
          () => assertMetadataFreeImage(sample, 'png'),
          /PNG structure|CRC/i,
        );
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('PNG 拒绝非法 IHDR、IEND 和 reserved bit chunk 状态', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-png-state-'));
  try {
    const { assertMetadataFreeImage } = await loadImageTools();
    const { png } = await createFixtures(directory);
    const samples = [
      [
        'IHDR 非首块',
        Buffer.concat([png.subarray(0, 8), pngChunk('aaAa', Buffer.alloc(0)), png.subarray(8)]),
      ],
      ['duplicate IHDR', injectPngChunk(png, 'IHDR', pngChunkPayload(png, 'IHDR'))],
      [
        'IHDR length',
        replacePngChunk(
          png,
          'IHDR',
          pngChunk('IHDR', pngChunkPayload(png, 'IHDR').subarray(0, 12)),
        ),
      ],
      ['非连续 IDAT', splitPngIdatWithAncillaryChunk(png)],
      ['IEND payload', replacePngChunk(png, 'IEND', pngChunk('IEND', Buffer.from([0])))],
      ['第三字符小写', injectPngChunk(png, 'aaab', Buffer.alloc(0))],
    ];

    for (const [name, sample] of samples) {
      await t.test(name, async () => {
        await assert.rejects(() => assertMetadataFreeImage(sample, 'png'));
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('图像检查在 raw 输出分配前拒绝超过 2000 万像素的 PNG header', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-pixel-limit-'));
  try {
    const { inspectImage } = await loadImageTools();
    const { png } = await createFixtures(directory);
    const oversized = oversizedPngHeader(png, 5000, 4001);

    await assert.rejects(() => inspectImage(oversized, 'png'), /pixel limit/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('图像检查拒绝未知格式和未完成像素解码的损坏图片', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-effects-decode-'));
  try {
    const { inspectImage } = await loadImageTools();
    const { jpeg } = await createFixtures(directory);

    await assert.rejects(() => inspectImage(jpeg, 'webp'), /unsupported.*format/i);
    await assert.rejects(() => inspectImage(jpeg.subarray(0, jpeg.length - 24), 'jpeg'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('授权预览具有固定 SHA、尺寸且不含被禁止的元数据', async () => {
  const sharp = await loadSharp();
  const { assertMetadataFreeImage } = await loadImageTools();
  const buffer = await readFile(PREVIEW_PATH);

  assert.equal(createHash('sha256').update(buffer).digest('hex'), PREVIEW_SHA256);
  assert.deepEqual(await assertMetadataFreeImage(buffer, 'jpeg'), {
    format: 'jpeg',
    width: 1448,
    height: 1086,
  });
  const { info } = await sharp(buffer, { failOn: 'error' }).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 1448);
  assert.equal(info.height, 1086);
});

test('八张独立生成预览可完整解码、无禁止元数据且符合目标方向', async () => {
  const { assertMetadataFreeImage } = await loadImageTools();

  for (const [fileName, expectedDimensions] of Object.entries(GENERATED_PREVIEWS)) {
    const previewPath = path.join(SKILL_ROOT, 'assets/previews', fileName);
    const buffer = await readFile(previewPath);
    const digest = createHash('sha256').update(buffer).digest('hex');
    const expectedFormat = path.extname(fileName) === '.jpg' ? 'jpeg' : 'png';
    const image = await assertMetadataFreeImage(buffer, expectedFormat);

    assert.match(digest, /^[0-9a-f]{64}$/, fileName);
    assert.equal(image.format, expectedFormat, fileName);
    assert.deepEqual(
      { width: image.width, height: image.height },
      expectedDimensions,
      fileName,
    );
  }
});
