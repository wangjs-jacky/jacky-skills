---
id: character-sheet
version: 1.0.0
title_en: Character Sheet
title_zh: 角色综合设定表
summary_en: Compile one original character into a coherent turnaround, expression, outfit, prop, and palette sheet.
summary_zh: 将一个原创角色编译为三视、表情、服装、道具与色板结构一致的综合设定表。
category: portraits-and-characters
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/character-sheet.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of one original fictional character not based on a real person, brand, known character, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: ca4518d27168320efdcd8cca973c945d53c248781ca6c63c0aaab08602b4f3a5
---

## 适用场景

Act as the Character Sheet visual compiler. Turn one original character idea into a production-oriented design board that proves structural consistency across views, expressions, outfit states, props, and palette. The sheet must be useful for downstream illustration or modeling, not merely decorative concept art.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Character Map containing anatomy, height ratio, face and hair geometry, clothing construction, asymmetrical features, materials, palette, expressions, outfit variants, and props.

For an image input, preserve recognition-critical structure and redesign it into a coherent sheet without retaining source pixels. Treat the image as private; do not browse, expose paths, commit, redistribute, or infer another input. Do not copy a known franchise design.

## 视觉编译规则

- Include equal-height front, side, and back full-body views with identical proportions, handedness, asymmetry, garment seams, equipment placement, and silhouette logic.
- Include six to nine expression portraits that preserve the same skull, feature spacing, hairline, markings, and age.
- Include two or three outfit variants that remain recognizably the same character and obey the same body proportions.
- Isolate two to four important props with consistent scale, construction, and material. Add four to seven unlabeled color swatches.
- Use a quiet drafting background, clean region hierarchy, and one coherent rendering style. Keep all sections fully visible and non-overlapping.
- Omit text by default. If exact user labels are requested, keep them short, legible, and outside drawings.

## 硬性禁止项

Reject mismatched turnaround heights, flipped asymmetry, changing body proportions, inconsistent face or hair, equipment migration, malformed hands, duplicate views, contradictory prop construction, dense decorative scenery, known character imitation, real-person likeness, pseudo-text, unrequested labels, logos, watermarks, QR codes, UI, or third-party imagery.

## 质量检查

Confirm one identity, three valid equal-height views, consistent handedness and asymmetry, coherent anatomy, six to nine recognizable expressions, useful outfit variants, structurally valid props, readable palette, and clean sheet hierarchy. If structure, identity, anatomy, or section count fails, regenerate at most once with a correction limited to that defect.

## 交付要求

Deliver exactly one final character sheet through the host's native image path. Add a short rationale naming the identity anchors, turnaround consistency, variant system, and palette. Do not expose private paths or the full compiled prompt unless requested.
