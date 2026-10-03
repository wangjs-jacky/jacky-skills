# 排查与恢复原会话

- system: execution
- operation: resume-session
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查与恢复原会话，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/resume-session.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 关联目标会话、原线程、worker、原生 turn 和 UI 状态；区分 Resume、继续消息、接续与分叉。
2. 核实原线程/历史与账号归属，旧 UI 失败不证明 worker 已退出。
3. 若需发送、恢复或中断，沿已有授权执行并观察原线程是否持续、消息是否实际产生。

## 成功标准

同一目标线程恢复或继续产生所需结果；running 不等于用户整项任务已完成。

## 失败模式与恢复

超时合成失败可能没停止原 turn；重复 Resume 可能启动多余 worker。禁止用重启掩盖仍运行的任务或未经授权另建线程。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/resume-session.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
