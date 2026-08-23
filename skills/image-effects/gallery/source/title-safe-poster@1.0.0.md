---
id: title-safe-poster
version: 1.0.0
title_en: Title Safe Poster
title_zh: 标题安全区海报
summary_en: Build a type-led composition with protected reading zones, clear language hierarchy, and restrained supporting imagery.
summary_zh: 构建以文字为核心的版式，保护阅读区域、语言层级和克制的辅助图像。
category: typography-and-text-layout
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/title-safe-poster.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/typography-and-text-layout/title-safe-poster.md,LICENSE
source_sha256s: d04d9a577c7f9339bd90e7dc5de7daa2d34f4a05ddf124ce53a3c89189844987,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 609356d01afc0d2ec4f951c875e83d36ae25f34180964ae3ca129e76e9ed9829
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"以巨大文字本身作为主视觉"的海报：

- 大字主张（Hyper-Energetic Japanese Promo）
- 字面优先海报（type-first poster）
- 标语 / 主张型 banner
- 极致排版练习
- 文字电影海报感

特征：

- 字本身就是主体（字号超大占画面 50%+）
- 通常 3-7 个字 + 1-2 行小字
- 字体设计性强（手写 / 复古印刷 / 噪点 / 涂鸦）
- 背景克制
- 强调"信息一眼能读"

### 适用范围

- 标语 / 主张海报
- 活动 / 大促主视觉
- 字面优先 banner

### 何时使用

- 用户提到"大字 / 主张 / hero text / type-first / 文字海报"
- 用户希望"一句话就是主图"
- 用户希望日式 / 极致排版风

不要使用：

- 带产品的海报（用 `poster-and-campaigns/brand-poster.md`）
- editorial 杂志封面（用 `poster-and-campaigns/editorial-cover.md`）
- 复杂叙事（用 `scenes-and-illustrations/concept-scene.md`）

### 缺失信息优先提问顺序

1. 主标语（3-7 个字）
2. 副标 / tagline
3. 风格定位（日式昭和 / 现代极简 / 复古印刷 / 涂鸦 / 噪点）
4. 主色 1-2 个
5. 是否含小字标注 / logo
6. 比例

### 主模板：日式高能量大字海报

📖 描述

整体一张图，主体为大号标语字本身 + 副标 + 小字 + 极少的图形辅助。

📝 提示词

```json
{
  "type": "日式高能量大字海报",
  "goal": "生成一张以巨大文字本身为主视觉的高能量海报",
  "headline": {
    "text": "{argument name=\"headline\" default=\"全力疾走\"}",
    "language": "{argument name=\"language\" default=\"中文 / 日文混合\"}",
    "size": "占画面 60% 以上",
    "alignment": "{argument name=\"alignment\" default=\"居中\"}",
    "treatment": "{argument name=\"treatment\" default=\"叠加噪点 + 半色调网点 + 错位描边\"}"
  },
  "subheadline": {
    "text": "{argument name=\"subheadline\" default=\"GO ALL OUT 2026\"}",
    "size": "headline 1/4",
    "position": "{argument name=\"sub position\" default=\"headline 下方居中\"}"
  },
  "small_text": {
    "items": [
      "{argument name=\"small text 1\" default=\"4.24-5.24 SPECIAL CAMPAIGN\"}",
      "{argument name=\"small text 2\" default=\"X COLLECTIVE\"}"
    ],
    "position": "底部边角"
  },
  "design": {
    "primary_color": "{argument name=\"primary color\" default=\"#FF2C2C 朱红\"}",
    "background_color": "{argument name=\"background\" default=\"#F4EEDC 米黄\"}",
    "decoration": "{argument name=\"decoration\" default=\"4-5 个简单几何图形（圆 / 三角 / 短粗箭头），刻意留白\"}",
    "typography_family": "{argument name=\"font family\" default=\"现代日式 sans + 一个手写 accent\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "标语字必须能一眼读出",
      "字面占画面绝对主体",
      "颜色 ≤ 3",
      "字体 ≤ 2 家族"
    ],
    "avoid": [
      "标语字过小被装饰淹没",
      "装饰图形 > 6 个",
      "字体超过 3 种",
      "出现错别字"
    ]
  }
}
```

#### 参数策略

- 必问：标语、副标、风格、主色
- 可默认：layout、装饰、字体
- 可随机：装饰具体形状

#### 自动补全策略

- 用户给标语 + 风格关键词时：自动决定字处理 + 配色 + 装饰
- 默认日式高能量 = 噪点 + 半色调 + 错位
- 默认 3:4

### 变体 1：极简瑞士排版大字海报

📝 提示词

```json
{
  "type": "极简瑞士排版大字海报",
  "headline": {
    "treatment": "无装饰 + 无衬线 + 严格栅格"
  },
  "design": {
    "primary_color": "纯黑",
    "background_color": "纯白",
    "decoration": "无 / 仅一条细横线"
  },
  "constraints": {
    "must_feel": "瑞士平面 / Minimal"
  }
}
```

### 变体 2：复古印刷大字海报

📝 提示词

```json
{
  "type": "复古印刷大字海报",
  "headline": {
    "treatment": "套印偏移 + 油墨晕染 + 微微脏感"
  },
  "design": {
    "primary_color": "复古红",
    "background_color": "做旧米纸",
    "decoration": "复古印刷符号"
  },
  "constraints": {
    "must_feel": "1960s letterpress"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "大字海报自动补全",
  "mode": "auto-fill",
  "rule": "用户给一句标语，自动决定风格 + 配色 + 字处理 + 装饰",
  "constraints": {
    "must_feel": "可印刷 + 一眼能读"
  }
}
```

### 避免事项

- 不要让标语字小于画面 40%
- 不要让装饰多到喧宾夺主
- 不要让标语出现错别字（最严重）
- 不要让字体 > 2 家族
- 不要让背景饱和度 > 主标语
- 不要让小字塞超过 3 行

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
