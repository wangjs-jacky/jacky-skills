# 分类与操作范围

- 状态：分类已确认。
- 确认依据：用户于 2026-10-15 选择“采用发布平台分类”。
- 主键：`platform`；目录：`references/platforms/`。
- 首批 key：`github`、`npm`、`vscode-marketplace`、`open-vsx`。
- GitHub Releases 属于 github；Actions 为执行机制。账号、项目、分支、版本和 CI/本机方式不另建平台。
- 同一项目可以引用多个平台及 operations；单仓多包以项目发布目标表定位。项目指令、脚本和 workflow 保持原有事实源。

## 首批操作

| 平台 | 常用 operations |
| --- | --- |
| github | publish-repository、push-changes、merge-pr、publish-release |
| npm | configure-publishing、publish-package、diagnose-publish-failure |
| vscode-marketplace | publish-extension |
| open-vsx | publish-extension |

这是根据已展示设计和现有发布 Skills 建立的初始文档范围，不代表用户授权执行这些操作，也不代表已完成真实发布。可信度及验证日期以各 operation 为准。

## 扩展策略

按已确认分类自动修正经验、补充同类操作和别名。改变分类轴、拆并既有归属或扩展到新的业务范围时再邀请用户确认；不为收集经验预建所有平台/API。

新平台必须有本次真实需求，再核实其当前官方资料。跨平台工作保留逐目标证据，各平台只维护自己的事实。

## 唯一归属

平台共识归档案，目标操作归 operation，私有项目事实归本机实例。已有工程 OPS 维护项目发布档案时直接引用，不建竞争副本。`j-skills` 的 CLI 发布方式等项目专属说明仍以其当前工程资料为准，不能推广为所有 npm 包的规则。

运行时不依赖 `create-ops`。它只负责创建和改变分类时的设计流程。
