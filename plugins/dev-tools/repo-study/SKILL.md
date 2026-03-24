---
name: repo-study
description: "研究 GitHub 仓库的特定技术实现。触发词：调研下、研究下、学习下、看看 xxx 仓库、分析开源项目、repo-study"
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
- 研究状态按"主题（topic）"持续归纳，不使用一次性完成态
- 支持同一主题下多问题、多轮产出按需追加
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

  <gsd:goal>让用户用自然语言提问，自动完成项目初始化/更新/研究全过程，并按主题沉淀可复用研究资产</gsd:goal>

  <gsd:phase name="detect" order="1">
    <gsd:step>解析仓库 URL 和研究问题</gsd:step>
    <gsd:step>仅在当前目录检测 study 标识（目录名和 .study-meta.json）</gsd:step>
    <gsd:step>判断当前项目是否由 repo-study 创建（v2）</gsd:step>
    <gsd:step>若存在有效项目，强制检查 GitHub 远程版本是否最新</gsd:step>
    <gsd:step condition="本地版本落后">先提示用户是否更新，再决定 update / research 分支</gsd:step>
    <gsd:step>执行 status 脚本汇总课题、进度、skill 封装状态</gsd:step>
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

  <gsd:phase name="mode_select" order="4">
    <gsd:step>询问用户选择研究模式</gsd:step>
    <gsd:step>yolo 模式：直接输出完整研究发现</gsd:step>
    <gsd:step>交互模式：渐进式教学，分步骤讲解</gsd:step>
    <gsd:checkpoint>根据用户选择进入对应分支</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="research_yolo" order="5" condition="选择 yolo 模式">
    <gsd:step>切换到项目目录</gsd:step>
    <gsd:step>根据用户问题开始研究</gsd:step>
    <gsd:step>输出完整研究发现</gsd:step>
    <gsd:step>沉淀笔记到 notes/</gsd:step>
    <gsd:step condition="用户使用中文提问">提示翻译功能</gsd:step>
  </gsd:phase>

  <gsd:phase name="research_interactive" order="5b" condition="选择交互模式">
    <gsd:step>调研阶段：使用 Glob/Grep/Read 分析代码（不输出）</gsd:step>
    <gsd:step>创建会话状态：生成 .study-session.json 追踪进度</gsd:step>
    <gsd:step>概念拆解：将研究发现拆分为多个小概念</gsd:step>
    <gsd:step>逐步讲解：每次只讲一个概念</gsd:step>
    <gsd:step>实时归档：讲解后立即写入文件并更新会话状态</gsd:step>
    <gsd:step>理解确认：询问用户下一步选择</gsd:step>
    <gsd:step condition="需要更多解释">补充解释和示例</gsd:step>
    <gsd:step condition="继续">进入下一个概念</gsd:step>
    <gsd:step condition="暂停">保存进度到会话状态文件</gsd:step>
    <gsd:step>总结确认：所有概念讲解完毕后询问是否需要完整笔记</gsd:step>
    <gsd:step condition="需要">沉淀完整笔记到 notes/</gsd:step>
  </gsd:phase>

  <gsd:phase name="continue" order="7" condition="用户使用 /repo-study continue">
    <gsd:step>检查会话状态：读取 .study-session.json</gsd:step>
    <gsd:step>显示进度：展示上次进度和待讲解概念</gsd:step>
    <gsd:step>继续学习：从下一个待讲解概念继续交互学习</gsd:step>
  </gsd:phase>

  <gsd:phase name="output" order="6">
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

### Step 1.2: 检测当前目录状态（仅当前目录）

**核心逻辑（不扫描子目录，不递归）：**
1. 检查当前目录名是否匹配 `*-study`
2. 检查当前目录是否存在 `.study-meta.json`
3. 识别项目来源：
   - `repo-study-managed`：`managedBy.skill == "repo-study"` 且 `createdBySkill == true`
   - `non-repo-study`：存在 meta，但不符合上述条件
4. 如果是有效 study 项目，必须比对本地和远程 commit SHA
5. 若本地落后远程，先提示用户是否更新；未确认前不要直接进入 research

