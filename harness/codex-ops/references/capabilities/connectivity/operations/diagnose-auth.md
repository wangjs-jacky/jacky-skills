---
capability: connectivity
operation: diagnose-auth
status: documented
last_verified: null
---

# 诊断认证与账号归属

## 目标与前置

明确目标实例使用哪种认证来源，定位认证、模型访问或网络问题。诊断不会自动登出、换账号或覆盖其他实例的认证。

## 流程

1. 核对实际二进制、宿主、配置根和 provider；只读取认证模式、来源及是否存在，不输出认证文件或完整启动环境。
2. 当前版本支持时使用 `codex login status` 等官方摘要命令；返回已登录只说明凭据状态，不证明目标请求必然成功。
3. 区分系统 keychain/keyring 与文件存储；宿主明确签发的账号覆盖和机器默认登录也要分别归因。项目集成行为转对应工程 OPS。
4. 对比错误阶段：未找到凭据、凭据拒绝、模型/账号权限、额度、网络超时。保留精确非敏感错误码，不按错误文本片段扩大兜底范围。
5. 若任务已授权恢复登录，采用本版本适用的官方登录方式；用户交互到来前保留待办。真实请求只能在任务授权内执行，使用目标实例取证。

## 成功标准

认证来源和账号作用域可解释，错误阶段有证据；恢复任务还需目标实例的实际成功证据。未发请求时报告“认证状态已确认，模型请求未验证”。

## 坑与恢复

不能用当前聊天正常回答证明其他 runner 的账号有效；不能把 API key 账单与 ChatGPT 订阅额度混用。恢复只还原本次授权变更，避免覆盖更新后的登录。

## 证据

2026-10-15 官方 CLI 与配置资料核对；本次未查看实际凭据、未登录或发送模型请求。

2026-10-19 局部诊断：专用file auth的access token已过期时，原生workspace routing可能返回401。当前版本schema支持account/read的refreshToken=true；隔离副本中返回account不存在且access仍过期，不证明登录恢复。仅记为诊断证据，不刷新成功日期；是否需交互登录由账号实际状态确认。不得用其他宿主当前聊天正常推断此runner有效，也不得静默替换全局凭据。

同轮补充：若以file auth副本诊断，必须明确cli_auth_credentials_store=file，不能把auto/keyring未命中当作副本无效。明确file-store的第二次探针也未恢复account，仍不据此推断refresh材料的具体失效原因。多实例复制OAuth凭据后丢弃私有home会丢失副本中的刷新状态；生产设计需单写者、受控持久化及无重试环，不能靠反复复制旧源恢复。

2026-10-19 设计补充：单个 managed stdio app-server 可以作为专用持久认证状态的唯一进程所有者；独立 thread/turn 负责讨论路由。官方 app-server 文档说明 managed 模式由 Codex 持久及刷新 OAuth，定向 interrupt 以 threadId/turnId 为目标。本地 fixture 可验证宿主路由、等待 interrupted、共享故障处理、维护/运行时互斥和保留刷新文件，但不能证明真实并发刷新协调。改变配置或进程架构后旧无工具证明失效；新请求审计未完成时应失败关闭。维护入口须共用独占锁；该锁不能防止任意外部程序绕过入口写入。源码/fixture 结果不等于专用登录或模型链路成功，本条不刷新认证成功日期。来源：https://developers.openai.com/codex/app-server（本日读取，页面归至 ChatGPT Learn）。

同轮采集CLI补充：工具型CLI若复制认证后删除临时HOME，同样会丢失刷新状态。可保持临时HOME隔离，同时将CODEX_HOME指向显式声明的专用持久store，并用独占lease覆盖profile加载到CLI/stdio关闭。共学和采集必须使用不同store。已有profile与预期不符时拒绝，不自动覆盖。非模型固定操作无需取得模型认证锁。这里只验证fixture保存/互斥/拒绝边界，没有新的真实登录或刷新成功证据。


2026-10-19 首轮修复（partial）：Task 8 首轮本地修复：managed store 只能显式初始化空目录。marker 绑定 owner/binding/kind/canonical 路径/uid；运行时和维护共用验证，拒绝祖先链接、预存未标记认证、权限错误和未知资产。fixture store4/4通过。无真实认证操作，proof 保持 false，真实写入清单与登录/刷新仍待 Task 9 验收。 证据见项目 task-8-round1-fix-report.md；不刷新成功日期。


2026-10-19 Task 8 第二轮局部修复（partial）：启动或 thread/start 尚未完成的执行任务也必须等 shared owned exit，再保存 interrupted。关闭不能先用普通错误拒绝 pending RPC。模拟 stdio 的6个延迟退出边界先RED后GREEN，完整 managed fixture21/21通过。没有真实认证、child、后台或部署，proof仍false；不刷新成功日期。证据：项目 task-8-round2-fix-report.md。


2026-10-19 Task 8 第三轮局部修复（partial）：pre-spawn shutdown 通过专用 prevented 分类，close 屏障后保存 interrupted。首次 startup 调用者与共享等待者共用错误分类；不能只看 terminationConfirmed。文件步骤暂停 fixture2/2先RED后GREEN，managed回归23/23通过；spawn0。无真实认证或后台证据，proof仍false，不刷新成功日期。报告 task-8-round3-fix-report.md。
