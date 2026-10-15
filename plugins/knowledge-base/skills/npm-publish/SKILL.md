---
name: npm-publish
description: "npm 发布兼容入口：发布包、配置 CI/Trusted Publishing、排查认证或版本冲突时，先读取 release-ops 的 npm 平台与 operation，按项目实际发布方式执行并自动维护经验。"
---

# npm 发布入口

共享知识由 release-ops 维护，本入口保留原名称和手动/自动配置导航。

## 前置依赖

从当前技能目录或注册表定位并读取 `release-ops/SKILL.md`，再读 `references/platforms/npm/index.md`。已读取且适用的内容直接复用，不假定安装位置。

安装 Agent 应同时安装仓库 `harness/release-ops` 并读取它的安装提示词。单独 Plugin 不保证已包含该独立依赖；缺失时说明并通过当前技能管理器补装。尚不可用时继续目标与项目配置盘点，不宣称已读取经验或跳过前置直接发布。

## 场景路由

| 用户目标 | npm 平台目录下的文档 |
| --- | --- |
| 配置 CI、认证或首次发布链路 | `operations/configure-publishing.md` |
| 发布精确包版本 | `operations/publish-package.md` |
| 排查发布失败 | `operations/diagnose-publish-failure.md` |

兼容参考：[手动发布入口](reference/manual-publish.md)、[自动发布配置入口](reference/auto-publish.md)。它们指向同一知识源，不重复维护步骤。

## 执行与写回

先核对具体 registry、包/workspace、版本、渠道和当前 workflow。CI/OIDC 不用本机登录或 Token 存在性作统一前提；现有认证方式按项目事实与当前官方规则处理，不输出凭据。

用户已授权的动作直接完成，复用有效构建与发布证据，不默认同时触发 CI 和本机发布。结果不确定先核对远端版本。完成后按 release-ops 协议写回正确归属，区分发布、配置与诊断的成功范围。
