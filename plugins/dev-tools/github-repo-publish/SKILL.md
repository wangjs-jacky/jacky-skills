---
name: github-repo-publish
description: "GitHub 仓库发布兼容入口：创建仓库、推送改动、合并 PR、创建 Release，以及发布链路配置或排障时使用；先加载 release-ops 的对应平台与 operation，按当前项目流程执行并沉淀经验。"
---

# GitHub 发布入口

发布知识的唯一维护源是 release-ops。本入口保留原调用名称，执行工具仍是当前项目脚本、Git 与 gh，不维护第二套发布规则。

## 先加载共享经验

从宿主技能目录或安装注册表定位并读取 `release-ops/SKILL.md`；本轮已读且仍适用时直接复用。不假定两个 Skill 目录相邻，不猜用户机器路径。

安装 Agent 应同时安装仓库 `harness/release-ops`，并读取其中的安装提示词。Plugin 单独安装不保证该独立 Skill 已安装；缺失时说明依赖并按当前技能管理器补装，随后继续。尚不可读时可做目标和本地状态盘点，不能假装已应用 OPS 规则后直接发布。

## 按目标路由

在 release-ops 根目录按下面路径仅读相关内容：

| 目标 | 平台及 operation |
| --- | --- |
| 首次创建并发布仓库 | github / publish-repository |
| 推送本次改动、创建 PR | github / push-changes |
| 合并已授权 PR | github / merge-pr |
| 发布 tag 对应的 Release 与附件 | github / publish-release |
| 配置或发布 npm 包 | npm / configure-publishing、publish-package |
| 发布扩展到市场 | vscode-marketplace 或 open-vsx / publish-extension |

先读 `references/platforms/<platform>/index.md`，再读其 `operations/<operation>.md`。服务部署与 OTA 继续由对应工程 OPS 处理。

## 保留的执行边界

用当前项目配置和证据确定目标、可见性、分支、版本、产物类型和发布方式，不套用某个项目的 DMG、workflow 名或认证习惯。沿用用户已有授权，保护无关工作树改动；不默认全量暂存、清理全局代理或扩大到合并/发布。

完成、失败或中断后按 release-ops 写回平台与 operation；真实环境和证据存其私有项目档案或已有工程 OPS。结果与未完成项分别报告。
