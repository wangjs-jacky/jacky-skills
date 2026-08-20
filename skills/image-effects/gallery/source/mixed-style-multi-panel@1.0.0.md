---
id: mixed-style-multi-panel
version: 1.0.0
title_en: Mixed-Style Multi-Panel
title_zh: 多媒介混合风格拼贴
summary_en: Render one stable subject across five coordinated media while preserving identity, pose, geometry, and palette anchors.
summary_zh: 将同一稳定主体以五种协调媒介呈现，同时守住身份、姿态、几何和配色锚点。
category: grids-and-collages
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/mixed-style-multi-panel.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained host-native effect with explicit identity privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 4cc2fdc20617ffa70c92fd5e0349fd14b95a6a08789a5150325cba9f322014a4
---

## 适用场景

用一张图比较同一主体在多种视觉媒介中的表达，适合人物、角色、器物、产品或场景的风格探索与提案板。结果必须读成同一主体的媒介实验，而不是五个无关素材的拼贴。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附文字方向。输入为空、图片超过一张或格式不支持时停止。对图片建立身份与几何锚点，包括主体数量、轮廓、比例、姿态、视角、关键部件、服装或材质以及二至四个颜色角色；不扫描历史或本地文件，不泄露路径。

文字输入应定义一个具体原创主体和足以跨格识别的三至五个锚点。若主题指向真实公众人物、受保护角色或品牌设计，先将其泛化为原创主体，除非用户明确拥有并要求处理自己的输入图片。

## 视觉编译规则

- 使用一张方形或 4:5 编辑板，默认五格结构为中央大格加四个周边格；统一外底、窄缝、边界和观看尺度。
- 五格使用同一裁切或等价构图，锁定主体数量、姿态、方向、轮廓、比例、关键部件和识别色，只改变渲染媒介。
- 从摄影、赛璐璐插画、水墨或线描、油画或厚涂、像素或黏土等媒介中选五种有明显差异但互不冲突的语言；每格只使用一种。
- 中央格承担最清晰的身份基准，周边格不得用面罩、夸张变形、裁切或额外道具遮蔽关键锚点。
- 标签是可选项，只使用用户给出的短词；否则以色点、短线或无文字区分媒介。

## 硬性禁止项

禁止更换主体、身份、性别表达、数量、服装主色、产品部件、姿态或构图；禁止某格变成无关场景、第二主体、品牌角色、公众人物仿像或真实商标。不得使用杂乱素材墙、重叠照片、密集文字、UI、二维码、水印、私有路径或六种以上相互竞争的媒介。

## 质量检查

确认五格齐全且中央格最大；五格一眼可认作同一主体；至少五个身份或几何锚点稳定；每格媒介差异明确；视角、尺寸和留白协调；人物解剖或器物结构正常；标签准确或已省略；没有品牌、复制角色、额外主体或水印。

若主体一致性、格数、媒介区分或几何出现硬失败，最多定向重试一次，锁定身份锚点并只纠正失败格。

## 交付要求

通过宿主原生图片交付路径返回一张最终多格板，并简述身份锚点、中央基准媒介和四种变体媒介。不要公开私有路径或完整提示词，除非用户要求。
