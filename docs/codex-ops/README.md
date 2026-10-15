# Codex OPS：分类与迁移

面向维护者和安装 Agent。2026-10-15 用户确认按 Codex 能力分类，入口为 [`harness/codex-ops`](../../harness/codex-ops/SKILL.md)。

## 模型与产物

五类能力：`installation`、`configuration`、`skills`、`connectivity`、`usage`；首批 12 个 operations 见[分类模型](../../harness/codex-ops/references/ops-model.md)。设备、账号、版本、CLI/Desktop/宿主和配置目录作为实例条件。

入口按能力渐进读取，完成、失败或中断后自动按证据写回；状态分 documented、partial、verified，历史验证日期不替换为迁移日。全局前置规则随 Skill 分发，由安装 Agent 展示并征求具体配置授权。

## 迁移映射

| 原内容 | 当前归属 | 处理 |
| --- | --- | --- |
| codex-env-config 安装、配置、认证和网络指导 | 对应 capability / operation | 旧入口保持名称并路由，不维护重复正文 |
| codex-env-config 本机历史 | ignored 私有实例及只读历史来源 | 保留原日期、版本和缺口；退役设备明确标记 |
| codex-harness 通用工作习惯与自有工程记录 | 原 Skill 或已有工程 OPS | 保留内容，增加 Codex 专属路由与未来写回归属 |
| codex-quota 查询脚本与字段解释 | 原 Skill | 保留脚本，OPS 引用执行契约 |
| 既有全局规则写入经验 | configuration/maintain-global-instructions 的案例 | 只保留脱敏方法，实例证据保持私有 |
| 会话清理、SDK、历史回放、图片生成 | 原工程或专门 Skill 的历史 | 不自动扩为新能力，需要扩展范围时再确认 |

兼容入口独立通过 Plugin 安装时，需要同时安装 `codex-ops`。全量安装器本已扫描 harness；没有新增跨目录 Plugin 软链接，也没有复制共享知识。

## 迁移中的纠正

- 安装沿真实来源处理，取消普遍优先 Homebrew 的旧假设。
- 不假设 `codex doctor` 存在于所有历史版本；按当前帮助检查。
- 配置区分 CLI、受信任项目、profile、用户和受管层；记录当前官方 profile 文件与 provider 字段限制。
- 技能目录以当前目录表和宿主为准，兼顾官方 `.agents/skills` 与宿主维护的其他入口。
- HTTP-only 经验保留传输层区分及成功标准，历史私有 endpoint 不作为公共通用命令。
- 远端迁移适配凭据存储和机器路径，避免无条件复制认证及全部私有经验。

## 证据边界

本次创建基于原有文档、源码与官方资料核对，12 个 operations 初始均为 documented，`last_verified: null`。原私有案例的日期保留在实例中；结构改造不等于重新执行安装升级、登录、网络恢复或额度查询。

官方来源及核对日期位于相应能力档案。代码提交、推送、远端同步和全局指令写入均按各自授权处理，不由经验写回自动触发。
