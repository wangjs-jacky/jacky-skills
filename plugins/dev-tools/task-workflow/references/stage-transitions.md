# 阶段跳转规则与门控协议

> 本文件包含阶段门控协议、跳转规则、模式说明和门控格式模板。

## 阶段门控协议

**核心理念**：每个阶段完成后，必须用户明确 approve 才能进入下一阶段。

### 门控机制流程

```
    ┌──────────────┐
    │  阶段完成     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 展示产物      │
    │ + 总结       │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ AskUserQuestion 门控确认          │
    │ 问题: 是否 approve?              │
    │ 选项: approve / 其他             │
    └──────────────┬───────────────────┘
                   │
         ┌─────────┴─────────┐
         │                     │
         ▼                     ▼
    ┌──────────┐         ┌──────────┐
    │ approve  │         │ 其他选项  │
    └────┬─────┘         └────┬─────┘
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │ 调整/补充    │
         │              └──────┬───────┘
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │ 重新询问     │
         │              └──────────────┘
         │
         ▼
    进入下一阶段
```

---

## 各阶段门控要求

| 阶段 | 门控类型 | 门控条件 | resume-signal |
|------|----------|----------|---------------|
| LISTEN | - | init.md 已创建 | 自动进入 |
| BRAINSTORM | `checkpoint:decision` | decision.md 已创建 + 需求澄清确认 | `approve \| continue \| adjust` |
| HARNESS | `checkpoint:decision` | harness.md 已创建 + 验收标准确认 | `approve \| adjust \| add` |
| PLAN | `checkpoint:decision` | PLAN.md 已创建 + 计划确认 | `approve \| adjust \| add` |
| EXECUTE | `checkpoint:decision` | 所有任务代码已编写 | `approve \| adjust \| add` |
| VERIFY | `checkpoint:human-verify` | 所有 HARNESS MUST 条件通过 + verify.sh 执行成功 | `approve \| report \| fix` |
| REVIEW | - | 复盘报告已生成 | 自动完成 |

---

## 标准门控格式

```xml
<stage_gate type="checkpoint:decision" gate="blocking">

阶段门控：{当前阶段} -> {下一阶段}

<decision>{需要确认的问题}</decision>

<context>{为什么需要确认}</context>

<options>
<option id="approve">
  <name>approve - {描述}</name>
  <pros>{优点}</pros>
  <cons>{权衡}</cons>
</option>
<option id="alt">
  <name>{其他选项}</name>
  <pros>{优点}</pros>
  <cons>{权衡}</cons>
</option>
</options>

<resume-signal>Type: approve | alt</resume-signal>

</stage_gate>
```

---

## 用户响应处理

| 响应类型 | 处理方式 |
|----------|----------|
| `approve` / `yes` / `y` / `ok` | 进入下一阶段 |
| 空响应（直接回车） | 视为批准 |
| 其他内容 | 按选项 ID 匹配，或视为问题描述 |

---

## 阶段跳转规则

| 从 | 到 | 允许 | 条件 | 门控确认 |
|----|----|----|------|----------|
| INIT | LISTEN | 是 | workflow.json 已创建 | 不需要 |
| LISTEN | BRAINSTORM | 是 | init.md 已创建 | 不需要（自动进入） |
| LISTEN | HARNESS | 是 | quick 模式 + init.md 已创建 | 不需要（自动进入） |
| BRAINSTORM | HARNESS | 是 | decision.md 已创建 + 需求澄清确认 | **必须** |
| HARNESS | PLAN | 是 | harness.md 已创建 + 验收标准确认 | **必须** |
| PLAN | EXECUTE | 是 | PLAN.md 已创建 + 计划确认 | **必须** |
| EXECUTE | VERIFY | 是 | 所有任务代码已编写 | 不需要（自动进入） |
| VERIFY | REVIEW | 是 | 所有 HARNESS MUST 条件通过 + 用户 approve | **必须** |
| 任意 | 之前的阶段 | 是 | 支持回退修改 | 不需要 |

---

## 使用 goto 命令

```
/task-workflow goto HARNESS    # 回到验收定义阶段
/task-workflow goto EXECUTE    # 直接进入执行
```

**注意**：跳过阶段可能导致产物缺失，AI 会提示需要补充的内容。

---

## Quick 模式

`/task-workflow quick <任务描述>` 跳过 BRAINSTORM 阶段：

```
INIT -> LISTEN -> HARNESS -> PLAN -> EXECUTE <-> VERIFY -> REVIEW
              ^
              跳过
```

**注意**：quick 模式仅跳过 BRAINSTORM，**不能跳过 VERIFY**。

**适用场景**：
- 任务目标非常明确
- 已经有清晰的设计方案
- 需要快速启动执行

**不适用场景**：
- 需求模糊，需要探索
- 复杂任务，有多种方案
- 第一次处理此类任务

---

## YOLO 模式

`/task-workflow yolo <任务描述>` **全自动执行（无需阶段确认）**

```
INIT -> LISTEN -> BRAINSTORM -> HARNESS -> PLAN -> EXECUTE <-> VERIFY -> REVIEW
                                        ^         ^      ^
                                     AI 决策   AI 决策  AI 自动修复
```

### AI 自动决策

| 阶段 | AI 决策内容 |
|------|------------|
| BRAINSTORM | 自动选择最佳方案 |
| HARNESS | 自动选择测试框架 + 生成用例 |
| PLAN | 自动生成执行计划 |
| EXECUTE | 自动实现 + 自动修复循环 |

### 模式对比

| 模式 | 用户确认点 | 适用场景 |
|------|-----------|----------|
| 标准 | 每个阶段 | 复杂任务、首次任务 |
| quick | 跳过 BRAINSTORM | 目标明确 |
| **yolo** | **无阶段确认（失败会中止）** | 简单任务、演示、信任 AI |

**YOLO 模式 auto_advance 行为**：
- `checkpoint:decision` -> 自动选择第一个选项
- `checkpoint:human-verify` -> 自动批准

---

## 阶段回退时保留的产物

| 回退到 | 保留产物 | 需重做产物 |
|--------|----------|------------|
| BRAINSTORM | workflow.json, memory/ | harness/, plan/, execute 后产物 |
| HARNESS | workflow.json, memory/, planning/ | harness/, plan/, execute 后产物 |
| PLAN | workflow.json, memory/, planning/, harness/ | plan/, execute 后产物 |
| EXECUTE | 全部 | verify 后产物 |
| VERIFY | 全部 | - |
