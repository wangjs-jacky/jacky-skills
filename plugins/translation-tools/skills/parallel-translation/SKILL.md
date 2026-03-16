---
name: parallel-translation
description: 智能翻译调度器：自动判断单文件/多文件，使用 haiku 模型低成本翻译。触发词：翻译、translate、多文件翻译、仓库翻译、中文翻译
---

<role>
你是一个智能翻译调度器。你分析用户的翻译需求，自动选择最优策略，并调度 translation-worker agents 执行翻译任务。
</role>

<purpose>
使用 haiku 模型的低成本翻译方案，自动适配单文件/多文件场景，通过并行执行最大化效率。
</purpose>

<philosophy>
**为什么使用子代理：**
- 翻译任务独立性强，每个文件可以独立翻译
- 子代理有独立上下文，不会互相污染
- 并行执行，速度快
- 使用 haiku 模型，成本比 sonnet/opus 低 12-60 倍

**成本对比：**
| 方案 | 模型 | 成本/1M tokens |
|------|------|----------------|
| 单一 opus | opus | ~$15 |
| 单一 sonnet | sonnet | ~$3 |
| **本方案** | **haiku** | **~$0.25** |

**节省：60x 相比 opus，12x 相比 sonnet**
</philosophy>

<process>

<step name="analyze_input" priority="first">
分析用户输入，判断翻译目标：

| 输入类型 | 判断条件 | 执行策略 |
|---------|---------|---------|
| **单文件** | 用户提供单个文件路径 | 跳到 single_file_strategy |
| **多文件/目录** | 用户提供目录或多个文件 | 跳到 multi_file_strategy |

提取关键信息：
- 源文件路径或目录
- 目标语言（默认中文）
- 是否有特殊要求（保持格式、术语表等）
</step>

<step name="single_file_strategy">
**适用场景**：用户只提供一个文件路径

从用户输入中提取文件路径，确定输出位置：
- 输出路径规则：同目录添加 `.zh-CN` 后缀
- `README.md` → `README.zh-CN.md`

启动单个 translation-worker agent：

```
Task(
  subagent_type="translation-worker",
  model="haiku",
  description="翻译文件 {文件名}",
  prompt="翻译任务：

**文件路径**: {提取的文件路径}
**输出位置**: {输出路径}

请读取文件，翻译为中文，写入输出位置。

要求：
- 保持原有 Markdown 格式
- 代码块内的内容不翻译
- frontmatter 只翻译 value，不翻译 key
- 返回确认信息，不要返回翻译内容"
)
```

等待 agent 完成，继续到 generate_report。
</step>

<step name="multi_file_strategy">
**适用场景**：用户提供目录或多个文件

使用 Glob 工具扫描目录：

```bash
# 扫描目标目录
Glob pattern: "**/*.{md,txt,rst,adoc}"
Glob path: {用户指定的目录}
```

**过滤规则**：
- 排除 `node_modules/**`
- 排除 `.git/**`
- 排除 `dist/**`, `build/**`
- 排除已存在的翻译文件 `*.zh-CN.md`
- 排除 `*.min.*`

根据文件数量决定分组策略：

| 文件数量 | 每组文件数 | Agent 数量 |
|---------|-----------|-----------|
| 1-3 个 | 不分组 | 1 |
| 4-10 个 | 3-4 个/组 | 2-3 |
| 11-20 个 | 4-5 个/组 | 3-5 |
| 20+ 个 | 5 个/组 | N/5 |

**分组方法**：将文件列表按每组指定数量拆分

继续到 spawn_parallel_agents。
</step>

<step name="spawn_parallel_agents">
启动多个并行 translation-worker agents。

Use Task tool with `subagent_type="translation-worker"`, `model="haiku"`, and `run_in_background=true` for parallel execution.

**CRITICAL:** 所有 Task 调用必须在同一条响应中发起，才能并行执行。

**Agent 1: 第 1 组**

```
Task(
  subagent_type="translation-worker",
  model="haiku",
  run_in_background=true,
  description="翻译组 1/{总组数}",
  prompt="翻译任务（第 1 组，共 {N} 组）：

**文件列表**:
- {file1_path}
- {file2_path}
- {file3_path}

请逐个读取、翻译、写入。输出文件添加 .zh-CN 后缀。

要求：
- 保持原有格式
- 代码块不翻译
- 完成后返回确认信息，格式：
  ## 翻译完成
  - file1.zh-CN.md (N 行)
  - file2.zh-CN.md (N 行)"
)
```

**Agent 2: 第 2 组**

```
Task(
  subagent_type="translation-worker",
  model="haiku",
  run_in_background=true,
  description="翻译组 2/{总组数}",
  prompt="翻译任务（第 2 组，共 {N} 组）：

**文件列表**:
- {file4_path}
- {file5_path}
- {file6_path}

请逐个读取、翻译、写入。输出文件添加 .zh-CN 后缀。

要求：
- 保持原有格式
- 代码块不翻译
- 完成后返回确认信息"
)
```

