---
site: paws
domains:
  - 47.115.228.20
  - trycloudflare.com
aliases:
  - Paws
  - Happy
  - Goal First 交互稿
  - Paws 功能地图
updated: 2026-11-05
---

# paws

## 平台特征

PC Web 支持同一服务器下切换多个账号。侧栏底部头像菜单提供“切换账号”，当前账号有勾选标记。正式 Web 入口使用 HTTPS 8443 端口。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
| --- | --- | --- | --- | --- |
| [review-pc-web-redesign](operations/review-pc-web-redesign.md) | 在功能契约不变时核对新桌面组织、交互状态和静态交付 | low | 2026-11-04 | [操作](operations/review-pc-web-redesign.md) |
| [verify-realtime-send-recovery](operations/verify-realtime-send-recovery.md) | 在实时连接故障恢复后验证新会话真实收发与完成状态 | medium | 2026-11-04 | [操作](operations/verify-realtime-send-recovery.md) |
| [capture-interactive-baseline](operations/capture-interactive-baseline.md) | 通过真实只读操作采样页面状态，并验证由真实 DOM 恢复的脱敏静态交互路径 | low | 2026-11-03 | [操作](operations/capture-interactive-baseline.md) |
| [review-capability-map](operations/review-capability-map.md) | 检索分类、追溯源码并核对公开目录交付 | low | 2026-11-03 | [操作](operations/review-capability-map.md) |
| [verify-production-release](operations/verify-production-release.md) | 确认正式入口渲染且版本对应已发布提交 | low | 2026-11-04 | [操作](operations/verify-production-release.md) |
| [verify-independent-session-cards](operations/verify-independent-session-cards.md) | 在隔离页面用实际解析器和卡片验证双任务状态更新及准确跳转 | low | 2026-10-22 | [操作](operations/verify-independent-session-cards.md) |
| [verify-message-annotations](operations/verify-message-annotations.md) | 在隔离完整页面验证原文选区、评论编辑、刷新恢复和实际批量提交 | low | 2026-10-19 | [操作](operations/verify-message-annotations.md) |
| [verify-machine-storage-access](operations/verify-machine-storage-access.md) | 从真实页面新建目标机器会话并验证迁移目录后台读取、模型回复和完成状态 | low | 2026-11-05 | [操作](operations/verify-machine-storage-access.md) |
| [review-goal-task-prototype](operations/review-goal-task-prototype.md) | 用真实浏览器比较目标任务布局并核对公开静态预览 | low | 2026-10-19 | [操作](operations/review-goal-task-prototype.md) |
| [inspect-goal-task-display](operations/inspect-goal-task-display.md) | 核对目标任务在正文、Skills 与能力中心中的实际呈现 | low | 2026-10-17 | [操作](operations/inspect-goal-task-display.md) |
| [mermaid-component-output](operations/mermaid-component-output.md) | 用 Happy 实际 Mermaid 组件核验给定源码的分组、编号、证据标签和主题显示 | low | 2026-10-17 | [操作](operations/mermaid-component-output.md) |
| session-history | 核对账号并浏览会话历史 | low | 2026-10-03 | [操作](operations/session-history.md) |

## 站点级陷阱

错误账号打开会话链接也可能显示“会话已被删除”。此提示不能单独证明数据已删除；应先核对账号和服务器，再在用户授权下切换到目标账号重新打开链接。
