---
site: relationship-advisor
domains:
  - advisor.paws.rodeo
  - 127.0.0.1
aliases:
  - 狗头军师
updated: 2026-10-16
---

# relationship-advisor

## 平台特征

同一产品包含本地邀请码回归实例和使用账号认证的公网实例。2026-10-16 公网页面复用了已有登录态，未重新执行登录流程。侧栏查看历史与 AI 服务，输入区可添加截图并切换咨询方式。API 默认服务说明与个人 Paws 设置入口分开；选择新对话不会迁移旧后端。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-api-production-chat](operations/verify-api-production-chat.md) | 验证受保护的真实模型聊天在更新版本后可用 | medium | 2026-10-16 | [操作](operations/verify-api-production-chat.md) |

## 站点级陷阱

合成上游也使用真实页面与SDK，必须以回答和实例说明中的合成标注区分，不把界面能聊天等同于真实模型可用。