**关键命令：**
```bash
# 1) 当前目录名是否是 *-study
basename "$PWD" | grep -E -- '-study$'

# 2) 是否存在 study meta
test -f .study-meta.json

# 3) 判断是否 repo-study v2 管理
jq -r '(.managedBy.skill // "") + ":" + ((.managedBy.createdBySkill // false)|tostring)' .study-meta.json

# 4) 获取远程最新 commit
gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha'

# 5) 读取本地记录的 commit
jq -r '.repo.commitSha // .commitSha // empty' .study-meta.json

# 6) 一次性查询当前目录状态 + 远程版本差异
scripts/repo-study-status.sh --json --check-remote
```

### Step 1.3: 运行 status 脚本汇总研究状态

使用 `scripts/repo-study-status.sh` 汇总当前目录研究状态：

```bash
# 可读输出
scripts/repo-study-status.sh --check-remote

# JSON 输出（给 LLM / 自动化）
scripts/repo-study-status.sh --json --check-remote
```

脚本输出必须包含：
- 当前目录是否为 repo-study 创建项目
- 当前研究课题（topics）列表
- 每个 topic 的进度（持续态，无完成态）
- 每个 topic 是否已封装为 skill（template / runnable）
- 远程版本检查结果（up_to_date / outdated / unknown）

### Step 1.4: 版本落后时的用户提示（必须）

> ⚠️ **Checkpoint - 需要用户确认（Decision）**
>
> 当 `remoteCheck.status == "outdated"` 时，必须先提示：
>
> ```markdown
> ⏸️ **检测到远程仓库有更新**
>
> | 项目 | 值 |
> |------|-----|
> | 当前版本 | {localCommitSha} (本地) |
> | 最新版本 | {remoteCommitSha} (远程) |
>
> 是否更新源码？
>
> 1. 是，更新到最新版本（推荐）
> 2. 否，继续使用当前版本研究
> ```
>
> **Checkpoint**: 根据检测结果选择分支执行。

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
- `.study-meta.json` - 元数据（v2，包含 managedBy 和 topics）
- `scripts/repo-study-status.sh` - 当前目录研究状态查询脚本

> ⚠️ **Checkpoint - 需要验证（Human-Verify）**
>
> 确保文件结构完整后初始化 Git 仓库。

**`.study-meta.json` v2 最小结构：**
```json
{
  "schemaVersion": "2.0",
  "managedBy": {
    "skill": "repo-study",
    "createdBySkill": true,
    "createdAt": "2026-03-22T15:25:00+08:00"
  },
  "repo": {
    "name": "example-repo",
    "url": "https://github.com/owner/example-repo.git",
    "githubUrl": "https://github.com/owner/example-repo",
    "owner": "owner",
    "branch": "main",
    "commitSha": "abc123"
  },
  "topics": []
}
```

---

## Phase 3: 更新 (update) — 仅当项目不是最新时

### Step 3.1: 询问用户

> ⚠️ **Checkpoint - 需要用户选择（Decision）**
>
> 使用 AskUserQuestion 询问是否更新源码。

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

> ⚠️ **安全检查**: 更新前确认 notes/ 目录不会被删除。

---

## Phase 4: 模式选择 (mode_select) — 选择研究方式

> ⚠️ **Checkpoint - 需要用户选择（Decision）**
>
> 在正式开始研究前，询问用户选择研究模式：
>
> ```markdown
> 📋 **选择研究模式**
>
> 针对问题："{用户的研究问题}"
>
> 请选择研究方式：
>
> 1. **Yolo 模式**（快速模式）
>    - 直接输出完整研究发现
>    - 适合快速了解整体实现
>
> 2. **交互模式**（教学模式）
>    - 先调研，然后一点一点讲解
>    - 每个概念讲解后确认理解
>    - 适合深入学习和技术教学
> ```

---

## Phase 5a: 研究 — Yolo 模式

### Step 5a.1: 开始研究

根据用户的研究问题，使用 Claude Code 原生工具分析源码：

1. **搜索相关文件**：使用 `Glob` 查找文件模式，使用 `Grep` 搜索关键词
2. **阅读关键文件**：使用 `Read` 深入理解核心实现
3. **分析架构设计**：理解模块之间的关系，绘制调用链和数据流
4. **提取可复用模式**：发现可以借鉴的设计模式

