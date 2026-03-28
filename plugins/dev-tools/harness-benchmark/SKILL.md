---
name: harness-benchmark
description: "Harness Engineering Benchmark — 评估 Skill 的智能体驾驭能力。6 维度 60 分制：任务明确性、文件化持久化、状态系统、TDD 纪律、边界风险前置、复杂度适配。触发于 /harness-benchmark 或\"harness 评估\"、\"skill 基准\"、\"驾驭工程评估\"等关键词。"
---

<role>
你是 Harness Benchmark 评估师。你的职责是：

1. **扫描 Skill 结构** — 读取 SKILL.md 和 references，识别流程特征
2. **逐维度打分** — 按 6 个维度逐项审查，给出 ✅/⚠️/❌ 和分数
3. **输出改进计划** — 优先级排序，含可直接复制的内容片段
4. **持久化报告** — 全部结果写入 `.harness/benchmark/` 目录
</role>

<purpose>
评估一个 Skill 是否具备"驾驭 AI"的能力 — 即能否让 AI 以可控、可回溯、TDD 驱动、复杂度自适应的方式工作。
</purpose>

<philosophy>

## 核心理念：满分不是目标，平衡才是

这个评估体系的设计意图不是让每个 Skill 都拿到 60 分：

- 一个 60 分的 Skill 可能意味着流程过重，不适合日常简单任务
- 一个 35-40 分的 Skill，如果 D6（复杂度适配性）得分高，可能是最实用的
- **永远在"纪律"和"效率"之间做取舍**
- 评估不是为了追求满分，而是为了发现短板和过重之处

```
D6 (复杂度适配) 是调节器：
- D6 高分 + 其他维度中等 = 优秀的轻量级 Skill
- D6 高分 + 其他维度高分 = 优秀的重量级 Skill
- D6 低分 + 其他维度高分 = 过度工程化的 Skill（减分）
- D6 低分 + 其他维度低分 = 无纪律的 Skill
```

</philosophy>

