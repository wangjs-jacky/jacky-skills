import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { translations } from '../gallery/translations.js';
import { effectTitleId, readLocationFilters, syncLocationFilters } from '../gallery/gallery-runtime.mjs';
import { publicTemplatePath } from '../scripts/public-layout.mjs';
import { HAPPY_SOURCE_REVISION, MIGRATED_EFFECT_IDS } from './catalog-fixture.mjs';

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GALLERY_ROOT = path.join(SKILL_ROOT, 'gallery');
const EXPECTED_PROVENANCE = {
  'healing-anime-scribble-v3@1.0.0': {
    repository: 'ConardLi/garden-skills',
    revision: 'aaf9a82f5efd73e87cc0998edc398e75bfc35901',
    origin: 'Text-only image generation of a fictional young adult with glasses, not based on a real person.',
  },
  'minimal-zine-poster@1.0.0': {
    repository: 'LiamGvchi/gc-minimal-zine-poster',
    revision: '4cb0396ad4e834019f753b37e1c4f415f5e02026',
    origin: 'Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.',
  },
  'photo-illustration-diptych@1.0.0': {
    repository: 'wangjs-jacky/happy',
    revision: '532e49bb711283cbe2738439039298f9cea1ef7b',
    origin: 'Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.',
  },
  'photo-illustration-diptych-lakeside@1.0.0': {
    repository: 'wangjs-jacky/happy',
    revision: 'fa6c30497d01b077d7d4d58e1a4c00bca4c38fcd',
    origin: 'Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.',
  },
  'photo-illustration-editorial-echo@1.0.0': {
    repository: 'wangjs-jacky/happy',
    revision: 'e8716a0a0c949f8e2b45e1e3d7c8d36ad7bba17c',
    origin: 'Locally composed from two text-only generated fictional assets; not based on a real person, place, brand, or third-party image.',
  },
  'scene-distillation-zine@1.0.0': {
    repository: 'Zeejay0/gathered-scenes-zine-skill',
    revision: 'e764b7fd243d7cc501723b9d325279bf6dd852c2',
    origin: 'Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.',
  },
  'scenes-gathered-zine@1.0.0': {
    repository: 'Zeejay0/gathered-scenes-zine-skill',
    revision: 'e764b7fd243d7cc501723b9d325279bf6dd852c2',
    origin: 'Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.',
  },
  'scenes-gathered-zine-sea@1.0.0': {
    repository: 'Zeejay0/gathered-scenes-zine-skill',
    revision: 'e764b7fd243d7cc501723b9d325279bf6dd852c2',
    origin: 'Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.',
  },
};

function contentType(filePath) {
  return {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
  }[path.extname(filePath)] ?? 'application/octet-stream';
}

