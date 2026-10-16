# 视频/音频采集模板

> SKILL.md 的「视频/音频采集模式」章节包含处理管线、平台能力矩阵和 ASR 回退步骤；本文是各类模板细节和归纳规则。

## 字幕资产归档契约（先于学习摘记）

每条新视频在写入 raw 笔记前，先建立以下稳定资产；视频或音频本体仍是临时文件，转写完成后删除：

```
raw/videos/{作者名}/
├── captions/
│   ├── {video_id}.srt       # 必需：UTF-8，逐段起止时间
│   └── {video_id}.meta.json # 必需：来源、语言、引擎、段数、生成时间
└── {YYYY-MM-DD}-{video_id}-来源摘记.md
```

`meta.json` 最小格式：

```json
{
  "video_id": "7684917728125618155",
  "source_url": "https://www.douyin.com/video/7684917728125618155",
  "caption_source": "platform",
  "language": "zh",
  "generated_at": "2026-09-14T12:00:00+08:00",
  "segment_count": 512
}
```

当 `caption_source` 是 `asr` 时，额外写入 `engine` 和 `model`。原始平台 VTT/JSON 可作为附加文件保留，但 `{video_id}.srt` 是 MISS 与后续问答统一使用的规范入口。

## raw 模板（带时间轴分段）

视频/音频的 raw 层按作者名归档：`raw/[作者名]/标题.md`

```markdown
---
source: "https://..."
author: "作者名"
ingested_at: {YYYY-MM-DD}
type: transcript
category: Audio
duration: "10:30"
status: uncompiled
caption_file: "captions/{video_id}.srt"
caption_status: archived
caption_source: platform | asr
tags: [音频笔记, {作者名}]
---

# 标题

### 0:00 主题段落标题

句子内容，可以多句组成一个语义完整的段落。
每段以 `### M:SS 主题标题` 开头，方便 Obsidian heading 跳转。

### 1:30 下一个主题段落标题

下一段内容...

---
#音频笔记 #{作者名}
```

**关键规则**：
- 每个语义段落用 `### M:SS 标题` 作为 heading
- raw 层不可变：写入后不再修改
- 文件名特殊字符替换为下划线，长度 ≤ 200 字符

## wiki 归纳模板

视频/音频的 wiki 层生成归纳笔记，用 `[[raw/作者名/标题]]` 引用 raw 层原文。

```markdown
---
article_id: OBA-k7jm2p9q
tags: [{主题标签}, {作者名}, 归纳]
type: {预定义类型}
updated_at: {YYYY-MM-DD}
author: {作者名}
source_url: {采集来源 url}
origin_url: {原始来源 url，如转载视频的源站；无则省略此行}
duration: "{duration}"     # 必须加引号，否则 YAML 把 70:33 当 60 进制数字
ingested_at: {YYYY-MM-DD}
raw_note: "[[raw/作者名/标题]]"
---

# 标题 - 归纳

> {一句话作者/来源背景，如「作者 X 解说 Y 演讲」}
> 原文：[[raw/作者名/标题]] · [来源]({source_url})（如有 origin_url 再补一个链接）

[embedCode — 如有则插入，如 B 站 iframe]

## 核心观点

### 1. {观点标题}

简明扼要地概括这个观点（2-5句话）。
包括论据、因果逻辑、关键数据。

→ [[raw/作者名/标题#1:30]] ~ [[raw/作者名/标题#3:45]]

### 2. {观点标题}

下一个核心观点的概括。

→ [[raw/作者名/标题#5:00]] ~ [[raw/作者名/标题#7:20]]

## 关键引用

> [原文金句1] — [[raw/作者名/标题#2:15]]

> [原文金句2] — [[raw/作者名/标题#8:30]]

## 我的思考

[待补充]

---
#音频笔记 #{作者名} #归纳
```

## 归纳生成规则

AI 归纳视频/音频内容时遵循以下原则：