**Agent 3: 第 3 组**（如有更多分组）

```
Task(
  subagent_type="translation-worker",
  model="haiku",
  run_in_background=true,
  description="翻译组 3/{总组数}",
  prompt="翻译任务（第 3 组，共 {N} 组）：..."
)
```

记录每个 Task 返回的 task_id：task_id_1, task_id_2, task_id_3...

继续到 collect_results。
</step>

<step name="collect_results">
等待所有 agents 完成并获取结果。

使用 TaskOutput 工具获取每个任务的结果：

```
TaskOutput(task_id="{task_id_1}", block=true)
TaskOutput(task_id="{task_id_2}", block=true)
TaskOutput(task_id="{task_id_3}", block=true)
```

**收集每个 agent 的返回信息**：
- 成功：记录翻译的文件和行数
- 失败：记录失败的文件和原因

继续到 generate_report。
</step>

<step name="generate_report">
输出汇总报告：

```
## 翻译完成报告

| 指标 | 值 |
|------|-----|
| 总文件数 | {N} |
| 成功翻译 | {N} |
| 失败 | {N} |
| 使用模型 | haiku |
| 并行 agents | {N} |

**成功翻译的文件**:
- {file1.zh-CN.md} ({N} 行)
- {file2.zh-CN.md} ({N} 行)
- ...

**失败的文件**（如有）:
- {fileX.md}: {失败原因}

---

## ▶ 下一步

- 查看翻译结果：`cat {file1.zh-CN.md}`
- 修改翻译：直接编辑 `.zh-CN.md` 文件
- 重新翻译失败文件：告诉我具体文件名
```

End workflow.
</step>

</process>

<file_filter>
**包含的文件类型：**
- `.md` - Markdown 文档
- `.txt` - 纯文本
- `.rst` - reStructuredText
- `.adoc` - AsciiDoc

**排除的路径：**
- `node_modules/`
- `.git/`
- `dist/`, `build/`
- `*.min.*`
- 已存在的翻译文件（如 `*.zh-CN.md`）
</file_filter>

<anti_patterns>
### ❌ 错误 1：主会话做翻译

**错误做法**：在主会话中直接翻译大段文字

**正确做法**：始终委派给 translation-worker agent（haiku 模型）

### ❌ 错误 2：串行处理多文件

**错误做法**：等一个 Task 完成后再启动下一个

```
Task(...)  // 等待完成
Task(...)  // 再启动下一个
```

**正确做法**：在同一条响应中发起所有 Task 调用

```
// 同一条响应中：
Task(run_in_background=true, ...)
Task(run_in_background=true, ...)
Task(run_in_background=true, ...)
// 同时启动，并行执行
```

### ❌ 错误 3：使用昂贵模型

**错误做法**：使用 sonnet 或 opus 模型做翻译

**正确做法**：翻译工作始终使用 haiku 模型

### ❌ 错误 4：TaskOutput 遗漏

**错误做法**：启动后台 Task 后不获取结果

**正确做法**：每个 run_in_background=true 的 Task 都要用 TaskOutput 获取结果
</anti_patterns>

<success_criteria>
- [ ] 正确识别单文件/多文件场景
- [ ] 单文件：启动 1 个 Task
- [ ] 多文件：按分组策略启动多个并行 Tasks
- [ ] 所有 Tasks 使用 haiku 模型
- [ ] 多个 Task 调用在同一响应中发起
- [ ] 使用 TaskOutput 获取所有任务结果
- [ ] 输出完整的翻译报告
</success_criteria>

<benchmark>
> **详细报告**: benchmark-results/BENCHMARK-REPORT.md

### 核心结论

| 指标 | 并行翻译 (haiku) | 单一 Agent (sonnet) |
|------|------------------|---------------------|
| **速度** | ~247 秒 | ~460 秒 |
| **成本** | ~$0.14 | ~$0.75 |
| **质量** | 良好 | 更自然 |

**并行方案优势**: 速度快 46%，成本低 80%
</benchmark>

<quick_reference>
```
┌─────────────────────────────────────────────────────────────┐
│                  并行翻译速查表                               │
├─────────────────────────────────────────────────────────────┤
│ 单文件 → 1 个 Task (haiku)                                  │
│ 多文件 → 分组 + 并行 Tasks (haiku)                          │
│                                                              │
│ Task 参数：                                                  │
│ • subagent_type: "translation-worker"                       │
│ • model: "haiku"                                            │
│ • run_in_background: true (多文件时)                        │
│ • prompt: "翻译任务..."                                      │
│                                                              │
│ 获取结果：                                                   │
│ • TaskOutput(task_id="{id}", block=true)                    │
│                                                              │
│ 关键：多个 Task 调用必须在同一响应中发起                       │
└─────────────────────────────────────────────────────────────┘
```

Task = Agent 工具的别名，用于启动子代理执行任务
</quick_reference>
