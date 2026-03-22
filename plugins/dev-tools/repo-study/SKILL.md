---
name: repo-study
description: 研究 GitHub 仓库的特定技术实现。触发词：调研下、研究下、学习下、看看 xxx 仓库、分析开源项目、repo-study
---

<role>
你是一个 GitHub 仓库研究助手。帮助用户快速研究开源项目的特定技术实现，自动管理学习环境，沉淀研究笔记。
</role>

<purpose>
让用户能够用自然语言提问："调研下 xxx 仓库在某个领域是如何实现的"，自动处理项目创建、更新、研究全过程。
</purpose>

<philosophy>
**核心理念：问题驱动，即问即研。**

- 用户只关心问题，不关心项目创建细节
- 自动检测项目状态（新建/更新/直接研究）
- 研究结果自动沉淀到笔记
</philosophy>

<trigger>
```
调研下 git@github.com:chris-hendrix/claudehub.git 在 Agent 通信方面是如何实现的
研究下 https://github.com/daymade/claude-code-skills 的 skill 设计模式
看看 get-shit-done 这个项目的 GSD workflow 是怎么设计的
学习下 claudehub 的 prompt engineering 技巧
```
</trigger>

<!-- ========== GSD Workflow XML 结构 ========== -->
<gsd:workflow>
  <gsd:meta>
    <name>repo-study</name>
    <trigger>调研下、研究下、学习下、看看 xxx 仓库</trigger>
    <requires>j-skills, git, gh</requires>
  </gsd:meta>

  <gsd:goal>让用户用自然语言提问，自动完成项目初始化/更新/研究</gsd:goal>

  <gsd:phase name="detect" order="1">
    <gsd:step>解析仓库 URL 和研究问题</gsd:step>
    <gsd:step>检测项目目录是否存在</gsd:step>
    <gsd:step>若存在，检查是否为最新版本</gsd:step>
    <gsd:checkpoint>根据检测结果选择分支：create / update / research</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="create" order="2" condition="项目不存在">
    <gsd:step>创建项目目录结构</gsd:step>
    <gsd:step>克隆源码（single-branch + depth 1）</gsd:step>
    <gsd:step>删除源码的 .git 目录</gsd:step>
    <gsd:step>生成 CLAUDE.md 和元数据</gsd:step>
    <gsd:step>初始化 Git 仓库</gsd:step>
  </gsd:phase>

  <gsd:phase name="update" order="3" condition="项目存在但不是最新">
    <gsd:step>询问用户是否更新</gsd:step>
    <gsd:step>更新源码到最新版本</gsd:step>
  </gsd:phase>

  <gsd:phase name="research" order="4">
    <gsd:step>切换到项目目录</gsd:step>
    <gsd:step>根据用户问题开始研究</gsd:step>
    <gsd:step>输出研究发现</gsd:step>
    <gsd:step>沉淀笔记到 notes/</gsd:step>
  </gsd:phase>
</gsd:workflow>

<!-- ========== 执行流程 ========== -->
<process>

## Phase 1: 检测 (detect)

### Step 1.1: 解析用户输入

从用户输入中提取：

| 信息 | 来源 | 示例 |
|------|------|------|
| 仓库 URL | 用户输入 | `git@github.com:chris-hendrix/claudehub.git` |
| 仓库名 | 从 URL 提取 | `claudehub` |
| 研究问题 | 用户输入 | "Agent 通信方面是如何实现的" |
| 目标目录 | `REPO_NAME-study` | `claudehub-study` |

**URL 解析规则：**
```
git@github.com:user/repo.git → 仓库名: repo, owner: user
https://github.com/user/repo → 仓库名: repo, owner: user
```

### Step 1.2: 检测项目状态

```bash
TARGET_DIR="~/jacky-github/${REPO_NAME}-study"
META_FILE="$TARGET_DIR/.study-meta.json"

if [ ! -d "$TARGET_DIR" ]; then
    # 场景 1: 项目不存在 → 创建
    SCENARIO="create"
elif [ -f "$META_FILE" ]; then
    # 场景 2/3: 项目存在，检查是否最新
    LOCAL_COMMIT=$(cat "$META_FILE" | jq -r '.commitSha')
    REMOTE_COMMIT=$(gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha')

    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        # 场景 2: 不是最新 → 询问更新
        SCENARIO="update"
    else
        # 场景 3: 已是最新 → 直接研究
        SCENARIO="research"
    fi
else
    # 无元数据，视为需要重建
    SCENARIO="create"
fi
```

