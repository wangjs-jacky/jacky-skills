---
id: bento-memory-card
version: 1.0.0
title_en: Bento Memory Card
title_zh: Bento 记忆卡
summary_en: Preserve one moment as a warm seven-to-eight-module memory card built from a hero scene, details, palette, and quiet notes.
summary_zh: 将一个瞬间保存为温暖的七至八模块记忆卡，由主场景、细节、色板和克制记录共同构成。
category: grids-and-collages
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/bento-memory-card.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalogExtras.ts,LICENSE
source_sha256s: 19b9222c2b96fc77fe461e065f28e20ee7f6413c1881cf6631f4f509a7683365,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy subject-bound reference prompt into a subject-neutral self-contained memory-card effect with explicit privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: aaf7da2e44e13ef096baefb10936294aa19519fa9378e897cc667484e4b8c423
---

## 适用场景

把一个私人瞬间、日常场景、物件或短主题整理成温暖的 Bento 记忆卡。适合纪念一段氛围、旅行片段、居家角落、宠物之外的任意主体或小型创作记录；目标是视觉化保存记忆，不是制作信息仪表盘或素材拼贴墙。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。无有效输入、超过一张图片或格式不支持时停止。图片仅用于本次记忆卡，提取主场景、三至五个真实细节、色板和情绪线索；不扫描历史、不公开路径、不写入图库或保留额外副本。

文字模式将主题具体化为一个原创虚构瞬间，并选择一个主场景、三至五个关联细节和一组色彩。日期、地点、人物身份与文字只能使用用户明确给出的内容；没有时省略或使用抽象标记，不自行补造。

## 视觉编译规则

- 使用方形或 4:5 画布，建立七至八个统一圆角的非对称 Bento 模块，保持温暖底色、窄缝和清晰外边距。
- 一个主模块占约 40–55%，完整呈现记忆核心；其余模块从局部细节、材质、色板、光线、天气、图标和短记录中选择，且每格角色不同。
- 保持所有模块属于同一时间、空间与色温。输入图片存在时，主模块不得更换主体、人物身份、地点结构或关键物件；局部模块只能放大真实可见细节。
- 采用编辑摄影、温和插画或两者协调融合，加入轻纸感或日记感，但不使用随机贴纸和装饰垃圾。
- 只渲染用户提供的日期、地点或一至三个短词；无法准确渲染时用色条、图标或留白替代。

## 硬性禁止项

禁止虚构用户经历、日期、地点、人物姓名或私人信息；禁止更换输入主体、添加无关纪念物、重复同一照片、素材堆叠、社交媒体 UI、应用仪表盘、过量贴纸、密集文案、品牌、二维码、水印或私有路径。

## 质量检查

确认七至八个模块齐全且一个主模块明确；全部模块共享同一瞬间和色温；辅助格角色不重复；输入主体与事实保持真实；文字准确或已省略；圆角、间距和边界一致；没有虚构经历、无关物件、品牌或水印。

若主体真实性、模块数量、共同氛围或文字出现硬失败，最多定向重试一次，固定记忆清单并只修复失败项。

## 交付要求

通过宿主原生图片交付路径返回一张最终记忆卡，并简述主模块、细节模块和色板来源。不要披露私有路径或完整提示词，除非用户明确要求。
