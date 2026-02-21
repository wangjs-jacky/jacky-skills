---
name: j-skills
description: CLI tool for managing Agent Skills - link, install, and manage skills across 35+ coding agent environments. Use when user needs to manage skills, link local skills, or install skills to environments.
---

# j-skills

j-skills 是一个用于管理 Agent Skills 的命令行工具，支持 Claude Code、Cursor、OpenCode 等 35+ 个主流 AI 编码助手。

## 前提条件

**必须先安装 j-skills npm 包：**

```bash
npm install -g j-skills
```

## 功能特性

- **多环境支持** - 支持 35+ 个主流 AI 编码助手
- **软链接管理** - 使用符号链接实现本地开发热更新
- **统一管理** - 一条命令安装到多个环境
- **交互式界面** - 友好的命令行交互体验
- **结构化输出** - 所有命令支持 `--json` 输出，便于 LLM 解析

## 支持的 Agents

Claude Code, Cursor, OpenCode, Cline, Continue, Codex, GitHub Copilot, Augment, Roo Code, Windsurf, Amp, Kimi CLI, Replit, Antigravity, OpenClaw, CodeBuddy, Command Code, Crush, Droid, Gemini CLI, Goose, Junie, iFlow CLI, Kilo Code, Kiro CLI, Kode, MCPJam, Mistral Vibe, Mux, OpenHands, Pi, Qoder, Qwen Code, Trae, Trae CN, Zencoder, Neovate, Pochi, AdaL

## 命令

### link - 链接本地 skill

将本地 skill 目录链接到全局注册表，使用软链接实现热更新。

```bash
# 链接当前目录（必须包含 skill.md）
j-skills link

# 链接指定目录
j-skills link /path/to/skill

# 列出已链接的 skills
j-skills link --list

# 取消链接
j-skills link --unlink <skill-name>

# JSON 输出（LLM 友好）
j-skills link --list --json
```

JSON 输出示例：
```json
{
  "skills": [
    {
      "name": "my-skill",
      "path": "/Users/dev/my-skill",
      "source": "linked",
      "installedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### install - 安装 skill

将 skill 安装到指定环境的**项目**或**全局**目录。不传 `--global` 时为当前项目，传 `--global` 时为用户全局（对所有项目生效）。

```bash
# 当前项目安装（默认）
j-skills install <skill-name> --env claude-code,cursor

# 全局安装
j-skills install <skill-name> --global --env claude-code,cursor

# 交互式安装（会提示选择项目/全局与环境）
j-skills install <skill-name>

# JSON 输出
j-skills install <skill-name> --json
```

### uninstall - 卸载 skill

从已安装的环境中移除 skill。不传 `--global` 则只卸当前项目，传 `--global` 则只卸全局；范围未明确时需先引导用户选择（同 install）。

```bash
# 当前项目卸载
j-skills uninstall <skill-name> --env claude-code,cursor

# 全局卸载
j-skills uninstall <skill-name> --global --yes

# 交互式卸载
j-skills uninstall <skill-name>

# JSON 输出
j-skills uninstall <skill-name> --json
```

### list - 列出 skills

查看已安装的 skills。

```bash
# 列出项目级 skills（默认）
j-skills list

# 列出全局 skills
j-skills list --global

# 列出所有 skills（项目 + 全局）
j-skills list --all

# 搜索 skills
j-skills list --search <keyword>

# JSON 输出（LLM 友好）
j-skills list --json
```

JSON 输出示例：
```json
{
  "project": {
    "frontend-design": {
      "name": "frontend-design",
      "environments": [
        { "name": "claude-code", "label": "Claude Code", "path": ".claude/skills/frontend-design" },
        { "name": "cursor", "label": "Cursor", "path": ".cursor/skills/frontend-design" }
      ]
    }
  },
  "global": {
    "web-design-guidelines": {
      "name": "web-design-guidelines",
      "environments": [
        { "name": "claude-code", "label": "Claude Code", "path": "~/.claude/skills/web-design-guidelines" }
      ]
    }
  }
}
```

### config - 配置管理

管理全局配置。

```bash
# 查看配置
j-skills config

# JSON 输出
j-skills config --json
```

## 路径规范

j-skills 遵循 [Vercel Skills 规范](https://github.com/vercel-labs/skills#available-agents)：

| Agent | 项目路径 | 全局路径 |
|-------|---------|----------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| OpenCode | `.agents/skills/` | `~/.config/opencode/skills/` |
| Cline | `.cline/skills/` | `~/.cline/skills/` |

## 工作流程

1. **创建 Skill** - 创建包含 `skill.md` 的目录
2. **链接本地** - `j-skills link`
3. **安装到环境** - `j-skills install <skill-name>`
4. **热更新开发** - 修改本地文件，立即生效

## 软链接优势

- 磁盘占用极低
- 支持热更新
- 修改本地文件立即生效

## 使用建议

### 给 LLM 的建议

当用户询问 j-skills 相关问题时：

1. **安装/卸载范围**：若用户未明确说「当前项目」或「全局」，先引导用户选择再执行：
   - **当前项目**：仅当前仓库生效，不加 `--global`
   - **全局**：对所有项目生效，加 `--global`
2. 使用 `--json` 选项获取结构化输出
3. 优先使用 `j-skills list --all` 查看完整状态
4. 安装前先用 `j-skills link --list --json` 检查已链接的 skills
5. 遇到问题时，让用户提供 `--json` 输出以便诊断

### 给开发者的建议

1. 开发阶段使用 `link` 命令实现热更新
2. 生产环境可以考虑复制而非软链接
3. 使用 `--json` 输出便于 CI/CD 集成

## 常见问题

**Q: skill 修改后不生效？**
A: 确保使用 `j-skills link` 链接的软链接，而不是直接复制。

**Q: 如何查看 skill 已安装到哪些环境？**
A: 使用 `j-skills list --all --json` 查看完整安装信息。

**Q: 支持哪些 agent？**
A: 运行 `j-skills list --help` 查看完整列表，或参考官方文档。
