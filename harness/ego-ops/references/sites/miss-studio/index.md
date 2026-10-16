---
site: miss-studio
domains:
  - miss.jacky-openbird.workers.dev
aliases:
  - MISS Studio
updated: 2026-10-03
---

# miss-studio

## 平台特征

已登录的 Studio 页面有左侧“添加链接”“学习资料”“任务动态”等导航。前端会异步切换页面；同一资料地址在采集期间显示任务进度，完成后显示学习页。文章学习页提供“原网页”“原文”“观点脉络”三个依据标签，新图文原文以原图与连续正文展示，不嵌入视频播放器；旧纯文字资料需要重新采集才会补齐原图。进度页明确说明“刷新进度”只查询状态，不会推动远端执行。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [reprocess-completed-video](operations/reprocess-completed-video.md) | 对同一条自有已完成资料重新转录并确认新结果持久化 | high | 2026-10-03 | [操作](operations/reprocess-completed-video.md) |
| [verify-delayed-upload-persistence](operations/verify-delayed-upload-persistence.md) | 核验迟到上传恢复及刷新持久化 | low | 2026-10-02 | [操作](operations/verify-delayed-upload-persistence.md) |
| [inspect-incomplete-caption-task](operations/inspect-incomplete-caption-task.md) | 检查尚未归档但已有字幕的资料是否同时呈现真实采集状态、失败原因、重试入口和可阅读字幕。 | low | 2026-10-01 | [操作](operations/inspect-incomplete-caption-task.md) |
| [repair-captions-and-cover](operations/repair-captions-and-cover.md) | 在保留原资料与学习笔记的前提下补录经过来源核验的字幕和封面。 | high | 2026-10-01 | [操作](operations/repair-captions-and-cover.md) |
| [collect-video-and-verify](operations/collect-video-and-verify.md) | 提交公开视频后，核对各阶段进度、字幕与最终归档状态。 | medium | 2026-10-03 | [操作](operations/collect-video-and-verify.md) |
| [collect-article-and-verify](operations/collect-article-and-verify.md) | 提交公开图文链接后核对正文、笔记、产物和刷新持久化。 | medium | 2026-10-03 | [操作](operations/collect-article-and-verify.md) |

## 站点级陷阱

点击导航后地址可能变更而页面内容稍后才出现。若截图校验仍使用点击前的地址，会被目标校验拒绝；重新读取当前任务空间的标签页地址和页面内容，再按新地址捕获。不要因提交后短时间仍看到旧表单而重复提交。
