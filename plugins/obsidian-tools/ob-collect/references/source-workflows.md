# 特殊来源采集工作流

> 仅在采集视频/音频、批量 URL、收藏/书签、掘金小册或微信公众号时读取。通用单篇网页仍按 SKILL.md 主流程执行。

## 目录

- [视频/音频采集模式](#视频音频采集模式)
- [批量采集模式](#批量采集模式)
- [采集收藏/书签](#采集收藏书签)
- [掘金小册采集模式](#掘金小册采集模式)
- [微信公众号批量采集模式](#微信公众号批量采集模式)

## 视频/音频采集模式

当采集来源为视频（YouTube/B站/播客等）或音频时，使用以下专用流程。

### 处理管线

```
URL 输入：
  1. OpenCLI 获取元信息（video/episode）
  2. OpenCLI 获取字幕（subtitle/transcript）
  3. 有字幕？→ YES → 写入 raw/ → 编译 wiki/
               → NO → OpenCLI download → A2S ASR 转录 → 写入 raw/ → 编译 wiki/

本地音视频文件：
  A2S ASR 转录 → 写入 raw/ → 编译 wiki/
```

### 平台能力矩阵

| 平台 | 字幕/Transcript | 元信息 | 下载 | 策略 |
|------|-----------------|--------|------|------|
| YouTube | `transcript`（带时间戳） | `video` | `download`（需 yt-dlp） | 字幕优先，无字幕→下载+ASR |
| B站 | `subtitle`（部分有） | `video` | `download`（需 yt-dlp） | 字幕优先，很多无字幕→下载+ASR |
| 小宇宙 | `transcript` | `episode` | `download` | transcript 优先 |
| 抖音 | ❌ 无字幕命令 | `stats`（仅自己作品） | ❌ 无 download 子命令 | **browser 提取真实地址 + ASR**（见下方兜底）|
| 通用网页 | `web read` | — | — | 直接提取文字 |

### 拿不到视频文件时：browser 登录态提取真实地址（兜底）

> **触发场景**：平台**没有 opencli download 子命令**（如抖音），或 **yt-dlp 解析失效**（抖音 web detail JSON 强反爬，返回空、报 "Fresh cookies needed"）。
>
> **原理**：不破解平台接口签名，而是让真实浏览器在登录态下渲染页面，从渲染好的 DOM 里读 `<video>` 的真实 CDN 直链（带时效 `sign` 签名），再 curl 下载。详见 [video-collect.md](video-collect.md) 的「browser 提取真实地址」一节。

```bash
# 1. opencli browser 登录态打开视频页（session 名任取，复用同名保持 tab）
opencli browser <session> open "<video_url>"
opencli browser <session> wait time 5
# 2. eval 读真实 mp4 地址（抖音在 video.currentSrc）
opencli browser <session> eval 'document.querySelector("video").currentSrc'   # → https://...douyinvod.com/...?sign=...
# 3. curl 带 Referer 下载（直链有时效，尽快下）
curl -sL --max-time 180 -H 'Referer: https://www.douyin.com/' -H 'User-Agent: Mozilla/5.0 ...' "<url>" -o video.mp4
opencli browser <session> close   # 释放 tab lease
```

> ⚠️ 抖音 `/video/{id}` 会重定向到精选流的**别的**视频；用原始 `jingxuan?modal_id={id}` URL 打开，eval 前先核对 `location.href` 的 modal_id 与目标一致。

### ASR 回退流程

当视频无字幕时（或上一步刚下到 mp4），使用 audio-to-subtitle 进行 ASR 转录：

1. `opencli <site> download <url> -o /tmp/collect-download/` 下载视频（无 download 子命令的平台改用上方 browser 兜底）
2. `ffmpeg -i /tmp/collect-download/video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 /tmp/collect-download/audio.wav` 提取音频
3. `python3 {A2S_DIR}/scripts/transcribe.py /tmp/collect-download/audio.wav --engine local -m large-v3-turbo -f srt -o /tmp/collect-download/ --yolo` ASR 转录
4. 校验 SRT 非空且含时间范围，将其移动到 `raw/videos/{作者名}/captions/{video_id}.srt`；再写入同目录 `{video_id}.meta.json`，记录来源、语言、引擎、模型、生成时间与段数
5. 读取字幕生成时间轴摘记，继续正常 raw/ → wiki/ 流程；raw 笔记 frontmatter 写入 `caption_file`、`caption_status: archived` 与 `caption_source: asr`
6. 清理临时文件：`rm -rf /tmp/collect-download/`（只清理临时视频、音频和中间字幕，不清理已归档字幕）

> **超时设置**：OpenCLI download 命令设置超时 `OPENCLI_BROWSER_COMMAND_TIMEOUT=120000`（120s）
>
> **⚠️ ASR 模型已缓存却报 `ProxyError: 502 Bad Gateway`**：本机沙箱会注入 `HTTP_PROXY/HTTPS_PROXY`，MLX-Whisper 启动时联网校验 HuggingFace 被代理拦截。模型已在 `~/.cache/huggingface/hub/` 时直接走离线：在 transcribe.py 命令前加 `env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1`。
>
> **配图**：讲解类视频（思维导图/案例 K 线）建议 `ffmpeg -ss <时间点> -i video.mp4 -frames:v 1 frame.jpg` 抽关键帧，存就近 attachments 并配 OCR callout，删视频前先抽完。

### 模板与归纳规则

完整模板细节见 **[video-collect.md](video-collect.md)**：

- **raw 模板**：按作者归档（`raw/[作者名]/标题.md`）+ 时间轴分段（`### M:SS 标题`）+ frontmatter
- **wiki 归纳模板**：核心观点 + raw 引用（含时间范围 `#1:30 ~ #3:45`）+ 关键金句 + 我的思考
- **归纳生成 8 条规则**：观点拆解 / raw 引用 / 不搬运原文 / 不做延伸 等
- **作者索引模板**：`raw/index.md` 按作者分组的自动索引

## 批量采集模式

### 触发条件

- 用户提供多个 URL（逗号/换行分隔）
- 用户提供 URL 文件（.txt，每行一个 URL）
- 用户说"采集我的书签/收藏"类指令

### 执行策略

| 任务数 | 策略 | 实现方式 |
|--------|------|----------|
| 1-4 | 顺序执行 | 主会话逐个处理 |
| 5-50 | 并行执行 | Sub Agent 并行（3-4 个/组，上限 4 并发） |

**并行要求**：所有 Sub Agent 的 Bash 调用**必须在同一条响应中发起**。

### 状态追踪 + 断点续传

批量任务在 `~/Downloads/collect-pipeline/{platform}-{id}/meta.json` 记录状态（pending/in_progress/completed/failed/skipped）+ 时间。下次启动时扫描所有 meta.json，从 `status != completed` 的位置继续。

meta.json schema、字段说明、报告模板见 **[batch-collect.md](batch-collect.md)**。

### 自动停止

- 连续 3 个任务失败 → 暂停整个批量，报告失败项
- 单个任务失败 → 记录错误，继续下一个
- HTTP 429/403 → 立即停止

## 采集收藏/书签

利用 OpenCLI 的个人数据命令，批量采集用户的收藏内容：

### 支持的来源

| 指令 | OpenCLI 命令 | 认证要求 |
|------|-------------|----------|
| 采集 Twitter 书签 | `opencli twitter bookmarks --limit 20` | 🔐 需登录 |
| 采集 B站收藏夹 | `opencli bilibili favorite --limit 20` | 🔐 需登录 |
| 采集 YouTube 稍后观看 | `opencli youtube watch-later --limit 20` | 🔐 需登录 |
| 采集 YouTube 订阅流 | `opencli youtube feed --limit 20` | 🔐 需登录 |
| 采集微信读书划线 | `opencli weread highlights --limit 20` | 🔐 需登录 |

### 执行流程

1. 调用对应 OpenCLI 命令获取列表（`-f json`）
2. 从返回数据中提取 URL/ID 列表
3. 进入批量采集模式处理

## 掘金小册采集模式

URL 匹配 `juejin.cn/book/{booklet_id}` 时走专用脚本（不经 web-search）：

```bash
node scripts/extract-juejin-booklet.mjs <booklet_url_or_id> \
  --output-dir "$OBSIDIAN_REPO/raw/juejin/{slug}" \
  --download-images
```

完整流程（API 解析 / HTML→Markdown 转换 / 图片并发下载 / 付费小册的 web-access 兜底 / 注意事项）见 **[juejin-booklet.md](juejin-booklet.md)**。

## 微信公众号批量采集模式

> **【硬约束】当输入是公众号文章 URL 列表（xlsx 导出 / 历史归档）且数量 ≥ 50 时，必须走本节流程，不走通用 web-search 路由。**

### 触发条件

- 输入是公众号导出 xlsx（含 `文章链接` 列）
- 同一公众号的批量 URL 列表（≥ 50 条）
- 用户明确说"批量采集 XX 公众号 / 把这个公众号沉淀到 ob"

### 工具栈

| 角色 | 工具 |
|------|------|
| 抓取（一篇） | `opencli weixin download --url <URL> --output <dir> --download-images true -f json` |
| 状态机 | `~/Downloads/collect-pipeline/wechat-{author-slug}/meta.json`（schema 见 [batch-collect.md](batch-collect.md)）|
| 并发控制 | 自写 Python/Node 脚本，3 个 worker 上限（实测 wechat ~3s/篇，更高并发风险 429）|
| 规范化 | normalize 脚本（见下节）|
| OCR | 独立异步阶段（见 [wechat-extract.md](wechat-extract.md)）|

### 处理管线（两阶段解耦）

```
xlsx / URL 列表
      │
      ▼
[阶段 1] 抓取（粗下载）
  - 建 meta.json（每条 status=pending）
  - 并发 opencli weixin download
  - 产物原样落地 raw/wechat/{author}/__opencli_raw/{date}-{N}/...
      │
      ▼
[阶段 2] normalize（规范化后处理）
  - 移动 md 文件到平铺路径 raw/wechat/{author}/{date}-{slug}.md
  - 改写：顶部 > 引用块 → YAML frontmatter（七件套 + status: uncompiled）
  - 图片迁移：images/{wechat-hash}.jpg → attachments/{date-slug}/img_NNN.{ext}
  - 正文：![图片](https://mmbiz...) → ![[attachments/{date-slug}/img_NNN.jpeg]]（本地化）
  - 文末追加 <!-- TODO OCR --> 占位
  - 删除中间目录 __opencli_raw/
      │
      ▼
[阶段 3] 异步 OCR（独立触发，可延后）
  - 扫 status: uncompiled
  - 每张图 Read → 多模态 OCR → 在图片上方插入 [!note] callout
  - status: uncompiled → compiled
```

### 规范化产物结构（强制）

```
raw/wechat/{author}/
├── {YYYY-MM-DD}-{slug}.md        ← 平铺 md（一文一文件）
├── {YYYY-MM-DD}-{slug}.md
├── ...
├── attachments/                   ← 就近 attachments
│   ├── {YYYY-MM-DD}-{slug}/
│   │   ├── img_001.jpeg
│   │   ├── img_002.jpeg
│   │   └── ...
│   └── ...
└── index.md                       ← 全文章索引表（标题/日期/URL/status）
```

### raw md frontmatter（七件套，硬约束）

```yaml
---
article_id: OBA-{8位}
tags: ["wechat", "{author}", "{topic-tag}"]
type: source
source_url: <原文 URL>
publish_date: YYYY-MM-DD
author: {author}
updated_at: YYYY-MM-DD
status: uncompiled       # 待 OCR + wiki 编译
---
```

### normalize 后处理规则（硬约束）

1. **文件名 slug 化**：去掉标题里的【日期】前缀、特殊字符、空格替换为 `-`
2. **frontmatter 替换正文 > 引用块**：opencli 默认在正文顶部写 `> 公众号:` `> 发布时间:` `> 原文链接:`，normalize 阶段全部移除，信息全部进 frontmatter
3. **图片本地化**：
   - opencli 默认下载到 `{title}/images/{wechat-hash}.{ext}`，hash 不可读
   - normalize 按出现顺序重编号为 `img_001`、`img_002`，迁移到 `attachments/{date-slug}/`
   - 正文中的 `![图片](远程URL#imgIndex=N)` 替换为 `![[attachments/{date-slug}/img_{N+1:03d}.{ext}]]`（imgIndex 0-based → 文件名 1-based 三位补零）
4. **OCR 占位**：每张图片本地引用上方插入 `<!-- TODO OCR -->` HTML 注释，OCR 完成后 OCR 脚本会把它替换为 `[!note] OCR callout`
5. **去除嵌套**：删除 opencli 自带的 `{title}/` 中间目录，所有 md 平铺到 `raw/wechat/{author}/` 下

### 失败处理

- opencli 返回 `status: failed — no title`：原文已删除/纯图片帖，标记 `permanent_failure: true`，不再重试
- 单条超时：重试 2 次后标记 failed
- 连续 5 次失败 / 429 / 403：立即停止，写日志，等用户介入

### 与通用批量模式的差异

| 维度 | 通用批量（5-50 条混合 URL）| 微信批量专项（≥ 50 条单源）|
|------|--------------------------|-------------------------|
| 下载工具 | web-search 路由（Layer 1-4）| 直接 opencli weixin download |
| 并发 | Sub Agent 4 个 | Python 进程 3 worker |
| 编译时机 | 边采边编（每条 raw + wiki）| 阶段解耦（先全采，再 normalize，再 OCR，wiki 多对一蒸馏）|
| wiki 产出 | 1 URL → 1 wiki | N URL → 1 方法论 wiki（多对一蒸馏，调 distiller）|
