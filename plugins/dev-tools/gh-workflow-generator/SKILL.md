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
创建采集项目
生成 GitHub Workflow
搭建自动化流水线
定时采集数据
gh-workflow-generator
自动化采集项目
创建带 workflow 的仓库
生成数据采集脚手架
</trigger>

<gsd:workflow>
  <gsd:meta>
    <name>gh-workflow-generator</name>
    <trigger>采集项目、Workflow、自动化流水线、定时采集、数据采集脚手架</trigger>
    <requires>Read, Write, Edit, Glob, Bash, AskUserQuestion, Skill</requires>
    <stateFile>.gh-workflow-state.json</stateFile>
    <checkpoints>
      <checkpoint order="1">已检查 github-repo-publish skill</checkpoint>
      <checkpoint order="2">已收集数据源需求</checkpoint>
      <checkpoint order="3">API Key 验证通过</checkpoint>
      <checkpoint order="4">用户确认生成的 AI Prompt</checkpoint>
      <checkpoint order="5">项目文件生成完成</checkpoint>
      <checkpoint order="6">测试用例通过</checkpoint>
      <checkpoint order="7">Git 仓库创建并推送成功</checkpoint>
      <checkpoint order="8">Workflow 运行验证成功</checkpoint>
    </checkpoints>
    <constraints>
      <constraint>脚本使用 Node.js (ESM)，不是 Shell</constraint>
      <constraint>先生成函数 + 测试用例，测试通过后组装</constraint>
      <constraint>API Key 必须通过测试脚本验证后才能继续</constraint>
      <constraint>必须创建真实的 .env 文件，不只是 .env.example</constraint>
      <constraint>Workflow 推送后必须自动验证运行状态</constraint>
      <constraint>自动修复失败最多 3 次后让用户协助</constraint>
      <constraint>所有 GitHub 操作自动化，不需要用户确认</constraint>
      <constraint>每个阶段完成后必须更新状态文件</constraint>
      <constraint>启动时检查状态文件，支持中断恢复</constraint>
    </constraints>
  </gsd:meta>

  <gsd:recovery>
    <detection>
      启动时检查项目目录下是否存在 .gh-workflow-state.json 文件
    </detection>
    <stateFileSchema>
{
  "phase": "collect",           // 当前阶段名称
  "phaseOrder": 1,              // 阶段序号
  "checkpoint": "需求收集完成",  // 当前 checkpoint 描述
  "collected": {                // 已收集的用户输入
    "dataSource": "GitHub API",
    "frequency": "*/30 * * * *",
    "aiProvider": "openai",
    "projectName": "my-collector"
  },
  "nextStep": "验证 API Key",   // 下一步要执行的操作
  "projectDir": "/path/to/project",  // 项目目录
  "updatedAt": "2026-03-25T10:30:00Z"
}
    </stateFileSchema>
    <action>
      1. 读取状态文件内容
      2. 向用户展示当前进度：
         📊 检测到未完成的流程
         当前进度：Phase {phaseOrder}/6 - {checkpoint}
         上次更新：{updatedAt}
      3. 使用 AskUserQuestion 询问用户：
         - 继续执行（从 nextStep 开始）
         - 重新开始（删除状态文件，从头开始）
      4. 如果选择继续，恢复 collected 数据，跳转到对应 phase
      5. 如果选择重新开始，删除状态文件，执行 Phase 0
    </action>
    <stateUpdate>
      每个阶段完成后必须执行：
      1. 更新状态文件的 phase、phaseOrder、checkpoint
      2. 更新 nextStep 为下一阶段的第一步
      3. 更新 updatedAt 为当前时间
      4. 将新收集的数据合并到 collected 对象
    </stateUpdate>
    <cleanup>
      流程全部完成后：
      1. 删除 .gh-workflow-state.json 文件
      2. 或重命名为 .gh-workflow-state.completed.json 归档
    </cleanup>
  </gsd:recovery>

  <gsd:goal>通过引导式问答，帮助用户创建一个完整的 GitHub 自动化采集项目</gsd:goal>

  <gsd:phase name="preflight" order="0">
    <gsd:step>检查状态文件是否存在，存在则执行恢复流程</gsd:step>
    <gsd:step>检查 github-repo-publish skill 是否安装</gsd:step>
    <gsd:step>未安装则自动安装</gsd:step>
    <gsd:step>创建初始状态文件（如果不存在）</gsd:step>
    <gsd:checkpoint>环境预检完成</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "preflight"
      phaseOrder: 0
      checkpoint: "环境预检完成"
      nextStep: "收集用户需求"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>

  <gsd:phase name="collect" order="1">
    <gsd:step>询问用户想监控什么数据源</gsd:step>
    <gsd:step>询问采集频率和执行模式</gsd:step>
    <gsd:step>询问是否需要 AI 处理</gsd:step>
    <gsd:step>收集对应的 API Key（根据 AI 选择）</gsd:step>
    <gsd:step>询问项目名称</gsd:step>
    <gsd:checkpoint>需求收集完成</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "collect"
      phaseOrder: 1
      checkpoint: "需求收集完成"
      collected: { dataSource, frequency, aiProvider, apiKey, projectName }
      nextStep: "创建 .env 文件并验证 API Key"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>

  <gsd:phase name="validate" order="2">
    <gsd:step>创建项目目录</gsd:step>
    <gsd:step>创建 .env 文件（真实文件，非 .env.example）</gsd:step>
    <gsd:step>生成 API 测试脚本（scripts/test-api.mjs）</gsd:step>
    <gsd:step>运行测试脚本验证 API 连通性</gsd:step>
    <gsd:step>如果验证失败，提示用户重新输入 API Key</gsd:step>
    <gsd:checkpoint>API 验证通过</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "validate"
      phaseOrder: 2
      checkpoint: "API 验证通过"
      collected: { projectDir }
      nextStep: "生成 AI Prompt"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>

  <gsd:phase name="prompt" order="3">
    <gsd:step>根据数据源生成 AI Prompt</gsd:step>
    <gsd:step>展示 Prompt 让用户确认或修改</gsd:step>
    <gsd:checkpoint>用户确认 Prompt</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "prompt"
      phaseOrder: 3
      checkpoint: "用户确认 Prompt"
      collected: { aiPrompt }
      nextStep: "生成项目文件结构"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>

  <gsd:phase name="generate" order="4">
    <gsd:step>生成项目文件结构</gsd:step>
    <gsd:step>生成采集函数 + 测试用例</gsd:step>
    <gsd:step>运行测试验证</gsd:step>
    <gsd:checkpoint>项目生成并验证通过</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "generate"
      phaseOrder: 4
      checkpoint: "项目生成并验证通过"
      nextStep: "Git 初始化并创建仓库"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>

  <gsd:phase name="publish" order="5">
    <gsd:step>Git init + commit</gsd:step>
    <gsd:step>调用 github-repo-publish 创建仓库</gsd:step>
    <gsd:step>配置 GitHub Secrets</gsd:step>
    <gsd:checkpoint>仓库创建并推送成功</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "publish"
      phaseOrder: 5
      checkpoint: "仓库创建并推送成功"
      collected: { repoUrl }
      nextStep: "触发并验证 Workflow 运行"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>

  <gsd:phase name="verify" order="6">
    <gsd:step>触发 GitHub Workflow 运行</gsd:step>
    <gsd:step>轮询检查 Workflow 运行状态</gsd:step>
    <gsd:step>如果失败，分析错误日志</gsd:step>
    <gsd:step>尝试自动修复（最多 3 次）</gsd:step>
    <gsd:step>多次失败后让用户协助排查</gsd:step>
    <gsd:checkpoint>Workflow 运行成功</gsd:checkpoint>
    <gsd:stateUpdate>
      phase: "verify"
      phaseOrder: 6
      checkpoint: "Workflow 运行成功"
      status: "completed"
      nextStep: "清理状态文件，流程完成"
      updatedAt: "{{current_time}}"
    </gsd:stateUpdate>
  </gsd:phase>
