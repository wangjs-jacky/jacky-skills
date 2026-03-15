# Enhanced find-skills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 增强 find-skills skill，添加可信赖 marketplace 清单管理和优先搜索功能

**Architecture:** 在现有 find-skills 基础上添加 marketplaces.json 配置文件，实现优先从预定义仓库搜索的能力，同时保持向后兼容

**Tech Stack:** Markdown (SKILL.md), JSON (配置文件), MCP Tools (zread, web-search), skills.sh CLI

---

## Task 1: 创建 marketplaces.json 配置文件

**Files:**
- Create: `/Users/jiashengwang/.claude/skills/find-skills/marketplaces.json`

**Step 1: 创建配置文件骨架**

创建文件 `marketplaces.json`：

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-09T00:00:00Z",
  "marketplaces": []
}
```

**Step 2: 验证文件格式**

运行：
```bash
cat ~/.claude/skills/find-skills/marketplaces.json | jq .
```

预期输出：格式正确的 JSON

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add marketplaces.json
git commit -m "feat: add marketplaces.json skeleton"
```

---

## Task 2: 添加初始 marketplace 数据

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/marketplaces.json`

**Step 1: 添加 Anthropic 官方仓库**

更新 `marketplaces.json`，在 `marketplaces` 数组中添加：

```json
{
  "id": "anthropics-skills",
  "name": "Anthropic Official Skills",
  "repository": "anthropics/skills",
  "description": "Anthropic 官方维护的 skill 仓库，包含 mcp-builder、skill-creator 等核心技能",
  "category": "official",
  "trustLevel": "high",
  "metadata": {
    "stars": 66600,
    "lastUpdated": "2026-03-01",
    "maintainer": "anthropics",
    "url": "https://github.com/anthropics/skills"
  },
  "skills": []
}
```

**Step 2: 验证 JSON 格式**

运行：
```bash
cat ~/.claude/skills/find-skills/marketplaces.json | jq '.marketplaces | length'
```

预期输出：`1`

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add marketplaces.json
git commit -m "feat: add anthropics/skills to marketplace list"
```

---

## Task 3: 添加社区 marketplace

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/marketplaces.json`

**Step 1: 添加 3 个社区 marketplace**

在 `marketplaces` 数组中添加：

```json
{
  "id": "everything-claude-code",
  "name": "Everything Claude Code",
  "repository": "affaan-m/everything-claude-code",
  "description": "最大的 Claude Code 资源集合，包含 100+ skills 和工具",
  "category": "community",
  "trustLevel": "medium",
  "metadata": {
    "stars": 40800,
    "lastUpdated": "2026-03-05",
    "maintainer": "affaan-m",
    "url": "https://github.com/affaan-m/everything-claude-code"
  },
  "skills": []
},
{
  "id": "awesome-claude-skills",
  "name": "Awesome Claude Skills",
  "repository": "ComposioHQ/awesome-claude-skills",
  "description": "Composio 维护的精选 Claude Skills 列表",
  "category": "community",
  "trustLevel": "medium",
  "metadata": {
    "stars": 19900,
    "lastUpdated": "2026-02-28",
    "maintainer": "ComposioHQ",
    "url": "https://github.com/ComposioHQ/awesome-claude-skills"
  },
  "skills": []
},
{
  "id": "jacky-skills",
  "name": "Jacky's Skills",
  "repository": "wangjs-jacky/jacky-skills",
  "description": "个人维护的 skills 集合，包含视频处理、Obsidian 工具等",
  "category": "personal",
  "trustLevel": "medium",
  "metadata": {
    "stars": 1200,
    "lastUpdated": "2026-03-08",
    "maintainer": "wangjs-jacky",
    "url": "https://github.com/wangjs-jacky/jacky-skills"
  },
  "skills": []
}
```

**Step 2: 验证 JSON 格式**

运行：
```bash
cat ~/.claude/skills/find-skills/marketplaces.json | jq '.marketplaces | length'
```

预期输出：`4`

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add marketplaces.json
git commit -m "feat: add community marketplaces (everything-claude-code, awesome-claude-skills, jacky-skills)"
```

---

## Task 4: 更新 SKILL.md - 添加配置文件说明

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/SKILL.md`

**Step 1: 在 "What is the Skills CLI?" 部分后添加新章节**

在 SKILL.md 中找到 `## What is the Skills CLI?` 部分，在其后添加：

