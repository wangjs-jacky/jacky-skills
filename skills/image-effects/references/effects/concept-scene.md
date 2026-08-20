---
id: concept-scene
version: 1.0.0
title_en: Cinematic Concept Scene
title_zh: 电影感概念场景
summary_en: Expand one idea or reference into an original cinematic world with strong scale, atmosphere, and spatial hierarchy.
summary_zh: 将一个想法或参考图扩展为尺度鲜明、氛围完整且空间层级清楚的原创电影感世界。
category: scenes-and-illustrations
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/concept-scene.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of a fictional world and fictional people not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 284cc6ea7724d2e0db492522efa531aa353223d6b681b451eb8d89bd1628ff5a
---

## 适用场景

Act as the Cinematic Concept Scene visual compiler. Expand one world idea into a single original environment painting with a dominant scale relationship, coherent geography or architecture, one primary light source, and clear foreground, midground, and background roles.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a World Map containing premise, terrain, constructed forms, subject count, scale anchors, horizon, camera height, atmosphere, light source, palette, and safe negative-space region.

For an image input, preserve the intended subject, landmark count, spatial order, dominant silhouette, and color atmosphere without retaining source pixels. The image remains private; do not browse for replacements, expose paths, commit it, redistribute it, or infer inputs from history.

## 视觉编译规则

- Establish one dominant environmental idea and show scale through small coherent figures, vehicles, doors, paths, or repeated structures.
- Separate foreground, midground, and background by value, overlap, texture density, and atmospheric perspective. Keep the focal action in one region.
- Use one physically plausible primary light source and restrained secondary practical lights. Shadows, fog, dust, and reflections must agree with it.
- Design original geography, architecture, equipment, and clothing. Avoid direct visual quotation of films, games, agencies, or companies.
- Use broad painterly masses with detailed focal accents rather than uniform detail. Reserve one calmer area for optional later copy.
- Use a five-to-seven-color world palette plus neutrals. Text and insignia are omitted unless exact user wording is explicitly requested.

## 硬性禁止项

Reject franchise imitation, copied spacecraft or architecture, real agency or company marks, impossible scale, contradictory light sources, flat depth, excessive foreground detail, arbitrary celestial bodies, malformed figures, retained source pixels, real-person likeness, real-place branding, pseudo-text, logos, watermarks, QR codes, UI, or third-party imagery.

## 质量检查

Confirm the World Map is spatially coherent; scale reads immediately; subject and landmark counts are correct; foreground, midground, and background separate cleanly; the primary light source controls the scene; atmosphere supports depth; and all world design is original. Regenerate at most once for one targeted hard failure while preserving the World Map.

## 交付要求

Deliver exactly one final concept scene through the host's native image path. Add a short rationale naming the scale anchors, depth structure, light source, and palette. Do not reveal private paths or the full compiled prompt unless asked.
