---
id: banner-grid-2x2
version: 1.0.0
title_en: Banner Grid 2x2
title_zh: 2×2 横幅套装
summary_en: Create four independently usable campaign panels that share one visual system, product scale, and copy-safe layout.
summary_zh: 创建四张可独立使用的活动面板，共享统一视觉系统、主体尺度和文案安全区。
category: grids-and-collages
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/banner-grid-2x2.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained host-native effect with explicit privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 295f842dd087c5cbe4faa2ee86793cfc2d771866454376667080b1f6e6f838a6
---

## 适用场景

将一个系列主题编排成四张同系统、可拆分的活动横幅或社交媒体物料。适合四季、四个功能、四种口味、四段课程或四个角色状态；重点是四格各自完整，同时明显属于同一视觉家族。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。输入为空、超过一张图片或格式不支持时停止。图片只作为四格共享的主体身份、轮廓、材料与颜色锚点，不扫描历史或本地目录，不公开路径或保留副本。

编译四个互斥但并列的子主题，并为每格定义一个主主体、一个视觉差异、一个文案安全区和可选短标签。不得自行添加真实品牌、产品声明或促销数据。

## 视觉编译规则

- 输出一张方形 2×2 等分画布，四格面积相等，使用统一的浅色或深色间隙、边距和基线。
- 四格保持同一艺术语言、光线方向、主体尺度、标签位置和留白比例；每格只改变子主题对应的颜色、道具或场景线索。
- 每格必须可独立裁出并保持完整主体与安全区，重要内容不得跨越中缝，也不得依赖相邻格才能理解。
- 输入图片存在时，四格保留同一主体身份和关键几何，不得把单一主体复制成不一致的不同对象。
- 文字只使用用户给出的四个短标签或编号；不能可靠渲染时保留无字安全区，不生成伪 CTA。

## 硬性禁止项

禁止四种无关画风、四个不同品牌、主体尺度漂移、跨格主体、重复子主题、过量 CTA、真实商标、虚构产品声明、密集文字、二维码、水印、UI 控件、私有路径或无法独立裁切的构图。

## 质量检查

确认严格 2×2、四格等面积且分隔一致；每格有一个完整主视觉和安全区；四个子主题清晰不同；主体比例、光线和视觉语言统一；独立裁切无缺失；文字准确或已省略；没有品牌、虚假声明、重复格或水印。

若格数、统一性、裁切安全、主体结构或文字失败，最多定向重试一次，锁定四个子主题并只修复失败项。

## 交付要求

通过宿主原生图片交付路径返回一张最终 2×2 套装，并简述四个子主题及保持一致的视觉锚点。不要公开私有路径或完整提示词，除非用户要求。
