# 🤖 Jacky's Claude Code Skills

自定义 Claude Code 技能集合，用于增强 AI 辅助开发能力。

## 包含技能

### long-running-agent

跨会话开发项目的 Agent 行为规范。确保在记忆重置后能正确恢复上下文并有效继续工作。

**触发场景**：
- "continue development"
- "resume work"
- 项目包含 `agent-state/` 或 `memory-bank/` 目录

**核心特性**：
- Memory Bank 结构化记录（progress.md、activeContext.md、feature-list.json）
- 标准化启动和结束流程
- 严格的验证和文档规范

### github-repo-publish

将本地代码仓库一键发布到 GitHub，自动处理 README、About 信息、Release 发布等。

**触发场景**：
- "发布到 GitHub"
- "push 到远端"
- "创建 GitHub 仓库"
- "release extension"

**核心特性**：
- 最小化交互（最多一次确认仓库名）
- 自动生成中英双语 README
- 自动设置 About 信息（description、topics）
- VSCode 插件自动打包 .vsix 并发布到 Release
- 智能处理远程仓库已存在等边缘情况

## 如何使用

将技能克隆到你的 Claude Code skills 目录：

```bash
# 克隆仓库
git clone https://github.com/wangjs-jacky/jacky-skills.git

# 复制需要的技能到 Claude Code skills 目录
cp -r jacky-skills/long-running-agent ~/.claude/skills/
```

或者直接在 `~/.claude/skills/` 目录下克隆：

```bash
cd ~/.claude/skills/
git clone https://github.com/wangjs-jacky/jacky-skills.git
```

## 技能开发规范

每个技能包含一个 `SKILL.md` 文件：

```markdown
---
name: skill-name
description: 触发条件和用途描述
---

# Skill Name

技能的详细说明和行为规范...
```

## License

MIT
