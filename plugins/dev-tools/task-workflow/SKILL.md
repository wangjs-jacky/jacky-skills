---
name: task-workflow
description: 任务工作流编排工具。整合 task-memory、superpowers、task-harness 形成完整的任务执行流程。触发于 /task-workflow 或"工作流编排"、"任务流程"等关键词。
---

<role>
你是 Task Workflow 编排器。你的职责是协调多个工具完成复杂任务：

1. **task-memory** - 全程监听，记录初始意图与执行偏差
2. **superpowers** - 提供创意发散、计划编写、计划执行能力
3. **task-harness** - 定义可验证的验收边界
</role>

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

<workflow_stages>

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Task Workflow 执行流程                                 │
└─────────────────────────────────────────────────────────────────────────────┘

INIT → LISTEN → BRAINSTORM → HARNESS → PLAN → EXECUTE ⇄ VERIFY → REVIEW
  │        │         │          │        │        │      │        │
  │        │         │          │        │        │      │        └─ 复盘总结
  │        │         │          │        │        │      └────────── 测试通过后进入
  │        │         │          │        │        └────────────────── 执行任务
  │        │         │          │        │                         │
  │        │         │          │        │                         ▼
  │        │         │          │        │                   ┌──────────┐
  │        │         │          │        │                   │ 运行测试  │
  │        │         │          │        │                   └────┬─────┘
  │        │         │          │        │                        │
  │        │         │          │        │              ┌────────┴────────┐
  │        │         │          │        │              │                 │
  │        │         │          │        │              ▼                 ▼
  │        │         │          │        │         ┌────────┐        ┌────────┐
  │        │         │          │        │         │ 通过 ✓ │        │ 失败 ✗ │
  │        │         │          │        │         └───┬────┘        └───┬────┘
  │        │         │          │        │             │                 │
  │        │         │          │        │             │                 ▼
  │        │         │          │        │             │          ┌──────────┐
  │        │         │          │        │             │          │ 修复代码 │
  │        │         │          │        │             │          └────┬─────┘
  │        │         │          │        │             │               │
  │        │         │          │        │             │               └─── 重新测试 ──►
  │        │         │          │        │             │
  │        │         │          │        │             ▼
  │        │         │          │        │        进入 REVIEW
  │        │         │          └─────────────────── 定义验收边界 + 测试用例
  │        │         └─────────────────────────────── 创意发散（superpowers）
  │        └───────────────────────────────────────── 启动 task-memory 监听
  └────────────────────────────────────────────────── 初始化工作流
```

| 阶段 | 工具 | 产物 | 核心目标 |
|------|------|------|----------|
| INIT | - | `.harness/workflow.json` | 初始化目录与状态 |
| LISTEN | task-memory | `.harness/memory/init.md` | 记录初始意图 |
| BRAINSTORM | superpowers:brainstorming | `.harness/planning/brainstorm/` | 创意发散 |
| HARNESS | task-harness | `.harness/harness/` | 定义验收边界 + 测试用例 |
| PLAN | superpowers:writing-plans | `.harness/plan/PLAN.md` | 生成执行计划 |
| EXECUTE | superpowers:executing-plans | 源码文件 | 实现功能 |
| **VERIFY** | 测试框架 | 测试报告 | **测试通过才进入下一阶段** |
| REVIEW | task-memory | `.harness/memory/review.md` | 复盘总结 |

</workflow_stages>

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

<action>
1. 创建 `.harness/` 目录结构
2. 生成 `workflow.json` 记录状态
3. 启动 task-memory 监听
</action>

```bash
# 创建目录结构
mkdir -p .harness/{memory/tasks,harness,planning/brainstorm,plan}

# 规范化任务名（用于路径）
TASK_NAME="{{用户提供的任务描述}}"
TASK_SLUG="$(printf '%s' "$TASK_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/-\{2,\}/-/g; s/^-//; s/-$//')"
TS_LOCAL="$(date +%Y-%m-%d-%H%M%S)"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 初始化 workflow.json
cat > .harness/workflow.json << EOF
{
  "taskId": "wf-${TS_LOCAL}",
  "name": "${TASK_NAME}",
  "taskSlug": "${TASK_SLUG:-task-${TS_LOCAL}}",
  "stage": "INIT",
  "createdAt": "${TS_UTC}",
  "updatedAt": "${TS_UTC}",
  "history": [
    {
      "stage": "INIT",
      "enteredAt": "${TS_UTC}"
    }
  ],
  "deviations": 0,
  "dependencies": ["task-memory", "task-harness"]
}
EOF
```

<output>
```
## 工作流已初始化 ✓

