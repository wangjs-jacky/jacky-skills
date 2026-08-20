---
id: premium-studio-product
version: 1.0.0
title_en: Premium Studio Product
title_zh: 高级影棚产品摄影
summary_en: Present one product as a premium advertising hero with controlled studio light, refined materials, and a disciplined palette.
summary_zh: 将一个产品呈现为高级广告主视觉，以可控影棚光、精致材质和克制色板为核心。
category: product-visuals
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/premium-studio-product.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained product compiler.
preview_origin: Text-only image generation of a fictional amber glass desk lamp with no real brand or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: a3e55123fa76d1254c94111e5c5d181624648a93da047c90912ef7497139b871
---

## 适用场景

把一个实体产品、食品或器物转成高级商业影棚主视觉。适用于广告首图、发布海报底图和产品介绍封面；强调单一英雄主体、可感材质与受控光线，不替用户虚构品牌系统。

## 输入契约

接受产品文字描述，或一张明确附加的 JPEG/PNG 产品参考图。文字模式必须包含可成像主体；图片模式保留产品结构、颜色、材质、标签位置和配件数量，移除环境杂物。未提供品牌时统一按无品牌处理。

## 视觉编译规则

- 画面只设一个英雄产品，可带最多两件与使用方式直接相关的无品牌配件。
- 使用棚拍级主光、弱补光和受控轮廓光，让高光、阴影与接触面符合材质；避免悬浮。
- 背景采用深色、中性色或低饱和渐变，色板不超过四个主色角色，并与产品形成清楚分离。
- 构图简洁、有广告级留白，产品占画面约 45–70%，轮廓完整，不被边缘截断。
- 真实呈现金属、玻璃、陶瓷、织物或食物表面，不使用无依据的奢华装饰。

## 硬性禁止项

禁止真实品牌、虚构可读标签、水印、二维码、额外产品、错误配件、夸张光污染、廉价塑料质感、过饱和、脏污背景、漂浮阴影、重复轮廓和随机文字。图片输入不得改变产品类型与关键结构。

## 质量检查

确认英雄主体唯一且比例可信；材质由光线清晰表达；接触阴影自然；背景干净；色板克制；边缘、反射与透明部件无明显错误；没有文字或品牌。若主体结构错误或影棚光失控，只允许一次定向重试。

## 交付要求

输出一张最终商业主视觉，并通过宿主原生图片通道交付。用简短说明指出产品锚点、主要光位与材质表现；不展示完整提示词、路径或内部参数。
