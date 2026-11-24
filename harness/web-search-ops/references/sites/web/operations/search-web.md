---
id: web-search-ops:web/search-web
site: web
operation: search-web
status: verified
last_verified: 2026-11-25
---

# 全网关键词搜索

## 目标与方法

通过现有 helper search 查询；先 account-pool-ops 内存取用 Tavily 默认条目，未配置或失败后单次回退官方 Exa。实际 backend 及 attempts 判断命中的渠道，不能把 Exa 当 Tavily 成功。

```bash
node "$OPS_DIR/scripts/web-search.mjs" search '关键词' --limit 3 --timeout 20
```

## 成功标准与证据范围

有本次真实返回内容及可核对来源，空结果、错误或只发现工具不算成功。试用时注明实际渠道和已有计时证据。

已有 Tavily 基础查询经账号池真实通过；仅支持该次搜索范围，不外推余额和所有端点。 本操作从原 Web Search 方法和历史真实证据迁入，日期保留原记录；本轮目录改造不代表重做业务验证。原始机器回执留在 ignored 本机记录，不复制到共享知识。
