---
id: bento-grid-infographic
version: 1.0.0
title_en: Bento Grid Infographic
title_zh: Bento 网格信息图
summary_en: Organize one topic or image into an asymmetric modular explainer with one dominant block and concise supporting facts.
summary_zh: 将一个主题或一张图片组织成非对称模块化解说图，以一个主模块和精简辅助信息构成清晰层级。
category: infographics
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/bento-grid-infographic.png
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
preview_sha256: d2fb0b983020c435c648ef25ac915fac42794b4ba7f85d79aa77ab0e14d4e289
---

## 适用场景

将一个主题、系统、产品或场景压缩为一张模块化 Bento 信息图。适合同时呈现主视觉、组成部分、流程、色板、局部细节与简短结论；不适合需要严格坐标、实时数据或大量表格的仪表盘。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附文字方向。无有效输入、超过一张图片或格式不支持时停止。仅从当前输入提取信息，不浏览外部资料或猜测附件；图片不得被提交、持久化或暴露路径。

编译一份模块清单，包含一个主模块与五至八个辅助模块。每个模块只承载一种信息角色，例如全景、局部、步骤、材料、色板、对比或结论。数据与事实必须由用户提供；没有数据时使用定性结构，不生成数字。

## 视觉编译规则

- 使用方形、4:5 或 3:4 画布，建立非对称但严格对齐的 Bento 网格，统一圆角、边距和模块间距。
- 主模块占视觉权重约 35–55%，其余五至八个模块围绕它形成由大到小的阅读层级；避免所有模块同权。
- 主模块展示完整主题或核心结构，辅助模块分别展示不同信息角色，不得用同一画面反复填格。
- 采用统一的编辑插画、产品摄影或轻纸艺语言；输入图片存在时，主模块保留主体身份、比例与关键颜色，局部模块只能取真实细节。
- 文案只使用用户给出的短标题、关键词或数字。文字无法可靠渲染时用图标、编号、色块和短占位线维持结构，不伪造内容。

## 硬性禁止项

不得虚构统计、评价、日期或产品能力；不得将结果做成通用应用仪表盘、等面积九宫格、拼图照片墙或无层级素材堆。禁止随机伪文字、重复模块、过量阴影、浮动玻璃卡、品牌标记、二维码、水印、无关人物或私有路径。

## 质量检查

确认一个主模块和五至八个辅助模块齐全；网格对齐、间距和圆角一致；每个模块有独立信息角色；缩略图中仍可辨主次；输入主体保持真实；用户提供的文字和数据准确；没有重复画面、溢出、畸形、虚构信息或品牌水印。

若网格、主次、文字或主体一致性发生硬失败，最多定向重试一次，固定模块清单并只修复失败项。

## 交付要求

通过宿主原生图片路径交付一张最终 Bento 信息图，并简要说明主模块、辅助模块数量和阅读顺序。不要公开私有输入路径或完整提示词，除非用户要求。
