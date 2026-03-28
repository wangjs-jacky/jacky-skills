---
name: j-skills
description: "CLI tool for managing Agent Skills - link, install, and manage skills across 35+ coding agent environments. Use when user needs to manage skills, link local skills, or install skills to environments."
---

<role>j-skills CLI 管理助手，负责在多 Agent 环境中执行 skill 的链接、安装、卸载与状态核验。</role>
<purpose>统一 skill 生命周期操作入口，降低多环境分发与排障成本，优先输出可解析结果。</purpose>
<trigger>

```text
触发词：
- j-skills
- link skill / install skill / uninstall skill
- 管理 skills
- 批量安装到多个环境
- 查看已安装 skills

示例：
- “用 j-skills 把这个 skill 安装到 claude-code 和 cursor”
- “帮我查下全局和项目都装了哪些 skills”
```

</trigger>
<gsd:workflow xmlns:gsd="urn:gsd:workflow">
  <gsd:meta>tool=j-skills; mode=project|global; output_preference=json</gsd:meta>
  <gsd:goal>在正确作用域与目标环境中完成 skill 管理动作，并提供可审计执行结果。</gsd:goal>
  <gsd:phase>识别用户意图与作用域（项目/全局），必要时先询问范围。</gsd:phase>
  <gsd:phase>执行 `link/install/uninstall/list/config` 命令，优先附带 `--json`。</gsd:phase>
  <gsd:phase>核验安装状态与路径映射，输出下一步操作建议。</gsd:phase>
</gsd:workflow>

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

## 发布流程

> ⚠️ **重要**: 修改 j-skills 源码后，必须执行以下步骤才能让用户使用新版本！

### Step 1: 检查 npm 登录状态

```bash
npm whoami
```

如果未登录，执行：
```bash
npm login
```

### Step 2: 更新版本号

```bash
# 在 package.json 中更新版本号
# 例如: 0.3.0 → 0.3.1 (PATCH) 或 0.4.0 (MINOR)
```

### Step 3: 发布到 npm

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills-package
npm publish
```

### Step 4: 通知用户更新

```bash
# 提示用户更新全局安装
npm update -g @wangjs-jacky/j-skills
```

---

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

## 发布流程

> ⚠️ **重要：修改 j-skills 源码后，必须发布到 npm 才能生效！**

当代码修改完成并测试通过后，需要执行以下步骤：

### Step 1: 更新版本号

```bash
# 在 package.json 中更新版本号
# PATCH: Bug 修复 (0.3.0 → 0.3.1)
# MINOR: 新功能 (0.3.0 → 0.4.0)
# MAJOR: 破坏性变更 (0.3.0 → 1.0.0)
```

### Step 2: 发布到 npm

```bash
# 1. 先登录 npm（如果未登录）
npm login

# 2. 进入项目目录并发布
cd /Users/jiashengwang/jacky-github/jacky-skills-package
npm publish
```

### Step 3: 通知用户更新

```bash
# 提示用户更新全局安装
npm update -g @wangjs-jacky/j-skills
```

---

## 常见问题

**Q: skill 修改后不生效？**
A: 确保使用 `j-skills link` 链接的软链接，而不是直接复制。

**Q: 如何查看 skill 已安装到哪些环境？**
A: 使用 `j-skills list --all --json` 查看完整安装信息。

**Q: 支持哪些 agent？**
A: 运行 `j-skills list --help` 查看完整列表，或参考官方文档。

**Q: npm publish 报错 ENEEDAUTH？**
A: 需要先执行 `npm login` 登录 npm 账号。

---

## ⚠️ 代码修改后的发布提醒

> **重要**: 当你修改了 j-skills 源代码后，必须执行以下操作才能让更改生效：

### 必须执行的步骤

| 步骤 | 命令 | 说明 |
|------|------|------|
| 1️⃣ 登录 npm | `npm login` | 只需执行一次 |
| 2️⃣ 更新版本 | 编辑 `package.json` | PATCH/MINOR/MAJOR |
| 3️⃣ 发布 | `cd /Users/jiashengwang/jacky-github/jacky-skills-package && npm publish` | 发布到 npm |
| 4️⃣ 更新本地 | `npm update -g @wangjs-jacky/j-skills` | 更新全局安装 |

### 快速命令

```bash
# 一键发布流程
cd /Users/jiashengwang/jacky-github/jacky-skills-package
npm login  # 如果已登录可跳过
npm publish
npm update -g @wangjs-jacky/j-skills
```

### 如果用户未登录 npm

执行 `npm login` 后按提示输入：
- Username
- Password
- Email
- OTP (如果启用了两步验证)
