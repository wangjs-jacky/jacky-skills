const SUPPORTED_SCHEMA_VERSION = 2;
const MAX_EFFECTS = 1000;
const MAX_SELECTED_REFS = 1000;
const EXECUTION_KINDS = new Set([
  'host-image-generation',
  'host-image-generation-and-layout',
]);
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
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const REPOSITORY_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9.-]{0,99})\/[A-Za-z0-9](?:[A-Za-z0-9._-]{0,99})$/;
const FORMAT_PATTERN = /^[a-z0-9][a-z0-9.+-]{0,19}$/;
const SPDX_PATTERN = /^[A-Za-z0-9][A-Za-z0-9.+-]{0,63}$/;
const GENERIC_LOAD_ERRORS = Object.freeze({
  en: 'Unable to load the effect library. Please try again.',
  zh: '无法加载效果库，请重试。',
});

class GalleryValidationError extends Error {
  constructor(detail) {
    super(`Invalid effect library: ${detail}`);
    this.name = 'GalleryValidationError';
  }
}

function hasOwn(value, field) {
  return Object.prototype.hasOwnProperty.call(value, field);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function libraryError(detail) {
  return new GalleryValidationError(detail);
}

function requireOwnFields(value, fields, label) {
  if (!isRecord(value)) throw libraryError(`${label} must be an object.`);
  for (const field of fields) {
    if (!hasOwn(value, field)) throw libraryError(`${label}.${field} must be an own property.`);
  }
}

function assertString(value, label, maximum, pattern) {
  if (!isNonEmptyString(value) || value.length > maximum || (pattern && !pattern.test(value))) {
    throw libraryError(`${label} is invalid.`);
  }
}

function assertLocalizedField(effect, field, index, maximum) {
  const label = `effect ${index}.${field}`;
  requireOwnFields(effect[field], ['en', 'zh'], label);
  assertString(effect[field].en, `${label}.en`, maximum);
  assertString(effect[field].zh, `${label}.zh`, maximum);
}

function assertInteger(value, label, minimum, maximum) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw libraryError(`${label} is invalid.`);
  }
}

function assertHttpsUrl(value, label) {
  assertString(value, label, 2048);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw libraryError(`${label} is invalid.`);
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw libraryError(`${label} is invalid.`);
  }
}

function assertInput(input, index) {
  const label = `effect ${index}.input`;
  requireOwnFields(input, ['mode', 'min', 'max', 'formats'], label);
  if (!['image', 'text-or-image'].includes(input.mode)) {
    throw libraryError(`${label}.mode is invalid.`);
  }
  const minimum = input.mode === 'text-or-image' ? 0 : 1;
  assertInteger(input.min, `${label}.min`, minimum, 1000);
  assertInteger(input.max, `${label}.max`, input.min, 1000);
  if (!Array.isArray(input.formats) || input.formats.length === 0 || input.formats.length > 20) {
    throw libraryError(`${label}.formats is invalid.`);
  }
  const formats = new Set();
  for (const format of input.formats) {
    if (typeof format !== 'string' || !FORMAT_PATTERN.test(format) || formats.has(format)) {
      throw libraryError(`${label}.formats is invalid.`);
    }
    formats.add(format);
  }
  if (
    input.min !== minimum
    || input.max !== 1
    || input.formats.length !== 2
    || input.formats[0] !== 'jpeg'
    || input.formats[1] !== 'png'
  ) {
    throw libraryError(`${label} ${input.mode} contract is invalid.`);
  }
}

function assertProvenance(provenance, index) {
  const label = `effect ${index}.provenance`;
  requireOwnFields(provenance, ['repository', 'revision', 'license', 'preview'], label);
  assertString(provenance.repository, `${label}.repository`, 201, REPOSITORY_PATTERN);
  assertString(provenance.revision, `${label}.revision`, 40, /^[0-9a-f]{40}$/i);

  requireOwnFields(provenance.license, ['spdx', 'url'], `${label}.license`);
  assertString(provenance.license.spdx, `${label}.license.spdx`, 64, SPDX_PATTERN);
  assertHttpsUrl(provenance.license.url, `${label}.license.url`);

  requireOwnFields(
    provenance.preview,
    ['origin', 'author', 'licenseSpdx'],
    `${label}.preview`,
  );
  assertString(provenance.preview.origin, `${label}.preview.origin`, 1000);
  assertString(provenance.preview.author, `${label}.preview.author`, 200);
  assertString(
    provenance.preview.licenseSpdx,
    `${label}.preview.licenseSpdx`,
    64,
    SPDX_PATTERN,
  );
}

