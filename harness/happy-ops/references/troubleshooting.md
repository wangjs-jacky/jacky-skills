# 故障定位路由

先用一个症状选择一条 operation；真实执行按当前源码和运行态复核。

| 症状 | 下一步 |
| --- | --- |
| 白屏、502、页面深链慢 | [Web 加载](systems/web/operations/diagnose-loading.md) |
| 列表、分页或重连异常 | [Web 历史](systems/web/operations/diagnose-history-sync.md)；手机则进入 [Android 历史](systems/android/operations/diagnose-history-sync.md) |
| 图片打不开、模型读不到 | [附件](systems/web/operations/diagnose-attachments.md) |
| 队列或插话行为错乱 | [输入框](systems/web/operations/diagnose-composer.md)，仅涉及 worker 协议时进入[原生插话](systems/execution/operations/diagnose-steer.md) |
| 手机不更新、安装包检查失败 | [更新诊断](systems/android/operations/diagnose-update.md) |
| 通知转圈或不提醒 | [推送](systems/android/operations/diagnose-notifications.md) |
| 扫码绑定失败 | [账号绑定](systems/android/operations/diagnose-account-link.md) |
| 后端/Socket 连接、RPC 超时 | [连接诊断](systems/server/operations/diagnose-connection.md) |
| 认证上传、账号归属冲突 | [服务端凭据同步](systems/server/operations/diagnose-credential-sync.md) |
| 执行机离线、资源耗尽 | [执行机资源](systems/execution/operations/manage-resources.md) |
| 在线但新会话启动失败 | [启动诊断](systems/execution/operations/diagnose-session-start.md) |
| 403/not login、旧凭据 | [执行端认证](systems/execution/operations/diagnose-auth.md) |
| 额度不刷新 | [额度](systems/execution/operations/refresh-quota.md) |
| Resume/接续/原线程问题 | [恢复原会话](systems/execution/operations/resume-session.md) |
| 历史库格式或锁 | [历史库](systems/execution/operations/diagnose-history-store.md) |
| 设备扫描无响应 | [环境扫描](systems/execution/operations/inspect-environment.md) |
| SDK 与 fetch 网络行为不同 | [代理](systems/execution/operations/diagnose-proxy.md) |
| 模型不支持或 capacity | [模型能力](systems/execution/operations/diagnose-model.md) |
| 外部集成启动、身份、产物问题 | [集成边界](systems/execution/operations/diagnose-integration.md) |

确认失败环节后只修改该层。SSH、daemon 在线、worker 存活、模型认证与设备使用分别验证；未定位根因只记录观察，不写已修复。
