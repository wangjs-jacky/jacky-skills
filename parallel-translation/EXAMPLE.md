# Parallel Translation - 使用示例

## 快速开始

### 示例 1：翻译单个文件

**场景：** 你有一个英文 README.md 需要翻译成中文

**直接告诉 Claude Code：**
```
使用 parallel-translation skill 翻译 README.md 到中文
```

**Claude Code 会自动：**
1. 读取 README.md
2. 按段落分片
3. 启动多个 haiku 子 agent 并行翻译
4. 合并结果
5. 写入 README.zh-CN.md

---

### 示例 2：翻译整个仓库的文档

**场景：** 翻译 docs/ 目录下所有 Markdown 文件

**告诉 Claude Code：**
```
使用 parallel-translation skill 翻译 docs/ 目录下所有 md 文件到中文
```

**Claude Code 会自动：**
1. 扫描 docs/ 目录
2. 按目录分组文件
3. 每组启动一个 haiku 子 agent
4. 并行翻译所有文件
5. 写回原位置或创建 .zh-CN.md 副本

---

### 示例 3：翻译代码注释

**场景：** 翻译 src/ 目录下所有 TypeScript 文件的注释

**告诉 Claude Code：**
```
使用 parallel-translation skill 翻译 src/ 目录下所有 .ts 文件的注释到中文
保留代码不变，只翻译注释
```

---

## 验证 Skill 是否工作

### 测试方法

1. **创建测试文件：**
```bash
echo "# Test Document

This is a long paragraph that needs translation. It contains multiple sentences and should be split into appropriate chunks for parallel processing.

## Section 1

Another paragraph here. The skill should handle markdown formatting correctly and preserve the structure.

## Section 2

Final paragraph for testing. This demonstrates how the parallel translation works with multiple sections." > test-doc.md
```

2. **运行翻译：**
```
使用 parallel-translation skill 翻译 test-doc.md
```

3. **检查结果：**
- 查看是否创建了 test-doc.zh-CN.md
- 验证翻译质量
- 确认格式保留正确

---

## 成本对比测试

**测试翻译 10,000 字的文档：**

| 方法 | 模型 | 成本 | 时间 |
|------|------|------|------|
| 传统方法 | Claude Opus | ~$2.00 | ~60s |
| 传统方法 | Claude Sonnet | ~$0.40 | ~45s |
| **Parallel Translation** | **Haiku (x6)** | **~$0.05** | **~15s** |

**节省：40 倍成本，3 倍速度提升**

---

## 常见问题

### Q1: 如何指定输出文件名？

```
使用 parallel-translation skill 翻译 README.md
输出到 README.zh-CN.md
```

### Q2: 如何只翻译特定部分？

```
使用 parallel-translation skill 翻译 README.md
只翻译 "## Installation" 部分
```

### Q3: 如何处理技术术语？

```
使用 parallel-translation skill 翻译 docs/
保留以下术语不翻译：API, SDK, CLI, npm, git
```

### Q4: 如何批量翻译多个文件？

```
使用 parallel-translation skill 翻译所有 .md 文件
按目录分组并行处理
```

---

## 调试技巧

### 查看子 agent 数量

如果翻译大文件，Claude Code 应该启动多个子 agent。你可以问：

```
你启动了多少个翻译子 agent？
```

### 检查使用的模型

确认子 agent 使用的是 haiku 模型：

```
确认翻译子 agent 使用的是 haiku 模型
```

### 查看分片策略

了解如何分片的：

```
展示文本分片的详细策略
```

---

## 高级用法

### 自定义分片大小

```
使用 parallel-translation skill 翻译 large-file.md
每个分片最多 3000 字
```

### 控制并行度

```
使用 parallel-translation skill 翻译 huge-repo/
最多同时运行 10 个翻译子 agent
```

### 添加翻译记忆

```
使用 parallel-translation skill 翻译 docs/
使用以下术语表：
- API → API
- Component → 组件
- Hook → 钩子
```

---

## 完整工作流示例

**场景：翻译整个 React 组件库文档**

```markdown
1. **扫描仓库**
   用户：翻译 src/components/ 目录下所有文档

2. **规划翻译**
   Claude Code：
   - 发现 25 个 .md 文件
   - 按组件分组（5 组，每组 5 个文件）
   - 预计启动 5 个 haiku 子 agent

3. **并行翻译**
   - 子 agent 1: Button, Input, Select, ...
   - 子 agent 2: Modal, Tooltip, ...
   - 子 agent 3: Form, Table, ...
   - ...

4. **合并结果**
   - 所有文件翻译完成
   - 写入 .zh-CN.md 副本
   - 生成翻译报告

5. **成本报告**
   - 总 tokens: ~50,000
   - 成本: ~$0.0125 (haiku)
   - vs Sonnet: ~$0.15 (12x 节省)
```

---

## 下一步

现在你可以：

1. **测试 skill：** 创建一个测试文件并翻译
2. **应用到项目：** 翻译你的文档或注释
3. **自定义配置：** 调整分片大小或并行度
4. **集成到工作流：** 添加到 CI/CD 自动翻译

**开始使用：**
```
使用 parallel-translation skill 翻译 [你的文件或目录]
```
