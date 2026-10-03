# 排查输入框排队与插话

- system: web
- operation: diagnose-composer
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查输入框排队与插话，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/web/operations/diagnose-composer.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 分别复现空闲发送、运行中暂存、显式立即插话、后续普通输入与停止。
2. 检查普通输入是否被之前的 steer 状态持续改道；同时核对实际 CLI 能力。
3. 受控 fixture 记录状态机调用，Web 构建器优先解析 .web.*；真实链路缺口单列。

## 成功标准

按钮含义、队列状态和实际发送时机一致；组件证据与 Session/CLI 端到端证据分开。

## 失败模式与恢复

一次 steer 成功不证明下一条应继续 steer。fixture 自行实现的回调不能证明正式连接、附件恢复或真机行为。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/web/operations/diagnose-composer.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
