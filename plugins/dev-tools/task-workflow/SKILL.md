---
name: task-workflow
description: 任务工作流编排工具。整合 task-memory、brainstorm、task-harness 形成完整的任务执行流程。触发于 /task-workflow 或"工作流编排"、"任务流程"等关键词。
---

# Task Workflow - 任务工作流编排

## 用途

将多个任务工具整合为一个完整的工作流：

1. **记忆缓存** - 使用 task-memory 记录任务执行过程
2. **创意发散** - 使用 brainstorm 生成设计脑图
3. **验收定义** - 使用 task-harness 明确完成标准
4. **任务跟踪** - 生成结构化的任务列表

---

## 命令

### /task-workflow <任务描述>

启动任务工作流，按阶段执行：

```
INIT → BRAINSTORM → HARNESS → TASKS → EXECUTE → REVIEW
```

**示例**：
```
/task-workflow 开发用户认证模块
```

### /task-workflow end

结束工作流，生成复盘报告。

---

## 工作流阶段

| 阶段 | 动作 | 产物 |
|------|------|------|
| INIT | 创建目录，记录目标 | `.harness/workflow.json` |
| BRAINSTORM | 创意发散，设计方案 | `.harness/planning/brainstorm/` |
| HARNESS | 定义验收标准 | `.harness/harness/` |
| TASKS | 分解任务 | `.harness/tasks/` |
| EXECUTE | 执行，记录偏差 | `.harness/memory/` |
| REVIEW | 复盘总结 | `.harness/memory/review.md` |

---

## 存储位置

```
.harness/
├── workflow.json           # 工作流状态
├── memory/                 # 任务记录
├── harness/                # 验收定义
├── planning/               # 规划产物
└── tasks/                  # 任务列表
```

---

## 使用示例

```
用户: /task-workflow 开发用户认证模块

AI: 启动任务工作流

## INIT ✓
已创建 .harness/ 目录

## BRAINSTORM
请描述需求...

用户: 支持邮箱、手机、第三方登录

AI: [生成设计方案]

## HARNESS
定义验收标准...

## TASKS
已生成任务列表：
1. [ ] 设计架构
2. [ ] 实现邮箱登录
...

开始执行？

用户: 是

AI: 进入执行阶段...

用户: /task-workflow end

AI: 已生成复盘报告
```
