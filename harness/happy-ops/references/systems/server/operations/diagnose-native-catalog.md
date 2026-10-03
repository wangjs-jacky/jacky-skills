# 排查安装包目录接口

- system: server
- operation: diagnose-native-catalog
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查安装包目录接口，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/server/operations/diagnose-native-catalog.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 复核实际 catalog 请求时间、状态、缓存及上游 release/sidecar。
2. 区分旧 APK sidecar 超时、整个 catalog 错误和 OTA manifest。
3. 对照 live 代码与配置，不从旧运行态猜代理丢失。

## 成功标准

原请求能给出契约允许的完整或部分结果，缺失资源和缓存状态明确。

## 失败模式与恢复

某次成功不证明间歇问题消失；修复应保留异常分类及上游边界，不把可用部分误作全部失败。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/server/operations/diagnose-native-catalog.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
