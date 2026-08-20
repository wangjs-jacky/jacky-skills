---
id: sticker-set
version: 1.0.0
title_en: Sticker Set
title_zh: 角色贴纸套组
summary_en: Expand one idea or reference into a cohesive sheet of separately cuttable character stickers with consistent identity.
summary_zh: 将一个想法或参考图扩展为角色身份一致、姿态多样且可独立裁切的完整贴纸套组。
category: avatars-and-profile
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/sticker-set.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of an original fictional character not based on a real person, brand, known character, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 3f2282bf7c3dece35d75c2dea475ee1e85c79c6bd8aaa96ef8b4feeef3e3307c
---

## 适用场景

Act as the Sticker Set visual compiler. Expand one character or motif into one cohesive sheet of separately cuttable stickers. Every sticker must preserve the same identity system while changing pose, expression, action, or prop clearly enough to be useful on its own.

Default to twelve stickers in a 4 by 3 grid. If the user explicitly requests another count from six to sixteen, use that count and choose a balanced layout.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Character Map containing subject count, silhouette, face geometry, markings, palette, outfit, key accessory, line language, border treatment, and the requested action list.

For an image input, preserve four to six recognition anchors while completely redrawing the character. Do not retain source pixels. Treat the input as private; do not browse, expose paths, commit, redistribute, or infer another image from history.

## 视觉编译规则

- Use one recurring character identity unless the user explicitly defines a fixed pair. Keep proportions, markings, colors, outfit, and accessory placement consistent.
- Give each sticker one readable action or expression. Avoid near-duplicate poses and distribute visual weight across the sheet.
- Use a consistent line weight, rendering method, and die-cut border. The default border is warm white or cream and thick enough to remain visible at thumbnail size.
- Keep stickers fully separated with generous gaps. No border may touch another sticker or the canvas edge.
- Use four to six dominant colors plus the border and neutral outline. Background must be plain and quiet.
- Text is omitted by default. Use only exact short user-supplied words and never invent speech bubbles.

## 硬性禁止项

Reject changed identity, inconsistent markings, duplicate poses, clipped borders, overlapping stickers, unknown extra characters, malformed limbs, copied franchise characters, celebrity likeness, real brands, pseudo-text, unrequested captions, logos, watermarks, QR codes, busy scenery, UI, or third-party imagery.

## 质量检查

Confirm the requested count, recurring identity, unique actions, consistent line and palette, complete die-cut borders, adequate separation, coherent anatomy, and sheet balance. If count, identity, anatomy, or cutability fails, regenerate at most once with a correction limited to that defect.

## 交付要求

Deliver exactly one final sticker sheet through the host's native image path. Add a short rationale naming the identity anchors, action range, border treatment, and palette. Do not reveal private paths or the full compiled prompt unless asked.