</gsd:workflow>

## 进度展示模板

在执行过程中，使用以下格式向用户展示当前进度：

```
📊 gh-workflow-generator 进度

✅ Phase 0: 环境预检
✅ Phase 1: 需求收集
🔄 Phase 2: API 验证 ← 当前
⬜ Phase 3: Prompt 生成
⬜ Phase 4: 项目生成
⬜ Phase 5: 仓库创建
⬜ Phase 6: Workflow 验证
```

**恢复时的展示格式**：

```
📊 检测到未完成的流程

当前进度：Phase 2/6 - API 验证
上次更新：2026-03-25 10:30:00
项目目录：/Users/xxx/my-collector

已收集信息：
- 数据源：GitHub API
- 采集频率：*/30 * * * *
- AI 处理：OpenAI

下一步：验证 API Key
```

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
2. 检查 `github-repo-publish` skill 是否安装
3. 未安装则自动安装（不询问用户）
4. 创建初始状态文件（如果不存在）

```bash
# 检查状态文件
if [ -f ".gh-workflow-state.json" ]; then
  echo "检测到未完成的流程"
  cat .gh-workflow-state.json
fi

# 检查 skill 是否存在
j-skills list -g | grep github-repo-publish || j-skills install github-repo-publish -g
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

**Checkpoint**：用户确认 Prompt

---

### Phase 3: 项目生成

**目标**：生成完整的项目文件

**步骤**：
1. 生成项目目录结构
2. 生成采集函数（`scripts/collect.mjs`）
3. 生成测试用例（`scripts/__tests__/collect.test.mjs`）
4. 运行测试验证
5. 测试通过后生成 Workflow

**生成的项目结构**：

```
<project-name>/
├── .github/
│   └── workflows/
│       └── collect.yml      # GitHub Actions Workflow
├── scripts/
│   ├── collect.mjs          # 数据采集（Node.js ESM）
│   ├── process.mjs          # 数据处理（可选 AI）
│   ├── test-api.mjs         # API 连通性测试脚本
│   ├── verify-workflow.mjs  # Workflow 验证脚本
│   └── __tests__/
│       ├── collect.test.mjs # 采集测试
│       └── process.test.mjs # 处理测试
├── output/                  # 采集的数据
├── README.md
├── package.json
├── .env                     # 真实的环境变量（不提交到 Git）
└── .env.example             # 环境变量示例（提交到 Git）
```

**TDD 流程**：
1. 先生成 `collect.mjs` 函数
2. 生成 `collect.test.mjs` 测试用例
3. 运行 `node --test` 验证
4. 测试通过后继续

**Checkpoint**：项目生成并测试通过

---

### Phase 4: 仓库创建

**目标**：创建 Git 仓库并推送到 GitHub

**步骤**：
1. Git init + commit（自动化，不询问）
2. 调用 `github-repo-publish` skill 创建仓库
3. 配置 GitHub Secrets（自动化，不询问）
4. 推送到 GitHub（自动化，不询问）

**自动化操作**（不询问用户）：

```bash
# Git 初始化
git init
git add .
git commit -m "Initial commit: setup automated collection project"

