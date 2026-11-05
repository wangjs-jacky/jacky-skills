---
name: gh-workflow-generator
description: "快速生成带 GitHub Actions Workflow 的自动化采集项目。当用户想要创建定时采集、数据处理、自动化发布的 GitHub 仓库时触发。"
---

<role>
你是一个 GitHub 自动化项目架构师。帮助用户快速搭建带有完整 CI/CD 流水线的数据采集项目。
</role>

<purpose>
通过引导式问答收集用户需求，生成完整的项目模板，包括 GitHub Actions Workflow、采集脚本、处理逻辑和发布配置。
</purpose>

<trigger>
```text
触发词/示例：
- 创建采集项目
- 生成 GitHub Workflow
- 搭建自动化流水线
- 定时采集数据
- gh-workflow-generator
- 自动化采集项目
- 创建带 workflow 的仓库
- 生成数据采集脚手架
```
</trigger>

## 工作流契约与恢复

任务启动时必须读取 [references/workflow-contract.md](references/workflow-contract.md)，并据此：

1. 检查 `.gh-workflow-state.json`，支持继续或重新开始。
2. 在每个 Phase 完成后更新 checkpoint、`nextStep` 与时间。
3. 按 Phase 0–6 顺序执行预检、收集、验证、Prompt、生成、发布与 Workflow 验证。
4. 使用参考文件中的进度模板展示当前阶段。
5. 全部完成后删除状态文件或归档为 completed 文件。


# gh-workflow-generator

一个泛化的 GitHub 自动化采集 Skill，让任何开发者可以快速创建一个带 GitHub Actions Workflow 的自动化采集项目。

## 参考案例

- [trending-skills](https://github.com/Aradotso/trending-skills) - GitHub Trending 自动生成 Skills

## 执行流程

### Phase 0: 环境预检

**目标**：确保依赖 skill 已安装，检查是否有未完成的流程

**步骤**：
1. **检查状态文件是否存在**
   - 如果存在 `.gh-workflow-state.json`，执行恢复流程
   - 向用户展示当前进度，询问是否继续
2. 检查 `release-ops` skill 是否安装
3. 未安装则自动安装（不询问用户）
4. 创建初始状态文件（如果不存在）

```bash
# 检查状态文件
if [ -f ".gh-workflow-state.json" ]; then
  echo "检测到未完成的流程"
  cat .gh-workflow-state.json
fi

# 检查 skill 是否存在
j-skills list -g | grep release-ops || j-skills install release-ops -g
```

**状态文件初始化**：

```json
{
  "phase": "preflight",
  "phaseOrder": 0,
  "checkpoint": "环境预检完成",
  "collected": {},
  "nextStep": "收集用户需求",
  "projectDir": "{{current_project_dir}}",
  "updatedAt": "{{current_time}}"
}
```

**Checkpoint**：环境预检完成

---

### Phase 1: 需求收集与 API 验证

**目标**：收集用户需求并验证 API Key

**步骤**：
1. 询问用户想监控什么数据源
2. 询问采集频率
3. 询问是否需要 AI 处理
4. **如果需要 AI 处理，立即收集对应的 API Key**
5. **创建 `.env` 文件（不只是 `.env.example`）**
6. **运行测试脚本验证 API 连通性**
7. **验证失败则重新询问 API Key**

**必要交互 1** - 需求收集（使用 AskUserQuestion）：

```javascript
{
  questions: [
    {
      header: "数据源",
      question: "你想监控什么数据源？",
      options: [
        { label: "GitHub API", description: "GitHub 仓库、Issue、PR 等" },
        { label: "REST API", description: "任意 REST API 端点" },
        { label: "RSS/Atom", description: "RSS 或 Atom 订阅源" },
        { label: "网页抓取", description: "需要解析 HTML 的网页" },
        { label: "自定义", description: "其他数据源" }
      ]
    },
    {
      header: "采集频率",
      question: "采集频率是多少？",
      options: [
        { label: "每 15 分钟", description: "cron: '*/15 * * * *'" },
        { label: "每 30 分钟", description: "cron: '*/30 * * * *'" },
        { label: "每小时", description: "cron: '0 * * * *'" },
        { label: "每天", description: "cron: '0 0 * * *'" }
      ]
    },
    {
      header: "AI 处理",
      question: "是否需要 AI 处理采集的数据？",
      options: [
        { label: "是，使用 OpenAI", description: "使用 OpenAI API 处理" },
        { label: "是，使用 Claude", description: "使用 Anthropic Claude API" },
        { label: "否", description: "仅存储原始数据" }
      ]
    }
  ]
}
```

**必要交互 2** - API Key 收集（如果选择了 AI 处理）：

```javascript
// 如果选择 OpenAI
{
  header: "OpenAI API Key",
  question: "请输入你的 OpenAI API Key（将以 sk- 开头）:",
  inputType: "password"  // 密码输入
}

// 如果选择 Claude
{
  header: "Claude API Key",
  question: "请输入你的 Anthropic API Key:",
  inputType: "password"
}
```

**API 验证步骤**：

1. **创建 `.env` 文件**（真实文件，不只是示例）：

```bash
# 在项目目录下创建 .env
cat > .env << EOF
# AI API Key（由 gh-workflow-generator 自动配置）
OPENAI_API_KEY=${用户输入的Key}

# GitHub Token（用于 gh CLI）
GH_TOKEN=${从环境获取或用户输入}
EOF
```

2. **创建测试脚本** `scripts/test-api.mjs`：

```javascript
#!/usr/bin/env node
/**
 * API 连通性测试脚本
 * 验证 API Key 是否有效
 */

import 'dotenv/config';

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hello world' }],
      max_tokens: 10
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API 错误: ${error.error?.message || response.statusText}`);
  }

  console.log('✅ OpenAI API 连接成功');
  return true;
}

