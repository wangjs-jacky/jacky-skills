---
id: bilingual-layout-visual
version: 1.0.0
title_en: Bilingual Layout Visual
title_zh: 双语版式视觉
summary_en: Build a type-led composition with protected reading zones, clear language hierarchy, and restrained supporting imagery.
summary_zh: 构建以文字为核心的版式，保护阅读区域、语言层级和克制的辅助图像。
category: typography-and-text-layout
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/bilingual-layout-visual.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/typography-and-text-layout/bilingual-layout-visual.md,LICENSE
source_sha256s: e129d4e257ce2fa72930c52404df30e2ea46a942596b4cf4148f820eed01df3f,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 5ad59137330084108ff7666a92a76a4fe2807a50b3c5aeac07f87dbf6d0a4b14
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"中英 / 中日 等双语并置的版式视觉"：

- 中英对照海报
- 中日对照科普图
- 双语展会 / 文化节物料
- 跨文化品牌主视觉
- 学术 / 文化机构出版物封面

特征：

- 两种语言并置（不是简单翻译，是设计语言）
- 通常一种语言为主、一种为辅 / 注解
- 字体严格分离（中文用中文字体 / 英文用英文字体）
- 字号层级清晰
- 重视留白与对齐

### 适用范围

- 中英 / 中日海报
- 跨文化品牌物料
- 学术 / 文化展览主视觉

### 何时使用

- 用户提到"中英 / 中日 / 双语 / bilingual"
- 用户希望文化 / 学术 / 高级感的双语视觉

不要使用：

- 单语大字海报（用 `title-safe-poster.md`）
- 纯产品海报（用 `poster-and-packaging/brand-poster.md`）
- 杂志封面（用 `poster-and-campaigns/editorial-cover.md`）

### 缺失信息优先提问顺序

1. 主语言 + 辅语言
2. 主标语 + 副标语（两种语言分别给）
3. 主题 / 行业
4. 字体风格（serif / sans / 衬线 / 圆体）
5. 主色 1-2 个
6. 比例

### 主模板：中英对照文化海报

📖 描述

整体一张图，中文为主、英文为辅，通过严格的版式系统建立层级。

📝 提示词

```json
{
  "type": "中英对照文化海报",
  "goal": "生成一张设计感强的中英双语海报，可作为文化活动 / 展览 / 品牌主视觉",
  "languages": {
    "primary": "{argument name=\"primary language\" default=\"中文\"}",
    "secondary": "{argument name=\"secondary language\" default=\"英文\"}"
  },
  "title_block": {
    "main_zh": "{argument name=\"main title zh\" default=\"东方不复\"}",
    "main_en": "{argument name=\"main title en\" default=\"THE ORIENT REIMAGINED\"}",
    "subtitle_zh": "{argument name=\"subtitle zh\" default=\"当代东方美学展\"}",
    "subtitle_en": "{argument name=\"subtitle en\" default=\"A Contemporary Eastern Aesthetic Exhibition\"}",
    "alignment": "{argument name=\"title alignment\" default=\"左上对齐\"}",
    "hierarchy_rule": "中文最大 → 英文中等 → 中文副标 → 英文副标"
  },
  "meta": {
    "date": "{argument name=\"date\" default=\"2026.5.1 - 2026.5.31\"}",
    "venue": "{argument name=\"venue\" default=\"X 美术馆 · 上海\"}",
    "presenter": "{argument name=\"presenter\" default=\"X CULTURAL FOUNDATION\"}"
  },
  "main_visual": {
    "description": "{argument name=\"main visual\" default=\"东方山水 + 现代几何切割\"}",
    "position": "{argument name=\"main visual position\" default=\"右下大区\"}"
  },
  "design": {
    "primary_color": "{argument name=\"primary color\" default=\"#A52A2A 朱砂红\"}",
    "background_color": "{argument name=\"background\" default=\"#F4EEDC 古纸米黄\"}",
    "zh_font": "{argument name=\"zh font\" default=\"宋体 / 楷体 / 现代衬线\"}",
    "en_font": "{argument name=\"en font\" default=\"现代 serif（Playfair / Cormorant）\"}",
    "grid": "{argument name=\"grid\" default=\"严格 12 栏栅格 + 细辅助线（最终输出隐藏）\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "中英文字体严格分离",
      "层级清晰：标题 > 副标 > 元信息",
      "留白充分",
      "色板 ≤ 3 色"
    ],
    "avoid": [
      "中英用同一字体（最常见错误）",
      "翻译错误（中英要等价不要错译）",
      "中英文字号差异过大或过小",
      "塞太多元素"
    ]
  }
}
```

#### 参数策略

- 必问：主标语中英文、副标
- 可默认：layout、字体、配色、栅格
- 可随机：主视觉细节

#### 自动补全策略

- 用户给中文主标语时：自动生成英文翻译 + 副标 + 元信息
- 字体默认中文衬线 + 英文 serif 配对
- 默认 3:4

### 变体 1：中日对照设计

📝 提示词

```json
{
  "type": "中日对照设计",
  "languages": {
    "primary": "日文",
    "secondary": "中文"
  },
  "title_block": {
    "main_zh": "{argument name=\"zh\" default=\"漫步京都\"}",
    "main_en": "{argument name=\"jp\" default=\"京を歩く\"}"
  },
  "design": {
    "zh_font": "黑体 / 思源宋体",
    "en_font": "ヒラギノ明朝 / 源ノ明朝（注：实际是日文字体）"
  },
  "constraints": {
    "must_feel": "日式杂志感"
  }
}
```

### 变体 2：科普 / 学术风双语

📝 提示词

```json
{
  "type": "科普 / 学术风双语海报",
  "title_block": {
    "main_zh": "{argument name=\"main zh\" default=\"光合作用\"}",
    "main_en": "{argument name=\"main en\" default=\"PHOTOSYNTHESIS\"}"
  },
  "main_visual": {
    "description": "示意图 + 标注线"
  },
  "design": {
    "primary_color": "学术墨绿",
    "background_color": "白色"
  },
  "constraints": {
    "must_feel": "教科书插页 + 现代设计"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "双语版式自动补全",
  "mode": "auto-fill",
  "rule": "用户给主标语（一种语言），自动生成另一种语言 + 副标 + 元信息 + 设计",
  "constraints": {
    "must_feel": "可发美术馆"
  }
}
```

### 避免事项

- 不要让中英用同一字体
- 不要让中英翻译错位 / 错译
- 不要让中英字号相同（应有主次层级）
- 不要让两种语言塞满画面（要留白）
- 不要混用 > 2 种字体家族（中文 1 + 英文 1 是上限）
- 不要让英文用宋体或日文字体（错配）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