```markdown
## Trusted Marketplaces

This skill maintains a curated list of trusted marketplaces in `marketplaces.json`. When you search for skills, we prioritize results from these trusted sources.

**Current trusted marketplaces:**

| Marketplace | Stars | Category | Description |
|-------------|-------|----------|-------------|
| Anthropic Official | 66.6k | Official | Official Anthropic skills |
| Everything Claude Code | 40.8k | Community | Largest resource collection |
| Awesome Claude Skills | 19.9k | Community | Curated skill list |
| Jacky's Skills | 1.2k | Personal | Custom skills collection |

**Why trusted marketplaces?**

- ✅ Quality assurance - vetted sources
- ✅ Better discoverability - organized collections
- ✅ Security - reduced risk of malicious skills
- ✅ Community-driven - popular and well-maintained

**Configuration file location:**

```bash
~/.claude/skills/find-skills/marketplaces.json
```
```

**Step 2: 验证 Markdown 格式**

运行：
```bash
cat ~/.claude/skills/find-skills/SKILL.md | grep -A 20 "## Trusted Marketplaces"
```

预期输出：新添加的章节内容

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add SKILL.md
git commit -m "docs: add trusted marketplaces section to SKILL.md"
```

---

## Task 5: 更新 SKILL.md - 添加优先搜索逻辑

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/SKILL.md`

**Step 1: 更新 "How to Help Users Find Skills" 部分**

找到 `## How to Help Users Find Skills` 部分，替换为：

```markdown
## How to Help Users Find Skills

### Step 1: Understand What They Need

When a user asks for help with something, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search Trusted Marketplaces First

**IMPORTANT:** Always search trusted marketplaces BEFORE using general search.

**Option A: Search within specific marketplace**

Use `mcp__zread` tools to search within trusted repositories:

```bash
# Example: Search for mcp-builder in anthropics/skills
mcp__zread__get_repo_structure repo_name="anthropics/skills"
mcp__zread__search_doc repo_name="anthropics/skills" query="mcp-builder"
```

**Option B: List all skills in a marketplace**

```bash
# Get repository structure
mcp__zread__get_repo_structure repo_name="anthropics/skills"

# Look for skills directories (usually named 'skills' or have SKILL.md files)
```

**Option C: Search across all trusted marketplaces**

For each marketplace in `marketplaces.json`:
1. Use `mcp__zread__search_doc` to search for keywords
2. Collect and rank results by quality score
3. Present top results to user

**Quality Score Formula:**

```
score = (stars * 0.4) + (recency * 0.3) + (trustLevel * 0.3)

Where:
- stars: normalized GitHub stars (0-100)
- recency: based on last update date (0-100)
- trustLevel: official=100, community=70, personal=40
```

### Step 3: Fallback to General Search

If no results found in trusted marketplaces:

```bash
npx skills find [query]
```

Or use web search:

```bash
mcp__web-search-prime__web_search_prime search_query="[query] claude code skill github"
```

### Step 4: Present Options to the User

When presenting results, include quality indicators:

```
Found 3 matching skills (sorted by quality):

1. mcp-builder (anthropics/skills)
   ⭐ 66.6k stars | 🕐 Updated: 2026-03-01 | 🏆 Official
   📝 Build MCP servers with official tooling

   Install: npx skills add anthropics/skills@mcp-builder

2. mcp-server-builder (ComposioHQ/awesome-claude-skills)
   ⭐ 19.9k stars | 🕐 Updated: 2026-02-28 | ✅ Community
   📝 Community-maintained MCP builder

   Install: npx skills add ComposioHQ/awesome-claude-skills@mcp-server-builder

---
💡 Results from trusted marketplaces
   Use /find-skills list-marketplaces to see all sources
```
```

**Step 2: 验证更新**

运行：
```bash
cat ~/.claude/skills/find-skills/SKILL.md | grep -A 10 "### Step 2:"
```

预期输出：新的搜索逻辑说明

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add SKILL.md
git commit -m "feat: add trusted marketplace priority search logic"
```

---

## Task 6: 添加列出 marketplaces 功能

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/SKILL.md`

**Step 1: 在 SKILL.md 末尾添加新章节**

```markdown
## Listing Marketplaces

### List All Trusted Marketplaces

When user asks to "list marketplaces" or "show trusted sources":

1. Read `marketplaces.json` configuration
2. Display formatted table:

```
Trusted Marketplaces (5 total):

┌─────────────────────────────┬────────┬────────┬──────────┐
│ Name                        │ Stars  │ Level  │ Category │
├─────────────────────────────┼────────┼────────┼──────────┤
│ Anthropic Official Skills   │ 66.6k  │ 🏆     │ Official │
│ Everything Claude Code      │ 40.8k  │ ✅     │ Community│
│ Awesome Claude Skills       │ 19.9k  │ ✅     │ Community│
│ Jacky's Skills              │ 1.2k   │ 👤     │ Personal │
└─────────────────────────────┴────────┴────────┴──────────┘

