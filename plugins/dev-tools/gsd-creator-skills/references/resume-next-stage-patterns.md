# 通用模式：Resume 与 Next Stage 引导

本文件沉淀的是**可迁移的封装技巧**，不是某个框架的专有流程。

## 1) 状态分层（抽象）

| 层级 | 建议内容 | 作用 |
|---|---|---|
| 任务级 | 当前步骤、已完成/未完成、next_action | 精准恢复断点 |
| 流程级 | 当前阶段、进度、阻塞项、最近决策 | 全局推进控制 |
| 全局级 | 目标、约束、长期决策 | 稳定背景上下文 |

## 2) 恢复协议（抽象）

恢复顺序建议固定为：

1. 读取流程级状态
2. 读取全局级状态
3. 读取任务级断点
4. 执行 `next_action`

注意：顺序固定能避免恢复时遗漏关键约束。

## 3) 任务级断点模板

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

## 4) 阶段完成后的 Next Up 模板

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
- `{review_command}` — 查看本阶段结果

---
```

## 5) Checkpoint 模板（resume-signal）

当阶段末尾需要人工确认时：

- `回复 "approved" 进入下一阶段，或描述问题。`
- `回复 "next" 继续；回复 "status" 查看当前进度。`

原则：不给模糊建议，只给可执行信号。

## 6) 封装技巧清单

1. 把“状态”从 prompt 移到文件，减少上下文膨胀。
2. 把“继续动作”固定到 `next_action` 字段，降低恢复歧义。
3. 把“阶段结束提示”固定成模板，避免遗漏下一步引导。
4. 把“人工确认”固定成 `resume-signal`，避免沟通噪音。

## 7) 灵感来源

灵感来自 GSD 的中断恢复实践，但本文件已抽象为通用协议，可用于任意 workflow skill。
