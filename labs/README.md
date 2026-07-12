# Skill Labs（预览版）

`labs/` 用于验证尚未稳定的新型 Skill、轻量 Workflow 和组织方式。

- 这里的内容可以试用，但不承诺稳定接口或向后兼容。
- 验证成熟后，独立 Skill 迁入 `skills/`，成组能力迁入 `plugins/`。
- 停止维护的实验迁入 `archived/`。

当前实验：

- [`web-flow`](./web-flow/)：面向网站交付的固定阶段 Workflow，依次串联调研、原型、设计、实现、评审与部署。
- [`app-flow`](./app-flow/app-flow/)：面向长任务 App 交付的薄套件——薄总入口 `app-flow` 加三个窄能力 `app-flow-build`、`app-flow-delivery`、`app-flow-reviewer`；不预设固定技术栈、阶段或交付形式，而是根据任务证据动态选能。

`web-flow` 适合沿固定交付阶段推进网站任务；`app-flow` 则为长任务 App Workflow 动态选择能力与交付物。

## App Flow 套件结构

`app-flow` 是薄父入口，只维护目标、授权、能力发现、验证、恢复与停止；三个子 Skill 只处理当前行动，既能独立处理窄任务，也能被父入口按证据调用：

| Skill | 职责 |
|---|---|
| `app-flow` | 薄总入口：动态选能、metadata 发现、验证边界与授权约束 |
| `app-flow-build` | 创建/修改/重构/修复 App 代码，或只读诊断并给候选补丁 |
| `app-flow-delivery` | 打包、签名、OTA、APK/IPA、Release、商店、部署、回滚与验活 |
| `app-flow-reviewer` | 与生产者分离的独立评审、复核、验收与准备度判断 |

能力地图不是阶段流水线：每轮基于当前证据重新选择，默认只用 1 个能力，确有必要时最多 2 个。每个子 Skill 的 `local/` 都被自身 `.gitignore` 排除，不进入 Git。

## 手动预览安装

Labs 仅供手动预览安装，不进入 `./install.sh --all`，也不提供聚合安装命令。要试用 `app-flow`，请从仓库根目录逐个显式链接需要的能力：

```bash
j-skills link ./labs/app-flow/app-flow
j-skills link ./labs/app-flow/app-flow-build
j-skills link ./labs/app-flow/app-flow-delivery
j-skills link ./labs/app-flow/app-flow-reviewer
j-skills install app-flow -g --env claude-code,codex
```

链接后，对每个想启用的 Skill 分别执行 `j-skills install <skill-name> -g --env claude-code,codex`；这是逐 Skill 安装，不是聚合命令。只处理窄任务时可只链接对应子 Skill；长任务通常链接薄父入口与当下需要的能力，后续再按证据扩展。
