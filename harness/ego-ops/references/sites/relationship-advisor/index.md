---
site: relationship-advisor
domains:
  - 127.0.0.1
aliases:
  - 狗头军师
updated: 2026-10-16
---

# relationship-advisor

## 平台特征

本次验证对象是本地回归实例：邀请码登录后为单个聊天界面，侧栏查看历史与AI服务，输入区可添加截图并切换咨询方式。API 默认服务说明与个人 Paws 设置入口分开；生产页面及认证方式未在本次验证。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [local-api-regression](operations/local-api-regression.md) | 验证本地合成上游下的聊天截图模式切换历史恢复和取消 | low | 2026-10-16 | [操作](operations/local-api-regression.md) |

## 站点级陷阱

合成上游也使用真实页面与SDK，必须以回答和实例说明中的合成标注区分，不把界面能聊天等同于真实模型可用。