**输出检测结果：**

```markdown
## 🔍 检测结果

| 项目 | 状态 |
|------|------|
| 仓库 | OWNER/REPO |
| 本地项目 | ✅ 存在 / ❌ 不存在 |
| 版本状态 | 🟢 最新 / 🟡 有更新 (本地: abc123, 远程: def456) |
| 操作 | 创建 / 更新 / 直接研究 |

**研究问题**: {用户的问题}
```

**Checkpoint**: 根据检测结果选择分支执行。

---

## Phase 2: 创建 (create) — 仅当项目不存在时

### Step 2.1: 创建项目目录

```bash
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/notes/architecture"
mkdir -p "$TARGET_DIR/notes/patterns"
mkdir -p "$TARGET_DIR/notes/reusable"
mkdir -p "$TARGET_DIR/notes/reusable-designs"
cd "$TARGET_DIR"
```

### Step 2.2: 克隆源码

```bash
# 获取远程 commit SHA
REMOTE_COMMIT=$(gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha')

# 克隆代码
git clone --single-branch --depth 1 "$REPO_URL" "$REPO_NAME"

# 删除 .git
rm -rf "$REPO_NAME/.git"
```

### Step 2.3: 生成文件

**生成 CLAUDE.md：**

```markdown
# REPO_NAME 学习项目

## 项目定位

本项目用于**深入研究 [REPO_NAME](GITHUB_URL)** 的技术实现。

## 当前研究问题

> {用户的研究问题}

## 目录结构

REPO_NAME-study/
├── CLAUDE.md              # 本文件
├── .study-meta.json       # 元数据
├── REPO_NAME/             # 源代码
└── notes/                 # 研究笔记
    ├── architecture/      # 架构相关
    ├── patterns/          # 设计模式
    ├── reusable/          # 可复用技巧
    └── reusable-designs/  # 可复用设计

## 对话知识归档

有价值的研究发现自动沉淀到 `notes/` 目录。
```

**生成 .study-meta.json：**

```json
{
  "repoName": "REPO_NAME",
  "repoUrl": "REPO_URL",
  "githubUrl": "GITHUB_URL",
  "owner": "OWNER",
  "branch": "main",
  "commitSha": "REMOTE_COMMIT",
  "createdAt": "TIMESTAMP",
  "lastUpdated": "TIMESTAMP",
  "lastResearchQuestion": "用户的研究问题"
}
```

### Step 2.4: 初始化 Git

```bash
git init
git add .
git commit -m "Initial commit: setup REPO_NAME study project"
```

**输出：**

```markdown
✅ **项目创建完成**

📂 目录: ~/jacky-github/REPO_NAME-study
📌 版本: abc123 (main)

▶ 开始研究...
```

---

## Phase 3: 更新 (update) — 仅当项目不是最新时

### Step 3.1: 询问用户

使用 AskUserQuestion：

```
问题：检测到远程仓库有更新

当前版本: abc123 (本地)
最新版本: def456 (远程)

是否更新源码？

选项：
1. 是，更新到最新版本（推荐）
2. 否，继续使用当前版本研究
```

### Step 3.2: 执行更新（如果用户同意）

```bash
cd "$TARGET_DIR"

# 获取最新 commit SHA
REMOTE_COMMIT=$(gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha')

# 临时克隆
git clone --single-branch --depth 1 "$REPO_URL" temp_clone

# 更新源码（保留 notes/）
rm -rf "$REPO_NAME"/*
cp -r temp_clone/* "$REPO_NAME/"
rm -rf temp_clone

# 更新元数据
jq ".commitSha = \"$REMOTE_COMMIT\" | .lastUpdated = \"$(date -Iseconds)\"" \
  .study-meta.json > .study-meta.json.tmp
mv .study-meta.json.tmp .study-meta.json
```

**输出：**

```markdown
✅ **源码已更新**

📌 新版本: def456 (main)
📂 目录: ~/jacky-github/REPO_NAME-study

▶ 开始研究...
```

---

## Phase 4: 研究 (research) — 所有场景最终都会执行

### Step 4.1: 切换到项目目录

```bash
cd ~/jacky-github/REPO_NAME-study
```

### Step 4.2: 开始研究

根据用户的研究问题，分析源码：

1. **搜索相关文件**：使用 Glob/Grep 查找相关代码
2. **阅读关键文件**：使用 Read 深入理解实现
3. **分析架构设计**：理解模块之间的关系
4. **提取可复用模式**：发现可以借鉴的设计