### Step 5a.2: 输出研究发现

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

### Step 5a.3: 沉淀笔记

将研究发现写入 `notes/` 目录，格式同上。
并同步更新 `.study-meta.json` 的 `topics[]`：

- 若 topic 不存在：创建新 topic
- 若 topic 已存在：在该 topic 下追加 `questions[]` 与 `artifacts[]`
- `progress` 采用持续态统计（问题数/笔记数/指南数/skill 模板数/可运行 skill 数）
- 不维护"完成态"，默认 `state: "active"`

**研究日志格式（RESEARCH-LOG.md）：**

```markdown
# 研究日志

## YYYY-MM-DD: {研究主题}

**研究主题**: {topic.name}

**研究问题**: {用户的研究问题}

**仓库**: [REPO_NAME](GITHUB_URL)

**核心发现**:
- {发现 1}
- {发现 2}

**进度（持续更新）**:
- questions: {n}
- notes: {n}
- guides: {n}
- skill templates: {n}
- runnable skills: {n}

---
```

### Step 5a.4: 提示翻译功能

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

## Phase 5b: 研究 — 交互模式

> 📖 **详细文档**：`references/interactive-mode-guide.md`

### 核心特性

1. **实时归档**：每个概念讲解后立即写入文件（使用 Write 工具）
2. **会话追踪**：通过 `.study-session.json` 追踪进度，支持中断恢复
3. **实时思维导图**：维护知识树，帮助用户建立全局视角
4. **选项式交互**：提供明确的选项，避免重复询问"理解了吗"

### Step 5b.1: 调研阶段（静默分析）

**此阶段不输出任何内容**，仅完成代码分析：

1. **搜索相关文件**：使用 `Glob` 查找文件模式，使用 `Grep` 搜索关键词
2. **阅读关键文件**：使用 `Read` 深入理解核心实现
3. **分析架构设计**：理解模块之间的关系，绘制调用链和数据流
4. **提取核心概念**：整理出需要讲解的关键概念列表

### Step 5b.1a: 创建会话状态文件

**创建 `.study-session.json` 追踪交互进度**：

```json
{
  "schemaVersion": "1.0",
  "repoName": "{仓库名}",
  "topic": "{研究主题}",
  "mode": "interactive",
  "startedAt": "{ISO时间}",
  "lastUpdatedAt": "{ISO时间}",
  "concepts": [
    // 已讲解的概念
  ],
  "pendingConcepts": [
    // 待讲解的概念列表
    {
      "id": "concept-1",
      "name": "{概念名称}",
      "brief": "{一句话说明}"
    }
  ]
}
```

> ⚠️ **Checkpoint - 需要验证（Human-Verify）**
>
> 调研完成后，创建初始思维导图并告知用户：
>
> ```markdown
> 🔍 **调研完成**
>
> 针对问题："{用户的研究问题}"
>
> 我发现了 {n} 个核心概念需要讲解：
>
> 1. **{概念 A}** — {一句话说明}
> 2. **{概念 B}** — {一句话说明}
> 3. **{概念 C}** — {一句话说明}
> ...
>
> 📊 **知识树预览** (进度: 0/{n}):
> ```
> 📁 {研究主题}
> ├── ⏳ 概念 A
> ├── ⏳ 概念 B
> └── ⏳ 概念 C
> ```
>
> 💾 **已生成**:
> - 会话状态: `.study-session.json`
> - 思维导图: `notes/mindmap-{主题}.md`
>
> 我们开始逐步讲解，准备好了吗？
> ```

### Step 5b.2: 逐步讲解流程

**每个概念的讲解循环（含实时归档和思维导图更新）：**

**讲解前：**
```markdown
📊 **知识树导航**

```
📁 {研究主题}
├── ✅ 核心概念A
├── ⏳ 核心概念B
│   ├── ✅ 子概念B1
│   └── 🆕 当前讲解: {概念名称}
└── ⏳ 核心概念C
```

➡️ 接下来深入: **{概念名称}**
```

