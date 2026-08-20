---
id: lifestyle-product-scene
version: 1.0.0
title_en: Lifestyle Product Scene
title_zh: 生活方式产品场景
summary_en: Place one product in a believable everyday setting where light, props, and use context support the hero without overpowering it.
summary_zh: 将一个产品置于可信日常场景，让光线、道具与使用语境共同支持主体而不喧宾夺主。
category: product-visuals
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/lifestyle-product-scene.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained lifestyle effect.
preview_origin: Text-only image generation of a fictional linen-bound portable radio in an invented quiet reading nook with no real brand or place.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 6b7d598116a77c7b31488fc245ce0d2da4dd7f00e3a1d4b3f69259e525b3752f
---

## 适用场景

将产品放进可相信、可使用的日常环境，生成生活方式广告图、社媒内容或产品故事图。场景负责解释使用语境，产品仍是唯一视觉主角。

## 输入契约

接受产品与使用场景的文字描述，或一张明确附加的产品图。图片模式保留产品结构、颜色、材质与配件关系；文字未指定环境时，选择与功能最自然的普通室内或户外情境，不推断地点和品牌。

## 视觉编译规则

- 建立一个现实可用的场景，产品占画面约 30–55%，位于视觉焦点并保持完整轮廓。
- 使用自然窗光、晨昏光或柔和室内灯，产品曝光准确，背景景深与视线共同引导主体。
- 最多加入三类支持使用语境的无品牌道具，保持真实尺度、接触关系和合理磨损。
- 色板从产品与环境材质中提取，控制在四个主要色彩角色；画面温度与用户情绪一致。
- 有人物需求时只表现自然使用动作，不生成可识别公众人物；未要求人物时保持无人。

## 硬性禁止项

禁止真实品牌、地点标识、虚构标签、随机文字、水印、二维码、堆满道具、产品缩成背景、错误用途、悬浮、透视冲突、重复产品、肢体畸形和无依据的豪华陈设。

## 质量检查

确认主体第一眼可见；场景能够解释用途；道具数量受控；光向与阴影统一；尺度和接触可信；产品锚点未漂移；无品牌和文字。若主体被环境压制或结构错误，只允许一次定向重试。

## 交付要求

输出一张完整生活方式图并通过宿主原生图片通道交付。简述主体锚点、场景选择与光线逻辑；不透露完整提示词、路径或内部参数。