- 任务 ID: wf-2026-03-22-001
- 任务名: {{任务描述}}
- 目录: .harness/

下一步: 启动 task-memory 监听
```
</output>
</step>

<step name="listen">

**目标**：启动 task-memory，建立跨会话任务记忆

<philosophy>
**Task Memory 的核心价值是跨会话连续性**。

用户的长任务会跨越多个会话：
1. 上下文会超限，会话会中断
2. 用户会开启新会话继续工作
3. 需要记录"每次做了什么"
4. 新会话需要知道"之前做了什么"
</philosophy>

<action>
调用 task-memory start：
1. 检查是否有历史记录（恢复场景）
2. 记录本次会话的初始 Prompt
3. 建立任务跟踪
</action>

```
启动 task-memory：

/task-memory start "{{任务名}}"

如果是恢复场景：
→ 读取历史记录，展示摘要
→ 询问用户从哪里继续

如果是新任务：
→ 记录初始 Prompt
→ 建立任务目录
```

<if condition="task-memory 不可用">
<repair_action>
提示用户安装：
```bash
j-skills install task-memory -g
```
</repair_action>
</if>

<done>
`.harness/memory/init.md` 已创建，包含初始意图
</done>
</step>

<step name="brainstorm">

**目标**：使用 superpowers:brainstorming 进行创意发散

<why_this_matters>
Brainstorm 阶段的价值在于：
1. 充分思考再动手，避免返工
2. 探索多种方案，选择最优解
3. 将模糊需求转化为明确方案
</why_this_matters>

<action>
1. 调用 superpowers:brainstorming skill
2. 引导用户描述需求细节
3. 生成设计脑图/方案对比
4. 记录最终决策
</action>

```
进入 BRAINSTORM 阶段...

/brainstorming

生成产物：
- .harness/planning/brainstorm/mindmap.md
- .harness/planning/brainstorm/options.md
- .harness/planning/brainstorm/decision.md
```

<if condition="用户选择 quick 模式">
跳过此阶段，直接进入 HARNESS
</if>

<success_criteria>
- [ ] 至少探索了 2 种方案
- [ ] 用户已确认最终方案
- [ ] decision.md 已生成
</success_criteria>

<stage_gate type="checkpoint:decision" gate="blocking">

**🚧 阶段门控：BRAINSTORM → HARNESS**

<decision>需求是否已经澄清完成？</decision>

<context>
BRAINSTORM 阶段的目标是将模糊需求转化为明确方案。
进入 HARNESS 前，需要确认用户对方案没有更多疑问。
</context>

<options>
<option id="approve">
  <name>✅ approve - 需求已澄清</name>
  <pros>进入 HARNESS 阶段定义验收边界</pros>
  <cons>无法再返回 brainstorm 补充方案</cons>
</option>
<option id="continue">
  <name>🔍 继续探索</name>
  <pros>可以深入讨论更多细节</pros>
  <cons>延迟进入执行阶段</cons>
</option>
<option id="adjust">
  <name>✏️ 调整需求</name>
  <pros>重新定义需求后更准确</pros>
  <cons>需要重新 brainstorm</cons>
</option>
</options>

<resume-signal>Type: approve | continue | adjust</resume-signal>

**处理规则**：
| 选择 | 动作 |
|------|------|
| `approve` | → 进入 HARNESS 阶段 |
| `continue` | → 继续 brainstorm 循环 |
| `adjust` | → 重新定义需求后再次 brainstorm |

</stage_gate>

</step>

<step name="harness">

**目标**：使用 task-harness 定义可验证的验收边界

<philosophy>
**Harness = 可检测的验收边界**

验收标准必须：
- 可检测：能用命令/脚本验证
- 明确性：没有歧义，非黑即白
- 完整性：覆盖核心功能
- 最小化：只验证必要条件
</philosophy>

<action>
1. 调用 task-harness skill
2. 通过问答明确验收边界
3. 生成 Harness 定义
4. 确保所有 MUST 条件可验证
</action>

```
进入 HARNESS 阶段...

/task-harness "{{基于 brainstorm 结果的任务描述}}"

生成产物：
- .harness/harness/{{task-slug}}/harness.md
- .harness/harness/{{task-slug}}/verify.sh
```

<harness_template>
```markdown
# Harness: {{任务名称}}

## 验收标准

