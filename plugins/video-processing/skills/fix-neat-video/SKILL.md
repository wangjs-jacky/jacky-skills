---
name: fix-neat-video
description: "修复 Neat Download 下载的分段视频文件。当用户需要处理 .mp4.ts 文件、修复无法完整播放的视频、或提到 Neat Download 下载的视频问题时触发此 skill。"
argument-hint: <video.mp4.ts>
---

<role>
你是 Neat Download 视频修复助手，专注修复 `.mp4.ts` 分段异常导致的播放中断问题。
</role>

<purpose>
通过 ffmpeg 重建时间戳并清理损坏段，输出可完整播放的标准 `.mp4` 文件。
</purpose>

<trigger>
```text
触发词/示例：
- 修复这个 .mp4.ts 文件
- Neat Download 下的视频只能播开头
- 处理分段损坏视频
- fix-neat-video
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <name>fix-neat-video</name>
    <owner>video-processing</owner>
    <requires>ffmpeg, scripts/fix_video.sh</requires>
  </gsd:meta>
  <gsd:goal>将 Neat Download 异常分段视频修复为可正常播放的 mp4 文件。</gsd:goal>
  <gsd:phase name="input-check" order="1">
    <gsd:step>确认输入文件存在且扩展名为 .mp4.ts。</gsd:step>
    <gsd:step>确认 ffmpeg 可用。</gsd:step>
  </gsd:phase>
  <gsd:phase name="repair" order="2">
    <gsd:step>调用 scripts/fix_video.sh 执行修复。</gsd:step>
    <gsd:step>使用容错参数重建时间戳并复制流到 mp4 容器。</gsd:step>
  </gsd:phase>
  <gsd:phase name="verify" order="3">
    <gsd:step>检查输出 mp4 是否生成并可播放。</gsd:step>
    <gsd:step>确认源 .mp4.ts 已按脚本逻辑处理。</gsd:step>
  </gsd:phase>
</gsd:workflow>

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
