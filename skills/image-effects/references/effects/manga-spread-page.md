---
id: manga-spread-page
version: 1.0.0
title_en: Manga Spread Page
title_zh: 漫画跨页
summary_en: Compose one story beat as a rhythmic multi-panel manga spread with consistent characters, controlled gutters, and legible action flow.
summary_zh: 将一个故事节拍编排为富有节奏的多分镜漫画跨页，保持角色一致、装订安全和动作流清楚。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/manga-spread-page.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained manga spread compiler.
preview_origin: Text-only image generation of fictional bicycle couriers crossing an invented floating market with no real people, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 518aa09010356eb6f7110a7ad947c4151ff64a764a03dc78241559f0dca6d7e4
---

## 适用场景

把一个完整故事节拍编译成单页或跨页漫画，适合动作段落、情绪转折和章节展示。重点是分镜大小节奏、角色连续性与清楚阅读路径，不复刻具体漫画家的可识别风格。

## 输入契约

接受故事概要，或一张 JPEG/PNG 作为角色、物件或场景锚点并可附加文字方向。输入至少应能确定主角与事件。图片模式保留主体数量、轮廓、服饰和关键道具；文字模式创建原创角色，不调用公众人物或受保护角色。

## 视觉编译规则

- 使用 6–8 个大小有对比的不规则分镜；横向跨页时中央装订安全区不得切断脸、主道具或动作主线。
- 在卡片内部建立明确阅读方向，并通过视线、动作线、黑白重心和面板形状引导顺序。
- 主角五官、发型、服饰、体型与道具跨格一致；动作必须符合前后空间关系。
- 允许黑白网点、有限色平涂或用户指定媒介，但全页画风和线条语言统一。
- 默认无文字；用户提供对白时仅使用短句，气泡不得遮挡脸和关键动作。

## 硬性禁止项

禁止全页等大格、装订线切脸、阅读顺序混乱、角色换脸、服装漂移、重复分镜、动作断裂、长段文字、乱码、真实品牌、公众人物、水印、二维码和畸形肢体。

## 质量检查

确认面板数量正确且大小有节奏；阅读路径唯一；主角和道具一致；中央安全区有效；动作方向连续；文字如有则简短清楚；无仿作声明和品牌。若连续性或版面失败，只允许一次定向重试。

## 交付要求

输出一张完整漫画页或跨页并通过宿主原生图片通道交付。简述阅读方向、面板节奏和连续性锚点；不泄露完整提示词、路径或内部参数。
