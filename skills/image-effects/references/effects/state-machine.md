---
id: state-machine
version: 1.0.0
title_en: State Machine
title_zh: 状态机图
summary_en: Compile a system into a precise technical diagram with explicit nodes, connectors, boundaries, and unambiguous flow.
summary_zh: 把系统编译为精确技术图，明确节点、连线、边界和无歧义流程。
category: technical-diagrams
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/state-machine.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/technical-diagrams/state-machine.md,LICENSE
source_sha256s: a0137ca24c4d344ba016b8adcda31261132e0ffebd0bfa12a6c40c08352ba845,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 86a83244f2ef4f92d3aa7af9ebdde2bcfec2e0cc3c73a7fa7a7843f421f85a9a
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成"工程感状态机 / 生命周期图"：

- 订单状态机（待支付 / 已支付 / 已发货 / 已完成 / 已取消 / 已退款）
- 连接 / 会话状态（idle / connecting / connected / closing / closed）
- 工作流状态（draft / submitted / approved / rejected）
- UI 组件状态（hover / active / disabled / loading）
- 协议状态机（TCP 状态、WebSocket 状态、HTTP 缓存状态）

特征：

- 圆角矩形 = 状态节点
- 实心圆 = 起始伪状态；靶心 / 双圆 = 终止状态
- 有向边 = 转换 transition，标"事件 / 条件"
- 自循环 = 状态自身保持
- 暗色 grid + 等宽字体（沿用视觉系统）

### 适用范围

- 业务对象生命周期（订单 / 文档 / 工单）
- 协议 / 连接状态
- 工作流 / 审批状态
- UI 组件 / 交互状态
- 设备 / 会话 / 任务状态

### 何时使用

- 用户提到 "状态机 / state machine / 生命周期 / lifecycle / state diagram / 状态转移"
- 用户希望「state + transition」UML 状态图样式
- 用户接受位图

不要使用：

- 用户要的是「业务流程图（含决策、动作）」 → 用 `technical-diagrams/flowchart-decision.md`
- 用户要的是「时序图」 → 用 `technical-diagrams/sequence-diagram.md`

### 缺失信息优先提问顺序

1. 状态机名称（"订单状态机 / TCP 状态机"）
2. 起始状态（一般唯一）+ 终止状态（可多个）
3. 中间状态列表（建议 4-12 个，超过考虑分子状态机）
4. 转换：每条转换的"源状态 → 目标状态 + 触发事件 + 守卫条件 + action"
5. 是否有自循环
6. 是否需要 composite state（嵌套状态）
7. 比例（默认 4:3 或 16:9 横版）

### 主模板：标准 UML 状态机图

📖 描述

整张图以起始伪状态（实心圆）开始，经过若干状态节点（圆角矩形）和转换箭头（标事件）流转，最终到终止状态（靶心）。状态节点可有自循环（如 "retry" 自循环）。

📝 提示词

```json
{
  "type": "工程感状态机 / 生命周期图（UML state diagram）",
  "goal": "生成一张状态机图作为业务文档 / 协议规范 / 教学配图",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "deep slate #0F172A with subtle 1px grid #1E293B at 32px spacing",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"Order Lifecycle State Machine\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"e-commerce order from creation to completion\"}",
    "position": "top-left, JetBrains Mono / SF Mono, light gray"
  },
  "states": {
    "count": "{argument name=\"state_count\" default=\"7\"}",
    "items": [
      { "id": "S0", "type": "initial", "label": "" },
      { "id": "S1", "type": "state", "label": "Pending\\nPayment", "category": "active" },
      { "id": "S2", "type": "state", "label": "Paid", "category": "active" },
      { "id": "S3", "type": "state", "label": "Shipped", "category": "active" },
      { "id": "S4", "type": "state", "label": "Completed", "category": "success_terminal" },
      { "id": "S5", "type": "state", "label": "Cancelled", "category": "fail_terminal" },
      { "id": "S6", "type": "state", "label": "Refunded", "category": "fail_terminal" },
      { "id": "ST", "type": "final", "label": "" }
    ]
  },
  "state_style": {
    "initial": {
      "shape": "filled solid circle, ~16px diameter",
      "color": "cyan #22D3EE solid"
    },
    "final": {
      "shape": "concentric double circle (bullseye), outer ~18px, inner solid 10px",
      "color": "rose #FB7185"
    },
    "state": {
      "shape": "rounded rectangle, corner radius 12px (more rounded than process), 160×72px typical",
      "fill": "category color × 12% opacity",
      "border": "1.5px solid in category color",
      "label": "state name in mono 12pt, centered, light text on dark fill",
      "optional_internal_label": "可在 state 内部底部加小字 'entry / action' / 'do / activity' / 'exit / cleanup'（UML extension）"
    }
  },
  "category_color_map": {
    "active": "emerald #34D399",
    "waiting": "amber #FBBF24",
    "success_terminal": "blue #60A5FA",
    "fail_terminal": "rose #FB7185",
    "error": "rose #FB7185",
    "neutral": "slate #94A3B8"
  },
  "transitions": {
    "items": [
      { "from": "S0", "to": "S1", "label": "create()" },
      { "from": "S1", "to": "S2", "label": "pay() [valid card]" },
      { "from": "S1", "to": "S5", "label": "timeout / cancel()" },
      { "from": "S2", "to": "S3", "label": "ship()" },
      { "from": "S2", "to": "S6", "label": "refund() [user request]" },
      { "from": "S3", "to": "S4", "label": "deliver() [confirmed]" },
      { "from": "S3", "to": "S6", "label": "return() [defect]" },
      { "from": "S4", "to": "ST", "label": "" },
      { "from": "S5", "to": "ST", "label": "" },
      { "from": "S6", "to": "ST", "label": "" },
      { "from": "S1", "to": "S1", "label": "retry_payment", "self_loop": true }
    ],
    "transition_style": {
      "default": "thin solid arrow 1.5px slate #94A3B8 with filled triangle arrowhead",
      "self_loop": "small loop curving above the state, returning to itself",
      "label_format": "<event> [guard] / <action>，例如 'pay() [valid card] / lock_inventory()'，mono 9-10pt 标在边的中间，背景与 canvas 融合避免重叠"
    },
    "rule_routing": "尽量正交或 ≤ 30° 斜线，避免边穿过节点"
  },
  "composite_states": {
    "enabled": "{argument name=\"composite_enabled\" default=\"false\"}",
    "rule": "if true, can group sub-states inside a larger rounded rectangle labeled 'Active' / 'Suspended' etc.; sub-states are 'state' type nested within the composite border"
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "category color → meaning (active / terminal-success / terminal-fail / error)，shape → role (initial filled circle / final bullseye / state rectangle)，self-loop notation",
    "style": "small panel, semi-transparent bg, mono 10pt"
  },
  "constraints": {
    "must_keep": [
      "initial 是实心圆 / final 是靶心，不混用",
      "状态节点统一形状（圆角矩形）和尺寸基线",
      "transitions 必有 label（除非进 final）",
      "guard 条件用 [...] 括起来",
      "action 用 / 分隔",
      "自循环用 loop 形而非直线",
      "category 颜色一致（不要把 success 用红、fail 用绿）",
      "暗色 grid + 等宽字体",
      "legend 必画"
    ],
    "avoid": [
      "用菱形 / 平行四边形当 state（混淆为流程图）",
      "transitions 没有 label",
      "把 final 状态画成普通圆角矩形",
      "guard / action 语法不规范（漏 [] 或 /）",
      "状态 > 12 个（拥挤；考虑 composite state 或拆分）",
      "用 emoji 当 state 图标",
      "用 3D / 渐变 / 玻璃质感",
      "声称这是可编辑 SVG"
    ]
  }
}
```

