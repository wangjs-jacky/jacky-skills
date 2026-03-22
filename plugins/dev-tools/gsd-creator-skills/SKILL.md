---
name: gsd-creator-skills
description: 创建 GSD 风格的自定义 skill 并通过 j-skills 管理。TRIGGER: "创建 skill"、"新 skill"、"gsd skill"、"初始化 skill"
---

# Skill 创建与管理

创建自定义 skill 并通过 j-skills 工具管理它们。采用 GSD（Get Shit Done）方法论，支持两阶段优化、跨会话恢复、YOLO/Interactive 运行模式。

## 前置依赖

### 1. j-skills CLI 工具

**必须先安装 j-skills npm 包：**

```bash
npm install -g j-skills
```

### 2. create-skills（可选增强）

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
│ 阶段 1: gsd-creator-skills  │
│ • 应用 GSD 最佳实践         │
│ • 添加 j-skills 集成        │
│ • 生成初始 SKILL.md         │
└─────────────────────────────┘
        ↓ (可选)
┌─────────────────────────────┐
│ 阶段 2: create-skills       │
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

**Checkpoint**：必须确认工作区路径后才能继续

### Phase 2: 创建 Skill

**目标**：生成 skill 目录结构和初始 SKILL.md

**步骤**：
1. 询问 skill 名称（小写字母+连字符，如 `my-skill`）
2. 询问 skill 功能描述（用于触发判断）
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
description: <简短描述，说明何时触发此 skill>
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

**Checkpoint**：用户确认模板内容后可进入下一阶段

### Phase 3: 链接与安装

**目标**：将 skill 链接到全局注册表并安装到目标环境

**步骤**：
1. 链接到全局注册表：
   ```bash
   cd <skills-workspace>/<skill-name>
   j-skills link
   ```
2. 安装到目标环境：
   ```bash
   # 全局安装（推荐）
   j-skills install <skill-name> -g --env claude-code
   
   # 多环境安装
   j-skills install <skill-name> -g --env claude-code,cursor
   ```
3. 验证安装：
   ```bash
   j-skills link --list
   j-skills list -g
   ```

**Checkpoint**：安装成功后才算完成

### Phase 4: 可选优化（create-skills）

**目标**：使用 create-skills 进行第二轮优化

**步骤**：
1. 询问用户是否需要第二阶段优化
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

## 快速命令

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
| `references/gsd-xml-tags.md` | GSD 对齐的 workflow XML 词汇表 |
| `references/hooks-patterns.md` | Claude 项目 hook、skill 内 checkpoint |
| `references/scripting-workflow-techniques.md` | 复杂需求：脚本解耦、外置进度 |
| `references/cross-session-workflow-skill-design.md` | 跨会话 workflow 设计 |
| `references/resume-next-stage-patterns.md` | Resume 协议、Next Up 模板 |
| `references/yolo-mode-patterns.md` | YOLO / Interactive 运行模式 |
| `references/upstream-guide.md` | 与 daymade upstream 的关系 |
| `references/canonical-location.md` | 主副本位置说明 |
| `references/CHANGELOG.md` | 规则修订记录 |

## 最佳实践

1. **统一管理** - 将所有自定义 skills 放在同一个工作区目录
2. **命名规范** - skill 名称使用小写字母和连字符，如 `my-skill`
3. **描述清晰** - description 要准确说明触发条件
4. **使用软链接** - 通过 j-skills link 实现热更新开发
5. **结构化编排** - 复杂 workflow 参考 `gsd-xml-tags.md`
6. **脚本解耦** - 多步骤任务用 `scripts/` + 外置状态文件
7. **跨会话协议** - 阶段型任务使用 `next_action` + `Next Up` + `resume-signal`
8. **模式显式化** - 提供 `yolo` / `interactive` 开关

## 常见问题

**Q: 修改 skill 后不生效？**
A: 确保使用 `j-skills link` 链接，而非直接复制文件。

**Q: 如何删除 skill？**
A: 先卸载 `j-skills uninstall <name> -g`，再取消链接 `j-skills link --unlink <name>`。

**Q: skill 会影响其他项目吗？**
A: 全局安装（`-g`）会影响所有项目；项目级安装仅影响当前项目。

## Next Up

- [ ] 创建第一个 skill
- [ ] 命令: `j-skills link && j-skills install <skill-name> -g`
- [ ] 验证: `j-skills list -g`
