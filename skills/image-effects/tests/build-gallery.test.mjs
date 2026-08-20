import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildGallery } from '../scripts/build-gallery.mjs';
import { assertMetadataFreeImage } from '../scripts/image-metadata.mjs';
import {
  fetchGitHubContent,
  validateEffects,
  validateOnlineSources,
} from '../scripts/validate-effects.mjs';
import { EXPECTED_CATALOG as FULL_CATALOG } from './catalog-fixture.mjs';

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_TEMPLATE_ROOT = existsSync(
  path.join(SKILL_ROOT, 'assets/public-repo/THIRD_PARTY_NOTICES.header.md'),
)
  ? path.join(SKILL_ROOT, 'assets/public-repo')
  : SKILL_ROOT;
const GENERATED_NOTICE_PATH = PUBLIC_TEMPLATE_ROOT === SKILL_ROOT
  ? 'THIRD_PARTY_NOTICES.md'
  : 'assets/public-repo/THIRD_PARTY_NOTICES.md';
const EFFECT_REF = 'healing-anime-scribble-v3@1.0.0';
const REVISION = 'aaf9a82f5efd73e87cc0998edc398e75bfc35901';
const SOURCE_PATH =
  'skills/gpt-image-2/references/avatars-and-profile/style-transfer-selfie.md';
const SOURCE_BYTES = Buffer.from('fixed upstream bytes\n');
const SOURCE_SHA = createHash('sha256').update(SOURCE_BYTES).digest('hex');
const LICENSE_PATH = 'LICENSE';
const LICENSE_BYTES = await readFile(
  path.join(SKILL_ROOT, 'references/licenses/conardli-garden-skills-mit.txt'),
);
const LICENSE_SHA = '1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685';
const MANAGED_PATHS = [
  'assets/public-repo/THIRD_PARTY_NOTICES.md',
  'gallery/api/library.json',
  `gallery/media/${EFFECT_REF}.jpg`,
  `gallery/source/${EFFECT_REF}.md`,
  'references/INDEX.md',
];
const FULL_CATALOG_REFS = FULL_CATALOG.map(([ref]) => ref);
const FULL_MANAGED_PATHS = [
  GENERATED_NOTICE_PATH,
  'gallery/api/library.json',
  'references/INDEX.md',
  ...FULL_CATALOG.flatMap(([ref, extension]) => [
    `gallery/media/${ref}${extension}`,
    `gallery/source/${ref}.md`,
  ]),
].sort();
const NOTICE_EXPECTATIONS = [
  ['references/licenses/conardli-garden-skills-mit.txt', 'Copyright (c) 2026'],
  [
    'references/licenses/gathered-scenes-zine-contributors-mit.txt',
    'Copyright (c) 2026 Gathered Scenes Zine contributors',
  ],
  [
    'references/licenses/happy-coder-contributors-mit.txt',
    'Copyright (c) 2026 Happy Coder Contributors',
  ],
  ['references/licenses/liamgvchi-mit.txt', 'Copyright (c) 2026 LiamGvchi'],
];

function occurrenceCount(haystack, needle) {
  return haystack.split(needle).length - 1;
}

async function makeFixtureSource(root, sourceSha = SOURCE_SHA) {
  await Promise.all([
    mkdir(path.join(root, 'references/effects'), { recursive: true }),
    mkdir(path.join(root, 'references/licenses'), { recursive: true }),
    mkdir(path.join(root, 'assets/previews'), { recursive: true }),
    mkdir(path.join(root, 'assets/public-repo'), { recursive: true }),
  ]);

  const card = (
    await readFile(
      path.join(SKILL_ROOT, 'references/effects/healing-anime-scribble-v3.md'),
      'utf8',
    )
  ).replace(
    /^source_sha256s: .*$/m,
    `source_sha256s: ${sourceSha},${LICENSE_SHA}`,
  );
  await Promise.all([
    writeFile(path.join(root, 'references/effects/healing-anime-scribble-v3.md'), card),
    cp(
      path.join(SKILL_ROOT, 'assets/previews/healing-anime-scribble-v3.jpg'),
      path.join(root, 'assets/previews/healing-anime-scribble-v3.jpg'),
    ),
    cp(
      path.join(SKILL_ROOT, 'references/licenses/conardli-garden-skills-mit.txt'),
      path.join(root, 'references/licenses/conardli-garden-skills-mit.txt'),
    ),
    writeFile(
      path.join(root, 'assets/public-repo/THIRD_PARTY_NOTICES.header.md'),
      '# Fixture notice header\n\nFixture license text.\n',
    ),
  ]);
}

