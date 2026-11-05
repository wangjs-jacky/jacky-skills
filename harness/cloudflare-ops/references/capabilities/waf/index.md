---
capability: waf
updated: 2026-10-24
docs_checked: 2026-10-24
---

# WAF与API请求检查

## 能力与边界

Cloudflare边缘检查可以在请求到达源站前拒绝客户端；403也可能由源站返回。Browser Integrity Check检查常见异常HTTP头及User-Agent；1010表示基于客户端签名拒绝。诊断需结合正文、请求差分和源站证据，不能仅看Server头。

## 限制与额度

本次未作套餐/价格或规则数决策，相关数量上限未核实。BIC官方说明支持用自定义skip规则或配置规则按范围设置；具体账户权限、套餐可用性和规则顺序在实际变更前核对。

## 操作目录

| operation | 适用场景 | status | last_verified | reference |
| --- | --- | --- | --- | --- |
| diagnose-api-user-agent-rejection | 对比源站/公网与客户端UA，定位1010并验证所测API客户端 | verified | 2026-10-24 | [说明](operations/diagnose-api-user-agent-rejection.md) |

## 已知坑

本机、VPS和Worker网络不是同一执行环境。目录200不能代替真实业务成功。实际账户设置未读回时不要把文档推断写成规则事实；不同错误正文和TLS故障分开处理。

## 资料来源

- [Browser Integrity Check](https://developers.cloudflare.com/waf/tools/browser-integrity-check/)：2026-10-24核对请求头检查与选择性设置。
- [1010](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/)：2026-10-24通过官方错误索引核对定义。
- [Configuration Rules settings](https://developers.cloudflare.com/rules/configuration-rules/settings/)：2026-10-24核对bic参数，未实施规则变更。
