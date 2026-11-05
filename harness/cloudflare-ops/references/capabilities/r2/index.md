---
capability: r2
updated: 2026-10-24
docs_checked: 2026-10-24
---

# R2

## 能力与边界

保存私有大对象；业务权限、修订、对象引用和可见性由应用管理。对象写入与数据库事务不是原子操作。生命周期按对象前缀处理，不替代资料关联删除。

## 限制与额度

2026-10-24核对Standard storage定价，账户每月免费10GB-month、1M Class A、10M Class B。超过免费量分别US$0.015/GB-month、US$4.50/M Class A、US$0.36/M Class B，出口流量免费；按官方计费单位向上取整。该免费量不适用于Infrequent Access，也不表示应用独享。启用及付款配置需另核账户。

生命周期通常在到期后24小时内删除，也可能更久；删除后停止对象存储计费。默认未完成multipart在发起七天后过期。生命周期配置按桶管理，可按prefix限定；不保证精确到期物理擦除。

## 操作目录

| operation | 适用场景 | status | last_verified | reference |
| --- | --- | --- | --- | --- |
| retain-private-artifacts | 私有原件、派生产物与临时对象生命周期 | partial | — | [说明](operations/retain-private-artifacts.md) |

## 已知坑

- 源文件很小，页图、base64缓冲、裁图和修订仍可能大幅增加存储/内存。
- 临时规则误覆盖正式前缀可能删除被引用内容；不能把整个桶统一设短期过期。
- 生命周期不是权限撤销；要求立即不可见时先写业务tombstone并拒绝读取。
- 免费出站不等于免费请求/存储；不能只数下载流量估算成本。

## 资料来源

- [定价](https://developers.cloudflare.com/r2/pricing/)
- [生命周期](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [官方生命周期源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/r2/buckets/object-lifecycles.mdx)
- [Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)
