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
**核心理念：问题驱动，即问即研，以分享角度记录。**

- 用户只关心问题，不关心项目创建细节
- 自动检测项目状态（新建/更新/直接研究）
- 研究结果自动沉淀到笔记
- 研究过程使用 Claude Code 原生工具（Glob/Grep/Read）进行代码分析
- **写作原则：让完全不懂的人也能看懂**
  - 假设读者是零基础，不跳过基础概念
  - 使用步骤化表达，每个步骤只做一件事
  - 提供完整示例，代码片段要完整可运行
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
    <trigger>调研下、研究下、学习下、看看 xxx 仓库、分析开源项目、repo-study</trigger>
    <requires>git, gh, Claude Code tools (Glob, Grep, Read)</requires>
  </gsd:meta>

  <gsd:goal>让用户用自然语言提问，自动完成项目初始化/更新/研究全过程，沉淀可复用的研究笔记</gsd:goal>

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
    <gsd:step condition="用户使用中文提问">提示翻译功能</gsd:step>
  </gsd:phase>

  <gsd:phase name="output" order="5">
    <gsd:step>询问用户下一步：继续研究 / 生成实操指南 / 生成 Skill 模板 / 全部生成</gsd:step>
    <gsd:step condition="选择指南或全部">生成 {主题}-guide.md（小白可执行的实操指南）</gsd:step>
    <gsd:step condition="选择模板或全部">生成 {主题}-skill.md（可复用的 Skill 模板）</gsd:step>
    <gsd:step>更新研究日志 RESEARCH-LOG.md</gsd:step>
  </gsd:phase>
</gsd:workflow>

<!-- ========== 执行流程 ========== -->
<process>

## Phase 1: 检测 (detect)

### Step 1.1: 解析用户输入

从用户输入中提取仓库 URL、仓库名、研究问题、目标目录。

**URL 解析规则：**
```
git@github.com:user/repo.git → 仓库名: repo, owner: user
https://github.com/user/repo → 仓库名: repo, owner: user
```

### Step 1.2: 检测项目状态

**核心逻辑：**
1. 检查项目目录是否存在 → 不存在则创建
2. 检查元数据文件 → 无元数据则重建
3. 比对 commit SHA → 不一致则询问更新

**关键命令：**
```bash
# 获取远程最新 commit
gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha'

# 读取本地记录的 commit
cat .study-meta.json | jq -r '.commitSha'
```

**Checkpoint**: 根据检测结果选择分支执行。

---

## Phase 2: 创建 (create) — 仅当项目不存在时

### Step 2.1: 创建项目目录

```bash
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"
```

### Step 2.2: 克隆源码

```bash
# 浅克隆（只克隆最新提交，节省空间）
git clone --single-branch --depth 1 "$REPO_URL" "$REPO_NAME"

# 删除 .git 目录（我们只关心源码，不需要 git 历史）
rm -rf "$REPO_NAME/.git"
```

### Step 2.3: 生成项目文件

**必须生成的文件：**
- `CLAUDE.md` - 项目说明文件
- `.study-meta.json` - 元数据（包含 commit SHA 用于版本检查）

**Checkpoint**: 确保文件结构完整后初始化 Git 仓库。

---

## Phase 3: 更新 (update) — 仅当项目不是最新时

### Step 3.1: 询问用户

使用 AskUserQuestion 询问是否更新源码。

### Step 3.2: 执行更新

**核心逻辑：**
1. 临时克隆最新代码
2. 只更新源码目录，**保留 notes/ 目录**
3. 更新元数据中的 commit SHA

**关键命令：**
```bash
# 浅克隆到临时目录
git clone --single-branch --depth 1 "$REPO_URL" temp_clone

# 只更新源码，保留笔记
rm -rf "$REPO_NAME"/*
cp -r temp_clone/* "$REPO_NAME/"
rm -rf temp_clone

# 更新元数据
jq ".commitSha = \"$REMOTE_COMMIT\"" .study-meta.json
```

**安全检查**: 更新前确认 notes/ 目录不会被删除。

---

## Phase 4: 研究 (research) — 所有场景最终都会执行

### Step 4.1: 开始研究

根据用户的研究问题，使用 Claude Code 原生工具分析源码：

1. **搜索相关文件**：使用 `Glob` 查找文件模式，使用 `Grep` 搜索关键词
2. **阅读关键文件**：使用 `Read` 深入理解核心实现
3. **分析架构设计**：理解模块之间的关系，绘制调用链和数据流
4. **提取可复用模式**：发现可以借鉴的设计模式

### Step 4.2: 输出研究发现

**写作原则：让完全不懂的人也能看懂**

1. **假设读者是零基础**：不跳过基础概念，专业术语第一次出现时给出简单说明
2. **使用步骤化表达**：复杂流程拆分为有序步骤，每个步骤只做一件事
3. **提供完整示例**：代码片段要完整可运行，配置文件要给出完整内容

**输出模板：**

```markdown
## 研究发现: {研究问题}

> 一句话说明这个发现解决什么问题

### 一、基础概念

// 解释核心概念，让读者建立认知

### 二、关键代码位置

| 文件 | 行号 | 说明 |
|------|------|------|
| path/to/file.ts | 123 | 核心逻辑 |

### 三、实现原理

// 分步骤说明，每步一个三级标题

### 四、设计亮点

1. {亮点 1}
2. {亮点 2}

### 五、可复用模式

{可以借鉴的设计模式或技巧，提供完整代码示例}

### 六、参考资料

// 链接到官方文档或其他资源
```