async function testClaude() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY 未配置');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hello world' }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API 错误: ${error.error?.message || response.statusText}`);
  }

  console.log('✅ Claude API 连接成功');
  return true;
}

// 执行测试
try {
  if (AI_PROVIDER === 'openai') {
    await testOpenAI();
  } else if (AI_PROVIDER === 'claude') {
    await testClaude();
  } else {
    console.log('⏭️  跳过 AI API 测试（未启用 AI 处理）');
  }
  process.exit(0);
} catch (error) {
  console.error('❌ API 验证失败:', error.message);
  process.exit(1);
}
```

3. **运行测试**：

```bash
# 安装依赖
npm install dotenv

# 运行 API 测试
node scripts/test-api.mjs

# 如果失败，提示用户重新输入 API Key
```

**验证失败处理**：
- 如果测试失败，输出错误信息
- 询问用户是否重新输入 API Key
- 最多重试 3 次
- 3 次失败后让用户手动检查

**Checkpoint**：API 验证通过

---

### Phase 2: Prompt 生成

**目标**：生成 AI Prompt 并让用户确认

**步骤**：
1. 根据数据源类型生成 AI Prompt 模板
2. 展示 Prompt 让用户确认
3. 用户可修改 Prompt
4. **将确认的 Prompt 保存到 `.ai-prompt.txt` 文件**

**Prompt 模板示例**（根据数据源类型）：

```markdown
# GitHub API 数据源

你是一个数据采集助手。请处理以下 GitHub 数据：

1. 提取关键信息（名称、描述、星标数、语言等）
2. 生成结构化的 Markdown 文档
3. 输出格式：YAML frontmatter + Markdown 正文

数据源：{DATA_SOURCE}
```

**必要交互**：
- 展示生成的 Prompt
- 用户确认或修改

**Prompt 确认后**：

```bash
# 保存用户确认的 Prompt 到文件（供 process.mjs 读取）
echo "${用户确认的Prompt}" > .ai-prompt.txt
```

**Checkpoint**：用户确认 Prompt

---

### Phase 3: 项目生成

执行生成阶段前，必须读取 [references/project-generation.md](references/project-generation.md)，按其中的项目结构、测试优先顺序、输出格式和 `process.mjs` 模板生成文件。

硬约束：

1. 使用 Node.js ESM。
2. 先生成采集函数与测试，测试通过后再组装。
3. 不在脚本或仓库中提交 API Key。
4. 阶段完成后更新 `.gh-workflow-state.json`。

### Phase 4: 仓库创建

**目标**：创建 Git 仓库并推送到 GitHub

**步骤**：
1. Git init + commit（自动化，不询问）
2. 调用 `release-ops` skill 创建仓库
3. 配置 GitHub Secrets（自动化，不询问）
4. 推送到 GitHub（自动化，不询问）

**自动化操作**（不询问用户）：

```bash
# Git 初始化
git init
git add .
git commit -m "Initial commit: setup automated collection project"

# 调用 release-ops
# （自动创建仓库并推送）

# 配置 Secrets
gh secret set OPENAI_API_KEY --body "${OPENAI_API_KEY}"
gh secret set GITHUB_TOKEN --body "${GITHUB_TOKEN}"
```

**Checkpoint**：仓库创建并推送成功

---

### Phase 5: Workflow 验证

推送后必须读取 [references/workflow-validation.md](references/workflow-validation.md)，完成 Workflow 触发、状态轮询、失败日志分析和自动修复。自动修复最多 3 次；仍失败时停止并请用户协助。成功后清理或归档状态文件。

## 可复用配置与示例

按需读取 [references/reusable-config-and-example.md](references/reusable-config-and-example.md)：

- 生成通用 Workflow、README 与模板文件时，读取“复用的配置”和“模板文件”
- 手动验证或排查常见错误时，读取“验证”和“故障排查”
- 需要端到端参考时，读取完整 Trending 采集器示例
