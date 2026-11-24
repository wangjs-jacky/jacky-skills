---
id: web-search-ops:producthunt/read-feed
site: producthunt
operation: read-feed
status: verified
last_verified: 2026-11-24
---

# 读取官方产品 Feed

## 目标与方法

直接读取 Product Hunt 官方 Atom Feed，保留产品名称、日期与来源；rank 只是 Feed 顺序，不是热度。需要产品详情时读 Ego 当前产品 operation；GraphQL 需要独立配置 Token。

```bash
node "$OPS_DIR/scripts/web-search.mjs" feed producthunt --limit 5 --timeout 20
```

## 成功标准与证据范围

有本次真实返回内容及可核对来源，空结果、错误或只发现工具不算成功。试用时注明实际渠道和已有计时证据。

现有 helper 直接 Feed 已真实返回产品；不等于关键词查询、实时榜单或完整历史。 本操作从原 Web Search 方法和历史真实证据迁入，日期保留原记录；本轮目录改造不代表重做业务验证。原始机器回执留在 ignored 本机记录，不复制到共享知识。