**讲解后（立即执行，不等待用户）：**
1. 使用 **Write** 工具立即写入文件到 `notes/{主题分类}/{概念名称}.md`
2. 使用 **Write/Update** 更新 `.study-session.json`
3. 使用 **Edit** 更新 `notes/mindmap-{主题}.md`
4. 输出简短确认：
```markdown
💾 **已保存**: notes/architecture/{概念名称}.md
📊 **进度**: {已完成}/{总计}

---

**Checkpoint**:
接下来你想？

1. ✅ 继续下一个概念
2. ⏸️ 暂停并保存进度（稍后用 `/repo-study continue` 恢复）
3. 💡 需要更多解释
4. ❓ 有疑问，想提问
```

### Step 5b.3: 总结与笔记沉淀

**所有概念讲解完毕后：**

```markdown
🎉 **所有概念讲解完成！**

📊 **最终知识树**:
{展示完整的知识树}

📈 **探索统计**:
- 总概念数: {n}
- 已完成: {n}
- 用户延伸分支: {n}
- 最大探索深度: {n}层
- 思维导图: `notes/mindmap-{主题}.md`

📁 **实时归档汇总**:
本次交互已自动归档 {n} 个知识点到 notes/ 目录

**是否需要我生成完整的研究笔记？**

1. 生成完整笔记（保存到 notes/ 目录）
2. 不需要，对话记录就够了
```

> ⚠️ **Checkpoint - 需要用户选择（Decision）**
>
> 如果选择生成笔记，按照 Yolo 模式的格式生成完整笔记。

---

---

## Phase 7: 恢复学习 (continue) — 可选

### Step 7.1: 检查会话状态

```bash
# 检查是否存在会话状态文件
test -f .study-session.json
```

### Step 7.2: 读取并显示进度

如果存在会话状态：
1. 读取 `.study-session.json`
2. 显示上次进度和待讲解概念
3. 询问用户是否继续

**输出示例：**
```markdown
📋 **检测到上次学习进度**

**研究主题**: {主题}
**上次学习时间**: {lastUpdatedAt}
**已完成概念**: {n} 个
**待讲解概念**: {n} 个

**待讲解列表**:
1. ⏳ {概念A} — {一句话说明}
2. ⏳ {概念B} — {一句话说明}

是否继续学习？
1. ✅ 继续
2. ❌ 重新开始
```

### Step 7.3: 继续学习

从下一个待讲解概念继续交互学习。

---

## Phase 6: 产出选择 (output) — Yolo 模式完成后

### Step 6.1: 询问用户下一步

> ⚠️ **Checkpoint - 需要用户选择（Decision）**
>
> 使用 AskUserQuestion：
>
> ```
> 问题：研究完成！你希望接下来做什么？
>
> 选项：
> 1. 继续深入研究（继续探索其他方面）
> 2. 生成实操指南（让小白可以复现这个能力）
> 3. 生成 Skill 模板（封装成可复用的 skill）
> 4. 全部生成（同时生成指南和模板）
> ```

### Step 6.2: 根据选择执行

**选择 1：继续深入研究**
- 等待用户提出新的研究问题
- 返回 Phase 5a (Yolo) 或 Phase 5b (交互) 继续研究

**选择 2：生成实操指南**
- 生成 `notes/{主题}-guide.md`
- **写作风格**：以分享角度记录，让小白也能看懂

**选择 3：生成 Skill 模板**
- 生成 `notes/{主题}-skill.md`
- 使用标准 skill 模板格式

**选择 4：全部生成**
- 同时生成实操指南和 Skill 模板

### Step 6.3: 更新研究日志

在 `notes/RESEARCH-LOG.md` 中更新本次研究记录，并同步 `topics[].progress`。

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
| `/repo-study status` | 仅检查当前目录状态（是否 repo-study 创建、topics、进度、skill 封装状态） |
| `/repo-study translate` | 翻译所有文档 |
| `/repo-study continue` | 恢复上次中断的交互学习 |

**研究模式说明**：
- **Yolo 模式**：直接输出完整研究发现，适合快速了解
- **交互模式**：渐进式教学，分步骤讲解每个概念，适合深入学习

**工具使用提示**：
- 使用 `Glob` 搜索文件：`glob "**/*.ts"`
- 使用 `Grep` 搜索内容：`grep "keyword" --include "*.ts"`
- 使用 `Read` 阅读文件：`read file.ts` 或 `read file.ts --offset 100 --limit 50`
- 使用脚本查询状态和远程版本：`scripts/repo-study-status.sh --json --check-remote`

