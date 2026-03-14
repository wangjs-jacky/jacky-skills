# Translation Benchmark Report

> **测试日期**: 2026-03-14
> **测试目标**: 比较 parallel-translation skill（haiku 并行）与单一 sonnet agent 的翻译性能差异

---

## 📊 测试概览

| 指标 | 并行翻译 (haiku) | 单一 Agent (sonnet) | 差异 |
|------|------------------|---------------------|------|
| **总耗时** | ~247 秒 (4.1 分钟) | ~460 秒 (7.7 分钟) | **并行快 46%** |
| **总 Token** | 179,752 | 81,887 | sonnet 省 54% |
| **使用模型** | 2 × haiku | 1 × sonnet | - |
| **Agent 数量** | 2 (并行) | 1 (串行) | - |

---

## 📁 测试材料

翻译了 `superpowers/docs/plans/` 目录下的 4 个 Markdown 文件：

| 文件 | 大小 | 代码块数 |
|------|------|----------|
| 2025-11-22-opencode-support-design.md | 8,831 bytes | 12 |
| 2025-11-22-opencode-support-implementation.md | 27,539 bytes | 82 |
| 2025-11-28-skills-improvements-from-user-feedback.md | 21,033 bytes | 41 |
| 2026-01-17-visual-brainstorming.md | 15,107 bytes | 38 |
| **总计** | **72,510 bytes** | **173** |

---

## ⏱️ 测试 A：并行翻译 (parallel-translation + haiku)

### 执行策略
- 分为 2 组，每组 2 个文件
- 启动 2 个 haiku agents 并行处理

### 分组详情

| Agent | 文件 | 耗时 | Tokens |
|-------|------|------|--------|
| Agent 1 | design + implementation | 247,161ms | 90,735 |
| Agent 2 | feedback + brainstorming | 240,262ms | 89,017 |

### 输出文件大小

| 文件 | 输出大小 |
|------|----------|
| design.zh-CN.md | 8,670 bytes |
| implementation.zh-CN.md | 27,824 bytes |
| feedback.zh-CN.md | 20,072 bytes |
| brainstorming.zh-CN.md | 15,037 bytes |
| **总计** | **71,603 bytes** |

---

## ⏱️ 测试 B：单一 Agent (sonnet 串行)

### 执行策略
- 单个 sonnet agent
- 按顺序逐个处理 4 个文件

### 执行详情

| 指标 | 值 |
|------|-----|
| 总耗时 | 459,752ms |
| 总 Tokens | 81,887 |
| 工具调用次数 | 8 |

### 输出文件大小

| 文件 | 输出大小 |
|------|----------|
| design.zh-CN.md | 8,504 bytes |
| implementation.zh-CN.md | 27,706 bytes |
| feedback.zh-CN.md | 20,293 bytes |
| brainstorming.zh-CN.md | 15,191 bytes |
| **总计** | **71,694 bytes** |

---

## 🔍 质量对比

### 翻译风格差异

| 维度 | haiku (并行) | sonnet (单一) |
|------|--------------|---------------|
| **术语翻译** | "技能" / "代理" | "skill" / "代理" |
| **代码注释** | 保持英文 | 保持英文（部分翻译） |
| **专有名词** | 完整保留 | 完整保留 |
| **句子流畅度** | 较好 | 更自然 |
| **格式保留** | 完整 | 完整 |

### 示例对比

**原文**:
```
OpenCode.ai is a coding agent similar to Claude Code and Codex.
```

**haiku 翻译**:
```
OpenCode.ai 是一个类似于 Claude Code 和 Codex 的编程代理。
```

**sonnet 翻译**:
```
OpenCode.ai 是一个类似于 Claude Code 和 Codex 的编程代理。
```

**原文**:
```
Extract common functionality from `.codex/superpowers-codex` into shared module
```

**haiku 翻译**:
```
从 `.codex/superpowers-codex` 中提取共同功能到共享模块：
```

**sonnet 翻译**:
```
从 `.codex/superpowers-codex` 提取通用功能到共享模块：
```

---

## 💰 成本估算

基于 Claude API 定价（2026年参考）：

| 模型 | 输入价格/1M tokens | 输出价格/1M tokens |
|------|-------------------|-------------------|
| haiku | $0.25 | $1.25 |
| sonnet | $3.00 | $15.00 |

### 本次测试成本

| 方案 | 输入 Token | 输出 Token | 估算成本 |
|------|-----------|-----------|----------|
| 并行 (haiku) | ~90,000 | ~90,000 | **~$0.14** |
| 单一 (sonnet) | ~40,000 | ~42,000 | **~$0.75** |

**结论**: 并行 haiku 方案成本约为单一 sonnet 的 **1/5**

---

## 📈 性能雷达图

```
                    速度
                      |
                      |
    成本效益 ---------+--------- 质量
                      |
                      |
                 Token 效率
```

| 维度 | 并行 haiku | 单一 sonnet | 胜者 |
|------|-----------|-------------|------|
| 速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | haiku |
| 成本效益 | ⭐⭐⭐⭐⭐ | ⭐⭐ | haiku |
| 翻译质量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | sonnet |
| Token 效率 | ⭐⭐ | ⭐⭐⭐⭐⭐ | sonnet |

---

## 🎯 推荐场景

### 选择并行 haiku 方案

- ✅ 需要快速处理大量文件
- ✅ 成本敏感场景
- ✅ 翻译质量要求中等
- ✅ 有多个独立文件可并行

### 选择单一 sonnet 方案

- ✅ 翻译质量要求高
- ✅ 文件数量少（1-2个）
- ✅ 需要更自然的中文表达
- ✅ 文件之间有上下文关联

---

## 📝 结论

| 方案 | 适用场景 | 核心优势 |
|------|----------|----------|
| **parallel-translation (haiku)** | 批量翻译、成本敏感 | **速度快 46%，成本低 80%** |
| **单一 sonnet agent** | 精细翻译、质量优先 | **翻译更自然，token 效率高** |

### 最佳实践建议

1. **大量文件翻译**: 使用 parallel-translation skill（haiku 并行）
2. **少量文件/高质量要求**: 使用 sonnet 单一 agent
3. **混合策略**: 先用 haiku 快速翻译，再用 sonnet 审核关键文件

---

## 📂 输出文件位置

```
benchmark-results/
├── BENCHMARK-REPORT.md                    # 本报告
├── parallel/                              # 并行翻译结果
│   ├── 2025-11-22-opencode-support-design.zh-CN.md
│   ├── 2025-11-22-opencode-support-implementation.zh-CN.md
│   ├── 2025-11-28-skills-improvements-from-user-feedback.zh-CN.md
│   └── 2026-01-17-visual-brainstorming.zh-CN.md
└── single/                                # 单一Agent结果
    ├── 2025-11-22-opencode-support-design.zh-CN.md
    ├── 2025-11-22-opencode-support-implementation.zh-CN.md
    ├── 2025-11-28-skills-improvements-from-user-feedback.zh-CN.md
    └── 2026-01-17-visual-brainstorming.zh-CN.md
```

---

*报告生成时间: 2026-03-14*
