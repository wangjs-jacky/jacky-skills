---
id: style-transfer-selfie
version: 1.0.0
title_en: Style Transfer Selfie
title_zh: 自拍风格转绘
summary_en: Create a coherent profile visual that preserves subject cues while applying a controlled, original art direction.
summary_zh: 生成连贯的人设视觉，在保留主体线索的同时应用克制且原创的美术方向。
category: avatars-and-profile
execution_kind: host-image-generation
input_mode: image
input_min: 1
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/style-transfer-selfie.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/avatars-and-profile/style-transfer-selfie.md,LICENSE
source_sha256s: 67021faabdbd9e5d5db6851eb2e5bc6a650a76ef399a4f0949fdae0f93989461,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 66aae4101bf3c38dc30c59d6ac125965bec3776789e52bffeb7d11ac918ae55d
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

必须提供一张 JPEG 或 PNG。仅修改效果卡明确要求的部分，未指定的主体身份、几何、文字、材质、视角和光照关系都作为保真锚点。不得用生成结果替代原始输入继续迭代。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"基于一张参考图（用户自拍 / 公开照），把人物转化成某种特定风格" 的人设视觉：

- Cosplay 自拍风
- 哥特 / 复古胶片 / 街头 / 涂鸦 风格人设
- 偶像写真 / 拍立得风
- 户外活动情境照（漫展、篮球场、咖啡店）
- 名人 / 角色风格转换

特征：

- 必须基于参考图（REFERENCE_0）保留五官身份
- 仅修改风格 / 妆 / 服装 / 场景气氛
- 单图输出（不是网格 / 不是 sheet）
- 输出更像"你的另一个版本"

### 适用范围

- 把自拍转为某种角色 / 风格
- 一键 cosplay 任意角色
- 改妆容 + 服装 + 场景气氛同步切换

### 何时使用

- 用户提供一张自拍，希望转风格
- 用户描述自己 + 想要的风格，让我们生成
- 用户希望"我的样子但是 X 风格"

不要使用：

- 多版本网格（用 `character-grid-portrait.md`）
- 标准职业头像（用 `portraits-and-characters/professional-portrait.md`）
- 创始人大片（用 `portraits-and-characters/founder-portrait.md`）
- VTuber / 二次元角色（用 `portraits-and-characters/virtual-host.md`）

### 缺失信息优先提问顺序

1. 是否提供参考图（REFERENCE_0）？没有的话需要文字描述本人
2. 想要的风格主题（cosplay / 哥特 / 胶片 / 街头 / 偶像 / 名人风）
3. 服装 / 妆容 / 发型变化范围
4. 场景背景（保留原图 / 新场景）
5. 比例

### 主模板：风格转换自拍（基于 REFERENCE_0）

📖 描述

保留参考图人物身份与基本姿势，将整体风格切换到指定主题。

📝 提示词

```text
基于 REFERENCE_0 中的人物，保留其脸型、五官比例、肤色与基本姿势，将整体风格转换为 {argument name="target style" default="trad goth 哥特风"}：
- 头发：{argument name="hair description" default="黑色短发 + 厚重齐刘海"}
- 妆容：{argument name="makeup description" default="深色烟熏眼妆 + 黑色哑光唇"}
- 服装：{argument name="outfit description" default="黑色皮质上衣 + 银色十字项链 + 多层叠戴"}
- 配饰：{argument name="accessories" default="鼻环、耳钉 2 个、银戒指"}
- 场景：{argument name="scene description" default="保留原图背景"}
- 灯光：{argument name="lighting" default="戏剧性侧光，对比度高"}

输出风格：{argument name="rendering" default="高分辨率写实摄影"}，单张人像图。

约束：
- 不要修改人物身份（脸型、五官比例必须可识别）
- 不要修改性别、年龄段、种族
- 妆容浓但不假，肌肤保留质感
- 服装风格统一不混搭
```

#### 参数策略

- 必问：参考图、目标风格
- 可默认：发型、妆容、服装、配饰
- 可随机：背景细节、配饰具体造型

#### 自动补全策略

- 用户只给一个风格关键词时：自动展开发型 + 妆 + 服装 + 配饰四件套
- 没有参考图时，要求用户先提供，或退化为纯文本描述
- 默认保留原图背景，除非风格强烈要求换景

### 变体 1：Cosplay 自拍（漫展 / 角色扮演）

📝 提示词

```text
基于 REFERENCE_0 中的人物（如无参考图，则按 {argument name="subject self description" default="东亚年轻女性，自然微笑"} 描述），将其转换为 {argument name="character" default="原神 雷电将军"} 的 cosplay 自拍照，
拍摄场景：{argument name="event location" default="上海漫展现场"}；
保留人物本人五官特征，让人能看出"是 ta 在 cos 这个角色"；
渲染为手机自拍照风格 + 现场氛围 + 自然光。
```

### 变体 2：复古胶片 / Vintage 35mm 闪光人像

📝 提示词

```text
基于 REFERENCE_0 中的人物，将其重新拍摄为 vintage 35mm 闪光胶片人像：
- 闪光灯直射造成的硬阴影
- 颗粒感胶片质感
- 颜色偏 1990s 暖黄
- 场景：{argument name="vintage scene" default="街边台球室"}
- 人物表情自然，不刻意摆拍
保留原图人物身份。
```

### 变体 3：偶像写真 / 拍立得集合（单张拍立得形态）

📝 提示词

```text
基于 REFERENCE_0 中的人物，生成一张拍立得照片：
- 拍立得边框（白色厚边、底部留白手写标签）
- 人物在画面居中
- 风格：{argument name="polaroid mood" default="日系偶像清纯"}
- 拍立得底部手写一句话：'{argument name="caption" default="2026.4.24 weekend"}'
- 整体颗粒感 + 微微过曝
```

### 变体 4：自动补全模式

📝 提示词

```text
基于 REFERENCE_0 中的人物，将其转换为最适合的某种"高级风格化人设"自动决定：
- 自动判断该人物气质适合的风格主题
- 自动展开发型 / 妆容 / 服装 / 场景 / 灯光
- 不修改人物身份特征
- 输出单张图
```

### 避免事项

- 不要修改五官比例（最常见失败：换脸）
- 不要修改性别 / 种族特征
- 不要让妆容浓到变成"滤镜假皮肤"
- 不要把背景换得脱离主题
- 不要在没有参考图时假装是基于参考图（退化为文本描述模式即可）
- 不要使用真实存在的版权角色名直接 cosplay（建议描述特征而非点名）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
