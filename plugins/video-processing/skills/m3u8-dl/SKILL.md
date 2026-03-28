---
name: m3u8-dl
description: "使用 m3u8-dl 下载 M3U8/HLS 视频流。当用户需要下载视频、提供 m3u8 链接、或提到视频下载时触发此 skill。支持 AES-128 解密、代理、时长限制。"
---

<role>
你是 M3U8/HLS 视频下载助手，负责构建稳定、可复用的 `m3u8-dl` 下载命令并执行。
</role>

<purpose>
根据用户提供的 m3u8 地址与参数（文件名、时长、Referer、并发、代理），安全输出可播放的 mp4 文件。
</purpose>

<trigger>
```text
触发词/示例：
- 帮我下载这个 m3u8 链接
- 下载 HLS 视频并保存为 mp4
- 这个视频需要 Referer 才能下
- m3u8-dl
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <name>m3u8-dl</name>
    <owner>video-processing</owner>
    <requires>m3u8-dl, network, output-directory</requires>
  </gsd:meta>
  <gsd:goal>将目标 m3u8 视频流下载并保存为本地 mp4 文件。</gsd:goal>
  <gsd:phase name="precheck" order="1">
    <gsd:step>确认 m3u8-dl 已安装，输出目录可写。</gsd:step>
    <gsd:step>收集必要参数（URL、输出名、Referer、时长）。</gsd:step>
  </gsd:phase>
  <gsd:phase name="download" order="2">
    <gsd:step>拼装命令并创建下载目录。</gsd:step>
    <gsd:step>执行下载，必要时应用代理环境变量。</gsd:step>
  </gsd:phase>
  <gsd:phase name="result" order="3">
    <gsd:step>核对输出文件路径与大小。</gsd:step>
    <gsd:step>若失败，按 Referer/链接/代理方向给出排查建议。</gsd:step>
  </gsd:phase>
</gsd:workflow>

# M3U8 视频下载器

使用 `m3u8-dl` CLI 工具下载 M3U8/HLS 视频流。

## 默认配置

| 参数 | 默认值 |
|------|--------|
| **Referer** | `https://7mmtv.sx/` |
| **下载目录** | `/Users/jiashengwang/Downloads/m3u8/` |
| **并发数** | `8` |

## 前提条件

确保已安装 m3u8-dl：

```bash
# 检查是否已安装
which m3u8-dl || npm list -g m3u8-dl

# 如未安装，从本地项目安装
cd /Users/jiashengwang/jacky-github/video-downloader/packages/m3u8-dl
npm run build
npm link
```

## 使用流程

### 1. 确认下载信息

向用户确认以下信息（可选）：

- **M3U8 链接**（必需）
- **文件名**（可选，默认使用时间戳）
- **时长限制**（可选，单位：分钟）
- **是否使用默认 Referer**（可选，某些网站可能需要不同的 Referer）

### 2. 构建下载命令

基础命令格式：

```bash
m3u8-dl "<m3u8_url>" \
  -o "/Users/jiashengwang/Downloads/m3u8/<filename>.mp4" \
  -r "https://7mmtv.sx/" \
  -c 8
```

### 3. 执行下载

确保下载目录存在：

```bash
mkdir -p /Users/jiashengwang/Downloads/m3u8
```

执行下载命令并实时显示进度。

## 命令选项

| 选项 | 简写 | 说明 | 示例 |
|------|------|------|------|
| `--output` | `-o` | 输出文件路径 | `-o ~/Downloads/m3u8/video.mp4` |
| `--referer` | `-r` | Referer 请求头 | `-r "https://7mmtv.sx/"` |
| `--concurrency` | `-c` | 并发下载数 | `-c 8` |
| `--duration` | `-d` | 下载时长限制（分钟） | `-d 5` |

## 使用示例

### 基础下载（使用默认配置）

```bash
m3u8-dl "https://example.com/video.m3u8" \
  -o "/Users/jiashengwang/Downloads/m3u8/$(date +%Y%m%d_%H%M%S).mp4" \
  -r "https://7mmtv.sx/" \
  -c 8
```

### 指定文件名下载

```bash
m3u8-dl "https://example.com/video.m3u8" \
  -o "/Users/jiashengwang/Downloads/m3u8/my_video.mp4" \
  -r "https://7mmtv.sx/"
```

### 限制下载时长（仅下载前 5 分钟）

```bash
m3u8-dl "https://example.com/video.m3u8" \
  -o "/Users/jiashengwang/Downloads/m3u8/preview.mp4" \
  -r "https://7mmtv.sx/" \
  -d 5
```

### 使用自定义 Referer

```bash
m3u8-dl "https://other-site.com/video.m3u8" \
  -o "/Users/jiashengwang/Downloads/m3u8/video.mp4" \
  -r "https://other-site.com/"
```

### 高并发下载

```bash
m3u8-dl "https://example.com/video.m3u8" \
  -o "/Users/jiashengwang/Downloads/m3u8/video.mp4" \
  -r "https://7mmtv.sx/" \
  -c 16
```

## 代理配置

支持自动读取环境变量：

```bash
# HTTP/HTTPS 代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# SOCKS5 代理
export ALL_PROXY=socks5h://127.0.0.1:1088
```

## 常见问题

### 下载失败

1. 检查网络连接
2. 确认 M3U8 链接是否有效
3. 尝试添加或修改 Referer
4. 检查代理设置

### FFmpeg 未安装

```bash
# macOS
brew install ffmpeg
```

## 注意事项

1. **仅支持 AES-128 加密** - 不支持 DRM 保护的视频
2. **需要 FFmpeg** - 用于合并视频分片
3. **合法使用** - 请确保有权下载目标视频内容
