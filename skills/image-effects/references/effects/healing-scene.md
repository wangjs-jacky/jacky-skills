---
id: healing-scene
version: 1.0.0
title_en: Healing Scene
title_zh: 治愈系日常场景
summary_en: Reframe one idea or reference as a quiet restorative moment with soft natural light and breathable illustration detail.
summary_zh: 将一个想法或参考图转化为自然柔光、细节克制且留白舒展的治愈日常场景。
category: scenes-and-illustrations
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/healing-scene.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of a fictional person and place not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: c62e7694485402a412e9a1d4e81eab3c33ff867b296a1e4b3ed0e35613eac0d6
---

## 适用场景

Act as the Healing Scene visual compiler. Express one ordinary moment as a calm, emotionally restorative illustration. The image must invite the eye to rest through gentle human or creature scale, coherent natural light, quiet environmental detail, and broad breathable space.

The effect is not limited to one subject, season, country, or medium. Select a setting and medium that support the user's idea without introducing real landmarks, celebrities, or tourism branding.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Scene Map with primary subject count, pose or action, setting, season, time, emotional temperature, three to five anchor details, light direction, and source-derived color roles.

For an image input, preserve only recognition-critical subject, count, pose logic, relative scale, and color atmosphere. Redraw the scene completely and do not retain source pixels. Treat the input as private; do not browse, expose paths, commit, redistribute, or infer another image from history.

## 视觉编译规则

- Use one clear resting point and no more than five foreground props. Secondary details support the mood rather than compete with the subject.
- Prefer side, back, or naturally occupied poses over direct staged eye contact unless the user requests a portrait.
- Choose one restrained illustration medium such as digital watercolor, gouache, colored pencil, soft ink, or layered paper texture. Do not mix more than two dominant media.
- Keep light direction physically coherent. Use soft window light, overcast light, blue-hour ambience, or a controlled warm-cool transition.
- Use four to six muted colors plus paper or atmospheric neutrals. Preserve material cues in wood, cloth, leaves, snow, ceramics, or rain without photorealistic over-rendering.
- Omit text by default. Render only exact user-supplied wording when explicitly requested and reliable.

## 硬性禁止项

Reject dramatic conflict, disaster framing, candy-saturated color, clutter, excessive props, inconsistent light, synthetic stock-vector polish, celebrity resemblance, real landmark recreation, copied franchise style, malformed anatomy, duplicate primary subjects, text not supplied by the user, pseudo-text, logos, watermarks, QR codes, UI, or third-party imagery.

## 质量检查

Confirm one coherent scene, correct subject count, intact pose and anatomy, a clear eye-resting point, consistent light, restrained palette, breathable negative space, and a genuinely calm emotional read at thumbnail size. If the result becomes dramatic, cluttered, photorealistic, or structurally broken, regenerate at most once with a correction limited to that failure.

## 交付要求

Deliver exactly one final illustration through the host's native image path. Add a short rationale naming the preserved scene anchors, selected medium, light relationship, and palette. Do not expose private paths or the full compiled prompt unless requested.
