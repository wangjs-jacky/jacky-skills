import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const REQUIRED_FIELDS = [
  'id',
  'version',
  'title_en',
  'title_zh',
  'summary_en',
  'summary_zh',
  'category',
  'execution_kind',
  'input_mode',
  'input_min',
  'input_max',
  'input_formats',
  'output_count',
  'preview',
  'source_repository',
  'source_revision',
  'source_paths',
  'source_sha256s',
  'source_license_spdx',
  'source_license_url',
  'source_license_notice',
  'adaptation_notice',
  'preview_origin',
  'preview_author',
  'preview_license_spdx',
  'preview_sha256',
];

const REQUIRED_FIELD_SET = new Set(REQUIRED_FIELDS);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/i;
const GITHUB_OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const GITHUB_REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
const YAML_NULL_PATTERN = /^(?:null|~)$/i;
const YAML_INDICATOR_START_PATTERN = /^[-?:,\[\]{}#&*!|>'"%@`]/;
const YAML_PLAIN_SEPARATOR_PATTERN = /:[ \t]|[ \t]#/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
const MARKDOWN_TEXT_PATTERN = /[\\`*_\[\]()<>!|]/g;
const CATEGORIES = new Set([
  'assets-and-props',
  'avatars-and-profile',
  'branding-and-packaging',
  'editing-workflows',
  'editorial',
  'grids-and-collages',
  'infographics',
  'maps',
  'portrait',
  'portraits-and-characters',
  'poster-and-campaigns',
  'product-visuals',
  'scenes-and-illustrations',
  'storyboards-and-sequences',
  'zine',
]);
const EXECUTION_KINDS = new Set([
  'host-image-generation',
  'host-image-generation-and-layout',
]);
const INPUT_CONTRACTS = new Map([
  ['image', { min: 1, max: 1 }],
  ['text-or-image', { min: 0, max: 1 }],
]);
const MAX_PREVIEW_DIMENSION = 20_000;

/**
 * 只判定本解析器支持的 YAML plain scalar 词法子集：值必须是单行非空文本，
 * 不以 YAML indicator 开头，且不包含映射或注释分隔语法。数字、布尔值和 null 语义由字段校验器决定。
 */
function isSupportedPlainScalar(value) {
  return (
    value.length > 0 &&
    !value.includes('\n') &&
    !value.includes('\r') &&
    !YAML_INDICATOR_START_PATTERN.test(value) &&
    !YAML_PLAIN_SEPARATOR_PATTERN.test(value)
  );
}

function fail(message, filePath) {
  const location = filePath ? ` in ${filePath}` : '';
  throw new Error(`${message}${location}`);
}

function parseFrontmatter(markdown, filePath) {
  if (typeof markdown !== 'string') {
    fail('Effect card must be a Markdown string', filePath);
  }

  const normalized = markdown.replaceAll('\r\n', '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) {
    fail('Effect card must start with simple frontmatter', filePath);
  }

  const fields = Object.create(null);
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1 || /^\s/.test(line)) {
      fail('Frontmatter supports only simple single-line scalar fields', filePath);
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1);
    const value = rawValue.trim();
    if (!key) {
      fail('Frontmatter contains an empty key', filePath);
    }
    if (!REQUIRED_FIELD_SET.has(key)) {
      fail(`Unknown frontmatter field: ${key}`, filePath);
    }
    if (Object.hasOwn(fields, key)) {
      fail(`Duplicate frontmatter field: ${key}`, filePath);
    }
    if (!value) {
      fail(`Empty frontmatter value for ${key}`, filePath);
    }
    if (CONTROL_CHARACTER_PATTERN.test(rawValue)) {
      fail(`Field ${key} contains a control character`, filePath);
    }
    if (!isSupportedPlainScalar(value)) {
      fail(`Field ${key} must be a simple single-line scalar`, filePath);
    }
    fields[key] = value;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!Object.hasOwn(fields, field)) {
      fail(`Missing required field: ${field}`, filePath);
    }
  }

  const body = normalized.slice(match[0].length).trim();
  return { fields, body };
}

function parseCsv(value, field, filePath) {
  const items = value.split(',').map((item) => item.trim());
  if (items.some((item) => item.length === 0)) {
    fail(`Empty CSV item in ${field}`, filePath);
  }
  return items;
}

function assertCanonicalRelativePath(value, field, filePath) {
  const segments = value.split('/');
  if (
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    value.includes('\\') ||
    value.includes('`') ||
    /[%?#]/.test(value) ||
    CONTROL_CHARACTER_PATTERN.test(value) ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    fail(`${field} must be a canonical POSIX relative path without . or .. segments`, filePath);
  }
}

function assertGithubRepository(value, field, filePath) {
  const parts = value.split('/');
  const [owner, repository] = parts;
  if (
    parts.length !== 2 ||
    !GITHUB_OWNER_PATTERN.test(owner) ||
    owner.includes('--') ||
    !GITHUB_REPOSITORY_PATTERN.test(repository) ||
    repository === '.' ||
    repository === '..'
  ) {
    fail(`${field} must use canonical GitHub owner/repo format`, filePath);
  }
}

function assertEqual(value, expected, field, filePath) {
  if (value !== expected) {
    fail(`${field} must be ${expected}`, filePath);
  }
}

function parseInteger(value, field, filePath) {
  if (!/^(?:0|[1-9]\d*)$/.test(value)) {
    fail(`${field} must be a canonical non-negative integer`, filePath);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    fail(`${field} must be a safe integer`, filePath);
  }
  return parsed;
}

function containsEncodedControl(value) {
  let decoded = value;
  for (let depth = 0; depth < value.length; depth += 1) {
    let next;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return true;
    }
    if (CONTROL_CHARACTER_PATTERN.test(next)) return true;
    if (next === decoded) return false;
    decoded = next;
  }
  return false;
}

