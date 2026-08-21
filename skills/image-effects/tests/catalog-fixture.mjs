export const MIGRATED_EFFECT_IDS = Object.freeze([
  'anime-key-visual',
  'banner-grid-2x2',
  'banner-hero',
  'bento-grid-infographic',
  'bento-memory-card',
  'brand-poster',
  'campaign-kv',
  'character-grid-portrait',
  'character-merch-board',
  'character-sheet',
  'cinematic-storyboard',
  'concept-scene',
  'editorial-cover',
  'food-map',
  'four-panel-comic',
  'hand-drawn-infographic',
  'healing-scene',
  'lifestyle-product-scene',
  'lookbook-grid',
  'manga-spread-page',
  'mascot-brand-kit',
  'minimalist-mood-scene',
  'mixed-style-multi-panel',
  'packaging-showcase',
  'picture-book-scene',
  'premium-studio-product',
  'product-tvc-storyboard',
  'recipe-process-flowchart',
  'retro-skeuomorphic-icons',
  'step-by-step-infographic',
  'sticker-set',
  'themed-3d-icon',
  'vintage-editorial-infographic',
  'vintage-film-editorial',
  'white-background-product',
]);

const ORIGINAL_CATALOG = [
  ['healing-anime-scribble-v3@1.0.0', '.jpg'],
  ['minimal-zine-poster@1.0.0', '.png'],
  ['photo-illustration-diptych@1.0.0', '.png'],
  ['photo-illustration-diptych-lakeside@1.0.0', '.png'],
  ['photo-illustration-editorial-echo@1.0.0', '.png'],
  ['scene-distillation-zine@1.0.0', '.png'],
  ['scenes-gathered-zine@1.0.0', '.png'],
  ['scenes-gathered-zine-sea@1.0.0', '.png'],
  ['torn-paper-editorial-photo-collage@1.0.0', '.jpg'],
];

export const EXPECTED_CATALOG = Object.freeze([
  ...ORIGINAL_CATALOG,
  ...MIGRATED_EFFECT_IDS.map((id) => [`${id}@1.0.0`, '.png']),
].sort(([left], [right]) => {
  const leftId = left.slice(0, left.lastIndexOf('@'));
  const rightId = right.slice(0, right.lastIndexOf('@'));
  if (leftId !== rightId) return leftId < rightId ? -1 : 1;
  return left === right ? 0 : left < right ? -1 : 1;
}));

export const EXPECTED_CATALOG_REFS = Object.freeze(
  EXPECTED_CATALOG.map(([ref]) => ref),
);

export const HAPPY_SOURCE_REVISION = '9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f';
export const MIGRATED_PREVIEW_ORIGIN =
  'Text-only image generation of a fictional scene or subject; not based on a real person, place, brand, or third-party image.';