test('完整目录构建逐字节可复现并包含完整语义目录、真实尺寸与 4 份完整 notice', async () => {
  const outputOne = await mkdtemp(path.join(tmpdir(), 'image-effects-full-output-one-'));
  const outputTwo = await mkdtemp(path.join(tmpdir(), 'image-effects-full-output-two-'));

  try {
    await buildGallery({
      sourceRoot: SKILL_ROOT,
      outputRoot: outputOne,
      generatedAt: '2026-08-18T00:00:00.000Z',
    });
    await buildGallery({
      sourceRoot: SKILL_ROOT,
      outputRoot: outputTwo,
      generatedAt: '2026-08-18T00:00:00.000Z',
    });

    const firstTree = await fileTree(outputOne);
    assert.deepEqual(firstTree, await fileTree(outputTwo));
    assert.deepEqual(firstTree.map(([relativePath]) => relativePath), FULL_MANAGED_PATHS);

    const library = JSON.parse(
      await readFile(path.join(outputOne, 'gallery/api/library.json'), 'utf8'),
    );
    assert.equal(library.schemaVersion, 2);
    assert.equal(library.generatedAt, '2026-08-18T00:00:00.000Z');
    assert.deepEqual(library.effects.map(({ ref }) => ref), FULL_CATALOG_REFS);
    for (const effect of library.effects) {
      const previewPath = path.join(
        outputOne,
        'gallery',
        effect.previewUrl.replace(/^\.\//, ''),
      );
      const format = effect.previewUrl.endsWith('.png') ? 'png' : 'jpeg';
      const metadata = await assertMetadataFreeImage(await readFile(previewPath), format);
      assert.deepEqual(
        { width: effect.previewWidth, height: effect.previewHeight },
        { width: metadata.width, height: metadata.height },
        `${effect.ref} intrinsic dimensions`,
      );
    }

    const notices = await readFile(path.join(outputOne, GENERATED_NOTICE_PATH), 'utf8');
    assert.equal(occurrenceCount(notices, 'MIT License'), 4);
    let previousHeading = -1;
    for (const [noticePath, copyrightLine] of NOTICE_EXPECTATIONS) {
      const noticeBody = await readFile(path.join(SKILL_ROOT, noticePath), 'utf8');
      assert.equal(occurrenceCount(notices, noticeBody.trimEnd()), 1, noticePath);
      assert.equal(
        notices.split('\n').filter((line) => line === copyrightLine).length,
        1,
        copyrightLine,
      );
      const heading = notices.indexOf(`### \`${noticePath}\``);
      assert.ok(heading > previousHeading, `${noticePath} must be in ASCII path order`);
      previousHeading = heading;
    }
    assert.match(
      notices,
      /Zeejay0\/scene-distillation-zine-v1-3@921390baac518c85d60a6d98709f1dd657eec720/,
    );
    assert.match(
      notices,
      /Zeejay0\/gathered-scenes-zine-skill.*e764b7fd243d7cc501723b9d325279bf6dd852c2/s,
    );
  } finally {
    await Promise.all([
      rm(outputOne, { recursive: true, force: true }),
      rm(outputTwo, { recursive: true, force: true }),
    ]);
  }
});

test('公开根布局可用根 notice 模板完成构建并把生成 notice 留在根目录', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-public-root-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-public-root-output-'));
  try {
    await makeFixtureSource(sourceRoot);
    const nestedHeader = path.join(
      sourceRoot,
      'assets/public-repo/THIRD_PARTY_NOTICES.header.md',
    );
    await writeFile(
      path.join(sourceRoot, 'THIRD_PARTY_NOTICES.header.md'),
      await readFile(nestedHeader),
    );
    await rm(nestedHeader);

    const { paths } = await buildGallery({ sourceRoot, outputRoot });

    assert.ok(paths.includes('THIRD_PARTY_NOTICES.md'));
    assert.ok(!paths.includes('assets/public-repo/THIRD_PARTY_NOTICES.md'));
    assert.match(await readFile(path.join(outputRoot, 'THIRD_PARTY_NOTICES.md'), 'utf8'), /MIT License/);
    await assert.rejects(
      stat(path.join(outputRoot, 'assets/public-repo/THIRD_PARTY_NOTICES.md')),
      { code: 'ENOENT' },
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('提交的生成目录与固定 epoch 构建逐字节一致且没有陈旧单效果树', async () => {
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-checked-artifacts-'));
  try {
    await buildGallery({
      sourceRoot: SKILL_ROOT,
      outputRoot,
      generatedAt: '2026-08-18T00:00:00.000Z',
    });
    const expectedTree = await fileTree(outputRoot);
    const checkedTree = [];
    for (const [relativePath] of expectedTree) {
      const bytes = await readFile(path.join(SKILL_ROOT, relativePath));
      checkedTree.push([relativePath, createHash('sha256').update(bytes).digest('hex')]);
    }
    assert.deepEqual(checkedTree, expectedTree);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

async function fileTree(root) {
  const entries = [];
  async function visit(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = path.posix.join(prefix, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute, relative);
      else if (entry.isFile()) {
        const bytes = await readFile(absolute);
        entries.push([relative, createHash('sha256').update(bytes).digest('hex')]);
      }
    }
  }
  await visit(root);
  return entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
}

async function topologyTree(root) {
  const entries = [];
  async function visit(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relativePath = path.posix.join(prefix, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        entries.push({ path: relativePath, type: 'symlink', target: await readlink(absolutePath) });
      } else if (entry.isDirectory()) {
        entries.push({ path: relativePath, type: 'directory' });
        await visit(absolutePath, relativePath);
      } else if (entry.isFile()) {
        const bytes = await readFile(absolutePath);
        entries.push({
          path: relativePath,
          type: 'file',
          sha256: createHash('sha256').update(bytes).digest('hex'),
        });
      } else {
        entries.push({ path: relativePath, type: 'other' });
      }
    }
  }
  await visit(root);
  return entries.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
}

async function addUnmanagedTopology(outputRoot, externalRoot) {
  await mkdir(path.join(outputRoot, 'keep-dir/nested'), { recursive: true });
  await writeFile(path.join(outputRoot, 'keep-dir/nested/value.txt'), 'keep\n');
  await symlink(externalRoot, path.join(outputRoot, 'keep-link'), 'dir');
}

test('固定 epoch 在两个独立输出目录生成逐字节相同的完整受管树', async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputOne = await mkdtemp(path.join(tmpdir(), 'image-effects-output-one-'));
  const outputTwo = await mkdtemp(path.join(tmpdir(), 'image-effects-output-two-'));
  const previousEpoch = process.env.SOURCE_DATE_EPOCH;
  process.env.SOURCE_DATE_EPOCH = '1786809600';

  try {
    await makeFixtureSource(fixtureRoot);
    await buildGallery({ sourceRoot: fixtureRoot, outputRoot: outputOne });
    await buildGallery({ sourceRoot: fixtureRoot, outputRoot: outputTwo });

    const firstTree = await fileTree(outputOne);
    const secondTree = await fileTree(outputTwo);
    assert.deepEqual(firstTree, secondTree);
    assert.deepEqual(firstTree.map(([name]) => name), MANAGED_PATHS);

    const library = JSON.parse(
      await readFile(path.join(outputOne, 'gallery/api/library.json'), 'utf8'),
    );
    assert.equal(library.schemaVersion, 2);
    assert.equal(library.generatedAt, '2026-08-15T16:00:00.000Z');
    assert.equal(library.effects[0].executionKind, 'host-image-generation');
    assert.equal(library.effects[0].previewWidth, 1448);
    assert.equal(library.effects[0].previewHeight, 1086);
    assert.deepEqual(library.effects[0].provenance, {
      repository: 'ConardLi/garden-skills',
      revision: REVISION,
      license: {
        spdx: 'MIT',
        url: `https://github.com/ConardLi/garden-skills/blob/${REVISION}/LICENSE`,
      },
      preview: {
        origin:
          'Text-only image generation of a fictional young adult with glasses, not based on a real person.',
        author: 'wangjs-jacky',
        licenseSpdx: 'CC-BY-4.0',
      },
    });
    assert.equal(library.effects[0].previewUrl, `./media/${EFFECT_REF}.jpg`);
    assert.equal(library.effects[0].sourceUrl, `./source/${EFFECT_REF}.md`);

    const copiedCard = await readFile(
      path.join(outputOne, `gallery/source/${EFFECT_REF}.md`),
      'utf8',
    );
    const originalCard = await readFile(
      path.join(fixtureRoot, 'references/effects/healing-anime-scribble-v3.md'),
      'utf8',
    );
    assert.equal(copiedCard, originalCard);
    assert.match(
      await readFile(path.join(outputOne, 'references/INDEX.md'), 'utf8'),
      /healing-anime-scribble-v3@1\.0\.0/,
    );
  } finally {
    if (previousEpoch === undefined) delete process.env.SOURCE_DATE_EPOCH;
    else process.env.SOURCE_DATE_EPOCH = previousEpoch;
    await Promise.all([
      rm(fixtureRoot, { recursive: true, force: true }),
      rm(outputOne, { recursive: true, force: true }),
      rm(outputTwo, { recursive: true, force: true }),
    ]);
  }
});

test('单次构建只读取一次预览并发布完成 SHA 与元数据校验的同一缓冲区', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-single-read-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-single-read-output-'));
  const previewPath = path.join(
    sourceRoot,
    'assets/previews/healing-anime-scribble-v3.jpg',
  );
  let reads = 0;
  let validatedBytes;

  try {
    await makeFixtureSource(sourceRoot);
    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-18T00:00:00.000Z',
      previewReader: async (candidate) => {
        reads += 1;
        validatedBytes = await readFile(candidate);
        await writeFile(candidate, 'changed after the validated read\n');
        return validatedBytes;
      },
    });

    assert.equal(reads, 1);
    assert.deepEqual(
      await readFile(path.join(outputRoot, `gallery/media/${EFFECT_REF}.jpg`)),
      validatedBytes,
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('重建删除旧清单拥有的陈旧产物并保留非受管文件', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));
  const staleRef = 'retired-effect@9.9.9';

  try {
    await makeFixtureSource(sourceRoot);
    await Promise.all([
      mkdir(path.join(outputRoot, 'gallery/api'), { recursive: true }),
      mkdir(path.join(outputRoot, 'gallery/media'), { recursive: true }),
      mkdir(path.join(outputRoot, 'gallery/source'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        path.join(outputRoot, 'gallery/api/library.json'),
        JSON.stringify({
          schemaVersion: 1,
          effects: [
            {
              previewUrl: `./media/${staleRef}.jpg`,
              sourceUrl: `./source/${staleRef}.md`,
            },
          ],
        }),
      ),
      writeFile(path.join(outputRoot, `gallery/media/${staleRef}.jpg`), 'stale'),
      writeFile(path.join(outputRoot, `gallery/source/${staleRef}.md`), 'stale'),
      writeFile(path.join(outputRoot, 'gallery/media/manual-note.txt'), 'keep'),
      writeFile(path.join(outputRoot, 'gallery/api/custom.json'), 'keep'),
    ]);

    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-16T00:00:00.000Z',
    });

    await assert.rejects(
      () => stat(path.join(outputRoot, `gallery/media/${staleRef}.jpg`)),
      /ENOENT/,
    );
    await assert.rejects(
      () => stat(path.join(outputRoot, `gallery/source/${staleRef}.md`)),
      /ENOENT/,
    );
    assert.equal(await readFile(path.join(outputRoot, 'gallery/media/manual-note.txt'), 'utf8'), 'keep');
    assert.equal(await readFile(path.join(outputRoot, 'gallery/api/custom.json'), 'utf8'), 'keep');
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('拒绝 outputRoot 本身或任一受管父目录 symlink，外部树保持不变', async (t) => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  await makeFixtureSource(sourceRoot);

  try {
    for (const symlinkPath of [
      '.',
      'gallery',
      'gallery/media',
      'gallery/source',
      'assets/public-repo',
      'gallery/api/library.json',
    ]) {
      await t.test(symlinkPath === '.' ? 'outputRoot' : symlinkPath, async () => {
        const caseRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-symlink-case-'));
        const externalRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-external-'));
        const outputRoot = path.join(caseRoot, 'output');
        await mkdir(path.join(externalRoot, 'nested'), { recursive: true });
        await writeFile(path.join(externalRoot, 'nested/sentinel.txt'), 'outside\n');
        await symlink(
          path.join(externalRoot, 'nested/sentinel.txt'),
          path.join(externalRoot, 'sentinel-link'),
        );

        if (symlinkPath === '.') {
          await symlink(externalRoot, outputRoot, 'dir');
        } else {
          await mkdir(path.dirname(path.join(outputRoot, symlinkPath)), { recursive: true });
          await symlink(externalRoot, path.join(outputRoot, symlinkPath), 'dir');
        }
        const oldExternal = await topologyTree(externalRoot);
        const oldOutput = await topologyTree(caseRoot);

        try {
          await assert.rejects(
            () =>
              buildGallery({
                sourceRoot,
                outputRoot,
                generatedAt: '2026-08-16T00:00:00.000Z',
              }),
            /symbolic link|symlink/i,
          );
          assert.deepEqual(await topologyTree(externalRoot), oldExternal);
          assert.deepEqual(await topologyTree(caseRoot), oldOutput);
        } finally {
          await Promise.all([
            rm(caseRoot, { recursive: true, force: true }),
            rm(externalRoot, { recursive: true, force: true }),
          ]);
        }
      });
    }
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
  }
});

test('同一 outputRoot 的第二个构建立即失败且不会生成混合版本', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));
  let enterFirstExchange;
  let releaseFirstBuild;
  const firstExchange = new Promise((resolve) => {
    enterFirstExchange = resolve;
  });
  const release = new Promise((resolve) => {
    releaseFirstBuild = resolve;
  });

  try {
    await makeFixtureSource(sourceRoot);
    const firstBuild = buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-15T00:00:00.000Z',
      transactionHooks: {
        beforeExchange: async () => {
          enterFirstExchange();
          await release;
        },
      },
    });
    await firstExchange;

    await assert.rejects(
      () =>
        buildGallery({
          sourceRoot,
          outputRoot,
          generatedAt: '2026-08-16T00:00:00.000Z',
        }),
      /build.*(?:lock|progress)|(?:lock|progress).*build/i,
    );
    releaseFirstBuild();
    await firstBuild;

    const library = JSON.parse(
      await readFile(path.join(outputRoot, 'gallery/api/library.json'), 'utf8'),
    );
    assert.equal(library.generatedAt, '2026-08-15T00:00:00.000Z');
    assert.deepEqual(
      (await fileTree(outputRoot)).map(([relativePath]) => relativePath),
      MANAGED_PATHS,
    );
    await assert.rejects(
      () => stat(path.join(outputRoot, '.image-effects-build.lock')),
      /ENOENT/,
    );
  } finally {
    releaseFirstBuild?.();
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('预检、首次交换、中途交换和 stale 清理异常均完整恢复旧拓扑', async (t) => {
  const scenarios = [
    {
      name: '预检后',
      hooks: { afterPreflight: async () => { throw new Error('injected after preflight'); } },
      expected: /injected after preflight/,
    },
    {
      name: '首次交换前',
      hooks: { beforeExchange: async () => { throw new Error('injected first exchange'); } },
      expected: /injected first exchange/,
    },
    {
      name: '中途交换前',
      hooks: {
        beforeExchange: async ({ index }) => {
          if (index === 2) throw new Error('injected middle exchange');
        },
      },
      expected: /injected middle exchange/,
    },
    {
      name: 'stale 删除后',
      withStale: true,
      hooks: { afterStaleDelete: async () => { throw new Error('injected stale cleanup'); } },
      expected: /injected stale cleanup/,
    },
  ];

  for (const scenario of scenarios) {
    await t.test(scenario.name, async () => {
      const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
      const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));
      const externalRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-external-'));
      try {
        await makeFixtureSource(sourceRoot);
        await addUnmanagedTopology(outputRoot, externalRoot);
        if (scenario.withStale) {
          const staleRef = 'retired-effect@9.9.9';
          await Promise.all([
            mkdir(path.join(outputRoot, 'gallery/api'), { recursive: true }),
            mkdir(path.join(outputRoot, 'gallery/media'), { recursive: true }),
            mkdir(path.join(outputRoot, 'gallery/source'), { recursive: true }),
          ]);
          await Promise.all([
            writeFile(
              path.join(outputRoot, 'gallery/api/library.json'),
              JSON.stringify({
                schemaVersion: 1,
                effects: [
                  {
                    previewUrl: `./media/${staleRef}.jpg`,
                    sourceUrl: `./source/${staleRef}.md`,
                  },
                ],
              }),
            ),
            writeFile(path.join(outputRoot, `gallery/media/${staleRef}.jpg`), 'stale image'),
            writeFile(path.join(outputRoot, `gallery/source/${staleRef}.md`), 'stale source'),
          ]);
        }
        const oldTree = await topologyTree(outputRoot);

        await assert.rejects(
          () =>
            buildGallery({
              sourceRoot,
              outputRoot,
              generatedAt: '2026-08-16T00:00:00.000Z',
              transactionHooks: scenario.hooks,
            }),
          scenario.expected,
        );
        assert.deepEqual(await topologyTree(outputRoot), oldTree);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(outputRoot, { recursive: true, force: true }),
          rm(externalRoot, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test('每个可见产物交换前旧目标始终可读，成功后不残留事务文件', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));

  try {
    await makeFixtureSource(sourceRoot);
    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-15T00:00:00.000Z',
    });
    const oldTree = new Map(await fileTree(outputRoot));
    const exchanges = [];

    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-16T00:00:00.000Z',
      transactionHooks: {
        beforeExchange: async ({ relativePath, targetPath }) => {
          const bytes = await readFile(targetPath);
          assert.equal(createHash('sha256').update(bytes).digest('hex'), oldTree.get(relativePath));
          exchanges.push(relativePath);
        },
      },
    });

    assert.deepEqual(exchanges, MANAGED_PATHS);
    const finalPaths = (await fileTree(outputRoot)).map(([relativePath]) => relativePath);
    assert.deepEqual(finalPaths, MANAGED_PATHS);
    assert.equal(
      finalPaths.some((relativePath) =>
        /(?:^|\/)(?:\.image-effects-build-|\.image-effects-.*\.(?:tmp|backup)$)/.test(
          relativePath,
        ),
      ),
      false,
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('中途交换失败后旧输出树的路径与逐文件 SHA 完全不变', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));

  try {
    await makeFixtureSource(sourceRoot);
    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-15T00:00:00.000Z',
    });
    const oldTree = await fileTree(outputRoot);
    let exchanges = 0;

    await assert.rejects(
      () =>
        buildGallery({
          sourceRoot,
          outputRoot,
          generatedAt: '2026-08-16T00:00:00.000Z',
          transactionHooks: {
            beforeExchange: async ({ targetPath }) => {
              await readFile(targetPath);
              exchanges += 1;
              if (exchanges === 3) throw new Error('injected exchange failure');
            },
          },
        }),
      /injected exchange failure/,
    );

    assert.equal(exchanges, 3);
    assert.deepEqual(await fileTree(outputRoot), oldTree);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('写入阶段失败会回滚，不替换已有产物', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));

  try {
    await makeFixtureSource(sourceRoot);
    await Promise.all([
      mkdir(path.join(outputRoot, 'references'), { recursive: true }),
      mkdir(path.join(outputRoot, 'assets/public-repo'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(path.join(outputRoot, 'references/INDEX.md'), 'existing index\n'),
      writeFile(
        path.join(outputRoot, 'assets/public-repo/THIRD_PARTY_NOTICES.md'),
        'existing notice\n',
      ),
      writeFile(path.join(outputRoot, 'gallery'), 'blocks gallery directory'),
    ]);

    await assert.rejects(
      () =>
        buildGallery({
          sourceRoot,
          outputRoot,
          generatedAt: '2026-08-16T00:00:00.000Z',
        }),
      /ENOTDIR|not a directory/i,
    );
    assert.equal(
      await readFile(path.join(outputRoot, 'references/INDEX.md'), 'utf8'),
      'existing index\n',
    );
    assert.equal(
      await readFile(
        path.join(outputRoot, 'assets/public-repo/THIRD_PARTY_NOTICES.md'),
        'utf8',
      ),
      'existing notice\n',
    );
    assert.equal(await readFile(path.join(outputRoot, 'gallery'), 'utf8'), 'blocks gallery directory');
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('INDEX 对 Markdown table 中的反斜杠和 pipe 做稳定转义', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));
  try {
    await makeFixtureSource(sourceRoot);
    const cardPath = path.join(
      sourceRoot,
      'references/effects/healing-anime-scribble-v3.md',
    );
    const card = (await readFile(cardPath, 'utf8')).replace(
      /^summary_en: .*$/m,
      'summary_en: Left | middle \\ right',
    );
    await writeFile(cardPath, card);

    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-16T00:00:00.000Z',
    });
    const index = await readFile(path.join(outputRoot, 'references/INDEX.md'), 'utf8');
    assert.equal(index.includes('Left \\| middle \\\\ right'), true);
    assert.equal(index.includes('Left | middle \\ right'), false);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('同一 ref 仅扩展名大小写变化时保留新预览且 Library URL 可读', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));
  try {
    await makeFixtureSource(sourceRoot);
    const expectedPreview = await readFile(
      path.join(sourceRoot, 'assets/previews/healing-anime-scribble-v3.jpg'),
    );
    await Promise.all([
      mkdir(path.join(outputRoot, 'gallery/api'), { recursive: true }),
      mkdir(path.join(outputRoot, 'gallery/media'), { recursive: true }),
      mkdir(path.join(outputRoot, 'gallery/source'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        path.join(outputRoot, 'gallery/api/library.json'),
        JSON.stringify({
          schemaVersion: 1,
          effects: [
            {
              previewUrl: `./media/${EFFECT_REF}.JPG`,
              sourceUrl: `./source/${EFFECT_REF}.md`,
            },
          ],
        }),
      ),
      writeFile(path.join(outputRoot, `gallery/media/${EFFECT_REF}.JPG`), 'old preview'),
      writeFile(path.join(outputRoot, `gallery/source/${EFFECT_REF}.md`), 'old source'),
    ]);

    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-16T00:00:00.000Z',
    });

    const library = JSON.parse(
      await readFile(path.join(outputRoot, 'gallery/api/library.json'), 'utf8'),
    );
    const previewPath = path.join(
      outputRoot,
      'gallery',
      library.effects[0].previewUrl.replace(/^\.\//, ''),
    );
    assert.deepEqual(await readFile(previewPath), expectedPreview);
    const mediaNames = await readdir(path.join(outputRoot, 'gallery/media'));
    assert.equal(
      mediaNames.filter((name) => name.toLowerCase() === `${EFFECT_REF}.jpg`).length,
      1,
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('预览公开扩展统一小写并删除旧清单中的大写扩展 stale 文件', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const outputRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-output-'));
  const staleRef = 'retired-effect@9.9.9';
  try {
    await makeFixtureSource(sourceRoot);
    const lowerPreview = path.join(
      sourceRoot,
      'assets/previews/healing-anime-scribble-v3.jpg',
    );
    const upperPreview = path.join(sourceRoot, 'assets/previews/preview-upper.JPG');
    await rename(lowerPreview, upperPreview);
    const cardPath = path.join(
      sourceRoot,
      'references/effects/healing-anime-scribble-v3.md',
    );
    const card = (await readFile(cardPath, 'utf8')).replace(
      /^preview: .*$/m,
      'preview: assets/previews/preview-upper.JPG',
    );
    await writeFile(cardPath, card);

    await Promise.all([
      mkdir(path.join(outputRoot, 'gallery/api'), { recursive: true }),
      mkdir(path.join(outputRoot, 'gallery/media'), { recursive: true }),
      mkdir(path.join(outputRoot, 'gallery/source'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        path.join(outputRoot, 'gallery/api/library.json'),
        JSON.stringify({
          schemaVersion: 1,
          effects: [
            {
              previewUrl: `./media/${staleRef}.JPG`,
              sourceUrl: `./source/${staleRef}.md`,
            },
          ],
        }),
      ),
      writeFile(path.join(outputRoot, `gallery/media/${staleRef}.JPG`), 'stale'),
      writeFile(path.join(outputRoot, `gallery/source/${staleRef}.md`), 'stale'),
    ]);

    await buildGallery({
      sourceRoot,
      outputRoot,
      generatedAt: '2026-08-16T00:00:00.000Z',
    });
    const library = JSON.parse(
      await readFile(path.join(outputRoot, 'gallery/api/library.json'), 'utf8'),
    );
    assert.equal(library.effects[0].previewUrl, `./media/${EFFECT_REF}.jpg`);
    await stat(path.join(outputRoot, `gallery/media/${EFFECT_REF}.jpg`));
    const mediaNames = await readdir(path.join(outputRoot, 'gallery/media'));
    assert.equal(mediaNames.includes(`${EFFECT_REF}.jpg`), true);
    assert.equal(mediaNames.includes(`${EFFECT_REF}.JPG`), false);
    await assert.rejects(
      () => stat(path.join(outputRoot, `gallery/media/${staleRef}.JPG`)),
      /ENOENT/,
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(outputRoot, { recursive: true, force: true }),
    ]);
  }
});

test('hardlink 不受支持时使用同盘排他 copy fallback', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'image-effects-copy-fallback-'));
  try {
    const source = path.join(root, 'source.txt');
    const destination = path.join(root, 'destination.txt');
    await writeFile(source, 'fallback bytes\n');
    const { materializeFile } = await import('../scripts/build-gallery.mjs');
    const unsupported = Object.assign(new Error('hardlinks unavailable'), { code: 'ENOTSUP' });

    await materializeFile(source, destination, {
      linkFile: async () => {
        throw unsupported;
      },
    });
    assert.equal(await readFile(destination, 'utf8'), 'fallback bytes\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('离线验证加载卡片并校验预览，完全不调用在线 fetcher', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  let calls = 0;
  try {
    await makeFixtureSource(sourceRoot);
    const effects = await validateEffects({
      sourceRoot,
      fetcher: async () => {
        calls += 1;
        throw new Error('must not run');
      },
    });
    assert.deepEqual(effects.map(({ ref }) => ref), [EFFECT_REF]);
    assert.equal(calls, 0);
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
  }
});

