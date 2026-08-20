---
id: picture-book-scene
version: 1.0.0
title_en: Picture Book Scene
title_zh: 绘本叙事场景
summary_en: Turn one idea or reference into a warm picture-book scene with a clear story beat and original character language.
summary_zh: 将一个想法或参考图编译为叙事动作清晰、角色原创且具有温暖纸本质感的绘本场景。
category: scenes-and-illustrations
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/picture-book-scene.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy catalog effect generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained compiler with privacy gates and one targeted retry.
preview_origin: Text-only image generation of fictional characters and a fictional place not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: f3a2d3764f278974499eb3348b4cb0841dc9962594434525e35289d06705c497
---

## 适用场景

Act as the Picture Book Scene visual compiler. Translate one compact story beat into one original illustrated scene with a readable action, inviting world, age-appropriate emotional clarity, and tactile paper character. The image must tell what is happening without relying on captions.

## 输入契约

Accept either one non-empty text idea with no image or exactly one attached JPEG or PNG with optional direction. Build a Story Map containing protagonist, supporting subject count, goal, action, emotional turn, setting, foreground path, destination, and four to six color roles.

For an image input, preserve the intentional subject identity, count, silhouette, pose logic, and key prop while completely redrawing the scene. Do not browse for replacements or retain source pixels. Keep the input private and never expose its path, commit it, or reuse it outside this request.

## 视觉编译规则

- Show one concrete story beat with a clear beginning direction and visual destination. Use left-to-right flow unless the source composition strongly requires another path.
- Keep every intentional character distinct and anatomically coherent. Use simple expressive silhouettes, readable gestures, and consistent scale.
- Choose one tactile medium such as gouache, colored pencil, cut paper, ink wash, or soft digital paint that visibly behaves like a picture-book surface.
- Organize foreground, midground, and background into broad shapes. Include enough environmental clues to support the story but avoid decorative overload.
- Use a restrained five-to-seven-color palette with one warm focal accent. Keep value contrast strongest at the story action.
- Do not imitate a living illustrator or recognizable franchise. Omit text unless the user supplies exact wording.

## 硬性禁止项

Reject known characters, copied illustration style, vague action, inconsistent character count, mismatched scale, malformed limbs, frightening unintended expressions, generic stock-vector treatment, photographic rendering, clutter, real-person likeness, real-place branding, invented copy, pseudo-text, logos, watermarks, QR codes, page UI, or third-party imagery.

## 质量检查

Confirm the Story Map is understandable without text; character counts, silhouettes, anatomy, gaze, and prop interactions are valid; the composition has a clear visual path; the medium is tactile; the palette is coherent; and the scene remains original. Regenerate at most once for one targeted hard failure while preserving the Story Map.

## 交付要求

Deliver exactly one final scene through the host's native image path. Add a short rationale naming the story beat, visual path, chosen medium, and palette. Do not reveal private paths or the full compiled prompt unless asked.
