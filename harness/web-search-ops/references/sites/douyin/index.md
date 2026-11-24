---
id: web-search-ops.site.douyin
site: douyin
title: 抖音
summary: 热榜、搜索发现、精选、AI 搜索、作者/话题
ego_site: douyin
---

# 抖音

## 按目标选择

| 用户目标 | 先选的 Ego operation |
|---|---|
| 当前热门议题 | read-hot-ranking |
| 没有关键词，找可继续挖的方向 | read-search-discovery、read-category-feed |
| 明确关键词 | search-public-results |
| 工具建议或学习路径 | query-ai-search，随后核对视频来源 |
| 从好视频继续找相近内容 | read-video-recommendations、follow-video-hashtags |
| 公开作者作品与系列 | extract-public-profile-video-list、read-creator-collections |
| 正文、图文和评论 | review-public-video-content、extract-image-note |
| 用户明确要求自己的收藏 | read-saved-videos |

媒体提取按已授权任务进入对应 source operation，不因目录中存在工具就自动下载或转录。热榜、分类、视频推荐和 AI 来源的页面结构不同。

## 浏览器目录来源

按当前安装目录定位 ego-ops，再读取 references/sites/douyin/index.md；选中后才展开相应 operation。也可用本 OPS 的 catalog list --site douyin 查询当前元数据，get 精确复合 ID 读取原正文。源目录增加同类案例后这里无需手抄步骤，历史验证日期继续按 Ego 原记录解释。
