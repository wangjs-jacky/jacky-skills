---
site: cloudflare
domains:
- dash.cloudflare.com
aliases:
- Cloudflare
updated: 2026-10-25
---

# cloudflare

## 平台特征

仅在完成跨多个操作的实时验证后补充稳定的登录、导航或加载事实。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| [verify-private-learning-workflow](operations/verify-private-learning-workflow.md) | 从资料识别和校对进入精选练习与复盘，并验证完整备份 | medium | 2026-10-25 | [操作](operations/verify-private-learning-workflow.md) |
| [verify-private-worker-browser-session](operations/verify-private-worker-browser-session.md) | 验证本人登录、私有原件下载、跨标签注销与重新登录闭环 | low | 2026-10-25 | [操作](operations/verify-private-worker-browser-session.md) |
| [protect-one-worker-with-owner-policy](operations/protect-one-worker-with-owner-policy.md) | 以精确邮箱策略保护单个Worker全部流量并核对应用身份参数 | high | 2026-10-25 | [操作](operations/protect-one-worker-with-owner-policy.md) |
| [activate-zero-trust-free](operations/activate-zero-trust-free.md) | 在用户明确接受免费版超额计费条款后开通并确认订阅生效 | high | 2026-10-25 | [操作](operations/activate-zero-trust-free.md) |
| [create-private-r2-bucket](operations/create-private-r2-bucket.md) | 为已授权应用创建独立R2桶并确认公开访问禁用 | medium | 2026-10-25 | [操作](operations/create-private-r2-bucket.md) |
| [restore-session-with-saved-github-profile](operations/restore-session-with-saved-github-profile.md) | 恢复既有Cloudflare登录并核对目标账户与所需权限 | medium | 2026-10-25 | [操作](operations/restore-session-with-saved-github-profile.md) |
| [publish-http-tunnel-route](operations/publish-http-tunnel-route.md) | 为已授权本地服务建立独立隧道和代理 DNS，并在控制台核验 | high | 2026-10-15 | [操作](operations/publish-http-tunnel-route.md) |
| audit-active-zone-dns-export | 确认已委派域名的 Zone、套餐、DNS 记录和 Universal SSL 状态，并导出 BIND 区文件 | low | 2026-09-07 | [说明](operations/audit-active-zone-dns-export.md) |
| audit-paid-plan-runtime-quota | 只读核对付费套餐与运行时配额 | low | 2026-10-02 | [说明](operations/audit-paid-plan-runtime-quota.md) |
| cancel-workers-renewal | 取消Workers下期续费并保留本期权限 | high | 2026-10-02 | [说明](operations/cancel-workers-renewal.md) |

| [inspect-worker-abuse-report](operations/inspect-worker-abuse-report.md) | 核对Worker异常与对应滥用报告 | low | 2026-10-19 | [操作](operations/inspect-worker-abuse-report.md) |

## 站点级陷阱

当前没有已验证且跨 operation 的站点级陷阱；操作特有失败记录在对应 operation 文档中。
