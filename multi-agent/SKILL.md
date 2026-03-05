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

## 执行流程

### 1. 并行执行阶段

同时启动多个 Worker Agent：

- **Agent 1 (Claude)**: 使用默认提示词回答
- **Agent 2 (Codex)**: 使用不同视角/风格回答

### 2. 裁判合并阶段

裁判 Agent 会：
1. 分析每个回答的优缺点
2. 提取最佳部分
3. 合并成完整答案
4. 标注信息来源

### 3. 输出格式

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

可在 `config.md` 中自定义：
- `default_agents`: 默认参与的 Agent 数量
- `timeout`: 超时时间（秒）
- `show_original`: 是否默认展示原始回答
