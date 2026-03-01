# Jacky's Claude Code Skills

[![Stars](https://img.shields.io/github/stars/wangjs-jacky/jacky-skills?style=flat)](https://github.com/wangjs-jacky/jacky-skills/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Claude Code](https://img.shields.io/badge/-Claude%20Code-8A2BE2?logo=claude&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

**实用的 Claude Code 技能集合，提升 AI 辅助开发效率。**

---

## 技能列表

### 视频处理

| 技能 | 触发场景 | 说明 |
|------|----------|------|
| [bilibili-to-obsidian](./bilibili-to-obsidian) | B站视频提取字幕、保存到Obsidian | 从B站视频提取文案并整理到Obsidian，支持按作者分类 |
| [bilibili-batch](./bilibili-batch) | 批量提取UP主视频、Top N视频 | 从B站UP主空间批量提取视频字幕，支持按播放量/收藏数排序 |
| [video-to-text](./video-to-text) | 从视频提取文字、生成字幕 | 从视频平台提取文案（支持抖音等） |
| [m3u8-dl](./m3u8-dl) | 下载视频、m3u8链接 | 下载M3U8/HLS视频流，支持AES-128解密、代理、时长限制 |
| [fix-neat-video](./fix-neat-video) | 修复.mp4.ts文件、Neat Download问题 | 修复Neat Download下载的分段视频文件 |

### 开发工具

| 技能 | 触发场景 | 说明 |
|------|----------|------|
| [github-repo-publish](./github-repo-publish) | 发布到GitHub、push到远端、release extension | 一键发布仓库到GitHub，自动处理README、About、Release |
| [long-running-agent](./long-running-agent) | continue development、resume work | 跨会话开发项目的Agent行为规范，支持Memory Bank |
| [creator-skills](./creator-skills) | 创建新skill、管理skills目录 | 创建自定义skill并通过j-skills工具管理 |

### 监控与调试

| 技能 | 触发场景 | 说明 |
|------|----------|------|
| [claude-monitor](./claude-monitor) | Claude Code在做什么、监控会话状态 | 监控所有Claude Code会话，悬浮窗通知等待输入 |
| [agent-browser-troubleshooting](./agent-browser-troubleshooting) | agent-browser失败、浏览器无法启动 | agent-browser故障排查指南 |
| [tauri-troubleshooting](./tauri-troubleshooting) | Tauri插件权限、命令调用失败 | Tauri v2开发中常见问题的故障排查 |

### 工具集成

| 技能 | 触发场景 | 说明 |
|------|----------|------|
| [j-skills](./j-skills) | 管理skills、链接本地skills | Agent Skills管理CLI工具，支持35+个AI编码助手 |
| [link-all-skills](./link-all-skills) | 链接所有skills、批量链接 | 将项目下所有skills链接到全局注册表 |

---

## 快速开始

### 方式一：使用 j-skills 工具（推荐）

```bash
# 1. 安装 j-skills
npm install -g j-skills

# 2. 克隆仓库
git clone https://github.com/wangjs-jacky/jacky-skills.git
cd jacky-skills

# 3. 链接所有 skills
j-skills link --all

# 4. 安装需要的 skill 到全局
j-skills install <skill-name> -g
```

### 方式二：手动安装

```bash
# 克隆仓库
git clone https://github.com/wangjs-jacky/jacky-skills.git

# 复制需要的 skill 到 Claude Code skills 目录
cp -r jacky-skills/<skill-name> ~/.claude/skills/
```

### 方式三：直接在 skills 目录克隆

```bash
cd ~/.claude/skills/
git clone https://github.com/wangjs-jacky/jacky-skills.git
```

---

## 目录结构

```
jacky-skills/
├── bilibili-to-obsidian/      # B站字幕提取到Obsidian
├── bilibili-batch/            # B站批量提取
├── video-to-text/             # 视频转文字
├── m3u8-dl/                   # M3U8视频下载
├── fix-neat-video/            # 修复Neat Download视频
├── github-repo-publish/       # GitHub仓库发布
├── long-running-agent/        # 跨会话开发Agent
├── claude-monitor/            # Claude Code监控
├── agent-browser-troubleshooting/  # agent-browser故障排查
├── tauri-troubleshooting/     # Tauri故障排查
├── creator-skills/            # Skill创建工具
├── j-skills/                  # Skills管理CLI
└── link-all-skills/           # 批量链接工具
```

---

## Skill 开发规范

每个 skill 包含一个 `SKILL.md` 文件：

```markdown
---
name: skill-name
description: 触发条件和用途描述
argument-hint: <可选参数提示>  # 可选
---

# Skill Name

技能的详细说明和行为规范...
```

### 创建新 Skill

```bash
# 使用 creator-skills skill
/creator-skills

# 或手动创建
mkdir my-new-skill
# 创建 SKILL.md 文件...
j-skills link my-new-skill
j-skills install my-new-skill -g
```

---

## 常用命令

| 操作 | 命令 |
|------|------|
| 链接所有 skills | `j-skills link --all` |
| 链接单个 skill | `j-skills link <skill-name>` |
| 全局安装 | `j-skills install <name> -g` |
| 列出已链接 | `j-skills link --list` |
| 列出已安装 | `j-skills list --all` |
| 卸载 | `j-skills uninstall <name> -g` |

---

## 相关链接

- **GitHub**: https://github.com/wangjs-jacky/jacky-skills
- **npm Organization**: [@wangjs-jacky](https://www.npmjs.com/org/wangjs-jacky)
- **j-skills CLI**: [jacky-skills-package](https://github.com/wangjs-jacky/jacky-skills-package)

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 许可证

[MIT](LICENSE) - 自由使用，按需修改。
