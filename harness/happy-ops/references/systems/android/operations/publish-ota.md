# 发布并核对 OTA

- system: android
- operation: publish-ota
- status: verified
- last_verified: 2026-10-19
- risk: high
- scope: PR preview CI 与 merged-main production CI 发布成功；不可变 manifest ID/runtime/来源提交读回，production latest 与不可变版本一致且主JS可达。未覆盖手机实际加载。

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

2026-10-08 最新执行范围见上方 scope，证据收录于对应私有操作入口。

2026-10-15：merged-main生产CI成功，latest及不可变manifest的ID/runtime/提交前缀读回一致，主包可达；仍未验证手机实际加载。具体参数及证据见私有操作入口。

2026-10-17：PR preview CI发布成功；读回不可变manifest的ID、runtime与PR测试合并来源，不覆盖共享latest。此结果不表示生产发布、本机执行端激活或手机加载；相应证据见私有操作入口。

2026-10-17后续：精确merged-main的production CI完成兼容分类、runtime契约和发布；commit comment、latest与不可变manifest的ID/runtime/提交前缀一致，主JS返回HTTP200。未验证手机实际加载；具体证据归私有操作入口。

2026-10-17预览补充：PR preview CI成功且不覆盖共享latest；不可变manifest/meta与PR测试合并来源读回一致，实际主包SHA-256及Hermes字节码内静态脚本文本保留均核对通过。未覆盖设备显示或手势；具体证据见私有操作入口。

2026-10-19：同仓库PR自动preview CI成功，不覆盖共享latest；不可变manifest的ID/runtime与PR测试合并来源一致，测试合并parents包含当前功能head，实际主包SHA-256与manifest匹配。仅复验本条PR预览范围；production历史证据沿原日期，未重新发布生产或验收手机加载。PC Web专属功能的Android自动bundle产物不等同原生新增交互；具体参数由对应私有证据入口指向所属Goal First目标。

2026-10-19正式发布补充：同目标授权合并后的production CI实际publish成功；runtime契约通过，latest与不可变manifest完全一致，ID/runtime/来源提交与真实Actions摘要和merge comment一致，主包HTTP200及SHA-256匹配。未验证手机实际加载，本次Web专属交互不构成原生新功能；具体参数在所属目标唯一发布记录。