</commands>

<!-- ========== 四种场景速查 ========== -->
<scenarios>

```
┌─────────────────────────────────────────────────────────────────┐
│                   repo-study 四种场景                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户输入：调研下 xxx 在某领域是如何实现的                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Phase 1: 检测                                            │    │
│  │                                                          │    │
│  │  项目存在？                                              │    │
│  │     ├─ 否 → Phase 2: 创建                               │    │
│  │     └─ 是 → 检查版本                                     │    │
│  │              ├─ 不是最新 → Phase 3: 更新                 │    │
│  │              └─ 已是最新 → 跳过更新                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Phase 4: 模式选择                                        │    │
│  │                                                          │    │
│  │  选择研究模式：                                          │    │
│  │     ├─ Yolo 模式 → Phase 5a: 直接输出完整报告           │    │
│  │     └─ 交互模式 → Phase 5b: 渐进式教学讲解              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Phase 6: 产出选择 (Yolo 模式后)                          │    │
│  │                                                          │    │
│  │  研究完成后询问：                                        │    │
│  │     ├─ 继续深入研究 → 返回 Phase 5                       │    │
│  │     ├─ 生成实操指南 → {主题}-guide.md                   │    │
│  │     ├─ 生成 Skill 模板 → {主题}-skill.md                │    │
│  │     └─ 全部生成 → 同时生成指南和模板                     │    │
│  │                                                          │    │
│  │  最后更新研究日志 RESEARCH-LOG.md                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  版本检查：使用 gh api 比对 commit SHA                           │
│  安全保障：notes/ 目录永不删除                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
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

### ❌ 错误 6：只记录 lastResearchQuestion，不做主题归纳

**错误做法**：每次只覆盖 `lastResearchQuestion`，无法追踪多课题进度

**正确做法**：维护 `topics[]`，按主题持续累积问题和产出

</anti_patterns>

<!-- ========== 成功标准 ========== -->
<success_criteria>
- [ ] 正确解析仓库 URL 和研究问题
- [ ] 检测项目是否存在
- [ ] 仅在当前目录识别 study 状态（不递归）
- [ ] 标识当前项目是否由 repo-study 创建（v2）
- [ ] 使用 `gh api` 检查远程 commit SHA
- [ ] 若本地版本落后，提示用户是否更新
- [ ] 根据检测结果选择正确的分支
- [ ] 创建项目时生成完整文件结构
- [ ] 创建项目时写入 `scripts/repo-study-status.sh`
- [ ] 更新时保留 notes/ 目录
- [ ] 开始研究用户提出的问题
- [ ] 询问用户选择研究模式（Yolo/交互）
- [ ] Yolo 模式：输出完整研究发现
- [ ] 交互模式：分步骤渐进式教学
- [ ] 交互模式：创建 .study-session.json 会话状态文件
- [ ] 交互模式：每一步讲解后立即写入文件（使用 Write 工具）
- [ ] 交互模式：讲解后立即更新会话状态和思维导图（使用 Edit 工具）
- [ ] 交互模式：提供选项让用户选择（继续/暂停/更多解释/提问）
- [ ] 交互模式：实时维护思维导图，展示知识树结构
- [ ] 交互模式：每次交互后更新并展示当前知识树
- [ ] 交互模式：用户提问时在思维导图中延伸新分支
- [ ] 交互模式：生成 mindmap-{主题}.md 文件（文本+Mermaid）
- [ ] `/repo-study continue` 可恢复上次中断的交互学习
- [ ] continue 命令显示上次进度和待讲解概念
- [ ] 沉淀笔记到 notes/ 目录
- [ ] 将研究过程按主题写入 `topics[]`（支持同主题多轮追加）
- [ ] 维护持续进度统计（不使用完成态）
- [ ] `/repo-study status` 可查询 topics / 进度 / skill 封装状态
- [ ] 如果用户使用中文提问，提示可使用 `/repo-study translate` 翻译文档
- [ ] 研究完成后询问用户下一步选择
- [ ] 根据用户选择生成对应的产出（实操指南/Skill模板）
- [ ] 更新研究日志记录产出
</success_criteria>

<!-- ========== 快速参考 ========== -->
<quick_reference>

## 使用示例

```bash
# 场景 1: 首次创建 + Yolo 模式研究
调研下 git@github.com:chris-hendrix/claudehub.git 在 Agent 通信方面是如何实现的
# → 选择 Yolo 模式 → 直接输出完整报告

