# 排查进程代理与上游连接

- system: execution
- operation: diagnose-proxy
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查进程代理与上游连接，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/diagnose-proxy.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 从失败进程实际环境核对代理、CA 与请求库，不输出完整环境。
2. 区分 GUI、SSH、SDK、原生 fetch 与模型传输；使用最小只读请求定位 TLS/CONNECT。
3. 以真实请求证据与隔离探针分别归因。

## 成功标准

目标进程能够按预期路径连接，代理层与认证层失败被区分。

## 失败模式与恢复

独立假 token 探针不证明真实单次凭据未被消费。不可仅凭代理配置存在就认定进程使用了它。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/diagnose-proxy.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
