---
id: web-search-ops.site.producthunt
site: producthunt
title: Product Hunt
summary: 官方 Feed 产品发现与 Ego 产品详情
ego_site: producthunt
---

# Product Hunt

## 按目标选择

新品列表先官方 Feed；某产品详细说明、开发者介绍和讨论用 Ego 的 read-product-detail。当前没有完整关键词 GraphQL 集成；官方 API 需要 Token。不能把 Feed 顺序叫热度排名。

## 浏览器目录来源

按当前安装目录定位 ego-ops，再读取 references/sites/producthunt/index.md；选中后才展开相应 operation。也可用本 OPS 的 catalog list --site producthunt 查询当前元数据，get 精确复合 ID 读取原正文。源目录增加同类案例后这里无需手抄步骤，历史验证日期继续按 Ego 原记录解释。

## 操作目录

| operation | intent | risk | last_verified | reference |
|---|---|---|---|---|
| [read-feed](operations/read-feed.md) | 读取官方产品 Feed | low | 2026-11-24 | [操作](operations/read-feed.md) |