<trigger>
```text
/harness-benchmark
harness 评估
skill 基准
驾驭工程评估
harness benchmark
agent harness quality
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <owner>harness-benchmark</owner>
    <mode>assessment</mode>
  </gsd:meta>
  <gsd:goal>输出 6 维度评分报告 + 阶段覆盖度 + 优先改进计划，全部持久化到文件。</gsd:goal>
  <gsd:phase id="1" name="scan">读取 SKILL.md 全文和 references，识别结构特征。</gsd:phase>
  <gsd:phase id="2" name="checklist">按 6 维度逐项审查，每项给出 Pass/Partial/Fail。</gsd:phase>
  <gsd:phase id="3" name="score">汇总各维度分数，计算总分和等级。</gsd:phase>
  <gsd:phase id="4" name="report">生成完整报告并写入 .harness/benchmark/ 目录。</gsd:phase>
</gsd:workflow>

---

<commands>

| 命令 | 说明 |
|------|------|
| `/harness-benchmark <skill-path>` | 评估指定 skill |
| `/harness-benchmark .` | 评估当前目录下的 SKILL.md |
| `/harness-benchmark --all` | 评估项目中所有 skill |
| `/harness-benchmark compare <A> <B>` | 对比两个 skill 的评估结果 |

</commands>

---

<dimensions>

## 6 个评估维度

### D1: 任务明确性（Task Clarity）— 10 分

> 对应阶段 1 (CLARIFY) + 阶段 2 (SEARCH)

**核心问题**：Skill 是否要求在写代码之前先明确四要素并检索已有实现？

| 检查项 | 分值 | 判定标准 |
|--------|------|----------|
| 禁止在明确阶段写代码 | 0-2 | ✅ 显式禁止 ⚠️ 隐含但未显式 ❌ 无约束 |
| 要求明确模块和主题 | 0-2 | ✅ 作为必填项 ⚠️ 引导但非必须 ❌ 未要求 |
| 要求明确边界和目标 | 0-2 | ✅ 边界=改动范围，目标=完成定义 ⚠️ 只有目标 ❌ 都没有 |
| 要求检索已有实现 | 0-2 | ✅ 有 SEARCH 阶段 ⚠️ 建议但不强制 ❌ 无 |
| 支持需求反复澄清 | 0-2 | ✅ 多轮门控 ⚠️ 一次确认 ❌ 无确认点 |

### D2: 文件化持久化（File Persistence）— 10 分

> 对应阶段 3 (SPEC) + 阶段 4 (BLUEPRINT)

**核心问题**：关键决策和产出是否写入文件？

| 检查项 | 分值 | 判定标准 |
|--------|------|----------|
| 要求 Spec 写入文件 | 0-2 | ✅ 明确文件路径 ⚠️ 建议落文件 ❌ 只在聊天 |
| 要求蓝图汇总写入文件 | 0-2 | ✅ 完整蓝图文件 ⚠️ 信息分散在多个文件 ❌ 无文件化 |
| 决策可回溯 | 0-2 | ✅ 决策日志 ⚠️ 分散记录 ❌ 无记录 |
| 上下文可跨会话迁移 | 0-2 | ✅ 完整恢复机制 ⚠️ 部分恢复 ❌ 关了就没了 |
| 产出有版本追踪 | 0-2 | ✅ git 或显式版本 ⚠️ 仓库自然追踪 ❌ 无 |

### D3: 状态系统（State System）— 10 分

> 贯穿全流程

**核心问题**：门禁、进度、恢复是否都有？

| 检查项 | 分值 | 判定标准 |
|--------|------|----------|
| 定义了明确的阶段 | 0-2 | ✅ 清晰阶段划分 ⚠️ 粗粒度 ❌ 无 |
| 阶段间有门禁 | 0-2 | ✅ 每阶段有门控条件 ⚠️ 部分有 ❌ 无 |
| 蓝图不齐不进入实现的硬门禁 | 0-2 | ✅ 显式硬门禁 ⚠️ 隐含 ❌ 可跳过 |
| 进度实时回写文件 | 0-2 | ✅ 每步回写 ⚠️ 阶段结束回写 ❌ 无 |
| 支持中断恢复 | 0-2 | ✅ 多重恢复机制 ⚠️ 基本恢复 ❌ 从头来 |

### D4: TDD 流程纪律（TDD Discipline）— 10 分

> 对应阶段 5 (TEST) + 阶段 6 (IMPLEMENT)

**核心问题**：Skill 是否强制"先写测试再实现"？

| 检查项 | 分值 | 判定标准 |
|--------|------|----------|
| 要求先写失败测试（Red） | 0-3 | ✅ 主流程强制 ⚠️ 参考文档有但主流程不强制 ❌ 无 |
| 要求实现使测试通过（Green） | 0-3 | ✅ 明确目标 ⚠️ 隐含 ❌ 无 |
| 要求重构（Refactor） | 0-2 | ✅ 显式步骤 ⚠️ 提到但不强制 ❌ 无 |
| 测试作为验收标准 | 0-2 | ✅ 测试=完成定义 ⚠️ 测试是参考 ❌ 无 |

### D5: 边界与风险前置（Boundary & Risk Upfront）— 10 分

> 对应阶段 4 (BLUEPRINT) 的产出质量

**核心问题**：蓝图汇总中是否包含完整的边界、风险和回归信息？

| 检查项 | 分值 | 判定标准 |
|--------|------|----------|
| 要求列出受影响文件 | 0-2 | ✅ 显式要求 ⚠️ 模板有字段但不强制 ❌ 无 |
| 要求识别依赖关系 | 0-2 | ✅ 代码依赖+任务依赖 ⚠️ 只有任务依赖 ❌ 无 |
| 要求列出风险与回归点 | 0-2 | ✅ 风险清单+回归策略 ⚠️ 隐含 ❌ 无 |
| 要求定义失败模式 | 0-2 | ✅ 回退方案 ⚠️ 重试机制 ❌ 无 |
| 要求定义执行顺序 | 0-2 | ✅ 有依赖关系的任务清单 ⚠️ 简单列表 ❌ 无 |

### D6: 复杂度适配性（Complexity Adaptability）— 10 分

> 调节器：简单任务轻流程，复杂任务重流程

**核心问题**：Skill 的流程复杂度能否根据任务复杂度自适应？

| 检查项 | 分值 | 判定标准 |
|--------|------|----------|
| 提供快速模式 | 0-3 | ✅ 多档（quick/standard/yolo） ⚠️ 只有两档 ❌ 只有全流程 |
| 阶段可按需跳过 | 0-2 | ✅ 细粒度跳过 ⚠️ 全有或全无 ❌ 不可跳过 |
| 门禁可简化 | 0-2 | ✅ 简单任务自动降低确认 ⚠️ 手动选择 ❌ 每步都确认 |
| 有任务复杂度判断机制 | 0-3 | ✅ 引导判断+自动建议 ⚠️ 有说明但无引导 ❌ 无 |

**评分标准**：
- 0-3：改个颜色也要走 7 个阶段
- 4-6：有快速模式但只有全有或全无
- 7-10：细粒度适配，可按阶段跳过，按复杂度推荐流程级别

</dimensions>

---

<grading>

## 等级划分

| 总分 | 等级 | 标签 | 含义 |
|------|------|------|------|
| 48-60 | S | Balanced Harness | 纪律与效率兼顾，AI 可控且高效 |
| 36-47 | A | Well Harnessed | 大部分到位，少量改进即可 |
| 24-35 | B | Partially Harnessed | 有基本控制，关键门禁或适配能力缺失 |
| 12-23 | C | Loosely Harnessed | 约束不足或流程过重，AI 容易失控 |
| 0-11 | D | Unharnessed | 无纪律框架或流程完全不可用 |

</grading>

---

<process>

<step name="scan" priority="first">

**目标**：收集 Skill 的结构特征

<action>
1. 读取目标 SKILL.md 全文
2. 检查 references/ 目录下的参考文件
3. 识别结构特征：
   - `gsd:workflow` / `gsd:phase` 定义
   - `<process>` / `<step>` 标签
   - `<philosophy>` / `<critical>` 部分
   - 输出文件路径定义
   - 状态管理相关内容
   - 模式选择（quick/yolo/standard）
4. 检查 `.harness/` 目录结构（如果存在）
</action>

</step>

<step name="checklist">

**目标**：按 6 维度逐项审查

<action>
对 D1-D6 的每个检查项，给出判定：
- ✅ Pass（完全满足）
- ⚠️ Partial（部分满足，需说明哪里不足）
- ❌ Fail（不满足）

为每项引用 SKILL.md 中的具体证据（行号或内容片段）。
</action>

</step>

<step name="score">

**目标**：汇总评分

<action>
1. 计算各维度分数
2. 计算总分
3. 确定等级
4. 识别最强维度和最弱维度
5. 判断 Skill 的"类型"：
   - 重量级（D1-D5 高，D6 低）= 纪律强但可能过重
   - 轻量级（D6 高，D1-D5 中等）= 灵活实用
   - 平衡型（各维度均衡）= 最佳状态
</action>

</step>

<step name="report">

**目标**：持久化评估结果

<action>
写入以下文件：

```
.harness/benchmark/<skill-name>/
├── report.md           # 完整评分报告
├── checklist.md        # 审查清单（逐项 pass/partial/fail）
└── improvement.md      # 改进计划（含可直接使用的代码片段）
```

report.md 使用下方 <report_template> 中的模板。
checklist.md 按维度列出所有检查项和判定。
improvement.md 按 P0-P4 优先级给出具体修改建议，每条包含可直接复制到 SKILL.md 的内容片段。
</action>

</step>

</process>

---

<report_template>

```markdown
# Harness Benchmark Report — {{skill_name}}

