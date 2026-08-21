---
id: torn-paper-editorial-photo-collage
version: 1.0.0
title_en: Torn Paper Editorial Photo Collage
title_zh: 撕纸编辑影像拼贴
summary_en: Embed one truthful color photo in a fibrous torn opening with a source-derived monochrome echo, one dry-brush color field, and quiet aged paper.
summary_zh: 将一张真实彩色照片嵌入纤维撕口，以来源环境的黑白网点回声、一道干刷色块和留白旧纸完成编辑拼贴。
category: editorial
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/torn-paper-editorial-photo-collage.jpg
source_repository: wangjs-jacky/happy
source_revision: d1259c69fdc5494553f31b6736b640d597a89bfb
source_paths: packages/happy-app/sources/components/agents/tornPaperEditorialPrompt.ts,LICENSE
source_sha256s: 4f02fadd2656305e75547eb692caabd054b2b64394f2519e225d8e51f55f5c81,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/d1259c69fdc5494553f31b6736b640d597a89bfb/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Preserves the large truthful torn-photo anchor, source-derived monochrome environment, single dry-brush field, aged-paper negative space, input privacy, and one targeted retry in a host-neutral card.
preview_origin: Text-only image generation of a fictional rainy stair scene with an unattended umbrella; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 00ca63d6545a9f0a96bcf512c3869f7cf7cbd4e5d0eb40b2dbf79cc8373cb207
---

## 适用场景

Transform exactly one supplied JPEG or PNG into a flat 3:5 editorial collage on warm aged handmade paper. Use the source as the only authority for subject identity, object count, scene structure, viewpoint, and emotional moment. The result is defined by one large truthful color photograph inside an irregular torn opening, a monochrome environmental echo derived from the same source, one broad dry-brush color field, and quiet paper.

This effect suits portraits, action photographs, landscapes, and street scenes. Preserve recognizable people, facial identity, anatomy, clothing, equipment, architecture, horizon, and spatial order. Remove only source-interface overlays such as timestamps, status bars, playback controls, and download icons; do not invent replacement content.

## 输入契约

Require exactly one JPEG or PNG explicitly attached to the current request. Never search attachment folders, earlier messages, nearby files, or the web for a substitute. Treat the image as private task input; do not commit, redistribute, disclose its path, or retain unnecessary copies. Remove temporary transfer files after success or failure.

Use a portrait 3:5 canvas. If the source cannot be truthfully adapted without cutting away its defining subject or scene relationship, stop and explain the incompatibility instead of silently changing the effect or fabricating missing content.

## 视觉编译规则

- Retain selective original color in one dominant photographic anchor occupying roughly 45% to 65% of the poster. Shape it as a large diagonal or asymmetric torn opening with exposed white fibers, feathered pulp, uneven contour, and small analog imperfections. Never reduce it to a tiny centered card or a clean rectangle.
- Preserve exactly one instance of every person and key subject. Keep identity, natural anatomy, pose, equipment, landmark count, horizon, direction, and spatial order truthful to the source.
- Derive the surrounding environmental echo only from source content. Convert selected foliage, buildings, court lines, smoke, water, railings, street lights, or silhouettes into one coherent black-and-white halftone, faded photocopy, or coarse ink-screen layer.
- Add exactly one broad opaque dry-brush swash in cobalt blue, vermilion, or coral according to the source mood. Keep visible bristle gaps and matte pigment; place it partly beneath the photo or environmental echo as structure, not scattered decoration.
- Reserve roughly 25% to 40% quiet warm-ivory or softly yellowed paper with restrained fibers, age variation, faded transfer, and subtle scan grain. The page must read as one flat matte scan.
- Typography is optional. Reproduce one supplied exact caption as small letter-spaced typewriter text in open paper, or omit text when none is supplied. Never invent copy.

## 硬性禁止项

Do not add unrelated stock imagery, extra people, duplicated faces, limbs, objects, horizons, or landmarks. Do not change identity, anatomy, pose, clothing, equipment, viewpoint, or scene meaning. Do not create face-like forms in abstract halftone regions when the source has no face there.

Do not use gradients, neon glow, glossy paint, several accent colors, decorative marks, rectangular photo cards, frames, shadows, floating layers, 3D mockup depth, product presentation, phone or social UI, player controls, timestamps, random copy, mastheads, paragraphs, logos, watermarks, QR codes, or unsupported metadata.

## 质量检查

Confirm that the color photograph occupies 45% to 65% of the 3:5 canvas; the torn boundary is large, irregular, and visibly fibrous; the monochrome environment comes from the supplied scene; exactly one dry-brush gesture organizes the page; and 25% to 40% remains quiet aged paper.

Inspect every person, face, hand, object, landmark, and horizon for truthful count and structure. Check abstract halftone for accidental face-like pareidolia outside source faces. Confirm the result is flat and matte, the optional caption is exact and legible, and no interface chrome, mockup depth, unsupported metadata, or private path appears. Use at most one targeted retry for a specific hard-rule failure.

## 交付要求

Deliver exactly one finished 3:5 raster through the host's native image-delivery path. Add a short rationale in the user's language naming the preserved photographic anchor, source-derived monochrome echo, and selected structural brush color. Do not reveal private paths, the full internal prompt, or detailed parameters unless requested.
