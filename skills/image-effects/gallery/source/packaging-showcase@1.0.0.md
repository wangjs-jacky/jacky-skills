---
id: packaging-showcase
version: 1.0.0
title_en: Packaging Showcase
title_zh: 包装展示图
summary_en: Stage a coherent unbranded packaging family with one hero pack, supporting views, and commercially credible materials.
summary_zh: 展示一套连贯的无品牌包装，以一个英雄包装、少量辅助视图和可信商业材质为核心。
category: product-visuals
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/packaging-showcase.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained packaging compiler.
preview_origin: Text-only image generation of fictional seed-paper soap packaging with invented geometric marks and no real brand or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: da0a558a3cf901198b3c28518813d2de34d9fece24e9f6ddca63f66523a1cd3b
---

## 适用场景

把产品概念或现有产品参考编译成一张包装体系展示图。适合礼盒、食品、日用品与小型器物的包装提案，强调结构、材质、开合关系与系列一致性，而不是生成真实品牌设计。

## 输入契约

接受产品、包装形态和气质的文字描述，或一张 JPEG/PNG 产品参考图。图片模式保留产品身份与可见包装结构；未提供品牌资产时使用抽象几何标记和无字色块，不伪造品牌名或标签文案。

## 视觉编译规则

- 以一个打开或闭合的英雄包装为中心，最多加入两个辅助视图或内装产品，所有视图保持同一结构与色板。
- 明确纸、纸板、玻璃、金属、织物或可降解材料的厚度、折线、接缝与表面触感。
- 采用干净商业棚拍或克制场景化陈列，物体接触与阴影符合物理，开合部件不穿插。
- 版面保留呼吸感，色板不超过四个主色角色；视觉识别可用简单图形、纹理和留白表达。
- 若用户提供精确文案，只在可读尺寸下原样呈现；否则不出现文字。

## 硬性禁止项

禁止真实品牌、仿冒商标、乱码、占位词、二维码、水印、过多包装件、结构不可能的盒体、相互穿透、漂浮、材质塑料化、重复产品和不一致系列设计。

## 质量检查

确认英雄包装突出；辅助视图数量受控；材质与折叠结构可信；开合状态一致；产品与包装尺度匹配；色板统一；无未经提供的文字与品牌。结构错误时只允许一次针对性重试。

## 交付要求

输出一张包装展示图并通过宿主原生图片通道交付。简短说明包装结构、材质和系列一致性；不泄露完整提示词、私有路径或内部参数。
