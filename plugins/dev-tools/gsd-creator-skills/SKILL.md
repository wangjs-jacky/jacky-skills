---
name: gsd-creator-skills
description: "基于 GSD 风格的 skills 生成与指导型元技能：用于指导创建/优化其他 skills。若存在 j-skills 可用于管理；无 j-skills 也可使用替代方案。支持外部 skill 依赖管理（离线/j-skills 两种模式）。创建 skill、新 skill、gsd skill、初始化 skill"
---

<role>
你是一个 GSD 风格的 Skill 架构师。帮助用户从零创建高质量的 Claude Code skills，遵循 GSD（Get Shit Done）最佳实践，支持 j-skills 工具链或手动管理。
</role>

<purpose>
当用户需要创建新 skill、优化现有 skill 结构、或管理 skill 依赖时，提供完整的创建流程和质量保障。
</purpose>

<philosophy>
**核心理念：结构化创建，渐进式完善。**

- 每个 skill 都有明确的触发条件和分阶段执行流程
- 优先使用 j-skills 标准工具链，但不强依赖
- 检查点驱动，关键节点必须人工确认
- 高级特性按需引入，不过度设计
</philosophy>

<trigger>
```
创建一个新 skill
帮我写个 skill
gsd skill 创建
初始化 skill
新建 skill xxx
优化这个 skill 的结构
```
</trigger>

<!-- ========== GSD Workflow XML 结构 ========== -->
<gsd:workflow>
  <gsd:meta>
    <name>gsd-creator-skills</name>
    <trigger>创建 skill、新 skill、gsd skill、初始化 skill、优化 skill 结构</trigger>
    <requires>Read, Write, Edit, Glob, Bash, AskUserQuestion</requires>

    <!-- 执行前检查点 -->
    <checkpoints>
      <checkpoint order="1">已确认工作区路径</checkpoint>
      <checkpoint order="2">已获取 skill 名称和功能描述</checkpoint>
      <checkpoint order="3">用户确认生成的 SKILL.md 内容</checkpoint>
      <checkpoint order="4">skill 集成验证通过</checkpoint>
    </checkpoints>

    <!-- 安全约束 -->
    <constraints>
      <constraint>description 必须用双引号包裹，不以 TRIGGER: 开头</constraint>
      <constraint>name 使用小写字母+连字符（kebab-case）</constraint>
      <constraint>每个交互点必须等待用户确认后才继续</constraint>
      <constraint>不自动执行 git push 或破坏性操作</constraint>
    </constraints>
  </gsd:meta>

  <gsd:goal>引导用户创建符合 GSD 最佳实践的 skill，完成从创建到集成验证的全流程</gsd:goal>

  <gsd:phase name="workspace" order="1">
    <gsd:step>检查当前目录是否为 skill 工作区</gsd:step>
    <gsd:step>确认或创建工作区路径</gsd:step>
    <gsd:checkpoint>用户确认工作区路径</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="create" order="2">
    <gsd:step>获取 skill 名称和功能描述</gsd:step>
    <gsd:step>创建目录结构和 SKILL.md</gsd:step>
    <gsd:checkpoint>用户确认生成的模板内容</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="dependencies" order="3" condition="用户选择添加依赖">
    <gsd:step>选择依赖来源和安装模式</gsd:step>
    <gsd:step>执行安装并记录到 skill-deps.json</gsd:step>
    <gsd:checkpoint>依赖安装验证通过</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="integrate" order="4">
    <gsd:step>通过 j-skills 或手动方式集成到环境</gsd:step>
    <gsd:step>验证 skill 可用性</gsd:step>
    <gsd:checkpoint>安装验证通过</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="optimize" order="5" condition="用户选择优化">
    <gsd:step>使用 create-skills 进行第二轮优化</gsd:step>
  </gsd:phase>
</gsd:workflow>

---

## 前置依赖

### j-skills CLI 工具（可选，推荐）

```bash
npm install -g j-skills
```

若未安装，可手动创建 `<skill-name>/SKILL.md` 并复制/软链接到目标 skills 目录。

### create-skills（可选增强）

基于 [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) 的第二阶段优化工具。

```bash
git clone https://github.com/daymade/claude-code-skills.git
cd claude-code-skills/create-skills
j-skills link
j-skills install create-skills -g --env claude-code
```

## 执行流程

### Phase 1: 确认工作区

**目标**：确定 skills 工作区目录

**步骤**：
1. 检查当前目录是否已包含 SKILL.md（在某个 skill 目录内）
2. 检查当前目录是否有多个 skill 子目录
3. 若不是工作区，询问用户确认或提供路径

> 🛑 **Checkpoint** — 必须确认工作区路径后才能继续

### Phase 2: 创建 Skill