### 必须 (MUST)
- [ ] {{可验证条件 1}}
- [ ] {{可验证条件 2}}

### 应该 (SHOULD)
- [ ] {{可验证条件 3}}

## 验证命令
```bash
# 执行验证的命令
```
```
</harness_template>

<anti_patterns>
```
❌ "界面要美观"        → 无法验证
✅ "Lighthouse 分数 >= 90" → 可验证

❌ "性能要好"          → 模糊
✅ "首屏加载 < 2s"     → 可量化
```
</anti_patterns>

<stage_gate type="checkpoint:decision" gate="blocking">

**🚧 阶段门控：HARNESS → PLAN**

<decision>验收标准是否确认？</decision>

<context>
HARNESS 定义了任务完成的验收边界。
这些标准将用于 EXECUTE 阶段的 TDD 测试用例。
</context>

<options>
<option id="approve">
  <name>✅ approve - 验收标准确认</name>
  <pros>进入 PLAN 阶段生成执行计划</pros>
  <cons>后续修改验收标准需要回退</cons>
</option>
<option id="adjust">
  <name>✏️ 调整</name>
  <pros>修改不合理的验收条件</pros>
  <cons>需要重新生成 harness.md</cons>
</option>
<option id="add">
  <name>➕ 补充</name>
  <pros>添加遗漏的验收条件</pros>
  <cons>增加工作量</cons>
</option>
</options>

<resume-signal>Type: approve | adjust | add</resume-signal>

**处理规则**：
| 选择 | 动作 |
|------|------|
| `approve` | → 进入 PLAN 阶段 |
| `adjust` | → 修改 harness.md 后重新询问 |
| `add` | → 补充验收条件后重新询问 |

</stage_gate>

<done>
Harness 定义完成，用户已确认验收标准
</done>
</step>

<step name="plan">

**目标**：使用 superpowers:writing-plans 生成执行计划

<action>
1. 基于 Harness 验收标准
2. 调用 superpowers:writing-plans
3. 生成 PLAN.md
4. 确保每个任务都有验证方式
</action>

```
进入 PLAN 阶段...

/writing-plans

生成产物：
- .harness/plan/PLAN.md
```

<plan_template>
```xml
<plan>
<task type="auto" id="T1">
  <name>{{任务名称}}</name>
  <files>{{涉及的文件}}</files>
  <action>{{具体行动}}</action>
  <verify>{{验证命令}}</verify>
  <harness_ref>{{对应的 Harness 条件}}</harness_ref>
</task>

<task type="checkpoint" id="C1" gate="blocking">
  <what-built>{{已构建的内容}}</what-built>
  <how-to-verify>{{验证方式}}</how-to-verify>
  <resume-signal>{{继续信号}}</resume-signal>
</task>
</plan>
```
</plan_template>

<success_criteria>
- [ ] 所有 MUST 条件都有对应任务
- [ ] 每个任务都有 verify 定义
- [ ] 任务顺序符合依赖关系
</success_criteria>

<stage_gate type="checkpoint:decision" gate="blocking">

**🚧 阶段门控：PLAN → EXECUTE**

<decision>执行计划是否确认？</decision>

<context>
PLAN.md 定义了具体的执行步骤和任务顺序。
一旦进入 EXECUTE，将按照 TDD 模式逐个执行任务。
</context>

<options>
<option id="approve">
  <name>✅ approve - 计划确认</name>
  <pros>开始执行任务</pros>
  <cons>修改计划需要暂停执行</cons>
</option>
<option id="adjust">
  <name>🔄 调整</name>
  <pros>调整任务顺序或内容</pros>
  <cons>需要重新生成 PLAN.md</cons>
</option>
<option id="add">
  <name>➕ 补充</name>
  <pros>添加遗漏的任务</pros>
  <cons>增加工作量</cons>
</option>
</options>

<resume-signal>Type: approve | adjust | add</resume-signal>

**处理规则**：
| 选择 | 动作 |
|------|------|
| `approve` | → 进入 EXECUTE 阶段 |
| `adjust` | → 调整任务后重新询问 |
| `add` | → 补充任务后重新询问 |

</stage_gate>

<done>
PLAN 已生成，用户已确认
</done>
</step>

<step name="execute">

**目标**：使用 superpowers:executing-plans 执行，采用 **TDD 驱动** + **HARNESS 验证** + **Loop 修复**

<tdd_philosophy>

## 🔴🟢♻️ TDD 核心理念：红灯-绿灯-重构

**测试先行原则**：
1. 🔴 **红灯**：先写失败的测试（验证需求理解正确）
2. 🟢 **绿灯**：写最小代码让测试通过（不过度设计）
3. ♻️ **重构**：优化代码结构（保持测试通过）

**HARNESS 作为验证标准**：
- HARNESS 定义了"什么是对的"
- 测试用例来源于 HARNESS 的 MUST 条件
- 只有测试通过才算任务完成

</tdd_philosophy>

<prompt_chain_recording>

**Prompt 链记录是本阶段的核心**

记录每次用户输入，形成 Prompt 思维链：

```
用户输入 1 (初始 Prompt)
    ↓ AI 执行
