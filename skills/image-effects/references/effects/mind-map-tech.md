---
id: mind-map-tech
version: 1.0.0
title_en: Mind Map Tech
title_zh: 技术思维导图
summary_en: Compile a system into a precise technical diagram with explicit nodes, connectors, boundaries, and unambiguous flow.
summary_zh: 把系统编译为精确技术图，明确节点、连线、边界和无歧义流程。
category: technical-diagrams
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/mind-map-tech.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/technical-diagrams/mind-map-tech.md,LICENSE
source_sha256s: d30fb09ff244d5ea3643777d379292848c1dd247c3f751871c6be6b9fb4db86f,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 1eccff85126aa62cb8515c9134d1129bf3af7c3f24b779b178623bcccfd254f2
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成"工程感技术主题思维导图"：

- 技术栈梳理（前端 / 后端 / 数据 / DevOps 全景）
- 面试知识点脑图（八股文 / 系统设计 / 算法）
- 调研脑图（某领域调研后的总结）
- 学习路线图
- 主题词典 / 概念关系图

特征：

- 中央节点 = 主题（圆角矩形 / 椭圆，带强调色）
- 一级分支 = 主类别（4-8 个，放射状分布）
- 二级 / 三级分支 = 子主题（缩进式或嵌套）
- 不同分支用不同颜色（角色编码）
- 暗色 grid + 等宽字体（沿用视觉系统）

### 适用范围

- 技术栈全景图
- 面试准备脑图
- 调研 / 学习总结脑图
- 知识体系梳理
- 概念关系网

### 何时使用

- 用户提到 "思维导图 / mind map / 脑图 / 知识体系 / 学习路线 / 技术栈梳理"
- 用户希望「中央 + 放射」标准 mind map 结构
- 用户接受位图

不要使用：

- 用户要的是「工程系统架构」 → 用 `technical-diagrams/system-architecture.md`
- 用户要的是「ER 数据模型」 → 用 `technical-diagrams/er-diagram.md`
- 用户要的是「层级流程图 / step-by-step」 → 用 `infographics/step-by-step-infographic.md`
- 用户要的是「大纲 / 列表式 slide」 → 用 `slides-and-visual-docs/`

### 缺失信息优先提问顺序

1. 主题（中心节点的内容，"前端工程师技术栈 2026 / 系统设计面试要点"）
2. 一级分支数（建议 4-8 个）
3. 每个一级分支下的子节点（每个一级 3-7 个二级）
4. 是否需要三级 / 四级嵌套
5. 比例（默认 16:9 横版；分支多时可 3:4 竖版）
6. 是否高亮某些"重点 / 必会"节点

### 主模板：标准放射式技术思维导图

📖 描述

整张图中央是主题节点，四周放射出 4-8 条主分支，每条主分支再展开 3-7 个子节点，必要时再展开三级节点。每条主分支用一种颜色家族贯穿其所有子节点。

📝 提示词

```json
{
  "type": "工程感技术思维导图（放射式 mind map）",
  "goal": "生成一张放射式思维导图，作为知识梳理 / 面试准备 / 学习路线 / 技术栈全景的可视化",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "deep slate #0F172A with subtle 1px grid #1E293B at 32px spacing",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"Frontend Engineer Tech Stack\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"2026 edition\"}",
    "position": "top-left, JetBrains Mono / SF Mono, light gray"
  },
  "central_node": {
    "label": "{argument name=\"central_label\" default=\"Frontend\\nEngineer\"}",
    "shape": "rounded rectangle (corner radius 16px) or ellipse",
    "size": "260×120px",
    "fill": "amber #FBBF24 × 18% opacity",
    "border": "2px solid amber #FBBF24",
    "label_style": "mono bold 16pt, centered, light text",
    "position": "image center"
  },
  "primary_branches": {
    "count": "{argument name=\"primary_count\" default=\"6\"}",
    "items": [
      { "id": "B1", "label": "Languages", "color": "cyan #22D3EE", "angle_position": "top-left" },
      { "id": "B2", "label": "Frameworks", "color": "blue #60A5FA", "angle_position": "top-right" },
      { "id": "B3", "label": "State & Data", "color": "emerald #34D399", "angle_position": "right" },
      { "id": "B4", "label": "Build & Tooling", "color": "violet #A78BFA", "angle_position": "bottom-right" },
      { "id": "B5", "label": "Testing", "color": "rose #FB7185", "angle_position": "bottom-left" },
      { "id": "B6", "label": "Performance", "color": "orange #FB923C", "angle_position": "left" }
    ],
    "branch_node_style": {
      "shape": "rounded rectangle (corner radius 10px)",
      "size": "180×56px",
      "fill": "branch color × 14% opacity",
      "border": "1.5px solid branch color",
      "label": "mono bold 13pt, centered, light text",
      "position": "evenly distributed around central node, ~ radius 380-440px"
    },
    "connector_style": "thick branch-colored line 2px from central node to primary node, slight curve"
  },
  "secondary_nodes": {
    "rule": "每个 primary 下挂 3-7 个 secondary，沿主分支方向呈树枝状展开",
    "items_per_primary_example": {
      "B1_Languages": ["TypeScript", "JavaScript (ES2024+)", "WebAssembly", "CSS / Sass"],
      "B2_Frameworks": ["React 19", "Next.js 15", "Vue 3", "Svelte 5", "Solid"],
      "B3_State_Data": ["TanStack Query", "Zustand", "Jotai", "URQL / Apollo", "tRPC"],
      "B4_Build_Tooling": ["Vite", "Turbopack", "Bun", "pnpm + Turborepo", "Biome"],
      "B5_Testing": ["Vitest", "Playwright", "Storybook", "MSW"],
      "B6_Performance": ["Core Web Vitals", "RUM", "Bundle analysis", "Image / Font opt"]
    },
    "secondary_node_style": {
      "shape": "rounded rectangle (corner radius 8px)",
      "size": "auto-fit text + 12px padding, ~ 140×40px typical",
      "fill": "branch color × 8% opacity",
      "border": "1.2px solid branch color (slightly desaturated)",
      "label": "mono regular 11pt"
    },
    "connector_style": "thin branch-colored line 1.2px from primary to secondary, curved"
  },
  "tertiary_nodes": {
    "enabled": "{argument name=\"tertiary_enabled\" default=\"false\"}",
    "rule": "if true, secondary 可继续展开 2-3 个 tertiary（更小的圆角矩形 + 更细的连线），但要避免视觉爆炸；建议只在 1-2 个 secondary 下展开"
  },
  "highlights": {
    "must_know": {
      "enabled": "{argument name=\"must_know_enabled\" default=\"false\"}",
      "rule": "if true, 给重点 / 必会节点加'★'前缀 + 描边加粗到 2.5px",
      "examples": ["★ React 19", "★ TypeScript", "★ Vite"]
    }
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "branch color → category mapping，star → must-know",
    "style": "small panel, semi-transparent bg, mono 10pt"
  },
  "constraints": {
    "must_keep": [
      "central node 唯一且居中",
      "primary branches 围绕中央均匀分布（避免一边密一边空）",
      "每条分支颜色家族贯穿其所有子节点",
      "secondary 节点严格挂在对应 primary 的延伸方向",
      "暗色 grid 背景 + 等宽字体",
      "节点大小有 hierarchy（central > primary > secondary > tertiary）",
      "连线不交叉（除非不可避免）"
    ],
    "avoid": [
      "所有节点同尺寸 → 失去层级",
      "primary 集中在一侧 → 视觉失衡",
      "secondary 颜色与所属 primary 不一致",
      "连线大量交叉 → 可读性崩溃",
      "用 emoji 当节点图标（除非主题需要）",
      "primary > 8 个（拥挤；考虑分子图）",
      "三级以下嵌套全开 → 视觉爆炸",
      "用 3D / 渐变 / 玻璃质感",
      "声称这是可编辑 SVG"
    ]
  }
}
```

