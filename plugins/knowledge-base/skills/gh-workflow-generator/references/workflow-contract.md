# 工作流契约、恢复状态与进度展示

> 启动任务、恢复中断流程、核对 checkpoint 或展示进度时必须读取。

## 目录

- [工作流元数据与硬约束](#工作流契约工作流契约恢复状态与进度展示)
- [状态文件与恢复流程](#工作流契约工作流契约恢复状态与进度展示)
- [Phase 0–6 checkpoint](#工作流契约工作流契约恢复状态与进度展示)
- [进度展示模板](#进度展示模板)

<gsd:workflow>
  <gsd:meta>
    <name>gh-workflow-generator</name>
    <trigger>采集项目、Workflow、自动化流水线、定时采集、数据采集脚手架</trigger>
    <requires>Read, Write, Edit, Glob, Bash, AskUserQuestion, Skill</requires>
    <stateFile>.gh-workflow-state.json</stateFile>
    <checkpoints>
      <checkpoint order="1">已检查 release-ops skill</checkpoint>
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
    <gsd:step>检查 release-ops skill 是否安装</gsd:step>
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
    <gsd:step>调用 release-ops 创建仓库</gsd:step>
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
项目目录：/path/to/my-collector

已收集信息：
- 数据源：GitHub API
- 采集频率：*/30 * * * *
- AI 处理：OpenAI

下一步：验证 API Key
```

