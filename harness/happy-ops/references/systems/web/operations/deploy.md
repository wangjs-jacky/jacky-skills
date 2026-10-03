# 发布 Web

- system: web
- operation: deploy
- status: verified
- last_verified: 2026-10-03
- risk: high
- scope: Merged main 经 CI 上传、预激活校验、原子切换和 live verify 通过；正式 HTML revision 及 4 个入口 CSS/JS 响应已核对。

## 目标

发布 Web，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/web/operations/deploy.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 读取当前工程发布契约与 workflow；按已授权方式合入 main，记录 merge SHA。
2. 用精确提交定位并跟踪同一个 CI run，复用已有测试和产物。
3. 核对资源上传、预激活校验、原子切换和 live verify 实际执行。
4. 若 superseded 跳过激活，验证后续 main 的祖先关系和相关 diff，再跟踪承载目标改动的 run。
5. 按 [上线核验](verify-deployment.md) 判断结果，不重复跑同目标本地发布。

## 成功标准

目标提交已由实际激活的线上版本承载；summary、revision 与入口资源一致。

## 失败模式与恢复

只看绿色 conclusion 不够。上传/预激活失败时不提前切换 HTML；按当前正式脚本及保留前版恢复。独立清理步骤失败与激活失败分别报告。

## 验证证据

2026-10-03 执行结果覆盖上面的 scope；具体来源、产物与限制见[私有证据](../../../../local/systems/web/operations/deploy.md)。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。
