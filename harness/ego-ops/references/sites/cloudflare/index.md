---
site: cloudflare
domains:
- dash.cloudflare.com
aliases:
- Cloudflare
updated: 2026-10-15
---

# cloudflare

## 平台特征

仅在完成跨多个操作的实时验证后补充稳定的登录、导航或加载事实。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| [publish-http-tunnel-route](operations/publish-http-tunnel-route.md) | 为已授权本地服务建立独立隧道和代理 DNS，并在控制台核验 | high | 2026-10-15 | [操作](operations/publish-http-tunnel-route.md) |
| audit-active-zone-dns-export | 确认已委派域名的 Zone、套餐、DNS 记录和 Universal SSL 状态，并导出 BIND 区文件 | low | 2026-09-07 | [说明](operations/audit-active-zone-dns-export.md) |
| audit-paid-plan-runtime-quota | 只读核对付费套餐与运行时配额 | low | 2026-10-02 | [说明](operations/audit-paid-plan-runtime-quota.md) |
| cancel-workers-renewal | 取消Workers下期续费并保留本期权限 | high | 2026-10-02 | [说明](operations/cancel-workers-renewal.md) |

## 站点级陷阱

当前没有已验证且跨 operation 的站点级陷阱；操作特有失败记录在对应 operation 文档中。
