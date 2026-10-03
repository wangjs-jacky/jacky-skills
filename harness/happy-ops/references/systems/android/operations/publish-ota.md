# 发布并核对 OTA

- system: android
- operation: publish-ota
- status: verified
- last_verified: 2026-10-03
- risk: high
- scope: PR preview 与 merged-main production CI 发布及 manifest 元数据读回通过；未覆盖手机实际加载。

## 目标

发布并核对 OTA，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/android/operations/publish-ota.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 从工程机器可读配置和契约测试确认 variant/package/channel/runtime，检查 native-sensitive 变更。
2. PR 定向验收复用 preview CI；生产按 merge SHA 和 workflow 路径过滤跟踪。
3. 区分历史 stamp 与 latest，交付精确 manifest/Update ID；不额外覆盖共享测试目标。
4. 读回 manifest 并核对 id/runtime/channel，按需核验 bundle。设备加载需要真实设备证据。

## 成功标准

发布目标及 manifest 元数据一致；已发布与设备已加载分开报告。

## 失败模式与恢复

未触发、原生敏感跳过、上传失败分别处理。OTA 无法补齐缺少的原生能力；不盲目改频道、重推 latest。

## 验证证据

2026-10-03 执行结果覆盖上面的 scope；具体来源、产物与限制见[私有证据](../../../../local/systems/android/operations/publish-ota.md)。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
