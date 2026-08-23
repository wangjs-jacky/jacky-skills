---
id: product-retouching
version: 1.0.0
title_en: Product Retouching
title_zh: 产品精修
summary_en: Edit one supplied image with a tightly scoped change while preserving all unaffected identity, geometry, text, and material cues.
summary_zh: 对一张输入图片执行严格限定的编辑，同时保留所有未指定的身份、几何、文字和材质线索。
category: editing-workflows
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/product-retouching.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/editing-workflows/product-retouching.md,LICENSE
source_sha256s: 8b3323ea1d0c17c7d720270a40cae2f16fa4a3dae9a32e81147543a90dde65ba,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: ddb52cf6f0507a3bad392b9ec181fc051e5ed28f7c3fb9c8e54bb49190d9b838
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

必须提供一张 JPEG 或 PNG。仅修改效果卡明确要求的部分，未指定的主体身份、几何、文字、材质、视角和光照关系都作为保真锚点。不得用生成结果替代原始输入继续迭代。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于“在原图基础上对产品做精修”的编辑任务：

- 提升商品图质感
- 修补瑕疵 / 划痕
- 调整光泽 / 反光
- 美化标签 / 锐化文字
- 重新整理阴影 / 倒影

特征：

- 主体（产品）保留
- 重点是“质感升级”而不是“替换”
- 不强行换背景
- 不修改产品形态与文字

### 适用范围

- 商品图质感升级
- 瑕疵修复
- 灯光重做
- 标签 / 文字锐化

### 何时使用

- 用户提供原图（REFERENCE_0）+ 希望产品更高级
- 用户希望保留场景，仅升级质感

不要使用：

- 整张换背景（用 `background-replacement.md`）
- 替换产品为另一产品（用 `local-object-replacement.md`）
- 把白底主图重新生成（用 `product-visuals/white-background-product.md` 重画）

### 缺失信息优先提问顺序

1. 原产品描述
2. 想强化的方面（质感 / 光泽 / 标签 / 阴影）
3. 是否要去掉瑕疵
4. 是否保留背景
5. 是否双图对比输出

### 主模板：产品质感升级

📖 描述

保留原图的产品与场景，只对产品本身做质感升级（更通透 / 更有光泽 / 标签更清晰 / 更高级）。

📝 提示词

```text
以 REFERENCE_0 为基础，保留画面中 {argument name="product" default="白色按压瓶"} 的形状、比例、标签内容与场景背景，对产品本身做质感升级：
- 提升 {argument name="enhancement focus" default="瓶身光泽与微反光"} 的质感；
- 修复 {argument name="defect to fix" default="瓶身上轻微的划痕与脏点"}；
- 让 {argument name="label sharpening" default="正面标签的字与 logo"} 更锐利清晰；
- 阴影与反光与原图保持方向一致，但更细腻；
- 不要修改产品颜色、文字、材质类型；
- 不要替换背景。
渲染风格：{argument name="render style" default="高端商业产品摄影 + 杂志级后期"}。
```

#### 参数策略

- 必问：要强化的方面
- 可默认：保留背景、保留文字、保留色彩
- 可随机：阴影柔和度

#### 自动补全策略

- 默认提升光泽 + 修复瑕疵 + 锐化标签
- 不指定强度时按“克制升级”处理
- 不动品牌色

### 变体 1：标签 / 文字锐化

📝 提示词

```text
以 REFERENCE_0 为基础，仅对画面中产品标签上的文字做锐化与清晰化处理：
- 保留所有文字内容、字距、字体；
- 不修改瓶身其他部分；
- 不修改背景。
```

### 变体 2：阴影 / 倒影重做

📝 提示词

```text
以 REFERENCE_0 为基础，保留产品本身，重新生成更精致的 {argument name="shadow type" default="底部柔光阴影 + 微反光"}：
- 阴影方向与原图灯光一致；
- 反光强度克制不抢镜；
- 不修改产品本身；
- 不修改背景。
```

### 变体 3：自动补全模式

📝 提示词

```text
以 REFERENCE_0 为基础，对产品做整体质感升级，自动决定升级重点（光泽 / 标签 / 阴影 / 边缘）；
保持产品原本身份，整体提升 1 个档次。
```

### 避免事项

- 不要修改产品的文字（特别是品牌名）
- 不要让光泽提升变成“塑料感”
- 不要重新生成背景（除非用户允许）
- 不要让阴影方向漂移
- 不要对产品做夸张色彩调整

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
