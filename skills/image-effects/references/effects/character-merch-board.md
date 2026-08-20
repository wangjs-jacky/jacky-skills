---
id: character-merch-board
version: 1.0.0
title_en: Character Merchandise Board
title_zh: 角色周边商品板
summary_en: Apply one consistent original character across a balanced editorial board of practical merchandise mockups.
summary_zh: 将一个原创角色稳定应用到一组实用周边商品，并组织为清晰平衡的编辑商品板。
category: branding-and-packaging
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/character-merch-board.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalogExtras.ts,LICENSE
source_sha256s: 19b9222c2b96fc77fe461e065f28e20ee7f6413c1881cf6631f4f509a7683365,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the subject-bound Happy reference prompt into a reusable subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of an original fictional character and generic products not based on a real brand, known character, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 6cf409e71427181440c06393e267df0d780cc02811000742caaddd17f514558b
---

## 适用场景

Act as the Character Merchandise Board visual compiler. Apply one original character identity across a coherent editorial catalog of practical merchandise. The board must demonstrate manufacturing-aware product variety while keeping the character silhouette, markings, palette, and line language stable.

Default to exactly eight product groups consisting of a plush toy, enamel pin, sticker mini-pack, mug, tote bag, phone wallpaper, postcard, and acrylic keychain. Replace an item only when the user explicitly requests another product.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Character Map containing silhouette, proportions, face geometry, markings, palette, accessory, line language, and allowed pose variants. Build a Product Map containing exactly eight groups, material, print area, scale, and display angle.

For an image input, preserve four to six recognition anchors while fully redrawing the character for merchandise. Do not retain source pixels, copy a known character, or reconstruct a real-person likeness. Keep the input private; do not browse, expose paths, commit, redistribute, or infer another image.

## 视觉编译规则

- Use exactly eight product groups by default. A multi-sticker mini-pack counts as one group and must remain visually contained.
- Keep the character's silhouette, facial geometry, markings, accessory, and color assignments consistent across every product.
- Adapt pose and crop to each print area without changing identity. Respect product curvature, seams, edge clearance, and plausible print or attachment methods.
- Present products in a balanced modular editorial layout with clean spacing, coherent scale, and soft studio grounding shadows.
- Use generic unbranded product forms and a restrained three-to-five-color character palette plus neutral materials.
- Render no text by default. If the user provides exact short copy, place it only where the product format supports legible reproduction.

## 硬性禁止项

Reject extra or missing product groups, duplicate products, identity drift, inconsistent markings, implausible product geometry, artwork crossing seams incorrectly, copied characters, real brands, celebrity likeness, dense fake catalog copy, pseudo-text, logos, watermarks, QR codes, unrelated props, clutter, UI chrome, or third-party imagery.

## 质量检查

Confirm exactly eight product groups, one stable character identity, coherent pose adaptations, plausible materials and print placement, balanced layout, restrained palette, readable silhouettes, and no accidental branding. If count, identity, product geometry, or artwork placement fails, regenerate at most once with a correction limited to that defect while preserving both maps.

## 交付要求

Deliver exactly one final merchandise board through the host's native image path. Add a short rationale naming the character anchors, eight product groups, material adaptations, and palette. Do not expose private paths or the full compiled prompt unless requested.
