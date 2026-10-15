# Cloudflare 能力索引

根据当前问题选择能力。这里的 key 对应 Cloudflare 产品/能力，不随应用、环境、脚本或账户变化。

| capability | 别名 | 进入条件 | 档案 |
| --- | --- | --- | --- |
| workers | Worker、脚本、边缘入口 | 发布脚本、核对绑定/版本、请求与 CPU 限额 | [Workers](workers/index.md) |
| durable-objects | DO、Durable Object、SQLite、状态对象 | 状态协调、任务通知、休眠连接、读取放大与免费额度 | [Durable Objects](durable-objects/index.md) |

首次遇到其他能力时，先完成当前问题的官方核实或实际操作，再按[知识格式](../knowledge-schema.md)新增能力档案；只有真实使用场景才新增 operation。不要提前铺满 Cloudflare 产品目录。