用户输入 2 (修正/补充)  ← 记录：为什么需要修正？
    ↓ AI 执行
用户输入 3 (Bug 修复)   ← 记录：原始设计遗漏了什么？
    ↓ AI 执行
   完成
```

**记录时机**：
| 触发条件 | 记录内容 |
|----------|----------|
| 用户给出修正指令 | 原始 Prompt 缺失了什么信息 |
| 代码执行失败 | 用户的补充说明 |
| 用户补充需求 | 是范围蔓延还是原始需求不完整 |
| 里程碑完成 | 保存当前进展 |
| 测试失败 | 记录失败原因和修复策略 |

</prompt_chain_recording>

<action>
1. **读取 HARNESS**：加载 `.harness/harness/{task-slug}/harness.md`
2. **逐个执行 PLAN.md 中的任务**（TDD 模式）：
   - 🔴 先编写测试用例（基于 HARNESS）
   - 🟢 再实现功能代码
   - ♻️ 运行测试验证
   - 🔄 失败则循环修复（最多 5 次）
3. 每次用户输入后记录到 task-memory
4. 定期保存进展（防止上下文丢失）
5. 所有任务完成后进入 REVIEW
</action>

```
进入 EXECUTE 阶段...

/executing-plans

读取 HARNESS: .harness/harness/{{task-slug}}/harness.md
→ 提取 MUST 条件作为测试用例

执行 T1: {{任务名称}}
├─ 🔴 编写测试用例（基于 HARNESS MUST 条件）
├─ 🟢 实现功能代码
├─ ⚡ 运行测试
├─ ✓ 测试通过
└─ /task-memory save "完成 T1"

执行 T2: {{任务名称}}
├─ 🔴 编写测试用例
├─ 🟢 实现功能代码
├─ ⚡ 运行测试
├─ ✗ 测试失败（重试 1/5）
│  ├─ 分析失败原因
│  ├─ 修复代码
│  └─ ⚡ 重新测试
├─ ✓ 测试通过
└─ /task-memory save "完成 T2（含 1 次修复）"
```

<checkpoint_protocol>
遇到 checkpoint 任务时：
1. 暂停执行
2. 展示验证方式（基于 HARNESS）
3. 运行所有相关测试
4. 等待用户确认
5. 记录用户反馈
</checkpoint_protocol>

<verify_loop_protocol>

## ⚡ TDD-Driven Verify Loop（测试驱动循环）

**核心理念**：HARNESS 定义标准 → 测试验证 → 失败修复 → 直到通过

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    TDD-Driven Verify Loop 流程                             │
└───────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │ 读取 HARNESS     │
                          │ 提取 MUST 条件   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ 🔴 编写测试用例  │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ 🟢 实现代码      │
                          └────────┬────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ ⚡ 运行测试               │◄─────────────────┐
                    └──────────┬───────────────┘                  │
                               │                                  │
                  ┌────────────┴────────────┐                    │
                  │                         │                    │
                  ▼                         ▼                    │
            ┌──────────┐             ┌──────────┐               │
            │ 全部通过  │             │ 有失败    │               │
            └────┬─────┘             └────┬─────┘               │
                 │                        │                      │
                 │                        ▼                      │
                 │                 ┌──────────────┐             │
                 │                 │ 重试次数 < 5? │             │
                 │                 └──────┬───────┘             │
                 │                        │                      │
                 │              ┌────────┴────────┐             │
                 │              │ YES             │ NO           │
                 │              ▼                 ▼             │
                 │      ┌──────────────┐   ┌──────────────┐     │
                 │      │ 分析失败原因  │   │ 暂停询问用户  │     │
                 │      └──────┬───────┘   └──────────────┘     │
                 │             │                                │
                 │             ▼                                │
                 │      ┌──────────────┐                        │
                 │      │ 修复代码      │                        │
                 │      └──────┬───────┘                        │
                 │             │                                │
                 │             └────────────────────────────────┘
                 │
                 ▼
          进入下一任务 / REVIEW
```

