# Codex OPS：分类与操作范围

## 已确认决策

- 状态：已确认。2026-10-15 用户选择“按 Codex 能力分类改造（推荐）”，沿用已展示的五类能力及首批目标。
- 范围：Codex 自身的安装升级、配置、技能管理、认证连接与额度使用。
- 主键：`capability`；目录：`references/capabilities/`。`feature` 只作概念别名，不建第二套目录。
- CLI、桌面内置程序、宿主托管 app-server 是实例类别；设备、账号、版本和 `CODEX_HOME` 是适用条件，不增加组合目录。
- `codex-harness` 的通用工作习惯与自有工程历史保留；`codex-env-config` 的范围内知识归入本库；`codex-quota` 保留脚本和输出解释契约。

## 首批 operations

状态和验证日期以目标文档为准；这份清单不重复维护状态。

| capability | operation | 用户目标 |
| --- | --- | --- |
| installation | [install-upgrade](capabilities/installation/operations/install-upgrade.md) | 按真实安装渠道安装或升级 |
| installation | [diagnose-version-conflict](capabilities/installation/operations/diagnose-version-conflict.md) | 诊断 PATH、桌面和宿主版本冲突 |
| installation | [migrate-environment](capabilities/installation/operations/migrate-environment.md) | 向确认过的设备迁移适配后的环境 |
| configuration | [configure-runtime](capabilities/configuration/operations/configure-runtime.md) | 修改指定作用域的模型、provider 等配置 |
| configuration | [maintain-global-instructions](capabilities/configuration/operations/maintain-global-instructions.md) | 按授权维护全局 AGENTS 规则 |
| configuration | [diagnose-config-loading](capabilities/configuration/operations/diagnose-config-loading.md) | 查明配置未生效的层级或加载原因 |
| skills | [install-sync](capabilities/skills/operations/install-sync.md) | 安装或同步 Skill 及实际依赖 |
| skills | [diagnose-discovery](capabilities/skills/operations/diagnose-discovery.md) | 排查技能未发现、路径错误或触发偏差 |
| connectivity | [diagnose-auth](capabilities/connectivity/operations/diagnose-auth.md) | 诊断当前实例的认证与账号归属 |
| connectivity | [diagnose-proxy](capabilities/connectivity/operations/diagnose-proxy.md) | 诊断代理继承和连接阶段 |
| connectivity | [diagnose-websocket](capabilities/connectivity/operations/diagnose-websocket.md) | 定位 Responses WebSocket 超时并评估适用恢复方式 |
| usage | [query-quota](capabilities/usage/operations/query-quota.md) | 读取日志中的剩余额度并说明新鲜度和来源 |

## 扩展与人的参与

按既定五类自动修正经验、维护日期、增加同类操作与别名。新增能力分类、改变分类轴、拆并现有归属或扩大到 SDK 开发、会话回放、图片生成、服务进程管理等范围前再确认。未执行想法可记候选，不能生成成功经验。

安装全局前置提示词需独立确认具体规则和目标文件。用户确认本模型不等于同意修改任意全局配置、连接远端或重启运行中的会话。

## 证据与归属

- `documented` / `partial` / `verified` 表示知识可信度；迁移日期不替代旧验证日期。
- 官方文档说明产品约定；当前二进制帮助、有效启动参数和运行证据说明实例。两者冲突时标明版本/分发来源，不把本机特性泛化。
- 多操作共用事实归能力档案；具体目标经验归 operation；机器、路径、账号映射及原始证据位置归私有实例。
- 通用流程习惯留在 `codex-harness`，Happy 集成与生命周期经验留在工程 OPS。范围外历史可保留引用，不能被自动提升为新能力。
