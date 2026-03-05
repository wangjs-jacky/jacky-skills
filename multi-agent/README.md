# Multi-Agent 协作 Skill

一个用于 Claude Code 的多 Agent 协作 Skill，通过并行调用多个 AI 模型并合并最佳结果来提高答案质量。

## 特性

- ✅ **并行执行**：同时调用 2 个 Worker Agent，提高效率
- ✅ **多视角分析**：标准视角 + 替代视角，覆盖更全面
- ✅ **智能合并**：裁判 Agent 分析、对比、综合最佳结果
- ✅ **来源标注**：清晰标注每个要点的来源，透明可追溯
- ✅ **错误容错**：单个 Agent 失败不影响整体结果

## 安装

```bash
# 方式 1：链接到全局（开发模式）
cd /Users/jiashengwang/jacky-github/jacky-skills
j-skills link multi-agent

# 方式 2：安装到全局
j-skills install multi-agent -g
```

## 使用

```bash
# 基本使用
/multi-agent "你的问题"

# 简写
/ma "你的问题"
```

### 示例

**代码审查：**
```
/ma "请审查这段代码的安全性问题：
function login(username, password) {
  const query = `SELECT * FROM users WHERE username='${username}'`;
  return db.query(query);
}"
```

**技术选型：**
```
/ma "React 项目状态管理选型：Redux vs Zustand vs Jotai"
```

**问题诊断：**
```
/ma "我的 Node.js 应用内存持续增长，可能的原因？"
```

## 适用场景

| 场景 | 效果 |
|------|------|
| 代码审查 | 多角度发现潜在问题 |
| 技术选型 | 全面对比不同方案 |
| 问题诊断 | 降低遗漏风险 |
| 重要决策 | 多视角验证 |
| 复杂问题 | 获得更完整的答案 |

## 不适用场景

- ❌ 简单查询（如 "今天日期"、"1+1等于几"）
- ❌ 时间敏感任务（会增加约 2-3 倍延迟）
- ❌ 单一正确答案的问题

## 工作原理

```
用户提问
    │
    ├──────────────────┐
    ▼                  ▼
┌─────────┐      ┌─────────┐
│ Worker 1│      │ Worker 2│   ← 并行执行
│ 标准视角 │      │ 替代视角 │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ▼
      ┌─────────────┐
      │ 裁判 Agent  │   ← 分析、合并、标注来源
      └─────────────┘
              │
              ▼
      ┌─────────────┐
      │  综合答案   │
      └─────────────┘
```

## 输出格式

```markdown
## 综合答案

[合并后的最终答案]

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
...

### Agent 2 (替代视角) 回答
...

</details>
```

## 文件结构

```
multi-agent/
├── SKILL.md              # Skill 主配置文件
├── README.md             # 本文档
├── prompts/
│   ├── worker.md         # Worker Agent 提示词（标准视角）
│   ├── worker-alt.md     # Worker Agent 提示词（替代视角）
│   └── judge.md          # 裁判 Agent 提示词
└── examples/
    └── usage.md          # 使用示例
```

## 配置

当前使用默认配置。未来版本可能支持：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| Worker 数量 | 2 | 并行调用的 Agent 数量 |
| 超时时间 | 120s | 单个 Agent 的超时时间 |
| 展示原始回答 | false | 是否默认展开原始回答 |

## 最佳实践

1. **选择合适的问题**：复杂、开放性的问题效果最好
2. **查看原始回答**：如果对结果有疑问，展开查看原始回答
3. **结合使用**：可以先用 `/ma` 获取全面答案，再用单 Agent 深入某个方向

## 许可

MIT

## 相关链接

- [Claude Code Skills 文档](https://docs.anthropic.com/claude-code/skills)
- [jacky-skills 仓库](https://github.com/wangjs-jacky/jacky-skills)
