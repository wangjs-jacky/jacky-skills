# 排查 Web 历史分页与同步

- system: web
- operation: diagnose-history-sync
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查 Web 历史分页与同步，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/web/operations/diagnose-history-sync.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 核对历史窗口、游标、滚动方向与 bootstrap/分页具体错误。
2. 区分 durable local history、增量 reconciliation 与全量会话请求；检查重连是否放大同步。
3. 对照相关输入事件和真实窗口边界复现，不把 UI 历史不可用解释为原线程消失。

## 成功标准

目标分页方向、窗口和重连请求符合当前契约，失败提示与实际链路一致。

## 失败模式与恢复

短列表预加载区重叠可能触发反向翻页；没有输入方向与真实位移证据时不要归因缓存。旧接续缺失的上下文不能凭新代码自动补回。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/web/operations/diagnose-history-sync.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