**TDD 执行流程**：

```
FOR each task in PLAN:

  1️⃣ 准备阶段
     - 读取 HARNESS: .harness/harness/{task-slug}/harness.md
     - 提取 MUST 条件作为测试用例
     - 确定测试框架（从 HARNESS 中读取）

  2️⃣ 红灯阶段（Red）
     - 编写测试用例（覆盖所有 MUST 条件）
     - 运行测试 → 确认失败（🔴）
     - 记录期望行为

  3️⃣ 绿灯阶段（Green）
     - 实现最小代码（仅满足测试）
     - 不过度设计
     - 不过早优化

  4️⃣ 循环验证（Loop）
     retry_count = 0
     WHILE (测试未通过 AND retry_count < 5):
        a. 运行测试: bash .harness/harness/{task-slug}/verify.sh
        b. IF 失败:
           - 分析失败原因（见下方模板）
           - 修复代码（最小修改）
           - 记录到 task-memory
           - retry_count++
        c. IF 通过:
           - BREAK

  5️⃣ 异常处理
     IF retry_count >= 5:
        - 暂停执行
        - 询问用户："测试连续失败 5 次，是否需要："
          a. 重新设计 HARNESS
          b. 重新制定 PLAN
          c. 手动介入修复
        - 等待用户决策

  6️⃣ 完成标记
     - ✓ Task 完成
     - 记录到 task-memory
     - 进入下一个 task
```

**失败分析模板（增强版）**：

```markdown
## 🔴 测试失败分析

### 基本信息
- **Task ID**: T2
- **重试次数**: 2/5
- **失败时间**: 2026-03-22 14:30:00

### 失败的测试用例
```bash
# 运行命令
bash .harness/harness/{{task-slug}}/verify.sh

# 失败输出
FAIL: should increment count when + clicked
  Expected: count = 1
  Received: count = 0

FAIL: should not exceed max value 100
  Expected: count <= 100
  Received: count = 101
```

### 根因分析
**直接原因**：
- 事件监听器未正确绑定（用例 1）
- 未实现最大值限制逻辑（用例 2）

**根本原因**：
- HARNESS 明确要求"最大值 100"，但实现时遗漏
- 按钮选择器 `#increment-btn` 与 HTML 不匹配

### 修复方案
```diff
// src/counter.js
- document.getElementById('increment-btn')
+ document.getElementById('increment')

+ if (this.count < 100) {
+   this.count++;
+ }
```

### HARNESS 关联
- [x] MUST: 点击 + 按钮，计数增加 → **失败**
- [ ] MUST: 最大值不超过 100 → **失败**
- [ ] SHOULD: 显示当前计数 → **未测试**

