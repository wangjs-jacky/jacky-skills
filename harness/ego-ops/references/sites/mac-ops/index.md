---
site: mac-ops
domains:
  - 127.0.0.1
  - mac-ops.paws.rodeo
aliases:
  - Mac Ops
updated: 2026-10-18
---

# mac-ops

## 平台特征

管理员访问码登录后进入设备工作空间；浏览器事件连接断开时提供显式“重新连接”入口。真实云端历史、后台快照、详情与分页有运行证据；2026-10-18已验证真实SSE事件自动更新。WSS异常根因仍未知，不把SSE成功写成WSS修复。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [manage-persistent-chatbox-conversations](operations/manage-persistent-chatbox-conversations.md) | 在保留原工作台布局的Chatbox中创建、搜索、切换并运行独立会话 | medium | 2026-10-18 | [操作](operations/manage-persistent-chatbox-conversations.md) |
| [prototype-chat-history-in-existing-layout](operations/prototype-chat-history-in-existing-layout.md) | 复用真实界面，只增加助手内历史，核对原布局及交互恢复 | low | 2026-10-18 | [操作](operations/prototype-chat-history-in-existing-layout.md) |
| [inspect-device-and-task-history](operations/inspect-device-and-task-history.md) | 登录运维工作台，核对设备快照、卷与任务历史并按需读取原始记录 | low | 2026-10-18 | [操作](operations/inspect-device-and-task-history.md) |
| [stop-native-task-and-verify-process](operations/stop-native-task-and-verify-process.md) | 停止原生任务并核对真实进程退出 | medium | 2026-10-18 | [操作](operations/stop-native-task-and-verify-process.md) |

## 站点级陷阱

暂无跨多个operation验证的站点级陷阱；开发热更新断开事件连接的恢复边界见当前operation。
