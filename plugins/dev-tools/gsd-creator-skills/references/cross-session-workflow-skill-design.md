# 跨会话 Workflow Skill 通用设计（从 GSD 抽象）

这份文档关注的是**封装技巧本身**，不是复刻 GSD 的命令或目录。

目标：把「中断可恢复 + 阶段完成后明确引导下一步」沉淀成可迁移的 skill 设计模式。

## 1. 通用设计目标

1. workflow 可跨会话连续执行，不依赖当前对话历史。
2. 每个阶段结束都输出下一步动作，不让用户猜“接下来做什么”。
3. 状态可读、可查、可恢复，且可脚本化。

## 2. 通用抽象（与具体框架解耦）

### 2.1 三层状态模型

| 层级 | 典型内容 | 职责 |
|---|---|---|
| 任务级 | 当前步骤、完成/未完成、next_action | 精准恢复当前断点 |
| 流程级 | 当前阶段、进度、阻塞、最近决策 | 推进控制与全局可见性 |
| 全局级 | 目标、约束、长期决策 | 稳定背景与不变量 |

### 2.2 恢复协议

建议固定恢复顺序：

1. 读取流程级状态
2. 读取全局级状态
3. 读取任务级断点
4. 执行 `next_action`

关键是“顺序固定 + next_action 可执行”，而不是具体文件名。

### 2.3 任务级断点模板

```markdown
---
phase: phase-02
task: 3
status: in_progress
last_updated: 2026-03-22T00:00:00Z
---

<current_state>
...
</current_state>

<completed_work>
- ...
</completed_work>

<remaining_work>
- ...
</remaining_work>

<context>
当时思路/假设/风险
</context>

<next_action>
恢复后第一步
</next_action>
```

### 2.4 阶段结束引导（Next Up Contract）

每个阶段结束都输出标准化引导块：

```markdown
---

## ▶ Next Up

**{next_phase_id}: {next_phase_name}** — {one_line_goal}

`{next_command}`

<sub>建议清理上下文后再继续。</sub>

---

**Also available:**
- `{status_command}` — 查看状态
- `{resume_command}` — 恢复断点
- `{review_command}` — 回看本阶段产物

---
```

这是用户体验的关键接口，应该视为协议而非文案建议。

### 2.4 人工确认信号（Resume Signal）

当阶段末尾需要人工确认时，输出明确恢复信号：

- `回复 "approved" 继续下一阶段，或描述问题。`
- `回复 "next" 继续；回复 "status" 查看当前进度。`

核心原则：只给可执行信号，不给模糊提示。

## 3. 可复用封装技巧（从 GSD 学到的）

1. **状态外置**：把状态从 prompt 移到文件，避免上下文膨胀。
2. **动作外置**：把恢复动作固定到 `next_action`，降低恢复歧义。
3. **引导模板化**：阶段结束提示固定模板，避免遗漏关键信息。
4. **查询/变更分离**：`status` 只读，`advance/pause` 才写状态，减少误操作。
5. **脚本优先**：复杂 workflow 由 `scripts/` 维护状态读写，`SKILL.md` 只描述协议。

## 4. 在新 skill 中以 reference 方式引入

建议最小结构：

```text
<skill-name>/
├── SKILL.md
├── references/
│   ├── resume-next-stage-patterns.md
│   └── state-templates.md
└── scripts/
    ├── status.sh
    ├── pause.sh
    └── resume.sh
```

`SKILL.md` 里只保留：
- 什么时候写状态
- 什么时候输出 Next Up
- 什么时候要求 resume-signal

细节模板全部放在 `references/`，以便复用和演进。

## 5. 映射方法（避免耦合）

把任意框架元素映射到通用抽象：

| 框架术语 | 通用抽象 |
|---|---|
| pause-work / resume-work | 暂停入口 / 恢复入口 |
| .continue-here.md | 任务级断点文件 |
| STATE.md | 流程级状态文件 |
| PROJECT.md | 全局级背景文件 |

这样就能“借鉴技巧，不复制实现”。

## 6. 来源说明

本设计灵感来自 GSD 相关笔记，但已抽象为通用协议：

- `notes/gsd-interruption-guide.md`
- `notes/reusable-designs/gsd-context-lifecycle-management.md`
- `notes/gsd-analysis/context-lifecycle-timeline.md`
- `notes/design/workflow-design-guide.md`
