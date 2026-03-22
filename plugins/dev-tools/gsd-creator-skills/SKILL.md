---
name: gsd-creator-skills
description: "基于 GSD 风格的 skills 生成与指导型元技能：用于指导创建/优化其他 skills。若存在 j-skills 可用于管理；无 j-skills 也可使用替代方案。支持外部 skill 依赖管理（离线/j-skills 两种模式）。TRIGGER: 创建 skill、新 skill、gsd skill、初始化 skill"
---

# GSD 风格 Skill 生成与管理（元技能）

这是一个基于 GSD（Get Shit Done）风格的 skills 元技能，用于指导生成与优化其他 skills。若环境中存在 `j-skills`，可用其完成安装、链接、卸载和日常管理；若不存在，也可使用手动替代方案完成同类工作。支持两阶段优化、跨会话恢复与 YOLO/Interactive 运行模式。

## 前置依赖

### 1. j-skills CLI 工具（可选，推荐）

若已安装 `j-skills`，建议使用标准命令管理 skills：

```bash
npm install -g j-skills
```

若未安装 `j-skills`，也可直接采用手动方案：
- 手动创建 `<skill-name>/SKILL.md`
- 按目标 Agent 的 skills 目录进行复制或软链接管理
- 通过重启会话验证 skill 加载状态

### 2. create-skills（可选增强，依赖 j-skills）

此 skill 可基于 [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) 的 `create-skills` 进行第二阶段优化。

**安装 create-skills（可选）：**

```bash
# 克隆仓库
git clone https://github.com/daymade/claude-code-skills.git

# 将 create-skills 链接到全局注册表
cd claude-code-skills/create-skills
j-skills link

# 安装到 Claude Code 环境
j-skills install create-skills -g --env claude-code
```

## 工作流程

```
用户请求创建 skill
        ↓
┌─────────────────────────────┐
│ Phase 1: 确认工作区         │
│ • 确定技能工作目录          │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ Phase 2: 创建 Skill         │
│ • 应用 GSD 最佳实践         │
│ • 可选接入 j-skills 管理     │
│ • 生成初始 SKILL.md         │
└─────────────────────────────┘
        ↓ (可选)
┌─────────────────────────────┐
│ Phase 3: 外部依赖管理       │
│ • 添加 GitHub 仓库依赖      │
│ • 选择 j-skills/离线模式    │
│ • 记录版本和 commit hash    │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ Phase 4: 集成与验证         │
│ • j-skills / 手动安装       │
│ • 验证 skill 可用性         │
└─────────────────────────────┘
        ↓ (可选)
┌─────────────────────────────┐
│ Phase 5: create-skills 优化 │
│ • 进一步优化结构            │
│ • 完善内容细节              │
│ • 最终质量检查              │
└─────────────────────────────┘
        ↓
   输出最终 skill
```

## 执行流程

### Phase 1: 确认工作区

**目标**：确定 skills 工作区目录

**步骤**：
1. 检查当前目录是否已包含 SKILL.md（在某个 skill 目录内）
2. 检查当前目录是否有多个 skill 子目录
3. 若不是工作区，询问用户：
   - 在当前目录创建工作区？
   - 或提供已有工作区路径

> ⚠️ **Checkpoint - 需要用户确认**
>
> | 操作 | 说明 |
> |------|------|
> | 🛑 等待 | 用户确认工作区路径 |
> | ✅ 通过 | 用户明确指定路径后继续 |
>
> **必须确认工作区路径后才能继续**

### Phase 2: 创建 Skill

**目标**：生成 skill 目录结构和初始 SKILL.md

> ⚠️ **需要用户输入**
>
> | 字段 | 格式 | 示例 |
> |------|------|------|
> | 📝 skill 名称 | 小写字母+连字符 | `my-skill` |
> | 📝 功能描述 | 简短说明触发条件 | "用于处理 xxx 场景" |
>
> **⚠️ description 格式要求**：
> - **必须用双引号包裹** - 避免 YAML 解析错误（description 中可能包含冒号、中文标点等）
> - 不要以 `TRIGGER:` 开头 - 这是旧格式，直接写描述即可
> - 示例：`"当用户提到 xxx 时触发"` 或 `"用于处理 yyy 场景"`

**步骤**：
1. **询问** skill 名称（小写字母+连字符，如 `my-skill`）
2. **询问** skill 功能描述（用于触发判断，**必须用双引号包裹**）
3. 创建目录结构：
   ```
   <skill-name>/
   ├── SKILL.md              # 必需
   ├── scripts/              # 可选：可执行脚本
   ├── references/           # 可选：参考文档
   └── assets/               # 可选：资源文件
   ```
4. 生成 SKILL.md 模板

