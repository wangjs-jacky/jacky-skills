---
id: founder-portrait
version: 1.0.0
title_en: Founder Portrait
title_zh: 创始人肖像
summary_en: Create a polished original character portrait with stable identity anchors, intentional staging, and professional finish.
summary_zh: 生成完成度高的原创人物肖像，保持身份锚点、明确调度和专业质感。
category: portraits-and-characters
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/founder-portrait.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/portraits-and-characters/founder-portrait.md,LICENSE
source_sha256s: 0ae8fe272a99238cf6b11c1173589a25ca3f8f82e5198664f71e8f0275d4db91,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: cfc406d561824a513dadbe5637c4062b1ca99cbed4e9d235fe1b0d2e83a0ba2e
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“创始人 / 高管 / 行业人物”级别的媒体大片肖像：

- 财经杂志专访配图
- 创业媒体封面
- 创始人主图（融资 / 上市新闻）
- 行业人物特写
- 个人品牌大片

特征：

- 戏剧性灯光
- 强烈的“人物气质”
- 高对比 / 高叙事感
- 通常竖版 3:4 / 4:5
- 留位置给标题或引言

### 适用范围

- 财经 / 创业杂志专访
- 公司官网创始人大片
- 行业人物特写
- 个人品牌主图

### 何时使用

- 用户提到“创始人大片 / 杂志专访 / 高管照 / 媒体大片 / 人物气质照”
- 用户希望视觉高叙事性、有“人物即故事”感

不要使用：

- 普通商务头像（用 `professional-portrait.md`）
- 虚拟主播（用 `virtual-host.md`）
- 角色设定（用 `character-sheet.md`）

### 缺失信息优先提问顺序

1. 人物身份 / 行业
2. 性别 / 年龄
3. 风格：黑白文学 / 工业感 / 创新派 / 古典财经
4. 构图：环境人像 / 特写 / 半身
5. 配色 / 灯光基调
6. 是否需要预留标题位

### 主模板：媒体大片创始人肖像

📖 描述

整体竖版肖像，主体为人物半身或环境人像，戏剧性侧光，强叙事，预留标题位。

📝 提示词

```json
{
  "type": "媒体大片级创始人肖像",
  "goal": "生成一张能直接作为财经杂志 / 创业媒体专访配图 / 公司官网创始人主图的媒体大片肖像",
  "subject": {
    "identity": "{argument name=\"identity\" default=\"AI 公司创始人 CEO\"}",
    "gender": "{argument name=\"gender\" default=\"东亚男性\"}",
    "age_range": "{argument name=\"age range\" default=\"35-45 岁\"}",
    "appearance": "{argument name=\"appearance\" default=\"头发整齐，神情沉稳\"}",
    "outfit": "{argument name=\"outfit\" default=\"深色高领针织 + 长款外套\"}"
  },
  "composition": {
    "shot": "{argument name=\"shot\" default=\"环境人像 + 半身\"}",
    "framing": "{argument name=\"framing\" default=\"人物在画面 1/3 处，背景留出 2/3 给环境\"}",
    "title_safe_area": "{argument name=\"title safe area\" default=\"画面右上预留标题位\"}"
  },
  "environment": {
    "location": "{argument name=\"location\" default=\"现代办公空间，落地窗 + 极简家具\"}",
    "depth": "{argument name=\"depth\" default=\"浅景深，背景虚化\"}"
  },
  "lighting": {
    "style": "{argument name=\"lighting style\" default=\"戏剧性侧光\"}",
    "key_light": "{argument name=\"key light\" default=\"窗户大面积自然光\"}",
    "fill_light": "{argument name=\"fill light\" default=\"暗部留细节\"}",
    "color_temp": "{argument name=\"color temp\" default=\"略冷\"}"
  },
  "expression": {
    "mood": "{argument name=\"mood\" default=\"沉静、有思考感\"}",
    "gaze": "{argument name=\"gaze\" default=\"略偏离镜头，望向远处\"}"
  },
  "style": {
    "rendering": "高分辨率人像摄影 + 杂志后期",
    "tone": "微微暗调 + 高对比 + 略颗粒",
    "color_palette": "{argument name=\"color palette\" default=\"冷灰 + 墨黑 + 暖肤色\"}"
  },
  "constraints": {
    "must_keep": [
      "人物表情有故事感",
      "灯光方向统一",
      "构图留出标题位",
      "整体克制不娱乐化"
    ],
    "avoid": [
      "出现 LOGO 与品牌元素",
      "夸张戏剧光",
      "饱和滤镜",
      "环境喧宾夺主"
    ]
  }
}
```

#### 参数策略

- 必问：身份、性别、年龄、环境
- 可默认：色调、灯光、构图
- 可随机：环境家具细节

#### 自动补全策略

- 行业自动选环境（金融 = 大理石大厅；科技 = 极简办公室；制造 = 工厂车间；创意 = 工作室）
- 灯光默认窗光 + 戏剧侧光
- 留标题位默认右上

### 变体 1：黑白文学风创始人肖像

📝 提示词

```json
{
  "type": "黑白文学风创始人肖像",
  "style": {
    "rendering": "高对比黑白 + 颗粒",
    "color_palette": "纯黑白"
  },
  "lighting": {
    "style": "硬光 + 强阴影"
  },
  "constraints": {
    "must_feel": "时间感、故事感、文学性"
  }
}
```

### 变体 2：工业 / 工厂背景创始人

📝 提示词

```json
{
  "type": "工业背景创始人肖像",
  "environment": {
    "location": "{argument name=\"factory\" default=\"产线背后，机械臂虚化\"}"
  },
  "lighting": {
    "style": "工业冷光 + 局部暖光"
  },
  "constraints": {
    "must_feel": "硬核、有制造感、可信赖"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "创始人大片自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给行业 + 人物名 / 性别，自动决定环境、风格、灯光",
  "constraints": {
    "must_feel": "可上财经杂志封面"
  }
}
```

### 避免事项

- 不要让人物正脸正中央（媒体大片不喜欢死板构图）
- 不要让背景出现真实品牌 logo
- 不要使用过度修图（皮肤要保留质感）
- 不要让灯光戏剧到“妆面感强”
- 不要忽略标题留白

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
