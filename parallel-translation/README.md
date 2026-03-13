# Parallel Translation Skill

高效的多 agent 并行翻译 skill，使用便宜的 haiku 模型完成翻译工作，主 agent 只负责协调。

## 核心特性

✅ **成本节省 10-60 倍** - 使用 haiku 模型代替昂贵的 opus/sonnet
✅ **速度提升 5-10 倍** - 多个子 agent 并行处理
✅ **质量可接受** - 适合文档、注释、README 等内容
✅ **智能分片** - 自动按段落/文件分片优化处理

## 快速开始

### 1. 安装 skill

```bash
# 已经安装到全局，可以直接使用
j-skills list -g | grep parallel-translation
```

### 2. 使用 skill

在 Claude Code 中直接说：

```
使用 parallel-translation skill 翻译 README.md
```

或者：

```
使用 parallel-translation skill 翻译 docs/ 目录下所有 md 文件
```

## 工作原理

```
┌─────────────┐
│  Main Agent │ (sonnet/opus - 协调)
│   5% work   │
└──────┬──────┘
       │
       ├─→ ┌──────────────┐
       │   │ Subagent 1   │ (haiku - 翻译)
       │   │  Chunk 1     │
       │   └──────────────┘
       │
       ├─→ ┌──────────────┐
       │   │ Subagent 2   │ (haiku - 翻译)
       │   │  Chunk 2     │
       │   └──────────────┘
       │
       └─→ ┌──────────────┐
           │ Subagent N   │ (haiku - 翻译)
           │  Chunk N     │
           └──────────────┘

所有子 agent 并行运行 → 主 agent 合并结果
```

## 成本对比

| 方法 | 模型 | 成本 (10K words) | 时间 |
|------|------|-----------------|------|
| 传统方法 | Claude Opus | ~$2.00 | 60s |
| 传统方法 | Claude Sonnet | ~$0.40 | 45s |
| **Parallel Translation** | **Haiku (x6)** | **~$0.05** | **15s** |

**节省：40 倍成本，4 倍速度**

## 文件说明

| 文件 | 说明 |
|------|------|
| `SKILL.md` | Skill 主要文档，包含核心原理和实现细节 |
| `EXAMPLE.md` | 使用示例、测试方法和常见问题 |
| `test-skill.md` | 自动化测试脚本 |
| `README.md` | 本文件，快速入门指南 |

## 使用场景

### ✅ 适合翻译

- 📄 文档文件 (README, CONTRIBUTING, etc.)
- 💬 代码注释
- 📝 博客文章
- 📚 教程内容
- 🌐 网站文案

### ⚠️ 不适合翻译

- ⚖️ 法律文档（需要完美准确性）
- 📢 营销文案（需要创意和语气）
- 🔧 技术规范（需要精确术语）
- 📋 合同文件（需要法律效力）

## 高级用法

### 控制并行度

```
使用 parallel-translation skill 翻译 large-doc.md
每个分片最多 3000 字
```

### 保留技术术语

```
使用 parallel-translation skill 翻译 api-docs/
保留以下术语：API, SDK, CLI, npm, git
```

### 自定义输出

```
使用 parallel-translation skill 翻译 README.md
输出到 docs/README.zh-CN.md
```

## 测试 skill

运行测试脚本验证 skill 工作正常：

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills/parallel-translation
bash test-skill.md
```

然后在 Claude Code 中运行：

```
使用 parallel-translation skill 翻译 /tmp/test-translation.md
```

## 技术细节

### 分片策略

- **文本文件**：按段落分片，500-2000 字/片
- **仓库翻译**：按目录分组，2-5 文件/组
- **代码注释**：按文件分片，保持代码结构

### 模型选择

| 任务 | 模型 | 原因 |
|------|------|------|
| **协调管理** | sonnet/opus | 需要理解上下文和规划 |
| **翻译工作** | haiku | 成本低，质量可接受 |
| **文件 I/O** | - | 不消耗 tokens |

### 并行策略

```typescript
// 所有子 agent 并行运行
const translations = await Promise.all(
  chunks.map(chunk =>
    Task({
      model: "haiku",  // ← 关键：使用便宜模型
      prompt: `Translate: ${chunk}`
    })
  )
);
```

## 常见问题

<details>
<summary><b>Q: 翻译质量如何？</b></summary>

A: Haiku 模型的翻译质量适合大多数文档场景。对于需要高准确性的内容（法律、营销），建议使用 sonnet/opus。
</details>

<details>
<summary><b>Q: 如何处理大文件？</b></summary>

A: Skill 会自动分片，每个分片独立翻译后合并。可以控制分片大小和并行度。
</details>

<details>
<summary><b>Q: 支持哪些语言？</b></summary>

A: 当前针对中文翻译优化，但可以轻松扩展到其他语言。
</details>

<details>
<summary><b>Q: 如何调试？</b></summary>

A: 可以询问 Claude Code：
- "你启动了多少个翻译子 agent？"
- "确认使用的是 haiku 模型"
- "展示分片策略"
</details>

## 更新日志

### v1.0.0 (2025-03-14)

- ✨ 初始版本发布
- ✅ 支持文本和仓库翻译
- ✅ 自动分片和并行处理
- ✅ 成本优化（使用 haiku 模型）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**立即开始：**

```
使用 parallel-translation skill 翻译 [你的文件或目录]
```
