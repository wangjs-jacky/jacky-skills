---
id: portrait-local-edit
version: 1.0.0
title_en: Portrait Local Edit
title_zh: 人像局部编辑
summary_en: Edit one supplied image with a tightly scoped change while preserving all unaffected identity, geometry, text, and material cues.
summary_zh: 对一张输入图片执行严格限定的编辑，同时保留所有未指定的身份、几何、文字和材质线索。
category: editing-workflows
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/portrait-local-edit.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/editing-workflows/portrait-local-edit.md,LICENSE
source_sha256s: 5fbf8b04ba6e8591bf263a2b79d363584b9125a00c1d81a52bbc08340bcc22fe,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 8bd69fd20c6937c3ccf37cd25579045e894c02611bd06dda75ff0c680651b068
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

必须提供一张 JPEG 或 PNG。仅修改效果卡明确要求的部分，未指定的主体身份、几何、文字、材质、视角和光照关系都作为保真锚点。不得用生成结果替代原始输入继续迭代。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于“对人像图做局部修改”的编辑任务：

- 修改发型 / 发色
- 修改服装颜色 / 款式
- 修改眼镜 / 配饰
- 修改妆容
- 修改表情（轻度）

特征：

- 必须保留人物身份（脸型 / 五官比例）
- 仅局部修改
- 必要时配合蒙版
- 不修改场景

### 适用范围

- 人像局部修改
- 服装 / 配饰修改
- 妆容修改
- 发型 / 发色修改

### 何时使用

- 用户提供人像图 + 想修改某一局部
- 用户希望保留“是同一个人”的感觉

不要使用：

- 整张换背景（用 `background-replacement.md`）
- 替换为另一对象 / 物品（用 `local-object-replacement.md`）
- 删除某物（用 `object-removal.md`）

### 缺失信息优先提问顺序

1. 想修改的部位（发型 / 服装 / 妆容 / 配饰）
2. 修改后的样子描述
3. 是否提供蒙版
4. 是否保留表情 / 姿势
5. 是否调整光线

### 主模板：发型 / 发色修改

📖 描述

保留人物身份与构图，仅修改发型 / 发色。

📝 提示词

```text
以 REFERENCE_0 为基础，保留人物的脸型、五官比例、肤色、表情、姿势、服装与背景，仅修改发型 / 发色为：
{argument name="new hair description" default="齐肩短发 + 自然黑色 + 轻微微卷"}。
新发型的阴影、反光、发际线必须与原图灯光方向一致；
不要修改人物身份特征（眼睛形状、嘴形、鼻子、耳朵）；
不要修改背景。
```

#### 参数策略

- 必问：修改部位、新样子
- 可默认：保留身份、保留背景、保留灯光
- 可随机：发丝细节

#### 自动补全策略

- 默认保留人物身份
- 默认保留构图与灯光
- 默认仅做局部修改，不动其它

### 变体 1：服装修改

📝 提示词

```text
以 REFERENCE_0 为基础，保留人物的脸、发型、姿势、表情与背景，仅修改服装为：
{argument name="new outfit description" default="米色长袖衬衫 + 卡其色西装外套"}；
新服装的褶皱、阴影必须与原图灯光方向一致；
不要修改人物身份特征；
不要修改背景。
```

### 变体 2：妆容修改

📝 提示词

```text
以 REFERENCE_0 为基础，保留人物身份与构图，仅修改妆容为：
{argument name="new makeup description" default="哑光裸色唇 + 棕调眼影 + 自然腮红"}；
保留肤色、肤质细节、五官形状；
不要让妆容显得过浓或与肤色不匹配；
不要修改背景。
```

### 变体 3：配饰修改 / 添加

📝 提示词

```text
以 REFERENCE_0 为基础，保留人物身份与构图，添加 / 修改配饰为：
{argument name="accessory description" default="一副细金属边圆框眼镜"}；
配饰的角度、阴影必须与原图灯光方向一致；
不要修改其它身体部位；
不要修改背景。
```

### 变体 4：自动补全模式

📝 提示词

```text
以 REFERENCE_0 为基础，对人物做轻度风格升级（发型 / 妆容 / 服装 任一），自动判断当前最不协调处并修复；
保持人物身份不变；
保持背景不变。
```

### 避免事项

- 不要修改人物五官导致换脸
- 不要让修改后的局部光线方向与原图不一致
- 不要顺带修改背景与肤色
- 不要让妆容浓到“滤镜假皮肤”
- 没有蒙版时，告诉用户结果可能略有偏差
- 不要在用户没要求时修改性别 / 种族特征

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
