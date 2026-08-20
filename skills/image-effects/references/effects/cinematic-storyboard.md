---
id: cinematic-storyboard
version: 1.0.0
title_en: Cinematic Storyboard
title_zh: 电影短片分镜
summary_en: Distill one quiet narrative premise into a coherent 3x3 cinematic sequence with clear shot progression and visual continuity.
summary_zh: 将一个安静叙事命题蒸馏为连贯的 3×3 电影序列，具有清楚的镜头推进与视觉连续性。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/cinematic-storyboard.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalogExtras.ts,LICENSE
source_sha256s: 19b9222c2b96fc77fe461e065f28e20ee7f6413c1881cf6631f4f509a7683365,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes two subject-bound cinematic storyboard prompts into a neutral self-contained narrative sequence effect.
preview_origin: Text-only image generation of a fictional night watchkeeper finding a paper lantern in an invented greenhouse with no real person or place.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: dad5f745f598b6e52d9a6dc0754505d66c34c8433bcfcf4f65a83c052bce39fb
---

## 适用场景

将一个短片主题、人物瞬间或物件线索扩展成九格电影分镜，适合气氛短片、叙事提案和镜头预演。强调同一时间线里的情绪推进，不等同于产品广告镜头表。

## 输入契约

接受非空叙事主题，或一张 JPEG/PNG 作为人物、物件或场景锚点。图片模式建立 Continuity Map，记录主体数量、轮廓、服饰或结构、地点特征、光源与关键道具；不得推断真实人物身份或地点。

## 视觉编译规则

- 固定 3×3 九格，按建立空间、发现线索、靠近、细节、转折、反应与余韵的顺序推进。
- 主体、服饰、道具、时间、天气与主光方向跨格保持一致；景别在远景、中景、特写间变化。
- 使用电影剧照语言，统一宽银幕构图倾向、色彩分级和自然颗粒；每格只表现一个明确瞬间。
- 通过视线、动作方向、构图重心或光线引导相邻镜头连续，不依赖文字解释故事。
- 保持叙事克制，九格围绕一个核心事件，不添加第二条无关支线。

## 硬性禁止项

禁止格数错误、角色换脸、服装漂移、道具消失、地点突变、光向跳变、无序蒙太奇、重复镜头、对白文字、字幕、真实品牌、水印、二维码和畸形肢体。

## 质量检查

确认九格顺序明确；人物或物件身份连续；景别有节奏；核心事件可在无文字情况下读懂；光线和色板统一；最后一格提供余韵；无品牌与水印。若连续性或叙事顺序失败，只允许一次定向重试。

## 交付要求

输出一张九格电影分镜并通过宿主原生图片通道交付。简述叙事弧线、连续性锚点与镜头节奏；不公开完整提示词、输入路径或内部参数。
