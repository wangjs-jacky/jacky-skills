# 排查扫码与账号绑定

- system: android
- operation: diagnose-account-link
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查扫码与账号绑定，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/android/operations/diagnose-account-link.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 定位扫描、跨 bridge 事件、确认授权与服务端请求状态。
2. 用脱敏短期关联标识核对同一绑定请求，不记录恢复密钥或完整错误请求。
3. 在真实设备确认摄像头、弹窗和最终授权；不把 UI 关闭视为完成。

## 成功标准

同一绑定请求在设备与服务端的授权状态一致。

## 失败模式与恢复

事件和 Promise 到达次序可能不同；不能仅靠 JS 测试断言原生扫码链路完成。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/android/operations/diagnose-account-link.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