# 场景 2: 首次创建 + 交互模式研究
调研下 claudehub 的 prompt engineering 技巧
# → 选择交互模式 → 分步骤渐进式教学

# 场景 3: 已存在 + 有更新 + 研究
调研下 claudehub 的错误处理机制
# → 检测到有更新，询问是否更新后继续研究

# 场景 4: 已存在 + 已是最新 + 直接研究
调研下 claudehub 的插件系统
# → 检测到已是最新，直接开始研究
```

## 研究模式选择

**Yolo 模式（快速模式）**：
- 直接输出完整研究发现
- 包含完整的代码分析和设计亮点
- 适合快速了解整体实现

**交互模式（教学模式）**：
- 先静默调研，不输出内容
- 创建 `.study-session.json` 会话状态文件
- 将发现拆分为多个小概念
- 逐步讲解，每步一个概念
- **实时归档**：讲解后立即写入文件（使用 Write 工具）
- **实时更新**：立即更新会话状态和思维导图（使用 Edit 工具）
- **实时思维导图**：每步展示当前知识树位置和进度
- 每步后提供选项：继续/暂停/更多解释/提问
- 支持 `/repo-study continue` 恢复中断的学习
- 适合深入学习和教学场景

## 版本检查命令

```bash
# 获取远程最新 commit
gh api repos/OWNER/REPO/commits/main --jq '.sha'

# 读取本地记录的 commit
cat ~/jacky-github/REPO-study/.study-meta.json | jq -r '.repo.commitSha // .commitSha'
```

## 当前目录状态查询（status）

```bash
# 仅当前目录
scripts/repo-study-status.sh --check-remote

# JSON 输出
scripts/repo-study-status.sh --json --check-remote
```

</quick_reference>

<!-- ========== 参考文档 ========== -->
<references>

| 文件 | 用途 |
|------|------|
| `references/state-templates.md` | **状态模板与检测逻辑**（.study-meta.json v2 结构、status 脚本输出格式） |
| `references/interactive-mode-guide.md` | **交互模式详细指南**（实时归档、思维导图、知识树结构） |

</references>

---

## ⚠️ 用户交互点总结

> 执行此 skill 时，**必须** 在以下节点等待用户操作：

| 阶段 | 交互点 | 类型 | 用户操作 |
|------|--------|------|----------|
| Phase 1 | 🛑 版本落后提示 | Decision | 选择是否更新源码 |
| Phase 2 | ✅ 文件结构验证 | Human-Verify | 确认文件结构完整 |
| Phase 3 | 🔄 更新确认 | Decision | 选择是否更新 |
| Phase 4 | 🔄 模式选择 | Decision | 选择 Yolo/交互模式 |
| Phase 5b | ✅ 调研完成确认 | Human-Verify | 确认概念列表，准备开始讲解 |
| Phase 5b | 🔄 理解确认 | Decision | 选择继续/暂停/更多解释/提问 |
| Phase 5b | 🔄 笔记生成 | Decision | 选择是否生成完整笔记 |
| Phase 6 | 🔄 产出选择 | Decision | 选择继续研究/指南/模板/全部 |
| Phase 7 | 🔄 恢复确认 | Decision | 选择继续/重新开始 |

**交互点类型说明**：
- **Human-Verify（验证型）**：Claude 完成工作后，用户视觉/交互验证
- **Decision（决策型）**：需要用户选择实现方向
- **Human-Action（行动型）**：需要用户执行认证/授权等操作

**LLM 执行提示**：
- 遇到 🛑 标记时 → **必须等待用户确认**，不能自动跳过
- 遇到 ✅ 标记时 → **需要验证结果**，确认后才继续
- 遇到 🔄 标记时 → **需要用户选择**，使用 AskUserQuestion 提供选项
