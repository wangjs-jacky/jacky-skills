# 发布 Web

- system: web
- operation: deploy
- status: verified
- last_verified: 2026-10-19
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

2026-10-08 最新执行范围见上方 scope，证据收录于对应私有操作入口。

同日后续仅发布独立应用的发送前准备优化；函数对照和公网资源核对通过，未复验浏览器或完整模型回复。具体记录见私有操作入口。

2026-10-10 最新执行范围见上方 scope；中断发布经同一 CI run 重跑后完成，证据收录于私有操作入口。

2026-10-15：再次验证精确merged-main生产CI上传、激活与live verify；公开revision/资源及浏览器运行版本行一致。具体证据见私有操作入口，未扩大为完整会话交互或手机加载验收。

2026-10-17：精确合并提交的生产CI实际完成构建、不可变资源上传／校验、原子切换、live verify与摘要。真实GitHub摘要的commit／origin和线上首页／设置路由revision一致，入口CSS及三个JS跟随既有静态存储重定向后最终HTTP200。只覆盖发布链、版本和资源，不包含本轮生产会话或真机交互。

2026-10-17后续：另一精确merged-main发布完成上传、预激活、激活、live verify和清理；通过成功的summary写入日志与run headSha核对发布目标，正式首页／设置路由revision及四个入口资源读回通过。本轮无浏览器或真机交互验收。

2026-10-19：授权精确merged-main的Web CI实际完成不可变上传、预激活、原子切换、live verify与summary；真实Actions摘要Commit/Origin与目标一致，公开首页和设置HTML revision及1CSS/3JS最终HTTP200、MIME核对通过，线上JS中本次新增批注标识可见。未向生产会话发测试消息或新增真机交互，具体版本与证据由所属Goal First目标唯一维护。
