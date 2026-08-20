---
id: campaign-kv
version: 1.0.0
title_en: Campaign Key Visual
title_zh: 活动主视觉
summary_en: Build one scalable campaign symbol and cinematic key art with disciplined hierarchy and crop-safe extensions.
summary_zh: 构建一个可扩展的活动核心符号和电影感主视觉，以严格层级与安全裁切支持系列延展。
category: poster-and-campaigns
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/campaign-kv.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained campaign effect with explicit rights privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 0be7d96ac2ba6828bd9ebae33da72b048997bcefc82270d082ac76df202a8004
---

## 适用场景

为活动、展览、发布、节庆或主题系列创建一张可扩展的 Key Visual。结果以一个核心符号、一处主场景和稳定的标题区建立活动识别，能够安全裁切到竖版海报、方形社交图或横版头图；不负责生成完整物料套装。

## 输入契约

接受非空文字主题且不附图，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。无输入、超过一张图片或格式不支持时停止。图片只用于提取核心主体、场景结构、色彩和情绪，不扫描历史、不公开路径或保留额外副本。

先定义一个活动概念、一个核心符号、一个主场景、二至四个色彩角色、标题安全区和多个裁切安全边界。活动名、机构名、日期、地点、标语和事实只能来自用户；未提供时省略，不补造真实活动信息。

## 视觉编译规则

- 默认使用 4:5 竖版，核心符号占画面约 35–60%，轮廓明确，并在中心安全区内独立成立。
- 主场景提供空间、光线与情绪，但不得产生第二核心符号。背景细节向边缘递减，为标题和跨比例裁切保留安静区域。
- 采用摄影、插画、材质装置或轻超现实合成中的一种主语言，保持统一光源、透视和尺度。
- 输入图片存在时保留主体身份、数量、结构和关键颜色；重新编排只用于形成活动符号，不得替换为真实品牌或公众人物。
- 文字只使用用户明确提供的活动名或一句短标语；无法准确渲染时保留无字标题区和信息线，不生成伪日期或地点。

## 硬性禁止项

禁止多个竞争核心、真实机构或品牌冒用、公众人物仿像、受保护角色、虚构活动日期地点、未经提供的标语、密集信息区、二维码、票务 CTA、水印、社交 UI、随机霓虹、透视冲突、私有路径或无法裁切的边缘主体。

## 质量检查

确认一个核心符号清晰且可缩放；主场景只承担氛围；标题区和中心裁切安全；色彩与光线统一；输入主体真实；用户文字准确或已省略；方形与横版裁切不会切断核心；无真实机构冒用、虚构事实、二维码或水印。

若核心符号、裁切安全、主体结构或文字发生硬失败，最多定向重试一次，锁定活动概念并只修复失败项。

## 交付要求

通过宿主原生图片交付路径返回一张最终 Key Visual，并简述核心符号、主场景和裁切安全区。不要公开私有路径或完整提示词，除非用户要求。
