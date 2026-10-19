---
site: paws
domains:
  - 47.115.228.20
  - trycloudflare.com
aliases:
  - Paws
  - Happy
  - Goal First 交互稿
updated: 2026-10-19
---

# paws

## 平台特征

PC Web 支持同一服务器下切换多个账号。侧栏底部头像菜单提供“切换账号”，当前账号有勾选标记。正式 Web 入口使用 HTTPS 8443 端口。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
| --- | --- | --- | --- | --- |
| [verify-message-annotations](operations/verify-message-annotations.md) | 在隔离完整页面验证原文选区、评论编辑、刷新恢复和实际批量提交 | low | 2026-10-19 | [操作](operations/verify-message-annotations.md) |
| [verify-machine-storage-access](operations/verify-machine-storage-access.md) | 从真实页面新建目标机器会话并验证迁移目录后台读取、模型回复和完成状态 | low | 2026-10-19 | [操作](operations/verify-machine-storage-access.md) |
| [review-goal-task-prototype](operations/review-goal-task-prototype.md) | 用真实浏览器比较目标任务布局并核对公开静态预览 | low | 2026-10-19 | [操作](operations/review-goal-task-prototype.md) |
| [inspect-goal-task-display](operations/inspect-goal-task-display.md) | 核对目标任务在正文、Skills 与能力中心中的实际呈现 | low | 2026-10-17 | [操作](operations/inspect-goal-task-display.md) |
| [mermaid-component-output](operations/mermaid-component-output.md) | 用 Happy 实际 Mermaid 组件核验给定源码的分组、编号、证据标签和主题显示 | low | 2026-10-17 | [操作](operations/mermaid-component-output.md) |

## 站点级陷阱

错误账号打开会话链接也可能显示“会话已被删除”。此提示不能单独证明数据已删除；应先核对账号和服务器，再在用户授权下切换到目标账号重新打开链接。
