---
id: local-object-replacement
version: 1.0.0
title_en: Local Object Replacement
title_zh: 局部物体替换
summary_en: Edit one supplied image with a tightly scoped change while preserving all unaffected identity, geometry, text, and material cues.
summary_zh: 对一张输入图片执行严格限定的编辑，同时保留所有未指定的身份、几何、文字和材质线索。
category: editing-workflows
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/local-object-replacement.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/editing-workflows/local-object-replacement.md,LICENSE
source_sha256s: d18ea3ca624fef8aaf5da1a20dc19d7d1c4255d0f66b19b54d50fa4071c016ae,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: b3aa16cd11526e1cc36436f160b03f59b21d40ce6599c38f9c02c68002dea078
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

必须提供一张 JPEG 或 PNG。仅修改效果卡明确要求的部分，未指定的主体身份、几何、文字、材质、视角和光照关系都作为保真锚点。不得用生成结果替代原始输入继续迭代。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于“将原图中某一对象替换为另一对象”的编辑任务：

- 把图中咖啡杯换成保温杯
- 把图中人物 T 恤换成卫衣
- 把车 logo 换为另一品牌
- 把宠物从猫换成狗
- 把背景里某物换为另一物

特征：

- 主体大部分保留
- 仅局部精确替换
- 周围光线 / 阴影需要适配
- 必要时配合 mask（蒙版）

### 适用范围

- 单一对象替换
- 多对象替换
- 配合蒙版的精确替换

### 何时使用

- 用户提供原图（REFERENCE_0）+ 想换某物
- 用户希望除被替换对象外其他都不动

不要使用：

- 整张换背景（用 `background-replacement.md`）
- 仅删除某物（用 `object-removal.md`）
- 产品 / 人像精修（用 `product-retouching.md` / `portrait-local-edit.md`）

### 缺失信息优先提问顺序

1. 原图中要替换的对象
2. 要替换为什么
3. 是否提供蒙版
4. 替换后是否需要重新阴影 / 反光
5. 是否保留替换对象的尺寸 / 位置

### 主模板：单对象替换

📖 描述

精确替换一个对象，其余画面尽量保留。

📝 提示词

```text
以 REFERENCE_0 为基础，将 {argument name="original object" default="桌上的白色陶瓷咖啡杯"} 替换为 {argument name="replacement object" default="同尺寸的不锈钢保温杯，哑光银色，瓶身有简洁品牌字 'AURORA'"}。
保留原图中其他所有元素的位置、光线、阴影与构图；只对被替换对象本身做修改。
为新对象重新生成与原图光线方向一致的阴影、反光与材质。
不要改变其它人物、桌面、背景。
```

#### 参数策略

- 必问：原对象、替换对象
- 可默认：是否需要重新阴影
- 可随机：替换对象的次要细节

#### 自动补全策略

- 默认保留原对象尺寸与位置
- 默认重新生成阴影
- 用户没指定材质时，按合理类比选

### 变体 1：配合蒙版的精确替换

📝 提示词

```text
以 REFERENCE_0 为基础，使用 REFERENCE_1（蒙版）所标记的区域，精确替换 {argument name="object to replace" default="人物的白色 T 恤"} 为 {argument name="new object" default="深蓝色长袖卫衣，胸前印有 'AURORA' 字样"}。
仅对蒙版区域做修改，其余区域必须像素级保留；
为新衣服生成与原图灯光一致的褶皱与阴影；
保持人物身材与姿势完全不变。
```

### 变体 2：批量对象替换

📝 提示词

```text
以 REFERENCE_0 为基础，将画面中所有 {argument name="original objects" default="木质椅子"} 替换为 {argument name="replacement objects" default="米色塑胶椅"}。
保持每把椅子的位置、角度与摆放不变；
为新椅子生成与原图光线方向一致的阴影；
不要修改桌子、墙面、灯具、人物。
```

### 变体 3：自动补全模式

📝 提示词

```text
以 REFERENCE_0 为基础，将原图中 {argument name="object" default="主要前景物体"} 替换为视觉风格更现代的同功能版本，自动决定材质与配色，但保持位置与尺寸一致。
```

### 避免事项

- 不要替换后改变原对象的位置 / 比例（除非用户允许）
- 不要让替换对象的灯光方向与原图不一致
- 不要顺便修改其它无关元素
- 不要让替换对象的材质显得"贴上去"
- 没有蒙版时，不要假装精确（说明边缘可能略微变化）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
