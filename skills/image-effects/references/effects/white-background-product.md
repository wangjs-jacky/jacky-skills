---
id: white-background-product
version: 1.0.0
title_en: White Background Product
title_zh: 白底电商产品图
summary_en: Isolate one product on clean white with truthful geometry, crisp edges, and a soft physically plausible grounding shadow.
summary_zh: 将一个产品置于干净白底，以真实结构、清晰边缘和符合物理的柔和落地阴影为核心。
category: product-visuals
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/white-background-product.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Generalizes the Happy catalog effect generated from ConardLi/gpt-image-2-101 into a neutral self-contained ecommerce effect.
preview_origin: Text-only image generation of a fictional cobalt travel kettle with no real brand or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 65b9e7d4794d46da92875e46b5e6c0fb89e99bd531d0952597bd31509cf81922
---

## 适用场景

生成标准化白底电商主图、产品目录图或干净的单品档案图。目标是准确、可比较和易抠取的商品呈现，而非氛围广告或复杂场景。

## 输入契约

接受一个明确产品的文字描述，或一张 JPEG/PNG 参考图。图片模式保留产品结构、比例、主色、材质、开合状态和随附部件；清除原背景与无关道具。若输入含多件商品，除非用户明确要求套装，只选择主要产品。

## 视觉编译规则

- 使用纯白无缝背景，单个产品居中或轻微三分构图，产品占画面约 60–80%，四周保留一致安全边距。
- 采用柔和均匀的商业棚光，保留轻微自然接触阴影以稳定产品，不做镜面倒影。
- 边缘清晰、孔洞与透明区正确，透视自然，垂直与水平结构不歪斜。
- 真实呈现颜色和材质，控制高光不过曝；白色产品必须通过细微灰阶与轮廓光从背景分离。
- 除用户提供且要求保留的标签外，不生成任何文字。

## 硬性禁止项

禁止灰脏背景、地平线、场景道具、手、人物、真实品牌、虚构标签、水印、二维码、浮空、硬黑阴影、重复商品、截断轮廓、几何变形和额外文字。

## 质量检查

确认背景为视觉纯白；主体数量正确；产品形体和视角可信；四周有安全边距；接触阴影柔和；白色区域未丢失细节；无杂物、品牌和文字。若首次结果背景不净或结构漂移，只允许一次针对性重试。

## 交付要求

输出一张白底产品图并通过宿主原生图片通道交付。简短说明保留的结构与材质锚点；不泄露输入路径、完整提示词或内部参数。
