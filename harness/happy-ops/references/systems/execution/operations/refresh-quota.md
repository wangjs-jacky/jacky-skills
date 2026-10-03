# 排查额度刷新

- system: execution
- operation: refresh-quota
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查额度刷新，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/refresh-quota.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 核对真实 daemon 是否注册 quota RPC，跟踪请求是否到达目标设备。
2. 对照实际读取能力、额度桶与 reset 信息；分别记录上游查询和凭据保存结果。
3. 比较各层超时预算，区分后台成功而 UI 提前失败。

## 成功标准

目标设备读取结果与 UI 额度桶一致；发生轮换时凭据安全持久化。

## 失败模式与恢复

新 npm 包但旧 runner 会缺 RPC；固定剩余 100% 可能是额度桶混用。查询失败不代表可以丢弃新轮换凭据。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/refresh-quota.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
