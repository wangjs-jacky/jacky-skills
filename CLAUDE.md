# jacky-skills 仓库约定

这是一个 Agent Skills 管理仓库，同时包含 Claude Code Plugins、`skills/` 下的独立 Skills，以及 `harness/` 下的长期经验 Ops Skills。

## 核心结构

```text
jacky-skills/
├── .claude-plugin/marketplace.json
├── plugins/<plugin-name>/
│   ├── .claude-plugin/plugin.json
│   └── <skill-name>/SKILL.md
├── skills/<skill-name>/SKILL.md
├── harness/<target>-ops/SKILL.md
├── archived/                 # 历史归档，不参与安装
├── scripts/audit_skills.py   # 仓库统一审计入口
└── tests/
```

部分 Plugin 使用 `plugins/<plugin>/skills/<skill>/SKILL.md` 嵌套层级；以各自 `plugin.json` 中的真实路径为准。

## Docs 内容治理

以下规则从本次变更起约束新增或重构的文档；既有内容不在本次任务中批量迁移，后续触碰时再逐步归位。

- `docs/` 不是临时草稿区；新增内容必须有明确读者、长期价值和唯一归属。
- 当前有效的成体系主题必须使用简短的英文 kebab-case 目录，并以目录内的 `README.md` 作为唯一入口。
- 细节材料必须放入主题自身的 `references/`，不得继续堆放在 `docs/` 根目录。
- 失效但仍有历史价值的文档必须移入 `docs/archive/`；无保留价值的临时产物必须直接删除。
- 简单、本机私有、环境耦合的经验继续写入被忽略的 `experience.local.md`，不得为形式升级成复杂协议。
- 新增、移动或归档文档后，必须检查所有相关相对链接。

## Skill 创建与修改

1. 创建新 Skill 时必须使用当前环境提供的官方 `skill-creator`。
2. `SKILL.md` 必须以可解析的 YAML frontmatter 开头，且至少包含 `name` 和 `description`。
3. `name` 使用 kebab-case，并与 Skill 目录名一致。
4. 核心触发边界、流程和硬约束留在 `SKILL.md`；长教程、模板和细节放入 `references/`；可确定执行的逻辑放入 `scripts/`。
5. `SKILL.md` 应控制在 500 行内；超出时必须按渐进式披露拆分。
6. 不得在可分享文件中写入真实用户绝对路径、密钥、公司/内部框架信息。本机事实放入被 `.gitignore` 忽略的 `experience.local.md` 或 `*.local.*`。
7. 以量化评分、打分或基准评测为核心职责的 Skill，名称必须使用 `-benchmark` 后缀；仅在流程中附带分数或评分字段的 Skill 不受此规则影响。
8. 重命名 Skill 时必须同步更新目录名、frontmatter `name`、触发命令、跨 Skill 调用、Plugin manifest、README 和相关测试。

### 内容载体与实现语言

1. **Markdown 优先**：面向人或 Agent 阅读的设计、SOP、导航、判断边界、复盘、经验和说明默认使用 `.md`。不要为了显得结构化而把这些内容改写成 YAML。
2. **用 Markdown 做语义导航**：`SKILL.md` 负责说明何时进入、核心约束、当前阶段和下一步读什么；细节放入一层 `references/*.md`，并在入口写清“什么时候读、为什么读”。每次跳转都应缩小当前问题，而不是只提供文件名目录。
3. **不默认创建 YAML 工作流**：不得仅为阶段编排、评分记录、任务状态或字段整齐而新增 `workflow.yaml`、`contracts.yaml`、`stage-result.yaml` 等文件。简单流程直接写 Markdown；确有确定性机器解析、跨进程交换或 schema 校验需求时，优先使用 JSON 或 JavaScript 模块，并说明为什么普通 Markdown 不够。
4. **保留必要 YAML 例外**：`SKILL.md` 的 YAML frontmatter，以及平台明确要求的 `agents/openai.yaml` 等格式继续按其协议使用；不要为了消灭 YAML 破坏外部兼容性。
5. **JavaScript/Node.js 优先**：新增脚本、校验器和确定性执行逻辑默认使用 JavaScript，优先采用 Node.js 标准库、ESM 和 `node:test`。能用 JS 清晰、可靠完成时，不新增 Python 实现。
6. **Python 仅作例外**：只有目标生态明显以 Python 为主、必须依赖成熟 Python 库，或沿用现有 Python 子系统能显著降低风险时才使用 Python，并在代码或相邻文档中说明原因。
7. **不做无收益迁移**：这些规则约束新增或重构内容；既有 YAML/Python 不在无关任务中批量改写，后续触碰时再判断是否迁移。

## Harness Ops 创建路由

当用户说“创建 harness skill”“给某工程建 harness”或要求长期维护某个工程、工具、第三方 Skill 的本地经验时，必须先读取 [`harness/CLAUDE.md`](harness/CLAUDE.md)，并使用官方 `skill-creator` 创建到：

```text
harness/<target>-ops/
```

- `harness` 是仓库分类；具体 Skill 一律使用 `<target>-ops`，不再使用 `*-harness`。
- `ops` 表示 Operations，覆盖运行维护、调试复盘、最佳实践、本机适配和第三方 Skill 水土不服经验。
- 可分享规则进入 `SKILL.md`；本机路径、代理、拓扑和验证记录进入 gitignored 的 `experience.local.md`。
- 创建或改造按分类与 operations 维护经验的 OPS 时，先读取 [`create-ops`](skills/create-ops/SKILL.md)，由用户确认分类标准，再建立自动沉淀协议和安装 Agent 的全局前置提示词；沿用已明确的分类决定。

## Plugin 清单与版本

- `plugin.json` 的 `skills` 必须与 Plugin 中真实存在的 `SKILL.md` 完全一致。
- 新增 Skill 时升级 MINOR；修复 manifest、文档或现有 Skill 时升级 PATCH。
- 版本变化后同步根 `.claude-plugin/marketplace.json` 和 `README.md` Plugin 表。
- 删除 Skill 时同步删除 manifest 条目、失效测试和 README 描述。

## 本地开发与安装

仓库路径默认为：

```bash
export JACKY_SKILLS_DIR="${JACKY_SKILLS_DIR:-$HOME/jacky-github/jacky-skills}"
```

`j-skills 0.1.0` 不支持 `j-skills link --all`。链接单个 Skill 时传入具体目录：

```bash
j-skills link "$JACKY_SKILLS_DIR/skills/<skill-name>"
j-skills link "$JACKY_SKILLS_DIR/harness/<target>-ops"
j-skills install <skill-name> -g --env claude-code,codex
```

批量安装所有活跃 Skill 使用：

```bash
./install.sh
```

脚本会扫描 `plugins/`、`skills/` 和 `harness/`，排除 `archived/`，且不会吞掉链接或安装失败。

## 完成前验证

修改后至少运行：

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/audit_skills.py --scan-shared-content
bash -n install.sh
claude plugin validate --strict .
```

若修改了具有自有测试的 Skill，还必须运行对应目录下的测试。

## Git 边界

- 保留工作树中与当前任务无关的用户改动。
- 未经明确要求，不自动 commit 或 push。
- 发布流程与代理细节参考 `github-repo-publish` Skill。

## Durable 执行约定

当用户要求以 **Durable** 模式执行任务时，先读取 [`docs/durable.md`](docs/durable.md)，并按其中定义的无人值守长任务约定执行。
