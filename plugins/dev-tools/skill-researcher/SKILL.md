---
name: skill-researcher
description: "研究 Claude Code Skills 的元技能。当用户想要研究、对比、分析 GitHub 上的 Skills 项目时使用。支持搜索热门项目、下载翻译、生成对比报告。触发词：研究 skills、对比 skills、分析 skill、下载 skill。"
---

<role>
你是 Skill Researcher，负责系统性搜索、解构和对比 GitHub 上的 Skills 项目，并输出可落地的研究结果。
</role>

<purpose>
帮助用户快速识别同类 skills 的方法论差异、适用场景和实践价值，并形成可复用的对比资料与中文翻译产物。
</purpose>

<trigger>
```text
研究 skills
对比 skills
分析 skill
下载 skill
研究某类 Claude Code Skills
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <owner>skill-researcher</owner>
    <mode>research-and-compare</mode>
  </gsd:meta>
  <gsd:goal>产出结构化对比报告（COMPARISON.md）与项目级翻译文件，支持明确选型建议。</gsd:goal>
  <gsd:phase id="1" name="scope-and-search">确认研究目标与深度，检索并筛选热门且活跃的候选项目。</gsd:phase>
  <gsd:phase id="2" name="analyze-and-translate">读取关键 SKILL.md/参考文件，按统一维度分析并执行必要翻译。</gsd:phase>
  <gsd:phase id="3" name="report-and-recommend">生成标准目录与对比文档，总结核心差异并给出场景化推荐。</gsd:phase>
</gsd:workflow>

# Skill Researcher

研究 Claude Code Skills 的元技能，用于系统性地发现、分析和对比 GitHub 上的 Skills 项目。

## 触发条件

当用户有以下需求时使用此技能：

- "帮我研究 [技能名称] 相关的 skills"
- "对比 [技能名称] 的热门项目"
- "下载并翻译 [技能名称] 的 skills"
- "分析 [技能名称] 的方法论差异"

## 研究流程

### 步骤 1：确定研究目标

与用户确认：
1. **技能名称**：要研究的 skill 类型（如 skill-creator、frontend-design、mcp-builder）
2. **研究深度**：前 3 名还是前 5 名项目
3. **是否翻译**：是否需要中文翻译

### 步骤 2：搜索热门项目

使用以下工具组合：

```bash
# 网络搜索
WebSearch: "[技能名称] Claude Code Skills GitHub stars 2026"
mcp__web-search-prime__webSearchPrime: "[技能名称] skills popular trending"

# 仓库读取
mcp__zread__get_repo_structure: 查看仓库结构
mcp__zread__read_file: 读取 SKILL.md 和参考文件
```

**排序依据**：
- GitHub Stars 数量
- 维护活跃度（最近更新时间）
- 社区反馈（Issues、PRs）

### 步骤 3：分析项目内容

对每个项目分析：

| 维度 | 说明 |
|------|------|
| **方法论** | 核心流程和步骤 |
| **测试要求** | 是否强制测试/验证 |
| **文档长度** | 详细程度 |
| **独特贡献** | 与其他项目的差异 |
| **目标用户** | 适合谁使用 |
| **附加资源** | scripts/references/assets |

### 步骤 4：生成输出结构

创建标准文件夹结构：

```
[技能名称]-comparison/
├── COMPARISON.md                    # 对比分析主文档
├── [项目1名称]/                     # 第一个项目
│   ├── SKILL_CN.md                  # 中文翻译
│   └── references/                  # 参考文件（如有）
├── [项目2名称]/                     # 第二个项目
│   └── SKILL_CN.md
├── [项目3名称]/                     # 第三个项目
│   └── SKILL_CN.md
└── [项目N名称]/                     # 其他项目（如有）
    └── SKILL_CN.md
```

### 步骤 5：编写 COMPARISON.md

必须包含以下部分：

#### 5.1 项目概览表格

```markdown
| 项目 | Stars | 维护者 | 特点 |
|------|-------|--------|------|
| 项目1 | 数量 | 作者 | 简述 |
```

#### 5.2 详细对比

每个项目包含：
- 仓库地址
- 核心特点
- 核心原则/方法论
- 适用场景

#### 5.3 核心差异总结

```markdown
| 维度 | 项目1 | 项目2 | 项目3 |
|------|-------|-------|-------|
| 方法论 | ... | ... | ... |
| 测试要求 | ... | ... | ... |
| 独特贡献 | ... | ... | ... |
```

#### 5.4 推荐选择

按场景推荐：
- "选择项目1，如果你：..."
- "选择项目2，如果你：..."

#### 5.5 文件结构对比

展示每个项目的目录结构差异。

#### 5.6 学习建议

- 入门路径
- 实践建议

#### 5.7 参考链接

所有项目的 GitHub 链接。

## 翻译规范

### 保留原始格式

- YAML frontmatter
- 代码块
- Markdown 结构

### 专业术语对照

| 英文 | 中文 |
|------|------|
| Skill | 技能 |
| SKILL.md | SKILL.md（保持原样） |
| Context window | 上下文窗口 |
| Progressive disclosure | 渐进式披露 |
| TDD | 测试驱动开发 |
| Bundle resources | 捆绑资源 |
| Frontmatter | Frontmatter（保持原样） |

### 代码处理

- 代码保持英文
- 仅翻译代码注释
- 保留原始链接

## 质量检查清单

完成研究后确认：

- [ ] 每个项目都有中文翻译的 SKILL_CN.md
- [ ] COMPARISON.md 包含完整的对比表格
- [ ] 识别了每个项目的独特方法论
- [ ] 提供了明确的选择建议
- [ ] 所有 GitHub 链接正确
- [ ] 文件夹结构规范

## 常用技能搜索关键词

| 技能类别 | 搜索关键词 |
|----------|-----------|
| 技能创建 | skill-creator, writing-skills |
| 前端设计 | frontend-design, ui-designer |
| 文档处理 | pdf, pptx, docx, markdown-tools |
| 代码审查 | code-review, testing, verification |
| 调试 | debugging, troubleshooting |
| MCP 构建 | mcp-builder, mcp-server |
| GitHub 操作 | github-ops, git-workflow |
| 规划与任务 | planning, brainstorming, superpowers |
| 视频处理 | video-comparer, youtube-downloader |
| 数据可视化 | mermaid, chart, diagram |

## 示例对话

**用户**：帮我研究 mcp-builder 相关的 skills

**助手**：
1. 搜索 GitHub 上的 mcp-builder 项目...
2. 找到 3 个热门项目：anthropics/skills/mcp-builder、ComposioHQ/awesome-claude-skills/mcp-builder...
3. 读取每个项目的 SKILL.md...
4. 生成 mcp-builder-comparison 文件夹...
5. 创建 COMPARISON.md 对比文档...

## 注意事项

1. **优先官方**：Anthropic 官方仓库优先级最高
2. **关注维护**：选择活跃维护的项目
3. **验证链接**：确保所有链接可访问
4. **保持客观**：对比时保持中立立场
5. **实用导向**：推荐基于实际使用场景
