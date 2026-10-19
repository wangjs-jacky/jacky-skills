---
site: miss-studio
domains:
  - miss.jacky-openbird.workers.dev
  - insight.paws.rodeo
aliases:
  - MISS Studio
updated: 2026-10-19
---

# miss-studio

## 平台特征

已登录的 Studio 页面有左侧“添加链接”“学习资料”“任务动态”等导航。前端会异步切换页面；同一资料地址在采集期间显示任务进度，完成后显示学习页。文章学习页提供“原网页”“原文”“观点脉络”三个依据标签，新图文原文以原图与连续正文展示，不嵌入视频播放器；旧纯文字资料需要重新采集才会补齐原图。进度页明确说明“刷新进度”只查询状态，不会推动远端执行。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-brand-deployment](operations/verify-brand-deployment.md) | 核验品牌部署与已有资料 | low | 2026-10-18 | [操作](operations/verify-brand-deployment.md) |
| [verify-native-chatbox-ui](operations/verify-native-chatbox-ui.md) | 核验原生共学界面与草稿恢复 | medium | 2026-10-19 | [操作](operations/verify-native-chatbox-ui.md) |

## 站点级陷阱

点击导航后地址可能变更而页面内容稍后才出现。若截图校验仍使用点击前的地址，会被目标校验拒绝；重新读取当前任务空间的标签页地址和页面内容，再按新地址捕获。不要因提交后短时间仍看到旧表单而重复提交。
