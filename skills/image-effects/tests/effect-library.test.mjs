import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildLibrary,
  loadEffects,
  parseEffect,
  renderThirdPartyNotices,
} from '../scripts/effect-library.mjs';
import { EXPECTED_CATALOG_REFS } from './catalog-fixture.mjs';

const SOURCE_SHA = '67021faabdbd9e5d5db6851eb2e5bc6a650a76ef399a4f0949fdae0f93989461';
const PREVIEW_SHA = '0'.repeat(64);
const REVISION = 'aaf9a82f5efd73e87cc0998edc398e75bfc35901';
const EFFECTS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../references/effects',
);
const REQUIRED_FIELDS = {
  id: 'healing-anime-scribble-v3',
  version: '1.0.0',
  title_en: 'Healing anime scribble',
  title_zh: '治愈系动漫涂鸦',
  summary_en: 'Turn a portrait into a gentle hand-drawn scene.',
  summary_zh: '将人像转换为温柔的手绘场景。',
  category: 'portrait',
  execution_kind: 'host-image-generation',
  input_mode: 'image',
  input_min: '1',
  input_max: '1',
  input_formats: 'jpeg,png',
  output_count: '1',
  preview: 'assets/previews/healing-anime-scribble-v3.jpg',
  source_repository: 'ConardLi/garden-skills',
  source_revision: REVISION,
  source_paths: 'skills/gpt-image-2/references/avatars-and-profile/style-transfer-selfie.md',
  source_sha256s: SOURCE_SHA,
  source_license_spdx: 'MIT',
  source_license_url: `https://github.com/ConardLi/garden-skills/blob/${REVISION}/LICENSE`,
  source_license_notice: 'references/licenses/example-mit.txt',
  adaptation_notice: 'Adapted into a versioned image-effect card.',
  preview_origin: 'Generated fictional portrait.',
  preview_author: 'Example author',
  preview_license_spdx: 'CC-BY-4.0',
  preview_sha256: PREVIEW_SHA,
};

function card(overrides = {}, omitted = []) {
  const fields = { ...REQUIRED_FIELDS, ...overrides };
  const lines = Object.entries(fields)
    .filter(([key]) => !omitted.includes(key))
    .map(([key, value]) => `${key}: ${value}`);

  return `---\n${lines.join('\n')}\n---\n\n## 适用场景\n\nFixture body.\n`;
}

function previewMetadata(...effects) {
  return new Map(effects.map((effect) => [effect.ref, { width: 1448, height: 1086 }]));
}

test('parseEffect parses valid simple scalar frontmatter and normalizes sources', () => {
  const effect = parseEffect(card(), 'references/effects/healing-anime-scribble-v3.md');

  assert.equal(effect.ref, 'healing-anime-scribble-v3@1.0.0');
  assert.deepEqual(effect.sources, [
    {
      path: 'skills/gpt-image-2/references/avatars-and-profile/style-transfer-selfie.md',
      sha256: SOURCE_SHA,
    },
  ]);
  assert.equal(effect.input.min, 1);
  assert.deepEqual(effect.input.formats, ['jpeg', 'png']);
  assert.equal(effect.outputCount, 1);
  assert.equal(effect.sourceLicenseNotice, 'references/licenses/example-mit.txt');
  assert.equal(effect.body, '## 适用场景\n\nFixture body.');
});

test('parseEffect rejects duplicate keys', () => {
  const markdown = card().replace('version: 1.0.0', 'version: 1.0.0\nversion: 1.0.1');
  assert.throws(() => parseEffect(markdown), /duplicate/i);
});

test('parseEffect rejects unknown, missing, and empty fields', async (t) => {
  await t.test('unknown field', () => {
    const markdown = card().replace('version: 1.0.0', 'version: 1.0.0\nunsupported: value');
    assert.throws(() => parseEffect(markdown), /unknown/i);
  });

  await t.test('missing field', () => {
    assert.throws(() => parseEffect(card({}, ['summary_zh'])), /missing.*summary_zh/i);
  });

  await t.test('missing source license notice', () => {
    assert.throws(
      () => parseEffect(card({}, ['source_license_notice'])),
      /missing.*source_license_notice/i,
    );
  });

  await t.test('empty key', () => {
    const markdown = card().replace('version: 1.0.0', 'version: 1.0.0\n: value');
    assert.throws(() => parseEffect(markdown), /empty key/i);
  });

  await t.test('empty value', () => {
    assert.throws(() => parseEffect(card({ title_en: '' })), /empty.*title_en/i);
  });

  await t.test('multiline YAML', () => {
    const markdown = card().replace(
      'summary_en: Turn a portrait into a gentle hand-drawn scene.',
      'summary_en: |\n  Turn a portrait into a gentle hand-drawn scene.',
    );
    assert.throws(() => parseEffect(markdown), /simple single-line scalar/i);
  });
});

