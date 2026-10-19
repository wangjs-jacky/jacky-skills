---
site: paper-room
domains:
  - trycloudflare.com
aliases:
  - 纸间打字机
  - 打字机视频拆解
  - 纸间 Blender 素材版
updated: 2026-10-19
---

# paper-room

## 平台特征

静态打字机写作页面，无需登录；草稿保存在当前来源的 localStorage，文字导出为文本文件。网页支持桌面与手机布局，入口来自本次预览发布结果。

同一项目另有静态视频拆解页，提供时间节点、源画面、提示词、图片放大与任务契约。两个页面的交互不同，按实际页面标题路由；拆解页的原片截图不是新版复刻完成证据。

新版将机械部件替换为 Blender 透明渲染，输入框为可见 textarea，独立灯头由角度素材与枢轴补间驱动；制作档案提供任务交付和源视频对照。旧 SVG 版本保留为历史，按当前页面识别后选择对应操作。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-blender-typewriter](operations/verify-blender-typewriter.md) | 检查真实渲染图层、输入、灯头跟随与公开交付 | low | 2026-10-19 | [操作](operations/verify-blender-typewriter.md) |
| [review-video-breakdown](operations/review-video-breakdown.md) | 通过时间节点查看源视频截图、提示词及下游任务依据 | low | 2026-10-19 | [操作](operations/review-video-breakdown.md) |
| [verify-typewriter-interaction](operations/verify-typewriter-interaction.md) | 核验输入与机械动作以及手机布局 | low | 2026-10-19 | [操作](operations/verify-typewriter-interaction.md) |

## 站点级陷阱

尚无跨 operation 的已验证陷阱；输入焦点与仿真尺寸范围见对应操作记录。
