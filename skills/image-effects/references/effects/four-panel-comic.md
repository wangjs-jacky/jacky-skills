---
id: four-panel-comic
version: 1.0.0
title_en: Four Panel Comic
title_zh: 四格反转漫画
summary_en: Tell one compact setup-to-payoff story in a consistent 2x2 comic with readable action and a clear final turn.
summary_zh: 用一致的 2×2 四格漫画讲述从铺垫到回收的紧凑故事，并在末格形成清楚转折。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/four-panel-comic.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained four-panel story compiler.
preview_origin: Text-only image generation of a fictional repair apprentice and a wind-up bird with no real person, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: c8ab2ae01e83f09ca58df658891fad1506873aa0c1a5d8d887cd41565533bfed
---

## 适用场景

把一个轻量故事、笑点或情绪变化编译成标准四格漫画。适合社媒、内部通讯和角色小剧场；核心是起、承、转、合的节奏与跨格角色一致性。

## 输入契约

接受故事主题，或一张 JPEG/PNG 作为角色或物件参考并可附加方向。图片模式记录主体数量、外形、服饰、表情基线和关键道具；不推断真实身份。文字模式创建原创虚构角色，不使用公众人物或受保护角色。

## 视觉编译规则

- 固定 2×2 四个等大面板，阅读顺序从左上到右下；边框和间距统一。
- 第一格建立情境，第二格推进目标，第三格制造变化，第四格回收或反转；每格只有一个动作重点。
- 角色面部、服饰、体型、道具与画风跨格一致，表情随剧情逐步变化。
- 使用简洁漫画线条和平涂或用户指定媒介，背景只保留定位场景所需信息。
- 默认无文字；若用户提供精确短对白，每格最多一句且不得遮脸。

## 硬性禁止项

禁止格数错误、人物换脸、服装漂移、重复格、反转缺失、阅读顺序混乱、长段文字、乱码、公众人物、真实品牌、水印、二维码、畸形肢体和气泡遮挡关键动作。

## 质量检查

确认四格完整等距；故事无需解释即可读；第四格形成明确回收；角色与道具一致；动作和表情清楚；无未经提供的文字。格数或一致性失败时只允许一次定向重试。

## 交付要求

输出一张四格漫画并通过宿主原生图片通道交付。简述四拍结构与角色锚点；不披露完整提示词、输入路径或内部参数。
