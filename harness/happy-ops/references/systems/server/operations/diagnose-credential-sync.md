# 排查凭据同步与账号归属

- system: server
- operation: diagnose-credential-sync
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查凭据同步与账号归属，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/server/operations/diagnose-credential-sync.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 只读关联 binding、launch/grant、writer 版本和脱敏审计，核对失败发生于刷新、上传还是确认。
2. 区分凭据已写入但响应丢失、旧 writer 冲突和真实上游撤销。
3. 保护并发版本与同账号归属；必要恢复使用已授权、可审计的路径。

## 成功标准

状态与实际写入/确认和身份边界一致，测试结果按合成认证、真实模型及手机 UI 分层。

## 失败模式与恢复

available 或版本增加不等于 OAuth 刷新成功。不能盲目覆盖 CAS、换账号、重放不确定 refresh token 或用新会话替代用户指定的原会话。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/server/operations/diagnose-credential-sync.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
