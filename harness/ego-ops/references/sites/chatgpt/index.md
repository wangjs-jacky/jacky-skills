---
site: chatgpt
domains:
- chatgpt.com
aliases:
- ChatGPT
- ChatGPT 图片
updated: 2026-09-10
---

# ChatGPT

## 平台特征

- ChatGPT Web 是 SPA；从首页侧栏进入图片工作区后，URL 可能延迟更新，必须同时核验 `https://chatgpt.com/images` 和“描述新图片”输入框。
- 图片生成结果落在对话页面，成品阶段会出现图片元素以及编辑或分享控件；下载应复用当前浏览器登录上下文。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| generate-image-and-send-to-happy | 复用已登录 ChatGPT 的图片能力，生成图片并通过 Happy send_image 回传当前会话 | medium | 2026-09-10 | [说明](operations/generate-image-and-send-to-happy.md) |

## 站点级陷阱

当前没有已验证且跨 operation 的站点级陷阱；操作特有失败记录在对应 operation 文档中。
