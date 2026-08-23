---
id: game-screenshot-mockup
version: 1.0.0
title_en: Game Screenshot Mockup
title_zh: 游戏截图样机
summary_en: Create a presentation-ready visual asset with a clear focal object, credible framing, and reusable composition.
summary_zh: 生成可直接展示的视觉素材，保持焦点对象清楚、画面可信且构图可复用。
category: assets-and-props
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/game-screenshot-mockup.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/assets-and-props/game-screenshot-mockup.md,LICENSE
source_sha256s: 5b50f87cd1edcfba4bb1eddf901f21d5d491f120e52a628a74d8c9c9f9c39628,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: c79440f1395c4e9136b20b1c39c56395ab1895a26ed6d619ecd44d6b5027c319
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"伪造一张游戏内截图"的视觉：

- 开放世界游戏截图
- RPG 战斗截图
- 像素 / 体素游戏截图
- 视觉小说截图
- 游戏 UI mockup

特征：

- 整体看起来"像真实游戏内画面"
- 含游戏 UI（HUD / 任务面板 / 血条 / 小地图）
- 有视角语言（第一人称 / 第三人称 / 俯视 / 等距）
- 强调游戏感而非纯插画
- 通常带文字气泡 / 任务提示

### 适用范围

- 游戏内截图 mockup
- 游戏宣传图（伪截图）
- 游戏立项 demo 视觉
- 直播缩略图（伪游戏画面）

### 何时使用

- 用户提到"游戏截图 / game screenshot / mockup / HUD / UI"
- 用户希望"看起来像游戏画面"而不是插画

不要使用：

- 动漫 KV（用 `storyboards-and-sequences/anime-key-visual.md`）
- 游戏立项 pitch（用 `grids-and-collages/anime-pitch-board.md`）
- 角色设定（用 `portraits-and-characters/character-sheet.md`）

### 缺失信息优先提问顺序

1. 游戏类型（开放世界 / RPG / 像素 / 视觉小说 / 模拟）
2. 视角（第一人称 / 第三人称 / 俯视 / 等距）
3. 场景（户外 / 室内 / 城市 / 战斗）
4. 主角描述（如有）
5. UI 元素（HUD / 血条 / 任务 / 小地图）
6. 比例

### 主模板：开放世界游戏截图

📖 描述

整体一张图，模拟真实游戏内截图，含 HUD UI。

📝 提示词

```json
{
  "type": "开放世界游戏截图",
  "goal": "生成一张看起来像真实游戏内截图的视觉",
  "game_meta": {
    "game_name": "{argument name=\"game name\" default=\"FROZEN FANTASIA\"}",
    "engine_feel": "{argument name=\"engine feel\" default=\"现代 3A 引擎（接近 Unreal 5 渲染）\"}",
    "perspective": "{argument name=\"perspective\" default=\"第三人称越肩\"}"
  },
  "scene": {
    "environment": "{argument name=\"environment\" default=\"雪原 + 远景城堡 + 极光\"}",
    "time_of_day": "{argument name=\"time\" default=\"黄昏\"}",
    "weather": "{argument name=\"weather\" default=\"细雪\"}",
    "lighting": "{argument name=\"lighting\" default=\"冷蓝主光 + 暖金边缘光\"}"
  },
  "character": {
    "description": "{argument name=\"character\" default=\"少女主角，银白长发，背身，正在拔剑\"}",
    "position": "画面下三分之一，背身朝远景"
  },
  "ui_elements": {
    "hud": {
      "enabled": "{argument name=\"hud enabled\" default=\"true\"}",
      "items": [
        "{argument name=\"hud item 1\" default=\"左下：血条 + 蓝条 + 角色头像\"}",
        "{argument name=\"hud item 2\" default=\"右下：技能槽 4 格 + 物品栏\"}",
        "{argument name=\"hud item 3\" default=\"左上：小地图（圆形）+ 当前坐标\"}",
        "{argument name=\"hud item 4\" default=\"右上：任务追踪 - '寻找春之源'\"}"
      ]
    },
    "subtitle": {
      "enabled": "{argument name=\"subtitle enabled\" default=\"true\"}",
      "speaker": "{argument name=\"speaker\" default=\"狐狸伙伴\"}",
      "text": "{argument name=\"subtitle text\" default=\"前面就是冰封峡谷了，要小心\"}"
    },
    "interaction_prompt": {
      "enabled": "{argument name=\"prompt enabled\" default=\"true\"}",
      "text": "{argument name=\"prompt\" default=\"按 [E] 调查\"}"
    }
  },
  "style": {
    "rendering": "{argument name=\"rendering\" default=\"PBR 渲染 + 高动态范围 + 微微胶片噪点\"}",
    "color_palette": "{argument name=\"color palette\" default=\"冰蓝 + 月白 + 暖金\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "constraints": {
    "must_keep": [
      "看起来像游戏内截图（有真实 HUD）",
      "HUD 与场景颜色不冲突",
      "字幕字体与 HUD 字体统一",
      "主角与场景比例正确"
    ],
    "avoid": [
      "看起来像静态插画（无 HUD）",
      "HUD 元素塞 > 8 个",
      "UI 风格混杂（像素 + 现代 同框）",
      "字幕过长 / 错字"
    ]
  }
}
```

#### 参数策略

- 必问：游戏类型、视角、场景
- 可默认：UI 元素、字幕、配色
- 可随机：环境细节

#### 自动补全策略

- 用户给游戏概念时：自动决定视角 / HUD / 字幕
- 默认 16:9
- 默认现代 3A 渲染

### 变体 1：像素游戏截图

📝 提示词

```json
{
  "type": "像素游戏截图",
  "game_meta": {
    "engine_feel": "16-bit JRPG 风（如圣剑传说 3）",
    "perspective": "俯视 / 等距"
  },
  "style": {
    "rendering": "像素艺术 + 16 色调色板",
    "color_palette": "16 色复古 RPG 调色"
  },
  "ui_elements": {
    "hud": {
      "items": ["底部对话框 + 角色立绘"]
    }
  },
  "constraints": {
    "must_feel": "FC / SNES JRPG"
  }
}
```

### 变体 2：视觉小说截图

📝 提示词

```json
{
  "type": "视觉小说截图",
  "game_meta": {
    "engine_feel": "Galgame / Visual Novel",
    "perspective": "第一人称（看角色）"
  },
  "ui_elements": {
    "hud": null,
    "subtitle": {
      "enabled": true,
      "speaker": "{argument name=\"speaker\" default=\"女主角\"}",
      "text": "..."
    }
  },
  "style": {
    "rendering": "anime 半厚涂 + 柔光"
  },
  "constraints": {
    "must_feel": "VN 标准对话场景"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "游戏截图自动补全",
  "mode": "auto-fill",
  "rule": "用户给一句游戏概念，自动决定视角 / 场景 / HUD / 主角",
  "constraints": {
    "must_feel": "可作为 Steam 商店截图"
  }
}
```

### 避免事项

- 不要让 HUD 元素超过 8 个
- 不要让 UI 风格与游戏类型脱节（像素游戏不应有现代毛玻璃 HUD）
- 不要让字幕超过 2 行
- 不要让主角占画面过大压过 HUD
- 不要让"截图"看起来像静态插画（HUD 是关键标识）
- 不要让任务面板出现明显错字 / 乱码

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