async function startStaticServer(root) {
  const canonicalRoot = await realpath(root);
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '') || 'index.html';
      const filePath = path.resolve(root, relativePath);
      if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const canonicalPath = await realpath(filePath);
      if (
        canonicalPath !== canonicalRoot
        && !canonicalPath.startsWith(`${canonicalRoot}${path.sep}`)
      ) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      if (!(await stat(canonicalPath)).isFile()) throw new Error('Not a file');
      const body = await readFile(canonicalPath);
      response.writeHead(200, { 'content-type': contentType(filePath) }).end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return {
    baseUrl: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

async function expectOk(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response;
}

function localReferences(text, extension) {
  const pattern = extension === '.html'
    ? /(?:src|href)=["']([^"']+)["']/g
    : /\bfrom\s+["']([^"']+)["']/g;
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

async function crawlLocalAssets(baseUrl) {
  const origin = new URL(baseUrl).origin;
  const pending = [new URL(baseUrl)];
  const visited = new Map();
  while (pending.length) {
    const assetUrl = pending.shift();
    if (visited.has(assetUrl.pathname)) continue;
    const response = await expectOk(assetUrl);
    const extension = assetUrl.pathname === '/' ? '.html' : path.extname(assetUrl.pathname);
    assert.equal(
      (response.headers.get('content-type') ?? '').split(';')[0],
      contentType(`asset${extension}`).split(';')[0],
    );
    const body = await response.text();
    visited.set(assetUrl.pathname, body);
    if (!['.html', '.js', '.mjs'].includes(extension)) continue;
    for (const reference of localReferences(body, extension)) {
      const nextUrl = new URL(reference, assetUrl);
      if (nextUrl.origin === origin && !visited.has(nextUrl.pathname)) pending.push(nextUrl);
    }
  }
  return visited;
}

test('静态站点通过真实 HTTP 提供页面、Library 及其全部相对资源', async (t) => {
  const staticServer = await startStaticServer(GALLERY_ROOT);
  t.after(() => staticServer.close());

  const localAssets = await crawlLocalAssets(staticServer.baseUrl);
  assert.deepEqual([...localAssets.keys()].sort(), [
    '/',
    '/app.js',
    '/gallery-model.mjs',
    '/gallery-runtime.mjs',
    '/styles.css',
    '/translations.js',
  ]);

  const libraryUrl = new URL('api/library.json', staticServer.baseUrl);
  const libraryResponse = await expectOk(libraryUrl);
  assert.match(libraryResponse.headers.get('content-type') ?? '', /^application\/json/);
  const library = await libraryResponse.json();
  assert.ok(Array.isArray(library.effects));
  assert.ok(library.effects.length > 0);

  for (const effect of library.effects) {
    for (const field of ['previewUrl', 'sourceUrl']) {
      assert.match(effect[field], /^\.\//, `${field} must remain gallery-relative`);
      const assetUrl = new URL(effect[field], staticServer.baseUrl);
      assert.equal(assetUrl.origin, new URL(staticServer.baseUrl).origin);
      const assetResponse = await expectOk(assetUrl);
      assert.equal(
        (assetResponse.headers.get('content-type') ?? '').split(';')[0],
        contentType(assetUrl.pathname).split(';')[0],
      );
    }
  }
});

test('Library 固定公开来源、源码许可和预览署名契约', async (t) => {
  const staticServer = await startStaticServer(GALLERY_ROOT);
  t.after(() => staticServer.close());

  const library = await (await expectOk(new URL('api/library.json', staticServer.baseUrl))).json();
  for (const effect of library.effects) {
    const expected = EXPECTED_PROVENANCE[effect.ref];
    if (expected) {
      assert.deepEqual(effect.provenance, {
        repository: expected.repository,
        revision: expected.revision,
        license: {
          spdx: 'MIT',
          url: `https://github.com/${expected.repository}/blob/${expected.revision}/LICENSE`,
        },
        preview: {
          origin: expected.origin,
          author: 'wangjs-jacky',
          licenseSpdx: 'CC-BY-4.0',
        },
      });
      continue;
    }

    assert.ok(MIGRATED_EFFECT_IDS.includes(effect.id), `unexpected effect ref: ${effect.ref}`);
    assert.equal(effect.provenance.repository, 'wangjs-jacky/happy');
    assert.equal(effect.provenance.revision, HAPPY_SOURCE_REVISION);
    assert.deepEqual(effect.provenance.license, {
      spdx: 'MIT',
      url: `https://github.com/wangjs-jacky/happy/blob/${HAPPY_SOURCE_REVISION}/LICENSE`,
    });
    assert.match(effect.provenance.preview.origin, /text-only|fictional/i);
    assert.doesNotMatch(effect.provenance.preview.origin, /dog|tiramisu|狗狗|提拉米苏/i);
    assert.equal(effect.provenance.preview.author, 'wangjs-jacky');
    assert.equal(effect.provenance.preview.licenseSpdx, 'CC-BY-4.0');
  }
});

test('English public README documents the complete standalone catalog contract', async () => {
  const readme = await readFile(publicTemplatePath(SKILL_ROOT, 'README.md'), 'utf8');

  assert.match(readme, /growing semantic library/i);
  assert.match(readme, /Use \$image-effects effect healing-anime-scribble-v3@1\.0\.0 on my uploaded image\./);
  assert.match(readme, /Use \$image-effects effect minimal-zine-poster@1\.0\.0 with this idea or my uploaded image\./);
  assert.match(readme, /Editorial Echo[\s\S]*Stage A[\s\S]*Stage B[\s\S]*fallback/i);
  assert.match(readme, /no extra Skill dependenc/i);
  assert.match(readme, /does not include `grade-images`/i);
  assert.match(readme, /\[Gallery\]\(https:\/\/wangjs-jacky\.github\.io\/image-effects\/\)/);
  assert.match(readme, /\[THIRD_PARTY_NOTICES\.md\]\(\.\/THIRD_PARTY_NOTICES\.md\)/);
});

test('Chinese public README documents the complete standalone catalog contract', async () => {
  const readme = await readFile(publicTemplatePath(SKILL_ROOT, 'README_CN.md'), 'utf8');

  assert.match(readme, /按视觉语义组织/);
  assert.match(readme, /Use \$image-effects effect healing-anime-scribble-v3@1\.0\.0 on my uploaded image\./);
  assert.match(readme, /Use \$image-effects effect minimal-zine-poster@1\.0\.0 with this idea or my uploaded image\./);
  assert.match(readme, /Editorial Echo[\s\S]*Stage A[\s\S]*Stage B[\s\S]*降级/);
  assert.match(readme, /不需要额外安装任何 Skill 依赖/);
  assert.match(readme, /不包含 `grade-images`/);
  assert.match(readme, /\[Gallery\]\(https:\/\/wangjs-jacky\.github\.io\/image-effects\/\)/);
  assert.match(readme, /\[THIRD_PARTY_NOTICES\.md\]\(\.\/THIRD_PARTY_NOTICES\.md\)/);
});

test('Library 的每个分类都有中英文展示标签', async () => {
  const library = JSON.parse(
    await readFile(path.join(GALLERY_ROOT, 'api/library.json'), 'utf8'),
  );
  const categories = new Set(library.effects.map((effect) => effect.category));

  for (const category of categories) {
    assert.equal(typeof translations.en.categories[category], 'string');
    assert.equal(typeof translations.zh.categories[category], 'string');
    assert.notEqual(translations.en.categories[category], translations.zh.categories[category]);
  }

  assert.deepEqual(translations.en.categories, {
    'assets-and-props': 'Assets & Props',
    'avatars-and-profile': 'Avatars & Profile',
    'branding-and-packaging': 'Branding & Packaging',
    'editing-workflows': 'Editing Workflows',
    portrait: 'Portrait',
    editorial: 'Editorial',
    'grids-and-collages': 'Grids & Collages',
    infographics: 'Infographics',
    maps: 'Maps',
    'portraits-and-characters': 'Portraits & Characters',
    'poster-and-campaigns': 'Posters & Campaigns',
    'product-visuals': 'Product Visuals',
    'scenes-and-illustrations': 'Scenes & Illustrations',
    'storyboards-and-sequences': 'Storyboards & Sequences',
    zine: 'Zine',
  });
  assert.deepEqual(translations.zh.categories, {
    'assets-and-props': '素材资产',
    'avatars-and-profile': '头像人设',
    'branding-and-packaging': '品牌包装',
    'editing-workflows': '图像编辑',
    portrait: '人物',
    editorial: '编辑设计',
    'grids-and-collages': '网格拼贴',
    infographics: '信息图',
    maps: '地图',
    'portraits-and-characters': '人物视觉',
    'poster-and-campaigns': '海报营销',
    'product-visuals': '产品视觉',
    'scenes-and-illustrations': '氛围插画',
    'storyboards-and-sequences': '叙事序列',
    zine: '纸本杂志',
  });
});

test('Gallery 使用 Library 图片尺寸和 text-or-image 专用文案', async () => {
  const appSource = await readFile(path.join(GALLERY_ROOT, 'app.js'), 'utf8');

  assert.match(appSource, /width:\s*effect\.previewWidth/);
  assert.match(appSource, /height:\s*effect\.previewHeight/);
  assert.match(appSource, /t\.textOrImageInput/);
  assert.doesNotMatch(appSource, /width:\s*['"]1448['"]/);
  assert.doesNotMatch(appSource, /height:\s*['"]1086['"]/);
  assert.equal(translations.en.textOrImageInput, 'Text or up to {max} image · {formats}');
  assert.equal(translations.zh.textOrImageInput, '文字或最多 {max} 张图片 · {formats}');
});

test('运行时筛选参数可往返 URL，版本引用生成安全且唯一的标题 ID', () => {
  assert.deepEqual(readLocationFilters('?q=grain%20portrait&category=portrait'), {
    query: 'grain portrait',
    category: 'portrait',
  });
  const windowObject = {
    location: { href: 'https://example.test/gallery/?keep=yes' },
    history: {
      state: { marker: true },
      replaceState(state, unused, url) {
        this.result = { state, unused, url: String(url) };
      },
    },
  };
  syncLocationFilters({ query: 'mono', category: 'portrait' }, windowObject);
  assert.equal(
    windowObject.history.result.url,
    'https://example.test/gallery/?keep=yes&q=mono&category=portrait',
  );

  const ids = ['effect@1.0.0+one', 'effect@1.0.0-one'].map(effectTitleId);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[A-Za-z][A-Za-z0-9_-]*$/);
});

test('静态服务器拒绝通过 symlink 读取站点外文件并提供图片 MIME', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'image-effects-gallery-root-'));
  const outside = await mkdtemp(path.join(tmpdir(), 'image-effects-gallery-outside-'));
  t.after(() => Promise.all([
    rm(root, { recursive: true, force: true }),
    rm(outside, { recursive: true, force: true }),
  ]));

  await Promise.all([
    writeFile(path.join(root, 'preview.png'), 'png'),
    writeFile(path.join(root, 'preview.jpeg'), 'jpeg'),
    writeFile(path.join(outside, 'secret.txt'), 'outside'),
  ]);
  await symlink(path.join(outside, 'secret.txt'), path.join(root, 'escaped.txt'));
  const staticServer = await startStaticServer(root);
  t.after(() => staticServer.close());

  assert.match((await expectOk(new URL('preview.png', staticServer.baseUrl))).headers.get('content-type') ?? '', /^image\/png$/);
  assert.match((await expectOk(new URL('preview.jpeg', staticServer.baseUrl))).headers.get('content-type') ?? '', /^image\/jpeg$/);
  assert.equal((await fetch(new URL('escaped.txt', staticServer.baseUrl))).status, 403);
});