### Step 4.3: 输出研究发现

```markdown
## 🔬 研究发现: {研究问题}

### 核心实现

{分析源码后的核心发现}

### 关键代码位置

| 文件 | 行号 | 说明 |
|------|------|------|
| path/to/file.ts | 123 | 核心逻辑 |

### 设计亮点

1. {亮点 1}
2. {亮点 2}

### 可复用模式

{可以借鉴的设计模式或技巧}
```

### Step 4.4: 沉淀笔记

将研究发现写入 `notes/` 目录：

```
根据研究问题类型选择目录：
- 架构相关 → notes/architecture/{主题}.md
- 设计模式 → notes/patterns/{模式名}.md
- 可复用技巧 → notes/reusable/{技巧名}.md
- 跨项目设计 → notes/reusable-designs/{设计名}.md
```

</process>

<!-- ========== 命令速查 ========== -->
<commands>

| 命令 | 说明 |
|------|------|
| `/repo-study <url> <问题>` | 研究 GitHub 仓库的特定问题 |
| `/repo-study update` | 强制更新源码到最新版本 |
| `/repo-study status` | 查看学习项目状态和版本信息 |
| `/repo-study translate` | 翻译所有文档 |

</commands>

<!-- ========== 三种场景速查 ========== -->
<scenarios>

```
┌─────────────────────────────────────────────────────────────┐
│                   repo-study 三种场景                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用户输入：调研下 xxx 在某领域是如何实现的                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Phase 1: 检测                                        │    │
│  │                                                      │    │
│  │  项目存在？                                          │    │
│  │     ├─ 否 → Phase 2: 创建 → Phase 4: 研究           │    │
│  │     └─ 是 → 检查版本                                 │    │
│  │              ├─ 不是最新 → Phase 3: 更新 → 研究      │    │
│  │              └─ 已是最新 → Phase 4: 直接研究         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  版本检查：使用 gh api 比对 commit SHA                       │
│  安全保障：notes/ 目录永不删除                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

</scenarios>

<!-- ========== 反模式 ========== -->
<anti_patterns>

### ❌ 错误 1：每次都重新创建项目

**错误做法**：不管项目是否存在，都执行完整创建流程

**正确做法**：先检测，根据状态选择分支

### ❌ 错误 2：不检查版本直接研究

**错误做法**：项目存在就直接研究，不管是否最新

**正确做法**：使用 `gh api` 检查远程 commit，提示用户更新

### ❌ 错误 3：更新时删除 notes/

**错误做法**：更新源码时删除整个项目

**正确做法**：只更新源码目录，notes/ 永不删除

### ❌ 错误 4：忽略用户的研究问题

**错误做法**：只创建项目，不开始研究

**正确做法**：项目准备就绪后立即开始研究用户的问题

### ❌ 错误 5：不沉淀研究笔记

**错误做法**：研究结果只输出到对话，不写入文件

**正确做法**：研究发现自动写入 notes/ 目录

</anti_patterns>

<!-- ========== 成功标准 ========== -->
<success_criteria>
- [ ] 正确解析仓库 URL 和研究问题
- [ ] 检测项目是否存在
- [ ] 使用 `gh api` 检查远程 commit SHA
- [ ] 根据检测结果选择正确的分支
- [ ] 创建项目时生成完整文件结构
- [ ] 更新时保留 notes/ 目录
- [ ] 开始研究用户提出的问题
- [ ] 输出研究发现
- [ ] 沉淀笔记到 notes/ 目录
</success_criteria>

<!-- ========== 快速参考 ========== -->
<quick_reference>

## 使用示例

```bash
# 场景 1: 首次创建 + 研究
调研下 git@github.com:chris-hendrix/claudehub.git 在 Agent 通信方面是如何实现的

# 场景 2: 已存在 + 有更新 + 研究
调研下 claudehub 的 prompt engineering 技巧
# → 检测到有更新，询问是否更新后继续研究

# 场景 3: 已存在 + 已是最新 + 直接研究
调研下 claudehub 的错误处理机制
# → 检测到已是最新，直接开始研究
```

## 版本检查命令

```bash
# 获取远程最新 commit
gh api repos/OWNER/REPO/commits/main --jq '.sha'

# 读取本地记录的 commit
cat ~/jacky-github/REPO-study/.study-meta.json | jq -r '.commitSha'
```

</quick_reference>