### 重测计划
1. 修复代码（见上方 diff）
2. 运行测试: `bash .harness/harness/{{task-slug}}/verify.sh`
3. 预期结果：所有 MUST 条件通过
```

**最大重试次数**：5 次

**超过 5 次仍未通过的处理流程**：
1. 暂停自动执行
2. 生成详细失败报告（包含所有尝试）
3. 使用 AskUserQuestion 询问用户：
   ```
   问题: "测试连续失败 5 次，建议采取以下措施："
   选项:
   1. "重新设计 HARNESS" - 验收标准可能不合理
   2. "调整 PLAN" - 任务拆分可能有问题
   3. "手动介入" - 需要人工修复代码
   4. "跳过此任务" - 标记为失败，继续后续任务
   ```

</verify_loop_protocol>

<tdd_best_practices>

## TDD 最佳实践

### 1. 测试先行（Test First）
```
❌ 错误：先写代码，后补测试
✅ 正确：先写测试，再写代码
```

### 2. 最小实现（Minimal Implementation）
```
❌ 错误：一次性实现完整功能 + 额外特性
✅ 正确：只写让测试通过的最少代码
```

### 3. 单一职责（Single Responsibility）
```
❌ 错误：一个测试用例验证多个条件
✅ 正确：一个测试用例只验证一个 HARNESS MUST 条件
```

### 4. 快速反馈（Fast Feedback）
```
❌ 错误：写完所有代码才运行测试
✅ 正确：每完成一个功能点就运行测试
```

### 5. 重构时机（Refactoring Timing）
```
❌ 错误：测试失败时重构
✅ 正确：测试通过后才重构（保持绿灯）
```

### HARNESS 映射规则

| HARNESS 条件类型 | 测试策略 |
|-----------------|---------|
| MUST 条件 | 必须有对应测试用例，失败则任务失败 |
| SHOULD 条件 | 建议有测试用例，失败可接受 |
| 验证命令 | 作为测试脚本的一部分 |

</tdd_best_practices>

<stage_gate type="checkpoint:human-verify" gate="blocking">

**🚧 阶段门控：EXECUTE → REVIEW**

<what-built>
所有任务已执行完成，测试全部通过。

**执行摘要**：
- ✅ 已完成任务: T1, T2, T3, T4
- ✅ 测试通过率: 100%
- ⚠️ 总重试次数: 3 次
- 📊 HARNESS 覆盖: 5/5 MUST 条件
</what-built>

<how-to-verify>
<completion_checklist>
执行完成前必须确认：

- [ ] 所有 PLAN 中的 task 已执行
- [ ] 所有 task 的测试已通过（绿灯 🟢）
- [ ] HARNESS 中所有 MUST 条件已验证
- [ ] 失败重试次数均 < 5 次
- [ ] task-memory 已记录所有偏差
</completion_checklist>
</how-to-verify>

<options>
<option id="approve">
  <name>✅ approve - 确认完成</name>
  <pros>进入 REVIEW 阶段生成复盘</pros>
  <cons>无法再返回执行任务</cons>
</option>
<option id="report">
  <name>📋 查看测试报告</name>
  <pros>查看详细测试结果</pros>
  <cons>需要额外时间</cons>
</option>
<option id="continue">
  <name>▶️ 继续执行</name>
  <pros>补充遗漏的任务</pros>
  <cons>延迟复盘</cons>
</option>
<option id="fix">
  <name>🔧 需要修复</name>
  <pros>修复发现的问题</pros>
  <cons>需要重新运行测试</cons>
</option>
</options>

<resume-signal>Type: approve | report | continue | fix</resume-signal>

**处理规则**：
| 选择 | 动作 |
|------|------|
| `approve` | → 进入 REVIEW 阶段 |
| `report` | → 展示详细测试日志 |
| `continue` | → 继续在 EXECUTE 阶段 |
| `fix` | → 返回修复问题 |

</stage_gate>

<done>
所有任务执行完成，测试全部通过，用户已确认
</done>
</step>

<step name="review">

**目标**：保存最终状态，结束任务

<action>
1. 调用 /task-memory save 保存最终进展
2. 调用 /task-memory end 结束任务
3. 验证所有 Harness 条件
</action>

```
进入 REVIEW 阶段...

/task-memory save "任务完成"

验证 Harness:
- [x] MUST 条件 1
- [x] MUST 条件 2
- [ ] SHOULD 条件 3 (未完成)

/task-memory end

任务记录已保存到: .harness/memory/tasks/{{task-id}}/
下次可使用 /task-memory recall 恢复上下文
```

<output_files>
```
.harness/memory/
├── current.json              # 已清空
└── tasks/
    └── task-2026-03-22-xxx/
        ├── meta.json         # 任务元信息
        ├── session-01.md     # 会话记录
        ├── session-02.md     # 会话记录（如有）
        └── final.md          # 最终状态
```
</output_files>

<done>
任务已保存，工作流完成

下次继续时：
/task-memory recall
</done>
</step>

</process>

---

<storage_structure>

```
.harness/
├── workflow.json              # 工作流状态
├── memory/                    # task-memory 产物
│   ├── current.json           # 当前状态
│   ├── init.md                # 初始意图
│   ├── deviation-*.md         # 偏差记录
│   ├── review.md              # 复盘报告
│   └── tasks/                 # 任务详情
├── harness/                   # task-harness 产物
│   └── {{task-slug}}/
│       ├── harness.md         # 验收标准
│       └── verify.sh          # 验证脚本
├── planning/                  # brainstorm 产物
│   └── brainstorm/
│       ├── mindmap.md         # 设计脑图
│       ├── options.md         # 方案对比
│       └── decision.md        # 最终决策
└── plan/                      # 执行计划
    └── PLAN.md                # 任务列表
