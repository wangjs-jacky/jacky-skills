---
id: web-search-ops:v2ex/read-public-topics
site: v2ex
operation: read-public-topics
status: verified
last_verified: 2026-11-24
---

# 读取 V2EX 官方公开热帖

## 目标与方法

按官方公开 API 文档单次 GET https://www.v2ex.com/api/topics/hot.json ，用当前可用 HTTP 工具读取并核对真实条目。RSS 及其他端点按需求与当前官方文档选择，不假装已封装任意搜索。

## 成功标准与证据范围

有本次真实返回内容及可核对来源，空结果、错误或只发现工具不算成功。试用时注明实际渠道和已有计时证据。

已通过直接官方 hot API，HTTP 200；不代表全部端点或全文搜索已验收。 本操作从原 Web Search 方法和历史真实证据迁入，日期保留原记录；本轮目录改造不代表重做业务验证。原始机器回执留在 ignored 本机记录，不复制到共享知识。
