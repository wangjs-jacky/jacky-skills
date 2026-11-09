---
capability: realtime
---
# 实时连接

HTTP页面、升级握手和应用消息流分别验收。WS101不证明应用已完成协议初始化，SSE建立也不证明事件完整；连接清理由应用的退出/撤权目标触发。

网关要覆盖已升级、未完成握手以及HTTP请求已读完的上游长响应。纯传输保活和业务状态查询是不同机制，涉及Cloudflare时沿其禁止轮询规则核查底层SDK。

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| verify-ws-session-lifecycle | verified | 2026-11-08 | [验证WS身份生命周期](operations/verify-ws-session-lifecycle.md) |

来源：真实WS桥接、退出和受控HTTP长响应测试；SSE应用端完整业务及长期重连另需专项验证。
