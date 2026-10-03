# 排查历史库兼容与锁

- system: execution
- operation: diagnose-history-store
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查历史库兼容与锁，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/diagnose-history-store.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 识别当前 Codex 历史 schema、缓存版本、目标原线程和复制/恢复入口。
2. 用只读副本核验格式及锁持有者，区分原库、账号缓存和 App 接续上下文。
3. 验证读取、恢复与启动耗时，保护原始库和前版。

## 成功标准

原历史可在目标路径正确读取，兼容/锁问题有复现与修复证据。

## 失败模式与恢复

不对唯一历史库做 SQL 试验；缓存全量 restore 和进程 copyLock 可能阻塞启动，不能只调 RPC 超时。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/diagnose-history-store.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
