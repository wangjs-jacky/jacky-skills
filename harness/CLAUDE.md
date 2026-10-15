# Harness Ops 目录约定

`harness/` 是工程、工具和第三方 Skills 的长期经验驾驭层。这里的 `harness` 指稳定的约束、读取、验证和写回框架；目录中的具体 Skill 一律使用 `<target>-ops` 命名，其中 `ops` 是 Operations，表示目标对象的运行、维护、适配与持续改进。

## 创建路由

当用户说“创建一个 harness skill”“给某工程建 harness”或“把这个工具的经验沉淀起来”时：

1. 先读取 [`create-ops`](../skills/create-ops/SKILL.md)，由用户参与确认分类主键和常用 operations；配合官方 `skill-creator` 创建或改造。
2. 默认创建到 `harness/<target>-ops/`，名称和 frontmatter `name` 都使用 `<target>-ops`。
3. 不再创建 `*-harness` 目录；`harness` 只作为顶层分类名。
4. 沿用用户已明确的目标、分类和场景，不重复确认；无实质分类需求的简单本机经验采用下面的最小结构，需要按对象维护 operations 时按 `create-ops` 生成渐进路由与写回协议。

## 最小结构

```text
harness/<target>-ops/
├── SKILL.md
├── .gitignore
└── experience.local.md   # 本机创建，默认不进 Git
```

只有在真实需要时才增加：

- `scripts/`：反复执行且需要确定性的修复、诊断或提取脚本。
- `references/`：较长的可分享机制、协议和最佳实践。
- `assets/`：Skill 产出必须复用的模板或静态资源。

不要给单个 Skill 增加 README、安装指南或变更日志；设计说明统一放在仓库 `docs/`。

## 职责边界

Ops Skill 可以服务两类对象：

1. **自有工程**：保存架构入口、调试路径、运行拓扑、问题复盘和维护手册。
2. **第三方工具或 Skills**：不复制、不篡改上游能力，专门保存最佳实践、版本差异、本机水土不服、兼容性问题、已验证绕法和组合方式。

`SKILL.md` 负责稳定、可分享的部分：

- 目标对象和触发场景
- 读取本地经验的规则
- 问题路由、验证顺序和写回协议
- 换一台机器仍成立的最佳实践
- 隐私边界和失效处理规则

`experience.local.md` 负责实时、本机私有的部分：

- 绝对路径、机器、地址、端口、账号、代理、登录态和版本快照
- 本机复现的错误、根因、修复命令和验证证据
- 上游 Skill 在本机不适配的表现与绕法
- 尚未泛化、需要继续验证的经验

## 工作循环

每次触发 Ops Skill 时：

1. 先读 `experience.local.md`，再检查源码或当前运行态。
2. 优先复用最近且带验证证据的经验；旧记录冲突时不做平均判断。
3. 完成排障、适配或最佳实践验证后，当场写回本地经验。
4. 只有经过重复验证、与具体机器无关的结论，才提炼进 `SKILL.md`。
5. 既有经验失效时标记或替换旧结论，不允许只追加相互冲突的新段落。

## Worktree 原则

Ops Skill 位于独立的 `jacky-skills/harness/`，不放进被维护工程的 `CLAUDE.md`。这样同一工程的多个 Worktree 可以读取同一份外部经验源，避免每个分支各自复制、合并和版本化本机事实。

如果 `jacky-skills` 自身使用多个 Worktree，本机经验仍应选择一个明确的主目录作为唯一写入源，其他 Worktree 通过链接或安装注册表复用，避免出现多个 `experience.local.md` 真相源。

## 隐私和分享

- `experience.local.md`、`*.local.*` 和私有子目录必须被 `.gitignore` 排除。
- 真实用户路径、主机、密钥、私有端点和代理端口不得进入可分享文件。
- 分享时只发布通用协议、抽象示例和已脱敏的最佳实践。
- 文件格式允许演进，但“先读取、再验证、解决后写回、私有事实不进 Git”是稳定协议。

## 重命名与迁移

重命名 Ops Skill 时必须同步更新：目录名、frontmatter `name`、description 触发词、自引用、跨 Skill 调用、安装器、审计器、README、测试和全局链接。以评测、打分为职责的 `harness-benchmark` 不属于本目录，不因名称含 `harness` 而迁入。
