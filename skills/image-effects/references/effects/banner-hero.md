---
id: banner-hero
version: 1.0.0
title_en: Banner Hero
title_zh: Web Hero 横幅
summary_en: Compose a wide hero image with one grounded subject, generous copy space, and robust desktop and mobile crop safety.
summary_zh: 构建一张宽幅主视觉，以一个真实落地的主体、充足文案区和稳定的桌面移动端裁切安全为核心。
category: poster-and-campaigns
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/banner-hero.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained web hero effect with explicit privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: d10ab7a2c8544ac071d668d706ba931152e4e69f164fc3c2cca28a0cfb21e463
---

## 适用场景

把一个产品、人物、角色或场景转成网站首屏宽幅 Hero。适合落地页、专题页和产品首页，需要一个明确主主体与大面积文案安全区，并能兼顾桌面横屏和移动端中心裁切；不适合信息密集的海报或多卡片 UI 截图。

## 输入契约

接受非空文字主题且零图片，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。输入为空、超过一张图片或格式不支持时停止。图片只用于当前 Hero 的主体身份、结构、材质、色彩和场景线索，不扫描历史或文件夹，不泄露路径或保存额外副本。

先确定一个主主体、一个简洁环境、文案区方向和中心裁切安全框。文字模式必须使用原创虚构主体；真实品牌、公众人物和产品声明只有在用户明确提供并拥有使用依据时才可保留。

## 视觉编译规则

- 使用 16:9 或接近 3:1 的宽幅构图，主主体占画面约 35–55%，一侧保留约 35–50% 干净负空间作为标题与按钮安全区。
- 主体必须有可信接触面、透视、比例和阴影，不漂浮、不被文字区切割；背景保持简单，光线方向统一。
- 预留中心窄幅裁切时仍能看到主体关键轮廓，桌面和移动端裁切均不得切断脸、产品关键部件或主动作。
- 输入图片存在时保留身份、主体数量、比例、材质和识别色，只允许重新安排背景和留白。
- 除非用户给出准确短标题，不渲染可读文案；可以保留短占位线和按钮轮廓，但不得伪造 CTA。

## 硬性禁止项

禁止多个主主体、复杂背景、悬浮产品、透视或阴影冲突、裁切关键部件、真实品牌冒用、公众人物仿像、虚构声明、密集文案、浏览器或应用 UI、二维码、水印、私有路径和把 Hero 做成四宫格或完整网页截图。

## 质量检查

确认横幅比例正确；主主体明确并真实落地；文案安全区干净；桌面与中心移动裁切均安全；主体结构、身份与颜色准确；背景不抢焦点；文字准确或已省略；无品牌冒用、漂浮、畸形、二维码或水印。

若裁切安全、主体结构、负空间或文字发生硬失败，最多定向重试一次，只修复该缺陷并保持构图方向。

## 交付要求

通过宿主原生图片交付路径返回一张最终 Hero，并简述主体位置、文案安全区和移动裁切策略。除非用户要求，不公开私有路径或完整提示词。
