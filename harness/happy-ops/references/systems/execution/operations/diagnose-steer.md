# 核对原生插话链路

- system: execution
- operation: diagnose-steer
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

核对原生插话链路，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/diagnose-steer.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 检查实际 worker metadata 和 bundle 中 steer 能力，不能只看源码或版本字符串。
2. 区分普通暂存、显式 steer、slash command 与 turn 生命周期。
3. 在授权探针中核对原 turn 身份及后续输入行为，并对照 Web 输入框操作。

## 成功标准

显式插话作用于目标 turn，随后普通输入按约定排队；真实 worker 与 UI 行为证据分开。

## 失败模式与恢复

Web 更新不代表旧 worker 支持新协议；既有版本号可能对应不同本机 bundle。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/diagnose-steer.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
