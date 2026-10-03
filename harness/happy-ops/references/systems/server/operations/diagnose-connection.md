# 排查 API 与 Socket 连接

- system: server
- operation: diagnose-connection
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查 API 与 Socket 连接，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/server/operations/diagnose-connection.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 从目标请求定位 App、反代、Server、执行端或上游失败层。
2. 核实真实 health/Socket/API 路径、认证结果与连接时序。
3. RPC 超时比较客户端、Server 和设备实际预算及收到请求的时间。

## 成功标准

同一请求在相关层可关联，失败环节有证据，原路径最小复现通过或待查边界明确。

## 失败模式与恢复

错误端点的 404 不算服务离线；目录 RPC 或 health 成功不证明 session-start 成功。不要只延长 UI 超时掩盖阻塞。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/server/operations/diagnose-connection.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