test('parseEffect rejects YAML values outside strict simple scalars', async (t) => {
  const invalidValues = [
    ['double-quoted empty string', '""'],
    ['single-quoted empty string', "''"],
    ['null keyword', 'null'],
    ['null shorthand', '~'],
    ['flow sequence', '[]'],
    ['flow mapping', '{}'],
    ['literal block', '|'],
    ['folded block', '>'],
    ['explicit tag', '!!map {foo: bar}'],
    ['anchor', '&shared value'],
    ['alias', '*shared'],
    ['quoted scalar', '"Portrait"'],
    ['sequence entry', '- item'],
    ['explicit key', '? key'],
    ['mapping value', ': value'],
    ['reserved at sign', '@reserved'],
    ['reserved backtick', '`reserved`'],
    ['mapping pair', 'foo: bar'],
  ];

  for (const [name, value] of invalidValues) {
    await t.test(name, () => {
      assert.throws(
        () => parseEffect(card({ title_en: value })),
        /simple single-line scalar|empty/i,
      );
    });
  }
});

test('parseEffect rejects unsupported YAML comment syntax', async (t) => {
  const invalidValues = [
    ['comment-only value', '# comment'],
    ['quoted empty value with comment', '"" # comment'],
    ['null value with comment', 'null # comment'],
  ];

  for (const [name, value] of invalidValues) {
    await t.test(name, () => {
      assert.throws(() => parseEffect(card({ title_en: value })), /simple single-line scalar/i);
    });
  }
});

test('parseEffect does not treat null-like plain text as YAML null', () => {
  assert.equal(parseEffect(card({ title_en: 'Nullable portrait' })).title.en, 'Nullable portrait');
  assert.equal(parseEffect(card({ title_en: '~decorative title' })).title.en, '~decorative title');
  assert.equal(parseEffect(card({ title_en: 'C# portrait' })).title.en, 'C# portrait');
  assert.equal(parseEffect(card({ title_en: 'hash#tag portrait' })).title.en, 'hash#tag portrait');
});

test('parseEffect preserves supported plain scalar punctuation and Unicode', () => {
  const values = ['https://example.com/effect', 'C# portrait', 'hash#tag', '治愈，v3。'];

  for (const value of values) {
    assert.equal(parseEffect(card({ title_en: value })).title.en, value);
  }
});

test('parseEffect rejects absolute paths and traversal segments', async (t) => {
  await t.test('absolute preview path', () => {
    assert.throws(() => parseEffect(card({ preview: '/tmp/preview.jpg' })), /relative path/i);
  });

  await t.test('preview traversal', () => {
    assert.throws(() => parseEffect(card({ preview: 'assets/../private.jpg' })), /\.\./i);
  });

  await t.test('source traversal', () => {
    assert.throws(() => parseEffect(card({ source_paths: '../source.md' })), /\.\./i);
  });
});

