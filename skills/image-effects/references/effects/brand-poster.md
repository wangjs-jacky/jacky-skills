---
id: brand-poster
version: 1.0.0
title_en: Brand Poster
title_zh: 品牌主视觉海报
summary_en: Distill one subject into a bold poster with a single hero, disciplined identity cues, and a copy-safe brand block.
summary_zh: 将一个主体提炼成醒目的品牌海报，以单一主视觉、克制识别线索和文案安全区构建冲击力。
category: poster-and-campaigns
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/brand-poster.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained host-native effect with explicit rights privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 6e84041549b9a00ee411ebbbe30c515b19008873d785a9bea255b7d300ffb73c
---

## 适用场景

把一个产品、角色、活动或抽象主题提炼为一张单一主视觉的品牌海报。适合概念提案、发布预热、系列识别和社交媒体封面；目标是用一个强轮廓、一套色彩和一个文案区建立识别，不是展示完整品牌手册或销售详情页。

## 输入契约

接受非空文字主题且零图片，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。输入缺失、图片超过一张或格式不支持时停止。输入图片只用于本次任务的主体轮廓、结构、材质与色彩，不扫描历史附件、不泄露路径或保留副本。

文字模式使用原创虚构主体，除非用户明确提供其拥有使用权的品牌或资产。品牌名、标题、标语和产品声明只使用用户给出的原文；未提供时使用无字识别块或一个明确标注为虚构的短标题，不仿造真实品牌。

## 视觉编译规则

- 使用 4:5、3:4 或 2:3 竖版，建立一个占视觉权重 45–70% 的主主体，以及一个清晰但不压主体的品牌或标题区。
- 从主体提取一个强轮廓、二至四个颜色角色和一种材料或光线语言。全部辅助几何必须服务于主轮廓，不再增加第二英雄对象。
- 输入图片存在时保留主体数量、比例、关键部件、颜色和身份；可以改变背景与媒介，但不得重设计受保护标识。
- 采用摄影、插画或 3D 中的一种主媒介，确保在缩略图中仍能读出主体和色彩锚点。
- 文字仅渲染用户提供的短标题、品牌名或标语；无法可靠呈现时保留安全区，不生成伪字或 CTA。

## 硬性禁止项

禁止未经提供的真实品牌、商标、公众人物、受保护角色、虚假产品声明、第二主视觉、复杂品牌手册、密集文案、多个 CTA、二维码、水印、签名、社交 UI、无关道具、私有路径或对输入标识的擅自改造。

## 质量检查

确认只有一个英雄主体；主体在缩略图中清晰；版式有明确标题安全区；轮廓、比例、部件和颜色准确；媒介统一；用户文字准确或已省略；无真实品牌借用、虚假声明、额外主角、畸形、二维码或水印。

若主体结构、标题、单一焦点或权利边界失败，最多定向重试一次，锁定主轮廓并只修复失败项。

## 交付要求

通过宿主原生图片交付路径返回一张最终品牌海报，并简述英雄主体、识别色和标题区。不要公开私有路径或完整提示词，除非用户要求。