test('在线验证按固定仓库、revision、path 请求并校验 base64 内容 SHA', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  const requests = [];
  try {
    await makeFixtureSource(sourceRoot);
    const effects = await validateEffects({ sourceRoot });
    await validateOnlineSources(effects, {
      fetcher: async (request) => {
        requests.push(request);
        const bytes = request.path === LICENSE_PATH ? LICENSE_BYTES : SOURCE_BYTES;
        return { encoding: 'base64', content: bytes.toString('base64') };
      },
    });
    assert.deepEqual(requests, [
      {
        repository: 'ConardLi/garden-skills',
        revision: REVISION,
        path: SOURCE_PATH,
      },
      {
        repository: 'ConardLi/garden-skills',
        revision: REVISION,
        path: LICENSE_PATH,
      },
    ]);
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
  }
});

test('在线验证对多个效果共享的固定来源只请求一次', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-cache-'));
  const requests = [];
  try {
    await makeFixtureSource(sourceRoot);
    const [effect] = await validateEffects({ sourceRoot });
    const second = { ...effect, id: 'second-effect', ref: 'second-effect@1.0.0' };
    await validateOnlineSources([effect, second], {
      fetcher: async (request) => {
        requests.push(request);
        const bytes = request.path === LICENSE_PATH ? LICENSE_BYTES : SOURCE_BYTES;
        return { encoding: 'base64', content: bytes.toString('base64') };
      },
    });
    assert.deepEqual(requests.map(({ path: sourcePath }) => sourcePath), [SOURCE_PATH, LICENSE_PATH]);
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
  }
});

