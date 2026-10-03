# 排查推送注册与提醒

- system: android
- operation: diagnose-notifications
- status: pending
- last_verified: none
- risk: low
- scope: 历史记录仍缺手机令牌阶段与实际远程接收闭环。

## 目标

排查推送注册与提醒，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/android/operations/diagnose-notifications.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 从权限开始区分设备令牌、平台换令牌、Paws 注册、发送票据和设备展示。
2. 服务端没有新注册 POST 时，先收集手机阶段信息；不能直接断言卡在具体平台。
3. 区分远程推送与 App 在线生成的本地 fallback；核对目标设备的注册更新时间。

## 成功标准

对应设备形成注册、发送、接收的证据链；仅服务端接受请求不算手机收到。

## 失败模式与恢复

旧令牌 InvalidCredentials 不证明新包配置同样失败；未定位前不删除全部旧令牌。没有手机日志时保留待验证状态。

## 验证证据

历史记录仍缺手机令牌阶段与实际远程接收闭环。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/android/operations/diagnose-notifications.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
