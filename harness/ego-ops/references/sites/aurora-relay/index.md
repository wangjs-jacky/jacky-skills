---
site: aurora-relay
domains:
  - 127.0.0.1
  - trycloudflare.com
aliases:
  - Aurora 能力体验
updated: 2026-10-28
---

# aurora-relay

## 平台特征

当前采用 Aurora Chat 的聊天、图片、设置和 Markdown 界面，入口有口令登录及当前访问身份的对话历史。手机视图通过菜单打开历史。真实服务模式与公开静态预览分别标识，后者不会生成真实答案。已授权的动态公网入口同样通过口令准入，账号认证只留服务端。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-restored-entry](operations/verify-restored-entry.md) | 确认到期后按授权恢复的真实入口能够登录并完成聊天 | medium | 2026-10-28 | [操作](operations/verify-restored-entry.md) |
| [verify-test-web](operations/verify-test-web.md) | 验证共享前端和长回答搜索图片 | medium | 2026-10-27 | [操作](operations/verify-test-web.md) |

## 站点级陷阱

暂无跨操作且已确认根因的站点缺陷；操作范围和未覆盖条件见对应 operation。
