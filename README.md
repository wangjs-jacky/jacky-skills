# Jacky's Agent Skills

[![Stars](https://img.shields.io/github/stars/wangjs-jacky/jacky-skills?style=flat)](https://github.com/wangjs-jacky/jacky-skills/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Claude Code](https://img.shields.io/badge/-Claude%20Code-8A2BE2?logo=claude&logoColor=white)
![Codex](https://img.shields.io/badge/-Codex-111111)

模块化的 Agent Skills 集合。仓库同时包含可由 Claude Code Plugin Marketplace 安装的 Plugin、位于 `skills/` 下的独立 Skill，以及位于 `harness/` 下的长期经验 Ops Skills。

## Plugin 清单

每个 Plugin 的版本与 Skill 列表以对应的 `.claude-plugin/plugin.json` 为准。根目录的 `.claude-plugin/marketplace.json` 收录全部 Plugin。

| Plugin | 版本 | 说明 | Skills |
|--------|------|------|--------|
| [claude-config](./plugins/claude-config) | 0.3.0 | Claude Code 配置 | statusline-setup |
| [dev-tools](./plugins/dev-tools) | 2.8.4 | 发布、任务管理、Durable 长任务、联网、浏览器操控与效率审计 | github-repo-publish, efficiency-audit, todo, durable, web-search, browser-control, animate-prompt, web-connect, remote-dev-sync, ssh-connect |
| [distiller-tools](./plugins/distiller-tools) | 1.1.0 | 资源蒸馏与知识提炼 | distiller |
| [evaluators](./plugins/evaluators) | 1.1.0 | 任务目标与 Skill 设计质量评估 | harness-benchmark, skill-design-benchmark |
| [knowledge-base](./plugins/knowledge-base) | 1.3.0 | 开发教程、经验与参考方案 | npm-publish, vsix-publish, vscode-extension-dev, gh-workflow-generator, github-profile-coolify, chrome-ext-ai-script, web-to-tauri-migration-loop, llm-wiki, codex-env-config |
| [language-skills](./plugins/language-skills) | 1.0.1 | 语言学习与表达训练 | spoken-english-coach |
| [learning-tools](./plugins/learning-tools) | 2.4.1 | 仓库学习、文档教程与技术调研 | learn-repo, repo-study, doc-to-tutorial, youtube-study-note |
| [media-toolkit](./plugins/media-toolkit) | 1.0.0 | 媒体流下载与视频文件修复 | m3u8-dl, fix-neat-video |
| [monitoring](./plugins/monitoring) | 2.5.5 | Claude Code 运行监控与历史查询 | claude-monitor, cc-history |
| [obsidian-tools](./plugins/obsidian-tools) | 2.13.1 | Obsidian 同步、采集、编译与知识库管理 | config-obsidian, ob-collect, ob-index, ob-chat, ob-tidy, ob-project-log, ob-benchmark, ob-topic, ob-bridge, ob-compile, ob-router |
| [skill-stats](./plugins/skill-stats) | 0.1.2 | Skill 调用统计与使用分析 | skill-stats |
| [skill-tooling](./plugins/skill-tooling) | 1.1.1 | Skill 优化与调研 | skill-optimizer, skill-researcher |
| [skills-management](./plugins/skills-management) | 1.0.2 | Skills 链接、安装与批量管理 | j-skills, link-all-skills |
| [thinking-tools](./plugins/thinking-tools) | 0.1.0 | 结构化对话与思考 | sounding-board |
| [ticktick-manager](./plugins/ticktick-manager) | 1.2.1 | 滴答清单任务与日程管理 | tt, tt-defer, tt-worker |
| [translation-tools](./plugins/translation-tools) | 1.0.1 | 单文件与多文件并行翻译 | parallel-translation |
| [troubleshooting](./plugins/troubleshooting) | 1.1.1 | CLI、浏览器自动化与 Tauri 故障排查 | agent-browser-troubleshooting, tauri-troubleshooting, cli-tool-troubleshooting |
| [video-processing](./plugins/video-processing) | 3.0.2 | 音视频 ASR 转录 | audio-to-subtitle |

## 独立 Skills

下列 Skill 位于 `skills/`，不属于任何 Plugin，因此不会通过 Plugin Marketplace 安装：

| Skill | Skill | Skill |
|-------|-------|-------|
| codex-harness | crafted-web | spec-debate |
| topic-debate | [happy-app-experience](./skills/happy-app-experience) | grilling |
| [skill-usage-audit](./skills/skill-usage-audit) | [web-e2e](./skills/web-e2e) | [pc-web-interaction-reviewer](./skills/pc-web-interaction-reviewer) |
| [clear-and-brief-output](./skills/clear-and-brief-output) | [happy-visual-workflow](./skills/happy-visual-workflow) | |
| [photo-to-styled-motion](./skills/photo-to-styled-motion) | | |

## Harness Ops Skills

`harness/` 保存工程、工具和第三方 Skills 的长期经验层。具体 Skill 统一使用 `<target>-ops` 命名：`harness` 表示稳定的读取、验证和写回框架，`ops`（Operations）表示目标对象的运行、维护、适配和持续改进。

| Skill | 对象 | 主要职责 |
|-------|------|----------|
| [happy-ops](./harness/happy-ops) | Happy/Paws 自托管工程 | 拓扑理解、运行维护、故障路由和复盘经验 |
| [opencli-ops](./harness/opencli-ops) | OpenCLI | 站点配方、adapter 缺口、浏览器兜底和本机实测经验 |
| [hyperframes-ops](./harness/hyperframes-ops) | HyperFrames 官方 Skills | 最佳实践、复杂能力组合、本机水土不服和环境兼容性 |

每个 Ops Skill 的 `SKILL.md` 保存可分享协议，gitignored 的 `experience.local.md` 保存本机路径、代理、版本、拓扑和验证记录。创建新的 harness skill 时，默认放到 `harness/<target>-ops/`；详细规范见 [`harness/CLAUDE.md`](./harness/CLAUDE.md)。

`archived/` 下的内容是历史归档，不参与批量链接和安装。

## Skill Labs（预览版）

`labs/` 用于验证尚未稳定的新型 Skill 和轻量 Workflow，不计入正式独立 Skill。当前实验包括：

- [web-flow](./labs/web-flow)：渐进串联网站调研、原型、设计、实现、评审与部署。
- [app-flow](./labs/app-flow/app-flow)：不固定技术栈、阶段或交付形式的长任务 App Workflow，按任务证据动态组织工作。
- [self-learning](./labs/self-learning)：让 AI 从视频、文章或主题自主学习、扩展调研并生成可验证产物。

## 兼容性边界

- 遵循通用 `SKILL.md` 结构的内容可由 skills.sh、Codex 等兼容 Agent 或技能管理器读取。
- `.claude-plugin/plugin.json`、Plugin hooks，以及 `AskUserQuestion`、`Skill`、`Agent` 等工具语义属于 Claude Code 能力；包含这些依赖的 Skill 不能视为在其他 Agent 中完整兼容。
- 在非 Claude Code 环境使用前，应检查目标 Skill 的工具调用和运行时依赖。`j-skills` 只负责本地链接与分发，不是跨 Agent 兼容层。

## 快速开始

### 一键安装全部活跃 Skills

安装脚本会扫描 `plugins/`、`skills/` 和 `harness/`，排除 `archived/`，逐个链接并安装。默认目标环境为 `claude-code,codex`。

```bash
git clone https://github.com/wangjs-jacky/jacky-skills.git
cd jacky-skills
./install.sh --all
```

通过环境变量覆盖安装目标：

```bash
J_SKILLS_ENVS=claude-code,codex,cursor ./install.sh --all
```

也可以只安装单个 Skill 或一个 Plugin：

```bash
./install.sh --skill youtube-study-note
./install.sh --skill happy-app-experience
./install.sh --plugin dev-tools
```

从仓库 checkout 执行时，脚本直接使用当前目录且不会自动 `git pull`。只有通过 `curl | bash` 或显式设置 `JACKY_SKILLS_REPO_DIR` 时，才会克隆或更新目标目录。

脚本需要 Node.js 18+，并默认锁定 `j-skills 0.1.0`；若未安装会自动安装该版本，版本不匹配时会停止并给出错误。Apple Silicon Mac 会拒绝 Rosetta/x86_64 Node.js；Intel Mac 可正常使用 x64 Node.js。

脚本可重复执行：已经正确链接到当前目录的 Skill 会跳过；同名 Skill 若已链接到其他目录，会明确报错并停止，不会覆盖现有链接或吞掉安装错误。

`j-skills 0.1.0` 在 Linux 等大小写敏感文件系统上会检查小写 `skill.md`。脚本会在链接期间临时建立 `skill.md → SKILL.md`，完成后立即移除，不会污染 Skill 目录。

### 通过 Claude Code Plugin Marketplace 安装

```text
/plugin marketplace add wangjs-jacky/jacky-skills
/plugin install dev-tools@jacky-skills
/plugin install obsidian-tools@jacky-skills
```

Marketplace 只覆盖上面的 Plugin。独立 Skill 请使用 `j-skills` 或一键安装脚本。

### 手动链接单个 Skill

当前 `j-skills 0.1.0` 不支持 `j-skills link --all`。链接时必须传入具体 Skill 目录：

```bash
npm install -g j-skills

# Plugin 内的 Skill
j-skills link ./plugins/dev-tools/todo
j-skills install todo -g --env claude-code,codex

# Durable 长任务
j-skills link ./plugins/dev-tools/durable
j-skills install durable -g --env claude-code,codex

# Harness Ops Skill
j-skills link ./harness/happy-ops
j-skills install happy-ops -g --env claude-code,codex
```

常用管理命令：

```bash
j-skills link --list
j-skills list --all
j-skills uninstall <skill-name> -g
```

## 目录结构

```text
jacky-skills/
├── .claude-plugin/
│   └── marketplace.json       # 覆盖全部 Plugin 的市场清单
├── plugins/
│   ├── claude-config/
│   ├── dev-tools/
│   ├── distiller-tools/
│   ├── evaluators/
│   ├── knowledge-base/
│   ├── language-skills/
│   ├── learning-tools/
│   ├── media-toolkit/
│   ├── monitoring/
│   ├── obsidian-tools/
│   ├── skill-stats/
│   ├── skill-tooling/
│   ├── skills-management/
│   ├── thinking-tools/
│   ├── ticktick-manager/
│   ├── translation-tools/
│   ├── troubleshooting/
│   └── video-processing/
├── skills/                    # 不属于 Plugin 的独立 Skills
│   ├── happy-app-experience/
│   ├── happy-visual-workflow/
│   ├── photo-to-styled-motion/
│   └── web-e2e/
├── harness/                   # 工程/工具的长期经验 Ops Skills（统一以 -ops 结尾）
│   ├── CLAUDE.md
│   ├── happy-ops/
│   ├── opencli-ops/
│   └── hyperframes-ops/
├── labs/                      # 实验性 Skill 与轻量 Workflow（预览版）
│   ├── app-flow/
│   │   └── app-flow/
│   ├── self-learning/
│   └── web-flow/
├── archived/                  # 不参与安装的历史归档
├── .github/workflows/validate.yml
├── scripts/audit_skills.py   # 统一审计入口
├── tests/                    # 审计、分发和触发契约测试
├── requirements-dev.txt
├── install.sh
├── CLAUDE.md
└── README.md
```

每个 Plugin 的基本结构：

```text
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json
└── <skill-name>/
    └── SKILL.md
```

部分 Plugin 额外使用 `skills/<skill-name>/SKILL.md` 这一层级；`plugin.json` 必须声明真实存在的 Skill 目录。

## 版本规则

修改 Plugin 时同步更新 `plugin.json`：

| 变更类型 | 版本变化 |
|----------|----------|
| 新增 Skill | MINOR，例如 `1.0.0 → 1.1.0` |
| 修复 manifest、文档或现有 Skill | PATCH，例如 `1.0.0 → 1.0.1` |

版本更新后还需同步根 `.claude-plugin/marketplace.json` 和本 README 的 Plugin 表。

## 校验

```bash
python3 -m pip install -r requirements-dev.txt
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/audit_skills.py --scan-shared-content
bash -n install.sh
claude plugin validate --strict .
```

## 相关链接

- [GitHub 仓库](https://github.com/wangjs-jacky/jacky-skills)
- [skills.sh](https://skills.sh)
- [npm Organization](https://www.npmjs.com/org/wangjs-jacky)

## 许可证

[MIT](LICENSE)