# 调用 github-repo-publish
# （自动创建仓库并推送）

# 配置 Secrets
gh secret set OPENAI_API_KEY --body "${OPENAI_API_KEY}"
gh secret set GITHUB_TOKEN --body "${GITHUB_TOKEN}"
```

**Checkpoint**：仓库创建并推送成功

---

### Phase 5: Workflow 验证

**目标**：自动触发并验证 Workflow 运行状态

**步骤**：
1. 触发 GitHub Workflow
2. 轮询检查运行状态
3. 如果失败，分析错误日志
4. 尝试自动修复（最多 3 次）
5. 多次失败后让用户协助排查

**自动化验证流程**：

```bash
# 1. 触发 Workflow
gh workflow run collect.yml

# 2. 获取最新的 run ID
RUN_ID=$(gh run list --workflow=collect.yml --limit 1 --json | jq -r '.[0].id')

# 3. 轮询检查状态（最多等待 5 分钟）
for i in {1..30}; do
  STATUS=$(gh run view $RUN_ID --json | jq -r '.status')
  if [ "$STATUS" = "completed" ]; then
    echo "✅ Workflow 运行成功"
    exit 0
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Workflow 运行失败"
    # 获取错误日志
    gh run view $RUN_ID --log-failed
    exit 1
  fi
  echo "⏳ 等待中... ($i/30)"
  sleep 10
