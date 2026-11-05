# Cloudflare 能力索引

根据当前问题选择能力。这里的 key 对应 Cloudflare 产品/能力，不随应用、环境、脚本或账户变化。

| capability | 别名 | 进入条件 | 档案 |
| --- | --- | --- | --- |
| workers | Worker、脚本、边缘入口 | 发布脚本、核对绑定/版本、请求与 CPU 限额 | [Workers](workers/index.md) |
| durable-objects | DO、Durable Object、SQLite、状态对象 | 状态协调、任务通知、休眠连接、读取放大与免费额度 | [Durable Objects](durable-objects/index.md) |
| tunnel | Cloudflare Tunnel、cloudflared、公网入口 | 为本机 HTTP 服务提供固定或限时 HTTPS 入口，或核对宿主托管的临时静态快照 | [Tunnel](tunnel/index.md) |
| waf | WAF、BIC、1010、API 403 | 区分边缘请求检查与源站鉴权，验证客户端接入 | [WAF](waf/index.md) |
| workflows | Workflow、耐久步骤、检查点 | 有限任务执行、外部副作用防重、取消与显式恢复 | [Workflows](workflows/index.md) |
| r2 | 对象存储、私有文件、生命周期 | 原件/派生产物存储、临时过期与删除边界 | [R2](r2/index.md) |
| access | Cloudflare Access、JWT、私有入口 | Worker静态应用、API及事件连接的鉴权 | [Access](access/index.md) |

首次遇到其他能力时，先完成当前问题的官方核实或实际操作，再按[知识格式](../knowledge-schema.md)新增能力档案；只有真实使用场景才新增 operation。不要提前铺满 Cloudflare 产品目录。
