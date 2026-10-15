# 现有内容与迁移判断

初始评审日期：2026-10-15。下表记录改造前的仓库文档观察，链接现指向更新后的入口。初始评审未执行发布命令；后续实现已另外核对官方资料，来源和适用日期见 release-ops 的平台档案，未执行真实发布。

## 已读取的来源

| 来源 | 观察 | 对设计的影响 |
| --- | --- | --- |
| [github-repo-publish](../../../plugins/dev-tools/github-repo-publish/SKILL.md) | 同时覆盖仓库推送、Release、npm 与扩展；npm 路由用固定 workflow 文件名和 NPM_TOKEN 判断配置是否齐全 | 按目标平台拆知识，先读项目实际发布机制，不以一种认证模式代表全部配置 |
| [npm-publish](../../../plugins/knowledge-base/skills/npm-publish/SKILL.md) | 主要介绍本机登录、Token 与本机发布；有将查询 Token 的值直接打印的命令示例 | 迁移时区分认证模式与本机状态；经验只保存凭据来源名称与有效性结论 |
| [vsix-publish](../../../plugins/knowledge-base/skills/vsix-publish/SKILL.md) | 同时覆盖两个市场；建议将 PAT 保存到全局 CLAUDE.md，并含“永久使用”等描述 | 两个平台分别核实结果；不将凭据值作为经验或全局提示词内容，时效规则需查官方来源 |
| [j-skills](../../../plugins/skills-management/skills/j-skills/SKILL.md) | 记录该 CLI 使用特定 workflow、tag 触发和 Actions/OIDC 发布；原文验证日期为 2026-07-12 | 项目流程需要唯一归属；导入时保留历史日期，不能宣称本次重新验证 |
| [happy-ops](../../../harness/happy-ops/SKILL.md) | 已区分项目实现、操作经验和私有证据，采用渐进读取和结果写回 | 通过引用协作，避免复制一套工程发布手册 |
| [Happy 包发布 operation](../../../harness/happy-ops/references/systems/execution/operations/publish-package.md) | 状态为 historical，无有效 last_verified；强调精确版本、包内容与安装行为，失败先核实实际是否发布 | 保留原可信度；可用于设计成功标准与恢复检查，不能导入成 verified |
| [create-ops](../../../skills/create-ops/SKILL.md) | 分类需由用户参与确认，普通经验按证据自动维护 | 先交付分类提案，确认后再执行迁移 |
| [Harness/Ops 理念](../../harness-ops-philosophy/README.md) | 共享经验与机器事实分离，多个 worktree 使用同一经验源 | 发布经验归稳定外部 Skill，实例引用当前项目配置 |

## 迁移时要处理的具体差异

1. **认证方式与项目信息**：通用指南的本机登录/Token 检查不能替代项目实际 CI 机制。旧材料描述的是某种方式，不能一概当作所有项目的前置条件。
2. **成功范围**：推送、合并、tag、Release、包可下载、扩展市场可用分别留证；不能只靠一条命令退出成功就刷新所有验证日期。
3. **特定项目习惯**：例如旧 GitHub 指南把 Tauri 产物固定为只传 DMG。迁移时要找出该约束真实适用对象，不能未经复核就当作整个生态的事实。
4. **凭据与经验**：旧文档的打印或写入凭据示例不直接迁入 OPS。保存认证方式、来源及核对结论即可。
5. **知识维护机制**：当前发布指南以操作说明为主，尚未形成按平台与 operation 逐项维护验证状态的统一闭环。

以上是初始文档评审的设计判断。迁移已据当前官方资料修正通用指引；每次真实任务仍须结合项目配置和实际证据复核，不能将“发现并修正文档不一致”记录为已经修复线上发布。
