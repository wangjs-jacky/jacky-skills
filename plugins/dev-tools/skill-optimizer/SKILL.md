---
name: skill-optimizer
description: 诊断并优化 Skills 的持续改进工具。触发词：优化 skill、skill 没触发、为什么没有、skill 诊断、skill-optimizer
---

<role>
你是一个 Skills 持续优化专家。帮助用户诊断 skill 执行问题，分析原因，并使用 Agent 在独立上下文中执行优化。
</role>

<purpose>
当某个 skill 执行时，预期功能没有被触发，自动诊断原因并优化 skill 逻辑。
</purpose>

<philosophy>
**核心理念：问题驱动，Agent 保护，持续优化。**

- 用户只需描述"哪个 skill 没触发什么功能"
- 自动诊断问题根因（触发条件/流程缺失/逻辑错误）
- 使用 Agent 在独立上下文中执行优化，保护主会话
- 优化后输出修改摘要和使用建议
</philosophy>

<trigger>
```
/repo-study 为什么没有触发翻译功能
skill-optimizer repo-study 翻译功能没触发
优化下 xxx skill，它没有自动执行 yyy
xxx skill 有问题，为什么没有触发 yyy
诊断 xxx skill 的触发条件
```
</trigger>

<!-- ========== GSD Workflow XML 结构 ========== -->
<gsd:workflow>
  <gsd:meta>
    <name>skill-optimizer</name>
    <trigger>优化 skill、skill 没触发、为什么没有、skill 诊断</trigger>
    <requires>Read, Glob, Grep, Agent</requires>
  </gsd:meta>

  <gsd:goal>诊断 skill 问题，使用 Agent 执行优化，保护主会话上下文</gsd:goal>

  <gsd:phase name="parse" order="1">
    <gsd:step>解析用户输入，提取 skill 名称和问题描述</gsd:step>
    <gsd:step>定位 skill 文件路径</gsd:step>
    <gsd:checkpoint>确认 skill 存在且可访问</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="diagnose" order="2">
    <gsd:step>阅读 skill 完整内容</gsd:step>
    <gsd:step>分析 skill 结构（触发条件/流程/命令）</gsd:step>
    <gsd:step>诊断问题根因</gsd:step>
    <gsd:checkpoint>输出诊断报告，确认优化方向</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="optimize" order="3">
    <gsd:step>设计优化方案</gsd:step>
    <gsd:step>使用 Agent 在独立上下文中执行优化</gsd:step>
    <gsd:step>验证优化结果</gsd:step>
  </gsd:phase>
</gsd:workflow>

<!-- ========== 执行流程 ========== -->
<process>

## Phase 1: 解析 (parse)

### Step 1.1: 提取信息

从用户输入中提取：

| 信息 | 示例 |
|------|------|
| skill 名称 | `repo-study`、`j-skills`、`skill-optimizer` |
| 问题描述 | "没有触发翻译功能"、"没有自动执行 xxx" |

### Step 1.2: 定位 skill 文件

```bash
# 搜索 skill 位置
find ~/.claude/skills -name "SKILL.md" -exec grep -l "name: xxx" {} \;

# 或在项目目录中搜索
find ~/jacky-github/jacky-skills -name "SKILL.md" -exec grep -l "name: xxx" {} \;
```

**常见位置：**
- `~/.claude/skills/<skill-name>/SKILL.md` (全局安装)
- `~/jacky-github/jacky-skills/plugins/**/SKILL.md` (项目目录)
- `~/jacky-github/jacky-skills/skills/**/SKILL.md` (独立 skills)

**Checkpoint**: 如果找不到 skill 文件，询问用户确认 skill 名称是否正确。

---

## Phase 2: 诊断 (diagnose)

### Step 2.1: 分析 skill 结构

阅读 skill 内容，重点关注:

```bash
# 提取关键结构
grep -E "^##|^<commands>|<process>|<trigger>|<gsd:phase>" SKILL.md
```

**结构分析清单：**

| 组件 | 检查点 |
|------|--------|
| `description` | 触发词是否足够具体？ |
| `<trigger>` | 是否包含相关示例？ |
| `<commands>` | 命令是否明确定义？ |
| `<process>` | 流程步骤是否完整？ |
| `<gsd:phase>` | 阶段是否覆盖所有场景？ |

### Step 2.2: 诊断问题根因

**常见问题诊断表：**

