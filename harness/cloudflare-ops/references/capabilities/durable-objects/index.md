---
capability: durable-objects
updated: 2026-10-18
docs_checked: 2026-10-14
---

# Durable Objects

## 能力与边界

DO 用于有身份的状态协调、存储与事件连接。设计时明确对象 key、状态归属和 Worker → namespace → class 的映射，不把一个对象误当整个账户或整个应用。

Workers Free 仅支持 SQLite 存储后端；`ctx.storage.sql` 仅适用于 SQLite-backed class。旧 key-value 后端与 SQLite 内的 KV API 不是同一计费口径，迁移或降级前需重新核对官方规则。

WebSocket Hibernation 适用于 DO **接收的服务器端连接**，不适用于 DO 作为客户端建立的外连。休眠后构造函数重新执行，内存不是持久真相。SSE 或普通 WebSocket `accept()` 不自动具备休眠能力。

## 限制与额度

官方文档核对于 2026-10-14。以下 Free 日额度按账户聚合，不是每个脚本、namespace 或对象各有一份；00:00 UTC 重置。任一免费额度耗尽后，该类型的后续操作会报错，消除调用源不会立即补回当天已消耗的额度。

| 项目 | 适用范围 | 数值与周期 | 使用边界 |
| --- | --- | --- | --- |
| SQLite rows read | Workers Free、SQLite 后端、账户合计 | 5,000,000 行/日 | 按实际读取行数，不按 SQL 条数或返回行数 |
| SQLite rows written | 同上 | 100,000 行/日 | 索引维护可能额外增加写入行数 |
| SQL stored data | 同上 | 5 GB 总量 | 容量上限不是每日重置额度；GB 为十进制 |
| 单对象 SQLite 存储 | SQLite-backed DO | 10 GB/对象 | Free 仍受全账户 5 GB 约束，不能当作每对象免费 10 GB |
| DO Requests | Workers Free、账户合计 | 100,000 次/日 | HTTP、RPC、消息与 Alarm 有各自计量细则，不能只看外部 HTTP |
| DO Duration | Workers Free、账户合计 | 13,000 GB-s/日 | 活跃或无法休眠的 wall-clock 时间；不同于 CPU time |

SQLite 内 `get/put/delete/list` 使用隐藏表，也按读取/写入行数计量。对 SQL 的 `rowsRead`、`rowsWritten` 应在 cursor 完整消费后读取；不能拿中途的值当最终计量。平台日限额不应被当成应用目标预算；设计时给账户内其他应用、冷启动、恢复操作留余量，按实际事件量估算。

## 操作目录

| operation | 适用场景 | status | last_verified | reference |
| --- | --- | --- | --- | --- |
| design-stateful-service | 设计状态、通知与断线恢复 | partial | — | [说明](operations/design-stateful-service.md) |
| diagnose-read-quota | 从账户告警定位读取来源 | verified | 2026-10-14 | [说明](operations/diagnose-read-quota.md) |
| reduce-read-amplification | 消除轮询与 schema/历史扫描放大 | partial | — | [说明](operations/reduce-read-amplification.md) |

## 已知坑

- 账户告警没有直接指出应用：需按同一时间窗定位 namespace 和生产者，再查看代码路径。
- 空结果、`LIMIT 1` 或小响应都不代表少读；扫描、排序、schema 查询可能放大成本。
- 热路径重复初始化 schema、每次取任务都遍历历史，成本会随数据量增长。
- 只改空闲领取任务，执行中的 SDK watch/progress 仍可能轮询；未完成路径必须保留待整改状态。
- WebSocket 定时业务消息、pending I/O 或计时器可能阻止休眠。协议 ping/pong 可由运行时处理；应用保活需保证不查询业务或存储。

## 资料来源

- [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)：Free 超限行为、UTC 重置、请求/时长/存储计量；2026-10-14。
- [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/)：SQLite 总容量与单对象上限；2026-10-14。
- [SQLite storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)：cursor 计量与存储后端；2026-10-14。
- [WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)：连接角色、构造恢复与保活；2026-10-14。
- 本次从官方仓库读取页面源码及[定价组件](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/partials/durable-objects/durable-objects-pricing.mdx)，避免只读到页面的引用占位而漏掉额度表。
