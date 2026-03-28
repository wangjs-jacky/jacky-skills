---
name: task-workflow
description: "任务工作流编排工具。整合 task-memory、superpowers、task-harness 形成完整的任务执行流程。触发于 /task-workflow 或\"工作流编排\"、\"任务流程\"等关键词。"
---

<critical>
**强制约束 - 违反任何一条即为严重错误**

1. **禁止跳过阶段**：必须按 INIT -> LISTEN -> BRAINSTORM -> HARNESS -> PLAN -> EXECUTE -> VERIFY -> REVIEW 顺序执行。只有用户明确指定 `quick`（跳过 BRAINSTORM）或 `yolo`（跳过所有门控）时才可跳过，且必须用户在命令中显式指定。

2. **禁止自行授权模式切换**：AI 不得自行判断使用 quick/yolo 模式。模式由用户命令决定：`/task-workflow` = 标准，`/task-workflow quick` = 快速，`/task-workflow yolo` = 全自动。

3. **每个阶段必须使用 AskUserQuestion 获得用户确认**：完成一个阶段后，必须暂停并询问用户是否 approve，不能自行进入下一阶段（yolo 模式除外）。

4. **禁止直接实现代码**：在进入 EXECUTE 阶段前，不得编写任何实现代码。阅读代码、分析代码是允许的。

5. **必须调用依赖 skill**：LISTEN 阶段必须调用 task-memory，HARNESS 阶段必须调用 task-harness。如果不可用，必须暂停并提示用户安装。
</critical>

<role>
你是 Task Workflow 编排器。你的职责是协调多个工具完成复杂任务：

1. **task-memory** - 全程监听，记录初始意图与执行偏差
2. **superpowers** - 提供创意发散、计划编写、计划执行能力
3. **task-harness** - 定义可验证的验收边界
</role>

<purpose>
将复杂任务拆分为可门控的阶段流程，串联记忆、规划、执行与验证，确保结果可追踪且可验收。
</purpose>

<trigger>
```text
/task-workflow
工作流编排
任务流程
多阶段任务执行
需要 task-memory + task-harness 联动
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <owner>task-workflow</owner>
    <mode>stage-orchestration</mode>
  </gsd:meta>
  <gsd:goal>以阶段门控方式完成任务闭环：从初始化到复盘，全程有记录、有验收、有回放。</gsd:goal>
  <gsd:phase id="1" name="init-listen">初始化工作流状态并启动 task-memory 建立跨会话记忆。</gsd:phase>
  <gsd:phase id="2" name="design-plan">完成 brainstorming 与 harness 边界定义，再生成可执行计划。</gsd:phase>
  <gsd:phase id="3" name="execute-verify-review">执行实现并循环验证，测试通过后进入 review 沉淀复盘。</gsd:phase>
</gsd:workflow>

<dependencies>
本 skill 依赖以下两个 skill，执行前确保它们已可用：

| Skill | 用途 | 触发命令 |
|-------|------|----------|
| **task-memory** | 对话监听与偏差记录 | `/task-memory` |
| **task-harness** | 验收边界定义 | `/task-harness` |

<required_reading>
在开始工作流前，确认用户已安装依赖 skill：
```bash
j-skills list -g | grep -E "task-memory|task-harness"
```
如未安装，提示用户执行：
```bash
j-skills install task-memory -g
j-skills install task-harness -g
```
</required_reading>
</dependencies>

---

<workflow_overview>

```
INIT -> LISTEN -> BRAINSTORM -> HARNESS -> PLAN -> EXECUTE <-> VERIFY -> REVIEW
  |        |         |          |        |        |      |        |
  |        |         |          |        |        |      |        +-- 复盘总结
  |        |         |          |        |        |      +-- 测试通过后进入
  |        |         |          |        |        +-- 执行任务（TDD 驱动）
  |        |         |          |        +-- 生成执行计划
  |        |         |          +-- 定义验收边界 + 测试用例
  |        |         +-- 创意发散（superpowers）
  |        +-- 启动 task-memory 监听
  +-- 初始化工作流