**GSD 风格 SKILL.md 模板**：

```markdown
---
name: <skill-name>
description: "<简短描述，说明何时触发此 skill>"
---

# <Skill 标题>

<详细说明 skill 的功能和使用方法>

## 前置依赖

- <依赖 1>
- <依赖 2>

## 执行流程

### Phase 1: <阶段 1 名称>

**目标**：<本阶段要达成的可验证目标>

**步骤**：
1. <步骤 1>
2. <步骤 2>

**Checkpoint**：<必须满足的停止条件>

### Phase 2: <阶段 2 名称>

...

## 验证

<完成后的验证方式>

## Next Up

- [ ] <下一阶段目标>
- [ ] 可复制命令: `<command>`
```

> ⚠️ **Checkpoint - 需要用户确认**
>
> | 操作 | 说明 |
> |------|------|
> | 🛑 等待 | 用户确认模板内容 |
> | ✅ 通过 | 用户确认后进入下一阶段 |

### Phase 3: 外部依赖管理（可选）

**目标**：为 skill 添加外部 GitHub 仓库的 skill 依赖

> ⚠️ **需要用户选择**
>
> | 选项 | 说明 |
> |------|------|
> | ⏭️ 跳过 | 不需要外部依赖，直接进入下一阶段 |
> | 📦 添加依赖 | 配置外部 skill 依赖 |

#### 3.1 选择依赖来源

**步骤**：
1. **询问** 依赖来源（GitHub 仓库地址，如 `daymade/claude-code-skills`）
2. **询问** 仓库内的 skill 路径（如 `create-skills`）
3. **询问** Git 引用（branch/tag/commit，默认 `main`）

#### 3.2 选择安装模式

> ⚠️ **需要用户选择**
>
> | 模式 | 说明 | 适用场景 |
> |------|------|----------|
> | 🔌 **j-skills 模式** | 使用 `j-skills link + install` 管理 | 开发环境、需要频繁更新 |
> | 💾 **离线模式** | 克隆到 `references/_deps/` 目录 | 生产环境、网络受限、稳定依赖 |

#### 3.3 执行安装

##### 方案 A：j-skills 模式

> ⚠️ **需要执行命令**
>
> ```bash
> # 1. 克隆依赖仓库（临时）
> git clone --depth 1 https://github.com/<owner>/<repo>.git /tmp/<repo-name>
>
> # 2. 链接到全局注册表
> cd /tmp/<repo-name>/<skill-path>
> j-skills link
>
> # 3. 安装到环境
> j-skills install <skill-name> -g
>
> # 4. 获取 commit hash（用于记录）
> cd /tmp/<repo-name>
> git rev-parse HEAD
> ```

##### 方案 B：离线模式

> ⚠️ **需要执行命令**
>
> ```bash
> # 1. 创建依赖目录
> mkdir -p references/_deps
>
> # 2. 浅克隆仓库
> git clone --depth 1 https://github.com/<owner>/<repo>.git references/_deps/<repo-name>
>
> # 3. 获取 commit hash
> cd references/_deps/<repo-name>
> git rev-parse HEAD
> ```

#### 3.4 记录依赖信息

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

> ⚠️ **Checkpoint - 需要验证**
>
> | 检查项 | 命令/方法 |
> |--------|-----------|
> | ✅ j-skills 模式 | `j-skills list -g` 显示依赖 skill |
> | ✅ 离线模式 | `ls references/_deps/<repo>/<path>/SKILL.md` 存在 |
> | ✅ 依赖清单 | `skill-deps.json` 格式正确 |

#### 3.5 更新依赖（后续操作）

当需要更新依赖时：

```bash
# 离线模式
cd references/_deps/<repo-name>
git fetch origin
git pull origin <ref>
git rev-parse HEAD  # 更新 skill-deps.json 中的 commit

# j-skills 模式
cd /tmp/<repo-name>
git pull origin <ref>
j-skills install <skill-name> -g --force
```

> 📖 **详细文档**：`references/dependency-management.md`

### Phase 4: 集成与验证（j-skills / 手动二选一）

**目标**：将 skill 集成到目标环境并完成可用性验证

#### 方案 A：使用 j-skills（推荐）

> ⚠️ **需要执行命令** - 以下命令需要用户或 LLM 执行：
>
> ```bash
> # 1. 链接到全局注册表
> cd <skills-workspace>/<skill-name>
> j-skills link
>
> # 2. 安装到目标环境（推荐全局安装）
> j-skills install <skill-name> -g --all-env
>
> # 3. 验证安装
> j-skills link --list
> j-skills list -g
> ```

#### 方案 B：不使用 j-skills（替代）

