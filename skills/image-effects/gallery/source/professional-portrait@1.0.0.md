---
id: professional-portrait
version: 1.0.0
title_en: Professional Portrait
title_zh: 职业肖像
summary_en: Create a polished original character portrait with stable identity anchors, intentional staging, and professional finish.
summary_zh: 生成完成度高的原创人物肖像，保持身份锚点、明确调度和专业质感。
category: portraits-and-characters
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/professional-portrait.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/portraits-and-characters/professional-portrait.md,LICENSE
source_sha256s: 7beec1f57c9026e53e677922944dbd9827eac7d1a67707a73df9fd9781f180df,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 2a0aca30292b9df5f8213c8e63842dce56c5e110c4b0f6fa15e89a360f9579e6
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“职业级 / 商务级 / LinkedIn 级” 肖像视觉：

- 职业头像
- LinkedIn 主图
- 公司官网团队页
- 媒体专访配图
- 个人品牌主图

特征：

- 干净背景
- 专业灯光
- 自然表情
- 强调可信感
- 高级感来自“克制”而非“华丽”

### 适用范围

- 商务头像
- 公司官网团队照
- LinkedIn / 公开演讲使用照
- 媒体专访配图

### 何时使用

- 用户提到“职业头像 / LinkedIn / 商务照 / 公司官网照”
- 用户希望视觉看起来可信、专业、克制

不要使用：

- 创始人媒体大片（用 `founder-portrait.md`）
- 虚拟主播 / VTuber（用 `virtual-host.md`）
- 角色三视图（用 `character-sheet.md`）

### 缺失信息优先提问顺序

1. 性别 / 年龄段 / 种族
2. 行业 / 职业（影响穿着与背景）
3. 风格：经典商务 / 现代休闲 / 创意行业
4. 构图：胸像 / 半身
5. 背景：纯色 / 办公环境 / 自然光
6. 表情：微笑 / 自然 / 严谨

### 主模板：现代商务职业肖像

📖 描述

整体一张职业肖像，主体为人物胸像，干净背景，自然光或柔和影棚光，自然表情，可直接用作 LinkedIn 主图。

📝 提示词

```json
{
  "type": "现代商务职业肖像",
  "goal": "生成一张可直接作为 LinkedIn 主图 / 公司官网团队页 / 媒体专访配图的职业肖像",
  "subject": {
    "gender": "{argument name=\"gender\" default=\"东亚男性\"}",
    "age_range": "{argument name=\"age range\" default=\"30-40 岁\"}",
    "appearance": "{argument name=\"appearance\" default=\"短发干净，戴细框眼镜\"}",
    "outfit": "{argument name=\"outfit\" default=\"深蓝色西装外套 + 浅灰色衬衫，无领带\"}"
  },
  "expression": {
    "mood": "{argument name=\"mood\" default=\"自然微笑，眼神平稳\"}",
    "gaze": "{argument name=\"gaze\" default=\"望向镜头\"}"
  },
  "composition": {
    "shot": "{argument name=\"shot\" default=\"胸像\"}",
    "framing": "{argument name=\"framing\" default=\"人物居中略偏左，留 1/3 给背景\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"浅灰渐变 + 微微虚化办公环境\"}",
    "depth_of_field": "{argument name=\"dof\" default=\"浅景深\"}"
  },
  "lighting": {
    "key_light": "{argument name=\"key light\" default=\"45° 柔光\"}",
    "fill_light": "{argument name=\"fill light\" default=\"右侧弱补光\"}",
    "rim_light": "{argument name=\"rim light\" default=\"无明显轮廓光\"}",
    "color_temp": "{argument name=\"color temp\" default=\"自然偏暖\"}"
  },
  "style": {
    "rendering": "高分辨率人像摄影 + 自然肤质",
    "post_processing": "克制磨皮，保留毛孔与自然纹理"
  },
  "constraints": {
    "must_keep": [
      "人物自然不僵硬",
      "眼神聚焦",
      "肤质真实不过度磨皮",
      "穿着与行业匹配"
    ],
    "avoid": [
      "夸张特效灯光",
      "滤镜假皮肤",
      "出现品牌 logo",
      "背景元素喧宾夺主"
    ]
  }
}
```

#### 参数策略

- 必问：性别、年龄、行业、构图
- 可默认：背景、灯光、后期
- 可随机：眼镜样式、配饰

#### 自动补全策略

- 行业自动决定穿着（金融 = 西装；科技 = 休闲衬衫；创意 = 黑 T + 外套）
- 表情默认“自然微笑”
- 背景默认“浅灰渐变 + 虚化环境”

### 变体 1：户外自然光肖像

📝 提示词

```json
{
  "type": "户外自然光职业肖像",
  "background": {
    "type": "{argument name=\"outdoor scene\" default=\"绿色公园虚化背景\"}"
  },
  "lighting": {
    "key_light": "自然顺光",
    "color_temp": "暖金时段"
  },
  "constraints": {
    "must_feel": "自然、亲切、生活感"
  }
}
```

### 变体 2：纯色背景棚拍

📝 提示词

```json
{
  "type": "棚拍职业肖像",
  "background": {
    "type": "{argument name=\"backdrop\" default=\"中性灰背景纸\"}",
    "depth_of_field": "无"
  },
  "lighting": {
    "key_light": "蝴蝶光",
    "fill_light": "对称柔光"
  },
  "constraints": {
    "must_feel": "杂志大片级"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "职业肖像自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给行业 + 性别 + 年龄，自动决定穿着 / 灯光 / 背景",
  "constraints": {
    "must_feel": "可直接换 LinkedIn 主图"
  }
}
```

### 避免事项

- 不要过度磨皮，皮肤要保留质感
- 不要用过度饱和滤镜
- 不要让背景出现可识别第三方 logo
- 不要让人物穿着与行业明显不匹配
- 不要使用夸张戏剧光（除非用户明确要求）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