```

</storage_structure>

---

<task_slug_rules>

## 任务名规范化（task-slug）

`task-slug` 用于目录命名，规则如下：
- 全部转小写
- 非字母数字字符转为 `-`
- 合并连续 `-`
- 去除首尾 `-`
- 若结果为空，回退到 `task-<timestamp>`

</task_slug_rules>

---

<tool_integration>

## 与 superpowers 的集成

| superpowers skill | 阶段 | 用途 |
|-------------------|------|------|
| `brainstorming` | BRAINSTORM | 创意发散 |
| `writing-plans` | PLAN | 编写执行计划 |
| `executing-plans` | EXECUTE | 执行计划 |

## 与 task-memory 的集成

| task-memory 命令 | 阶段 | 用途 |
|------------------|------|------|
| `start` | LISTEN | 记录初始意图 |
| `record` | EXECUTE | 记录偏差 |
| `end` | REVIEW | 生成复盘 |

## 与 task-harness 的集成

| task-harness 命令 | 阶段 | 用途 |
|-------------------|------|------|
| `/task-harness` | HARNESS | 定义验收边界 |

</tool_integration>

---

<best_practices>

1. **不要跳过 LISTEN** - 初始意图是偏差检测的基础
2. **不要跳过 HARNESS** - 没有明确边界就无法验证完成
3. **及时记录偏差** - 发现偏差立即记录，避免遗忘
4. **认真做 REVIEW** - 复盘是改进的关键
5. **保存 workflow.json** - 便于中断后恢复

</best_practices>

---

<anti_patterns>

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| 跳过 BRAINSTORM | 思考不足导致返工 | 至少做简短的方案探索 |
| 模糊的 Harness | 无法验证完成 | 使用可量化的标准 |
| 不记录偏差 | 无法复盘改进 | 发现偏差立即记录 |
| 不做 REVIEW | 无法沉淀经验 | 认真分析偏差根因 |

</anti_patterns>

---

<quick_mode>

`/task-workflow quick <任务描述>` 跳过 BRAINSTORM 阶段：

```
INIT → LISTEN → HARNESS → PLAN → EXECUTE ↔ VERIFY → REVIEW
              ↑
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

</quick_mode>

---

<yolo_mode>

## 🚀 YOLO 模式

`/task-workflow yolo <任务描述>` **全自动执行（无需阶段确认）**

```
INIT → LISTEN → BRAINSTORM → HARNESS → PLAN → EXECUTE ↔ VERIFY → REVIEW
                                        ↑         ↑      ↑
                                     AI 决策   AI 决策  AI 自动修复
```

### AI 自动决策

| 阶段 | AI 决策内容 |
|------|------------|
| BRAINSTORM | 自动选择最佳方案 |
| HARNESS | 自动选择测试框架 + 生成用例 |
| PLAN | 自动生成执行计划 |
| EXECUTE | 自动实现 + 自动修复循环 |

### 对比

| 模式 | 用户确认点 | 适用场景 |
|------|-----------|----------|
| 标准 | 每个阶段 | 复杂任务、首次任务 |
| quick | 跳过 BRAINSTORM | 目标明确 |
| **yolo** | **无阶段确认（失败会中止）** | 简单任务、演示、信任 AI |

### 示例

```bash
/task-workflow yolo 创建一个计数器组件

# AI 自动完成所有阶段，最后输出结果
```

</yolo_mode>

---

<stage_gate_protocol>

## 🚧 阶段门控协议 (Stage Gate Protocol)

**核心理念**：每个阶段完成后，必须用户明确 approve 才能进入下一阶段。

### 门控机制

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           阶段门控流程                                       │
└─────────────────────────────────────────────────────────────────────────────┘

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
    │ <stage_gate type="checkpoint">    │
    │ <decision>是否 approve?</decision>│
    │ <options>...</options>            │
    │ <resume-signal>...</resume-signal>│
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

### 各阶段门控要求

| 阶段 | 门控类型 | 门控条件 | resume-signal |
|------|----------|----------|---------------|
| LISTEN | - | init.md 已创建 | 自动进入 |
| BRAINSTORM | `checkpoint:decision` | decision.md 已创建 + 需求澄清确认 | `approve \| continue \| adjust` |
| HARNESS | `checkpoint:decision` | harness.md 已创建 + 验收标准确认 | `approve \| adjust \| add` |
| PLAN | `checkpoint:decision` | PLAN.md 已创建 + 计划确认 | `approve \| adjust \| add` |
| EXECUTE | `checkpoint:human-verify` | 所有任务完成 + 测试通过 | `approve \| report \| continue \| fix` |
| REVIEW | - | 复盘报告已生成 | 自动完成 |

### 标准门控格式

