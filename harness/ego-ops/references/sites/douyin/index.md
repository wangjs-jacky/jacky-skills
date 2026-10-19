---
site: douyin
domains:
- www.douyin.com
aliases:
- 抖音
updated: 2026-10-19
---

# douyin

## 平台特征

仅在完成跨多个操作的实时验证后补充稳定的登录、导航或加载事实。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| [extract-public-video-source](operations/extract-public-video-source.md) | 提取公开抖音视频的实际可播放媒体地址与来源元数据并完成身份复核 | low | 2026-10-19 | [操作](operations/extract-public-video-source.md) |
| read-saved-videos | 在已登录的个人主页中只读列出收藏区域按页面顺序出现的前 N 个视频 | low | 2026-08-23 | [说明](operations/read-saved-videos.md) |

## 站点级陷阱

暂未记录已验证且跨 operation 的站点级陷阱；操作特有失败保留在对应 operation。
