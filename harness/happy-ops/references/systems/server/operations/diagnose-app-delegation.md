# 核对应用会话与授权入口

- system: server
- operation: diagnose-app-delegation
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

核对应用会话与授权入口，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/server/operations/diagnose-app-delegation.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 对照当前应用会话入口、授权状态和对应后端接口。
2. 以已授权目标验证路由与持久化效果，区分配置保存和实际新会话行为。
3. 分别核对 Web/OTA 与 Server 是否包含相关版本。

## 成功标准

目标入口和授权行为有同一版本下的证据；未覆盖设备或后端分支单列。

## 失败模式与恢复

历史“已上线”不能替代当前多端版本核对；迁移记录不授予修改永久授权的权限。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/server/operations/diagnose-app-delegation.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