test('parseEffect rejects non-canonical or unsafe provenance fields', async (t) => {
  const invalidRepositories = [
    'https://github.com/owner/repo',
    'owner/repo/extra',
    '-owner/repo',
    'owner_/repo',
    'owner/repo](https://evil.example)',
  ];
  for (const source_repository of invalidRepositories) {
    await t.test(`repository ${source_repository}`, () => {
      assert.throws(() => parseEffect(card({ source_repository })), /source_repository/i);
    });
  }

  const invalidPaths = [
    'assets//preview.jpg',
    'assets/./preview.jpg',
    'assets/%2e%2e/preview.jpg',
    'assets\\preview.jpg',
    'assets/pre`view.jpg',
  ];
  for (const preview of invalidPaths) {
    await t.test(`path ${preview}`, () => {
      assert.throws(() => parseEffect(card({ preview })), /relative path|canonical path/i);
    });
  }

  await t.test('encoded source path traversal', () => {
    assert.throws(
      () => parseEffect(card({ source_paths: 'upstream/%2e%2e/secret.md' })),
      /relative path|canonical path/i,
    );
  });

  const urlUnsafeSourcePaths = [
    'src/a%2Fb.md',
    'src/file#fragment.md',
    'src/file?ref=main',
    'src/%ZZ.md',
  ];
  for (const source_paths of urlUnsafeSourcePaths) {
    await t.test(`URL-unsafe source path ${source_paths}`, () => {
      assert.throws(
        () => parseEffect(card({ source_paths })),
        /relative path|canonical path/i,
      );
    });
  }

  await t.test('URL-unsafe preview path', () => {
    assert.throws(
      () => parseEffect(card({ preview: 'assets/file?ref=main.jpg' })),
      /relative path|canonical path/i,
    );
  });

  await t.test('NUL in scalar', () => {
    assert.throws(
      () => parseEffect(card({ adaptation_notice: 'safe\0unsafe' })),
      /control character/i,
    );
  });

  await t.test('trailing Tab in scalar', () => {
    assert.throws(
      () => parseEffect(card({ adaptation_notice: 'unsafe\t' })),
      /control character/i,
    );
  });

  const invalidUrls = [
    'https://user:password@example.com/license',
    'https://@example.com/license',
    'https://example.com/license#fragment',
    'https://example.com/license#',
    'https://example.com/%0Alicense',
    'https://example.com/%250Alicense',
  ];
  for (const source_license_url of invalidUrls) {
    await t.test(`URL ${source_license_url}`, () => {
      assert.throws(() => parseEffect(card({ source_license_url })), /HTTPS URL/i);
    });
  }
});

test('parseEffect rejects invalid identifiers, versions, and hashes', async (t) => {
  await t.test('id', () => {
    assert.throws(() => parseEffect(card({ id: 'Healing_Effect' })), /invalid id/i);
  });

  await t.test('SemVer', () => {
    assert.throws(() => parseEffect(card({ version: 'v1.0' })), /SemVer/i);
  });

  await t.test('source revision', () => {
    assert.throws(() => parseEffect(card({ source_revision: 'abc123' })), /source_revision/i);
  });

  await t.test('source SHA-256', () => {
    assert.throws(() => parseEffect(card({ source_sha256s: 'not-a-sha' })), /source_sha256s/i);
  });

  await t.test('preview SHA-256', () => {
    assert.throws(() => parseEffect(card({ preview_sha256: 'not-a-sha' })), /preview_sha256/i);
  });
});

test('parseEffect rejects invalid source mappings', async (t) => {
  await t.test('mismatched paths and hashes', () => {
    assert.throws(
      () => parseEffect(card({ source_paths: 'one.md,two.md' })),
      /same length/i,
    );
  });

  await t.test('duplicate source path', () => {
    assert.throws(
      () =>
        parseEffect(
          card({
            source_paths: 'same.md,same.md',
            source_sha256s: `${SOURCE_SHA},${'1'.repeat(64)}`,
          }),
        ),
      /duplicate source path/i,
    );
  });

  await t.test('empty CSV item', () => {
    assert.throws(
      () => parseEffect(card({ source_paths: 'one.md,,two.md' })),
      /empty.*source_paths/i,
    );
  });
});

test('parseEffect accepts the approved category, execution, and input combinations', async (t) => {
  const accepted = [
    {
      category: 'portrait',
      execution_kind: 'host-image-generation',
      input_mode: 'image',
      input_min: '1',
      input_max: '1',
    },
    {
      category: 'editorial',
      execution_kind: 'host-image-generation',
      input_mode: 'image',
      input_min: '1',
      input_max: '1',
    },
    {
      category: 'zine',
      execution_kind: 'host-image-generation',
      input_mode: 'image',
      input_min: '1',
      input_max: '1',
    },
    {
      category: 'editorial',
      execution_kind: 'host-image-generation-and-layout',
      input_mode: 'image',
      input_min: '1',
      input_max: '1',
    },
    {
      category: 'zine',
      execution_kind: 'host-image-generation',
      input_mode: 'text-or-image',
      input_min: '0',
      input_max: '1',
    },
  ];

  for (const combination of accepted) {
    await t.test(JSON.stringify(combination), () => {
      const effect = parseEffect(card(combination));
      assert.equal(effect.category, combination.category);
      assert.equal(effect.executionKind, combination.execution_kind);
      assert.deepEqual(
        { mode: effect.input.mode, min: effect.input.min, max: effect.input.max },
        {
          mode: combination.input_mode,
          min: Number(combination.input_min),
          max: Number(combination.input_max),
        },
      );
    });
  }
});