done
```

**错误分析逻辑**：

```javascript
// 分析 Workflow 失败原因
function analyzeFailure(logs) {
  const errorPatterns = [
    {
      pattern: /API key.*invalid/i,
      fix: '检查 GitHub Secrets 中的 API Key 是否正确配置'
    },
    {
      pattern: /permission denied/i,
      fix: '检查 workflow 的 permissions 配置是否正确'
    },
    {
      pattern: /module not found/i,
      fix: '运行 npm install 检查依赖是否完整'
    },
    {
      pattern: /ENOENT.*no such file/i,
      fix: '检查文件路径是否正确，确保所有脚本文件已提交'
    }
  ];

  for (const { pattern, fix } of errorPatterns) {
    if (pattern.test(logs)) {
      return { detected: true, fix };
    }
  }

  return { detected: false, fix: '未知错误，请查看完整日志' };
}
```

**自动修复流程**：

```
修复尝试次数: 0/3

循环:
  1. 分析错误日志
  2. 如果是已知错误:
     - 自动应用修复
     - 提交修复代码
     - 重新触发 Workflow
     - 等待结果
  3. 如果是未知错误或修复失败:
     - 增加尝试次数
  4. 如果达到 3 次:
     - 输出完整错误日志
     - 提供手动排查建议
     - 让用户协助处理
```

**轮询状态脚本** `scripts/verify-workflow.mjs`:

```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';

