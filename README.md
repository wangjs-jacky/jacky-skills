# Jacky's Agent Skills

面向 Claude Code、Codex 等 Agent 的 Skills 仓库，包含 19 个 Plugin、25 个独立 Skill 和 9 个长期经验 Ops Skill。清单按当前有效的 SKILL.md 与 Plugin manifest 整理；实验内容单独维护。

## 安装

从仓库根目录安装全部活跃 Skills，或只选择需要的内容：

```bash
git clone https://github.com/wangjs-jacky/jacky-skills.git
cd jacky-skills
./install.sh --all
./install.sh --skill youtube-study-note
./install.sh --plugin dev-tools
```

脚本扫描 plugins/、skills/ 与 harness/，默认安装到 claude-code,codex；labs/ 不参与批量安装。通过 J_SKILLS_ENVS 可调整目标环境。从当前 checkout 执行不会自动 git pull；已指向其他来源的同名链接会报错，不会覆盖。

安装脚本要求 Node.js 18+，目前锁定 j-skills 0.1.0；与本机可能单独安装的其他版本不同，版本不匹配时会停止。Apple Silicon Mac 要求原生 arm64 Node.js。手动使用其他版本前先检查 j-skills --version 和子命令 --help。

Claude Code Plugin Marketplace 只安装下表 Plugin：

```text
/plugin marketplace add wangjs-jacky/jacky-skills
/plugin install dev-tools@jacky-skills
```

独立 Skill 与 Ops 可手动链接安装：

```bash
j-skills link ./skills/essay-polish
j-skills install essay-polish -g --env claude-code,codex
j-skills link ./harness/release-ops
j-skills install release-ops -g --env claude-code,codex
```

删除源码目录不会自动卸载 Agent 中的安装。通过 `j-skills uninstall <skill-name> -g --yes` 卸载，再核对注册项及安装软链接；不要通过跟随链接删除共享源目录。

## Plugins

版本与内容的事实源是各 Plugin 的 .claude-plugin/plugin.json，根 marketplace.json 保持同步。

| Plugin | 版本 | Skills |
| --- | --- | --- |
| [claude-config](./plugins/claude-config) | 0.3.0 | statusline-setup |
| [dev-tools](./plugins/dev-tools) | 2.8.11 | efficiency-audit, durable, web-search, animate-prompt, remote-dev-sync, ssh-connect |
| [distiller-tools](./plugins/distiller-tools) | 1.2.0 | distiller, math-curve-loading-reference |
| [evaluators](./plugins/evaluators) | 1.1.0 | harness-benchmark, skill-design-benchmark |
| [image-effects](./plugins/image-effects) | 1.0.0 | image-effects |
| [knowledge-base](./plugins/knowledge-base) | 1.3.4 | npm-publish, vsix-publish, vscode-extension-dev, gh-workflow-generator, github-profile-coolify, chrome-ext-ai-script, web-to-tauri-migration-loop, llm-wiki, codex-env-config |
| [language-skills](./plugins/language-skills) | 1.0.1 | spoken-english-coach |
| [learning-tools](./plugins/learning-tools) | 2.4.2 | learn-repo, repo-study, doc-to-tutorial, youtube-study-note |
| [media-toolkit](./plugins/media-toolkit) | 1.1.0 | fix-neat-video |
| [monitoring](./plugins/monitoring) | 2.5.5 | claude-monitor, cc-history |
| [obsidian-tools](./plugins/obsidian-tools) | 2.13.2 | config-obsidian, ob-collect, ob-index, ob-chat, ob-tidy, ob-project-log, ob-benchmark, ob-topic, ob-bridge, ob-compile, ob-router |
| [skill-stats](./plugins/skill-stats) | 0.1.2 | skill-stats |
| [skill-tooling](./plugins/skill-tooling) | 1.1.1 | skill-optimizer, skill-researcher |
| [skills-management](./plugins/skills-management) | 1.0.2 | j-skills, link-all-skills |
| [thinking-tools](./plugins/thinking-tools) | 0.1.0 | sounding-board |
| [ticktick-manager](./plugins/ticktick-manager) | 1.2.2 | tt, tt-defer, tt-worker |
| [translation-tools](./plugins/translation-tools) | 1.0.1 | parallel-translation |
| [troubleshooting](./plugins/troubleshooting) | 1.1.2 | tauri-troubleshooting, cli-tool-troubleshooting |
| [video-processing](./plugins/video-processing) | 3.0.2 | audio-to-subtitle |

## 独立 Skills

以下内容位于 skills/，不随 Plugin Marketplace 安装。

