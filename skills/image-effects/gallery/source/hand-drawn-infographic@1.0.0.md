---
id: hand-drawn-infographic
version: 1.0.0
title_en: Hand-Drawn Infographic
title_zh: 手绘信息图
summary_en: Turn one topic or image into a clear hand-drawn explainer with a single visual flow, restrained labels, and tactile paper character.
summary_zh: 将一个主题或一张图片整理为清晰的手绘解说图，用单一视觉流、克制标签和纸面质感传达重点。
category: infographics
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/hand-drawn-infographic.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained host-native effect with explicit privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 4573c73d369a5175b1c8db225ec05795b935aa8fa7eff176e2c1d749e6b29c90
---

## 适用场景

把一个过程、结构、方法或知识主题编译成一张手绘信息图。适合步骤解释、概念拆解、轻量教学和社交媒体知识卡；重点是顺序与关系一眼可读，而不是制作数据仪表盘、工程制图或装饰性涂鸦墙。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附补充方向。无文字也无图片、超过一张图片或格式不支持时停止。图片只作为本次任务的主体、色彩和结构依据，不扫描历史消息或本地目录，不公开路径、不写入图库，也不保留额外副本。

先提取一个主标题意图、三至七个信息节点、节点顺序或层级，以及每个节点的一个可视化对象。事实、数字和引文只能来自用户输入；缺少资料时以无数据的过程或概念关系表达，不补造统计。

## 视觉编译规则

- 使用竖版 4:5 或 3:4 平面纸张构图，保持正视、留白和清晰边距，以一条主轴、环形或分支流作为唯一导航结构。
- 将内容压缩为三至七个节点，每个节点只保留一个主图标或小场景、一个编号或短标签和必要的连接箭头。图形面积应显著大于文字面积。
- 采用原创手绘墨线、克制水彩或彩铅填色，保留适量线条抖动、纸纤维和手工层次；同一张图只使用一套笔触语言。
- 从主题或输入图片提取三至五个颜色角色，保证主线、节点和强调色具有稳定语义。输入图片存在时保留主体轮廓、关键部件数量与基本色，不进行身份替换。
- 只渲染用户提供且确有必要的短文字。文字不可靠时改用编号、图标和短色条，不生成伪段落。

## 硬性禁止项

不得虚构数据、来源、步骤或引文；不得加入第二套导航逻辑、无关装饰物、密集段落、随机伪文字、品牌标记、二维码、水印、UI 卡片、照片拼贴、 glossy 3D、霓虹光效或互相冲突的插画风格。不得泄露图片路径或改变输入主体的关键数量和结构。

## 质量检查

确认画布比例正确；三至七个节点完整且顺序明确；一眼能找到入口、路径和终点；每个节点只有一个主要视觉；线条、颜色与箭头系统一致；文字短而准确或已安全省略；没有虚构事实、重复节点、裁切错误、畸形对象、品牌或水印。

若顺序、文字、主体结构或可读性出现硬失败，最多定向重试一次，只修复该缺陷并保持其他已通过部分不变。

## 交付要求

通过宿主原生图片交付路径返回一张最终信息图，并用一至三句话说明采用的导航结构、节点数量和手绘媒介。不要泄露私有路径或完整编译提示词，除非用户明确要求。
