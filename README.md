# Jacky's Claude Code Skills

[![Stars](https://img.shields.io/github/stars/wangjs-jacky/jacky-skills?style=flat)](https://github.com/wangjs-jacky/jacky-skills/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Claude Code](https://img.shields.io/badge/-Claude%20Code-8A2BE2?logo=claude&logoColor=white)

**实用的 Claude Code 技能集合，模块化设计，按需安装。**

---

## Plugin 模块

本项目采用**多 Plugin 架构**，每个 Plugin 包含一组相关 Skills，可独立安装和启用。

| Plugin | 图标 | 说明 | 包含 Skills |
|--------|------|------|-------------|
| [video-processing](./plugins/video-processing) | 🎬 | 视频处理 | bilibili-to-obsidian, bilibili-batch, video-to-text, m3u8-dl, fix-neat-video |
| [dev-tools](./plugins/dev-tools) | 🛠️ | 开发工具 | github-repo-publish, long-running-agent, creator-skills, skill-researcher |
| [obsidian-tools](./plugins/obsidian-tools) | 📝 | Obsidian 工具 | config-obsidian, ob-summary |
| [troubleshooting](./plugins/troubleshooting) | 🔍 | 故障排查 | agent-browser-troubleshooting, tauri-troubleshooting |
| [skills-management](./plugins/skills-management) | 📦 | Skills 管理 | j-skills, link-all-skills |
| [dev-advanced](./plugins/dev-advanced) | 🚀 | 高级开发 | multi-agent, web-to-tauri-migration-loop |

---

## 快速开始

### 方式一：从 skills.sh 安装（推荐）

[![skills.sh](https://img.shields.io/badge/skills.sh-Open%20Skills%20Ecosystem-blue)](https://skills.sh)

```bash
# 交互式安装
npx skills add

# 安装特定 Plugin
npx skills add wangjs-jacky/jacky-skills/plugins/video-processing
npx skills add wangjs-jacky/jacky-skills/plugins/dev-tools
npx skills add wangjs-jacky/jacky-skills/plugins/obsidian-tools
```

### 方式二：通过 Claude Code 插件市场安装

```bash
# 添加市场
/plugin marketplace add wangjs-jacky/jacky-skills

# 安装单个 Plugin
/plugin install video-processing@jacky-skills
/plugin install dev-tools@jacky-skills

# 启用/禁用 Plugin（命令会自动修改 settings.json）
/plugin enable video-processing@jacky-skills
/plugin disable dev-tools@jacky-skills
```

### 方式三：本地开发模式（j-skills）

适合需要修改 skills 源码的开发者，使用软链接实现热更新。

```bash
# 1. 克隆仓库
git clone https://github.com/wangjs-jacky/jacky-skills.git
cd jacky-skills

# 2. 安装 j-skills CLI
npm install -g j-skills

# 3. 链接所有 skills 到全局注册表
j-skills link --all

# 4. 安装到 Claude Code（全局）
j-skills install video-processing -g

# 常用命令
j-skills link --list      # 查看已链接
j-skills list --all       # 查看已安装
j-skills uninstall <name> -g  # 卸载
```

---

## 安装方式对比

| 方式 | 工具 | 适用场景 | 特点 |
|------|------|----------|------|
| **skills.sh** | `npx skills add` | 跨 Agent 使用 | 一键安装，支持 35+ Agent |
| **/plugin** | Claude Code 命令 | 仅 Claude Code | 官方原生支持，操作简单 |
| **j-skills** | CLI 工具 | 本地开发修改 | 软链接热更新，修改即生效 |

---

## 配置说明

### 配置文件位置

`/plugin enable` 和 `/plugin disable` 命令会自动修改 `settings.json` 中的 `enabledPlugins` 字段。

| 作用范围 | 文件路径 | 说明 |
|----------|----------|------|
| **全局** | `~/.claude/settings.json` | 所有项目生效 |
| **项目共享** | `.claude/settings.json` | 当前项目生效，提交到 git |
| **项目本地** | `.claude/settings.local.json` | 当前项目生效，不提交 git |

### 优先级

```
项目本地 > 项目共享 > 全局
```

### 手动配置示例

```json
// ~/.claude/settings.json 或 .claude/settings.json
{
  "enabledPlugins": {
    "video-processing@jacky-skills": true,
    "dev-tools@jacky-skills": true,
    "obsidian-tools@jacky-skills": false,
    "troubleshooting@jacky-skills": true,
    "skills-management@jacky-skills": true,
    "dev-advanced@jacky-skills": false
  }
}
```

### 验证配置

```bash
# 查看当前生效的配置和 Plugin 状态
/status

# 查看已安装的 Plugin
/plugin list
```

---

## 版本管理

### 更新到最新版本

```bash
# skills.sh 方式 - 检查更新
npx skills check

# skills.sh 方式 - 更新所有已安装的 skills
npx skills update

# /plugin 方式 - 更新特定 Plugin
/plugin update video-processing@jacky-skills

# j-skills 方式 - 拉取最新代码
cd jacky-skills && git pull
j-skills link --all
```

### 安装特定版本

```bash
# skills.sh 方式 - 指定 Git ref（branch/tag/commit）
npx skills add wangjs-jacky/jacky-skills/plugins/video-processing@v1.0.0
npx skills add wangjs-jacky/jacky-skills/plugins/video-processing@main
npx skills add wangjs-jacky/jacky-skills/plugins/video-processing@abc123

# j-skills 方式 - 切换到特定版本
cd jacky-skills
git checkout v1.0.0
j-skills link --all
j-skills install video-processing -g
```

### 版本管理对比

| 方式 | 更新命令 | 安装特定版本 |
|------|----------|--------------|
| **skills.sh** | `npx skills update` | `@<ref>` 后缀，如 `@v1.0.0` |
| **/plugin** | `/plugin update <name>` | 暂不支持 |
| **j-skills** | `git pull` + `link --all` | `git checkout <ref>` |

---

## Skills 详情

### 🎬 Video Processing

| Skill | 触发场景 | 说明 |
|-------|----------|------|
| bilibili-to-obsidian | B站视频提取字幕 | 从B站视频提取文案并整理到Obsidian |
| bilibili-batch | 批量提取UP主视频 | 从B站UP主空间批量提取视频字幕 |
| video-to-text | 从视频提取文字 | 从视频平台提取文案（支持抖音等） |
| m3u8-dl | 下载视频、m3u8链接 | 下载M3U8/HLS视频流 |
| fix-neat-video | 修复.mp4.ts文件 | 修复Neat Download下载的分段视频 |

### 🛠️ Dev Tools

| Skill | 触发场景 | 说明 |
|-------|----------|------|
| github-repo-publish | 发布到GitHub | 一键发布仓库到GitHub |
| long-running-agent | continue development | 跨会话开发项目 |
| creator-skills | 创建新skill | 创建自定义skill |
| skill-researcher | 研究skills | 研究、对比、分析Skills项目 |

### 📝 Obsidian Tools

| Skill | 触发场景 | 说明 |
|-------|----------|------|
| config-obsidian | 配置Obsidian同步 | 配置Obsidian同步环境 |
| ob-summary | Obsidian概览 | 知识库概览总结 |

### 🔍 Troubleshooting

| Skill | 触发场景 | 说明 |
|-------|----------|------|
| agent-browser-troubleshooting | agent-browser失败 | agent-browser故障排查 |
| tauri-troubleshooting | Tauri插件权限 | Tauri v2故障排查 |

### 📦 Skills Management

| Skill | 触发场景 | 说明 |
|-------|----------|------|
| j-skills | 管理skills | Agent Skills管理CLI工具 |
| link-all-skills | 链接所有skills | 将所有skills链接到全局注册表 |

### 🚀 Dev Advanced

| Skill | 触发场景 | 说明 |
|-------|----------|------|
| multi-agent | 多Agent协作 | 并行调用多个AI模型 |
| web-to-tauri-migration-loop | Web到Tauri迁移 | Web到Tauri v2迁移工作流 |

---

## 目录结构

```
jacky-skills/
├── .claude-plugin/           # 根插件配置
│   ├── plugin.json           # 元插件清单
│   └── marketplace.json      # 市场配置
├── plugins/                  # 子插件目录
│   ├── video-processing/     # 视频处理
│   │   ├── .claude-plugin/
│   │   │   ├── plugin.json
│   │   │   └── marketplace.json
│   │   └── skills/
│   ├── dev-tools/            # 开发工具
│   ├── obsidian-tools/       # Obsidian工具
│   ├── troubleshooting/      # 故障排查
│   ├── skills-management/    # Skills管理
│   └── dev-advanced/         # 高级开发
├── install.sh                # 一键安装脚本
├── CLAUDE.md                 # 项目配置
└── README.md                 # 本文件
```

---

## 相关链接

- **GitHub**: https://github.com/wangjs-jacky/jacky-skills
- **skills.sh**: https://skills.sh (Open Agent Skills Ecosystem)
- **npm Organization**: [@wangjs-jacky](https://www.npmjs.com/org/wangjs-jacky)

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 许可证

[MIT](LICENSE) - 自由使用，按需修改。
