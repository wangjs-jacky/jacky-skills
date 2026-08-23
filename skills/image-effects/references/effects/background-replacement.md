---
id: background-replacement
version: 1.0.0
title_en: Background Replacement
title_zh: 背景替换
summary_en: Edit one supplied image with a tightly scoped change while preserving all unaffected identity, geometry, text, and material cues.
summary_zh: 对一张输入图片执行严格限定的编辑，同时保留所有未指定的身份、几何、文字和材质线索。
category: editing-workflows
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/background-replacement.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/editing-workflows/background-replacement.md,LICENSE
source_sha256s: 4edbe89621aa52fd1f33a2fe914688a5dbd45c6307833b8d6a09ea02b2e1a064,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: b800bbd27e127cede6b23f4741f76f57abdd4371b83cea4622662a28f0b8e58b
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

必须提供一张 JPEG 或 PNG。仅修改效果卡明确要求的部分，未指定的主体身份、几何、文字、材质、视角和光照关系都作为保真锚点。不得用生成结果替代原始输入继续迭代。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于“将一张图的背景替换为新背景”的编辑任务，对应脚本 `scripts/edit.js`。

适合场景：

- 商品图换背景（白底 → 生活场景 / 影棚 / 户外）
- 人像换背景（杂乱 → 干净棚景）
- 老照片背景翻新
- 跨品类素材统一背景风格

### 适用范围

- 单主体图换背景
- 主体不变 / 仅背景变
- 主体边缘清晰 / 可识别

### 何时使用

- 用户提供原图（REFERENCE_0）+ 一句“换成 XX 背景”
- 用户希望主体不动只换背景
- 用户希望多张图统一背景

不要使用：

- 主体本身需要修改（用 `local-object-replacement.md`）
- 仅去除某物（用 `object-removal.md`）
- 产品本身需要精修（用 `product-retouching.md`）

### 缺失信息优先提问顺序

1. 原图描述 / 主体是什么
2. 新背景：场景 / 色调 / 灯光
3. 是否保留原图灯光方向
4. 是否需要重新阴影 / 反光
5. 输出比例（保持原图 / 调整）

### 主模板：商品图换背景

📖 描述

输入一张主体图，输出主体保留、背景换成指定场景的图。

📝 提示词

```text
以 REFERENCE_0 为基础，保留 {argument name="subject" default="画面中央的白色按压瓶"} 的形态、比例、标签和材质，仅将背景替换为 {argument name="new background" default="清晨阳光下的木质梳妆台，柔光从左侧窗户洒入，远景轻微虚化，背景元素包含一杯水、几片白色花瓣、折叠的米色毛巾"}。
重新生成与新背景一致的阴影与反光，让主体看起来真实地存在于新场景中。
不要修改主体本身的颜色、文字、形状或材质。
渲染风格：{argument name="render style" default="高分辨率商业摄影，颗粒感真实，浅景深，主体清晰，背景自然虚化"}。
输出比例：{argument name="aspect ratio" default="保持原图比例"}。
```

#### 参数策略

- 必问：原图主体、新背景描述
- 可默认：渲染风格、比例
- 可随机：背景细节小道具

#### 自动补全策略

- 行业自动选背景：化妆品 → 梳妆台；食品 → 餐桌；电子 → 极简办公桌
- 默认保持原图比例
- 默认重新生成阴影

### 变体 1：人像换棚景

📝 提示词

```text
以 REFERENCE_0 为基础，保留 {argument name="subject" default="画面中的人物"} 的姿势、表情、穿着与五官，仅将背景替换为 {argument name="studio backdrop" default="中性灰背景纸"}。
重新生成与新背景一致的柔光阴影；不要改变人物形象、肤色、服装颜色。
渲染风格：{argument name="render style" default="棚拍人像摄影，柔光，自然肤质"}。
```

### 变体 2：商品图换户外场景

📝 提示词

```text
以 REFERENCE_0 为基础，保留 {argument name="subject" default="画面中央的产品"}，将背景替换为 {argument name="outdoor scene" default="海边木栈道，黄昏暖光，远处海浪虚化"}。
保留产品所有标签与材质细节；为产品重新生成与户外光线方向一致的阴影。
不要让产品颜色因光线偏移过强（保持品牌色）。
```

### 变体 3：自动补全模式

📝 提示词

```text
以 REFERENCE_0 为基础，保留主体；自动选择最适合该主体的“干净影棚 / 自然场景 / 极简室内”三种背景之一并替换。
保持原图比例；为主体重新生成自然阴影。
```

### 避免事项

- 不要修改主体本身（除非用户允许）
- 不要让光线方向与主体原本受光不一致
- 不要让背景元素太多分散注意力
- 不要让主体边缘出现明显抠图痕迹
- 不要修改主体上的文字 / 标签

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
