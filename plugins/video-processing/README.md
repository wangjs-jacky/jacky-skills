# Video Processing Plugin

This plugin provides video processing capabilities for the AI agents.

## Features
- **M3U8 Video Download**: Download videos from M3u8/HLS streams with AES-128 decryption support
- **Bilibili to Obsidian**: Extract subtitles from Bilibili videos and save to Obsidian vault
- **Bilibili Batch**: Batch process multiple Bilibili videos by creator or topic
- **Fix Neat Video**: Fix video download issues with custom filename handling
- **Video to Text**: Extract text content from videos using OCR

## Skills

### 1. m3u8-dl
- Description: 使用 m3u8-dl 下载 M3U8/HLS 视频流
- Triggers: when user needs to download video, provides m3u8 link, or mentions video download
- allowed-tools: npx, fzf
- metadata:
  - internal: true (hides from normal discovery)
- ---
name: bilibili-to-obsidian
description: 从 B 站视频提取字幕并整理到 Obsidian 仓库
triggers:
  - when user needs to extract subtitles from Bilibili video
  - when user wants to save Bilibili video content to Obsidian
  - when user mentions "B站", "Bilibili", or needs to organize Bilibili content
allowed-tools: npx, fzf
- metadata:
  - internal: true
- ---
name: bilibili-batch
description: 从 B 站 UP 主空间批量提取视频字幕到 Obsidian，支持按播放量/收藏数/发布时间排序
triggers:
  - when user needs to batch process Bilibili videos
  - when user wants to extract multiple videos from an UP
  - when user mentions "B站批量", "Bilibili 批量", or similar
allowed-tools: npx, fzf
- metadata:
  - internal: true
- ---
name: fix-neat-video
description: 修复视频下载问题，如文件名冲突、代理问题
triggers:
  - when video download fails
  - when user encounters download errors with video tools
  - when user mentions "video download not fix", "fix video", or similar
allowed-tools: npx, fzf
- metadata:
  - internal: true
- ---
name: video-to-text
description: 从视频平台提取文案的 CLI 工具
triggers:
  - when user needs to extract text from video
  - when user mentions "video to text", "extract text from video"
  - when user asks about video content extraction
allowed-tools: npx, fzf
- metadata:
  - internal: true
- ---

## Installation

### From CLI (Recommended)
```bash
npx skills add wangjs-jacky/video-processing
```

### From GitHub
```bash
git clone https://github.com/wangjs-jacky/video-processing.git ~/.agents/skills/
```

Then run these skills to your Claude Code environment:

```bash
ls -la .claude/skills/
```

### Manual Installation
If you prefer to install manually:

```bash
# Install all skills to global Claude Code environment
npx skills add wangjs-jacky/video-processing --all -g

```

### Update Skills
```bash
npx skills update
```

### View on skills.sh
Visit https://skills.sh to browse and discover new skills.

