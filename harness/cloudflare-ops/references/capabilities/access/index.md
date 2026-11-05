---
capability: access
updated: 2026-10-24
docs_checked: 2026-10-24
---

# Cloudflare Access

## 能力与边界

Worker级Access可以保护相关域名和预览；仅配置主机名的应用不能推定其他入口自动受保护。业务仍需做身份授权和资料范围判断。

2026-10-24官方文档明确：ctx.access只属于被Access直接鉴权的Worker调用，service binding/RPC不传播；Static Assets的内部路由Worker不向用户Worker传递ctx.access。不能在此架构中把ctx.access缺失直接解释为Access未保护，也不能因此放行API。采用官方JWT验签路径并实际验证头传递。

## 限制与额度

本轮未核对账户套餐、席位、Access会话时长配置或收费，不给免费/付费结论。JWKS轮换按官方接口取得，缓存按请求失效处理；不得固定一张证书长期使用或新建周期取钥任务。

## 操作目录

| operation | 适用场景 | status | last_verified | reference |
| --- | --- | --- | --- | --- |
| protect-private-worker-assets | Worker静态应用与私有API的认证边界 | partial | — | [说明](operations/protect-private-worker-assets.md) |

## 已知坑

- 本地dev身份模拟通过不证明生产Access生效。
- 仅JWT解码、仅信任邮箱头、只保护一个域、对静态路由ctx.access做错误假设都可能破坏认证。
- 新HTTP请求的Access策略不等于存量WS即时撤销；应用会话到期与撤销必须设计。

## 资料来源

- [Worker Access与ctx.access限制](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
- [JWT校验](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [官方JWT示例源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json.mdx)
