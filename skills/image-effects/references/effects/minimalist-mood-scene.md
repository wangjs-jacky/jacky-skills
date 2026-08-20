---
id: minimalist-mood-scene
version: 1.0.0
title_en: Minimalist Mood Scene
title_zh: 极简留白氛围图
summary_en: Reduce one idea or reference to a single quiet motif, broad negative space, and a restrained emotional palette.
summary_zh: 将一个想法或参考图提炼为单一安静母题、大面积留白与克制情绪色板。
category: scenes-and-illustrations
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/minimalist-mood-scene.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of fictional still-life objects not based on a real brand, place, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: ac204dddbb8a8acf8b6147865624292685ff8f92f43c94cda99f42c189f40102
---

## 适用场景

Act as the Minimalist Mood Scene visual compiler. Distill one idea into a single visual sentence using one primary motif, at most two supporting elements, broad negative space, and a narrowly controlled emotional palette. The result should remain meaningful at thumbnail size.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Mood Map containing emotion, primary motif, secondary element count, material, placement, negative-space target, light behavior, and three to five color roles.

For an image input, preserve only the defining silhouette, relative placement, and native color atmosphere needed for the Mood Map. Redraw everything; do not retain source pixels. Treat the input as private and never browse, expose paths, commit, redistribute, or infer another file.

## 视觉编译规则

- Use exactly one dominant motif and no more than two supporting elements. Remove every object that does not strengthen the stated emotion.
- Reserve at least 60 percent of the canvas as visually quiet space. Place the motif asymmetrically unless the idea explicitly requires centered stillness.
- Use one matte surface language such as paper, soft ceramic, dry pigment, or restrained digital grain. Avoid glossy product-ad rendering.
- Limit the palette to three to five colors including the background. Use one accent no larger than roughly five percent of the canvas.
- Keep shadows faint and geometrically plausible. Gradients may be barely perceptible but must not become decorative backdrops.
- Text is opt-in. Render only exact user wording, in one short line, when requested and reliable; otherwise no text.

## 硬性禁止项

Reject clutter, multiple competing focal objects, busy scenery, saturated gradient fields, glossy 3D spectacle, heavy drop shadows, arbitrary symbolism, real brands, real landmarks, copied artwork, unrequested text, pseudo-text, logos, watermarks, QR codes, UI, frames, or third-party imagery.

## 质量检查

Confirm one dominant motif, no more than two supports, at least 60 percent quiet space, restrained palette, coherent shadow, readable silhouette, and the intended mood at thumbnail size. If the image becomes decorative, cluttered, or ambiguous, regenerate at most once with a correction limited to that defect.

## 交付要求

Deliver exactly one final image through the host's native image path. Add a concise rationale naming the motif, negative-space strategy, material, and palette. Do not expose private paths or the full compiled prompt unless requested.
