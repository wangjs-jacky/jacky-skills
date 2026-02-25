---
name: bilibili-to-obsidian
description: 从 B 站视频提取字幕并整理到 Obsidian 仓库。当用户需要从 B 站视频提取文案、保存字幕到 Obsidian、按作者分类整理 B 站内容时触发。
---

# Bilibili to Obsidian - B 站视频字幕提取与整理

从 B 站视频自动提取字幕，整理到 Obsidian 仓库，支持按作者分类、嵌入视频、归纳总结。

## 触发场景

- 用户想从 B 站视频提取字幕保存到 Obsidian
- 需要按作者分类整理 B 站视频笔记
- 想要在 Obsidian 中观看 B 站视频同时查看笔记
- 批量处理多个 B 站视频链接

## 前置条件

### 必需工具

| 工具 | 安装方式 | 说明 |
|------|----------|------|
| video2text | `npm install -g @wangjs-jacky/video2text` | 视频字幕提取 |
| yt-dlp | `brew install yt-dlp` | 视频下载 |
| ffmpeg | `brew install ffmpeg` | 音频处理 |

### 路径配置

- **Obsidian 仓库**: `/Users/jiashengwang/jacky-github/jacky-obsidian`
- **B 站内容目录**: `00-Inbox/B站`（自动创建）

## 目录结构

```
00-Inbox/
└── B站/
    └── [作者名]/
        ├── [视频标题]-原文.md      # 原始字幕（带时间戳）
        └── [视频标题]-归纳.md      # 核心内容归纳
```

## 执行流程

### 步骤 1：解析视频信息

从 B 站 URL 中提取视频信息：

```bash
# 获取视频信息（标题、作者等）
yt-dlp --print "%(uploader)s|%(title)s|%(id)s" "<B站视频URL>"
```

### 步骤 2：提取字幕

使用 video2text 提取字幕：

```bash
# 提取字幕（Markdown 格式，带时间戳）
video2text extract "<B站视频URL>" -f md -o /tmp/bilibili-output

# 或提取 SRT 格式（标准字幕格式）
video2text extract "<B站视频URL>" -f srt -o /tmp/bilibili-output
```

### 步骤 3：创建目录结构

```bash
# 创建 B 站主目录（在 00-Inbox 下）
mkdir -p "/Users/jiashengwang/jacky-github/jacky-obsidian/00-Inbox/B站"

# 创建作者子目录
mkdir -p "/Users/jiashengwang/jacky-github/jacky-obsidian/00-Inbox/B站/[作者名]"
```

### 步骤 4：生成原文笔记

创建带时间戳的原文笔记：

```markdown
# [视频标题]

> **作者**: [作者名]
> **来源**: [B站视频URL]
> **提取时间**: [当前日期]
> **视频时长**: [时长]

## 视频链接

> [!quote] 📺 B 站视频 - [视频标题]
> 🔗 [点击观看](https://www.bilibili.com/video/[BV号])
>
> 💡 **移动端用户**：可在 Obsidian 移动版中直接嵌入播放

---

## 完整文案（带时间戳）

[时间戳内容...]

---
#B站 #[作者名] #视频笔记
```

### 步骤 5：生成归纳笔记

创建单独的归纳文件 `[视频标题]-归纳.md`：

```markdown
# [视频标题] - 归纳

> **作者**: [作者名]
> **来源**: [B站视频URL]
> **原文**: [[视频标题-原文]]

## 核心要点

- 要点 1
- 要点 2
- 要点 3

## 关键引用

> 原文引用内容...

## 我的思考

[个人理解与延伸...]

---
#B站 #[作者名] #归纳
```

## B 站视频嵌入方式

### 方式 1：iframe 嵌入（推荐）

```html
<iframe src="//player.bilibili.com/player.html?bvid=BV1xxxxxxxxx&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="500"> </iframe>
```

**参数说明**：
- `bvid`: 视频 BV 号（从 URL 获取）
- `autoplay=0`: 禁止自动播放
- `width/height`: 播放器尺寸

### 方式 2：链接卡片

```markdown
> [!quote] B 站视频
> **[视频标题]**
> 🔗 [点击观看](https://www.bilibili.com/video/BV1xxxxxxxxx)
```

### 方式 3：Media Extended 插件（可选）

如果安装了 Media Extended 插件，可以使用：

```markdown
![](https://www.bilibili.com/video/BV1xxxxxxxxx)
```

## 完整示例

### 输入

```
提取这个 B 站视频的字幕到 Obsidian：https://www.bilibili.com/video/BV1xx411c7mD
```

### 执行步骤

1. 解析视频信息获取作者和标题
2. 提取字幕内容
3. 创建目录 `00-Inbox/B站/[作者名]/`
4. 生成原文笔记 `00-Inbox/B站/[作者名]/[标题]-原文.md`
5. 生成归纳笔记 `00-Inbox/B站/[作者名]/[标题]-归纳.md`

### 输出文件

**原文笔记** `00-Inbox/B站/技术博主/如何学习编程-原文.md`：

```markdown
# 如何学习编程

> **作者**: 技术博主
> **来源**: https://www.bilibili.com/video/BV1xx411c7mD
> **提取时间**: 2026-02-25
> **视频时长**: 10:30

## 视频链接

> [!quote] 📺 B 站视频 - 如何学习编程
> 🔗 [点击观看](https://www.bilibili.com/video/BV1xx411c7mD)
>
> 💡 **移动端用户**：可在 Obsidian 移动版中直接嵌入播放

---

## 完整文案（带时间戳）

- **0:00** 大家好，今天我们来聊聊如何学习编程
- **0:15** 首先要明确学习的目标
- **0:45** 选择一门适合入门的语言
...

---
#B站 #技术博主 #视频笔记
```

**归纳笔记** `00-Inbox/B站/技术博主/如何学习编程-归纳.md`：

```markdown
# 如何学习编程 - 归纳

> **作者**: 技术博主
> **来源**: https://www.bilibili.com/video/BV1xx411c7mD
> **原文**: [[如何学习编程-原文]]

## 核心要点

- 明确学习目标是第一步
- 选择适合入门的编程语言
- 坚持练习比看教程更重要

## 关键引用

> "编程不是看会的，是练会的"

## 我的思考

[待补充...]

---
#B站 #技术博主 #归纳
```

## 批量处理

支持同时处理多个 B 站视频：

```bash
# 创建链接文件
echo "https://www.bilibili.com/video/BV1xx411c7mD
https://www.bilibili.com/video/BV1yy411c7mE" > /tmp/bilibili-urls.txt

# 批量提取
video2text extract --file /tmp/bilibili-urls.txt -f md -o /tmp/bilibili-output
```

然后逐个整理到 Obsidian。

## 常见问题

### Q: 视频下载失败？

1. 确认网络可访问 B 站
2. 尝试使用代理：`export https_proxy=http://127.0.0.1:7890`
3. 更新 yt-dlp：`brew upgrade yt-dlp`

### Q: 字幕质量差？

1. 使用更大的 Whisper 模型：`video2text extract <URL> -m medium`
2. 如果视频本身有字幕，yt-dlp 会优先下载官方字幕

### Q: iframe 无法播放？

1. 检查 Obsidian 设置是否允许 iframe
2. 使用链接卡片方式替代
3. 安装 Media Extended 插件

## 注意事项

1. **存储优化**：不保存 MP4 文件，只保存文字内容，避免 OSS 存储费用过高
2. **版权尊重**：仅用于个人学习笔记，不要公开发布完整字幕
3. **及时整理**：建议提取后尽快归纳，避免内容积压
