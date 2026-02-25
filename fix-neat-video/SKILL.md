---
name: fix-neat-video
description: 修复 Neat Download 下载的分段视频文件。当用户需要处理 .mp4.ts 文件、修复无法完整播放的视频、或提到 Neat Download 下载的视频问题时触发此 skill。
argument-hint: <video.mp4.ts>
---

# Fix Neat Video

## 概述

修复 Neat Download 下载的分段视频文件。Neat Download 在合并分段视频时会插入约 10MB 的填充数据，导致播放器只能播放开头部分。

## 功能

- 处理 `.mp4.ts` 格式文件
- 使用 ffmpeg 去除填充数据
- 输出为标准 `.mp4` 文件
- 自动删除源文件

## 使用方法

执行 `scripts/fix_video.sh` 脚本：

```bash
bash scripts/fix_video.sh <视频文件.mp4.ts>
```

**示例：**

```bash
# 输入: video.mp4.ts
# 输出: video.mp4（源文件已删除）
bash scripts/fix_video.sh video.mp4.ts
```

## 工作原理

1. 使用 ffmpeg 的 `-fflags +genpts+discardcorrupt+igndts` 参数重建时间戳
2. 使用 `-err_detect ignore_err` 忽略错误数据
3. 直接流复制（`-c copy`）到 mp4 容器
4. 处理成功后删除源 `.mp4.ts` 文件

## 依赖

- ffmpeg（必须已安装）
