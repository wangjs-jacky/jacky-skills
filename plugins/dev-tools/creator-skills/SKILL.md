---
name: creator-skills
description: 用于创建和管理自定义 skills。当用户想要创建新 skill、管理 skills 目录、或初始化 skills 工作区时触发此 skill。
---

# Skill 创建与管理

此 skill 用于创建自定义 skill 并通过 j-skills 工具管理它们。

## 前提条件

**必须先安装 j-skills npm 包：**

```bash
npm install -g j-skills
```

## 扩展说明

此 skill 基于 [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) 的 skill-creator 封装，添加了 j-skills 集成功能。

详细的 upstream 流程说明请参考 `references/upstream-guide.md`。

## 工作流程

### 步骤 1：确认 Skills 工作区

首次使用时，需要确认一个统一的目录来管理所有 skills。

**检查当前目录是否为 skills 工作区：**

```bash
# 检查当前目录是否包含 SKILL.md（说明在某个 skill 目录内）
ls SKILL.md 2>/dev/null

# 检查当前目录是否有多个 skill 子目录
find . -maxdepth 2 -name "SKILL.md" -type f
```

**如果不是 skills 工作区，引导用户选择：**

1. 询问用户是否要在当前目录创建 skills 工作区
2. 或者询问用户已有的 skills 工作区路径

**推荐的目录结构：**

```
<skills-workspace>/
├── CLAUDE.md           # 项目说明（可选）
├── skill-1/
│   └── SKILL.md
├── skill-2/
│   └── SKILL.md
└── ...
```

### 步骤 2：创建新 Skill

在 skills 工作区中创建新 skill 目录和 SKILL.md 文件。

**创建 skill 目录：**

```bash
mkdir -p <skills-workspace>/<skill-name>
```

**SKILL.md 模板：**

```markdown
---
name: <skill-name>
description: <简短描述，说明何时触发此 skill>
---

# <Skill 标题>

<详细说明 skill 的功能和使用方法>

## 使用场景

- <场景 1>
- <场景 2>

## 执行流程

### 1. <步骤 1>

<详细说明>

### 2. <步骤 2>

<详细说明>
```

**目录结构示例：**

```
<skill-name>/
├── SKILL.md           # 必需
├── scripts/           # 可选：脚本文件
├── references/        # 可选：参考文档
└── assets/            # 可选：资源文件
```

### 步骤 3：链接到全局注册表

使用 j-skills 将新创建的 skill 链接到全局注册表。

**链接单个 skill：**

```bash
cd <skills-workspace>/<skill-name>
j-skills link
```

**或指定完整路径：**

```bash
j-skills link <skills-workspace>/<skill-name>
```

### 步骤 4：安装到环境

将已链接的 skill 安装到目标环境。

**全局安装（推荐）：**

```bash
j-skills install <skill-name> -g --env claude-code
```

**安装到多个环境：**

```bash
j-skills install <skill-name> -g --env claude-code,cursor
```

### 步骤 5：验证安装

**检查已链接的 skills：**

```bash
j-skills link --list
```

**检查已安装的 skills：**

```bash
j-skills list -g
```

## 快速命令

### 批量链接所有 Skills

如果 skills 工作区有多个 skills，可以批量链接：

```bash
j-skills link --all
```

### 查看所有 Skills 状态

```bash
j-skills list --all --json
```

## 最佳实践

1. **统一管理** - 将所有自定义 skills 放在同一个工作区目录
2. **命名规范** - skill 名称使用小写字母和连字符，如 `my-skill`
3. **描述清晰** - description 要准确说明触发条件
4. **使用软链接** - 通过 j-skills link 实现热更新开发

## 常见问题

**Q: 修改 skill 后不生效？**
A: 确保使用 `j-skills link` 链接，而非直接复制文件。

**Q: 如何删除 skill？**
A: 先卸载 `j-skills uninstall <name> -g`，再取消链接 `j-skills link --unlink <name>`。

**Q: skill 会影响其他项目吗？**
A: 全局安装（`-g`）会影响所有项目；项目级安装仅影响当前项目。
