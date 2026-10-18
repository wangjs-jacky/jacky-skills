# 配置管理

能力：`configuration`。区分配置文件、运行时覆盖和指令加载。

## 共用事实

2026-10-15 官方资料核对：

- `CODEX_HOME` 决定本地状态根，默认 `~/.codex`；隔离会话可能另有配置及认证来源。
- 配置优先级包含 CLI 覆盖、受信任项目配置、所选 profile、用户配置、受管默认值、系统配置和内置默认值；强制策略另行约束，不能通过低优先级文件绕过。
- 当前官方 profile 使用配置根旁的 `<profile-name>.config.toml`。旧版 `[profiles.*]` 写法必须按目标版本处理。
- 当前官方规则忽略项目配置中的 `model_provider`、`model_providers` 等敏感键；provider 放在允许的用户配置层。普通配置合并顺序不能替代字段级限制。
- 全局指令先检查有效配置根下的 `AGENTS.override.md`，否则读取 `AGENTS.md`，使用该层首个非空文件；项目指令沿工作目录链加载。官方说明每次运行构建指令链，宿主额外注入或刷新须另取证。

## Operations

- [修改运行配置](operations/configure-runtime.md)
- [维护全局 AGENTS](operations/maintain-global-instructions.md)：2026-10-18复核同范围段落替换、私有备份与本会话收到新规则的证据。
- [诊断配置加载](operations/diagnose-config-loading.md)

## 来源

[Config basics](https://learn.chatgpt.com/docs/config-file/config-basic)、[Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)、[Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。这些事实不证明具体宿主已加载新配置。
