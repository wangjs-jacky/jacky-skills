# 排查 SDK 与外部集成

- system: execution
- operation: diagnose-integration
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查 SDK 与外部集成，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/diagnose-integration.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 确认具体集成的实际 runner、持久身份、会话订阅和调用边界，再读相关项目规则。
2. 区分启动探针、隔离真实任务和产品完整流程；对照持久 root/turn-end/public-message 与 UI。
3. 若涉及资源回收，对齐任务 ledger 和运行实例；产物按来源、验证状态和实际交付保存。

## 成功标准

所声明集成路径有真实执行与产物证据；未覆盖身份、UI、生命周期或生产写入明确列出。

## 失败模式与恢复

连接/订阅成功不等于模型可用；文件存在不等于线上任务完成。不要把隔离视频采集当成写入产品后的完整成功。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/diagnose-integration.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