```

| 阶段 | 工具 | 产物 | 核心目标 |
|------|------|------|----------|
| INIT | - | `.harness/tasks/{task-slug}/workflow.json` | 初始化目录与状态 |
| LISTEN | task-memory | `.harness/tasks/{task-slug}/listen/intent.md` | 记录初始意图 |
| BRAINSTORM | superpowers:brainstorming | `.harness/tasks/{task-slug}/brainstorm/` | 创意发散 |
| HARNESS | task-harness | `.harness/tasks/{task-slug}/harness/` | 定义验收边界 + 测试用例 |
| PLAN | superpowers:writing-plans | `.harness/tasks/{task-slug}/plan/PLAN.md` | 生成执行计划 |
| EXECUTE | superpowers:executing-plans | 源码文件 | 实现功能 |
| **VERIFY** | 测试框架 | 测试报告 | **测试通过才进入下一阶段** |
| REVIEW | task-memory | `.harness/tasks/{task-slug}/listen/review.md` | 复盘总结 |

</workflow_overview>

---

<commands>

| 命令 | 说明 |
|------|------|
| `/task-workflow <任务描述>` | 启动完整工作流（需用户确认） |
| `/task-workflow quick <任务描述>` | 快速模式（跳过 BRAINSTORM） |
| `/task-workflow yolo <任务描述>` | **YOLO 模式**（全自动，无阶段确认，失败会中止） |
| `/task-workflow status` | 查看当前状态 |
| `/task-workflow next` | 进入下一阶段 |
| `/task-workflow goto <阶段>` | 跳转到指定阶段 |
| `/task-workflow record <描述>` | 手动记录偏差 |
| `/task-workflow end` | 结束工作流，生成复盘 |

</commands>

---

<process>

<step name="init" priority="first">

**目标**：初始化工作流目录和状态

**动作**：
1. 生成 `task-slug`（基于任务名称规范化）
2. 创建 `.harness/tasks/{task-slug}/` 目录结构
3. 生成 `workflow.json` 记录状态
4. 确认依赖 skill 已安装
5. 更新 `.harness/current.json`（指向当前活跃任务）
6. 更新 `workflow.json`：currentStage = "INIT", stageTimeline.INIT = { enteredAt: now }, updatedAt = now

```bash
mkdir -p .harness/tasks/{task-slug}/{listen,brainstorm,harness,plan,execute,review}
```

**产物**：`.harness/tasks/{task-slug}/workflow.json` + `.harness/current.json`

**门控确认**：不需要（自动进入 LISTEN）

</step>

<step name="listen">

**目标**：启动 task-memory，记录初始意图

**动作**：调用 `/task-memory start "{{任务名}}"`

- 检查是否有历史记录（恢复场景）
- 记录本次会话的初始 Prompt
- 建立任务跟踪
- 更新 `workflow.json`：currentStage = "LISTEN", stageTimeline.INIT.exitedAt = now, stageTimeline.LISTEN = { enteredAt: now }, updatedAt = now
- 更新 `.harness/current.json`：currentStage = "LISTEN", updatedAt = now

**产物**：`.harness/tasks/{task-slug}/listen/intent.md`

**门控确认**（必须）：
使用 AskUserQuestion 询问用户：
- 问题："初始意图已记录，是否继续进入 BRAINSTORM 阶段？"
- 选项：approve 继续 / 调整任务描述

**异常处理**：如果 task-memory 不可用，暂停并提示用户安装：`j-skills install task-memory -g`

</step>

<step name="brainstorm">

**目标**：使用 superpowers:brainstorming 进行创意发散

**动作**：
1. 调用 `/brainstorming`
2. 引导用户描述需求细节
3. 生成方案对比，记录最终决策
4. 更新 `workflow.json`：currentStage = "BRAINSTORM", stageTimeline.LISTEN.exitedAt = now, stageTimeline.BRAINSTORM = { enteredAt: now }, updatedAt = now
5. 更新 `.harness/current.json`：currentStage = "BRAINSTORM", updatedAt = now

**产物**：
- `.harness/tasks/{task-slug}/brainstorm/mindmap.md`
- `.harness/tasks/{task-slug}/brainstorm/options.md`
- `.harness/tasks/{task-slug}/brainstorm/decision.md`

**门控确认**（必须）：
使用 AskUserQuestion 询问用户：
- 问题："需求是否已澄清完成？"
- 选项：
  - approve：需求已澄清，进入 HARNESS
  - continue：继续探索更多细节
  - adjust：重新定义需求后再次 brainstorm

**跳过条件**：用户命令为 `/task-workflow quick` 时跳过此阶段

</step>

<step name="harness">

**目标**：使用 task-harness 定义可验证的验收边界

**动作**：
1. 调用 `/task-harness "{{基于 brainstorm 结果的任务描述}}"`
2. 通过问答明确验收边界
3. 生成 Harness 定义 + 验证脚本
4. 更新 `workflow.json`：currentStage = "HARNESS", stageTimeline.BRAINSTORM.exitedAt = now, stageTimeline.HARNESS = { enteredAt: now }, updatedAt = now
5. 更新 `.harness/current.json`：currentStage = "HARNESS", updatedAt = now

**产物**：
- `.harness/tasks/{task-slug}/harness/harness.md`
- `.harness/tasks/{task-slug}/harness/verify.sh`

**验收标准要求**：必须可检测、明确无歧义、覆盖核心功能、最小化只验证必要条件。

> Harness 模板和反模式见 references/storage-structure.md

**门控确认**（必须）：
使用 AskUserQuestion 询问用户：
- 问题："验收标准是否确认？"
- 选项：
  - approve：验收标准确认，进入 PLAN
  - adjust：修改不合理的验收条件
  - add：补充遗漏的验收条件

**异常处理**：如果 task-harness 不可用，暂停并提示用户安装：`j-skills install task-harness -g`

</step>

<step name="plan">

**目标**：使用 superpowers:writing-plans 生成执行计划

**动作**：
1. 基于 Harness 验收标准
2. 调用 `/writing-plans`
3. 生成 PLAN.md，确保每个任务都有验证方式
4. 更新 `workflow.json`：currentStage = "PLAN", stageTimeline.HARNESS.exitedAt = now, stageTimeline.PLAN = { enteredAt: now }, updatedAt = now
5. 更新 `.harness/current.json`：currentStage = "PLAN", updatedAt = now

**产物**：`.harness/tasks/{task-slug}/plan/PLAN.md`

> Plan 模板见 references/storage-structure.md

**成功标准**：
- 所有 MUST 条件都有对应任务
- 每个任务都有 verify 定义
- 任务顺序符合依赖关系

**门控确认**（必须）：
使用 AskUserQuestion 询问用户：
- 问题："执行计划是否确认？"
- 选项：
  - approve：计划确认，开始执行
  - adjust：调整任务顺序或内容
  - add：补充遗漏的任务

</step>

<step name="execute">

**目标**：使用 superpowers:executing-plans 执行，编写实现代码

**动作**：
1. 读取 HARNESS 提取 MUST 条件
2. 逐个执行 PLAN.md 中的任务：
   - 编写测试用例（基于 HARNESS MUST 条件）
   - 实现功能代码
   - 记录执行偏差到 task-memory
3. 每次用户输入后记录到 task-memory
4. 更新 `workflow.json`：currentStage = "EXECUTE", stageTimeline.PLAN.exitedAt = now, stageTimeline.EXECUTE = { enteredAt: now }, updatedAt = now
5. 更新 `.harness/current.json`：currentStage = "EXECUTE", updatedAt = now

**产物**：源码文件 + 测试文件

**门控确认**（必须）：
使用 AskUserQuestion 询问用户：
- 问题："任务代码已编写完成，是否进入 VERIFY？"
- 选项：
  - approve：确认完成，进入 VERIFY
  - adjust：调整实现
  - add：补充遗漏任务

</step>

<step name="verify">

**目标**：基于 HARNESS 运行所有验证脚本，确保 MUST 条件全部通过

**动作**：
1. 读取所有 HARNESS 的 MUST 条件
2. 运行 `verify.sh` 验证脚本
3. 失败则循环修复（最多 5 次，复用 tdd-protocol.md 的逻辑）
4. 超过重试上限则暂停询问用户
5. 更新 `workflow.json`：currentStage = "VERIFY", stageTimeline.EXECUTE.exitedAt = now, stageTimeline.VERIFY = { enteredAt: now }, updatedAt = now
6. 更新 `.harness/current.json`：currentStage = "VERIFY", updatedAt = now

> 详细的 TDD 验证协议、Verify Loop 流程图、失败分析模板见 references/tdd-protocol.md

**产物**：测试报告

**门控确认**（必须）：
使用 AskUserQuestion 询问用户：
- 问题："所有 HARNESS MUST 条件是否全部通过？"
- 选项：
  - approve：全部通过，进入 REVIEW
  - report：查看详细测试报告
  - fix：返回修复问题

**异常处理**：重试 5 次后暂停，使用 AskUserQuestion 询问用户：
- 选项：
  - 重新设计 HARNESS
  - 重新制定 PLAN
  - 手动介入修复

</step>

<step name="review">

**目标**：保存最终状态，生成复盘（入口来自 VERIFY 通过）

**动作**：
1. 调用 `/task-memory save "任务完成"` 保存最终进展
2. 汇总 VERIFY 阶段的测试报告
3. 调用 `/task-memory end` 结束任务
4. 更新 `workflow.json`：currentStage = "COMPLETED", status = "completed", stageTimeline.VERIFY.exitedAt = now, stageTimeline.REVIEW = { enteredAt: now, exitedAt: now }, updatedAt = now
5. 更新 `.harness/current.json`：currentStage = "COMPLETED", updatedAt = now

**产物**：`.harness/tasks/{task-slug}/listen/review.md`

**门控确认**：不需要（自动完成）

```
任务记录已保存到: .harness/tasks/{task-slug}/
下次可使用 /task-memory recall 恢复上下文
```

</step>

</process>

---

<references>

本 skill 的详细参考文档位于 `references/` 目录：

| 文件 | 内容 |
|------|------|
| `references/tdd-protocol.md` | TDD 哲学、Verify Loop 流程图、失败分析模板、TDD 最佳实践 |
| `references/stage-transitions.md` | 阶段跳转规则、门控协议、quick/yolo 模式说明 |
| `references/storage-structure.md` | 目录结构、task-slug 规则、工具集成、模板 |
| `references/examples.md` | 完整示例、各阶段详细说明 |

</references>
