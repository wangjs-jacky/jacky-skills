---
id: web-search-ops:github/query-source
site: github
operation: query-source
status: verified
last_verified: 2026-11-24
---

# 查询 GitHub 一手资料

## 目标与方法

原生 gh/官方 REST 优先，按仓库与任务取 README、文件、Issue 或 PR；使用字面参数，不经 shell 拼接。只有明确的网页交互需要才进入 Ego。

```bash
node "$OPS_DIR/scripts/web-search.mjs" gh --timeout 20 -- api repos/owner/repo
```

## 成功标准与证据范围

有本次真实返回内容及可核对来源，空结果、错误或只发现工具不算成功。试用时注明实际渠道和已有计时证据。

已有原生 gh 官方 API 查询真实通过；此范围不包含推送、评论或合并授权。 本操作从原 Web Search 方法和历史真实证据迁入，日期保留原记录；本轮目录改造不代表重做业务验证。原始机器回执留在 ignored 本机记录，不复制到共享知识。
