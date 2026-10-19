---
capability: tunnel
updated: 2026-10-19
docs_checked: 2026-10-14
---

# Cloudflare Tunnel

元数据按 UTC 日期记录；官方资料核对与各 operation 的实际执行日期分别维护。

## 能力与边界

2026-10-15 核对官方资料：源站运行 cloudflared，主动建立到 Cloudflare 的出站长连接；published application route 把公网 hostname 映射到本地 HTTP/HTTPS 服务。HTTP 使用者可直接通过网址访问，无需安装 cloudflared 或私网客户端。非 HTTP 协议的客户端要求需另查协议说明。

Tunnel 提供转发，不能替代应用认证。公网可达不等于内容匿名公开；应用应保留自己的登录/API 认证。源站仍依赖机器、应用进程与网络持续可用。

## 限制与额度

- 官方文档确认：发布 Tunnel 应用不要求付费 Access 套餐；Access 身份策略与席位是另外的能力。
- 自定义固定 hostname 需要已接入 Cloudflare 的域名。域名购买、其他产品费用及账户限额本次未复核，不宣称整体零成本或无限使用。
- Quick Tunnel 的临时网址不作为长期服务交付入口。
- 当前官方公共应用文档入口为 `/tunnel/`；旧 Cloudflare One 文档主要解释私网访问，应核对场景。

## 操作目录

| operation | status | last_verified | reference |
| --- | --- | --- | --- |
| replace-local-http-origin | verified | 2026-10-16 | [保留既有隧道更新本地源站](operations/replace-local-http-origin.md) |
| publish-managed-static-snapshot | verified | 2026-10-19 | [发布托管静态快照并核对公开读回](operations/publish-managed-static-snapshot.md) |

## 已知坑

- 在原生客户端使用的 API 前增加交互式网页登录，应先验证客户端兼容性；不可仅凭浏览器可登录就认为 API 可用。这是集成设计检查项。
- 修改已有隧道必须保留其他路由；去除某应用的私网依赖不意味着卸载机器上供其他用途使用的网络工具。
- 连接保活不等于业务轮询；仍需检查应用、启动脚本、健康检查和执行中路径，不能把使用长连接描述为整个服务没有轮询。

## 资料来源

- [Tunnel 工作原理](https://developers.cloudflare.com/tunnel/)
- [发布 HTTP 应用](https://developers.cloudflare.com/tunnel/get-started/)
- [公网路由与 Access 边界](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