```xml
<stage_gate type="checkpoint:decision" gate="blocking">

**🚧 阶段门控：{当前阶段} → {下一阶段}**

<decision>{需要确认的问题}</decision>

<context>{为什么需要确认}</context>

<options>
<option id="approve">
  <name>✅ approve - {描述}</name>
  <pros>{优点}</pros>
  <cons>{权衡}</cons>
</option>
<option id="alt">
  <name>🔄 {其他选项}</name>
  <pros>{优点}</pros>
  <cons>{权衡}</cons>
</option>
</options>

<resume-signal>Type: approve | alt</resume-signal>

</stage_gate>
```

### 用户响应处理

| 响应类型 | 处理方式 |
|----------|----------|
| `approve` / `yes` / `y` / `ok` / `✓` | 进入下一阶段 |
| 空响应（直接回车） | 视为批准 |
| 其他内容 | 按选项 ID 匹配，或视为问题描述 |

### 模式对比

| 模式 | 门控确认 | 说明 |
|------|----------|------|
| 标准 | 每个阶段都需要 | 适合复杂任务 |
| quick | 跳过 BRAINSTORM，其他需要 | 适合目标明确的任务 |
| **yolo** | **跳过所有门控** | 全自动，失败会中止 |

**YOLO 模式 auto_advance 行为**：
- `checkpoint:decision` → 自动选择第一个选项
- `checkpoint:human-verify` → 自动批准

</stage_gate_protocol>

---

<stage_transitions>

## 阶段跳转规则

| 从 | 到 | 允许 | 条件 | 门控确认 |
|----|----|----|------|----------|
| INIT | LISTEN | ✅ | workflow.json 已创建 | ❌ 不需要 |
| LISTEN | BRAINSTORM | ✅ | init.md 已创建 | ❌ 不需要（自动进入） |
| LISTEN | HARNESS | ✅ | quick 模式 + init.md 已创建 | ❌ 不需要（自动进入） |
| BRAINSTORM | HARNESS | ✅ | decision.md 已创建 + 需求澄清确认 | ✅ **必须** |
| HARNESS | PLAN | ✅ | harness.md 已创建 + 验收标准确认 | ✅ **必须** |
| PLAN | EXECUTE | ✅ | PLAN.md 已创建 + 计划确认 | ✅ **必须** |
| EXECUTE | REVIEW | ✅ | 所有任务完成 + 测试通过 + 用户 approve | ✅ **必须** |
| 任意 | 之前的阶段 | ✅ | 支持回退修改 | ❌ 不需要 |

## 使用 goto 命令

```
/task-workflow goto HARNESS    # 回到验收定义阶段
/task-workflow goto EXECUTE    # 直接进入执行
```

**注意**：跳过阶段可能导致产物缺失，AI 会提示需要补充的内容。

</stage_transitions>

---

<examples>

## 完整示例

```
用户: /task-workflow 开发用户认证模块

AI: 启动任务工作流

## INIT ✓
- 任务 ID: wf-2026-03-22-001
- 目录: .harness/ 已创建

## LISTEN
启动 task-memory 监听...
/task-memory start "开发用户认证模块" "支持邮箱、手机、第三方登录"

初始意图已记录:
- 预期目标: 实现用户认证功能
- 预期文件: src/auth/, src/api/auth.ts
- 预期输出: 可用的登录系统

## BRAINSTORM
/brainstorming

请描述需求细节...

用户: 支持邮箱密码登录、手机验证码登录、微信/GitHub OAuth

AI: [生成方案对比]
    方案 A: 统一认证接口
    方案 B: 分离认证服务

    你选择哪个方案？

用户: 方案 A

AI: 已记录决策

## HARNESS
/task-harness "实现用户认证模块"

定义验收标准...

[问答过程...]

生成 Harness:
### MUST
- [ ] 邮箱登录返回有效 token
- [ ] 手机号格式验证
- [ ] 第三方登录跳转正确

## PLAN
/writing-plans

生成执行计划:
1. T1: 创建 User 模型
2. T2: 实现邮箱登录 API
3. T3: 实现手机验证码
4. C1: Checkpoint - 验证登录流程
5. T4: 集成第三方 OAuth

## EXECUTE
/executing-plans

执行 T1: 创建 User 模型...
✓ T1 完成

执行 T2: 实现邮箱登录 API...
⚠ 发现偏差: 密码加密库与预期不同
/task-memory record "密码加密库使用 bcrypt 而非 argon2"
✓ T2 完成（含偏差修复）

[继续执行...]

## REVIEW
/task-memory end

生成复盘报告:
- 总耗时: 4h
- 偏差数: 3
- 改进建议: ...

工作流完成！
```

</examples>
