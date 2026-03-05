---
name: multi-agent
description: 多 Agent 协作，并行调用多个 AI 模型并合并最佳结果。适用于需要高质量答案、代码审查、风险对冲的场景。
triggers:
  - /multi-agent
  - /ma
---

# Multi-Agent 协作 Skill

## 功能说明

通过并行调用多个 Agent（如 Claude、Codex）回答同一问题，然后由裁判 Agent 合并最佳结果。

## 使用方式

```bash
# 基本使用
/multi-agent "你的问题"

# 简写
/ma "你的问题"
```

## 执行流程概述

1. **并行执行**：同时启动 2 个 Worker Agent
2. **裁判合并**：分析并合并最佳结果
3. **输出结果**：展示综合答案 + 来源标注

## 输出格式

```markdown
## 综合答案

[合并后的最终答案]

---
### 来源标注
- 要点 A: 来自 Agent 1
- 要点 B: 来自 Agent 2
- 综合: 裁判 Agent

<details>
<summary>查看各 Agent 原始回答</summary>

### Agent 1 回答
...

### Agent 2 回答
...

</details>
```

## 最佳实践

1. **适用场景**：复杂问题、代码审查、重要决策
2. **不适用**：简单查询、时间敏感任务
3. **建议**：对结果有疑问时展开查看原始回答

## 配置

当前 Skill 使用默认配置。未来版本可能支持以下自定义选项：
- Worker 数量（默认 2）
- 超时时间（默认 120 秒）
- 是否展示原始回答（默认 false）

## Claude 执行指令

当用户调用此 Skill 时，请**严格**按以下步骤执行：

### 步骤 1: 解析用户问题

提取用户的核心问题，记为 `{{question}}`。

### 步骤 2: 并行调用 Worker Agents

**重要：** 必须在**单条消息**中同时发起多个 Task tool 调用！

**调用格式示例：**

在单条 assistant 消息中，包含多个 Task tool 调用：

```xml
<function_calls>
<invoke name="Task">
 <parameter name="subagent_type">general-purpose</parameter>
 <parameter name="description">Worker 1: 标准视角</parameter>
 <parameter name="prompt">请回答以下问题：...</parameter>
</invoke>
<invoke name="Task">
 <parameter name="subagent_type">general-purpose</parameter>
 <parameter name="description">Worker 2: 替代视角</parameter>
 <parameter name="prompt">请从不同角度分析...</parameter>
</invoke>
</function_calls>
```

**Worker 1 配置：**
- subagent_type: "general-purpose"
- description: "Worker 1: 标准视角"
- prompt 内容:
  请回答以下问题：

  {{question}}

  要求：
  1. 提供完整、准确的回答
  2. 如果涉及代码，给出可运行的示例
  3. 如果不确定，明确说明
  4. 保持回答结构清晰

**Worker 2 配置：**
- subagent_type: "general-purpose"
- description: "Worker 2: 替代视角"
- prompt 内容:
  请从**不同角度**分析以下问题：

  {{question}}

  要求：
  1. 尝试从不同于常规的视角分析问题
  2. 考虑边界情况和潜在风险
  3. 如果涉及代码，思考可能的优化或替代方案
  4. 指出可能被忽略的细节

### 步骤 3: 等待所有 Worker 完成

收集所有 Agent 的回答：
- `{{agent_1_response}}` = Worker 1 的回答
- `{{agent_2_response}}` = Worker 2 的回答

如果某个 Worker 失败：
- 继续使用其他成功的回答
- 在最终输出中标注 "Agent X 未能完成"

### 步骤 4: 调用裁判 Agent

使用 Task tool 调用裁判，**在所有 Worker 完成后**执行：

**裁判 Agent 配置：**
- subagent_type: "general-purpose"
- description: "裁判 Agent: 合并分析结果"

**Prompt 内容：**

```
你是裁判 Agent。请综合以下多个 AI 的回答，给出最佳答案。

=== Agent 1 (标准视角) 回答 ===
{agent_1_response}

=== Agent 2 (替代视角) 回答 ===
{agent_2_response}

请按以下步骤处理：

## 1. 分析阶段

对每个回答评估：
- 准确性：信息是否正确
- 完整性：是否覆盖所有要点
- 实用性：建议是否可执行
- 独特性：是否有独特见解

## 2. 综合阶段

- 提取每个回答的最佳部分
- 解决冲突信息（说明选择理由）
- 补充遗漏的关键信息
- 统一风格和格式

## 3. 输出阶段

按以下格式输出最终答案：

## 综合答案

[合并后的最终答案，结构清晰，内容完整]

---
### 📌 来源标注

| 要点 | 来源 | 说明 |
|------|------|------|
| xxx | Agent 1 | 原因 |
| yyy | Agent 2 | 原因 |
| 综合 | Judge | 整合/补充 |

<details>
<summary>📄 查看各 Agent 原始回答</summary>

### Agent 1 (标准视角) 回答
{agent_1_response}

### Agent 2 (替代视角) 回答
{agent_2_response}

</details>
```

**注意：** `{agent_1_response}` 和 `{agent_2_response}` 是占位符，执行时替换为实际的 Worker 回答。

### 步骤 5: 输出最终结果

直接展示裁判 Agent 的输出作为最终答案。

### 错误处理

1. **单个 Worker 失败**：继续使用其他成功的回答
2. **所有 Worker 失败**：返回错误信息，建议用户重试
3. **裁判 Agent 失败**：直接展示所有 Worker 的原始回答

### 性能优化

- 默认并行调用 2 个 Worker
- 可根据问题复杂度调整 Worker 数量
- 设置合理的超时时间（建议 120 秒）
