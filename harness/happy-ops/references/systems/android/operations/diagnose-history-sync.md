# 排查 App 历史与重连

- system: android
- operation: diagnose-history-sync
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查 App 历史与重连，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/android/operations/diagnose-history-sync.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 核对设备实际 bundle、内存 cursor、分页窗口与首屏门禁。
2. 区分 Native 重启、重连和新建接续的请求路径，检查是否重复全量下载。
3. 对照真实设备时序与 API 响应，不从无客户端类型的服务端日志推断全部流量来源。

## 成功标准

目标设备的历史窗口与重连行为符合预期，未覆盖设备场景明确标注。

## 失败模式与恢复

Web durable history 证据不直接替代 Native；数据不可用、同步放大和服务器离线分开判断。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/android/operations/diagnose-history-sync.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