test('在线验证拒绝内容哈希不匹配，并且错误只标识固定远端来源', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-private-'));
  try {
    await makeFixtureSource(sourceRoot);
    const effects = await validateEffects({ sourceRoot });
    await assert.rejects(
      () =>
        validateOnlineSources(effects, {
          fetcher: async () => ({
            encoding: 'base64',
            content: Buffer.from('changed').toString('base64'),
          }),
        }),
      (error) => {
        assert.match(error.message, /SHA-256 mismatch/i);
        assert.match(error.message, /ConardLi\/garden-skills/);
        assert.match(error.message, new RegExp(REVISION));
        assert.match(error.message, /style-transfer-selfie\.md/);
        assert.doesNotMatch(error.message, new RegExp(sourceRoot));
        return true;
      },
    );
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
  }
});

test('GitHub fetcher 逐段编码路径并通过无 shell 的 gh api 获取 JSON', async () => {
  const invocations = [];
  const payload = { encoding: 'base64', content: SOURCE_BYTES.toString('base64') };
  const result = await fetchGitHubContent(
    {
      repository: 'owner/repo',
      revision: 'abc/def',
      path: 'folder name/file+.md',
    },
    {
      run: async (...args) => {
        invocations.push(args);
        return { stdout: JSON.stringify(payload) };
      },
    },
  );

  assert.deepEqual(result, payload);
  assert.deepEqual(invocations, [
    [
      'gh',
      [
        'api',
        'repos/owner/repo/contents/folder%20name/file%2B.md?ref=abc%2Fdef',
      ],
      { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 30_000 },
    ],
  ]);
});

