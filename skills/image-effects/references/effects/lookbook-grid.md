---
id: lookbook-grid
version: 1.0.0
title_en: Lookbook Grid
title_zh: Lookbook 造型网格
summary_en: Build a coherent six-to-nine-panel lookbook with a stable subject, distinct looks, and disciplined editorial spacing.
summary_zh: 构建六至九格的连贯造型册，以稳定主体、清晰差异和克制的编辑间距呈现系列。
category: grids-and-collages
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/lookbook-grid.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained host-native effect with explicit identity privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 64434921ba8d70a32e761d7b6e92959cef988c0d85e02d48176bd7e1ec27ca7f
---

## 适用场景

把一个人物、角色、产品或造型主题整理为六至九格 Lookbook，用一致主体展示有节奏的造型、配色或使用场景变化。适合服装系列、角色服设、产品系列和生活方式策划；不适合叙事漫画、随机情绪板或多个无关人物合辑。

## 输入契约

接受非空文字主题且零图片，或一张当前请求明确附带的 JPEG 或 PNG 并可附补充方向。输入缺失、超过一张图片或格式不支持时停止。输入图片只用于建立同一主体的脸型或轮廓、发型或部件、比例、材质和色彩锚点，不读取历史附件、不公开路径、不保存副本。

文字模式必须使用原创虚构人物、角色或产品，并定义稳定锚点；不得借用公众人物、受保护角色或真实品牌。编译六至九个差异明确的 look，每个 look 只改变造型、配色、搭配或场景，不改变主体身份。

## 视觉编译规则

- 使用 3:4、4:5 或方形画布，将六至九格排为规则或轻微错位的编辑网格；统一背景、光线、镜头高度、边距和窄缝。
- 每格保留同一主体、脸型或轮廓、发型或关键部件、体型或比例与主要识别色。人物优先全身或膝上完整构图，不裁头；产品保持视角和尺度可比。
- 各格差异必须来自服装、材料、配色、配件或明确场景变化，至少相邻两格不能重复同一组合。
- 采用一套统一的时尚摄影、编辑插画或产品目录语言，允许轻颗粒，但不得逐格换风格。
- 文字只使用编号、日期或用户给出的短标签；不能准确渲染时省略文字，保持留白。

## 硬性禁止项

禁止六至九个不同身份、公众人物仿像、真实品牌服饰标识、受保护角色、重复造型、裁头、畸形手脚、产品结构漂移、逐格不同画风、密集文案、社交媒体 UI、二维码、水印、私有路径或无关道具堆叠。

## 质量检查

确认格数为六至九；同一主体在全部格中可辨；至少四个身份或结构锚点稳定；每格造型差异明确；背景、光线和尺度一致；主体无遮挡和异常裁切；文字准确或已省略；没有真实品牌、公众人物、重复造型或水印。

若身份、格数、造型差异、人体或产品结构失败，最多定向重试一次，只修复失败格并保持系列一致性。

## 交付要求

通过宿主原生图片交付路径返回一张最终 Lookbook，并简述格数、稳定锚点和系列变化逻辑。除非用户明确要求，不泄露私有路径或完整提示词。
