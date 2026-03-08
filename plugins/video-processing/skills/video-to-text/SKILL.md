---
name: video-to-text
description: 从视频平台提取文案的 CLI 工具。当用户需要从视频链接提取文字内容、生成字幕、转录语音时触发。支持抖音等平台（持续扩展中）。
---

# Video2Text - 视频文案提取工具

从视频平台自动提取文字内容的专业 CLI 工具。

## 配置检查

> **执行前必读**：本 skill 需要使用 video2text 项目路径。

**执行以下检查步骤**：

1. 首先检查全局 CLAUDE.md 中是否定义了 `VIDEO2TEXT_REPO` 配置变量
2. 如果未定义，使用 `AskUserQuestion` 工具询问用户：
   ```
   请提供您的 video2text 项目路径：
   ```
3. 将用户提供的路径保存为 `$VIDEO2TEXT_REPO` 变量供后续使用

**配置变量**：
- `$VIDEO2TEXT_REPO`: video2text 项目根目录（如 `/Users/xxx/video2text`）

## 触发场景

- 用户想从视频链接提取文字/文案
- 需要为视频生成字幕文件（SRT/VTT）
- 需要转录视频中的语音内容
- 批量处理多个视频链接

## 支持平台

| 平台 | 状态 | 说明 |
|------|------|------|
| 抖音 | ✅ 已支持 | 完整支持，自动处理登录视频 |
| B站 | ✅ 已支持 | 完整支持，使用 yt-dlp 下载 |
| 更多平台 | 🚧 开发中 | 持续扩展中... |

## 项目信息

- **仓库**: `$VIDEO2TEXT_REPO`（从全局配置或用户输入获取）
- **GitHub**: https://github.com/wangjs-jacky/video2text
- **npm**: `@wangjs-jacky/video2text`

## 依赖要求

执行前需确认以下依赖已安装：

| 依赖 | 安装方式 | 必需 |
|------|----------|------|
| Node.js >= 18 | `brew install node` | 是 |
| yt-dlp | `brew install yt-dlp` | 是 |
| ffmpeg | `brew install ffmpeg` | 是 |
| f2 | `brew tap fyrfyrr/f2 && brew install f2` | 否（推荐） |

### Whisper 模型

首次使用需下载模型：

```bash
cd "$VIDEO2TEXT_REPO/node_modules/whisper-node/lib/whisper.cpp/models"
bash download-ggml-model.sh base
```

可选模型：`tiny`、`base`、`small`、`medium`、`large-v3`

## 安装方式

### 全局安装（推荐）

```bash
# 本地开发链接
cd "$VIDEO2TEXT_REPO"
npm link

# 或从 npm 安装
npm install -g @wangjs-jacky/video2text
```

### 直接运行

```bash
cd "$VIDEO2TEXT_REPO"
node bin/video2text.cjs <command> [options]
```

## 命令使用

### extract - 提取视频文案

```bash
# 基础用法（默认 SRT 格式，带时间戳）
video2text extract <视频URL>

# 只要纯文本（不带时间戳）
video2text extract <URL> -f txt

# Markdown 格式（带时间轴）
video2text extract <URL> -f md

# 指定格式和输出目录
video2text extract <URL> -f <txt|srt|vtt|md> -o <输出目录>

# 指定 Whisper 模型
video2text extract <URL> -m <tiny|base|small|medium|large-v3>

# 批量处理
video2text extract --file <链接文件.txt>

# 保留临时文件（视频和音频）
video2text extract <URL> -k

# 使用 Cookie（需登录的视频）
video2text extract <URL> -c "<cookie内容>"
```

### serve - 启动 Web 服务

```bash
# 默认端口 3000
video2text serve

# 指定端口
video2text serve -p 8080
```

## 命令选项

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--format` | `-f` | srt | 输出格式 (txt/srt/vtt/md)，默认带时间戳 |
| `--output` | `-o` | ./output | 输出目录 |
| `--model` | `-m` | base | Whisper 模型 |
| `--keep` | `-k` | false | 保留临时文件 |
| `--cookie` | `-c` | - | Cookie（用于需登录的视频） |
| `--auto-cookie` | - | true | 自动从浏览器获取 Cookie |
| `--file` | - | - | 批量处理的链接文件 |

## Web API

启动服务后可通过 API 调用：

```bash
# 启动服务
video2text serve -p 3000

# API 调用
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://v.douyin.com/xxx/", "format": "srt"}'
```

## 输出格式

### TXT（纯文本，无时间戳）

```
这是第一句话 这是第二句话
```

### SRT（字幕）

```
1
00:00:00,000 --> 00:00:03,000
这是第一句话

2
00:00:03,000 --> 00:00:06,000
这是第二句话
```

### VTT（WebVTT）

```
WEBVTT

00:00.000 --> 00:03.000
这是第一句话

00:03.000 --> 00:06.000
这是第二句话
```

### Markdown（带时间轴）

```markdown
# 视频文案

> 时长: 60秒
> 语言: zh

## 文案内容

这是第一句话 这是第二句话

## 时间轴

- **0:00** 这是第一句话
- **0:03** 这是第二句话
```

## 输出目录结构

```
output/
└── [视频ID]/
    ├── [标题].mp4      # 视频文件（使用 -k 时保留）
    ├── [标题].wav      # 音频文件（使用 -k 时保留）
    └── [标题].txt      # 提取的文案
```

## 常见问题处理

### 需要登录的视频

如果视频需要登录才能查看，工具会自动尝试从 Chrome 浏览器获取 Cookie。

手动获取 Cookie 的方法：
1. 打开 Chrome 开发者工具 (F12)
2. 访问目标平台并登录
3. 在 Network 标签找到任意请求
4. 复制 Cookie 请求头内容
5. 使用 `-c` 选项传入

### 下载失败

1. 确认网络可访问目标平台
2. 尝试使用 Cookie：`-c "cookie"`
3. 检查 URL 是否有效

### 转录质量差

1. 使用更大的模型：`-m medium` 或 `-m large-v3`
2. 确认音频清晰度

## 执行流程

```
URL → 下载视频 → 提取音频 → 语音转录 → 格式化输出 → 保存文件
        ↓           ↓           ↓            ↓
     f2/yt-dlp    ffmpeg    whisper.cpp   formatter
```

## 扩展平台

如需添加新平台支持，需要实现：
1. URL 解析器（`src/core/url-parser.ts`）
2. 下载器适配（`src/core/downloader.ts`）
3. 平台特定的 Cookie 处理（如需要）