test('GitHub fetcher 对缺少 gh、认证失败和 404 返回安全诊断并保留 cause', async (t) => {
  const cases = [
    {
      name: 'missing gh',
      cause: Object.assign(new Error('spawn SECRET_LOCAL_MARKER ENOENT'), { code: 'ENOENT' }),
      expected: /GitHub CLI is unavailable/i,
    },
    {
      name: 'authentication',
      cause: Object.assign(new Error('private command failed'), {
        stderr: 'authentication required HTTP 401 SECRET_LOCAL_MARKER',
      }),
      expected: /GitHub authentication failed/i,
    },
    {
      name: 'not found',
      cause: Object.assign(new Error('private command failed'), {
        stderr: 'HTTP 404 Not Found SECRET_LOCAL_MARKER',
      }),
      expected: /pinned GitHub source was not found/i,
    },
  ];

  for (const fixture of cases) {
    await t.test(fixture.name, async () => {
      await assert.rejects(
        () =>
          fetchGitHubContent(
            { repository: 'owner/repo', revision: REVISION, path: SOURCE_PATH },
            { run: async () => { throw fixture.cause; } },
          ),
        (error) => {
          assert.match(error.message, fixture.expected);
          assert.doesNotMatch(error.message, /SECRET_LOCAL_MARKER|spawn/);
          assert.equal(error.cause, fixture.cause);
          return true;
        },
      );
    });
  }
});

test('在线验证包装未知 fetcher 错误时保留 cause 且不泄露原始诊断', async () => {
  const sourceRoot = await mkdtemp(path.join(tmpdir(), 'image-effects-source-'));
  try {
    await makeFixtureSource(sourceRoot);
    const effects = await validateEffects({ sourceRoot });
    const cause = new Error('gh api SECRET_LOCAL_MARKER');
    await assert.rejects(
      () => validateOnlineSources(effects, { fetcher: async () => { throw cause; } }),
      (error) => {
        assert.match(error.message, /Failed to validate pinned GitHub source/i);
        assert.doesNotMatch(error.message, /SECRET_LOCAL_MARKER|gh api/);
        assert.equal(error.cause, cause);
        return true;
      },
    );
  } finally {
    await rm(sourceRoot, { recursive: true, force: true });
  }
});