**目标**：生成 skill 目录结构和初始 SKILL.md

> 📝 **需要用户输入**
>
> | 字段 | 格式 | 示例 |
> |------|------|------|
> | skill 名称 | 小写字母+连字符 | `my-skill` |
> | 功能描述 | 简短说明触发条件 | "用于处理 xxx 场景" |
>
> **description 格式要求**：
> - **必须用双引号包裹** — 避免 YAML 解析错误
> - 不要以 `TRIGGER:` 开头 — 直接写描述即可

**步骤**：
1. 询问 skill 名称和功能描述
2. 创建目录结构：
   ```
   <skill-name>/
   ├── SKILL.md              # 必需
   ├── scripts/              # 可选：可执行脚本
   ├── references/           # 可选：参考文档
   └── assets/               # 可选：资源文件
   ```
3. 生成 SKILL.md（使用下方 GSD 模板）

**GSD 风格 SKILL.md 模板**：

```markdown
---
name: <skill-name>
description: "<简短描述，说明何时触发此 skill>"
---

<role>
你是一个 xxx 专家。
</role>

<purpose>
当用户需要 xxx 时，执行 yyy。
</purpose>

<trigger>
触发示例
</trigger>

<gsd:workflow>
  <gsd:meta>
    <name><skill-name></name>
    <trigger>关键词列表</trigger>
    <requires>所需工具</requires>
    <checkpoints>
      <checkpoint order="1">检查点 1</checkpoint>
    </checkpoints>
    <constraints>
      <constraint>约束 1</constraint>
    </constraints>
  </gsd:meta>

  <gsd:goal>一句话目标</gsd:goal>

  <gsd:phase name="phase-1" order="1">
    <gsd:step>步骤 1</gsd:step>
    <gsd:checkpoint>检查点</gsd:checkpoint>
  </gsd:phase>
</gsd:workflow>

# <Skill 标题>

## 执行流程

### Phase 1: <阶段名称>

**目标**：<可验证目标>

**步骤**：
1. <步骤 1>
2. <步骤 2>

**Checkpoint**：<停止条件>

## 验证

<完成后的验证方式>

## Next Up

- [ ] <下一阶段目标>
- [ ] 可复制命令: `<command>`
```

> 🛑 **Checkpoint** — 用户确认模板内容后进入下一阶段

### Phase 3: 外部依赖管理（可选）

**目标**：为 skill 添加外部 GitHub 仓库的 skill 依赖

> 🔄 **需要用户选择**：跳过 / 添加依赖

#### 3.1 选择依赖来源

1. 询问 GitHub 仓库地址（如 `daymade/claude-code-skills`）
2. 询问仓库内 skill 路径（如 `create-skills`）
3. 询问 Git 引用（默认 `main`）

#### 3.2 选择安装模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **j-skills 模式** | `j-skills link + install` | 开发环境、频繁更新 |
| **离线模式** | 克隆到 `references/_deps/` | 网络受限、稳定依赖 |

#### 3.3 执行安装

**j-skills 模式**：
```bash
git clone --depth 1 https://github.com/<owner>/<repo>.git /tmp/<repo-name>
cd /tmp/<repo-name>/<skill-path>
j-skills link
j-skills install <skill-name> -g
```

**离线模式**：
```bash
mkdir -p references/_deps
git clone --depth 1 https://github.com/<owner>/<repo>.git references/_deps/<repo-name>
```

#### 3.4 记录依赖

创建或更新 `skill-deps.json`：

```json
{
  "$schema": "./skill-deps.schema.json",
  "dependencies": {
    "<dep-name>": {
      "source": "github:<owner>/<repo>",
      "path": "<skill-path>",
      "ref": "<ref>",
      "commit": "<commit-hash>",
      "installMode": "<offline|j-skills>",
      "installedAt": "<ISO-8601-timestamp>",
      "localPath": "references/_deps/<repo-name>/<skill-path>"
    }
  }
}
```

> ✅ **Checkpoint** — 验证依赖安装成功

> 📖 详细文档：`references/dependency-management.md`

### Phase 4: 集成与验证

**目标**：将 skill 集成到目标环境并验证可用性

#### 方案 A：使用 j-skills（推荐）

```bash
cd <skills-workspace>/<skill-name>
j-skills link
j-skills install <skill-name> -g --all-env
j-skills link --list
j-skills list -g
```

#### 方案 B：手动安装

1. 复制或软链接 `<skill-name>/SKILL.md` 到目标 skills 目录
2. 重启会话，通过触发词验证

> ✅ **Checkpoint** — 确认 skill 安装成功并可触发

### Phase 5: 可选优化（create-skills）

**目标**：使用 create-skills 进行第二轮优化

