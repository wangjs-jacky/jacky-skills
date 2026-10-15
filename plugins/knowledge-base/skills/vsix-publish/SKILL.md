---
name: vsix-publish
description: "VS Code 扩展发布兼容入口：打包与发布 VSIX、配置 Marketplace/Open VSX 自动发布、排查认证及发布失败时，加载 release-ops 对应平台操作并分别维护证据。"
---

# 扩展发布入口

保留原调用名称，平台知识由 release-ops 统一维护；vsce、ovsx 与项目脚本提供执行能力。

## 前置依赖与平台选择

从当前技能目录或注册表定位并读取 `release-ops/SKILL.md`，只加载实际目标：

| 目标 | 平台档案和 operation |
| --- | --- |
| VS Code Marketplace | `references/platforms/vscode-marketplace/index.md` 及 `operations/publish-extension.md` |
| Open VSX | `references/platforms/open-vsx/index.md` 及 `operations/publish-extension.md` |
| GitHub Release 仅分发 VSIX | `references/platforms/github/index.md` 及 `operations/publish-release.md` |

安装 Agent 应同时安装仓库 `harness/release-ops` 并读取其安装提示词。单独 Plugin 不保证包含该独立依赖；缺失时说明并通过当前技能管理器补装。尚不可读时继续目标与项目配置盘点，不跳过前置执行发布。

## 执行与写回

- 明确 publisher/namespace、扩展、版本、目标架构和渠道，复用与源码相符的 VSIX。
- 只打包时执行项目打包目标，不升级为发布；打包、发布、安装验证是不同动作。
- 认证采用项目实际且当前支持的方式，不从 AGENTS/CLAUDE 文档读取或写入 PAT。依赖收集按 bundling 和实际运行依赖决定，不统一添加 `--no-dependencies`。
- 多平台分别检查结果，不能用一端成功替代另一端；仅恢复缺失目标。
- 沿用当前授权及有效检查证据，完成/失败后按 release-ops 写回平台经验与私有实例。

兼容参考：[手动发布入口](reference/manual-publish.md)、[自动发布入口](reference/auto-publish.md)。
