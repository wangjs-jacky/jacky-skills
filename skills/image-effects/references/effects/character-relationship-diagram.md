---
id: character-relationship-diagram
version: 1.0.0
title_en: Character Relationship Diagram
title_zh: 角色关系图
summary_en: Explain a narrative or relationship through a controlled sequence with consistent entities, labels, and visual grammar.
summary_zh: 用受控序列解释叙事或关系，保持实体、标注和视觉语法一致。
category: storyboards-and-sequences
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/character-relationship-diagram.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/storyboards-and-sequences/character-relationship-diagram.md,LICENSE
source_sha256s: 0cbd34b8566c968e0ba3ab7dc94c550a77ae9b958e785cbcef6ca328a8dcea3d,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 3eb7f61c62983aa49a6ad3c6f938fe2bf070a37c2359d67651e992b2b99c0f7f
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"基于一部作品 / 一个组织生成角色关系图"：

- 动漫 / 电影 / 小说人物关系图
- 公司 / 组织成员关系图
- 历史事件参与者关系图
- 团队 / 派系关系图

特征：

- 多个角色卡片（头像 + 名字 + 标签）
- 不同颜色 / 线型表示不同关系
- 视觉层级清晰（主角大、配角小）
- 强调"信息可视化 + 海报设计感"
- 整体克制不杂乱

### 适用范围

- IP 角色关系图
- 组织 / 团队结构图
- 历史事件人物关系图
- 自媒体科普图

### 何时使用

- 用户提到"关系图 / 关系网 / 角色 graph / 派系图"
- 用户希望一张图能讲清楚谁和谁是什么关系

不要使用：

- 单图 KV（用 `anime-key-visual.md`）
- 角色设定稿（用 `portraits-and-characters/character-sheet.md`）
- 一般信息图（用 `infographics/legend-heavy-infographic.md`）

### 缺失信息优先提问顺序

1. 主题（哪部作品 / 哪个组织）
2. 角色数量（建议 6-12）
3. 主角是谁（视觉权重最高）
4. 关系类型（血缘 / 友情 / 师徒 / 敌对 / 联盟 / 暗恋）
5. 风格：贴合原作画风 / 通用现代设计风
6. 比例

### 主模板：作品角色关系图海报

📖 描述

整体一张大图，多个角色卡片按关系网排布，连线区分不同关系类型，配图例与标题。

📝 提示词

```json
{
  "type": "作品角色关系图海报",
  "goal": "生成一张高完成度的角色关系图，可作为科普 / 同人 / 入坑指南海报",
  "ip": {
    "name": "{argument name=\"ip name\" default=\"鬼灭之刃\"}",
    "tone": "{argument name=\"ip tone\" default=\"贴合原作风格 + 海报设计感\"}"
  },
  "characters": {
    "count": "{argument name=\"character count\" default=\"9\"}",
    "auto_select": "{argument name=\"auto select\" default=\"true\"}",
    "rule": "若 auto_select 为 true，则按主题自动选 6-12 个最具代表性的角色",
    "user_list": "{argument name=\"user list\" default=\"\"}",
    "card_design": {
      "components": ["头像", "名字", "派系 / 身份标签"],
      "shape": "{argument name=\"card shape\" default=\"圆角方形\"}"
    }
  },
  "composition": {
    "structure": "{argument name=\"composition\" default=\"主角中心 + 同伴左右 + 敌对在远端\"}",
    "hierarchy": "主角卡片最大、重要配角中等、次要角色最小"
  },
  "relationships": {
    "types": [
      {"name": "血缘", "color": "深红", "line": "实线"},
      {"name": "友情 / 同伴", "color": "暖橙", "line": "实线"},
      {"name": "师徒", "color": "金色", "line": "双实线"},
      {"name": "敌对", "color": "深紫", "line": "锯齿线"},
      {"name": "暗恋", "color": "粉色", "line": "虚线"},
      {"name": "联盟", "color": "绿色", "line": "粗实线"}
    ],
    "annotation_rule": "在每条线中段标注关系简短文字"
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"鬼灭之刃 · 人物关系图\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"一图入坑\"}",
    "position": "顶部"
  },
  "legend": {
    "enabled": "{argument name=\"legend enabled\" default=\"true\"}",
    "position": "{argument name=\"legend position\" default=\"右下角\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"贴合原作画风的角色头像 + 现代海报排版\"}",
    "color_palette": "{argument name=\"color palette\" default=\"参考原作主色\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "主角视觉最大",
      "关系线不交叉混乱",
      "每个角色名清晰可读",
      "图例与关系类型严格对应"
    ],
    "avoid": [
      "信息过载（>15 个角色）",
      "线型 > 6 种",
      "颜色超过 8 种",
      "出现廉价流程图感"
    ]
  }
}
```

#### 参数策略

- 必问：主题、角色数量
- 可默认：关系类型、layout、图例、风格
- 可随机：背景纹理

#### 自动补全策略

- 用户给主题时：自动选代表性角色 + 自动判断关系类型
- 默认主角中心构图
- 默认 6 种关系类型，按需要简化

### 变体 1：组织 / 团队结构图

📝 提示词

```json
{
  "type": "组织 / 团队结构图",
  "ip": {
    "name": "{argument name=\"organization\" default=\"某 AI 创业公司\"}",
    "tone": "现代企业海报"
  },
  "composition": {
    "structure": "金字塔型：CEO 顶 + 高管中 + 普通员工底"
  },
  "relationships": {
    "types": [
      {"name": "汇报", "color": "灰", "line": "实线"},
      {"name": "协作", "color": "蓝", "line": "虚线"}
    ]
  },
  "constraints": {
    "must_feel": "专业 + 可发布"
  }
}
```

### 变体 2：历史事件参与者图

📝 提示词

```json
{
  "type": "历史事件参与者关系图",
  "ip": {
    "name": "{argument name=\"event\" default=\"三国赤壁之战\"}",
    "tone": "历史插画 + 海报设计"
  },
  "composition": {
    "structure": "三派对峙：曹操方 / 孙权方 / 刘备方"
  },
  "constraints": {
    "must_feel": "教科书与海报兼具"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "角色关系图自动补全",
  "mode": "auto-fill",
  "rule": "用户给一个主题（作品 / 组织 / 事件），自动选角色 + 关系 + 风格 + 图例",
  "constraints": {
    "must_feel": "一图入坑级"
  }
}
```

### 避免事项

- 不要让角色超过 15 个
- 不要让线型超过 6 种
- 不要让所有线交叉成网（要有清晰阅读顺序）
- 不要简单复制官方海报排版
- 不要让标签字号比角色名小
- 不要忽略图例

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
