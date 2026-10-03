# 排查执行端认证

- system: execution
- operation: diagnose-auth
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查执行端认证，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/diagnose-auth.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 先定位具体 worker 的账号与凭据来源，读取必要的版本、mtime、有效期等脱敏元数据。
2. 区分本机登录、受管临时 home、SDK 身份、设备 data-key 与恢复密钥。
3. 比较模型请求、刷新落盘、上传确认的实际结果，保护唯一凭据副本。

## 成功标准

失败阶段与归属有可追溯证据；修复成功按真实覆盖链路说明。

## 失败模式与恢复

login status 不证明 token 未过期；profile 版本不是 OAuth 轮换次数。不得输出 token、盲重试单次凭据、切换账号或绕过原线程归属。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/diagnose-auth.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