1. 在目标 skills 目录中放置 `<skill-name>/SKILL.md`（可复制或软链接）
2. 保持目录结构完整（如 `references/`、`scripts/`）
3. 重启会话后通过触发词验证 skill 是否被加载

**步骤**：
1. 选择集成方案（A 或 B）
2. 完成集成动作
3. 验证可用性

> ⚠️ **Checkpoint - 需要验证**
>
> | 检查项 | 命令 |
> |--------|------|
> | ✅ j-skills 方案 | `j-skills link --list` / `j-skills list -g` 显示 skill |
> | ✅ 手动方案 | 重启后触发词可命中，且 skill 行为符合预期 |

### Phase 5: 可选优化（create-skills）

**目标**：使用 create-skills 进行第二轮优化

> ⚠️ **需要用户确认**
>
> | 选项 | 说明 |
> |------|------|
> | 🔄 需要优化 | 使用 create-skills 进行第二轮优化 |
> | ⏭️ 跳过 | 直接完成，不进行优化 |

**步骤**：
1. **询问** 用户是否需要第二阶段优化
2. 若需要，执行：
   ```bash
   cd <skills-workspace>/<skill-name>
   j-skills run create-skills
   ```

## 高级特性

### 1. XML 辅助编排（可选）

复杂 workflow 可参考 `references/gsd-xml-tags.md` 使用结构化标签：

```xml
<gsd:workflow>
  <gsd:phase name="research">
    <gsd:step>阅读用户现有代码或约束</gsd:step>
    <gsd:checkpoint>若需求模糊，先追问再往下</gsd:checkpoint>
  </gsd:phase>
  <gsd:phase name="plan">
    <gsd:step>列出可执行步骤与依赖</gsd:step>
  </gsd:phase>
</gsd:workflow>
```

**注意**：XML 仅用于参考和对齐，最终仍输出 Markdown 格式的 SKILL.md。

### 2. Hooks 与强制顺序

- **项目级可执行 hook**：放在 `scripts/` 目录
- **skill 内逻辑 checkpoint**：在 SKILL.md 中用明确标题写出「必须先 Y 再 X」

详见 `references/hooks-patterns.md`

### 3. 脚本解耦与外置进度

长流程、多状态任务时：
- 用 `scripts/` 维护约定格式的事实源（如 JSON 进度文件）
- 提供只读查询脚本输出短摘要
- 执行时先跑 `status` 类命令

详见 `references/scripting-workflow-techniques.md`

### 4. 跨会话 Workflow

分阶段执行、可能跨会话恢复的 skill 使用以下约束：
1. 三层状态：任务级断点 + 流程级状态 + 全局级背景
2. 固定恢复顺序：流程级 -> 全局级 -> 任务级 -> `next_action`
3. 阶段结束强制输出 `Next Up` 区块
4. 需要人工确认时，给出 `resume-signal`（如 `approved` / `next`）

详见：
- `references/cross-session-workflow-skill-design.md`
- `references/resume-next-stage-patterns.md`

### 5. 运行模式开关（YOLO / Interactive）

workflow 运行模式显式化：
1. 流程开头让用户选择模式
2. `yolo` 只自动推进低风险步骤，高风险动作仍强制确认
3. 允许运行中切换模式，并回显当前模式
4. 状态文件记录 `mode` 字段

详见 `references/yolo-mode-patterns.md`

### 6. Approve 检查点设计

用户确认节点的三种类型：
1. **Human-Verify**（验证型）：Claude 完成工作后，用户视觉/交互验证
2. **Decision**（决策型）：需要用户选择实现方向
3. **Human-Action**（行动型）：需要用户执行认证/授权等操作

**核心原则**：
- 检查点只包含用户可直观验证的内容
- CLI 命令由 Claude 自动执行，不放入检查点
- 提供明确的 `resume-signal`（如 "approved"、"option-a"）

详见 `references/approve-patterns.md`

## j-skills 快速命令（可选）

```bash
# 批量链接所有 skills
j-skills link --all

# 查看所有 skills 状态
j-skills list --all --json

# 卸载 skill
j-skills uninstall <name> -g

# 取消链接
j-skills link --unlink <name>
```

## 参考文档索引

