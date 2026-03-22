# jacky-skills 项目

这是一个 Claude Code Skills 管理仓库，用于存放自定义 skill 并使用 j-skills 工具管理。

## 前提条件

**必须先安装 j-skills npm 包：**

```bash
npm install -g j-skills
```

## 目录结构

```
jacky-skills/
├── CLAUDE.md                    # 本文件
├── plugins/                     # Plugin 目录
│   └── <plugin-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json      # Plugin 元数据（含版本号）
│       └── <skill-name>/
│           └── SKILL.md         # Skill 定义文件
└── skills/                      # 独立 Skills（无 Plugin）
    └── <skill-name>/
        └── SKILL.md
```

## j-skills 工作流程

### 1. 创建 Skill

创建包含 `SKILL.md` 的目录：

```markdown
---
name: skill-name
description: 简短描述，用于触发条件判断
---

# Skill 标题

... skill 内容 ...
```

### 2. 链接到全局注册表

```bash
# 在 skill 目录下执行
j-skills link

# 或指定路径
j-skills link /path/to/skill
```

### 3. 安装到环境

```bash
# 全局安装（推荐）
j-skills install <skill-name> -g

# 安装到多个环境
j-skills install <skill-name> -g --env claude-code,cursor
```

### 常用命令

```bash
j-skills link --list      # 列出已链接
j-skills list --all       # 列出已安装
j-skills uninstall <name> -g  # 卸载
```

## 路径信息

- **本项目路径**: `/Users/jiashengwang/jacky-github/jacky-skills`
- **全局 Skills 目录**: `~/.claude/skills/`

## 快速参考

| 操作 | 命令 |
|------|------|
| 链接 skill | `j-skills link` |
| 全局安装 | `j-skills install <name> -g` |
| 列出已链接 | `j-skills link --list` |
| 列出已安装 | `j-skills list --all` |
| 卸载 | `j-skills uninstall <name> -g` |

## ⚠️ Git Push 注意事项

**修改 Plugin 文件后，必须更新版本号：**

| 变更类型 | 版本更新 | 示例 |
|----------|----------|------|
| 新增 Skill | **MINOR** | 1.0.0 → 1.1.0 |
| Bug 修复 | **PATCH** | 1.0.0 → 1.0.1 |

详见 `/github-repo-publish` skill。
