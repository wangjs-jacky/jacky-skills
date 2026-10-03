# 排查执行机资源与回收

- system: execution
- operation: manage-resources
- status: historical
- last_verified: none
- risk: low
- scope: 历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。

## 目标

排查执行机资源与回收，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/manage-resources.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 对齐机器/容器身份、进程树、会话 ledger、活跃 turn/排队/审批与恢复能力。
2. 区分整机睡眠、网络、电源、内存与 daemon 心跳；缺日志不指定唯一根因。
3. 回收、容器替换或防休眠调整只在授权内执行，保留未知进程和回滚；使用不会拉起被测服务的观察。

## 成功标准

目标资源变更可观测，保留任务仍可运行；清理成效与瞬时采样分开。

## 失败模式与恢复

PPID=1 或 daemon 无登记不证明闲置；RSS 相加不等于实际释放。Compose init 配置不证明旧容器已重建，不能让两个活跃实例共用身份目录。

## 验证证据

历史经验整理；执行前按当前源码与运行态复核，未在迁移中重新执行。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/execution/operations/manage-resources.md)。last_verified 为 none；原记录中的成功日期只作为历史证据，不自动提升整条操作状态。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
