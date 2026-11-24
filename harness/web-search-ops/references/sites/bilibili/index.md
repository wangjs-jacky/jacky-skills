---
id: web-search-ops.site.bilibili
site: bilibili
title: B站
summary: 热搜、热门、榜单、精选、视频/UP主/讨论
ego_site: bilibili
---

# B站

## 按目标选择

| 用户目标 | 先选的 Ego operation |
|---|---|
| 当下大家在搜什么 | read-hot-search |
| 热门作品、分区视频榜 | read-popular-videos、read-video-ranking |
| 一期优质视频或入站精选 | read-weekly-picks、read-history-picks |
| 关键词或找 UP主 | search-public-videos、search-creators |
| 排序与筛选 | sort-search-results、inspect-search-filters |
| 作者投稿、动态、系列与合集 | read-creator-profile、read-creator-videos、sort-creator-videos、search-creator-content、read-creator-dynamics、read-creator-collections、read-collection-detail |
| 视频信息与讨论 | read-video-detail、read-video-comments、sort-video-comments、read-comment-replies、load-more-video-comments、paginate-comment-replies |
| 章节、字幕、选集与定位 | read-video-chapters、read-native-subtitles、read-video-parts、switch-video-part、seek-video-time |

热搜词、热门作品和视频排名是不同结果。入站必刷不是个人浏览历史。日期/时长筛选存在记录过的部分约束未成立样本，先读该 operation 的实际边界；字幕只验证过指定时间点当前渲染文字，不承诺完整字幕下载。

## 浏览器目录来源

按当前安装目录定位 ego-ops，再读取 references/sites/bilibili/index.md；选中后才展开相应 operation。也可用本 OPS 的 catalog list --site bilibili 查询当前元数据，get 精确复合 ID 读取原正文。源目录增加同类案例后这里无需手抄步骤，历史验证日期继续按 Ego 原记录解释。
