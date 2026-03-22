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

<done>
Harness 定义完成，用户确认验收标准
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
</step>

<step name="execute">

**目标**：使用 superpowers:executing-plans 执行，同时 task-memory 监听偏差

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

</prompt_chain_recording>

<action>
1. 调用 superpowers:executing-plans
2. 逐个执行 PLAN.md 中的任务
3. 每次用户输入后记录到 task-memory
4. 定期保存进展（防止上下文丢失）
5. 每个任务完成后验证
</action>

```
进入 EXECUTE 阶段...

/executing-plans

同时启动 Prompt 链记录...

执行 T1: {{任务名称}}
[执行中...]
✓ T1 完成
/task-memory save "完成 T1"

执行 T2: {{任务名称}}
[执行中...]
用户输入: "接口返回结构不对"
→ 记录: 原始 Prompt 未指定接口格式
/task-memory save "T2 执行中，用户补充接口格式要求"

✓ T2 完成
```

<checkpoint_protocol>
遇到 checkpoint 任务时：
1. 暂停执行
2. 展示验证方式
3. 等待用户确认
4. 记录用户反馈
</checkpoint_protocol>

<verify_loop_protocol>

## ⚡ Verify Loop（测试驱动循环）

**核心理念**：测试不通过 → 修复 → 重测 → 直到通过

```
┌─────────────────────────────────────────────────────────────────┐
│                      Verify Loop 流程                            │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  执行任务     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  运行测试     │◄─────────────────┐
                    └──────┬───────┘                  │
                           │                          │
              ┌────────────┴────────────┐             │
              │                         │             │
              ▼                         ▼             │
        ┌──────────┐             ┌──────────┐        │
        │ 全部通过  │             │ 有失败    │        │
        └────┬─────┘             └────┬─────┘        │
             │                        │               │
             │                        ▼               │
             │                 ┌──────────────┐      │
             │                 │ 分析失败原因  │      │
             │                 └──────┬───────┘      │
             │                        │               │
             │                        ▼               │
             │                 ┌──────────────┐      │
             │                 │  修复代码     │      │
             │                 └──────┬───────┘      │
             │                        │               │
             │                        └───────────────┘
             │
             ▼
      进入下一任务 / REVIEW
```

**触发条件**：
- 每个 task 完成后
- 每个 checkpoint 时
- 进入 REVIEW 前必须通过

**循环流程**：

```
while (测试未通过) {
  1. 运行验证: bash .harness/harness/{{task-slug}}/verify.sh
  2. 分析失败:
     - 读取错误信息
     - 定位失败断言
     - 对比期望 vs 实际
  3. 修复代码:
     - 修改源码
     - /task-memory save "修复: {{失败原因}}"
  4. 重新测试
}

// 通过后继续
进入下一阶段
```

**失败分析模板**：

```markdown
## 测试失败分析

### 失败用例
- `should increment count when + clicked`
  - 期望: count = 1
  - 实际: count = 0

### 根因
- 事件监听器未正确绑定
- 按钮选择器 `#increment-btn` 与 HTML 不匹配

### 修复
- 修改 `src/counter.html` 第 X 行
- 确保 `getElementById('increment-btn')` 正确

### 重测
```bash
bash .harness/harness/{{task-slug}}/verify.sh
```
```

**最大重试次数**：5 次

超过 5 次仍未通过：
- 暂停并询问用户
- 可能需要重新设计 HARNESS 或 PLAN

</verify_loop_protocol>

<done>
所有任务执行完成，测试全部通过
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

<stage_transitions>

## 阶段跳转规则

| 从 | 到 | 允许 | 条件 |
|----|----|----|------|
| INIT | LISTEN | ✅ | workflow.json 已创建 |
| LISTEN | HARNESS | ✅ | init.md 已创建 |
| LISTEN | BRAINSTORM | ✅ | init.md 已创建 |
| BRAINSTORM | HARNESS | ✅ | decision.md 已创建 |
| HARNESS | PLAN | ✅ | harness.md 已创建 |
| PLAN | EXECUTE | ✅ | PLAN.md 已创建且 verify.sh 已定义 |
| EXECUTE | REVIEW | ✅ | 所有任务完成且 MUST 验证全部通过 |
| 任意 | 之前的阶段 | ✅ | 支持回退修改 |

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