#### 参数策略

- **必问**：`title`、`central_label`、primary 分支列表（含名称）、每条 primary 下的 secondary 列表
- **可默认**：`background`（暗色 grid）、`primary_branches.color`（默认 6 色组合）、`tertiary_enabled`（false）、`must_know_enabled`（false）
- **可随机**：每条 primary 的 angle_position（基于数量自动等距分布）、节点轻微微调避免重叠

#### 自动补全策略

- 用户给"主题 + 4-6 个分支" → 自动用 default secondary 数量（每分支 4 个）
- 用户给"我要前端技术栈脑图" → 用 default 6 分支（Languages / Frameworks / State&Data / Build / Testing / Performance）
- 用户没指定颜色 → 自动按角色顺序分配 6 色组合
- 用户说"加重点标记" → 启用 `must_know_enabled`
- 用户说要 light 模式 → 用变体 1

### 变体 1：浅色 Light 思维导图

```json
{
  "modify": {
    "background": "warm off-white #F8FAFC + faint grid #E2E8F0",
    "node_fill": "branch color × 6% opacity",
    "node_border": "1.5px solid (deeper shade for white bg)",
    "label_color": "deep slate #0F172A",
    "connector_color": "branch color (deeper shade)",
    "vibe": "白底文档站 / 印刷友好"
  }
}
```

### 变体 2：层级树形图（左到右）

```json
{
  "modify": {
    "layout": "替换放射式为'左到右树形'：central node 在最左，primary 垂直排列在右侧第二列，secondary 在第三列，以此类推",
    "use_case": "更适合'学习路线 / 知识层级' (而不是'全景概览')",
    "vibe": "更像 XMind 的 logical chart 视图"
  }
}
```

适用：学习路线、知识层级、决策树形知识。

### 变体 3：组织 / 团队结构脑图

```json
{
  "modify": {
    "central_label": "team / company / org name",
    "primary_branches": "部门 / 职能 (Engineering / Design / Product / Ops / Marketing)",
    "secondary_nodes": "具体角色 / 团队成员 (用 'Name · Title' 格式)",
    "highlights_extra": "team lead 用 ★ 标记 + 边框加粗",
    "use_case": "团队介绍 deck、组织架构图"
  }
}
```

适用：团队 / 组织架构展示、新人 onboarding 文档。

### 避免事项

- primary 分支集中在画布一侧 → 视觉失衡
- 节点全部同尺寸 → 失去层级
- 连线大量交叉 → 不可读
- secondary 颜色与所属 primary 不一致 → 视觉混乱
- 三级以下全展开 → 视觉爆炸
- 用 emoji 当节点 icon（除非主题相关，如"美食脑图"）
- primary > 8 个 → 拥挤，考虑拆分主题
- 用 3D / 渐变 / 玻璃质感
- 中央节点不在中心 / 不唯一
- 把"系统架构 / ER 图"做成 mind map（语义错位）
- 字号过小 / mono 字体丢失（破坏工程感）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
