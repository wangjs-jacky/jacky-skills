# Bilibili Batch - B 站视频批量提取

从 B 站 UP 主空间批量提取视频字幕到 Obsidian，支持按播放量/收藏数/发布时间排序。

## 触发场景

- 用户想批量提取某个 UP 主的多个视频
- 用户想提取 UP 主播放量最高的 Top N 视频
- 用户有一个视频 URL 列表需要批量处理

## 前置条件

### 必需工具

| 工具 | 安装方式 | 说明 |
|------|----------|------|
| video2text | `npm install -g @wangjs-jacky/video2text` | 视频字幕提取 |
| yt-dlp | `brew install yt-dlp` | 视频信息获取 |
| node | Node.js 18+ | 运行 CLI 工具 |

### 路径配置

- **Obsidian 仓库**: `/Users/jiashengwang/jacky-github/jacky-obsidian`
- **B 站内容目录**: `00-Inbox/B站`（自动创建）

## 使用方式

### 方式一：通过 Claude Code 触发

对 Claude 说：

```
提取这个 UP 主播放量前10的视频到 Obsidian：
https://space.bilibili.com/316568752
```

### 方式二：直接运行 CLI

```bash
# 进入 skill 目录
cd /Users/jiashengwang/jacky-github/jacky-skills/bilibili-batch

# 提取 UP 主 Top 10 视频
./bin/cli.js top https://space.bilibili.com/316568752 \
  --limit 10 \
  --output /Users/jiashengwang/jacky-github/jacky-obsidian/00-Inbox/B站

# 批量处理 URL 列表文件
./bin/cli.js file /path/to/urls.txt \
  --output /Users/jiashengwang/jacky-github/jacky-obsidian/00-Inbox/B站
```

## CLI 命令

### `top` - 提取 UP 主 Top 视频

```bash
./bin/cli.js top <UP主空间URL> [options]
```

**选项**：

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--limit` | `-l` | 提取数量 | 10 |
| `--sort` | `-s` | 排序方式 (play/favorite/date) | play |
| `--output` | `-o` | Obsidian 输出目录 | - |
| `--format` | `-f` | 笔记格式 (simple/detailed) | detailed |
| `--dry-run` | | 只显示视频列表，不提取 | false |

**示例**：

```bash
# 提取播放量前5的视频
./bin/cli.js top https://space.bilibili.com/316568752 --limit 5

# 提取收藏数前10的视频
./bin/cli.js top https://space.bilibili.com/316568752 --sort favorite

# 只显示视频列表（不提取字幕）
./bin/cli.js top https://space.bilibili.com/316568752 --dry-run
```

### `file` - 批量处理 URL 列表

```bash
./bin/cli.js file <URL列表文件> [options]
```

**URL 列表文件格式**：

```
# 每行一个 URL，支持注释
https://www.bilibili.com/video/BV1iE411E7xc
https://www.bilibili.com/video/BV1n7411Q7nK
# 这是注释
https://www.bilibili.com/video/BV19u411Z7au
```

## 输出结构

```
00-Inbox/
└── B站/
    └── [作者名]/
        ├── [视频标题]-原文.md      # 原始字幕（带时间戳）
        └── [视频标题]-归纳.md      # 核心内容归纳（可选）
```

## 笔记格式

### detailed（详细模式）

生成两个文件：
- `*-原文.md`：完整字幕 + 时间戳 + 视频嵌入
- `*-归纳.md`：核心要点 + 关键引用 + 思考

### simple（简洁模式）

只生成一个文件：
- `*.md`：完整字幕 + 视频链接

## 执行流程

### 1. 获取视频列表

使用 yt-dlp 获取 UP 主空间视频列表：

```bash
# 获取视频列表（JSON 格式）
yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(view_count)s|%(uploader)s" \
  "https://space.bilibili.com/316568752/upload/video"
```

### 2. 排序和筛选

根据 `--sort` 参数排序：
- `play`：按播放量排序
- `favorite`：按收藏数排序
- `date`：按发布时间排序

### 3. 批量提取字幕

使用 video2text 批量提取：

```bash
# 创建 URL 列表文件
echo "url1
url2
url3" > /tmp/bilibili-urls.txt

# 批量提取
video2text extract --file /tmp/bilibili-urls.txt -f md -o /tmp/bilibili-output
```

### 4. 生成 Obsidian 笔记

将提取的字幕转换为 Obsidian 格式：
- 添加 frontmatter 元数据
- 嵌入 B 站播放器 iframe
- 添加标签和双向链接
- 生成归纳笔记（可选）

## 示例输出

### 原文笔记

```markdown
# 【睡前消息83】关于《外国人永久居留管理条例》，我们最该担心什么？

> **作者**: 马督工
> **来源**: https://www.bilibili.com/video/BV1iE411E7xc
> **提取时间**: 2026-03-01
> **视频时长**: 17:13
> **播放量**: 447.4万

## 视频嵌入

<iframe src="//player.bilibili.com/player.html?bvid=BV1iE411E7xc&autoplay=0"
  scrolling="no" border="0" frameborder="no" framespacing="0"
  allowfullscreen="true" width="100%" height="500">
</iframe>

---

## 完整文案（带时间戳）

- **0:00** 大家好...
- **0:15** 今天我们来聊聊...

---
#B站 #马督工 #视频笔记
```

## 常见问题

### Q: 提取速度太慢？

A: video2text 默认使用 base 模型，可以切换到更快的 tiny 模型：

```bash
export VIDEO2TEXT_MODEL=tiny
```

### Q: 部分视频提取失败？

A: 可能原因：
1. 视频是充电专属（需要登录）
2. 视频已被删除
3. 网络问题

失败的视频会记录在 `failed.txt` 中，可以稍后重试。

### Q: 如何跳过已提取的视频？

A: 工具会自动检测输出目录中已存在的笔记，跳过重复提取。

## 注意事项

1. **存储优化**：不保存 MP4 文件，只保存文字内容
2. **版权尊重**：仅用于个人学习笔记
3. **速率限制**：批量提取时建议间隔 5-10 秒，避免触发 B 站限流