| Skill | Skill | Skill |
| --- | --- | --- |
| [android-live-photo](./skills/android-live-photo) | [answer-my-question](./skills/answer-my-question) | [clear-and-brief-output](./skills/clear-and-brief-output) |
| [codex-harness](./skills/codex-harness) | [codex-quota](./skills/codex-quota) | [crafted-web](./skills/crafted-web) |
| [create-ops](./skills/create-ops) | [essay-polish](./skills/essay-polish) | [existing-ui-design](./skills/existing-ui-design) |
| [grilling](./skills/grilling) | [happy-app-experience](./skills/happy-app-experience) | [happy-visual-workflow](./skills/happy-visual-workflow) |
| [mobile-app-interaction-reviewer](./skills/mobile-app-interaction-reviewer) | [pc-web-interaction-reviewer](./skills/pc-web-interaction-reviewer) | [photo-to-styled-motion](./skills/photo-to-styled-motion) |
| [show-me](./skills/show-me) | [skill-usage-audit](./skills/skill-usage-audit) | [spec-debate](./skills/spec-debate) |
| [static-publish](./skills/static-publish) | [steelman](./skills/steelman) | [story-ui](./skills/story-ui) |
| [teach-me](./skills/teach-me) | [topic-debate](./skills/topic-debate) | [video-to-cards](./skills/video-to-cards) |
| [web-e2e](./skills/web-e2e) |  |  |

[image-effects](./skills/image-effects) 的源码也在 skills/，通过软链接与同名 Plugin 共享，不维护两份副本。

## Harness Ops Skills

harness/ 中的 Skill 按目标组织运行、排障、验证及经验写回。具体 Skill 使用 `<target>-ops` 命名；创建规范见 [harness/CLAUDE.md](./harness/CLAUDE.md)，分类与操作设计使用 [create-ops](./skills/create-ops)。

| Skill | Skill | Skill |
| --- | --- | --- |
| [aliyun-ops](./harness/aliyun-ops) | [cloudflare-ops](./harness/cloudflare-ops) | [codex-ops](./harness/codex-ops) |
| [ego-ops](./harness/ego-ops) | [experiment-selection-ops](./harness/experiment-selection-ops) | [goal-first-ops](./harness/goal-first-ops) |
| [happy-ops](./harness/happy-ops) | [interaction-reproduction-ops](./harness/interaction-reproduction-ops) | [release-ops](./harness/release-ops) |
| [remote-web-ops](./harness/remote-web-ops) |  |  |

可分享协议保存在 SKILL.md 与 references/；机器路径、私有上下文和运行证据保存在被 Git 忽略的本机记录。goal-first-ops 的项目目标按 projects/<project>/features/<feature>/ 集中保存，不进入 Git。安装不会自动授权修改全局 AGENTS 规则。

GitHub 推送与发布直接使用 release-ops；npm-publish、vsix-publish 为相应平台的兼容入口，独立安装时仍需要 release-ops。codex-env-config 依赖 codex-ops，额度查询另需 codex-quota。

## Skill Labs（预览版）

[labs/README.md](./labs/README.md) 是实验 Skills 的统一说明。以下内容按需手动链接，不计入正式安装清单：

- [web-flow](./labs/web-flow)：网站交付流程。
- [app-flow](./labs/app-flow/app-flow)：按任务证据组织 App 开发与交付。
- [self-learning](./labs/self-learning)：自主学习与可验证产物。
- [goal-first](./labs/goal-first)：目标澄清与任务工作区。
- [codex-project-replay](./labs/codex-project-replay)：本地 Codex 项目会话回放。

## 仓库结构

```text
.claude-plugin/marketplace.json   Plugin 市场清单
plugins/<plugin>/               Plugin manifest 与 Skills
skills/<skill>/                 独立或共享 Skills
harness/<target>-ops/            长期经验 Skills
labs/                           手动试用的实验内容
docs/                           主题说明与历史材料
scripts/audit_skills.py          仓库统一审计
tests/                          分发、元数据与行为契约测试
install.sh                      批量或定向安装
```

部分 Plugin 使用 skills/<skill>/ 的嵌套目录，以 manifest 声明为准。遵循通用 SKILL.md 结构不等于跨 Agent 完整兼容；使用前核对目标 Skill 的工具与运行时依赖。

## 维护与校验

新增 Skill 升级 Plugin MINOR；修复已有内容或 manifest 升级 PATCH。同步 Plugin manifest、marketplace 与本文清单；移除 Skill 时也要清理安装、失效测试和调用入口。

```bash
python3 -m pip install -r requirements-dev.txt
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/audit_skills.py --scan-shared-content
bash -n install.sh
claude plugin validate --strict .
```

目前新版 Claude CLI 的严格检查会拒绝现有 claude-config Plugin 名称；这是待处理的命名兼容问题。

## 许可

[MIT](./LICENSE)。experiment-selection-ops 包含采用独立许可的第三方文档与改编内容，详见其 [第三方说明](./harness/experiment-selection-ops/THIRD_PARTY_NOTICES.md)。

## Harness 集成

[Goal First 任务工作台](./packages/dsh-goal-first/README_CN.md)通过 DeepSeek Harness 插件管理器安装，提供目标对齐、原生任务对话、文件阅读和具体交付版本的用户认可。可维护源码、测试与构建入口位于该包目录。

