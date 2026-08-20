---
id: editorial-cover
version: 1.0.0
title_en: Editorial Cover
title_zh: 编辑杂志封面
summary_en: Turn one subject into a restrained magazine cover with a dominant image, disciplined masthead, and minimal accurate cover lines.
summary_zh: 将一个主体转为克制的杂志封面，以主图、严格刊头和少量准确封面线构成编辑层级。
category: poster-and-campaigns
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/editorial-cover.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained editorial cover effect with explicit rights privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 0b98090c9d9d2524e539d06c59361184106716b09b8a962ddb803a82764c1028
---

## 适用场景

将一个主题、人物、产品、器物或场景编排成编辑杂志封面。适合独立刊物概念、专题封面和内容栏目视觉，强调一个主图、一个刊头和少量封面线之间的层级；不适合复制现有期刊、制作广告详情页或堆叠大量文章标题。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。无输入、超过一张图片或格式不支持时停止。图片只用于当前封面的主体、裁切、光线、材质和色彩，不扫描历史附件、不公开路径或保留副本。

刊名、期号、日期、人物名、地点、文章标题和引文只可来自用户明确输入。未提供时使用无字刊头区、抽象短线或一个明确虚构的短刊名；不得借用真实出版物、公众人物或品牌身份。

## 视觉编译规则

- 使用 3:4 或 4:5 竖版，设置顶部或侧边刊头区，一个占画面 55–80% 的主图，以及最多三条短封面线区域。
- 主图必须有明确主体、编辑裁切和充足呼吸空间。输入图片存在时保留身份、主体数量、比例、关键部件、背景逻辑与真实色彩关系。
- 选择一种一致的出版语言，例如当代艺术刊、自然史编辑、文化评论或静物专题；字体层级只使用刊头、短线和微型信息三层。
- 只渲染用户提供的准确短文字。无法可靠渲染时保留抽象短线，不产生伪文章标题、条形码数字或人物归属。
- 材质可以是细颗粒摄影、克制插画或纸面印刷，但不得用过度仿旧掩盖主体。

## 硬性禁止项

禁止复制真实杂志刊头或具体封面、冒用真实出版物、公众人物或品牌、虚构期号日期引文、密集封面线、可扫描条形码、二维码、水印、社交 UI、商业 CTA、伪文字、私有路径、额外主主体或改变输入人物身份。

## 质量检查

确认封面比例和层级成立；刊头区、主图与最多三条封面线清楚分离；主体裁切和结构正常；输入身份真实；文字准确或已抽象化；出版语言统一；无真实刊物复制、虚构事实、条码、二维码或水印。

若主体、刊头、文字、身份或编辑层级硬失败，最多定向重试一次，只修复该缺陷并保持其他布局。

## 交付要求

通过宿主原生图片交付路径返回一张最终封面，并简述刊头位置、主图裁切和封面线层级。不要公开私有路径或完整提示词，除非用户要求。