### Step 4.3: 沉淀笔记

将研究发现写入 `notes/` 目录，格式同上。

**研究日志格式（RESEARCH-LOG.md）：**

```markdown
# 研究日志

## YYYY-MM-DD: {研究主题}

**研究问题**: {用户的研究问题}

**仓库**: [REPO_NAME](GITHUB_URL)

**核心发现**:
- {发现 1}
- {发现 2}

**产出**:
- [ ] 实操指南
- [ ] Skill 模板

---
```

### Step 4.5: 提示翻译功能

**条件触发**：如果用户使用中文提问，在沉淀笔记后提示翻译功能。

```markdown
💡 **提示**: 如果需要将研究笔记翻译为英文或其他语言，可以使用：

    /repo-study translate

该命令会自动翻译项目中的所有 Markdown 文档（包括 CLAUDE.md 和 notes/ 目录下的笔记）。
```

**注意事项**：
- 仅在用户使用中文提问时提示
- 如果用户使用英文提问，跳过此步骤
- 保持提示简洁，不干扰主要研究流程

---

## Phase 5: 产出选择 (output) — 研究完成后

### Step 5.1: 询问用户下一步

使用 AskUserQuestion：

```
问题：研究完成！你希望接下来做什么？

选项：
1. 继续深入研究（继续探索其他方面）
2. 生成实操指南（让小白可以复现这个能力）
3. 生成 Skill 模板（封装成可复用的 skill）
4. 全部生成（同时生成指南和模板）
```

### Step 5.2: 根据选择执行

**选择 1：继续深入研究**
- 等待用户提出新的研究问题
- 返回 Phase 4 继续研究

**选择 2：生成实操指南**
- 生成 `notes/{主题}-guide.md`
- **写作风格**：以分享角度记录，让小白也能看懂
- **内容结构**：
  ```markdown
  # {主题} 实操指南

  > 一句话说明这篇指南解决什么问题

  ## 一、基础概念
  // 解释核心概念，让读者建立认知

  ## 二、准备工作
  // 列出需要提前准备的东西（工具、账号、环境等）

  ## 三、详细步骤
  ### 3.1 第一步
  1. 具体操作
  2. 具体操作

  ### 3.2 第二步
  ...

  ## 四、代码示例
  // 完整可运行的代码

  ## 五、常见问题
  // 预判读者可能遇到的问题

  ## 六、参考资料
  // 链接到官方文档或其他资源
  ```

  - **写作要点**：
    - 假设读者是零基础，不跳过基础概念
    - 使用步骤化表达，每个步骤只做一件事
    - 代码片段要完整可运行

**选择 3：生成 Skill 模板**
- 生成 `notes/{主题}-skill.md`
- **内容结构**：
  ```markdown
  ---
  name: {skill-name}
  description: "{简短描述，说明何时触发}"
  ---

  <role>
  你是一个 {角色描述}。
  </role>

  <purpose>
  {这个 skill 解决什么问题}
  </purpose>

  <trigger>
  ```
  {触发示例 1}
  {触发示例 2}
  ```
  </trigger>

  <gsd:workflow>
    <gsd:phase name="phase1">
      <gsd:step>步骤 1</gsd:step>
    </gsd:phase>
  </gsd:workflow>

  <process>
  // 详细执行流程
  </process>
  ```

**选择 4：全部生成**
- 同时生成实操指南和 Skill 模板
- 两个文件都需要满足上述内容要求

### Step 5.3: 更新研究日志

在 `notes/RESEARCH-LOG.md` 中更新本次研究的产出记录：

```markdown
## {日期}: {研究主题}

**研究问题**：{用户的研究问题}

**仓库**：[{REPO_NAME}]({GITHUB_URL})

**产出**：
{%- if 生成指南 %}
- [实操指南](./{主题}-guide.md)
{%- endif %}
{%- if 生成模板 %}
- [Skill 模板](./{主题}-skill.md)
{%- endif %}

---
```

**输出完成确认：**

```markdown
✅ **产出完成**

根据你的选择，已生成以下文件：

{%- if 生成指南 %}
- 📘 notes/{主题}-guide.md（实操指南）
{%- endif %}
{%- if 生成模板 %}
- 🔧 notes/{主题}-skill.md（Skill 模板）
{%- endif %}

研究日志已更新：notes/RESEARCH-LOG.md
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

**工具使用提示**：
- 使用 `Glob` 搜索文件：`glob "**/*.ts"`
- 使用 `Grep` 搜索内容：`grep "keyword" --include "*.ts"`
- 使用 `Read` 阅读文件：`read file.ts` 或 `read file.ts --offset 100 --limit 50`

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
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Phase 5: 产出选择                                    │    │
│  │                                                      │    │
│  │  研究完成后询问：                                     │    │
│  │     ├─ 继续深入研究 → 返回 Phase 4                   │    │
│  │     ├─ 生成实操指南 → {主题}-guide.md               │    │
│  │     ├─ 生成 Skill 模板 → {主题}-skill.md            │    │
│  │     └─ 全部生成 → 同时生成指南和模板                 │    │
│  │                                                      │    │
│  │  最后更新研究日志 RESEARCH-LOG.md                    │    │
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
- [ ] 如果用户使用中文提问，提示可使用 `/repo-study translate` 翻译文档
- [ ] 研究完成后询问用户下一步选择
- [ ] 根据用户选择生成对应的产出（实操指南/Skill模板）
- [ ] 更新研究日志记录产出
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
