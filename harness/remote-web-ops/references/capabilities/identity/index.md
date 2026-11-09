---
capability: identity
---
# 身份接入

外部入口身份与应用原生身份可能不同；SSO、反向代理和原生服务须对齐Host、Origin、Cookie audience及回调。通道只提供转发，不能代替应用授权。

Host-only Cookie不跨任意新域名共享；备用入口必须检查完整交接。静态代码可在浏览器保留，用户权限仍由服务端API/连接控制。

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| verify-session-boundaries | verified | 2026-11-08 | [验证身份与退出边界](operations/verify-session-boundaries.md) |

来源：应用自有身份网关的真实HTTP/WS协议与客户端验证。公开访问、第三方身份关联和成员隔离是不同目标，不由本操作自动证明。
