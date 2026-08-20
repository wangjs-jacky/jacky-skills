---
id: anime-key-visual
version: 1.0.0
title_en: Anime Key Visual
title_zh: 动漫主视觉
summary_en: Elevate one original subject into a polished anime campaign key visual with cinematic staging, stable identity, and intentional negative space.
summary_zh: 将一个原创主体提升为精致动漫活动主视觉，以电影化调度、稳定身份和有意留白为核心。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/anime-key-visual.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained anime key visual compiler.
preview_origin: Text-only image generation of a fictional young lighthouse mechanic and mechanical moths with no real person, franchise, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 76fcf6028948466581db58bf5831e1f181e7cc83bf6d3f040cd05de416764f99
---

## 适用场景

把一个原创角色、物件或场景命题编译成完成度高的动漫主视觉，适合项目封面、概念海报和叙事宣传图。它使用通用现代动画语言，不模仿具体作品、工作室或艺术家的可识别风格。

## 输入契约

接受原创主题文字，或一张 JPEG/PNG 作为主体参考并可附加氛围方向。图片模式记录主体数量、轮廓、年龄范围、发型或结构、服饰、配色与关键道具；不得推断真实身份。文字模式不得调用公众人物或受保护角色。

## 视觉编译规则

- 使用一幅完整单场景主视觉，主体占据明确视觉中心，并保留约 15–30% 可供后续排版的安静空间。
- 采用干净有层次的动画线条、受控赛璐璐或柔和厚涂、电影化景深与体积光；轮廓在缩略图中清楚。
- 角色、道具和环境共同讲述一个瞬间，最多一个主要动作，不添加无关配角。
- 色板不超过五个主要色彩角色，以一组冷暖或明暗对比建立焦点；高光不吞噬五官和结构。
- 画面默认无文字、无标志，避免生成类似现有 IP 的服装、徽记或角色特征。

## 硬性禁止项

禁止具体艺术家或工作室仿作、受保护角色、公众人物、真实品牌、海报乱码、水印、二维码、多余角色、重复肢体、错误手指、眼睛错位、服饰结构漂移和过度特效遮挡主体。

## 质量检查

确认主体原创且第一眼可读；身份锚点稳定；动作与环境逻辑一致；留白可用；色板集中；五官、手部和道具结构可信；无文字、品牌或第三方 IP。若身份或结构失败，只允许一次定向重试。

## 交付要求

输出一张动漫主视觉并通过宿主原生图片通道交付。简述主体锚点、构图焦点与色彩关系；不透露完整提示词、输入路径或内部参数。
