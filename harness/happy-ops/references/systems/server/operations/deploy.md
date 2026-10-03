# 部署自托管 Server

- system: server
- operation: deploy
- status: verified
- last_verified: 2026-10-03
- risk: high
- scope: 受控候选与旧版恢复、隔离 Prisma、新增兼容字段迁移、真实授权/模型/限域历史、所有者只读历史与健康检查；不代表全量 main 后端发布。

## 目标

部署自托管 Server，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/server/operations/deploy.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 核实 live runner/config、release、schema/migrations 和真实健康路径。
2. 比较批准 diff 与 live 基线，保留生产独立补丁；在 active 之外准备候选。
3. 构建并验证受影响接口，单独处理数据库迁移范围；激活前重读 live，避免覆盖并发发布。
4. 保留前版和恢复入口，受控切换并按时限核验版本、health、API、Socket 和错误日志。

## 成功标准

实际运行版本包含目标改动，受影响接口与恢复范围都有证据。

## 失败模式与恢复

不在 active 目录试验或清理旧构建。稀疏副本既有类型错误需与相同基线比较，不能将无新增错误写成全通过。

## 验证证据

2026-10-03 验证覆盖上述 scope，来源与限制见[私有证据](../../../../local/systems/server/operations/deploy.md)。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
