---
id: virtual-host
version: 1.0.0
title_en: Virtual Host
title_zh: 虚拟主播形象
summary_en: Create a polished original character portrait with stable identity anchors, intentional staging, and professional finish.
summary_zh: 生成完成度高的原创人物肖像，保持身份锚点、明确调度和专业质感。
category: portraits-and-characters
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/virtual-host.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/portraits-and-characters/virtual-host.md,LICENSE
source_sha256s: 124e0459ed055f574b96bd03ef5f8324f03c1724d28ce7971dc9bb64a2253e71,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: b47501b6b103de45aa966ddaa1f9783f0d1d35294e0278ee624997c200fdc4c0
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“虚拟主播 / 数字人 / VTuber” 类型的人物视觉：

- VTuber 个人资料卡
- 数字主播形象主图
- 直播间人物模型
- 跨次元品牌代言形象

特征：

- 二次元 / 三次元 + 半二次元
- 强烈的角色识别度
- 通常包含名称 / debut 信息 / 标签
- 常配合背景特效与品牌色

### 适用范围

- VTuber 头像
- 数字人主形象
- 虚拟主播 debut 卡
- 跨次元代言主图

### 何时使用

- 用户提到“VTuber / 虚拟主播 / 数字人 / 虚拟形象”
- 用户希望视觉是“非真实人物”但拟人感强

不要使用：

- 真人职业头像（用 `professional-portrait.md`）
- 真人创始人大片（用 `founder-portrait.md`）
- 角色三视图（用 `character-sheet.md`）

### 缺失信息优先提问顺序

1. 角色名 / 主题
2. 风格：日系 anime / 韩系 / 半写实 / 卡通 3D
3. 性别 / 年龄设定
4. 颜色主题
5. debut 信息（首播日期 / 标签）
6. 是否需要背景特效

### 主模板：VTuber Debut 个人资料卡

📖 描述

整体一张 9:16 或 3:4 卡片，主体为虚拟主播形象，旁边有名称 / debut 时间 / 标签 / 平台标识。

📝 提示词

```json
{
  "type": "VTuber Debut 个人资料卡",
  "goal": "生成一张可作为 VTuber 出道日的官方个人资料卡视觉",
  "character": {
    "name": "{argument name=\"vtuber name\" default=\"霜白·诺娜\"}",
    "style": "{argument name=\"art style\" default=\"日系 anime + 半写实\"}",
    "gender": "{argument name=\"gender\" default=\"少女\"}",
    "age_setting": "{argument name=\"age setting\" default=\"18 岁\"}",
    "appearance": "{argument name=\"appearance\" default=\"银白长发，蓝色双瞳，雪绒帽 + 哥特连衣裙\"}",
    "pose": "{argument name=\"pose\" default=\"半身正面，微微侧头微笑\"}"
  },
  "color_theme": {
    "main_color": "{argument name=\"main color\" default=\"冰蓝 + 月白\"}",
    "accent_color": "{argument name=\"accent\" default=\"淡粉\"}"
  },
  "debut_info": {
    "debut_date": "{argument name=\"debut date\" default=\"2026.05.20\"}",
    "platform": "{argument name=\"platform\" default=\"YouTube · Bilibili\"}",
    "tags": "{argument name=\"tags\" default=\"#初配信 #雪絨組 #VTuber\"}",
    "agency": "{argument name=\"agency\" default=\"NEX Live\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"冬日雪原 + 极光\"}",
    "fx": "{argument name=\"fx\" default=\"雪花飘落 + 冷光粒子\"}"
  },
  "layout": {
    "character_position": "画面 1/2 偏右",
    "info_block_position": "画面左侧竖排",
    "logo_position": "右下角 agency logo"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "角色作为视觉主体",
      "名字与 debut 信息清晰可读",
      "主色与角色配色一致",
      "agency logo 不超过 5%"
    ],
    "avoid": [
      "角色脸部被信息块遮挡",
      "背景特效喧宾夺主",
      "字体多种类",
      "出现真实平台真实 logo（除非用户提供）"
    ]
  }
}
```

#### 参数策略

- 必问：角色名、风格、配色、debut 信息
- 可默认：背景、特效、layout
- 可随机：背景细节

#### 自动补全策略

- 风格按主题自动选（雪 → 冰蓝；火 → 红橙；夜 → 深紫；春 → 樱粉）
- 服装按风格匹配
- debut 信息按今日 + 30 天默认

### 变体 1：直播预览缩略图（横屏）

📝 提示词

```json
{
  "type": "VTuber 直播预览缩略图",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "character": {
    "pose": "{argument name=\"pose\" default=\"上半身 + 大表情\"}"
  },
  "title_overlay": {
    "main": "{argument name=\"stream title\" default=\"今晚！第一次直播！\"}",
    "sub": "{argument name=\"stream sub\" default=\"21:00 见 / 雪绒組\"}"
  },
  "constraints": {
    "must_feel": "直播感、邀请感、出片"
  }
}
```

### 变体 2：跨次元代言形象主图

📝 提示词

```json
{
  "type": "跨次元代言主图",
  "character": {
    "pose": "拿着代言产品，看向镜头"
  },
  "brand": {
    "name": "{argument name=\"brand\" default=\"AURORA Coffee\"}",
    "co_brand_visual": "品牌 logo + 产品在角色手中"
  },
  "constraints": {
    "must_feel": "代言感、品牌一致、可作为正式 KV"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "VTuber 形象自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给主题（雪、夜、海、樱），自动生成名字、配色、服装、背景、debut 信息",
  "constraints": {
    "must_feel": "可上线发布"
  }
}
```

### 避免事项

- 不要让角色脸被文字遮挡
- 不要使用真实存在的版权角色形象
- 不要在一张卡上塞 > 5 行信息
- 不要让背景特效压过角色
- 不要使用 > 3 种字体

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