```
┌─────────────────┬──────────────────┬────────────────────────────┐
│     问题类型     │      症状        │          诊断方向           │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 命令未触发      │ 命令存在但没执行 │ 检查是否为独立命令    │
│                 │                  │ → 需要显式调用           │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 触发条件不匹配   │ skill 没被触发   │ 检查 description          │
│                 │                  │ → 添加更多 trigger 词   │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 功能缺失        │ 预期功能不存在  │ 检查是否设计遗漏        │
│                 │                  │ → 评估是否需要添加       │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 自动执行逻辑问题 │ 应自动执行但没执行 │ 检查流程中是否有自动触发 │
│                 │                  │ → 添加自动执行逻辑     │
├─────────────────┼──────────────────┼────────────────────────────┤
│ 输出格式问题    │ 结果难以理解     │ 检查输出结构            │
│                 │                  │ → 标准化输出格式        │
└─────────────────┴──────────────────┴────────────────────────────┘
```

### Step 2.3: 输出诊断报告

```markdown
## 🔍 诊断报告

### 问题分析
- **Skill**: {skill-name}
- **预期功能**: {用户期望的功能}
- **实际行为**: {skill 实际做了什么}

### 诊断结果
- **问题类型**: 命令未触发 / 触发条件不匹配 / 功能缺失 / 自动执行逻辑问题
- **根本原因**: {详细说明}

### 优化方向
- [ ] 方向 1: {说明}
- [ ] 方向 2: {说明}

是否需要我执行优化？
```

**Checkpoint**: 使用 AskUserQuestion 确认是否执行优化。

---

## Phase 3: 优化 (optimize) - 使用 Agent 保护上下文

### Step 3.1: 使用 Agent 执行优化

**重要**: 使用 Agent 模式在独立上下文中执行优化，避免消耗主会话 token。

```javascript
Agent({
  subagent_type: "general-purpose",
  description: "优化 skill 逻辑",
  prompt: `
你是一个 Skill 优化专家。请优化以下 skill。

## Skill 路径
{skill_path}

## 问题描述
{问题描述}

## 诊断结果
{诊断结果}

## 优化要求
1. 阅读当前 skill 内容
2. 根据诊断结果设计优化方案
3. 执行修改
4. 输出修改摘要（不要输出完整代码）
5. 提供使用建议

注意：
- 只修改必要的部分，不要大规模重构
- 保持与现有风格一致
- 使用 GSD 风格的 XML 标签（如适用）
`
})
```

### Step 3.2: 鸸证优化结果

Agent 完成后， 检查:
- 修改是否合理
- 是否解决了问题
- 是否有其他影响

### Step 3.3: 输出优化摘要

```markdown
## ✅ 优化完成

### 修改摘要
| 文件 | 修改内容 |
|------|---------|
| {file} | {简要说明} |

### 新增/修改内容
{描述新增或修改的功能}

### 使用建议
1. {建议 1}
2. {建议 2}

### 后续验证
- [ ] 测试 skill 触发
- [ ] 验证功能执行
- [ ] 检查是否有副作用
```

</process>

<!-- ========== 常见问题诊断模式 ========== -->
<diagnosis_patterns>

## 一、命令未触发问题

### 症状
- skill 文档中定义了命令（如 `/xxx translate`）
- 但执行时命令没有被识别
- 需要显式调用才能执行

### 诊断步骤
1. 检查 skill 的 `<commands>` 部分
2. 确认命令是否在 commands 中明确定义
3. 检查 `<process>` 中是否有对应的执行逻辑
4. 确认： 是独立功能还是流程的一部分？

### 优化方向
**方案 A: 添加自动触发**
```markdown
## Phase X: 自动执行

### Step X.X: 自动 {功能名}
+ 检测条件
+ 如果满足，自动执行
```

**方案 B: 添加别名/快捷方式**
```markdown
触发条件支持:
- 旧触发词
- 新触发词: 等同旧触发词 + {新触发词}
```

## 二、触发条件不匹配问题

### 症状
- skill 存在但没有被触发
- description 不够具体
- 触发词不匹配用户输入模式

### 诊断步骤
1. 检查 `description` 字段
2. 检查 `<trigger>` 示例
3. 分析是否有歧义
4. 检查是否有多个 skill 使用相同触发词

### 优化方向
**方案 A: 扩展触发词**
```yaml
description: 扩展后的描述，包含更多触发词： xxx, yyy, zzz, aaa
```

**方案 B: 添加更具体的触发示例**
```markdown
<trigger>
```
# 原有示例
/repo-study <url> <问题>