function assertHttpsUrl(value, field, filePath) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${field} must be a valid HTTPS URL`, filePath);
  }
  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password ||
    /^https:\/\/[^/?#]*@/i.test(value) ||
    value.includes('#') ||
    CONTROL_CHARACTER_PATTERN.test(value) ||
    containsEncodedControl(value)
  ) {
    fail(`${field} must be a valid HTTPS URL`, filePath);
  }
  return url.href;
}

function parseSemVer(version) {
  const match = version.match(SEMVER_PATTERN);
  if (!match) return null;
  return {
    major: match[1],
    minor: match[2],
    patch: match[3],
    prerelease: match[4]?.split('.') ?? [],
  };
}

function compareNumericIdentifier(left, right) {
  if (left.length !== right.length) return left.length - right.length;
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function compareAscii(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function comparePrerelease(left, right) {
  if (left.length === 0 || right.length === 0) {
    return left.length === right.length ? 0 : left.length === 0 ? 1 : -1;
  }

  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] === undefined) return -1;
    if (right[index] === undefined) return 1;
    if (left[index] === right[index]) continue;

    const leftNumber = /^\d+$/.test(left[index]);
    const rightNumber = /^\d+$/.test(right[index]);
    if (leftNumber && rightNumber) return compareNumericIdentifier(left[index], right[index]);
    if (leftNumber !== rightNumber) return leftNumber ? -1 : 1;
    return compareAscii(left[index], right[index]);
  }
  return 0;
}

function compareSemVer(left, right) {
  const a = parseSemVer(left);
  const b = parseSemVer(right);
  for (const field of ['major', 'minor', 'patch']) {
    const precedence = compareNumericIdentifier(a[field], b[field]);
    if (precedence !== 0) return precedence;
  }
  return comparePrerelease(a.prerelease, b.prerelease);
}

function sortEffects(effects) {
  validateEffectCollection(effects);
  return effects
    .map((effect, index) => ({ effect, index }))
    .sort(
      (left, right) =>
        compareAscii(left.effect.id, right.effect.id) ||
        compareSemVer(left.effect.version, right.effect.version) ||
        left.index - right.index,
    )
    .map(({ effect }) => effect);
}

export function validateEffectCollection(effects) {
  if (!Array.isArray(effects)) throw new TypeError('Effects must be an array');

  const refs = new Set();
  for (const effect of effects) {
    const ref = `${effect.id}@${effect.version}`;
    if (refs.has(ref)) throw new Error(`Duplicate effect ref: ${ref}`);
    refs.add(ref);
  }
  return effects;
}

export function parseEffect(markdown, filePath) {
  const { fields, body } = parseFrontmatter(markdown, filePath);

  for (const field of REQUIRED_FIELDS) {
    if (YAML_NULL_PATTERN.test(fields[field])) {
      fail(`Field ${field} cannot be null or empty`, filePath);
    }
  }

  if (!ID_PATTERN.test(fields.id)) fail('Invalid id; expected kebab-case', filePath);
  if (!parseSemVer(fields.version)) fail('Invalid SemVer version', filePath);
  assertGithubRepository(fields.source_repository, 'source_repository', filePath);
  if (!GIT_SHA_PATTERN.test(fields.source_revision)) {
    fail('source_revision must be a 40-character Git SHA', filePath);
  }
  if (!SHA256_PATTERN.test(fields.preview_sha256)) {
    fail('preview_sha256 must be a 64-character SHA-256', filePath);
  }

  if (!CATEGORIES.has(fields.category)) {
    fail(`category must be one of: ${[...CATEGORIES].join(', ')}`, filePath);
  }
  if (!EXECUTION_KINDS.has(fields.execution_kind)) {
    fail(
      'execution_kind must be host-image-generation or host-image-generation-and-layout',
      filePath,
    );
  }
  const inputContract = INPUT_CONTRACTS.get(fields.input_mode);
  if (!inputContract) {
    fail('input_mode must be image or text-or-image', filePath);
  }
  const inputMin = parseInteger(fields.input_min, 'input_min', filePath);
  const inputMax = parseInteger(fields.input_max, 'input_max', filePath);
  if (inputMin !== inputContract.min || inputMax !== inputContract.max) {
    fail(
      `input contract for ${fields.input_mode} must be ${inputContract.min}..${inputContract.max}`,
      filePath,
    );
  }
  if (
    fields.execution_kind === 'host-image-generation-and-layout' &&
    (fields.category !== 'editorial' || fields.input_mode !== 'image')
  ) {
    fail(
      'execution_kind host-image-generation-and-layout requires category editorial and input_mode image',
      filePath,
    );
  }
  const outputCount = parseInteger(fields.output_count, 'output_count', filePath);
  if (outputCount !== 1) fail('output_count must be 1', filePath);
  assertEqual(fields.source_license_spdx, 'MIT', 'source_license_spdx', filePath);
  assertEqual(fields.preview_license_spdx, 'CC-BY-4.0', 'preview_license_spdx', filePath);
  const sourceLicenseUrl = assertHttpsUrl(
    fields.source_license_url,
    'source_license_url',
    filePath,
  );

  const formats = parseCsv(fields.input_formats, 'input_formats', filePath);
  if (formats.length !== 2 || formats[0] !== 'jpeg' || formats[1] !== 'png') {
    fail('input_formats must be jpeg,png', filePath);
  }

  assertCanonicalRelativePath(fields.preview, 'preview', filePath);
  assertCanonicalRelativePath(fields.source_license_notice, 'source_license_notice', filePath);
  if (!fields.source_license_notice.startsWith('references/licenses/')) {
    fail('source_license_notice must be inside references/licenses/', filePath);
  }
  const sourcePaths = parseCsv(fields.source_paths, 'source_paths', filePath);
  const sourceHashes = parseCsv(fields.source_sha256s, 'source_sha256s', filePath);
  if (sourcePaths.length !== sourceHashes.length) {
    fail('source_paths and source_sha256s must have the same length', filePath);
  }

  const seenPaths = new Set();
  const sources = sourcePaths.map((sourcePath, index) => {
    assertCanonicalRelativePath(sourcePath, 'source_paths', filePath);
    if (seenPaths.has(sourcePath)) fail(`Duplicate source path: ${sourcePath}`, filePath);
    seenPaths.add(sourcePath);

    const sha256 = sourceHashes[index];
    if (!SHA256_PATTERN.test(sha256)) {
      fail(`source_sha256s contains an invalid SHA-256 at position ${index + 1}`, filePath);
    }
    return { path: sourcePath, sha256: sha256.toLowerCase() };
  });

  return {
    ref: `${fields.id}@${fields.version}`,
    id: fields.id,
    version: fields.version,
    title: { en: fields.title_en, zh: fields.title_zh },
    summary: { en: fields.summary_en, zh: fields.summary_zh },
    category: fields.category,
    executionKind: fields.execution_kind,
    input: { mode: fields.input_mode, min: inputMin, max: inputMax, formats },
    outputCount,
    preview: fields.preview,
    sourceRepository: fields.source_repository,
    sourceRevision: fields.source_revision.toLowerCase(),
    sources,
    sourceLicense: {
      spdx: fields.source_license_spdx,
      url: sourceLicenseUrl,
    },
    sourceLicenseNotice: fields.source_license_notice,
    adaptationNotice: fields.adaptation_notice,
    previewProvenance: {
      origin: fields.preview_origin,
      author: fields.preview_author,
      licenseSpdx: fields.preview_license_spdx,
      sha256: fields.preview_sha256.toLowerCase(),
    },
    filePath,
    body,
  };
}

export async function loadEffects(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();

  const effects = [];
  for (const name of markdownFiles) {
    const filePath = path.join(root, name);
    effects.push(parseEffect(await readFile(filePath, 'utf8'), filePath));
  }
  return sortEffects(effects);
}

export function buildLibrary(effects, generatedAt, previewMetadataByRef) {
  if (!(previewMetadataByRef instanceof Map)) {
    throw new TypeError('Preview metadata must be a Map keyed by effect ref');
  }
  return {
    schemaVersion: 2,
    generatedAt,
    effects: sortEffects(effects).map((effect) => {
      const previewMetadata = previewMetadataByRef.get(effect.ref);
      if (
        previewMetadata === null ||
        typeof previewMetadata !== 'object' ||
        !Object.hasOwn(previewMetadata, 'width') ||
        !Object.hasOwn(previewMetadata, 'height')
      ) {
        throw new Error(`Preview metadata is required for ${effect.ref}`);
      }
      const { width, height } = previewMetadata;
      if (
        !Number.isInteger(width) ||
        width <= 0 ||
        width > MAX_PREVIEW_DIMENSION ||
        !Number.isInteger(height) ||
        height <= 0 ||
        height > MAX_PREVIEW_DIMENSION
      ) {
        throw new Error(
          `Preview dimensions for ${effect.ref} must be integers from 1 to ${MAX_PREVIEW_DIMENSION}`,
        );
      }
      const previewExtension = path.posix.extname(effect.preview);
      return {
        ref: effect.ref,
        id: effect.id,
        version: effect.version,
        title: { ...effect.title },
        summary: { ...effect.summary },
        category: effect.category,
        executionKind: effect.executionKind,
        previewWidth: width,
        previewHeight: height,
        input: { ...effect.input, formats: [...effect.input.formats] },
        outputCount: effect.outputCount,
        previewUrl: `./media/${effect.ref}${previewExtension}`,
        sourceUrl: `./source/${effect.ref}.md`,
        provenance: {
          repository: effect.sourceRepository,
          revision: effect.sourceRevision,
          license: { ...effect.sourceLicense },
          preview: {
            origin: effect.previewProvenance.origin,
            author: effect.previewProvenance.author,
            licenseSpdx: effect.previewProvenance.licenseSpdx,
          },
        },
        invocation:
          effect.input.mode === 'text-or-image'
            ? `Use $image-effects effect ${effect.ref} with this idea or my uploaded image.`
            : `Use $image-effects effect ${effect.ref} on my uploaded image.`,
      };
    }),
  };
}

function escapeMarkdownText(value) {
  return value.replace(MARKDOWN_TEXT_PATTERN, '\\$&');
}

function markdownDestination(url) {
  return `<${url.replaceAll('<', '%3C').replaceAll('>', '%3E')}>`;
}

function noticeBytes(value, noticePath) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'string') return Buffer.from(value);
  throw new TypeError(`License notice ${noticePath} must be a string or Buffer`);
}

export function renderThirdPartyNotices(effects, header, licenseNoticesByPath) {
  if (typeof header !== 'string') throw new TypeError('Notice header must be a string');
  if (!(licenseNoticesByPath instanceof Map)) {
    throw new TypeError('License notices must be a Map keyed by canonical relative path');
  }

  const sortedEffects = sortEffects(effects);
  const noticeRecords = new Map();
  for (const effect of sortedEffects) {
    const noticePath = effect.sourceLicenseNotice;
    if (!licenseNoticesByPath.has(noticePath)) {
      throw new Error(`License notice is required for ${effect.ref}: ${noticePath}`);
    }
    const licenseSources = effect.sources.filter(({ path: sourcePath }) => sourcePath === 'LICENSE');
    if (licenseSources.length !== 1) {
      throw new Error(`${effect.ref} must map exactly one pinned LICENSE source`);
    }
    const bytes = noticeBytes(licenseNoticesByPath.get(noticePath), noticePath);
    const actualSha256 = createHash('sha256').update(bytes).digest('hex');
    if (actualSha256 !== licenseSources[0].sha256) {
      throw new Error(`License notice SHA-256 mismatch for ${effect.ref}: ${noticePath}`);
    }
    const existing = noticeRecords.get(noticePath);
    if (existing && existing.sha256 !== actualSha256) {
      throw new Error(`Conflicting license notice bytes for ${noticePath}`);
    }
    noticeRecords.set(noticePath, {
      path: noticePath,
      sha256: actualSha256,
      text: bytes.toString('utf8').trimEnd(),
    });
  }

  const sections = sortedEffects.map((effect) => {
    const sourceLines = effect.sources.map(
      (source) => `- Source: \`${source.path}\` (SHA-256: \`${source.sha256}\`)`,
    );
    const notice = noticeRecords.get(effect.sourceLicenseNotice);
    return [
      `## ${effect.ref}`,
      '',
      `- Repository: \`${effect.sourceRepository}\``,
      `- Revision: \`${effect.sourceRevision}\``,
      ...sourceLines,
      `- License: [${effect.sourceLicense.spdx}](${markdownDestination(effect.sourceLicense.url)})`,
      `- Notice: \`${effect.sourceLicenseNotice}\` (SHA-256: \`${notice.sha256}\`)`,
      `- Adaptation: ${escapeMarkdownText(effect.adaptationNotice)}`,
    ].join('\n');
  });

  if (sections.length === 0) return header;
  const seenHashes = new Set();
  const uniqueNotices = [...noticeRecords.values()]
    .sort((left, right) => compareAscii(left.path, right.path))
    .filter(({ sha256 }) => {
      if (seenHashes.has(sha256)) return false;
      seenHashes.add(sha256);
      return true;
    });
  const fullNotices = uniqueNotices.map(
    (notice) => `### \`${notice.path}\`\n\n${notice.text}`,
  );
  const separator = header.endsWith('\n\n') ? '' : header.endsWith('\n') ? '\n' : '\n\n';
  return `${header}${separator}${sections.join('\n\n')}\n\n## Full license notices\n\n${fullNotices.join('\n\n')}\n`;
}