const WORKFLOW_NAME = process.env.WORKFLOW_NAME || 'collect.yml';
const MAX_ATTEMPTS = 30; // 5 分钟
const RETRY_DELAY = 10000; // 10 秒

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function triggerWorkflow() {
  try {
    console.log(`🚀 触发 Workflow: ${WORKFLOW_NAME}`);
    execSync(`gh workflow run ${WORKFLOW_NAME}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ 触发失败:', error.message);
    return false;
  }
}

async function getLatestRunId() {
  const result = execSync(
    `gh run list --workflow=${WORKFLOW_NAME} --limit 1 --json`,
    { encoding: 'utf-8' }
  );
  const runs = JSON.parse(result);
  return runs[0]?.id;
}

async function getRunStatus(runId) {
  const result = execSync(
    `gh run view ${runId} --json`,
    { encoding: 'utf-8' }
  );
  const run = JSON.parse(result);
  return run.status;
}

async function getFailedLogs(runId) {
  try {
    const result = execSync(
      `gh run view ${runId} --log-failed`,
      { encoding: 'utf-8' }
    );
    return result;
  } catch (error) {
    return error.stdout || error.message;
  }
}

async function main() {
  // 1. 触发 Workflow
  const triggered = await triggerWorkflow();
  if (!triggered) {
    process.exit(1);
  }

  // 2. 等待 run 创建
  await sleep(5000);

  // 3. 获取 run ID
  const runId = await getLatestRunId();
  if (!runId) {
    console.error('❌ 无法获取 run ID');
    process.exit(1);
  }

  console.log(`📋 Run ID: ${runId}`);

  // 4. 轮询状态
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    const status = await getRunStatus(runId);
    console.log(`⏳ 状态检查 ${i}/${MAX_ATTEMPTS}: ${status}`);

    if (status === 'completed') {
      console.log('✅ Workflow 运行成功！');
      process.exit(0);
    }

    if (status === 'failed') {
      console.log('❌ Workflow 运行失败');
      const logs = await getFailedLogs(runId);
      console.log('\n📜 错误日志:\n');
      console.log(logs);
      process.exit(1);
    }

    await sleep(RETRY_DELAY);
  }

  console.log('⏰ 超时：等待时间过长');
  process.exit(1);
}

main();
```

**Checkpoint**：Workflow 运行成功

---

## 复用的配置（来自 trending-skills）

### Workflow 模板

```yaml
name: Collect Data

on:
  workflow_dispatch:
    inputs: {}
  schedule:
    - cron: '{{CRON_SCHEDULE}}'  # 用户配置

permissions:
  contents: write

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Collect data
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          {{#AI_ENABLED}}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          {{/AI_ENABLED}}
        run: node scripts/collect.mjs

      - name: Process data
        if: success()
        run: node scripts/process.mjs

      - name: Commit and push
        run: |
          git config user.name "bot"
          git config user.email "bot@users.noreply.github.com"
          git add -A
          git diff --staged --quiet && exit 0
          git commit -m "chore: update data $(date +%Y-%m-%d)"
          git push
```

---

## 模板文件

详细的模板文件存放在 `templates/` 目录：

| 文件 | 用途 |
|------|------|
| `workflow.yml.tmpl` | GitHub Actions Workflow 模板 |
| `collect.mjs.tmpl` | 采集脚本模板 |
| `process.mjs.tmpl` | 处理脚本模板 |
| `test.mjs.tmpl` | 测试用例模板 |
| `README.md.tmpl` | README 模板 |
| `package.json.tmpl` | package.json 模板 |

---

## 验证

项目生成完成后，验证以下内容：

- [ ] Workflow 语法正确（`actionlint` 或手动检查）
- [ ] 测试用例通过（`node --test`）
- [ ] README 包含完整使用说明
- [ ] .env 文件已创建并包含有效的 API Key
- [ ] .env.example 包含所有必需变量（不含真实值）
- [ ] API 连通性测试通过（`node scripts/test-api.mjs`）
- [ ] Git 仓库已创建
- [ ] GitHub Secrets 已配置
- [ ] 代码已推送到 GitHub
- [ ] Workflow 自动运行成功（通过 `scripts/verify-workflow.mjs`）

---

## Next Up

- [ ] 自定义采集逻辑: 编辑 `scripts/collect.mjs`
- [ ] 添加更多数据源: 扩展 `collect.mjs`
- [ ] 修改采集频率: 编辑 `.github/workflows/collect.yml` 中的 cron 表达式

## 故障排查

如果 Workflow 运行失败，检查以下内容：

### 常见错误

| 错误类型 | 可能原因 | 解决方案 |
|----------|----------|----------|
| `API key invalid` | API Key 配置错误 | 重新运行 `node scripts/test-api.mjs` 验证 Key |
| `permission denied` | GitHub Token 权限不足 | 检查 workflow 的 `permissions` 配置 |
| `module not found` | 依赖未安装 | 在 workflow 中添加 `npm ci` 步骤 |
| `ENOENT no such file` | 文件未提交到 Git | 确保 `.gitignore` 没有排除必要文件 |

### 手动触发 Workflow

```bash
# 手动触发
gh workflow run collect.yml

# 查看运行日志
gh run watch

# 查看失败的日志
gh run view <run-id> --log-failed
```

---

## 示例：使用本 Skill 创建 GitHub Trending 采集器

```
用户: /gh-workflow-generator

Skill: 你想监控什么数据源？
用户: GitHub Trending 仓库

Skill: 采集频率？
用户: 每 30 分钟

Skill: 是否需要 AI 处理？
用户: 是，使用 OpenAI

Skill: [展示生成的 Prompt]
用户: 确认

Skill: [生成项目文件...]
Skill: [运行测试...]
Skill: [创建仓库并推送...]

Skill: 完成！ 仓库地址: https://github.com/user/github-trending-collector
```
