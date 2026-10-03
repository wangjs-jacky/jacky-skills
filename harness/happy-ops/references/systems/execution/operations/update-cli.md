# 更新本机 CLI 与 daemon

- system: execution
- operation: update-cli
- status: verified
- last_verified: 2026-10-03
- risk: high
- scope: 稳定入口切换本机 CLI 与 daemon、protocol 3 注册和真实 Codex 回复；保留 30 个旧会话，Claude 已安装但未登录，未更新其他设备或 npm。

## 目标

更新本机 CLI 与 daemon，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/execution/operations/update-cli.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 从系统私有入口核实命令解析、启动器、runtime、Node/cwd 和实际 bundle。
2. 按当前仓库规则在隔离目录构建候选，保留前版与必要补丁。
3. 在授权范围切换真实 runner；必要时重启 daemon，核对注册与新 worker 行为。
4. 分别报告包版本、源码、daemon 和既有 worker 的生效范围。

## 成功标准

实际启动入口与候选一致，新工作进程覆盖目标能力；旧会话保留情况清楚。

## 失败模式与恢复

全局 npm 版本一致不证明 runner 更新。不得为版本对齐批量杀旧 worker，不把构建环境生成的 chunk 文件名当跨平台固定入口。

## 验证证据

2026-10-03 验证覆盖上述 scope，来源与限制见[私有证据](../../../../local/systems/execution/operations/update-cli.md)。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
