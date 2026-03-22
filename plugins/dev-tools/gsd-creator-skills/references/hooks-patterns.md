# Hooks 与上下文：分场景说明

「Hooks」在不同技术栈里含义不同。写 skill 或配套脚本时，先分清**你指的是哪一种**，避免把 Claude 运行时钩子与语言层模式混为一谈。

---

## 1. Claude Code / 项目级 hook 脚本

部分工作流在仓库或用户目录下配置 **shell 脚本**，在固定生命周期点执行（例如某工具调用前后），用于日志、门禁、注入上下文等。

**特点**：

- 由 **Claude Code（或相关工具）** 配置与触发，不是 `SKILL.md` 里的 Markdown。
- 路径与命名依赖具体版本与文档；实现前以你本机官方文档为准。

**与本 skill 的关系**：若你为某项目写了 hook 脚本，可在对应 skill 的 `references/` 里**说明**「触发时机 + 脚本路径约定」，但不要假装所有环境都有同一套 hook。

**仓库内交叉引用**（示例）：监控相关文档中曾出现 `hooks/pre-tool-use`、`hooks/post-tool-use` 等文件名，见 `plugins/monitoring/docs/FUTURE-AGENT.md`（仅作风格参考，非全局规范）。

---

## 2. Skill 内的「逻辑钩子」（checkpoint）

不是可执行文件，而是 **`SKILL.md` 里写明的强制顺序**：

- 用标题或加粗明确写出：**「在 X 之前必须先做 Y」**。
- 典型场景：收到 code review 反馈时先读 `receiving-code-review`；声称完成前先跑验证命令（见 `verification-before-completion` 等 superpowers skill）。

**写法建议**：

- 用有序列表 + **Checkpoint** 小标题，与 `gsd-xml-tags.md` 中的 `<gsd:checkpoint>` 对应。
- 与 `scripts/` 目录下的真实脚本区分：逻辑钩子是 **给模型读的约束**，脚本是 **给机器执行的**。

---

## 3. Clojure：用「有状态」结构保存上下文

在 **Clojure 脚本、REPL 工具链或 `scripts/` 里的小工具** 中，若需要在多步之间记住「会话上下文」（例如上一轮解析出的路径、用户选择的分支），常见做法包括：

- **`atom`**：存放可变引用；多步函数里 `swap!` / `reset!` 更新，适合简单会话状态。
- **`memoize` / 显式缓存**：避免重复计算昂贵步骤；注意 key 要包含影响结果的输入。
- **动态绑定 `binding`**：在有限作用域内覆盖「当前请求上下文」，适合测试或单次管道。
- **带 `context` 参数的纯函数管道**：每一步 `{:ctx ... :result ...}`，最易测试；需要持久化时再写入 atom 或文件。

**注意**：这里说的不是 React 的 `useState`；若你在 **前端** 用 React Hooks 存上下文，那是另一套生态，见下一节。

**与 skill 文档的关系**：若 skill 附带 Clojure 脚本，可在 `references/` 或脚本注释中说明「上下文存在哪个 atom / 哪个 edn 文件」，避免模型在说明中编造不存在的全局变量。

---

## 4. React / 前端 Hooks（易混淆）

在 **React** 中，`useXxx` 用于组件生命周期与状态；与 Claude 的 hook **脚本**无关。

**写作建议**：在 skill 里若同时涉及「Claude 项目 hook」和「React useEffect」，用**明确小标题**分开，避免一句「用 hooks 记上下文」产生歧义。

---

## 5. 选型速查

| 你的目标 | 优先考虑 |
|----------|----------|
| 在 Claude 会话前后自动跑命令 | 项目/用户文档中的 **Claude Code hook** 配置 |
| 约束模型必须先读某 skill 再回复 | **Skill 内 checkpoint**（Markdown） |
| Clojure 脚本多步共享数据 | **atom**、显式 **context map**、或 `binding` |
| 前端组件内状态 | **React Hooks**（与上表无关） |

---

## 更新本文件时

从 `notes-import` 或 GSD 笔记中补充新模式时，请标明**语言/运行时**（Clojure / Bash / React / Claude），并在 `CHANGELOG.md` 记一条。
