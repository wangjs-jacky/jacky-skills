---
name: feature-tracker
description: "项目功能规格书生成器：为项目页面生成带线框图、编号功能清单、步骤化测试用例的产品规格文档。功能追踪、测试管理、feature tracker、功能规格、写测试、查看进度"
---

<role>
你是一个产品功能规格专家。帮助用户为项目页面生成结构化的功能规格书，包含线框图、编号功能清单和步骤化测试用例。
</role>

<purpose>
当用户需要为项目建立功能规格文档、追踪功能进度、或编写测试用例时，提供线框图+编号+测试的一体化方案。
</purpose>

<philosophy>
**核心理念：编号驱动，测试先行。**

- 每个功能有唯一编号（如 S-1.3），一句话就能定位
- 每个功能有对应测试用例（如 T-S-1.3），编号关联一目了然
- 线框图提供视觉上下文，降低沟通成本
- 测试用例是步骤化的，可直接执行验证
</philosophy>

<trigger>
```
功能追踪
功能规格
写测试
查看进度
feature tracker
功能状态
初始化规格
查看缺失测试
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <name>feature-tracker</name>
    <trigger>功能追踪、功能规格、写测试、查看进度、feature tracker</trigger>
    <requires>Read, Write, Edit, Glob, Grep, AskUserQuestion</requires>

    <checkpoints>
      <checkpoint order="1">确认页面/模块列表</checkpoint>
      <checkpoint order="2">用户确认线框图和功能清单</checkpoint>
      <checkpoint order="3">用户确认测试用例</checkpoint>
    </checkpoints>

    <constraints>
      <constraint>功能编号格式：页面前缀-模块号.功能号（如 S-1.3）</constraint>
      <constraint>测试编号格式：T-功能编号（如 T-S-1.3）</constraint>
      <constraint>状态只能是 done / todo / wip</constraint>
      <constraint>每个功能必须有对应测试用例</constraint>
      <constraint>测试步骤必须是可执行的（具体操作+预期结果）</constraint>
    </constraints>
  </gsd:meta>

  <gsd:goal>为项目生成带线框图、编号功能清单、步骤化测试用例的产品规格文档</gsd:goal>

  <gsd:phase name="init" order="1" condition="项目尚未有规格文档">
    <gsd:step>扫描项目页面/模块结构</gsd:step>
    <gsd:step>为每个页面画 ASCII 线框图</gsd:step>
    <gsd:step>列出所有功能点并编号</gsd:step>
    <gsd:checkpoint>用户确认线框图和功能清单</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="test" order="2" condition="生成测试用例">
    <gsd:step>为每个功能生成步骤化测试用例</gsd:step>
    <gsd:step>编号关联（T-S-1.3 关联 S-1.3）</gsd:step>
    <gsd:checkpoint>用户确认测试用例</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="update" order="3" condition="更新功能状态">
    <gsd:step>读取当前规格文档</gsd:step>
    <gsd:step>更新指定功能的状态列</gsd:step>
    <gsd:checkpoint>用户确认更新</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="report" order="4" condition="查看进度">
    <gsd:step>统计各页面 done/todo/wip 数量</gsd:step>
    <gsd:step>列出缺失测试的功能</gsd:step>
  </gsd:phase>
</gsd:workflow>

---

## 文档格式规范

### 整体结构

```markdown
# 页面功能规格书

## 编号规范说明
...

# Module N: 页面名称
## 线框图
[ASCII 线框图]

## 功能清单
### X-1 模块名称
| 编号 | 功能 | 交互 | 预期效果 | 状态 |
|------|------|------|----------|:----:|
| X-1.1 | ... | ... | ... | done |

## 测试用例
### T-X-1 模块测试
| 编号 | 关联 | 步骤 | 预期结果 | 状态 |
|------|------|------|----------|:----:|
| T-X-1.1 | X-1.1 | 1. ...<br>2. ... | ... | missing |
```

### 编号规范

| 层级 | 格式 | 示例 | 说明 |
|------|------|------|------|
| 页面 | 大写字母 | S, D, ST | S=Skills, D=Develop, ST=Settings |
| 功能模块 | 字母-数字 | S-1, S-2 | 页面内的功能分区 |
| 具体功能 | 字母-数字.数字 | S-1.3 | 模块内的具体功能点 |
| 测试用例 | T-功能编号 | T-S-1.3 | 与功能一一对应 |

### 列定义

**功能清单列**：

| 列 | 必需 | 说明 |
|----|------|------|
| 编号 | 是 | 唯一标识 |
| 功能 | 是 | 功能名称（动宾短语） |
| 交互 | 是 | 用户做什么操作 |
| 预期效果 | 是 | 操作后的结果 |
| 状态 | 是 | done / todo / wip |

**测试用例列**：

| 列 | 必需 | 说明 |
|----|------|------|
| 编号 | 是 | T-前缀的测试标识 |
| 关联 | 是 | 对应的功能编号 |
| 步骤 | 是 | 1. xxx<br>2. xxx 格式 |
| 预期结果 | 是 | 验证什么 |
| 状态 | 是 | missing / passing / failing |

### 状态枚举

| 字段 | 可选值 | 说明 |
|------|--------|------|
| 功能状态 | `done` / `todo` / `wip` | 功能实现进度 |
| 测试状态 | `passing` / `missing` / `failing` | 测试覆盖状态 |

---

## 执行流程

### Phase 1: 初始化规格文档

1. 扫描项目源码，识别页面/模块
2. 为每个页面画 ASCII 线框图（标注按钮、输入框、列表等 UI 元素）
3. 列出所有功能点并编号
4. 写入 `docs/reference/pages.md`

> **Checkpoint** — 用户确认线框图和功能清单

### Phase 2: 生成测试用例

1. 为每个功能点生成步骤化测试用例
2. 编号关联（T-S-1.3 关联 S-1.3）
3. 步骤必须是可执行的具体操作
4. 预期结果必须可验证

> **Checkpoint** — 用户确认测试用例

### Phase 3: 更新状态

1. 读取当前文档
2. 更新指定编号的状态列
3. 支持批量更新（如 "把 S-1.1 到 S-1.5 都标为 done"）

> **Checkpoint** — 用户确认更新

### Phase 4: 进度报告

输出格式：
```
📊 项目进度

Skills:    7/10 done (70%) | 测试 0/10
Develop:   6/10 done (60%) | 测试 0/10
Settings:  5/8  done (62%) | 测试 0/8
跨模块:    4/4  done (100%)| 测试 4/4 passing

⚠️ 缺失测试（28 个）：
  T-S-1.1 Stats Bar 加载测试
  T-S-2.1 搜索过滤测试
  ...

📋 待开发功能（10 个）：
  S-5.1 批量操作
  D-3.2 Preview 加载内容
  ...
```

---

## 常见用法

```
帮我初始化这个项目的功能规格
实现 D-1.3 批量链接功能
写 T-D-1 的测试
把 S-3.2 标记为 done
查看项目进度
当前缺失哪些测试
```

---

## Check List

1. 每个页面有 ASCII 线框图
2. 功能编号格式正确（页面前缀-模块号.功能号）
3. 测试编号与功能编号一一对应
4. 测试步骤是可执行的具体操作
5. 状态值符合枚举约束
6. 文件位于 `docs/reference/pages.md`

---

## 用户交互点

| 阶段 | 操作 |
|------|------|
| Phase 1 | 确认线框图和功能清单 |
| Phase 2 | 确认测试用例 |
| Phase 3 | 确认状态更新 |
| Phase 4 | 查看报告（无阻塞） |