function assertManagedUrls(effect, index) {
  const previewLabel = `effect ${index}.previewUrl`;
  const sourceLabel = `effect ${index}.sourceUrl`;
  assertString(effect.previewUrl, previewLabel, 300);
  assertString(effect.sourceUrl, sourceLabel, 300);

  const previewPrefix = `./media/${effect.ref}.`;
  const extension = effect.previewUrl.startsWith(previewPrefix)
    ? effect.previewUrl.slice(previewPrefix.length)
    : '';
  if (!['jpg', 'jpeg', 'png'].includes(extension)) {
    throw libraryError(`${previewLabel} is invalid.`);
  }
  if (effect.sourceUrl !== `./source/${effect.ref}.md`) {
    throw libraryError(`${sourceLabel} is invalid.`);
  }
}

function assertEffect(effect, index, seenRefs) {
  const label = `effect ${index}`;
  requireOwnFields(
    effect,
    [
      'ref',
      'id',
      'version',
      'executionKind',
      'previewWidth',
      'previewHeight',
      'title',
      'summary',
      'category',
      'input',
      'outputCount',
      'previewUrl',
      'sourceUrl',
      'provenance',
      'invocation',
    ],
    label,
  );

  assertString(effect.id, `${label}.id`, 100, ID_PATTERN);
  assertString(effect.version, `${label}.version`, 100, SEMVER_PATTERN);
  assertString(effect.ref, `${label}.ref`, 220);
  if (effect.ref !== `${effect.id}@${effect.version}`) {
    throw libraryError(`${label}.ref does not match id and version.`);
  }
  if (seenRefs.has(effect.ref)) throw libraryError(`${label}.ref is duplicated.`);
  seenRefs.add(effect.ref);

  if (!EXECUTION_KINDS.has(effect.executionKind)) {
    throw libraryError(`${label}.executionKind is invalid.`);
  }
  assertInteger(effect.previewWidth, `${label}.previewWidth`, 1, 20_000);
  assertInteger(effect.previewHeight, `${label}.previewHeight`, 1, 20_000);

  assertLocalizedField(effect, 'title', index, 200);
  assertLocalizedField(effect, 'summary', index, 2000);
  if (!CATEGORIES.has(effect.category)) {
    throw libraryError(`${label}.category is invalid.`);
  }
  assertInput(effect.input, index);
  if (
    effect.executionKind === 'host-image-generation-and-layout'
    && (effect.category !== 'editorial'
      || effect.input.mode !== 'image'
      || effect.input.min !== 1
      || effect.input.max !== 1)
  ) {
    throw libraryError(
      `${label}.executionKind requires category editorial and input image 1..1.`,
    );
  }
  assertInteger(effect.outputCount, `${label}.outputCount`, 1, 1000);
  assertManagedUrls(effect, index);
  assertProvenance(effect.provenance, index);
  assertString(effect.invocation, `${label}.invocation`, 2048);
  if (!effect.invocation.includes(effect.ref)) {
    throw libraryError(`${label}.invocation must include its versioned ref.`);
  }
}

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function cloneValue(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  const clone = Array.isArray(value) ? [] : {};
  seen.set(value, clone);
  for (const [key, child] of Object.entries(value)) clone[key] = cloneValue(child, seen);
  return clone;
}

function canonicalizeEffect(effect) {
  return {
    ref: effect.ref,
    id: effect.id,
    version: effect.version,
    executionKind: effect.executionKind,
    previewWidth: effect.previewWidth,
    previewHeight: effect.previewHeight,
    title: { en: effect.title.en, zh: effect.title.zh },
    summary: { en: effect.summary.en, zh: effect.summary.zh },
    category: effect.category,
    input: {
      mode: effect.input.mode,
      min: effect.input.min,
      max: effect.input.max,
      formats: [...effect.input.formats],
    },
    outputCount: effect.outputCount,
    previewUrl: effect.previewUrl,
    sourceUrl: effect.sourceUrl,
    provenance: {
      repository: effect.provenance.repository,
      revision: effect.provenance.revision,
      license: {
        spdx: effect.provenance.license.spdx,
        url: effect.provenance.license.url,
      },
      preview: {
        origin: effect.provenance.preview.origin,
        author: effect.provenance.preview.author,
        licenseSpdx: effect.provenance.preview.licenseSpdx,
      },
    },
    invocation: effect.invocation,
  };
}

function canonicalizeLibrary(library) {
  return deepFreeze({
    schemaVersion: library.schemaVersion,
    generatedAt: library.generatedAt,
    effects: library.effects.map(canonicalizeEffect),
  });
}

function normalizeLanguage(language) {
  return language === 'zh' ? 'zh' : 'en';
}

function normalizeQuery(query) {
  return typeof query === 'string' ? query.trim() : '';
}

function normalizeCategory(category) {
  return isNonEmptyString(category) ? category.trim() : 'all';
}

function isValidRef(ref) {
  if (ref.length > 220) return false;
  const separator = ref.indexOf('@');
  if (separator <= 0 || separator !== ref.lastIndexOf('@')) return false;
  return (
    ID_PATTERN.test(ref.slice(0, separator)) &&
    SEMVER_PATTERN.test(ref.slice(separator + 1))
  );
}

