---
name: web-search
description: Web Search 兼容入口。网络搜索、站内热点、推荐与公开内容读取统一转到 web-search-ops 的站点及目标操作目录。
---

# Web Search 兼容入口

本功能已经迁至 `web-search-ops`。先从当前技能目录或安装注册表定位并读取该 OPS；在本仓库源码中可从 [主入口](../../../harness/web-search-ops/SKILL.md) 接续。

按其站点目录选择搜索、热榜、推荐、作者、合集、正文或评论，随后只展开选中的操作。浏览器正文仍由 `ego-ops → ego-browser` 管理；保留 Tavily/Exa、官方 Feed 和 gh 路径。

当前目录的 scripts、references、tests 和 ignored 本机资料均是指向主 OPS 的兼容链接，没有第二份运行逻辑或凭据。旧 CLI 路径仍可执行；新代码和经验维护只写主 OPS，浏览器经验只写 Ego OPS。
