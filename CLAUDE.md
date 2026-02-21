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
├── <skill-name>/                # skill 目录
│   └── SKILL.md                 # skill 定义文件
└── ...
```

## j-skills 工作流程

当新增或更新 skill 时，按以下步骤操作：

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

使用 `j-skills link` 将 skill 软链接到全局注册表：

```bash
# 在 skill 目录下执行
cd <skill-name>
j-skills link

# 或指定路径
j-skills link /path/to/skill
```

### 3. 安装到环境

将 skill 安装到 Claude Code（默认环境）：

```bash
# 全局安装（推荐，对所有项目生效）
j-skills install <skill-name> -g

# 安装到多个环境
j-skills install <skill-name> -g --env claude-code,cursor
```

### 常用命令

```bash
# 列出已链接的 skills
j-skills link --list

# 列出已安装的 skills
j-skills list --all

# 卸载 skill
j-skills uninstall <skill-name> -g

# 查看配置
j-skills config
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

## 软链接优势

- 磁盘占用极低
- 支持热更新
- 修改本地文件立即生效