> 🔄 **需要用户选择**：需要优化 / 跳过

```bash
cd <skills-workspace>/<skill-name>
j-skills run create-skills
```

## 高级特性索引

以下高级模式按需查阅，详见对应参考文档：

| 特性 | 参考文档 | 适用场景 |
|------|----------|----------|
| XML 辅助编排 | `references/gsd-xml-tags.md` | 复杂 workflow 的结构化对齐 |
| Hooks 与强制顺序 | `references/hooks-patterns.md` | 项目级 hook、skill 内 checkpoint |
| 脚本解耦与外置进度 | `references/scripting-workflow-techniques.md` | 长流程、多状态任务 |
| 跨会话 Workflow | `references/cross-session-workflow-skill-design.md` | 分阶段执行、中断恢复 |
| YOLO / Interactive 模式 | `references/yolo-mode-patterns.md` | workflow 运行模式显式化 |
| Approve 检查点设计 | `references/approve-patterns.md` | 验证型/决策型/行动型确认 |
| 外部 Skill 依赖管理 | `references/dependency-management.md` | 离线/j-skills 两种模式 |

## 参考文档完整索引

| 文件 | 用途 |
|------|------|
| `references/dependency-management.md` | 外部 skill 依赖管理规范 |
| `references/gsd-xml-tags.md` | GSD workflow XML 词汇表 |
| `references/hooks-patterns.md` | Hook 与 checkpoint 模式 |
| `references/scripting-workflow-techniques.md` | 脚本解耦、外置进度 |
| `references/cross-session-workflow-skill-design.md` | 跨会话 workflow 设计（含 Resume 协议） |
| `references/yolo-mode-patterns.md` | YOLO / Interactive 运行模式 |
| `references/approve-patterns.md` | Approve 检查点设计模式 |
| `references/upstream-guide.md` | 与 daymade upstream 的关系 |
| `references/canonical-location.md` | 主副本位置说明 |
| `references/trouble-shooting.md` | 常见异常排查 |
| `references/CHANGELOG.md` | 规则修订记录 |
| `skill-deps.schema.json` | 依赖清单 JSON Schema |

## 最佳实践

1. **统一管理** — 所有自定义 skills 放在同一工作区目录
2. **命名规范** — 小写字母+连字符，如 `my-skill`
3. **描述清晰** — description 准确说明触发条件，双引号包裹
4. **GSD XML 结构** — 使用 `<role>`/`<gsd:workflow>` 标签定义 skill 结构
5. **脚本解耦** — 多步骤任务用 `scripts/` + 外置状态文件
6. **跨会话协议** — 阶段型任务使用 `next_action` + `Next Up` + `resume-signal`
7. **子 Agent 样式** — 创建子 Agent 时包含 `background` 的 `color` 属性

## 常见问题

**Q: 修改 skill 后不生效？**
A: 先跑下方 Check List，再查看 `references/trouble-shooting.md`。

**Q: 如何删除 skill？**
A: 先卸载 `j-skills uninstall <name> -g`，再取消链接 `j-skills link --unlink <name>`。

**Q: 没有 j-skills 还能用吗？**
A: 可以。手动创建/复制/软链接到目标 skills 目录即可。

## Check List

1. `SKILL.md` 顶部包含完整 frontmatter：`name` + `description`
2. `description` 使用双引号包裹，不以 `TRIGGER:` 开头
3. `name` 使用小写字母+连字符
4. 若使用 `j-skills`：`j-skills link --list` / `j-skills list -g` 能看到目标 skill
5. 若不使用 `j-skills`：skill 已正确复制或软链接到目标 skills 目录
6. 变更后已重启会话，并用触发词完成一次验证

---

## ⚠️ 用户交互点总结

| 阶段 | 标记 | 用户操作 |
|------|------|----------|
| Phase 1 | 🛑 | 确认工作区目录 |
| Phase 2 | 📝 | 输入 skill 名称和功能描述 |
| Phase 2 | 🛑 | 确认生成的 SKILL.md 内容 |
| Phase 3 | 🔄 | 选择是否添加外部依赖 |
| Phase 3 | 📝 | 输入 GitHub 仓库地址和 skill 路径 |
| Phase 3 | 🔄 | 选择 j-skills 或离线模式 |
| Phase 3 | ✅ | 确认依赖安装成功 |
| Phase 4 | ✅ | 确认安装成功 |
| Phase 5 | 🔄 | 选择是否进行优化 |

**LLM 执行提示**：
- 🛑 → **必须等待用户确认**，不能自动跳过
- 📝 → **需要用户输入**，使用 AskUserQuestion
- ✅ → **需要验证结果**，确认后才继续
- 🔄 → **需要用户选择**，提供选项
