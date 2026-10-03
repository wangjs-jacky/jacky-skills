# 发布 CLI 或 SDK 包

- system: execution
- operation: publish-package
- status: historical
- last_verified: none
- risk: high
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

发布 CLI 或 SDK 包，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/publish-package.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 按当前包与 release 约定构建、测试并检查 pack 内容和源码来源。
2. 精确确认 registry 版本/dist-tag；复用有效产物。
3. 发布后核对包内文件，并在干净安装中验证所声明能力。

## 成功标准

精确版本的真实包内容、标签与安装行为一致。

## 失败模式与恢复

上传报错先查询版本是否已经存在，不盲重试或复用版本；tar 封装哈希不同需区分实际文件差异。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/publish-package.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
