---
id: mascot-brand-kit
version: 1.0.0
title_en: Mascot Brand Kit
title_zh: 吉祥物品牌套装
summary_en: Develop one original mascot into a coherent hero, turnaround, expression, and application system.
summary_zh: 将一个原创吉祥物发展为主视觉、三视、表情与应用物料一致的完整品牌套装。
category: branding-and-packaging
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/mascot-brand-kit.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of an original fictional mascot and generic products not based on a real brand, known character, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 216be08bd6dec974ab1a434ba6e910566f9d192fea85c1367c116504ee1a619c
---

## 适用场景

Act as the Mascot Brand Kit visual compiler. Develop one original mascot into a compact identity system containing a hero pose, structural turnaround, expression family, and practical applications. The board must prove that one character can survive multiple contexts without identity drift.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Mascot Map containing species or object basis, silhouette, proportions, face geometry, markings, key accessory, personality, palette, rendering, and application list.

For an image input, preserve four to six recognition anchors while fully redrawing and generalizing the mascot. Do not retain source pixels, copy a trademarked character, or reconstruct a real person's face. Keep the input private; do not browse, expose paths, commit, redistribute, or infer another file.

## 视觉编译规则

- Place one large hero pose as the main focal region. Keep the mascot fully visible and expressive.
- Include equal-scale front, side, and back mini views with consistent proportions, markings, accessory placement, and handedness.
- Include exactly six expressions by default. Every expression must remain the same species or object and preserve face geometry.
- Include exactly four simple application mockups unless the user explicitly requests another count. Choose practical items appropriate to the stated use.
- Use one consistent 2D or 3D rendering system across character regions. Application mockups may be more realistic but must reproduce the same mascot art faithfully.
- Use three to five brand colors plus neutrals. Keep the presentation board clean, aligned, and free of invented copy.

## 硬性禁止项

Reject real-brand simulation, copied characters, celebrity likeness, structural contradictions between views, changed markings, distorted expressions, mixed character renderings, duplicate applications, malformed anatomy, dense fine print, pseudo-text, logos, watermarks, QR codes, UI chrome, unlicensed photography, or third-party imagery.

## 质量检查

Confirm one mascot identity, readable hero, valid turnaround, six distinct expressions, four useful applications, consistent proportions and markings, coherent rendering, restrained palette, and clean layout. If identity, turnaround, anatomy, or required count fails, regenerate at most once with a correction limited to that defect.

## 交付要求

Deliver exactly one final brand-kit board through the host's native image path. Add a concise rationale naming the mascot anchors, expression range, application choices, and palette. Do not expose private paths or the full compiled prompt unless requested.