test('parseEffect rejects invalid category, execution, input, output, and license contracts', async (t) => {
  const invalidCases = [
    ['category', 'grade', /category/i],
    ['execution_kind', 'local-script', /execution_kind/i],
    ['input_mode', 'image-required', /input_mode/i],
    ['input_mode', 'text', /input_mode/i],
    ['non-canonical input_min', { input_min: '01' }, /input_min/i],
    ['fractional input_min', { input_min: '1.0' }, /input_min/i],
    [
      'image 0..1',
      { input_mode: 'image', input_min: '0', input_max: '1' },
      /input_min|input contract/i,
    ],
    [
      'text-or-image 1..1',
      { input_mode: 'text-or-image', input_min: '1', input_max: '1' },
      /input_min|input contract/i,
    ],
    [
      'layout outside editorial',
      { category: 'zine', execution_kind: 'host-image-generation-and-layout' },
      /execution_kind|editorial/i,
    ],
    [
      'layout outside image',
      {
        execution_kind: 'host-image-generation-and-layout',
        input_mode: 'text-or-image',
        input_min: '0',
      },
      /execution_kind|input_mode|image/i,
    ],
    ['input_formats', 'png,jpeg', /input_formats/i],
    ['output_count', '2', /output_count/i],
    ['source_license_spdx', 'Apache-2.0', /source_license_spdx/i],
    ['preview_license_spdx', 'MIT', /preview_license_spdx/i],
    ['source_license_notice', 'licenses/example-mit.txt', /source_license_notice/i],
    [
      'source_license_notice traversal',
      { source_license_notice: 'references/licenses/../private.txt' },
      /source_license_notice|\.\./i,
    ],
  ];

  for (const [name, value, pattern] of invalidCases) {
    await t.test(name, () => {
      const overrides = typeof value === 'object' ? value : { [name]: value };
      assert.throws(() => parseEffect(card(overrides)), pattern);
    });
  }
});

