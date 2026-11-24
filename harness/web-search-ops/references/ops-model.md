---
id: web-search-ops.model
title: 站点与信息发现操作的归属
summary: 按站点组织搜索、热点、推荐与内容读取，复用 Ego 的唯一浏览器知识源。
---

# 分类模型

本次用户明确要求：按有限站点罗列已经补充的案例，B站和抖音的热搜/热榜等入口也应在下次搜索时可发现。沿此场景采用 `site → operations`；B站、抖音、小红书是首批例子，关键词搜索、热点发现、作者/系列与讨论读取是常用目标。目录迁移不改变已有 Ego site/operation 身份。

`site` 为稳定站点或信息来源；域名、账号、环境是别名或前置条件，不建组合目录。`web` 是未限定站点的全网入口。执行工具（Tavily、gh、Ego）是路径属性，不另建一套主分类。

- 总入口与各站点选择线索归本 OPS；浏览器控件、选择器、登录、页面观察与验证步骤唯一归 Ego OPS。
- Ego 的既有复合身份保留为 `ego-ops:<site>/<operation>`；本 OPS 新原生操作为 `web-search-ops:<site>/<operation>`。
- 首批站点来自当前已有资料：web、github、producthunt、v2ex、bilibili、douyin、xiaohongshu、xiaoyuzhou、xueqiu、x、wechat-public-articles、awwwards、pexels、unsplash、britannica。
- 用户明确排除淘宝渠道；LinkedIn 也不在当前范围。已排除的站点不从 Ego 总目录重新加入本 OPS；后续用户明确改变范围时再处理。原 Ego 知识保留在其唯一归属，不因搜索目录排除而删除。
- 同站点目录中的搜索、榜单、推荐、作者、系列和讨论分别选路；互动发布、关注、点赞、交易与账号管理不属于本次信息发现范围。
- 按此标准自动补充真实站点、同类操作、别名与选路经验；改变分类轴、拆并既有归属或扩大到写业务时再确认。

原有 API 的验证日期按历史证据迁入，不以目录迁移日期刷新。新候选可登记为 documented，未实际成功不写 verified 或成功日期。Ego 继续沿用只写经验证案例的规则，不能为了列清单伪造站点步骤。
