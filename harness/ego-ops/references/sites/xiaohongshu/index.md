---
site: xiaohongshu
domains:
- www.xiaohongshu.com
aliases:
- 无
updated: 2026-11-25
---

# xiaohongshu

## 平台特征

- 笔记详情可覆盖在列表上，背景卡片仍留在 DOM；个人主页页签也会保留横向平移的未选面板。提取内容须限定当前详情或实际激活面板，不能全页混采。
- 笔记作者入口可能以新标签打开主页；必须记录新标签的归属与精确目标，并在页面加载完成、身份核对后再捕获脱敏关键帧。
- 搜索类型和筛选状态可能不反映在 URL 中，以页面真实选中态及结果验证；详情和主页链接中的签名材料只在当前页面内使用，不进入知识或结果。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| [inspect-author-profile](operations/inspect-author-profile.md) | 通过真实笔记作者入口核对简介、作品列表和同主题内容来源 | low | 2026-11-25 | [操作](operations/inspect-author-profile.md) |
| [read-note-comments](operations/read-note-comments.md) | 读取当前笔记的评论及可展开回复，并提炼有来源的疑问与反馈 | low | 2026-11-25 | [操作](operations/read-note-comments.md) |
| [read-note-details](operations/read-note-details.md) | 从当前真实笔记取得标题、作者、正文和按顺序核对的配图 | low | 2026-11-25 | [操作](operations/read-note-details.md) |
| [filter-and-sort-notes](operations/filter-and-sort-notes.md) | 通过网页可见条件缩小笔记类型、排序与发布时间，并核对实际结果 | low | 2026-11-25 | [操作](operations/filter-and-sort-notes.md) |
| [read-note-discussion](operations/read-note-discussion.md) | 从真实笔记正文和当前已加载评论提取有来源的讨论证据 | low | 2026-11-25 | [操作](operations/read-note-discussion.md) |
| [search-public-notes](operations/search-public-notes.md) | 在Ego已有会话中按关键词读取少量真实笔记结果 | low | 2026-11-25 | [操作](operations/search-public-notes.md) |
| [compare-design-intent](operations/compare-design-intent.md) | 从作品原笔记核实产品用途、用户与作者解释，区分视觉推断 | low | 2026-11-15 | [操作](operations/compare-design-intent.md) |
| [study-illustrated-tutorial](operations/study-illustrated-tutorial.md) | 从公开教程的正文与有序画廊提炼有证据的设计方法 | low | 2026-11-15 | [操作](operations/study-illustrated-tutorial.md) |
| [find-creator-in-favorites](operations/find-creator-in-favorites.md) | 依据收藏中的作者与主页简介定位相关资料或记忆中的内容创作者 | low | 2026-11-25 | [操作](operations/find-creator-in-favorites.md) |
| [collect-video-note](operations/collect-video-note.md) | 归档公开视频笔记的标题、作者与可播放媒体 | low | 2026-10-04 | [操作](operations/collect-video-note.md) |
| [collect-article-note](operations/collect-article-note.md) | 归档公开图文笔记的正文与有序画廊 | low | 2026-10-03 | [操作](operations/collect-article-note.md) |
| login-by-phone | 使用用户提供的手机号和一次性验证码登录小红书网页端 | medium | 2026-10-03 | [说明](operations/login-by-phone.md) |

## 站点级陷阱

当前没有已验证且跨 operation 的站点级陷阱；操作特有失败记录在对应 operation 文档中。
