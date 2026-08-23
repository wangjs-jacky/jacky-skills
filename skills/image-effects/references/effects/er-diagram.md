---
id: er-diagram
version: 1.0.0
title_en: ER Diagram
title_zh: 实体关系图
summary_en: Compile a system into a precise technical diagram with explicit nodes, connectors, boundaries, and unambiguous flow.
summary_zh: 把系统编译为精确技术图，明确节点、连线、边界和无歧义流程。
category: technical-diagrams
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/er-diagram.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/technical-diagrams/er-diagram.md,LICENSE
source_sha256s: dc4939ab555f599c20b912c882d0dc397682eb2315727068fd18693a5714ff74,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: d8a5a9e9a6b1e844565ad84857c8bb05535ce72ceed1990aec4d63e20a19a8bf
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成"工程感 ER 图 / 数据模型图"：

- 数据库表结构图（PG / MySQL / SQLite）
- 领域模型图（DDD 实体 + 关系）
- 文档型数据库 schema（MongoDB / DynamoDB）
- API 数据契约 schema 图
- 微服务边界 + 数据所有权图

特征：

- 实体框 = 圆角矩形，分上下两区：上区表名 / 下区字段列表
- 字段行 = 字段名 + 类型 + 主键 PK / 外键 FK 标记
- 关系连线 = 1:1 / 1:N / N:M（用 crow's foot 或 UML 多重性）
- 暗色 grid + 等宽字体（沿用视觉系统）

### 适用范围

- 数据库表结构
- 领域模型 / DDD 实体
- API schema 文档
- 数据库设计 review
- 微服务数据所有权图

### 何时使用

- 用户提到 "ER 图 / Entity-Relationship / 数据模型 / 数据库设计 / schema 图 / 表结构"
- 用户希望「实体 + 字段 + 关系」标准 ER 图样式
- 用户接受位图

不要使用：

- 用户要的是「系统架构」 → 用 `technical-diagrams/system-architecture.md`
- 用户要的是「类图 / UML 类图」（含方法）→ 暂未做专门模板，可借用本模板加方法行
- 用户要的是「思维导图」 → 用 `technical-diagrams/mind-map-tech.md`

### 缺失信息优先提问顺序

1. 数据库 / 领域名称（"e-commerce 数据模型 / SaaS 用户管理 schema"）
2. 实体列表（建议 4-12 个，超过考虑分子图）
3. 每个实体的字段（字段名 + 类型 + PK/FK + 是否 nullable）
4. 实体间关系（1:1 / 1:N / N:M，是否级联）
5. 是否包含枚举 / 索引 / 约束
6. 比例（默认 4:3 或 16:9）

### 主模板：标准 ER 图（暗色工程风）

📖 描述

整张图由若干实体框组成，每个实体框上半显示表名 + 表标签 (📦 entity)，下半列字段（含类型 + PK/FK 标记），实体之间用关系线连接，端点用 crow's foot 表达 1 / N。

📝 提示词

