---
id: step-by-step-infographic
version: 1.0.0
title_en: Step by Step Infographic
title_zh: 步骤教程信息图
summary_en: Turn one practical process into a visual-first ordered infographic with concise stages, clear connectors, and a strong final outcome.
summary_zh: 将一个实用流程转为视觉优先的有序信息图，以简洁阶段、清楚连接和突出结果为核心。
category: infographics
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/step-by-step-infographic.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained process infographic compiler.
preview_origin: Text-only image generation of a fictional five-step desk terrarium assembly using generic materials and no third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 709701cc576d7ff7d4918dd7e0a295e6f37fc6f64898214dacf945b1638dd9c1
---

## 适用场景

把一个操作、制作、设置或变化过程编译成一张纵向步骤信息图，适合教程、说明卡和社媒长图。重点是视觉顺序与动作差异，不替代必须精确合规的专业说明书。

## 输入契约

接受包含目标和阶段的文字，或一张 JPEG/PNG 作为最终对象参考并可附加步骤方向。图片模式只保留对象结构与外观锚点，不反向推断未知步骤。缺少精确数据时使用概念性动作，不虚构数值、剂量或安全结论。

## 视觉编译规则

- 使用 4–6 个连续编号步骤，默认纵向之字或单列路径，由清楚箭头连接；阅读起点与终点必须明确。
- 每步只包含一个主动作、一个小插图和最多一行短标签；最终结果用更大图像收束。
- 视觉风格在全图一致，可使用温暖手绘、干净扁平插画或用户指定媒介；背景留白充足。
- 对象状态必须按步骤真实变化，工具和部件数量保持连续，箭头不得交叉造成歧义。
- 色板从主题提取 3–5 个角色色，编号、箭头和重点色保持统一。

## 硬性禁止项

禁止跳号、重复编号、箭头断裂或回指、动作顺序矛盾、同一步多个时间点、密集长文、乱码、真实品牌、二维码、水印、额外部件和最终结果缺失。

## 质量检查

确认步骤数量和顺序正确；箭头路径唯一；各步状态差异清楚；短标签可辨；最终结果突出；风格、对象与色板一致；无品牌和水印。编号或顺序失败时只允许一次定向重试。

## 交付要求

输出一张完整步骤信息图并通过宿主原生图片通道交付。简述步骤数量、连接路径和最终结果锚点；不公开完整提示词、输入路径或内部参数。
