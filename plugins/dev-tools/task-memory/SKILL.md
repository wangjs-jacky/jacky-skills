---
name: task-memory
description: "Use when 任务会跨多个会话持续推进，需要持久化记录进展、偏差和复盘，并在新会话快速恢复上下文。"
---

<role>
你是 Task Memory 持久化记录器，负责跨会话保存任务上下文、偏差轨迹与复盘结论。
</role>

<purpose>
通过标准化本地记忆文件，保证任务在中断、切会话或长周期推进时仍可快速恢复并持续演进。
</purpose>

<trigger>
```text
/task-memory
跨会话任务记录
保存任务进展/偏差
会话中断后恢复上下文
生成任务复盘
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <owner>task-memory</owner>
    <mode>persistent-memory</mode>
  </gsd:meta>
  <gsd:goal>让任务状态可追溯、可恢复、可复盘，并可被 task-workflow 直接复用。</gsd:goal>
  <gsd:phase id="1" name="start-or-resume">启动新任务或恢复既有任务，写入 init 快照并设置 current 指针。</gsd:phase>
  <gsd:phase id="2" name="record-progress">在执行中持续记录 save/record 事件，沉淀 deviation 历史。</gsd:phase>
  <gsd:phase id="3" name="recall-and-review">按需输出摘要/历史，并在 end 阶段生成 review 报告完成闭环。</gsd:phase>
</gsd:workflow>

# Task Memory

## 概述

Task Memory 用于把长任务的关键信息写入本地文件，支持：

1. 新任务启动与旧任务恢复
2. 过程偏差记录
3. 会话中断后的任务回忆
4. 结束时生成复盘报告

---

## 命令

| 命令 | 说明 |
|------|------|
| `/task-memory start <任务名|任务ID> [描述]` | 开始新任务；若名称/ID已存在则恢复 |
| `/task-memory save [描述]` | 保存进展（`record` 别名） |
| `/task-memory record <描述>` | 记录一次偏差/修正 |
| `/task-memory recall [任务名|任务ID]` | 输出任务摘要（默认当前任务） |
| `/task-memory history [任务名|任务ID]` | 输出完整历史（init/deviation/review） |
| `/task-memory status` | 查看当前进行中的任务状态 |
| `/task-memory list` | 列出任务清单 |
| `/task-memory end` | 结束当前任务并生成复盘 |
| `/task-memory review <任务ID>` | 查看指定任务复盘报告 |

---

## 存储结构

默认写入：

```text
.harness/memory/
├── current.json
├── init.md                # 当前任务 init 快照
├── last-deviation.md      # 最近一次偏差快照
├── review.md              # 最近一次复盘快照
└── tasks/
    └── <task-id>/
        ├── init.md
        ├── deviation-01.md
        ├── deviation-02.md
        └── review.md
```

兼容历史数据目录 `.task-memory/`（读取与写入均兼容）。

---

## 执行流程

### 1) start

```bash
/task-memory start "开发用户认证模块" "支持邮箱登录与 OAuth"
```

- 没有同名任务时：创建新任务目录与 `init.md`
- 任务已存在时：恢复任务并更新 `current.json`

### 2) save / record

```bash
/task-memory save "完成邮箱登录 API，开始接入 OAuth"
/task-memory record "发现密码哈希实现与预期不一致"
```

- 记录会写入 `deviation-XX.md`
- `save` 与 `record` 都会记录偏差文档，`save` 允许省略描述

### 3) recall

```bash
/task-memory recall
```

- 输出任务摘要：任务状态、目标、偏差数量、最近偏差
- 默认取当前任务；无当前任务时回忆最近任务

### 4) history

```bash
/task-memory history
```

- 输出完整历史原文：`init.md` + 所有 `deviation-*.md` + `review.md`

### 5) end / review

```bash
/task-memory end
/task-memory review task-2026-03-26-001
```

- `end` 会生成复盘并清理当前任务指针
- `review` 查看某个任务的 `review.md`

---

## 自动提醒（Hooks）

Hooks 位于 `hooks/`：

1. `PreToolUse`：检测偏差关键词，提醒使用 `record/save`
2. `Stop`：会话结束时提醒先保存进展或结束任务

---

## 与 Task Workflow 集成

推荐在 `task-workflow` 中按以下时机调用：

1. INIT/LISTEN：`/task-memory start <任务>`
2. EXECUTE：每个里程碑后 `/task-memory save "里程碑描述"`
3. REVIEW：`/task-memory end`

下次会话恢复时优先执行：

```bash
/task-memory recall
```
