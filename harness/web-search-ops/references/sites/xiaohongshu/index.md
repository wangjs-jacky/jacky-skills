---
id: web-search-ops.site.xiaohongshu
site: xiaohongshu
title: 小红书
summary: 笔记搜索/筛选、作者、正文、评论、收藏线索
ego_site: xiaohongshu
---

# 小红书

## 按目标选择

| 用户目标 | 先选的 Ego operation |
|---|---|
| 关键词找笔记 | search-public-notes |
| 图文/视频、排序、发布时间 | filter-and-sort-notes |
| 正文、配图与讨论 | read-note-details、read-note-discussion、read-note-comments |
| 追作者及其同主题内容 | inspect-author-profile |
| 从用户自己的收藏找作者 | find-creator-in-favorites |
| 设计用途或教程核对 | compare-design-intent、study-illustrated-tutorial |

已知内容归档沿 collect-article-note / collect-video-note 的范围执行。当前目录没有已验证的小红书热榜入口，不把平台未盘点能力说成已经接通。签名参数仅在当前页面中使用，结果保留去签名链接。

## 浏览器目录来源

按当前安装目录定位 ego-ops，再读取 references/sites/xiaohongshu/index.md；选中后才展开相应 operation。也可用本 OPS 的 catalog list --site xiaohongshu 查询当前元数据，get 精确复合 ID 读取原正文。源目录增加同类案例后这里无需手抄步骤，历史验证日期继续按 Ego 原记录解释。