# 新增示例
调研下 xxx
研究下 xxx
学习下 xxx
```
</trigger>
```

## 三、功能缺失问题

### 症状
- 预期功能在 skill 中找不到
- 没有对应的 process 步骤
- 没有对应的 commands 定义

### 诊断步骤
1. 明确缺失的功能是什么
2. 检查是否是设计遗漏还是有意为之
3. 评估功能的重要性和通用性
4. 确定实现方式

### 优化方向
**方案 A: 添加新功能模块**
```markdown
## Phase X: {功能名}

### Step X.1: {功能描述}
+ 宣传步骤

### Step X.2: 执行逻辑
+ 具体实现

**方案 B: 添加可选步骤**
```markdown
## Phase X: 可选 {功能名}

> 沉淀笔记后，可选：翻译所有文档

### Step X.1: 检查是否需要翻译
+ ...
```
```

## 四、自动执行逻辑问题

### 症状
- 功能应该自动执行但没有
- 分析结果不完整
- 流程中断

### 诊断步骤
1. 评估 skill 的复杂度
2. 检查是否有大量文件读取
3. 分析是否适合使用 Agent
4. 确认是否需要分阶段执行

### 优化方向
**方案 A: 使用 Agent 模式**
- 将复杂分析委派给 Agent
- 使用 subagent_type=general-purpose
- 在独立上下文中执行
- 返回摘要信息

**方案 B: 分阶段执行**
- 添加 continue 命令
- 支持暂停和恢复
- 使用 task-memory 保存进度

## 五、输出格式问题

### 症状
- skill 输出格式不规范
- 用户难以理解结果
- 后续处理困难

### 诊断步骤
1. 检查输出是否有明确结构
2. 确认是否使用了 markdown 表格
3. 检查是否有代码块格式化
4. 验证链接和引用是否正确

### 优化方向
**方案 A: 标准化输出格式**
- 使用统一的 markdown 模板
- 添加表格总结
- 使用 callout 高亮重要信息
- 添加快速参考部分

</diagnosis_patterns>

<!-- ========== 反模式 ========== -->
<anti_patterns>

### ❌ 错误 1：在主会话中直接读取大量代码
**错误做法**：直接 Read 整个 skill 文件和所有 references
**正确做法**：使用 Agent 在独立上下文中分析

### ❌ 错误 2：不诊断直接修改
**错误做法**：凭猜测直接修改 skill
**正确做法**：先诊断问题根因，再针对性优化

### ❌ 错误 3：优化后不验证
**错误做法**：修改后直接结束
**正确做法**：输出修改摘要，提供使用建议

### ❌ 错误 4：忽略用户确认
**错误做法**：诊断后直接修改，不询问用户
**正确做法**：输出诊断报告，使用 AskUserQuestion 确认

### ❌ 错误 5：大规模重构
**错误做法**：重写整个 skill 结构
**正确做法**：只修改必要的部分，保持与现有风格一致

</anti_patterns>

<!-- ========== 成功标准 ========== -->
<success_criteria>
- [ ] 正确解析 skill 名称和问题描述
- [ ] 定位到 skill 文件
- [ ] 分析 skill 结构
- [ ] 诊断出问题根因
- [ ] 输出诊断报告
- [ ] 获得用户确认
- [ ] 使用 Agent 执行优化
- [ ] 验证优化结果
- [ ] 提供使用建议
</success_criteria>

<!-- ========== 快速参考 ========== -->
<quick_reference>

## 使用示例

```bash
# 示例 1: 诊断命令未触发
/repo-study 为什么没有触发翻译功能
# → 诊断：translate 是独立命令，需要显式调用
# → 优化：在 research 阶段结束后提示用户

# 示例 2: 诊断功能缺失
skill-optimizer j-skills 没有批量安装功能
# → 诊断：commands 中没有 batch-install
# → 优化：添加批量安装命令

# 示例 3: 诊断触发问题
skill-optimizer parallel-translation 没有被触发
# → 诊断：description 缺少"翻译"触发词
# → 优化：扩展 description
```

## 诊断命令速查

```bash
# 搜索 skill 位置
find ~/.claude/skills -name "SKILL.md" -exec grep -l "name: xxx" {} \;

# 搜索关键词
grep -r "translate" ~/.claude/skills/xxx/SKILL.md

# 查看 skill 结构
grep -E "^##|^<commands>|<process>|<trigger>" SKILL.md
```

</quick_reference>
