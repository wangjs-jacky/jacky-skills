---
id: recipe-process-flowchart
version: 1.0.0
title_en: Recipe Process Flowchart
title_zh: 食谱流程图
summary_en: Compile one recipe into an illustrated, ordered cooking flow with ingredients, concise steps, and a clear finished dish.
summary_zh: 将一道食谱编译为有序的插画烹饪流程，包含食材、简洁步骤和清楚的成品。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/recipe-process-flowchart.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained recipe compiler.
preview_origin: Text-only image generation of a fictional six-step roasted pear recipe using generic ingredients and no third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 306b3700e582ac958090b468aed5c3a7f076ece4a9563372cd5bc3563d16a7ae
---

## 适用场景

将一份可执行食谱整理为一张视觉化流程图，适合教程卡、家庭食谱、菜单附页和社媒长图。它强调烹饪顺序、食材对应与成品回收，不承担营养或医疗建议。

## 输入契约

接受包含菜名和基本步骤的文字，或一张成品 JPEG/PNG 配合文字方向。图片模式只把成品外观作为视觉锚点，不反向猜测配方。若步骤缺失，可生成概念性流程，但不得虚构精确温度、剂量、过敏声明或安全结论。

## 视觉编译规则

- 使用 4–7 个按顺序编号的步骤，阅读方向单一明确；每步一个主要动作与一个小插图。
- 顶部或侧边设置精简食材区，食材图标与步骤中出现的材料一致；底部用较大成品图收束。
- 采用温暖手绘、水彩、扁平插画或用户指定风格，纸面留白充足，色板从食材自然颜色提取。
- 文本只保留菜名、连续编号和每步不超过一行的短标签；用户未提供精确文案时不生成长段说明。
- 器具、动作和食材状态必须随步骤合理变化，避免跳步与倒序。

## 硬性禁止项

禁止跳号、重复编号、步骤顺序矛盾、食材与动作不对应、危险操作、虚构精确数据、不可读密文、真实品牌、二维码、水印、额外成品和与主题无关的器械。

## 质量检查

确认步骤连续；阅读路径一眼可懂；每步只有一个核心动作；食材区与流程一致；成品清楚且与输入锚点相符；标签简短可辨；无品牌与水印。若顺序或编号失败，只允许一次定向重试。

## 交付要求

输出一张完整食谱流程图并通过宿主原生图片通道交付。简述步骤数量、阅读路径和成品锚点；不披露完整提示词、输入路径或内部参数。
