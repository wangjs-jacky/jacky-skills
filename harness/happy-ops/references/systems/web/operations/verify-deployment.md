# 核验 Web 上线

- system: web
- operation: verify-deployment
- status: verified
- last_verified: 2026-10-19
- risk: low
- scope: 继承既有 Web 版本、资源和页面加载证据；不是全站 E2E。

## 目标

核验 Web 上线，只处理本目标命中的链路。

## 前置条件与授权

从当前工程指令核实入口和适用版本，沿用户已给授权执行；诊断默认先只读。涉及发布、重启、清理、发送或身份写入时，确认它属于本任务授权范围，不重复索取已有授权。

## 入口

先读所属[系统索引](../index.md)。需要本机值或历史证据时，只读[此操作的私有证据](../../../../local/systems/web/operations/verify-deployment.md)；私有文件在共享安装中可不存在，此时核实当前环境，不能猜本机值。

## 步骤与检查点

1. 对齐目标 merge SHA、部署 summary 的 commit/origin 和线上 HTML 的 paws-release-revision。
2. 读取实际入口资源与代表性 SPA 路由，核对最终响应。
3. 按任务风险在 Ego 中验证目标页面及本次行为，并遵守当前截图归属协议。
4. 已有有效 CI 证据直接复用；目标丢失或 URL 不一致时停止该浏览器验证。

## 成功标准

已核对实际线上版本、资源及声明覆盖的页面行为；缺失的交互或真机证据单独列出。

## 失败模式与恢复

页面首次渲染不等于完成最终版本验收；资源或 revision 不一致时定位缓存/激活阶段，不清理其他任务的浏览器空间。

## 验证证据

继承既有 Web 版本、资源和页面加载证据；不是全站 E2E。 状态和日期只覆盖上面的 scope。来源、原记录状态及未覆盖项见[私有证据](../../../../local/systems/web/operations/verify-deployment.md)。日期继承已存在的具体成功证据，不是本次迁移的执行日期。

执行后按[维护协议](../../../knowledge-maintenance.md)更新本操作及系统索引；未成功不刷新 last_verified。

2026-10-10 最新执行范围见上方 scope；中断发布经同一 CI run 重跑后完成，证据收录于私有操作入口。

2026-10-15：正式HTML、入口资源、SPA路由revision及浏览器设置页运行版本行均与目标merge一致；页面缓存禁用并旁路Service Worker后重新加载。仅为最小上线核验，不替代完整会话或真机交互验收。

2026-10-17：真实部署摘要与精确合并提交一致；首页及设置SPA路由的公开HTML revision匹配，四个入口资源经受限origin的正常重定向后最终HTTP200。GitHub摘要截图已上报；未新增生产聊天行为或手机加载验证。

2026-10-17后续：通过完成的summary写入日志与run headSha核对发布目标；正式首页／设置路由revision和四个入口资源的最终HTTP200、MIME一致，CI live verify成功。此轮仅CLI/API/HTTP核验，未采集浏览器截图或手机交互证据。

2026-10-19：授权精确merged-main的Web CI实际完成不可变上传、预激活、原子切换、live verify与summary；真实Actions摘要Commit/Origin与目标一致，公开首页和设置HTML revision及1CSS/3JS最终HTTP200、MIME核对通过，线上JS中本次新增批注标识可见。未向生产会话发测试消息或新增真机交互，具体版本与证据由所属Goal First目标唯一维护。
