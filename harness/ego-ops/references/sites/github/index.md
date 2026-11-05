---
site: github
domains:
  - github.com
aliases:
  - GitHub
updated: 2026-10-19
---

# github

## 平台特征

PR页面的Conversation展示正文，顶部同时提供Commits、Checks和Files changed导航；标题附近展示Open状态、base／head分支和提交数量。GitHub可以在正文中直接展示固定源码提交对应的raw图片。

Actions的具体run页面提供Summary、整体Status和逐job状态；部署job可在摘要中展示已发布的Commit／Origin。工作流整体Success与实际发布job是否执行需要分开核对。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-release-summary](operations/verify-release-summary.md) | 只读核对已完成部署的摘要commit、origin与实际执行步骤 | low | 2026-10-19 | [操作](operations/verify-release-summary.md) |
| [verify-pr-description](operations/verify-pr-description.md) | 只读确认PR正文、稳定证据链接与验证边界正常展示 | low | 2026-10-19 | [操作](operations/verify-pr-description.md) |

## 站点级陷阱

本次未确认可复用的站点级失败模式。正文或图片加载成功不代表CI完成、合并或产品已上线。
