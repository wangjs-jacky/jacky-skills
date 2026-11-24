---
site: douyin
domains:
- www.douyin.com
aliases:
- 抖音
updated: 2026-11-25
---

# douyin

## 平台特征

- 当前已登录网页可访问热榜、精选分类、公开作者作品与合集、视频推荐和 AI 抖音；本轮未验证退出登录后的可用性。
- 首页可在加载后进入 `/jingxuan`；热点、标签与合集的点击也可能规范化路径或进入视频详情。按最终页面核对 URL、目标和内容，保留同一任务空间。
- 不同区域可同时保留隐藏面板或同名标题。先限定可见根节点，再检查卡片；搜索卡片、分类卡片、视频推荐和 AI 来源卡片的数据结构不同。

### 按目标选择入口

看当下议题先读热榜；还没有关键词时读搜索发现；按主题浏览用精选分类。已有好视频时沿推荐视频和话题标签扩展，找到优质作者后读公开作品与合集。需要工具比较或学习顺序时可用 AI 抖音问答，再回到来源详情核对。已有明确关键词则沿公开搜索结果操作。各入口的唯一文档链接列在下方操作目录。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| [query-ai-search](operations/query-ai-search.md) | 通过自然语言问答形成工具建议或学习路径，并核对回答中的真实视频来源 | low | 2026-11-25 | [操作](operations/query-ai-search.md) |
| [read-creator-collections](operations/read-creator-collections.md) | 从公开作者主页找到系列内容，并验证合集可以进入对应分集作品 | low | 2026-11-25 | [操作](operations/read-creator-collections.md) |
| [follow-video-hashtags](operations/follow-video-hashtags.md) | 从公开视频文案中的话题词扩展发现同主题教程与作品 | low | 2026-11-25 | [操作](operations/follow-video-hashtags.md) |
| [read-video-recommendations](operations/read-video-recommendations.md) | 从一条已知公开视频的推荐区扩展发现相关内容 | low | 2026-11-25 | [操作](operations/read-video-recommendations.md) |
| [read-category-feed](operations/read-category-feed.md) | 无需输入关键词，通过精选分类发现主题内容并提取当前渲染作品 | low | 2026-11-25 | [操作](operations/read-category-feed.md) |
| [read-search-discovery](operations/read-search-discovery.md) | 在没有明确关键词时读取公开推荐词和热点预览，形成后续检索线索 | low | 2026-11-25 | [操作](operations/read-search-discovery.md) |
| [read-hot-ranking](operations/read-hot-ranking.md) | 发现当前热门议题，核对榜项热度和链接，并追踪关联视频 | low | 2026-11-25 | [操作](operations/read-hot-ranking.md) |
| [search-public-results](operations/search-public-results.md) | 只读搜索并整理可见公开结果及规范作品链接 | low | 2026-11-25 | [操作](operations/search-public-results.md) |
| [extract-image-note](operations/extract-image-note.md) | 核对公开图文并提取图片与正文提示词 | low | 2026-11-15 | [操作](operations/extract-image-note.md) |
| [review-public-video-content](operations/review-public-video-content.md) | 核对公开视频的作者、画面、章节、互动与相关评论，并明确抽样范围 | low | 2026-11-20 | [操作](operations/review-public-video-content.md) |
| [extract-public-video-source](operations/extract-public-video-source.md) | 提取公开抖音视频的实际可播放媒体地址与来源元数据并完成身份复核 | low | 2026-11-20 | [操作](operations/extract-public-video-source.md) |
| extract-public-profile-video-list | 通过抖音号定位公开主页，只读提取当前网页端可见作品的规范链接与标题 | low | 2026-11-25 | [说明](operations/extract-public-profile-video-list.md) |
| read-saved-videos | 在已登录的个人主页中只读列出收藏区域按页面顺序出现的前 N 个视频 | low | 2026-08-23 | [说明](operations/read-saved-videos.md) |

## 站点级陷阱

- 搜索、分类与详情均可能出现“DOM 有内容但目标区域未就绪”的情况。仅检查节点存在、任意面板文本或首个同名标题会选中旧面板或隐藏副本；重新限定当前可见区域后，本轮分类和推荐读取均成功。
- 作品与合集详情的导航可在目标文档已提交后等待 load 超时。按明确的已提交地址在原标签重新观察身份与可见内容；不把生命周期超时等同于作品不存在，也不新建空间绕过。
