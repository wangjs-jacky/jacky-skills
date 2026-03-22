# GSD 对齐的 Skill XML 词汇表（参考）

## 与运行时格式的关系

- **Claude Code / j-skills 加载的仍是** 根目录下的 `SKILL.md`（YAML frontmatter + Markdown）。本文件中的 XML **不是**替代格式，而是**结构化编排、复用与团队对齐**用的约定。
- 若你在别处看到 **工具调用 XML**（例如 `<function_calls>` / `<invoke name="Task">`），那是 **Agent 对工具的调用示例**，见下文「与 multi-agent 式 XML 的差异」。

## 设计原则

1. **稳定词汇**：标签名一旦写入多个 skill，改名成本高；优先用本表中的名称。
2. **命名空间**：GSD 风格内容建议使用前缀 `gsd:`（XML 里写作 `gsd:phase` 等）或统一用 `<gsd-...>` 扁平标签，避免与 `<invoke>`、`<function_calls>` 等**工具协议**标签混淆。
3. **可嵌套**：容器类标签（如 `workflow`）内放步骤类标签（如 `phase`、`checkpoint`）。
4. **可降级**：任何 XML 块都应能一一映射到 Markdown 标题与列表，便于只写 MD 的同事阅读。

## 标签速查表

以下标签对应 **Get Shit Done 类**工作流（研究 → 规划 → 执行 → 验收）的常见阶段；若你的 GSD 源码或笔记中有不同命名，以**你的仓库为准**更新本表，并记在 `CHANGELOG.md`。

| 标签（示例） | 含义 | 必需 | 典型子元素 | Markdown 映射 |
|--------------|------|------|------------|-----------------|
| `<gsd:workflow>` | 整段 skill 的可执行主线 | 否 | `meta`, `phase`, `checkpoint` | `#` 标题 + 「执行流程」整节 |
| `<gsd:meta>` | 名称、版本、触发词、依赖 | 否 | `name`, `trigger`, `requires` | frontmatter + 简介段 |
| `<gsd:goal>` | 本 skill 要达成的可验证目标 | 推荐 | 文本或 `criterion` | 「目标 / 成功标准」小节 |
| `<gsd:phase>` | 逻辑阶段（如 research / plan / execute / verify） | 常用 | `step`, `checkpoint` | `## 阶段名` 或 `### 步骤 n` |
| `<gsd:step>` | 阶段内单步 | 常用 | 文本、`input`, `output` | 有序列表项或 `####` |
| `<gsd:checkpoint>` | 必须满足的闸门（未满足则停止或回退） | 可选 | 文本、`on-fail` | 「停止条件」「验收」加粗提示 |
| `<gsd:research>` | 研究子流程占位 | 可选 | `question`, `source` | 「先调研再动手」类说明 |
| `<gsd:plan>` | 规划子流程占位 | 可选 | `task`, `dependency` | 任务列表、依赖说明 |
| `<gsd:execute>` | 执行子流程占位 | 可选 | `step` | 与 `phase` 类似，偏实施 |
| `<gsd:verify>` | 验证 / 测试 / 回顾 | 可选 | `command`, `criterion` | 「验证命令」「完成前检查」 |

**属性示例**：`<gsd:phase name="verify" order="4">` — 便于排序与生成文档。

## 最小完整示例（XML）

```xml
<gsd:workflow>
  <gsd:meta>
    <name>example-skill</name>
    <trigger>用户提到验收、harness</trigger>
  </gsd:meta>
  <gsd:goal>输出可检测的验收标准并与用户确认</gsd:goal>
  <gsd:phase name="research">
    <gsd:step>阅读用户现有代码或约束</gsd:step>
    <gsd:checkpoint>若需求模糊，先追问再往下</gsd:checkpoint>
  </gsd:phase>
  <gsd:phase name="plan">
    <gsd:step>列出可执行步骤与依赖</gsd:step>
  </gsd:phase>
  <gsd:phase name="verify">
    <gsd:step>给出验证方式（命令、快照、断言）</gsd:step>
  </gsd:phase>
</gsd:workflow>
```

## 对照：同一内容用 Markdown 写

```markdown
## 目标

输出可检测的验收标准并与用户确认。

## 执行流程

### 阶段：research

1. 阅读用户现有代码或约束
2. **Checkpoint**：若需求模糊，先追问再往下

### 阶段：plan

1. 列出可执行步骤与依赖

### 阶段：verify

1. 给出验证方式（命令、快照、断言）
```

写作时二选一为主：**以 MD 为正文**，需要团队对齐或从 GSD 模板复制时，用 XML 片段放在 `SKILL.md` 的 fenced code block 内（hybrid）。

## 与 multi-agent 式 XML 的差异

| 维度 | 本词汇表（GSD / workflow） | multi-agent 等 skill 中的 XML |
|------|----------------------------|--------------------------------|
| 用途 | 描述 **skill 内部流程、阶段、闸门** | 描述 **如何调用 Task 等工具**（示例格式） |
| 典型根元素 | `<gsd:workflow>` 或扁平 `<gsd:phase>` | `<function_calls>`、`<invoke>` |
| 是否随产品协议变更 | 由本仓库维护，偏文档约定 | 需与 Agent 实际 tool schema 一致 |
| 所在位置 | `references/gsd-xml-tags.md`；可嵌入 `SKILL.md` 代码块 | 例如仓库内 `plugins/dev-advanced/skills/multi-agent/SKILL.md` |

**不要**把 `<invoke>` 的 parameter 名抄进 GSD 词汇表当作「阶段名」，二者层次不同。

## 从笔记同步标签时

将 `notes-import` 中的 GSD 标签合并进本表时：

1. 新增行到「标签速查表」，并标注 `experimental`（若未经验证）。
2. 在 `CHANGELOG.md` 记一条：日期、来源文件、变更摘要。
