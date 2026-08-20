---
id: retro-skeuomorphic-icons
version: 1.0.0
title_en: Retro Skeuomorphic Icons
title_zh: 复古拟物图标集
summary_en: Turn one idea or reference into a coherent grid of tactile glass, metal, paper, and leather icons.
summary_zh: 将一个想法或参考图编译为玻璃、金属、纸张与皮革质感统一的复古拟物图标集。
category: assets-and-props
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/retro-skeuomorphic-icons.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of fictional utility objects not based on a real brand or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 55fa95d124b6fa763debb81894f3847d111ed1d514118bad2a55acc12ba311aa
---

## 适用场景

Act as the Retro Skeuomorphic Icons visual compiler. Turn one theme into exactly one presentation board of coherent tactile icons. The result should feel like a premium late-2000s theme pack built from physical metaphors, not a collection of unrelated 3D objects.

Default to twelve icons in a 4 by 3 grid. If the user explicitly gives another count from four to sixteen, use that count and choose the smallest balanced grid. Keep every icon original and semantically distinct.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. With text, derive a compact Theme Map containing audience, icon concepts, material family, palette, base shape, grid, and label policy. With an image, use it only to infer subject concepts, color roles, and tactile cues; never retain source pixels or reproduce a protected mark.

The input is private task material. Do not browse for substitutes, infer an image from history, expose a local path, commit the input, or reuse it outside this request. If the user supplies exact short labels, reproduce only those labels; otherwise render no text.

## 视觉编译规则

- Use one consistent rounded-square or superellipse base, camera angle, upper-left key light, bevel depth, shadow softness, and safe margin across the set.
- Build convincing tactile layers from glossy glass, brushed metal, stitched leather, paper, enamel, or restrained translucent resin. Use no more than four material families in one set.
- Make each icon readable at thumbnail size through one dominant silhouette and at most two supporting details. Keep objects centered and baseline aligned.
- Use a restrained palette of four to six dominant colors plus neutrals. Reflections and highlights must follow the same light direction.
- Keep the backdrop quiet and material-compatible. It may use subtle linen, paper, or matte fabric texture but no scene, device frame, or interface chrome.
- When labels are requested, place one exact short label beneath each icon with consistent typography and no extra copy.

## 硬性禁止项

Reject copied operating-system icons, real app marks, trademarks, brand color lockups, mixed camera angles, inconsistent corner radii, floating objects without grounding, excessive reflections, unreadable micro-detail, duplicate concepts, malformed mechanisms, unrequested text, pseudo-text, logos, watermarks, QR codes, device UI, or third-party imagery.

## 质量检查

Confirm the requested icon count, balanced grid, unique concepts, shared base geometry, shared light direction, aligned scale, restrained palette, plausible materials, complete silhouettes, and readable thumbnail hierarchy. If one hard failure appears, regenerate at most once with a correction limited to that defect while preserving the Theme Map.

## 交付要求

Deliver exactly one final icon board through the host's native image path. Add a concise rationale naming the material family, palette, grid, and consistency anchors. Do not expose the private input path or full compiled prompt unless requested.