#### 参数策略

- **必问**：`title`、起始状态、终止状态、中间状态列表、所有 transitions（含 from/to/label）
- **可默认**：`background`（暗色 grid）、`category_color_map`、`legend_enabled`（true）
- **可随机**：状态节点摆放位置（基于状态间转换关系自动布局，使边交叉最少）

#### 自动补全策略

- 用户给"订单状态机"但没给细节 → 用 default 7 状态版（待支付 / 已支付 / 已发货 / 已完成 / 已取消 / 已退款）
- 用户没说 guard / action → label 仅写 event 名
- 用户给状态但没给 transitions → 反问关键转换（不能瞎编业务规则）
- 用户说"状态太多" → 启用 `composite_enabled` + 用 composite 包围相关状态
- 用户说要 light 模式 → 用变体 1

### 变体 1：浅色 Light 状态机

```json
{
  "modify": {
    "background": "warm off-white #F8FAFC + faint grid #E2E8F0",
    "state_fill": "category color × 8% opacity",
    "state_border": "1.5px solid (deeper shade for white bg)",
    "label_color": "deep slate #0F172A",
    "transition_color": "slate #475569",
    "vibe": "白底文档 / 印刷版"
  }
}
```

### 变体 2：协议状态机（TCP / WebSocket / HTTP cache）

```json
{
  "modify": {
    "title_format": "<protocol> State Machine（如 TCP State Machine）",
    "state_label_emphasis": "用大写 / 协议规范术语（如 LISTEN / SYN_SENT / ESTABLISHED / TIME_WAIT）",
    "transition_label_emphasis": "用'触发包 / 发送包'格式：例如 'recv: SYN / send: SYN+ACK'",
    "use_case": "网络协议教学、规范文档、面试准备资料"
  }
}
```

适用：TCP / UDP / WebSocket / HTTP / OAuth 状态描述。

### 变体 3：UI 组件状态（按钮 / 输入 / 弹窗）

```json
{
  "modify": {
    "title_format": "<Component> Interaction States",
    "state_label_emphasis": "用 UI 状态术语：default / hover / active / focus / disabled / loading / error / success",
    "transition_label_emphasis": "用 UI 事件：mouseenter / click / focus / blur / API resolve / API reject",
    "category_color_map_extra": "default = slate, hover = cyan, active = emerald, disabled = slate desaturated, loading = amber, error = rose, success = blue",
    "use_case": "设计系统文档、组件库 README、设计师 / 开发对齐"
  }
}
```

适用：设计系统、组件库文档、UI / UX 状态规范。

### 避免事项

- 状态节点用菱形 / 平行四边形 → 与流程图混淆
- transition 没有 event label → 完全失去状态机语义
- final 状态用普通矩形 → 不符合 UML
- guard 条件没用 [] → 不规范
- 用 emoji 当状态图标
- 状态 > 12 个 → 拥挤，必须拆分或用 composite
- 自循环画成直线 → 视觉错误
- success / fail 颜色搞反
- 把"状态机"做成"流程图"（节点应该是状态，不是动作）
- 节点 / 边过多导致互相穿透

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
