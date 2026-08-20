---
id: themed-3d-icon
version: 1.0.0
title_en: Themed 3D Icon
title_zh: 主题 3D 头像图标
summary_en: Turn one idea or reference into an original single-subject 3D icon with a strong silhouette and compact theme cues.
summary_zh: 将一个想法或参考图转化为主体单一、轮廓鲜明且主题线索克制的原创 3D 头像图标。
category: avatars-and-profile
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/themed-3d-icon.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of a fictional non-human character not based on a real person, brand, known character, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: d6a672dfd332240234e2a3095d5fd5d6a53903b768d2d50a7461b57b28461e5e
---

## 适用场景

Act as the Themed 3D Icon visual compiler. Create exactly one original character or object icon that communicates a theme through silhouette, one key prop, one accessory, material finish, and a compact palette. The output must work as a small avatar, badge, or community icon.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build an Icon Map containing subject count, identity anchors, personality, expression, pose, key prop, accessory, material, base shape, backdrop, and three to five color roles.

For an image input, preserve only recognition-critical silhouette, pose, expression class, key prop, and color roles. Translate them into an original stylized 3D form without retaining source pixels or reconstructing a real person's face. Keep the input private; do not browse, expose paths, commit, redistribute, or infer another image.

## 视觉编译规则

- Use exactly one dominant subject. Default to a bust or compact full-body pose occupying 55 to 70 percent of a square canvas with at least 10 percent safe margin.
- Keep the face or primary functional surface unobstructed. Use one key prop and at most two accessories.
- Choose one coherent 3D language such as soft vinyl, clay, low-poly, voxel, resin, or gentle toon rendering. Do not mix unrelated material systems.
- Use a rounded-square, circular, or borderless square presentation with a quiet radial or matte background and no interface chrome.
- Limit the palette to three to five dominant colors plus neutrals. Use a clean key light and restrained rim light that preserve the silhouette.
- Omit text and marks by default. If the user supplies exact short text, keep it secondary and outside the face.

## 硬性禁止项

Reject real-person likeness, celebrity caricature, known character imitation, franchise-specific rendering, real trademarks, excessive props, obscured face, multiple subjects, photorealistic human skin, mixed scale, malformed anatomy, unreadable micro-detail, pseudo-text, logos, watermarks, QR codes, UI chrome, or third-party imagery.

## 质量检查

Confirm one subject, a readable thumbnail silhouette, preserved Icon Map anchors, coherent material, safe margins, face visibility, consistent light, restrained palette, and original design. If identity, anatomy, subject count, or silhouette fails, regenerate at most once with a correction limited to that defect.

## 交付要求

Deliver exactly one final icon through the host's native image path. Add a concise rationale naming the identity anchors, material language, key prop, and palette. Do not expose private paths or the full compiled prompt unless requested.
