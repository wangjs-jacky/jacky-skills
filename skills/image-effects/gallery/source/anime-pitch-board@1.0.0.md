---
id: anime-pitch-board
version: 1.0.0
title_en: Anime Pitch Board
title_zh: 动漫提案板
summary_en: Organize one concept into a dense but readable multi-panel board with stable subject identity and deliberate visual rhythm.
summary_zh: 把一个概念组织为密集但易读的多面板画板，保持主体一致和清晰视觉节奏。
category: grids-and-collages
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/anime-pitch-board.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/grids-and-collages/anime-pitch-board.md,LICENSE
source_sha256s: f92c49d833ffb9598dc4edab42409309b67b8d89fb0cd7c65dbccd7ea00e764b,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: a2969c8ea1b311b9b9f5d3e4ab91ceae58be340e5e469609c083e24ea4a361fa
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"一张图里同时呈现 poster + 角色 + 设定 + 文案"的立项级文档视觉：

- 动漫 / 游戏立项 pitch
- IP 全套设定文档
- 影视项目 pitch deck 单页
- 出版社新作品提案
- 动画工作室 in-house 提案

特征：

- 一张大图分多区块
- 主区：海报 / KV
- 次区：角色卡 / 设定 / 世界观
- 文案区：标题 + tagline + log line
- 看起来"专业项目文档"而不是单图

### 适用范围

- 动漫 / 游戏立项 pitch
- 影视提案
- IP 全套提案

### 何时使用

- 用户提到"立项 / pitch / 提案 / 全套设定 / 一张图讲完作品"
- 用户希望出"项目文档级"视觉

不要使用：

- 单图 KV（用 `storyboards-and-sequences/anime-key-visual.md`）
- 角色设定稿（用 `portraits-and-characters/character-sheet.md`）
- 关系图（用 `storyboards-and-sequences/character-relationship-diagram.md`）
- 一般营销海报（用 `poster-and-campaigns/brand-poster.md`）

### 缺失信息优先提问顺序

1. 作品名 + 一句 tagline
2. 题材 + 类型（科幻 / 校园 / 末世 / ...）
3. 主角数 + 主角描述
4. 世界观 / 时代
5. 风格基底
6. 是否需要日 / 英 / 中 标题

### 主模板：动漫立项 Pitch Board

📖 描述

整体一张大图，分为 KV 主区 + 角色卡区 + 世界观区 + 文案区。

📝 提示词

```json
{
  "type": "动漫立项 Pitch Board",
  "goal": "生成一张可作为动漫 / 游戏立项 pitch 的全套视觉文档单页",
  "ip": {
    "title": "{argument name=\"title\" default=\"霜白幻想曲\"}",
    "title_localized": "{argument name=\"title localized\" default=\"FROZEN FANTASIA\"}",
    "tagline": "{argument name=\"tagline\" default=\"这场雪，下了一千年\"}",
    "logline": "{argument name=\"logline\" default=\"在永恒冬季的王国里，一个忘记自己名字的少女遇到一只能听懂雪的狐狸，他们决定一起寻找春天的源头\"}",
    "genre": "{argument name=\"genre\" default=\"奇幻 / 治愈 / 冒险\"}"
  },
  "regions": {
    "main_kv": {
      "position": "{argument name=\"kv position\" default=\"上半部分占 60%\"}",
      "content": "{argument name=\"kv content\" default=\"少女主角站在雪原中，背景为冰封城堡，狐狸在脚边\"}",
      "style": "电影海报级 anime 厚涂"
    },
    "character_cards": {
      "position": "{argument name=\"character region\" default=\"左下\"}",
      "count": "{argument name=\"character count\" default=\"3\"}",
      "items": [
        "{argument name=\"char 1\" default=\"少女主角 · 霜白发 · 失忆\"}",
        "{argument name=\"char 2\" default=\"剑士同伴 · 黑发 · 守护者\"}",
        "{argument name=\"char 3\" default=\"狐狸伙伴 · 雪白 · 通灵\"}"
      ],
      "card_design": "圆角方形头像 + 名 + 一句简介"
    },
    "world_setting": {
      "position": "{argument name=\"world region\" default=\"右下\"}",
      "content": "{argument name=\"world content\" default=\"被冬天封印一千年的浮空王国，唯一的活物是飘雪与极光\"}",
      "extras": ["地图缩略图（可选）", "重要道具图标 3 个"]
    },
    "title_block": {
      "position": "{argument name=\"title position\" default=\"画面顶部居中\"}",
      "components": ["主标题（大字）", "本地化标题", "tagline（小字斜体）"]
    },
    "footer_meta": {
      "position": "底部",
      "content": "{argument name=\"footer\" default=\"PRESENTED BY · X STUDIO · 2026\"}"
    }
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"现代 anime + 半写实 + 厚涂背景\"}",
    "color_palette": "{argument name=\"color palette\" default=\"冰蓝 + 月白 + 暖金\"}",
    "typography": "标题 serif + 正文 sans"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "KV 区始终是视觉锚点",
      "角色卡风格统一",
      "信息分区清晰、不混乱",
      "色板严格统一"
    ],
    "avoid": [
      "信息塞太多导致 KV 区被挤压",
      "角色卡风格漂移",
      "标题字体 > 2 种",
      "缺少 tagline / logline"
    ]
  }
}
```

#### 参数策略

- 必问：作品名、tagline、主角
- 可默认：layout、风格、色板、字体
- 可随机：背景细节

#### 自动补全策略

- 用户给一句作品概念时：自动展开标题 + tagline + logline + 主角 + 世界观
- 默认 KV 占 60% + 角色卡 + 世界观分区
- 默认竖版 3:4

### 变体 1：游戏立项 pitch

📝 提示词

```json
{
  "type": "游戏立项 pitch board",
  "regions": {
    "main_kv": {"content": "游戏主视觉 + 玩法核心场景"},
    "character_cards": {"content": "可玩角色 + 简介"},
    "world_setting": {"content": "玩法核心循环 + 关键系统"}
  },
  "constraints": {
    "must_feel": "GDC pitch 级"
  }
}
```

### 变体 2：影视项目 pitch

📝 提示词

```json
{
  "type": "影视项目 pitch board",
  "regions": {
    "main_kv": {"content": "电影主视觉"},
    "character_cards": {"content": "主要角色 + 演员候选"},
    "world_setting": {"content": "时代 + 美术参考"}
  },
  "constraints": {
    "must_feel": "可发投资人"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "Pitch board 自动补全",
  "mode": "auto-fill",
  "rule": "用户给一句作品概念，自动展开所有区块",
  "constraints": {
    "must_feel": "可作为正式 pitch deck 首页"
  }
}
```

### 避免事项

- 不要让 KV 区被挤压成不到 50%
- 不要让角色卡风格漂移
- 不要让信息分区混乱
- 不要漏掉 tagline / logline
- 不要让色板出现 > 4 主色
- 不要让标题字体超过 2 种

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
