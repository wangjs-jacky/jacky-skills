# 排查新会话启动

- system: execution
- operation: diagnose-session-start
- status: verified
- last_verified: 2026-11-05
- risk: low
- scope: 本次验证后台CLI外盘读取EPERM与继承provider认证冲突；完整恢复内置运行包并移除冲突字段后，真实页面新会话读取文件、模型回复和已完成通过；旧worker保留，不代表旧进程热迁移或任意外盘可访问。

## 目标

排查新会话启动，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/diagnose-session-start.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 定位具体请求的 prepare、spawn、attach 和首个 turn，关联退出码/stderr。
2. 核实真实 runtime、cwd/PATH、代理与控制端预算；UI 草稿恢复文案不能定位根因。
3. 检查历史复制锁、receiver-ready 和启动能力登记；探针不应堆积潜在远端任务。
4. 首轮模型拒绝时核对实际执行二进制版本；升级后用原账号和原模型最小验证。恢复绑定账号会话须走正常 session grant 流程并校验失败轮次，完成后读回真实回复与 completed 状态。
5. macOS本地依赖加载慢时同时核对launchd ProcessType与实际调度priority，nice为0不排除后台限制；同机同runtime隔离探针定位后，正式修复须再用正常daemon创建的新worker和真实模型回复验收。

## 成功标准

目标新会话跨过真实启动与首个可观察执行阶段；在线和目录 RPC 不代替此证据。

## 失败模式与恢复

旧版客户端可能将兼容问题呈现为账号不支持模型；应在升级后实测，不能直接归因账号权限。安装更新不替换已运行进程，原会话须通过正常恢复链路加载新版。

启动等待不一律归因认证或网络；不以加超时掩盖锁阻塞。探针涉及创建会话时沿任务授权执行。

Background限制可使本地依赖加载和事件循环显著变慢，表面凭据文件读取等待不一定是磁盘或远端认证问题。经授权修改启动策略并重载daemon后，必须读回实际分类；既有worker不随daemon自动解除限制，不得为验收批量清理。进程保留须结合清理源码、进程组及重载后存活检查。

真实回复读取须兼容role=session、content.role=agent的协议封装，同时核对文本事件和completed状态；仅识别旧role=agent会产生观察器假超时。计时区分本地启动、首个可见文本与整轮完成，不用受限观察器的轮询延迟替代原事件时间。


正式daemon丢弃worker stderr时，可为单次诊断请求加临时错误记录，核对实际后台子进程的文件读取及异常；独立launchd可读不代表原daemon子进程可读。入口读取EPERM与后续账号配置校验可能连续出现，应分别定位和验证。专用provider被全局网关配置污染时，逐项核对有效配置，不能只确认命令行已覆盖URL，或放宽账号隔离校验。

## 验证证据

2026-10-03：三个原会话的旧版模型请求失败，经升级与正常账号授权恢复，全部在原会话内返回验证回复并完成。详见[私有证据](../../../../local/systems/execution/operations/diagnose-session-start.md)。验证仅覆盖此案例，不将其他历史条目自动视为已验证。

2026-10-13：后台调度限制经隔离对照定位；授权改为Standard后，正式daemon创建的新worker实际正常优先级，启动和两轮真实模型回复通过。测试worker停止、旧worker保留；具体计时、观察器修正与限制见同一私有证据入口。

2026-10-22：真实独立双会话联调通过。HTTP工具可用不等于Codex STDIO桥接可发现；native只读/never下需核对精确工具策略而非放宽文件沙箱。source-session grant用于恢复同一会话，当时 fresh child 使用新 grant 并显式约束父账号，该策略仅验证默认绑定与父账号相同的情况；默认绑定变化场景由下述新规则覆盖。随机文件回复、执行重叠、账号/模型/权限一致及完整本地Web卡片跳转均通过；未发布或验证真机。详见[私有验收记录](../../../../local/records/independent-sessions-live-20261022.md)。

2026-11-03：独立会话的父子来源关系与 provider 历史恢复须区分。已确认采用机器默认账号时，fresh child 使用新 machine grant，不继承父账号约束或历史；真正恢复旧会话继续原身份校验。不得为启动独立任务临时重绑整台机器，也不能用固定原 session 的 resume grant 注册新孩子。账号选择按用户确认执行，grant 失败不得静默回退本地凭据。真实启动、模型回复和工具执行已验证；详见[私有证据](../../../../local/records/independent-task1-account-rejection-20261103.md)。

2026-11-05：上述本次scope真实通过；底层系统授权变化的原因未确定。见[本机证据](../../../../local/systems/execution/operations/diagnose-session-start.md)。
