---
id: photo-illustration-editorial-echo
version: 1.0.0
title_en: Photo–Illustration Editorial Echo
title_zh: 摄影插画编辑回声
summary_en: Pair one truthful photo with an isolated illustrated echo and scene-authored type in a deterministic editorial poster.
summary_zh: 将一张真实照片、独立插画回声与场景文案组合为确定性编辑海报。
category: editorial
execution_kind: host-image-generation-and-layout
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/photo-illustration-editorial-echo.png
source_repository: wangjs-jacky/happy
source_revision: e8716a0a0c949f8e2b45e1e3d7c8d36ad7bba17c
source_paths: packages/happy-app/sources/components/agents/photoIllustrationEditorialEchoPrompt.ts,LICENSE
source_sha256s: 66a172d31b3af5c54a22e28adb15432ea25a2fe895d87b6e443451516ad749a3,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/e8716a0a0c949f8e2b45e1e3d7c8d36ad7bba17c/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Preserves the mandatory illustrated-motif and deterministic-layout pipeline while replacing product-specific paths with host-neutral capability gates, privacy cleanup, and honest fallback.
preview_origin: Text-only image generation of a fictional rainy storefront and bicycle; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: ed002f7dd4641a691ccec1f0ce3575fca6be85c26991cb5e75c745ea23aa9313
---

## 适用场景

Compile exactly one supplied photo into one finished editorial paper poster with three coordinated layers: a truthful rectangular photo anchor, one composition-matched illustrated echo, and concise scene-authored typography. This is not a photo filter, two-photo comparison, generic template, or motif-only delivery. The photo supplies evidence, the illustration isolates the meaningful form, and the copy names a relationship already visible in the frame.

Choose portrait 3:5 for vertical depth, standing subjects, or stacked rhythm; landscape 5:3 for horizons and lateral movement; use 4:3 only when neither axis dominates. Preserve the subject and the visual fact that motivates the composition.

## 输入契约

Require exactly one JPEG or PNG explicitly attached to the current request. Never search attachment folders, earlier messages, nearby files, or the web for a substitute. Treat the image as private task input; do not commit, redistribute, disclose its path, or retain unnecessary copies. Remove temporary motif, page, and capture files after success or failure.

Before creating an asset, preflight both required capabilities: native image generation or editing for Stage A, and fixed-size local HTML/CSS composition plus browser screenshot or an equivalent deterministic rasterizer for Stage B. If either is unavailable, stop before Stage A. Return the complete isolated-motif prompt, chosen dimensions, Scene Map, Copy Map, HTML/CSS composition plan, and a precise missing-capability statement. Never deliver only a motif or claim that a final poster was produced.

Build two internal maps. The Scene Map records primary subject, count, pose or silhouette, direction, 1–3 identity-bearing anchors, ground or horizon line, spatial order, relative scale, native palette, and minimum recognizable detail. The Copy Map records one real relationship, tension, gesture, or contradiction visible in the source; it must not invent a person, place, date, brand, profession, quotation, or event.

## 视觉编译规则

### Stage A — isolated illustrated echo

- Generate one isolated fine-ink and translucent-watercolor motif on warm ivory paper, never the final poster.
- Select one dominant source motif. Preserve subject count, silhouette, viewing direction, identity anchors, hand placement, held objects, landmark geometry, and spatial relationships.
- Simplify incidental detail by about 70–90%; use 4–7 source-derived colors plus neutral ink and paper.
- Provide irregular fading paper edges and masking room. Add no photographic panel, hard rectangle, copy, swatches, logo, watermark, signature, or invented object.

### Stage B — deterministic composition

- Build a fixed-dimension HTML/CSS page and rasterize only that canvas. Keep all typography as real text; never ask the image model to paint words.
- Keep the supplied photo unchanged as one clean rectangle. Only proportional crop and mild tonal harmonization are allowed; do not repaint, relight, retouch identity, or replace location.
- Place the motif in the opposing field with an organic mask or equivalent alpha treatment so it reads as illustration, not a second rectangular photo. It may overlap the copy's band but never collide with readable text.
- Use warm ivory paper, square corners, broad breathing room, one thin source-derived or blue-gray rule, and exactly three small source-derived swatches. Use a neutral grotesk or monospaced editorial face, zero letter spacing, and a 4–6× title-to-metadata hierarchy.
- A portrait photo normally occupies the upper 35–45%. A landscape photo may span the upper band or dominant side. Let source weight determine placement rather than forcing one template.
- Derive a 2–6 word English title or 4–10 character Chinese title from the Copy Map, one grounded two-digit study label, and one supporting sentence no longer than 14 English words or 24 Chinese characters. Match the requested language, omit dates unless supplied, and verify every character after capture.

## 硬性禁止项

Do not create the final poster in the image model. Do not redraw the photo anchor, turn the motif into a second photo panel, use rounded cards, shadows, gradients, blobs, fake stamps, QR codes, logos, watermarks, phone or social UI, progress controls, browser chrome, scrollbars, unsupported metadata, generic category titles, invented facts, pseudo-text, obscured copy, duplicate subjects, malformed anatomy, or changed landmarks.

## 质量检查

Confirm the final raster uses the chosen 3:5, 5:3, or 4:3 dimensions; the original photo loaded and remained truthful; one isolated recognizable motif corresponds to it; all source counts, hands, held objects, identities, and landmark relationships survive; all copy is scene-specific, crisp, correctly spelled, unobstructed, and inside the canvas; the three swatches and one rule remain subordinate; and no browser UI or private path is visible.

Stage A and Stage B share the effect's single targeted retry budget. If Stage A spends it, report a later Stage B failure without retrying. If an acceptable motif reaches Stage B and layout or screenshot fails, repair and recapture the layout once without regenerating the motif. Never silently skip a stage.

## 交付要求

Deliver exactly one finished raster through the host's native image-delivery path, never the motif, source image, HTML, or working files. Add a brief rationale in the user's language naming the preserved visual fact, the illustrated echo, and the Copy Map relationship. Do not disclose private paths, full internal prompts, or detailed parameters unless requested.
