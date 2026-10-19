---
site: cloudflare
domains:
- dash.cloudflare.com
aliases:
- Cloudflare
updated: 2026-10-19
---

# cloudflare

## 平台特征

仅在完成跨多个操作的实时验证后补充稳定的登录、导航或加载事实。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| [restore-session-with-saved-github-profile](operations/restore-session-with-saved-github-profile.md) | 恢复既有Cloudflare登录并核对目标账户与所需权限 | medium | 2026-10-19 | [操作](operations/restore-session-with-saved-github-profile.md) |
| [inspect-worker-abuse-report](operations/inspect-worker-abuse-report.md) | 核对Worker异常与对应滥用报告 | low | 2026-10-19 | [操作](operations/inspect-worker-abuse-report.md) |

## 站点级陷阱

当前没有已验证且跨 operation 的站点级陷阱；操作特有失败记录在对应 operation 文档中。