💡 Use /find-skills list-skills [marketplace-id] to see skills
```

### List Skills in a Marketplace

When user asks to "list skills in [marketplace]":

1. Identify marketplace by id or name
2. Use `mcp__zread__get_repo_structure` to fetch structure
3. Look for directories containing SKILL.md
4. Display results:

```
Skills in Anthropic Official Skills (12 total):

┌────────────────────┬────────────────────────────────┐
│ Skill Name         │ Description                    │
├────────────────────┼────────────────────────────────┤
│ mcp-builder        │ Build MCP servers              │
│ skill-creator      │ Create new skills              │
│ code-reviewer      │ Review code quality            │
│ debugging          │ Systematic debugging workflow  │
│ ...                │ ...                            │
└────────────────────┴────────────────────────────────┘

Install: npx skills add anthropics/skills@<skill-name>
```
```

**Step 2: 验证更新**

运行：
```bash
cat ~/.claude/skills/find-skills/SKILL.md | grep -A 20 "## Listing Marketplaces"
```

预期输出：新添加的列表功能说明

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add SKILL.md
git commit -m "feat: add list marketplaces and list skills functionality"
```

---

## Task 7: 添加触发条件说明

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/SKILL.md`

**Step 1: 更新 frontmatter 中的 description**

找到 SKILL.md 开头的 frontmatter，更新 `description` 字段：

```yaml
---
name: find-skills
description: Helps users discover and install skills from trusted marketplaces. Use when the user asks "how do I do X", "find a skill for X", "is there a skill for X", "list marketplaces", or "show skills in [marketplace]". Prioritizes searching from curated trusted sources before falling back to general search.
---
```

**Step 2: 在 "When to Use This Skill" 部分添加新场景**

找到 `## When to Use This Skill` 部分，添加：

```markdown
## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment, etc.)
- **Asks to "list marketplaces" or "show trusted sources"** (NEW)
- **Asks to "list skills in [marketplace]"** (NEW)
- **Wants to see what skills are available** (NEW)
```

**Step 3: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add SKILL.md
git commit -m "feat: update trigger conditions for marketplace features"
```

---

## Task 8: 添加示例对话

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/SKILL.md`

**Step 1: 在 "Tips for Effective Searches" 部分后添加示例**

```markdown
## Example Interactions

### Example 1: Searching for a skill

**User:** "I need to create a MCP server, is there a skill for that?"

**Assistant:**
1. Read marketplaces.json
2. Search trusted marketplaces for "mcp" keywords
3. Present results:

```
Found 2 skills for MCP server building:

1. mcp-builder (anthropics/skills)
   ⭐ 66.6k stars | 🕐 Updated: 2026-03-01 | 🏆 Official
   📝 Official Anthropic tool for building MCP servers

   Install: npx skills add anthropics/skills@mcp-builder

2. mcp-server-creator (ComposioHQ/awesome-claude-skills)
   ⭐ 19.9k stars | 🕐 Updated: 2026-02-28 | ✅ Community
   📝 Community tool with additional templates

   Install: npx skills add ComposioHQ/awesome-claude-skills@mcp-server-creator

💡 Recommendation: Use mcp-builder (official) for best compatibility
```

### Example 2: Listing marketplaces

**User:** "What marketplaces do we trust?"

**Assistant:**
1. Read marketplaces.json
2. Display formatted table (see "Listing Marketplaces" section)

### Example 3: Listing skills in a marketplace

**User:** "Show me all skills in Anthropic's repository"

**Assistant:**
1. Identify marketplace: "anthropics-skills"
2. Use mcp__zread__get_repo_structure to fetch structure
3. Parse skill directories
4. Display formatted table (see "List Skills in a Marketplace" section)
```

**Step 2: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add SKILL.md
git commit -m "docs: add example interactions for new features"
```

---

## Task 9: 测试基本功能

**Files:**
- Test: Manual testing

**Step 1: 测试配置文件读取**

在新的 Claude Code 会话中运行：

```bash
# 触发 find-skills
# 说："帮我搜索 mcp-builder skill"
```

预期：Claude 应该能够读取 marketplaces.json 并优先从受信任的 marketplace 搜索

**Step 2: 测试列出 marketplaces**

说："列出所有可信赖的 marketplace"

预期：显示包含 4 个 marketplace 的表格

**Step 3: 测试列出 skills**

说："列出 anthropics/skills 中的所有 skills"

预期：使用 mcp__zread 工具获取仓库结构并显示 skills 列表

**Step 4: 记录测试结果**

创建测试报告：

```markdown
# Test Results

Date: 2026-03-09