function immutableRefs(refs) {
  if (!Array.isArray(refs)) return Object.freeze([]);
  const normalized = [];
  const seen = new Set();
  for (let index = 0; index < refs.length && index < MAX_SELECTED_REFS; index += 1) {
    if (typeof refs[index] !== 'string') continue;
    const ref = refs[index].trim();
    if (!isValidRef(ref) || seen.has(ref)) continue;
    seen.add(ref);
    normalized.push(ref);
  }
  return Object.freeze(normalized);
}

function effectsOf(state) {
  return state?.library?.effects ?? [];
}

function reconcileSelection(refs, effects) {
  const selected = new Set(immutableRefs(refs));
  return Object.freeze(
    effects.filter((effect) => selected.has(effect.ref)).map((effect) => effect.ref),
  );
}

function normalizeSearchValue(value) {
  return value.normalize('NFKC').toLowerCase();
}

export function assertLibrary(library) {
  requireOwnFields(library, ['schemaVersion', 'generatedAt', 'effects'], 'library');
  if (library.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    const received =
      typeof library.schemaVersion === 'number' ? ` (received ${library.schemaVersion})` : '';
    throw libraryError(`library.schemaVersion must be 2${received}.`);
  }
  assertString(library.generatedAt, 'library.generatedAt', 40);
  const timestamp = new Date(library.generatedAt);
  if (Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== library.generatedAt) {
    throw libraryError('library.generatedAt must be a canonical ISO timestamp.');
  }
  if (!Array.isArray(library.effects)) throw libraryError('library.effects must be an array.');
  if (library.effects.length > MAX_EFFECTS) {
    throw libraryError('library.effects cannot contain more than 1000 entries.');
  }

  const seenRefs = new Set();
  library.effects.forEach((effect, index) => assertEffect(effect, index, seenRefs));
  return library;
}

export function createGalleryState(preferences = {}) {
  const source = isRecord(preferences) ? preferences : {};
  return {
    library: null,
    language: normalizeLanguage(source.language),
    query: normalizeQuery(source.query),
    category: normalizeCategory(source.category),
    selectedRefs: immutableRefs(source.selectedRefs),
    loadStatus: 'idle',
    loadError: null,
    loadAttempt: 0,
  };
}

export function startLoading(state) {
  return {
    ...state,
    selectedRefs: immutableRefs(state.selectedRefs),
    loadStatus: 'loading',
    loadError: null,
    loadAttempt: (Number.isInteger(state.loadAttempt) ? state.loadAttempt : 0) + 1,
  };
}

export function loadSucceeded(state, library) {
  assertLibrary(library);
  const snapshot = canonicalizeLibrary(library);
  return {
    ...state,
    library: snapshot,
    selectedRefs: reconcileSelection(state.selectedRefs, snapshot.effects),
    loadStatus: 'ready',
    loadError: null,
  };
}

export function loadFailed(state, error) {
  const language = normalizeLanguage(state.language);
  const message =
    error instanceof GalleryValidationError ? error.message : GENERIC_LOAD_ERRORS[language];
  return {
    ...state,
    selectedRefs: immutableRefs(state.selectedRefs),
    loadStatus: 'error',
    loadError: message,
  };
}

export function retryLoad(state) {
  return startLoading(state);
}

export function localizeEffect(effect, language) {
  const selectedLanguage = normalizeLanguage(language);
  const title = effect.title[selectedLanguage] || effect.title.en;
  const summary = effect.summary[selectedLanguage] || effect.summary.en;
  const projection = cloneValue(effect);
  projection.title = title;
  projection.summary = summary;
  return deepFreeze(projection);
}

export function getVisibleEffects(state) {
  const query = normalizeSearchValue(normalizeQuery(state.query));
  const category = normalizeCategory(state.category);
  const language = normalizeLanguage(state.language);

  return effectsOf(state)
    .filter((effect) => category === 'all' || effect.category === category)
    .filter((effect) => {
      if (!query) return true;
      const title = effect.title[language] || effect.title.en;
      const summary = effect.summary[language] || effect.summary.en;
      return [effect.id, effect.ref, title, summary].some((value) =>
        normalizeSearchValue(value).includes(query),
      );
    })
    .map((effect) => localizeEffect(effect, language));
}

export function toggleSelection(state, ref) {
  if (typeof ref !== 'string' || !effectsOf(state).some((effect) => effect.ref === ref)) {
    return state;
  }

  const selected = new Set(immutableRefs(state.selectedRefs));
  if (selected.has(ref)) selected.delete(ref);
  else selected.add(ref);
  return { ...state, selectedRefs: immutableRefs([...selected]) };
}

export function clearSelection(state) {
  return { ...state, selectedRefs: Object.freeze([]) };
}

export function getSelectedInvocations(state) {
  const selected = new Set(immutableRefs(state.selectedRefs));
  return effectsOf(state)
    .filter((effect) => selected.has(effect.ref))
    .map((effect) => effect.invocation);
}
