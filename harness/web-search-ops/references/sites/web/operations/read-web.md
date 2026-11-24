---
id: web-search-ops:web/read-web
site: web
operation: read-web
status: verified
last_verified: 2026-11-24
---

# 读取普通公开网页

## 目标与方法

对适合的公开普通网页用 Jina Reader，失败后官方 Exa 读取。抖音、小红书、B站与短链必须进入 Ego；不要向第三方读取服务传私有链接。拒绝空正文、验证页和登录页。

```bash
node "$OPS_DIR/scripts/web-search.mjs" read 'https://example.com/' --timeout 20
```

## 成功标准与证据范围

有本次真实返回内容及可核对来源，空结果、错误或只发现工具不算成功。试用时注明实际渠道和已有计时证据。

现有 helper 已实际读回 Example Domain；全文完整性须按当次页面判断。 本操作从原 Web Search 方法和历史真实证据迁入，日期保留原记录；本轮目录改造不代表重做业务验证。原始机器回执留在 ignored 本机记录，不复制到共享知识。
