---
id: product-tvc-storyboard
version: 1.0.0
title_en: Product TVC Storyboard
title_zh: 产品 TVC 分镜
summary_en: Turn one product proposition into a consistent 3x3 advertising storyboard from context and tactile detail to the final hero reveal.
summary_zh: 将一个产品命题转为一致的 3×3 广告分镜，从场景与触感细节推进到最终英雄展示。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/product-tvc-storyboard.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalogExtras.ts,LICENSE
source_sha256s: 19b9222c2b96fc77fe461e065f28e20ee7f6413c1881cf6631f4f509a7683365,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a subject-bound product storyboard prompt into a neutral self-contained advertising sequence effect.
preview_origin: Text-only image generation of a fictional compact tabletop radio campaign with no real brand, person, place, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 7e9c456edab916e0b09ffcda4cb5605c2e5394d329d572ef806d52082a2037c3
---

## 适用场景

把一个产品卖点编译成六格 TVC 广告分镜，用于创意提案、镜头规划和产品短片预览。它关注产品、材质、使用动作与安静收尾，不替代精确拍摄脚本和时码表。

## 输入契约

接受产品与传播目标的文字描述，或一张 JPEG/PNG 产品参考图。图片模式建立 Product Map，记录结构、颜色、材质、标签位置、配件和不可变化特征；文字模式使用无品牌虚构产品。没有人物要求时只用手部或无人镜头。

## 视觉编译规则

- 固定为 3×2 六格，按场景建立、材质特写、产品揭示、功能动作、干净包装镜头与留白收尾推进。
- 六格中的产品形状、颜色、比例和配件必须一致；镜头景别从广角到微距有节奏变化。
- 使用同一套电影级光线与色彩方案，薄分隔线整齐，画面方向与动作连续。
- 每格只承担一个镜头意图，避免同格塞入多个时间点；倒数第二格是清楚的产品英雄画面，最终格保留安静负空间。
- 不生成对白、字幕或广告语；若用户提供精确标语，也优先留出排版空间而非让模型渲染长文。

## 硬性禁止项

禁止产品跨格变形、颜色漂移、格数错误、重复镜头、无序跳切、真实品牌、虚构标签、可读乱码、水印、二维码、错误手指、突变光向和缺失英雄收尾。

## 质量检查

确认六格完整且严格排列为 3×2；产品身份一致；镜头从环境到细节再到收尾有节奏；每格意图唯一；光线与色板连续；英雄镜头和留白收尾清楚；无文字和品牌。若一致性或格数失败，只允许一次定向重试。

## 交付要求

输出一张 3×2 六格 TVC 分镜并通过宿主原生图片通道交付。简述镜头弧线、产品锚点和光线连续性；不泄露完整提示词、输入路径或内部参数。
