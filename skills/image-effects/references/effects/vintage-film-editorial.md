---
id: vintage-film-editorial
version: 1.0.0
title_en: Vintage Film Editorial
title_zh: 复古胶片编辑影像
summary_en: Reframe one idea or reference image as a restrained 35mm editorial still with warm halation, tactile grain, and natural atmosphere.
summary_zh: 将一个主题或一张参考图重构为克制的 35mm 编辑影像，以暖色晕光、可感颗粒和自然氛围为核心。
category: editing-workflows
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/vintage-film-editorial.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalogExtras.ts,LICENSE
source_sha256s: 19b9222c2b96fc77fe461e065f28e20ee7f6413c1881cf6631f4f509a7683365,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a subject-bound café prompt into a neutral self-contained editorial effect for arbitrary subjects.
preview_origin: Text-only image generation of a fictional neighborhood flower shop at dusk with no real place, person, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 96715e7d0b238f31f6859fd71a2eb5c8fee5c6d1108556d27a0408ee8d8b2ac1
---

## 适用场景

把一个日常主题、产品、空间或一张参考图编译成一幅有真实摄影质感的复古 35mm 编辑影像。适合生活方式内容、文化栏目、品牌氛围图和故事封面；重点是可信场景与胶片气质，不是模拟某一具体胶片品牌或摄影师。

## 输入契约

接受非空文字主题，或一张明确附加的 JPEG/PNG。文字模式先提取主体、环境、时间与情绪；图片模式保留主体身份、关键轮廓、构图关系和必要道具，但允许清理水印、时间戳与无关杂物。不得猜测缺失品牌、地点或人物身份。

## 视觉编译规则

- 形成一幅连贯的单帧摄影画面，默认横向或 4:5 编辑裁切，不做拼贴与前后对比。
- 使用自然环境光或柔和实景灯光，保留合理阴影、材质纹理与浅景深；主体必须清楚，背景适度柔化。
- 色彩以暖中性色为主，加入轻微高光晕染、细腻颗粒、适度黑位抬升和自然色偏；效果克制，不遮盖信息。
- 场景要有生活痕迹但不杂乱，最多保留三类支持主体的道具；不得凭空添加品牌物件。
- 除非用户明确提供文案，否则画面不出现可读文字。

## 硬性禁止项

禁止真实品牌标识、摄影师仿作声明、时间戳、水印、二维码、随机可读文字、过度漏光、重度褪色、塑料般磨皮、失真的几何与重复主体。图片输入时不得改变主体种类、数量或关键身份特征。

## 质量检查

确认主体在缩略图中可辨；胶片颗粒与晕光仅作为质感层；暗部仍有细节；颜色自然且没有单色滤镜压死；背景道具支持叙事；无品牌、无水印、无伪文字。若首次结果像廉价滤镜或主体漂移，只允许一次针对性重试。

## 交付要求

输出且仅输出一张完成图，通过宿主原生图片通道交付。简短说明保留了哪些主体锚点，以及光线、颗粒和色彩如何共同形成复古编辑气质；不泄露私有输入路径或完整内部提示词。
