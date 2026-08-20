---
id: character-grid-portrait
version: 1.0.0
title_en: Character Grid Portrait
title_zh: 角色肖像网格
summary_en: Show one consistent fictional identity across a controlled grid of expressions, actions, eras, or styling variations.
summary_zh: 在受控网格中呈现同一虚构角色的表情、动作、时代或造型变化，同时保持身份一致。
category: avatars-and-profile
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/character-grid-portrait.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of one fictional adult not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: b19b3474496f59c839b0386a8df5388e9fd75a00c4261b9ad40cbb1d08b6891f
---

## 适用场景

Act as the Character Grid Portrait visual compiler. Present one consistent identity across a structured grid while changing exactly one primary dimension such as expression and micro-action, era and wardrobe, season, role, or lighting study. The grid is a comparative character system, not a collage of similar strangers.

Default to nine panels in a 3 by 3 grid. Use sixteen panels only when the user explicitly requests a dense expression library.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Character Map containing age range, face silhouette, feature spacing, skin or surface tone, hair shape, outfit base, markings, body framing, and four to six identity anchors. Build a Variation Map listing one distinct controlled change per panel.

For an image input, use it as a private recognition anchor and completely redraw every panel. Do not retain pixels, create a realistic face clone, browse for substitutes, expose paths, commit, redistribute, or infer another image from history.

## 视觉编译规则

- Keep the same identity, age range, facial proportions, hair silhouette, skin or surface tone, and base styling in every panel unless the chosen variation explicitly changes one of them.
- Use equal panel dimensions, thin neutral dividers, matching crop scale, and consistent rendering. Grid lines must remain visually secondary.
- Give each panel a distinct expression, action, era, or other single-axis variation. Avoid adjacent near-duplicates.
- Keep lighting and backdrop stable for expression studies. For era or environment studies, preserve white balance and portrait scale while allowing controlled contextual changes.
- Maintain gaze, hands, props, and clothing interactions without malformed anatomy. Keep background props sparse.
- Omit labels by default. Use only exact short user-supplied panel text when requested.

## 硬性禁止项

Reject identity drift, age drift, ethnicity drift, hairstyle drift outside the declared variation, face swapping, duplicate panels, inconsistent crop scale, heavy borders, clutter, malformed hands, real-person likeness without explicit private input, celebrity depiction, invented text, pseudo-text, logos, watermarks, QR codes, UI, or third-party imagery.

## 质量检查

Confirm the exact panel count, one recognizable identity, one declared variation axis, distinct panels, matched crop and rendering, valid anatomy, consistent baseline styling, and balanced grid. If identity, count, anatomy, or panel uniqueness fails, regenerate at most once with a correction limited to that failure while preserving both maps.

## 交付要求

Deliver exactly one final grid through the host's native image path. Add a concise rationale naming the identity anchors, variation axis, grid, and consistency controls. Do not expose private paths or the full compiled prompt unless requested.
