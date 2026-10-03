# 排查设备环境扫描

- system: execution
- operation: inspect-environment
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查设备环境扫描，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/inspect-environment.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 从持久 machine identity 对齐真实主机/容器，旧 hostname 和版本仅作线索。
2. 分设备核对实际扫描 RPC 注册、daemon 心跳、Node/cwd/PATH 和响应。
3. UI 全设备验收与单机服务探针分别记录。

## 成功标准

目标设备身份与扫描能力对应，实际响应和覆盖设备范围清楚。

## 失败模式与恢复

容器重建后显示名可能过期；一个设备成功不代表整组通过。不要因旧 metadata 另建账号或错误连接主机。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/inspect-environment.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
