---
id: policy-style-slide
version: 1.0.0
title_en: Policy Style Slide
title_zh: 政策风格幻灯片
summary_en: Compose dense material into a polished visual document page with strict hierarchy, readable text zones, and editorial rhythm.
summary_zh: 把密集材料编排为精致视觉文档页，保持严格层级、可读文字区和编辑节奏。
category: slides-and-visual-docs
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/policy-style-slide.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/slides-and-visual-docs/policy-style-slide.md,LICENSE
source_sha256s: 480ff8760b07032a7da4bdcf2708be32c07d8f991953679ec63d3b1933c742b9,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 4b7edd8f34fd49b25ba6aa77e6cc8e39d2fbc2760130e3264b2286abcd89c34b
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“政府公告 / 政策解读 / 公共宣传”风格的视觉页：

- 政府政策解读
- 行业白皮书一页摘要
- 公共服务说明
- 法规变更说明
- 通知 / 公告主视觉

特征：

- 严谨克制
- 主标题大、官方感
- 信息分块清晰
- 配色稳重（深蓝 / 深红 / 深绿 + 米色）
- 适当装饰但不喧闹

### 适用范围

- 政策解读图
- 政府公告主图
- 行业白皮书摘要图
- 法规变更说明图
- 公共宣传海报式 Slide

### 何时使用

- 用户提到“政策解读 / 政府公告 / 白皮书 / 公共宣传 / 严谨说明”
- 用户希望视觉看起来“权威、严肃、不娱乐化”

不要使用：

- 用户要的是讲解课件（用 `dense-explainer-slides.md`）
- 用户要的是商业报告（用 `visual-report-page.md`）
- 用户要的是科普教学（用 `educational-diagram-slide.md`）

### 缺失信息优先提问顺序

1. 主题（政策名 / 公告名 / 法规名）
2. 颁布单位 / 发布机构
3. 核心内容章节（3-5 节）
4. 关键数字或日期
5. 配色：政红 / 政蓝 / 政绿 / 中性灰
6. 是否需要二维码 / 联系方式

### 主模板：政策解读单页 Slide

📖 描述

整体页面：顶部官方 logo / 机构名 + 主标题 + 副标题；中间多个分块说明 + 数据高亮；底部出处 / 二维码 / 发布时间。

📝 提示词

```json
{
  "type": "政策解读单页 Slide",
  "goal": "生成一张严谨、权威、可作为政府公告 / 政策解读用途的视觉页",
  "style": {
    "color_palette": "{argument name=\"color palette\" default=\"政红 + 米白 + 深灰\"}",
    "tone": "{argument name=\"visual tone\" default=\"严谨、克制、官方\"}",
    "typography": "{argument name=\"typography\" default=\"思源宋体大标题 + 思源黑体正文\"}"
  },
  "header": {
    "agency_name": "{argument name=\"agency name\" default=\"国家某某局\"}",
    "agency_logo": "{argument name=\"agency logo\" default=\"国徽 / 机构徽\"}",
    "main_title": "{argument name=\"main title\" default=\"关于推进某行业高质量发展的指导意见\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"政策核心要点解读\"}",
    "release_date": "{argument name=\"release date\" default=\"2026 年 4 月 24 日\"}"
  },
  "sections": {
    "count": "{argument name=\"section count\" default=\"5\"}",
    "items": [
      "{argument name=\"section 1\" default=\"政策背景\"}",
      "{argument name=\"section 2\" default=\"主要目标\"}",
      "{argument name=\"section 3\" default=\"重点任务\"}",
      "{argument name=\"section 4\" default=\"保障措施\"}",
      "{argument name=\"section 5\" default=\"实施时间表\"}"
    ],
    "section_block_style": "编号 + 标题 + 2-3 行说明，可附小图标"
  },
  "highlight_numbers": {
    "enabled": "{argument name=\"highlight numbers enabled\" default=\"true\"}",
    "items": [
      "{argument name=\"key number 1\" default=\"5 大重点任务\"}",
      "{argument name=\"key number 2\" default=\"3 年实施周期\"}",
      "{argument name=\"key number 3\" default=\"覆盖 28 个领域\"}"
    ]
  },
  "footer": {
    "source": "{argument name=\"source\" default=\"来源：官方文件全文链接\"}",
    "qr_code": "{argument name=\"qr code\" default=\"右下角二维码：查看政策原文\"}"
  },
  "constraints": {
    "must_keep": [
      "主标题字号最大",
      "机构 logo 与名称必须出现且可读",
      "色板克制 ≤ 3 色",
      "数据高亮区视觉突出但不浮夸"
    ],
    "avoid": [
      "出现娱乐化字体",
      "插图过度卡通化",
      "出现品牌广告元素",
      "颜色过度饱和"
    ]
  }
}
```

#### 参数策略

- 必问：政策名、机构、章节
- 可默认：色板、字体方案、底部信息
- 可随机：装饰小图标

#### 自动补全策略

- 默认章节按“背景 / 目标 / 任务 / 保障 / 时间表”五段
- 默认色板政红 + 米白 + 深灰
- 默认机构样式留白通用化，避免冒充真实机构

### 变体 1：公共宣传海报式 Slide

📝 提示词

```json
{
  "type": "公共宣传海报式 Slide",
  "header": {
    "main_title": "{argument name=\"main title\" default=\"全民垃圾分类·从我做起\"}",
    "subtitle": "权威指引 + 行动指南"
  },
  "centerpiece": {
    "description": "{argument name=\"centerpiece\" default=\"四种垃圾桶 + 简洁分类图标\"}"
  },
  "sections": {
    "items": [
      "可回收物",
      "厨余垃圾",
      "有害垃圾",
      "其他垃圾"
    ]
  },
  "constraints": {
    "must_feel": "公益、清晰、易懂"
  }
}
```

### 变体 2：白皮书摘要 Slide

📝 提示词

```json
{
  "type": "行业白皮书摘要 Slide",
  "header": {
    "main_title": "{argument name=\"report name\" default=\"2026 年某行业发展白皮书\"}"
  },
  "sections": {
    "items": ["市场概况", "趋势洞察", "关键数据", "未来展望"]
  },
  "highlight_numbers": {
    "enabled": true,
    "items": ["市场规模 1.2 万亿", "复合增长 18%", "活跃企业 4500+"]
  },
  "constraints": {
    "must_feel": "专业、可作为公开发布材料"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "政策风 Slide 自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给主题，自动选机构样式、章节切分、色板",
  "constraints": {
    "must_feel": "权威、克制、可分发"
  }
}
```

### 避免事项

- 不要冒充任何真实机构 logo
- 不要使用娱乐化字体（毛笔体、卡通体除特殊场合）
- 不要让插图分散注意力
- 不要让颜色超过 3 种主色
- 不要让正文行距过密以至无法阅读
- 不要在政策风 Slide 上加过多营销卡片

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
