---
capability: workflows
updated: 2026-10-24
docs_checked: 2026-10-24
---

# Workflows

## 能力与边界

用于有限步骤的耐久执行与检查点。浏览器连接不是任务生命周期；业务状态仍由应用自己的持久数据所有者决定。已完成步骤可恢复，不代表步骤中的外部收费调用与检查点构成原子事务。

## 限制与额度

2026-10-24核对，以下均为官方文档事实，非账户运行证据。

| 项目 | 条件、作用域与周期 | 值与影响 |
| --- | --- | --- |
| 默认step重试 | 未提供StepConfig的单步骤 | 5次重试、10秒初始指数延迟；默认timeout 10分钟；计费/副作用步骤须明确策略 |
| step timeout | 单步骤尝试 | 最大30分钟；超时不能视为上游未执行 |
| 非流式step返回 | 单次step返回持久化 | 最大1MiB；超出步骤失败，大对象另存对象存储 |
| 完成态保留 | 单Workflow完成状态 | Free 3天、Paid 30天；业务数据不可只依赖检查点 |
| CPU/请求 | 与Workers套餐计量关联 | Free CPU 10ms/调用、请求100k/日共享；Paid使用Workers定价；等待API响应不计CPU |
| steps | Free / Paid | Free 3000/日；Paid含500k/月，超额US$0.80/100k；Free超额行为须结合当时平台错误核对，不当作付费溢出 |
| 状态存储 | Free / Paid | Free 1GB-month；Paid含1GB-month，超额US$0.20/GB-month；按日峰值平均计量 |

step与存储计费自2026-08-10起适用，不沿用早期“暂不收费”。额度为相应账户/产品计量口径，不能给每个任务各分一份。未在本轮验证实际账户配额或CPU/存储消耗。

## 操作目录

| operation | 适用场景 | status | last_verified | reference |
| --- | --- | --- | --- | --- |
| run-model-jobs-without-polling | 有收费外部副作用的耐久任务与显式恢复 | partial | — | [说明](operations/run-model-jobs-without-polling.md) |

## 已知坑

- 默认重试可能重复提交模型；关闭重试也不构成外部恰好一次保证。
- 用sleep后status查询实现watch仍是轮询，不因Workflows持久化而例外。
- HTTP成功不是SSE模型终态；检查点存在不代表业务产物已提交。
- 等待不计Workflow CPU不能外推DO长连接不计活跃时长。

## 资料来源

- [规则](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)
- [重试](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)
- [API](https://developers.cloudflare.com/workflows/build/workers-api/)
- [限制](https://developers.cloudflare.com/workflows/reference/limits/)
- [定价](https://developers.cloudflare.com/workflows/reference/pricing/)
- [计费开始公告](https://developers.cloudflare.com/changelog/post/2026-07-07-workflows-billing-updates/)