test('loadEffects reads Markdown cards and returns stable ID and SemVer order', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'image-effects-'));

  try {
    await Promise.all([
      writeFile(path.join(root, 'z.md'), card({ id: 'z-effect', version: '1.0.0' })),
      writeFile(path.join(root, 'a-new.md'), card({ id: 'a-effect', version: '1.10.0' })),
      writeFile(path.join(root, 'a-old.md'), card({ id: 'a-effect', version: '1.2.0' })),
      writeFile(path.join(root, 'ignored.txt'), 'not an effect card'),
    ]);

    const effects = await loadEffects(root);
    assert.deepEqual(
      effects.map((effect) => effect.ref),
      ['a-effect@1.2.0', 'a-effect@1.10.0', 'z-effect@1.0.0'],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('published effect directory loads the exact approved semantic catalog', async () => {
  const effects = await loadEffects(EFFECTS_PATH);

  assert.deepEqual(
    effects.map((effect) => effect.ref),
    EXPECTED_CATALOG_REFS,
  );
});

test('loadEffects, buildLibrary, and notices reject duplicate versioned references', async () => {
  const effect = parseEffect(card());
  assert.throws(
    () => buildLibrary(
      [effect, effect],
      '2026-08-16T00:00:00.000Z',
      previewMetadata(effect),
    ),
    /duplicate.*ref/i,
  );
  assert.throws(
    () => renderThirdPartyNotices([effect, effect], '# Header\n', new Map()),
    /duplicate.*ref/i,
  );

  const root = await mkdtemp(path.join(tmpdir(), 'image-effects-duplicates-'));
  try {
    await writeFile(path.join(root, 'one.md'), card());
    await writeFile(path.join(root, 'two.md'), card());
    await assert.rejects(() => loadEffects(root), /duplicate.*ref/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('effect IDs use ASCII code-unit order without locale comparison', () => {
  const later = parseEffect(card({ id: 'z-effect' }));
  const earlier = parseEffect(card({ id: 'a-effect' }));
  const originalLocaleCompare = String.prototype.localeCompare;
  let ids;

  String.prototype.localeCompare = () => {
    throw new Error('localeCompare must not be used');
  };
  try {
    ids = buildLibrary(
      [later, earlier],
      '2026-08-16T00:00:00.000Z',
      previewMetadata(later, earlier),
    ).effects.map((effect) => effect.id);
  } finally {
    String.prototype.localeCompare = originalLocaleCompare;
  }

  assert.deepEqual(ids, ['a-effect', 'z-effect']);
});

test('SemVer sorting preserves numeric precedence beyond Number safe integers', () => {
  const larger = parseEffect(card({ version: '9007199254740993.0.0' }));
  const smaller = parseEffect(card({ version: '9007199254740992.0.0' }));

  const library = buildLibrary(
    [larger, smaller],
    '2026-08-16T00:00:00.000Z',
    previewMetadata(larger, smaller),
  );

  assert.deepEqual(
    library.effects.map((effect) => effect.version),
    ['9007199254740992.0.0', '9007199254740993.0.0'],
  );
});

test('SemVer prerelease text identifiers use ASCII code-unit order', () => {
  const lowercase = parseEffect(card({ version: '1.0.0-a' }));
  const uppercase = parseEffect(card({ version: '1.0.0-B' }));

  const library = buildLibrary(
    [lowercase, uppercase],
    '2026-08-16T00:00:00.000Z',
    previewMetadata(lowercase, uppercase),
  );

  assert.deepEqual(
    library.effects.map((effect) => effect.version),
    ['1.0.0-B', '1.0.0-a'],
  );
});

test('buildLibrary projects the public schema with versioned invocations', () => {
  const effect = parseEffect(card(), 'references/effects/healing-anime-scribble-v3.md');
  const generatedAt = '2026-08-16T00:00:00.000Z';
  const previewMetadataByRef = new Map([
    ['healing-anime-scribble-v3@1.0.0', { width: 1448, height: 1086 }],
  ]);

  assert.deepEqual(buildLibrary([effect], generatedAt, previewMetadataByRef), {
    schemaVersion: 2,
    generatedAt,
    effects: [
      {
        ref: 'healing-anime-scribble-v3@1.0.0',
        id: 'healing-anime-scribble-v3',
        version: '1.0.0',
        title: { en: 'Healing anime scribble', zh: '治愈系动漫涂鸦' },
        summary: {
          en: 'Turn a portrait into a gentle hand-drawn scene.',
          zh: '将人像转换为温柔的手绘场景。',
        },
        category: 'portrait',
        executionKind: 'host-image-generation',
        previewWidth: 1448,
        previewHeight: 1086,
        input: { mode: 'image', min: 1, max: 1, formats: ['jpeg', 'png'] },
        outputCount: 1,
        previewUrl: './media/healing-anime-scribble-v3@1.0.0.jpg',
        sourceUrl: './source/healing-anime-scribble-v3@1.0.0.md',
        provenance: {
          repository: 'ConardLi/garden-skills',
          revision: REVISION,
          license: {
            spdx: 'MIT',
            url: `https://github.com/ConardLi/garden-skills/blob/${REVISION}/LICENSE`,
          },
          preview: {
            origin: 'Generated fictional portrait.',
            author: 'Example author',
            licenseSpdx: 'CC-BY-4.0',
          },
        },
        invocation:
          'Use $image-effects effect healing-anime-scribble-v3@1.0.0 on my uploaded image.',
      },
    ],
  });
});

test('buildLibrary selects the text-or-image invocation for Minimal Zine', () => {
  const effect = parseEffect(card({
    id: 'minimal-zine-poster',
    category: 'zine',
    input_mode: 'text-or-image',
    input_min: '0',
  }));
  const library = buildLibrary(
    [effect],
    '2026-08-16T00:00:00.000Z',
    previewMetadata(effect),
  );

  assert.equal(
    library.effects[0].invocation,
    'Use $image-effects effect minimal-zine-poster@1.0.0 with this idea or my uploaded image.',
  );
});

test('buildLibrary does not mutate effects or preview metadata', () => {
  const effect = parseEffect(card());
  const effects = [effect];
  const metadata = previewMetadata(effect);
  const effectSnapshot = structuredClone(effect);
  const metadataSnapshot = structuredClone([...metadata]);

  buildLibrary(effects, '2026-08-16T00:00:00.000Z', metadata);

  assert.deepEqual(effect, effectSnapshot);
  assert.deepEqual([...metadata], metadataSnapshot);
});

test('buildLibrary rejects missing or invalid preview dimensions', async (t) => {
  const effect = parseEffect(card());
  const invalidMetadata = [
    ['missing', new Map()],
    ['zero width', new Map([[effect.ref, { width: 0, height: 1086 }]])],
    ['negative height', new Map([[effect.ref, { width: 1448, height: -1 }]])],
    ['fractional width', new Map([[effect.ref, { width: 1448.5, height: 1086 }]])],
    ['oversized height', new Map([[effect.ref, { width: 1448, height: 20001 }]])],
  ];

  for (const [name, metadata] of invalidMetadata) {
    await t.test(name, () => {
      assert.throws(
        () => buildLibrary([effect], '2026-08-16T00:00:00.000Z', metadata),
        /preview.*(?:metadata|width|height|dimension)/i,
      );
    });
  }
});

test('buildLibrary gives every effect version distinct versioned artifact URLs', () => {
  const first = parseEffect(card({ version: '1.0.0' }));
  const second = parseEffect(card({ version: '2.0.0' }));

  const library = buildLibrary(
    [second, first],
    '2026-08-16T00:00:00.000Z',
    previewMetadata(second, first),
  );

  assert.deepEqual(
    library.effects.map(({ previewUrl, sourceUrl }) => ({ previewUrl, sourceUrl })),
    [
      {
        previewUrl: './media/healing-anime-scribble-v3@1.0.0.jpg',
        sourceUrl: './source/healing-anime-scribble-v3@1.0.0.md',
      },
      {
        previewUrl: './media/healing-anime-scribble-v3@2.0.0.jpg',
        sourceUrl: './source/healing-anime-scribble-v3@2.0.0.md',
      },
    ],
  );
});

test('renderThirdPartyNotices emits the exact escaped machine protocol', () => {
  const notice = 'MIT License\n\nCopyright (c) Fixture\n';
  const effect = parseEffect(
    card({
      source_paths: 'upstream/source_file.md,LICENSE',
      source_sha256s: `${SOURCE_SHA},6bfd25bd70599c4f37233ce24ad27099e2e5da6b363231bb3ac4ff6b134bf870`,
      source_license_notice: 'references/licenses/example-mit.txt',
      adaptation_notice: 'Adapted [guide](https://evil.example).',
    }),
    'references/effects/healing-anime-scribble-v3.md',
  );

  assert.equal(
    renderThirdPartyNotices(
      [effect],
      '# Third-party notices\n',
      new Map([['references/licenses/example-mit.txt', notice]]),
    ),
    `# Third-party notices

## healing-anime-scribble-v3@1.0.0

- Repository: \`ConardLi/garden-skills\`
- Revision: \`${REVISION}\`
- Source: \`upstream/source_file.md\` (SHA-256: \`${SOURCE_SHA}\`)
- Source: \`LICENSE\` (SHA-256: \`6bfd25bd70599c4f37233ce24ad27099e2e5da6b363231bb3ac4ff6b134bf870\`)
- License: [MIT](<https://github.com/ConardLi/garden-skills/blob/${REVISION}/LICENSE>)
- Notice: \`references/licenses/example-mit.txt\` (SHA-256: \`6bfd25bd70599c4f37233ce24ad27099e2e5da6b363231bb3ac4ff6b134bf870\`)
- Adaptation: Adapted \\[guide\\]\\(https://evil.example\\).

## Full license notices

### \`references/licenses/example-mit.txt\`

MIT License

Copyright (c) Fixture
`,
  );
});

test('renderThirdPartyNotices requires every mapped notice to match the pinned LICENSE bytes', async (t) => {
  const effect = parseEffect(card({
    source_paths: 'upstream/source_file.md,LICENSE',
    source_sha256s: `${SOURCE_SHA},6bfd25bd70599c4f37233ce24ad27099e2e5da6b363231bb3ac4ff6b134bf870`,
    source_license_notice: 'references/licenses/example-mit.txt',
  }));

  await t.test('missing local notice', () => {
    assert.throws(
      () => renderThirdPartyNotices([effect], '# Header\n', new Map()),
      /missing.*notice|notice.*required/i,
    );
  });
  await t.test('local notice SHA differs from pinned LICENSE', () => {
    assert.throws(
      () => renderThirdPartyNotices(
        [effect],
        '# Header\n',
        new Map([['references/licenses/example-mit.txt', 'changed notice\n']]),
      ),
      /notice.*sha-256.*mismatch/i,
    );
  });
});
