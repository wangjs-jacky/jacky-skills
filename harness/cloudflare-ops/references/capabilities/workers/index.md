---
capability: workers
updated: 2026-10-19
docs_checked: 2026-10-14
---

# Workers

## 能力与边界

Worker 作为请求入口、绑定调用与事件分发层。应用的持久状态若在 DO，读取成本和状态一致性应进入 [DO 档案](../durable-objects/index.md)分析。脚本名、环境、路由、绑定和版本属于本机应用实例。

Workers 套餐与域名 Zone 套餐分别核对；购买某个 Zone 套餐不等于该账户已启用 Workers Paid。

2026-10-18仅补核静态资源配置：可只配置assets.directory，不提供自定义main或ASSETS binding；关键文件由静态资源分发。当前案例的浏览器直连失败与静态文件HTTP读回成功分开记录。未重核下面的数值限额。

## 限制与额度

以下为 2026-10-14 核对的官方文档快照；上线或套餐决策时重新核对。请求、CPU 与下游存储分别计量，不能相互替代。

| 项目 | 范围与条件 | 限制/周期 | 超限与设计影响 |
| --- | --- | --- | --- |
| Free 请求 | Workers Free 账户内的计量请求 | 100,000 次/日；00:00 UTC 重置 | Error 1027；跨脚本共享，不能按每个脚本分配一整份额度 |
| Free CPU | 普通 HTTP Worker 的单次调用 | 10 ms CPU time | CPU 限额不等于请求经过时间；DO、定时事件等另查对应口径 |
| 脚本数 | 每账户 | Free 100；Paid 500 | 规划脚本/环境时计入数量，不能靠无限拆脚本绕过账户额度 |

静态资源、服务绑定和不同调用方式可能有专门计量规则；估算前确认实际调用路径，不把浏览器每个请求都无条件套用上表。付费价格及当前账户可配置上限在需要时从官方来源补充，不猜测。

## 操作目录

| operation | 适用场景 | status | last_verified | reference |
| --- | --- | --- | --- | --- |
| bind-custom-domain | 绑定独立域名并核对既有映射、文件及浏览器下载 | verified | 2026-10-18 | [说明](operations/bind-custom-domain.md) |
| bind-worker-route-over-existing-dns | 保留代理DNS并切换既有入口到Worker | verified | 2026-10-18 | [说明](operations/bind-worker-route-over-existing-dns.md) |
| remove-custom-domain | 撤下指定入口，保留状态与执行连接 | verified | 2026-10-18 | [说明](operations/remove-custom-domain.md) |
| deploy-static-assets | 发布独立静态文件并核对活动版本和关键文件字节 | verified | 2026-10-19 | [说明](operations/deploy-static-assets.md) |
| deploy-and-verify | 发布脚本并保留绑定、状态与事件约束 | partial | — | [说明](operations/deploy-and-verify.md) |

## 已知坑

- 上传代码成功不能证明发布到目标环境；需要核对活动版本及真实业务读回。
- 绑定名相同不代表指向相同 namespace。恢复配置时也不能把旧 bindings 整块覆盖到新部署。
- 前端使用 SSE/WebSocket 仍可能由 Worker、DO 或桥接在后台轮询；检查完整事件链。

## 资料来源

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)：请求、CPU、脚本数量；核对 2026-10-14。
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)：按具体调用路径复核计量；本版未全面核对付费价格。
- Limits 页无法直接读取时，本次读取了[官方文档源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/limits.mdx)；之后仍应以当前官方版本和账户配置为准。

- [Static Assets](https://developers.cloudflare.com/workers/static-assets/) 与 [Configuration and Bindings](https://developers.cloudflare.com/workers/static-assets/binding/)：2026-10-18通过官方文档工具读取，仅覆盖本次静态配置。

- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)：2026-10-18核对自定义域Wrangler配置；实际认证和变更边界见bind-custom-domain。

2026-10-19仅复核当前Static Assets Configuration and Bindings官方文档：独立assets.directory、可省略main和binding的纯静态配置仍适用。新增静态站点的活动版本与十个关键文件读取一致；未重新核对套餐、额度或价格。