## Test 1: Search for skill
- Input: "帮我搜索 mcp-builder skill"
- Expected: Search from trusted marketplaces first
- Result: [PASS/FAIL]
- Notes: [Any observations]

## Test 2: List marketplaces
- Input: "列出所有可信赖的 marketplace"
- Expected: Display table with 4 marketplaces
- Result: [PASS/FAIL]
- Notes: [Any observations]

## Test 3: List skills in marketplace
- Input: "列出 anthropics/skills 中的所有 skills"
- Expected: Use mcp__zread to fetch and display
- Result: [PASS/FAIL]
- Notes: [Any observations]
```

---

## Task 10: 更新 README 和文档

**Files:**
- Modify: `/Users/jiashengwang/.claude/skills/find-skills/README.md` (if exists)

**Step 1: 创建或更新 README**

如果 README.md 不存在，创建它；如果存在，添加新功能说明：

```markdown
# Find Skills - Enhanced Version

Enhanced skill discovery with trusted marketplace support.

## What's New

✨ **Trusted Marketplaces** - Curated list of quality skill sources
📊 **Quality Scoring** - Skills ranked by stars, recency, and trust level
🔍 **Priority Search** - Search trusted sources first
📋 **List Features** - View all marketplaces and their skills

## Quick Start

### Search for a skill

Just ask naturally:
- "I need a skill for testing React components"
- "Is there a skill to help with MCP servers?"
- "Find a skill for code review"

### List trusted marketplaces

- "Show me all trusted marketplaces"
- "List marketplace sources"
- "/find-skills list-marketplaces"

### List skills in a marketplace

- "Show all skills in anthropics/skills"
- "What skills are in Everything Claude Code?"
- "/find-skills list-skills anthropics-skills"

## Configuration

Marketplace configuration is stored in:
```
~/.claude/skills/find-skills/marketplaces.json
```

## Trusted Marketplaces

| Marketplace | Stars | Trust Level |
|-------------|-------|-------------|
| Anthropic Official Skills | 66.6k | 🏆 Official |
| Everything Claude Code | 40.8k | ✅ Community |
| Awesome Claude Skills | 19.9k | ✅ Community |
| Jacky's Skills | 1.2k | 👤 Personal |

## Quality Scoring

Skills are scored using:
- **Stars** (40%): GitHub popularity
- **Recency** (30%): Recent updates score higher
- **Trust Level** (30%): Official > Community > Personal

## Contributing

To add a marketplace to the trusted list:
1. Edit `marketplaces.json`
2. Add marketplace entry with required fields
3. Submit a PR or issue

## License

MIT
```

**Step 2: 提交更改**

```bash
cd ~/.claude/skills/find-skills
git add README.md
git commit -m "docs: add comprehensive README for enhanced find-skills"
```

---

## Task 11: 最终验证和发布

**Files:**
- All files

**Step 1: 运行完整测试套件**

```bash
# 测试所有功能
# 1. 搜索功能
# 2. 列表功能
# 3. 配置读取
# 4. 错误处理
```

**Step 2: 检查所有文件**

```bash
cd ~/.claude/skills/find-skills
ls -la
```

预期文件：
- ✅ SKILL.md
- ✅ marketplaces.json
- ✅ README.md

**Step 3: 验证 JSON 格式**

```bash
cat ~/.claude/skills/find-skills/marketplaces.json | jq .
```

预期：格式正确的 JSON

**Step 4: 创建发布标签**

```bash
cd ~/.claude/skills/find-skills
git tag -a v2.0.0 -m "Release enhanced find-skills with marketplace support"
git push origin v2.0.0
```

**Step 5: 更新全局 skills**

```bash
# 如果使用 j-skills
cd /Users/jiashengwang/jacky-github/jacky-skills
j-skills link --all
j-skills install find-skills -g
```

---

## Verification Checklist

完成后验证：

- [ ] marketplaces.json 包含 4 个 marketplace
- [ ] SKILL.md 包含新的搜索逻辑
- [ ] SKILL.md 包含列表功能说明
- [ ] SKILL.md 包含示例对话
- [ ] README.md 已创建或更新
- [ ] 所有文件已提交到 git
- [ ] 测试通过
- [ ] 全局 skills 已更新

---

## Post-Implementation Tasks

完成实现后：

1. **更新 jacky-skills 仓库**
   - 将 find-skills 复制到 jacky-skills/plugins/skills-management/skills/
   - 更新 README

2. **创建使用文档**
   - 编写教程
   - 录制演示视频（可选）

3. **收集反馈**
   - 在实际使用中测试
   - 根据反馈优化

---

**Plan Created:** 2026-03-09
**Estimated Tasks:** 11
**Estimated Time:** 2-3 hours