1. **字幕先验收**：先确认 `caption_file` 和对应 SRT 存在、非空且至少含一个时间范围；缺字幕时不得把“ASR 已阅读”或学习摘记写成“字幕已归档”。
2. **观点拆解**：将内容拆解为 3-7 个核心观点/论点，每个有独立标题
3. **raw 引用**：每个观点必须用 `[[raw/作者名/标题#M:SS]]` 链接到 raw 层原文的 heading
4. **时间范围**：观点跨多段时用 `~` 连接起止：`[[raw/作者名/标题#1:30]] ~ [[raw/作者名/标题#3:45]]`
5. **不搬运原文**：归纳用自己的话概括，不直接复制原文句子
6. **关键结论**：提炼 3-5 条一句话可消化的结论，附链接
7. **金句引用**：选取 2-4 条原文中最有表达力的原话，附链接
8. **我的思考**：留空，供用户自行补充
9. **不做延伸**：只归纳，不添加 transcript 中没有的观点
10. **元数据进 frontmatter**：author / source_url / origin_url / duration / ingested_at / raw_note 一律写入 YAML，**不要**塞进正文 `>` 引用块——结构化字段进 frontmatter 才能被 Dataview/Bases 查询、过滤、聚合。正文顶部只留一句背景 + 一行原文/来源链接。`duration` 形如 `70:33` 必须加引号，否则被 YAML 当 60 进制数字解析。

## browser 提取真实地址（yt-dlp / opencli download 失效时的兜底）

> 实战来源：采集抖音视频（2026-06）。抖音既无 opencli `subtitle/download` 子命令，yt-dlp 也解析失效，靠本方案打通。

### 为什么需要这条路

| 路线 | 怎么拿地址 | 卡在哪 |
|------|-----------|--------|
| yt-dlp / API 直采 | 直接 HTTP 请求平台的 detail JSON 接口 | 抖音要 `ms_token`/`a_bogus` 等**加密签名 + 风控**，缺参数返回空 JSON，报 `Failed to parse JSON` / `Fresh cookies needed`（升级 yt-dlp 也不解决，根因是接口签名不是 cookie）|
| **browser 提取**（本方案）| 让真实 Chrome 在登录态下渲染页面，从 DOM 读 `<video>` 直链 | 几乎不卡——浏览器自己对抗风控、自己生成签名拉流，我们只读渲染结果 |

**本质**：网页播放器加载视频时，会把真实 CDN 直链（带时效 `sign` 签名）写进 `<video>` 元素的 `currentSrc` / `<source>`。这个地址就是浏览器实际拉流的地址，curl 带 Referer 即可下载。绕过 API 签名问题。

### 完整链路（以抖音为例）

```bash
# ① 登录态打开（session 名任取，同名复用 tab）。抖音用原始 jingxuan?modal_id 别用 /video/{id}
opencli browser dycol open "https://www.douyin.com/jingxuan?modal_id={aweme_id}"
opencli browser dycol wait time 5

# ② 核对当前 modal 是目标视频，并读真实地址 + 文案
opencli browser dycol eval 'JSON.stringify({url:location.href, title:document.title, desc:(document.querySelector("[data-e2e=video-desc]")||{}).innerText, src:document.querySelector("video").currentSrc})'

# ③ curl 下载（直链有时效签名，过期 403，拿到尽快下）
curl -sL --max-time 180 \
  -H 'Referer: https://www.douyin.com/' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
  "<currentSrc>" -o /tmp/collect-download/video.mp4

# ④ 用完关闭释放 tab lease
opencli browser dycol close
```

### 注意事项 / 坑

- **登录态是关键**：opencli browser 复用已登录该平台的 Chrome profile；没登录态页面可能不渲染视频或跳登录墙。
- **抖音 URL 重定向**：`/video/{id}` 会被重定向到精选流并展示**别的**推荐视频，eval 出来的是错的；用原始 `jingxuan?modal_id={id}`，eval 前先核对 `location.href`。
- **直链时效**：`currentSrc` 带 `sign=` + 时间戳，几分钟内失效，下载要紧接 eval。
- **清晰度**：拿到的是网页播放码率（如 `br=154`），非最高码率，但做 ASR / 抽帧足够。
- **eval 输出干扰**：opencli 输出可能夹带 `UNDICI-EHPA` warning 和 "Update available" 行，提地址时 `grep -E '^https'` 过滤。
- **拿到 mp4 后**：接 ASR 回退流程（ffmpeg 抽音频 → transcribe.py），讲解类视频再 `ffmpeg -ss` 抽关键帧配图。

## 作者索引

视频/音频写入后自动维护 `raw/index.md` 作者索引：

```markdown
---
type: index
updated_at: {YYYY-MM-DD}
authors: {N}
files: {N}
---

# 作者索引

> 自动维护 · {N} 位作者 · {N} 篇资料

## 作者A

- [[raw/作者A/标题1]] — {YYYY-MM-DD}
- [[raw/作者A/标题2]] — {YYYY-MM-DD}

## 作者B

- [[raw/作者B/标题3]] — {YYYY-MM-DD}
```