| 文件 | 用途 |
|------|------|
| `references/dependency-management.md` | **外部 skill 依赖管理规范**（离线/j-skills 模式） |
| `references/gsd-xml-tags.md` | GSD 对齐的 workflow XML 词汇表 |
| `references/hooks-patterns.md` | Claude 项目 hook、skill 内 checkpoint |
| `references/scripting-workflow-techniques.md` | 复杂需求：脚本解耦、外置进度 |
| `references/cross-session-workflow-skill-design.md` | 跨会话 workflow 设计 |
| `references/resume-next-stage-patterns.md` | Resume 协议、Next Up 模板 |
| `references/yolo-mode-patterns.md` | YOLO / Interactive 运行模式 |
| `references/approve-patterns.md` | **Approve 检查点设计模式**（验证型/决策型/行动型） |
| `references/upstream-guide.md` | 与 daymade upstream 的关系 |
| `references/canonical-location.md` | 主副本位置说明 |
| `references/throuble-shooting.md` | 常见异常排查（不生效、链接、卸载） |
| `references/CHANGELOG.md` | 规则修订记录 |
| `skill-deps.schema.json` | 依赖清单 JSON Schema |

## 最佳实践

1. **统一管理** - 将所有自定义 skills 放在同一个工作区目录
2. **命名规范** - skill 名称使用小写字母和连字符，如 `my-skill`
3. **描述清晰** - description 要准确说明触发条件
4. **优先软链接** - 有 j-skills 时用 `j-skills link`；无 j-skills 时使用手动软链接
5. **结构化编排** - 复杂 workflow 参考 `gsd-xml-tags.md`
6. **脚本解耦** - 多步骤任务用 `scripts/` + 外置状态文件
7. **跨会话协议** - 阶段型任务使用 `next_action` + `Next Up` + `resume-signal`
8. **模式显式化** - 提供 `yolo` / `interactive` 开关
9. **子 Agent 样式规范** - 创建子 Agent（子 skill）时，必须包含 `background` 的 `color` 属性，用于在 UI 中区分不同 Agent

## 常见问题

**Q: 修改 skill 后不生效？**
A: 先跑下面的 `Check List`，再按需查看 `references/throuble-shooting.md`。

**Q: 如何删除 skill？**
A: 建议顺序是先卸载 `j-skills uninstall <name> -g`，再取消链接 `j-skills link --unlink <name>`。

**Q: skill 会影响其他项目吗？**
A: 全局安装（`-g`）会影响所有项目；项目级安装仅影响当前项目。

**Q: 没有 j-skills 还能用吗？**
A: 可以。`j-skills` 是推荐管理工具，但不是硬依赖；可通过手动创建/复制/软链接到目标 skills 目录完成替代。

**Q: 遇到链接/加载问题先看哪里？**
A: 优先查看 `references/throuble-shooting.md`，按“检查命令 -> 检查链接 -> 清理重装”的顺序排查。

---

## Check List（先检查，再排查）

1. `SKILL.md` 顶部包含完整 frontmatter：`name` + `description`
2. `description` 使用双引号包裹
3. `name` 使用小写字母+连字符（如 `my-skill`）
4. 若使用 `j-skills`：`j-skills link --list` / `j-skills list -g` 能看到目标 skill
5. 若不使用 `j-skills`：skill 已正确复制或软链接到目标 skills 目录
6. 变更后已重启会话，并用触发词完成一次验证
7. 仍有问题时，查看 `references/throuble-shooting.md`

## Next Up

- [ ] 创建第一个 skill
- [ ] 命令（有 j-skills）: `j-skills link && j-skills install <skill-name> -g`
- [ ] 命令（无 j-skills）: 复制或软链接 `<skill-name>/` 到目标 skills 目录
- [ ] 验证: 重启会话后通过触发词验证加载结果

---

## ⚠️ 用户交互点总结

> 执行此 skill 时，**必须** 在以下节点等待用户操作：

| 阶段 | 交互点 | 用户操作 |
|------|--------|----------|
| Phase 1 | 🛑 工作区路径 | 确认或提供工作区目录 |
| Phase 2 | 📝 Skill 名称 | 输入 skill 名称 |
| Phase 2 | 📝 功能描述 | 输入 skill 功能描述 |
| Phase 2 | 🛑 模板确认 | 确认生成的 SKILL.md 内容 |
| Phase 3 | 🔄 依赖选择 | 选择是否添加外部依赖 |
| Phase 3 | 📝 依赖来源 | 输入 GitHub 仓库地址和 skill 路径 |
| Phase 3 | 🔄 安装模式 | 选择 j-skills 或离线模式 |
| Phase 3 | ✅ 依赖验证 | 确认依赖安装成功 |
| Phase 4 | ✅ 安装验证 | 确认安装成功 |
| Phase 5 | 🔄 优化选择 | 选择是否进行第二阶段优化 |

**LLM 执行提示**：
- 遇到 🛑 标记时 → **必须等待用户确认**，不能自动跳过
- 遇到 📝 标记时 → **需要用户输入**，使用 AskUserQuestion
- 遇到 ✅ 标记时 → **需要验证结果**，确认后才继续
- 遇到 🔄 标记时 → **需要用户选择**，提供选项让用户选择
