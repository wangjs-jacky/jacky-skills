---
platform: github
updated: 2026-10-15
docs_checked: 2026-10-15
---

# GitHub

## 边界与当前事实

负责仓库创建、源码推送、PR 合并和 Release 分发；项目构建与 CI 实现在项目中维护。仓库可见性、目标 remote、base/head 和合并策略按当前项目及授权确认，不默认公开、不默认 main。

2026-10-15 已核对下列 CLI 官方文档事实：

- `gh repo create` 支持显式 owner/repo、可见性、source/remote 与 push；不能把创建仓库的授权推断为公开项目。
- `gh pr merge --match-head-commit` 可约束预期 PR head；需要 merge queue 的分支可能进入排队或启用自动合并。排队不是已合并，不默认用 `--admin` 绕过规则。
- `gh release create` 在 tag 缺失时会自动创建，默认可能指向默认分支最新提交。已准备 tag 时用 `--verify-tag` 并核对其源码；需要自动创建时显式指定已核对的 target。
- 仓库启用 immutable releases 后，已发布 Release 的关联 tag 与附件受不可变约束，草稿阶段不同。不要预设可以重传覆盖或删除重建。

## 操作目录

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| publish-repository | documented | — | [首次发布仓库](operations/publish-repository.md) |
| push-changes | verified | 2026-10-15 | [推送改动](operations/push-changes.md) |
| merge-pr | verified | 2026-10-15 | [合并 PR](operations/merge-pr.md) |
| publish-release | documented | — | [发布 Release](operations/publish-release.md) |

## 共享陷阱与来源

仓库存在不证明本次提交已推送，tag 存在不证明附件完整。源码推送、合并和制品发布分别留证。代理或认证报错先核对当前配置；不要照历史经验清除用户全局代理。

- [gh repo create](https://cli.github.com/manual/gh_repo_create)
- [gh pr merge](https://cli.github.com/manual/gh_pr_merge)
- [gh release create](https://cli.github.com/manual/gh_release_create)

本档案不固化 API 额度、附件大小或计划差异；本次尚未核对这些数字，涉及具体限制时查对应当前官方规则。
