---
site: bilibili
domains:
  - www.bilibili.com
  - search.bilibili.com
  - space.bilibili.com
aliases:
  - Bilibili
updated: 2026-11-25
---

# bilibili

## 平台特征

- `www.bilibili.com` 承载视频、综合热门和视频排行榜；`search.bilibili.com` 承载关键词搜索；`space.bilibili.com` 承载 UP主主页、投稿、公开动态和合集。同一产品不按子域名拆站点。
- 本轮在既有登录状态下验证公开页面读取，没有改变登录、关注、收藏或其他互动状态。未验证匿名访问或所有账号、分区和作品都可读取。
- 看单条作品时先读下表的 `read-video-detail`；字幕、章节、指定时间和分P分别进入 `read-native-subtitles`、`read-video-chapters`、`seek-video-time`、`read-video-parts` 与 `switch-video-part`。
- 看讨论时进入 `read-video-comments` 读取同线程正文、作者、时间、点赞、置顶和UP主身份；根评论增量加载用 `load-more-video-comments`，楼中楼分页用 `paginate-comment-replies`，两种层级不能混用。
- 看作者时先读下表的 `read-creator-profile`，再按目标进入投稿、排序、空间内搜索、动态或合集，不能把顶部登录账号入口当成作者入口。
- 看热点时区分下表的 `read-hot-search`、`read-popular-videos` 和 `read-video-ranking`；按期次选内容用 `read-weekly-picks`，公开入站精选用 `read-history-picks`，不是个人浏览历史。
- 全站找作者用 `search-creators`；视频排序用 `sort-search-results`。日期与时长必须经 `inspect-search-filters` 对照实际字段，本轮有选项已触发但严格约束未通过的样本，不能承诺所有组合有效。
- 合集查看更多、完整小合集目录及倒序已由 `read-collection-detail` 验证。仍未实测的项目包括最多收藏排序、空间搜索的动态分类、大型合集翻页、播放全部，以及播放器清晰度、倍速、全屏等控制；没有执行互动写操作。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [read-history-picks](operations/read-history-picks.md) | 从入站必刷栏目读取当前精选视频及来源 | low | 2026-11-25 | [操作](operations/read-history-picks.md) |
| [read-weekly-picks](operations/read-weekly-picks.md) | 按页面实际期次读取每周必看，并切换往期内容 | low | 2026-11-25 | [操作](operations/read-weekly-picks.md) |
| [read-collection-detail](operations/read-collection-detail.md) | 从查看更多进入单个合集详情，核对完整目录并改变显示顺序 | low | 2026-11-25 | [操作](operations/read-collection-detail.md) |
| [load-more-video-comments](operations/load-more-video-comments.md) | 通过页面增量加载取得后续根评论批次并核对变化 | low | 2026-11-25 | [操作](operations/load-more-video-comments.md) |
| [paginate-comment-replies](operations/paginate-comment-replies.md) | 在同一父评论内翻阅后续回复页并保持关联 | low | 2026-11-25 | [操作](operations/paginate-comment-replies.md) |
| [switch-video-part](operations/switch-video-part.md) | 通过实际选集切换到目标P，核对页面参数、选中标题与媒体时长 | low | 2026-11-25 | [操作](operations/switch-video-part.md) |
| [read-video-parts](operations/read-video-parts.md) | 读取同一BV下各P名称、时长、当前选中项与完整性范围 | low | 2026-11-25 | [操作](operations/read-video-parts.md) |
| [read-native-subtitles](operations/read-native-subtitles.md) | 识别原生字幕语言并读取指定时间点当前渲染的字幕 | low | 2026-11-25 | [操作](operations/read-native-subtitles.md) |
| [seek-video-time](operations/seek-video-time.md) | 在明确作品身份下定位章节或指定秒数，并读回真实播放位置 | low | 2026-11-25 | [操作](operations/seek-video-time.md) |
| [read-video-chapters](operations/read-video-chapters.md) | 从播放器原生章节面板读取章节名称与起止时间 | low | 2026-11-25 | [操作](operations/read-video-chapters.md) |
| [search-creators](operations/search-creators.md) | 从用户搜索结果定位目标UP主，并用主页UID与公开资料确认身份 | low | 2026-11-25 | [操作](operations/search-creators.md) |
| [inspect-search-filters](operations/inspect-search-filters.md) | 核对日期和时长控件、实际页面参数及结果字段，明确哪些约束已经成立 | low | 2026-11-25 | [操作](operations/inspect-search-filters.md) |
| [sort-search-results](operations/sort-search-results.md) | 按最多播放或最新发布查看关键词视频，并核对真实结果变化 | low | 2026-11-25 | [操作](operations/sort-search-results.md) |
| [read-video-ranking](operations/read-video-ranking.md) | 读取明确视频名次并通过页面分区导航查看分类榜 | low | 2026-11-25 | [操作](operations/read-video-ranking.md) |
| [read-popular-videos](operations/read-popular-videos.md) | 从综合热门页面读取当前展示的视频标题与来源 | low | 2026-11-25 | [操作](operations/read-popular-videos.md) |
| [read-creator-collections](operations/read-creator-collections.md) | 读取作者公开合集名称及同页展示的作品 | low | 2026-11-25 | [操作](operations/read-creator-collections.md) |
| [read-creator-dynamics](operations/read-creator-dynamics.md) | 在目标作者范围内读取公开动态卡片及发布时间 | low | 2026-11-25 | [操作](operations/read-creator-dynamics.md) |
| [search-creator-content](operations/search-creator-content.md) | 使用作者空间内搜索限定当前UP主检索视频 | low | 2026-11-25 | [操作](operations/search-creator-content.md) |
| [sort-creator-videos](operations/sort-creator-videos.md) | 按最多播放查看作者作品并核对排序后的列表 | low | 2026-11-25 | [操作](operations/sort-creator-videos.md) |
| [read-creator-videos](operations/read-creator-videos.md) | 在同一UP主范围内读取公开视频标题与链接 | low | 2026-11-25 | [操作](operations/read-creator-videos.md) |
| [read-creator-profile](operations/read-creator-profile.md) | 核对公开UP主身份、简介、统计字段及主页导航 | low | 2026-11-25 | [操作](operations/read-creator-profile.md) |
| [read-comment-replies](operations/read-comment-replies.md) | 对明确的一条评论展开回复并读取实际子回复 | low | 2026-11-25 | [操作](operations/read-comment-replies.md) |
| [sort-video-comments](operations/sort-video-comments.md) | 切换最热与最新评论入口，并验证实际列表变化 | low | 2026-11-25 | [操作](operations/sort-video-comments.md) |
| [read-video-comments](operations/read-video-comments.md) | 从视频页面读取少量真实评论，保留线程和显示范围 | low | 2026-11-25 | [操作](operations/read-video-comments.md) |
| [read-video-detail](operations/read-video-detail.md) | 在同一作品身份下读取标题、作者、发布时间、简介、标签与时长 | low | 2026-11-25 | [操作](operations/read-video-detail.md) |
| [read-hot-search](operations/read-hot-search.md) | 从现有 Ego 页面读取 B站热搜词与页面标注的名次 | low | 2026-11-25 | [操作](operations/read-hot-search.md) |
| [search-public-videos](operations/search-public-videos.md) | 在不改用户登录状态的前提下验证视频关键词搜索 | low | 2026-11-25 | [操作](operations/search-public-videos.md) |
| [capture-video-source](operations/capture-video-source.md) | 在已验证的视频页面暂停自动播放并提取身份匹配的源信息 | medium | 2026-10-01 | [操作](operations/capture-video-source.md) |