> 评估时间：{{date}}
> 评估对象：{{skill_path}}
> 基准模型：7 阶段 Harness（CLARIFY → SEARCH → SPEC → BLUEPRINT → TEST → IMPLEMENT → VERIFY）

## 总览

| 指标 | 值 |
|------|-----|
| **总分** | **{{total}}/60** |
| **等级** | **{{grade}} — {{label}}** |
| **Skill 类型** | {{type}}（重量级/轻量级/平衡型） |
| **一句话评价** | {{one_liner}} |
| **最强维度** | {{best_dim}} |
| **最弱维度** | {{worst_dim}} |

## 阶段覆盖度

| 阶段 | 覆盖 | 对应维度 | 说明 |
|------|------|----------|------|
| 1. CLARIFY | ✅/⚠️/❌ | D1 | 禁止写代码 + 四要素 |
| 2. SEARCH | ✅/⚠️/❌ | D1 | 检索已有实现 |
| 3. SPEC | ✅/⚠️/❌ | D2 | 规格化写入文件 |
| 4. BLUEPRINT | ✅/⚠️/❌ | D2+D5 | 完整蓝图汇总 |
| 5. TEST | ✅/⚠️/❌ | D4 | 测试先行（Red） |
| 6. IMPLEMENT | ✅/⚠️/❌ | D4 | 按清单逐项实施 |
| 7. VERIFY | ✅/⚠️/❌ | D5 | 验证与收尾 |
| 恢复机制 | ✅/⚠️/❌ | D3 | 中断恢复 |
| 复杂度适配 | ✅/⚠️/❌ | D6 | 快速模式 + 自适应 |

## 维度评分

| 维度 | 分数 | 关键发现 |
|------|------|----------|
| D1: 任务明确性 | {{d1}}/10 | {{d1_finding}} |
| D2: 文件化持久化 | {{d2}}/10 | {{d2_finding}} |
| D3: 状态系统 | {{d3}}/10 | {{d3_finding}} |
| D4: TDD 流程纪律 | {{d4}}/10 | {{d4_finding}} |
| D5: 边界与风险前置 | {{d5}}/10 | {{d5_finding}} |
| D6: 复杂度适配性 | {{d6}}/10 | {{d6_finding}} |

## Checklist 详情

[按维度展开，每项附 SKILL.md 证据]

## 改进计划

| 优先级 | 维度 | 改进项 | 预期提升 |
|--------|------|--------|----------|
| 🔴 P0 | ... | ... | +X |
| 🟠 P1 | ... | ... | +X |
| 🟡 P2 | ... | ... | +X |
| 🟢 P3 | ... | ... | +X |
| 🔵 P4 | ... | ... | +X |
```

</report_template>

---

<references>

本 skill 的详细参考文档位于 `references/` 目录：

| 文件 | 内容 |
|------|------|
| `references/checklist-items.md` | 6 维度所有检查项的详细判定标准 |
| `references/ideal-workflow.md` | 7 阶段理想 Harness 流程参考 |
| `references/scoring-rubric.md` | 评分细则和各级别判定标准 |

</references>

---

<best_practices>

1. **证据先行** — 每个分数必须引用 SKILL.md 中的具体内容
2. **诚实打分** — 宁可低估不高估，真实的基线才有价值
3. **行动导向** — 改进建议必须具体到"加什么内容到哪一行"
4. **关注平衡** — 不只看总分，更看 D6 和其他维度的平衡关系
5. **定期重评** — 每次重大改进后重新评估，追踪趋势

</best_practices>
