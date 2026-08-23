---
id: cultural-portrait-series
version: 1.0.0
title_en: Cultural Portrait Series
title_zh: 文化主题肖像组
summary_en: Create a coherent profile visual that preserves subject cues while applying a controlled, original art direction.
summary_zh: 生成连贯的人设视觉，在保留主体线索的同时应用克制且原创的美术方向。
category: avatars-and-profile
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/cultural-portrait-series.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/avatars-and-profile/cultural-portrait-series.md,LICENSE
source_sha256s: 1ccdb29eeff0498e939486ec18d33b9994cbd619a10960bc901eed0adbad4519,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: d8938c5977f755b9d10a628c8cff146798100bfb7951c59638cb17fc547d5ba5
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"基于文化 / 历史 / 神话主题，批量生成系列肖像"：

- 朝代皇帝系列（明朝皇帝集 / 清朝皇帝集）
- 神话角色系列（希腊神话 / 北欧神话）
- 历史名人系列
- 经典文学角色系列
- 民族服饰系列

特征：

- 多个角色，每个角色一格
- 每格有名字 / 称号标签
- 风格统一（同一画师 / 同一时代风）
- 适合教育 / 文创 / 主题营销

### 适用范围

- 朝代皇帝 / 名人系列
- 神话 / 文学角色系列
- 民族 / 文化主题系列

### 何时使用

- 用户提到"系列 / 集合 / 朝代 / 神话 / 历史人物"
- 用户希望多个角色 + 标签

不要使用：

- 同一人多版本（用 `character-grid-portrait.md`）
- 单张人物风格转换（用 `style-transfer-selfie.md`）
- 角色 IP 设定稿（用 `portraits-and-characters/character-sheet.md`）

### 缺失信息优先提问顺序

1. 主题（朝代 / 神话 / 文学 / 文化）
2. 角色数量（建议 6-12）
3. 是否需要列名 / 称号 / 简短说明
4. 风格：水墨写实 / 油画 / 卡通 / 半写实
5. 是否参考某种风格（用户提供参考图 / 经典画师风）
6. 比例

### 主模板：朝代皇帝系列肖像

📖 描述

整体一张大图，包含若干个皇帝肖像，每个肖像下方有谥号 + 名讳。

📝 提示词

```json
{
  "type": "朝代皇帝系列肖像",
  "goal": "生成一张包含某朝代多位皇帝的系列肖像图，可作为教育 / 文创 / 自媒体科普图",
  "theme": {
    "dynasty": "{argument name=\"dynasty\" default=\"明朝\"}",
    "subject_count": "{argument name=\"subject count\" default=\"9\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"中式工笔写实人像 + 略带水墨感\"}",
    "consistency": "所有肖像必须由同一画师风格绘制",
    "color_palette": "{argument name=\"color palette\" default=\"低饱和金 + 朱红 + 黑\"}"
  },
  "layout": {
    "format": "{argument name=\"format\" default=\"3x3 grid\"}",
    "background": "{argument name=\"background\" default=\"米色绢布纹理\"}",
    "panel_design": {
      "portrait_shape": "圆角方形 / 椭圆",
      "label_position": "肖像下方居中",
      "label_content": "谥号 + 名讳，如 '太祖 朱元璋'"
    }
  },
  "subjects": {
    "auto_select": "{argument name=\"auto select\" default=\"true\"}",
    "rule": "若 auto_select 为 true，则按朝代顺序选取代表性皇帝；若用户指定列表，则按用户列表",
    "user_list": "{argument name=\"user list\" default=\"\"}"
  },
  "constraints": {
    "must_keep": [
      "所有肖像同一画师风格",
      "服饰、配饰严格符合所属朝代",
      "标签清晰可读且历史准确",
      "肖像之间均匀分布"
    ],
    "avoid": [
      "出现错朝代服饰",
      "肖像风格漂移（每个像不同画师）",
      "标签错字 / 错位",
      "背景过度装饰"
    ]
  }
}
```

#### 参数策略

- 必问：主题、数量
- 可默认：风格、layout、配色、标签
- 可随机：背景纹理细节

#### 自动补全策略

- 用户给朝代时：自动选代表性 9 位皇帝
- 风格默认中式工笔
- 标签默认"谥号 + 名讳"

### 变体 1：神话角色系列

📝 提示词

```json
{
  "type": "神话角色系列肖像",
  "theme": {
    "mythology": "{argument name=\"mythology\" default=\"希腊神话\"}",
    "subject_count": 12
  },
  "style": {
    "art_style": "古典油画 + 厚涂",
    "color_palette": "深蓝 + 金 + 暖棕"
  },
  "layout": {
    "format": "4x3 grid",
    "panel_design": {
      "label_content": "神祇名 + 司掌领域"
    }
  },
  "subjects": {
    "user_list": "宙斯 / 赫拉 / 波塞冬 / 哈迪斯 / 雅典娜 / 阿波罗 / 阿尔忒弥斯 / 阿瑞斯 / 阿芙洛狄忒 / 赫尔墨斯 / 赫菲斯托斯 / 狄俄尼索斯"
  },
  "constraints": {
    "must_feel": "古典油画馆藏感"
  }
}
```

### 变体 2：经典文学角色系列

📝 提示词

```json
{
  "type": "经典文学角色系列",
  "theme": {
    "literature": "{argument name=\"literature\" default=\"红楼梦十二金钗\"}",
    "subject_count": 12
  },
  "style": {
    "art_style": "工笔重彩 + 古风插画",
    "color_palette": "胭脂红 + 月白 + 翠绿"
  },
  "constraints": {
    "must_feel": "古典文学画册级"
  }
}
```

### 变体 3：民族服饰系列

📝 提示词

```json
{
  "type": "民族服饰系列肖像",
  "theme": {
    "subject_count": 9,
    "category": "{argument name=\"category\" default=\"中国 56 民族代表 9 选\"}"
  },
  "style": {
    "art_style": "高分辨率写实人像 + 棚拍",
    "color_palette": "保留各民族服饰原色"
  },
  "constraints": {
    "must_feel": "尊重文化、服饰准确"
  }
}
```

### 变体 4：自动补全模式

📝 提示词

```json
{
  "type": "文化人物系列自动补全",
  "mode": "auto-fill",
  "rule": "用户给一个文化主题，自动选角色列表、风格、layout、标签",
  "constraints": {
    "must_feel": "教科书级 / 文创可发布"
  }
}
```

### 避免事项

- 不要混淆朝代服饰（最常见错误）
- 不要让画风漂移（同一系列必须统一）
- 不要在文化敏感主题上使用戏谑表情
- 不要把神祇画成 cosplay 风
- 不要让标签错字 / 漏字
- 不要让单格人物超过 12 个，否则视觉破碎

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