```json
{
  "type": "工程感 ER 图 / 数据模型图",
  "goal": "生成一张工程感 ER 图作为数据库设计文档 / API schema / 领域模型 review 配图",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"4:3\"}",
    "background": "deep slate #0F172A with subtle 1px grid #1E293B at 32px spacing",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"E-commerce Data Model\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"core entities · v1.0\"}",
    "position": "top-left, JetBrains Mono / SF Mono, light gray"
  },
  "entities": {
    "count": "{argument name=\"entity_count\" default=\"6\"}",
    "items": [
      {
        "id": "E1",
        "name": "users",
        "category": "user",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "email", "type": "varchar(255)", "marker": "UQ" },
          { "name": "password_hash", "type": "varchar(255)", "marker": "" },
          { "name": "created_at", "type": "timestamp", "marker": "" },
          { "name": "updated_at", "type": "timestamp", "marker": "" }
        ]
      },
      {
        "id": "E2",
        "name": "orders",
        "category": "transaction",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "user_id", "type": "uuid", "marker": "FK→users.id" },
          { "name": "status", "type": "enum", "marker": "" },
          { "name": "total_cents", "type": "bigint", "marker": "" },
          { "name": "created_at", "type": "timestamp", "marker": "" }
        ]
      },
      {
        "id": "E3",
        "name": "order_items",
        "category": "transaction",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "order_id", "type": "uuid", "marker": "FK→orders.id" },
          { "name": "product_id", "type": "uuid", "marker": "FK→products.id" },
          { "name": "quantity", "type": "int", "marker": "" },
          { "name": "unit_price_cents", "type": "bigint", "marker": "" }
        ]
      },
      {
        "id": "E4",
        "name": "products",
        "category": "catalog",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "sku", "type": "varchar(64)", "marker": "UQ" },
          { "name": "name", "type": "varchar(255)", "marker": "" },
          { "name": "price_cents", "type": "bigint", "marker": "" },
          { "name": "stock", "type": "int", "marker": "" }
        ]
      },
      {
        "id": "E5",
        "name": "categories",
        "category": "catalog",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "name", "type": "varchar(128)", "marker": "" },
          { "name": "parent_id", "type": "uuid", "marker": "FK→categories.id (self)" }
        ]
      },
      {
        "id": "E6",
        "name": "product_categories",
        "category": "join",
        "fields": [
          { "name": "product_id", "type": "uuid", "marker": "PK,FK→products.id" },
          { "name": "category_id", "type": "uuid", "marker": "PK,FK→categories.id" }
        ]
      }
    ]
  },
  "entity_style": {
    "shape": "rounded rectangle, corner radius 6px",
    "fill": "category color × 10% opacity",
    "border": "1.5px solid in category color",
    "header_strip": "topmost ~28px height: filled with category color × 25% opacity, contains table name in bold mono 12pt + small icon glyph",
    "field_row_style": "below header: each field row = 'field_name : type [marker]' in mono 10pt, alternating row tint for readability",
    "marker_color": "PK = amber bold, FK = blue, UQ = violet, NN = subtle gray"
  },
  "category_color_map": {
    "user": "cyan #22D3EE",
    "transaction": "emerald #34D399",
    "catalog": "violet #A78BFA",
    "join": "slate #94A3B8",
    "system": "amber #FBBF24",
    "external": "rose #FB7185"
  },
  "relationships": {
    "items": [
      { "from": "E1", "to": "E2", "cardinality": "1:N", "label": "places" },
      { "from": "E2", "to": "E3", "cardinality": "1:N", "label": "contains" },
      { "from": "E4", "to": "E3", "cardinality": "1:N", "label": "appears_in" },
      { "from": "E4", "to": "E6", "cardinality": "1:N", "label": "" },
      { "from": "E5", "to": "E6", "cardinality": "1:N", "label": "" },
      { "from": "E5", "to": "E5", "cardinality": "0..1:N", "label": "parent_of (self)" }
    ],
    "line_style": {
      "default": "solid line 1.5px slate #94A3B8",
      "endpoint_notation": "use crow's foot notation: '1' = single perpendicular tick, 'N' = three-pronged 'crow's foot', '0..1' = open circle + tick, '0..N' = open circle + crow's foot",
      "label_format": "relationship verb in mono 9pt placed near the middle of the line, e.g. 'places' / 'contains'"
    },
    "rule_routing": "lines avoid crossing entities; orthogonal routing preferred; self-relations curve to the side"
  },
  "extras": {
    "indices_section": {
      "enabled": "{argument name=\"indices_enabled\" default=\"false\"}",
      "rule": "if true, below each entity add a small 'Indices' section listing index names (e.g. 'idx_users_email')"
    },
    "color_legend": {
      "enabled": true,
      "position": "bottom-right",
      "content": "category color → role mapping + marker meaning (PK / FK / UQ / NN) + cardinality notation"
    }
  },
  "constraints": {
    "must_keep": [
      "实体框形状统一（圆角矩形 + header strip）",
      "字段行用等宽字体，类型靠右或冒号分隔",
      "PK / FK / UQ 标记清晰（颜色 + 文字）",
      "关系线用 crow's foot 或 UML 多重性表达 1:1 / 1:N / N:M",
      "FK 字段在表内必须标 FK→target_table.field",
      "暗色 grid 背景 + 等宽字体",
      "legend 必画"
    ],
    "avoid": [
      "用菱形当实体（语义错误）",
      "字段行使用比例字体（破坏对齐）",
      "FK 没标 target → 关系丢失上下文",
      "关系线没有 cardinality endpoint",
      "实体 > 12 个（拥挤；按子领域拆分）",
      "join 表与普通表用同色（应该用 'join' 灰色区分）",
      "用 emoji 当字段标记",
      "声称这是可编辑 SVG"
    ]
  }
}
```

#### 参数策略

- **必问**：`title`、实体列表（含字段 + PK/FK 标记）、关系列表（含 cardinality）
- **可默认**：`background`（暗色 grid）、`category_color_map`、`indices_enabled`（false）
- **可随机**：实体摆放位置（自动布局减少边交叉）

#### 自动补全策略

- 用户给"e-commerce schema" → 用 default 6 实体
- 用户没指定 cardinality → 反问（关系语义不能瞎猜）
- 用户没分类 category → 自动按表名归类（users → user, orders → transaction, products → catalog, *_join → join）
- 用户说要 light 模式 → 用变体 1
- 用户说"含索引" → 启用 `indices_enabled`

### 变体 1：浅色 Light ER 图

```json
{
  "modify": {
    "background": "warm off-white #F8FAFC + faint grid #E2E8F0",
    "entity_fill": "category color × 8% opacity",
    "entity_border": "1.5px solid (deeper shade for white bg)",
    "label_color": "deep slate #0F172A",
    "vibe": "白底文档站友好"
  }
}
```

### 变体 2：DDD 领域模型图（含方法 / 行为）

```json
{
  "modify": {
    "entity_label_format": "<<entity / value object / aggregate root>> 在表名上方加 stereotype 标签",
    "field_section_split": "实体内部分两部分：上面字段，下面方法（用 '——' 分隔线分开），方法格式 'methodName(args): returnType'",
    "category_color_map_extra": "aggregate root = amber, entity = emerald, value object = violet, domain service = cyan",
    "use_case": "DDD 战术设计 review、领域建模 workshop"
  }
}
```

适用：DDD 项目领域建模、UML 类图、业务建模。

### 变体 3：微服务数据所有权图（bounded context）

```json
{
  "modify": {
    "extras": "用大虚线框（bounded context）包围属于同一服务的实体，框上标 'User Service' / 'Order Service' 等",
    "cross_service_relations": "跨服务的关系用红色虚线（暗示 anti-pattern 或显式服务边界跨越）",
    "use_case": "微服务拆分、bounded context 设计、康威定律对齐"
  }
}
```

适用：微服务设计、bounded context 划分、数据所有权 review。

### 避免事项

- 字段行用比例字体 → 类型 / 标记不对齐
- FK 不标 target → 关系上下文丢失
- 关系线没 cardinality → 完全失去 ER 语义
- 实体 > 12 → 视觉爆炸，必须拆分
- 用菱形当 entity → 语义错误
- 用 emoji 当字段标记
- join 表与普通表混色
- 声称这是可编辑 SVG
- 把"系统架构"塞进 ER 图（应该用对应模板）
- 把字段类型省略 → 失去工程价值

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
