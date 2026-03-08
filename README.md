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

### 方式一：按需安装单个 Plugin（推荐）

```bash
# 安装视频处理工具
npx skills add wangjs-jacky/jacky-skills/plugins/video-processing

# 安装开发工具
npx skills add wangjs-jacky/jacky-skills/plugins/dev-tools

# 安装 Obsidian 工具
npx skills add wangjs-jacky/jacky-skills/plugins/obsidian-tools
```

### 方式二：通过 Claude Code 插件市场安装

```bash
# 添加市场
/plugin marketplace add wangjs-jacky/jacky-skills

# 安装单个 Plugin
/plugin install video-processing@jacky-skills
/plugin install dev-tools@jacky-skills

# 启用/禁用
/plugin enable video-processing@jacky-skills
/plugin disable dev-tools@jacky-skills
```

### 方式三：配置文件控制

在 `settings.json` 中启用/禁用 Plugin：

```json
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

### 方式四：从 skills.sh 安装

[![skills.sh](https://img.shields.io/badge/skills.sh-Open%20Skills%20Ecosystem-blue)](https://skills.sh)

```bash
# 交互式安装
npx skills add

# 安装特定 Plugin
npx skills add wangjs-jacky/jacky-skills/plugins/video-processing
```

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