## 站点级陷阱

- 空间页使用客户端路由，点击回执或 URL 改变不代表目标列表已经加载；应同时等待精确路由和目标内容。合集页本轮短暂显示空态，随后加载出真实合集，不能把首帧空态当作没有内容。
- 视频加载后可能追加统计参数。发现 URL 变化先停止动作并说明，独立核对精确标签、BVID 与功能参数仍匹配后，再记录完整 URL 用于后续校验；不能根据随便一个当前标签盲设预期 URL。
- 搜索结果、空间投稿、综合热门和排行榜的标题结构不同。综合热门封面链接内没有标题，应读同卡片的独立段落；不能把搜索页的链接内 heading 合同推广到所有列表。
- 评论使用多层开放 Shadow DOM，普通 document 查询会漏掉嵌套正文。评论正文可直接挂在 ShadowRoot 下，其 parentElement 为空是正常结构；作者、根评论和子回复关系须按线程保留。
- 原生字幕按钮可能晚于视频元数据出现；本轮字幕正文的 innerText 为空，限定原生面板后 textContent 能读到实际文字。必须排除样式预览并结合真实字幕画面，不能把第三方提示当正文。
- 多P视频的搜索卡片可能显示整条BV的总时长，而 video.duration 是当前P；本轮22个P合计与搜索总时长一致，第一P时长显著不同，不能混用字段。
- 每周必看先显示占位期号，随后写入 num 参数。应在真实期次和卡片就绪后核对完整URL，不把裸入口或第-期当作最终状态。
