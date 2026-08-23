---
id: object-removal
version: 1.0.0
title_en: Object Removal
title_zh: 物体移除
summary_en: Edit one supplied image with a tightly scoped change while preserving all unaffected identity, geometry, text, and material cues.
summary_zh: 对一张输入图片执行严格限定的编辑，同时保留所有未指定的身份、几何、文字和材质线索。
category: editing-workflows
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/object-removal.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/editing-workflows/object-removal.md,LICENSE
source_sha256s: 0abedd4277e7e7e8945df7690a67b9ca8c8a5664ea48e16247875cb912e97897,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 5fd77429702bed195f2c8bada9bdd441f683d2bce278cb49a8832a57e13b6db8
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

必须提供一张 JPEG 或 PNG。仅修改效果卡明确要求的部分，未指定的主体身份、几何、文字、材质、视角和光照关系都作为保真锚点。不得用生成结果替代原始输入继续迭代。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于“去除图中某物，保留其余画面”的编辑任务：

- 去除路人 / 围观者
- 去除水印 / logo（仅限非版权场景）
- 去除多余道具
- 去除杂线 / 电线
- 去除画面中的瑕疵

特征：

- 不需要替换为新对象
- 移除区域需自然填充
- 必要时配合蒙版
- 不能影响主体

### 适用范围

- 单杂物去除
- 多杂物去除
- 大面积去除（电线 / 线缆）
- 局部瑕疵去除

### 何时使用

- 用户提供原图（REFERENCE_0）+ 想去掉某物
- 用户希望画面更干净

不要使用：

- 替换为新对象（用 `local-object-replacement.md`）
- 整张换背景（用 `background-replacement.md`）

### 缺失信息优先提问顺序

1. 要去除的对象
2. 是否提供蒙版
3. 去除后该区域应填充为什么（背景延续 / 干净底色）
4. 是否影响阴影 / 反光

### 主模板：单杂物去除

📖 描述

精确去除一个对象，原区域用周围环境自然填充。

📝 提示词

```text
以 REFERENCE_0 为基础，去除画面中的 {argument name="object to remove" default="背景里的路人"}。
被去除区域使用周围环境（{argument name="fill description" default="街道地面、墙面与远景建筑"}）做自然延续，使其看起来从未存在；
保留主体、光线方向、阴影与画面构图；
不要修改其它人物、物体或文字。
```

#### 参数策略

- 必问：要去除的对象、填充类型
- 可默认：保留主体
- 可随机：补全细节

#### 自动补全策略

- 默认根据周围环境推断填充
- 默认保留所有阴影方向

### 变体 1：配合蒙版去除

📝 提示词

```text
以 REFERENCE_0 为基础，使用 REFERENCE_1（蒙版）所标记的区域作为待去除区域，将该区域内容自然替换为周围环境的延续；
仅对蒙版区域做修改，蒙版外像素级保留；
不要让填充区域出现可识别的接缝或纹理跳变。
```

### 变体 2：批量去除（如电线 / 围观者）

📝 提示词

```text
以 REFERENCE_0 为基础，去除画面中所有 {argument name="objects to remove" default="天空中的电线 / 街道上的路人"}。
被去除区域用对应背景（天空 / 地面 / 建筑）自然延续；
保留主体、灯光、阴影、构图。
```

### 变体 3：自动补全模式

📝 提示词

```text
以 REFERENCE_0 为基础，自动识别画面中干扰主体阅读的杂物并去除（如：路人、电线、瓶罐、水渍）；
保留主体与构图；自然填充背景。
```

### 避免事项

- 不要把主体一并去掉
- 不要修改光线方向（去除后阴影也要保留）
- 不要让填充区域出现“糊感 / 重复纹理”
- 没有蒙版时，告诉用户仅能尽力（结果可能有轻微差异）
- 不要去除带版权 logo / 水印（除非用户为合法所有人）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
