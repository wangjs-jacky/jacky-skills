---
id: educational-diagram-slide
version: 1.0.0
title_en: Educational Diagram Slide
title_zh: 教学图解幻灯片
summary_en: Compose dense material into a polished visual document page with strict hierarchy, readable text zones, and editorial rhythm.
summary_zh: 把密集材料编排为精致视觉文档页，保持严格层级、可读文字区和编辑节奏。
category: slides-and-visual-docs
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/educational-diagram-slide.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/slides-and-visual-docs/educational-diagram-slide.md,LICENSE
source_sha256s: ebd49ba9c5d2bda80722f096d0addf7abcb8bd75c91e821b493940ba9a785e70,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: bef37fde247403a915e2e96d1efaec7ccef7b29064f76d4f88f61c01a99d09c5
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“一页讲清楚一个概念 / 一种机制 / 一个流程”的教学型视觉页：

- 课程内页
- 教科书示意图
- 在线课程截图
- 工程师教学图
- 培训手册插图

特征：

- 中央主图 + 步骤分解
- 文字克制
- 颜色温和
- 强调可读性
- 适合反复阅读

### 适用范围

- 概念示意图
- 机制 / 流程图
- 工程原理图
- 教科书内页插图

### 何时使用

- 用户提到“教学 / 课程 / 教科书 / 概念图 / 机制图 / 原理图”
- 用户希望讲清楚“X 是怎么工作的”
- 用户面向学生 / 学习者，而非投资人 / 政府

不要使用：

- 用户要的是讲解课件（用 `dense-explainer-slides.md`）
- 用户要的是政策风（用 `policy-style-slide.md`）
- 用户要的是商业报告（用 `visual-report-page.md`）

### 缺失信息优先提问顺序

1. 概念 / 机制名称
2. 教学层级（小学 / 中学 / 大学 / 行业培训）
3. 步骤数（3-7 步）
4. 是否需要中央主图
5. 风格：手绘风 / 卡通风 / 学院派 / 工程图风
6. 配色

### 主模板：步骤分解教学示意图

📖 描述

整体一页教学图，顶部主标题 + 中央主图 + 周围按编号步骤分解 + 底部小结句。

📝 提示词

```json
{
  "type": "教学示意 Slide",
  "goal": "生成一张能让学习者一眼看懂某个概念 / 机制 / 流程的教学示意图",
  "style": {
    "color_palette": "{argument name=\"color palette\" default=\"温和米色 + 学院蓝 + 浅灰\"}",
    "rendering": "{argument name=\"rendering\" default=\"清晰矢量插图 + 简洁字体\"}"
  },
  "header": {
    "main_title": "{argument name=\"main title\" default=\"光合作用是怎么工作的\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"从光到糖，七步看懂\"}",
    "audience": "{argument name=\"audience\" default=\"中学生\"}"
  },
  "centerpiece": {
    "enabled": "{argument name=\"centerpiece enabled\" default=\"true\"}",
    "description": "{argument name=\"centerpiece description\" default=\"一片完整的叶子横剖面，标出叶绿体与气孔\"}"
  },
  "steps": {
    "count": "{argument name=\"step count\" default=\"6\"}",
    "items": [
      "{argument name=\"step 1\" default=\"01 光线进入叶绿体\"}",
      "{argument name=\"step 2\" default=\"02 水从根部输送上来\"}",
      "{argument name=\"step 3\" default=\"03 二氧化碳从气孔进入\"}",
      "{argument name=\"step 4\" default=\"04 光反应：水分解为氢与氧\"}",
      "{argument name=\"step 5\" default=\"05 暗反应：CO₂ 转为糖分\"}",
      "{argument name=\"step 6\" default=\"06 释放氧气、生成葡萄糖\"}"
    ],
    "step_block_style": "编号 + 一句话 + 小图标"
  },
  "annotations": {
    "style": "细线引线 + 编号小标签",
    "rule": "标注线不能交叉"
  },
  "summary_line": "{argument name=\"summary\" default=\"光合作用 = 光 + 水 + CO₂ → 葡萄糖 + O₂\"}",
  "constraints": {
    "must_keep": [
      "中央主图作为视觉锚点",
      "步骤编号连续清晰",
      "字体一致",
      "颜色 ≤ 3 种主色"
    ],
    "avoid": [
      "步骤过多导致一页放不下",
      "插画风格夹杂多种风格",
      "标注线穿过主图",
      "正文使用过多专业术语未做解释"
    ]
  }
}
```

#### 参数策略

- 必问：概念、教学层级、步骤数
- 可默认：风格、配色、底部公式句
- 可随机：图标具体造型

#### 自动补全策略

- 教学层级越低，插画越卡通，文字越短
- 教学层级越高，插画越科学示意，文字越精确
- 步骤建议 4-7 步，超过 7 步要拆为多页

### 变体 1：工程原理示意图

📝 提示词

```json
{
  "type": "工程原理示意 Slide",
  "header": {
    "main_title": "{argument name=\"concept\" default=\"内燃机四冲程是怎么工作的\"}"
  },
  "centerpiece": {
    "description": "气缸剖面图 + 活塞动作"
  },
  "steps": {
    "count": 4,
    "items": ["进气", "压缩", "做功", "排气"]
  },
  "constraints": {
    "must_feel": "工程图感、专业、可信"
  }
}
```

### 变体 2：低龄儿童教学图

📝 提示词

```json
{
  "type": "低龄儿童科普教学 Slide",
  "header": {
    "main_title": "{argument name=\"concept\" default=\"为什么会下雨？\"}"
  },
  "style": {
    "color_palette": "粉橙 + 天蓝 + 米白",
    "rendering": "Q 萌卡通插画"
  },
  "steps": {
    "count": 4,
    "items": ["太阳晒水", "水变云", "云变重", "下雨"]
  },
  "constraints": {
    "must_feel": "可爱、易懂、温馨"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "教学示意自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给概念，自动决定步骤、风格、配色、主图",
  "constraints": {
    "must_feel": "可直接放进教科书 / 课件"
  }
}
```

### 避免事项

- 不要让概念过于学术化以至小学生看不懂
- 不要让步骤超过 7 步
- 不要让插画与解释文字风格冲突
- 不要在科学示意图里出现品牌广告
- 不要让标注线交叉
- 不要使用过度饱和颜色破坏阅读舒适度

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
