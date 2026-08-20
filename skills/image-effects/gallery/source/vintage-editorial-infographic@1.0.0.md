---
id: vintage-editorial-infographic
version: 1.0.0
title_en: Vintage Editorial Infographic
title_zh: 复古编辑信息图
summary_en: Compile a topic or image into a sparse archival infographic with engraved motifs, disciplined ink, and evidence-safe diagrams.
summary_zh: 将主题或图片编译成稀疏的档案式信息图，以雕版母题、克制油墨和不虚构依据的图解构成。
category: infographics
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/vintage-editorial-infographic.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalogExtras.ts,LICENSE
source_sha256s: 19b9222c2b96fc77fe461e065f28e20ee7f6413c1881cf6631f4f509a7683365,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes a Happy subject-bound reference prompt into a subject-neutral self-contained archival infographic effect with explicit evidence privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 0265dd1bea1694a53530232684635dae776b07a3f10b448a8f5a3618b128c997
---

## 适用场景

把一个有明确主体的知识主题或图片转成复古编辑信息图，适合自然物、器物、工艺、配方结构、历史风格概念和档案式说明。目标是用中央雕版母题、少量分解图和顺序关系建立可信的旧刊物气质，不是仿造真实博物馆藏页或伪造年代证据。

## 输入契约

接受非空文字主题且零图片，或一张当前请求明确附带的 JPEG 或 PNG 并可附补充方向。输入缺失、图片超过一张或格式不支持时停止。图片只用于本次构图和主体提取，不读取历史附件、不暴露路径、不写入图库。

从输入提取一个中央主体、二至五个可验证的组成或阶段，以及用户明确给出的标题、标签和数据。没有可靠数据时只做结构、阶段或材质示意，并将其视为概念图，不创建虚假年份、数值、机构、物种或引文。

## 视觉编译规则

- 使用 3:4 或 4:5 竖版暖白、米黄或轻旧化纸张，保持正视扫描感和细致但克制的边缘磨损。
- 以中央雕版或细线插画为主，占页面约 35–55%；周围安排二至五个小型分解图、阶段框、切面或色板，并由细线、编号或箭头连接。
- 采用深咖、炭黑或海军蓝单一主墨色，加一处铜、砖红或苔绿强调色。使用版画排线、letterpress 轻微错位和纸张纤维，但不牺牲轮廓。
- 文字只取用户提供的准确短标题和短标签；若可靠文字渲染不可用，保留编号、图标和空白标签框，不生成伪史料。
- 输入图片存在时，中央主体保留轮廓、关键部件数量、材质和识别色，复古化只改变媒介，不改变事实结构。

## 硬性禁止项

不得复制具体真实档案页、邮票、馆藏章或出版物版式；不得虚构年代、地名、机构、物种、统计、引文或来源。禁止密集段落、随机伪文字、现代 UI 卡片、玻璃拟态、照片背景、霓虹、品牌、二维码、水印、签名和私有路径。

## 质量检查

确认纸张、墨色和版画语言统一；中央主体明确；二至五个辅助图各有独立作用；连接关系可读；所有事实和文字来自输入或已省略；输入主体结构未被改写；缩略图中仍能区分主图与辅助图；不存在伪史料、品牌、水印或构图溢出。

若主体结构、文字、事实边界或阅读顺序失败，最多定向重试一次，只纠正该项并保持其余布局。

## 交付要求

通过宿主原生图片交付路径返回一张最终复古信息图，并简述中央母题、辅助图类型和墨色选择。除非用户要求，不披露私有路径或完整提示词。
