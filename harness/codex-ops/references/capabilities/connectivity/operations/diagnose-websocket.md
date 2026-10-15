---
capability: connectivity
operation: diagnose-websocket
status: documented
last_verified: null
---

# 诊断 Responses WebSocket 超时

## 目标与前置

区分模型上游 WebSocket 故障与认证、HTTPS、宿主或本地 socket 故障，并确定当前版本适用的恢复方式。诊断与改配置、重启、真实请求分别按授权执行。

## 流程

1. 绑定目标二进制、配置根、provider 和启动覆盖，确认出错链路确实是模型上游 Responses WebSocket。
2. 按[代理诊断](diagnose-proxy.md)核对目标进程的网络环境；当前版本支持时查看 doctor 的相关摘要，区分 WebSocket 与 HTTPS 结果。
3. 若 HTTPS 也不可达，先处理网络或认证。HTTPS 可达而 WebSocket 失败时，核对当前官方 provider 能力及目标版本支持，再评估 HTTPS 传输方案。
4. 已有配置修复授权时按[运行配置](../../configuration/operations/configure-runtime.md)修改正确层级。旧个例使用自定义 provider 的 `supports_websockets = false`、`wire_api = "responses"` 和匹配的认证方式；endpoint 必须来自当前合法配置或已核实来源，不能硬套历史私有后端 URL。
5. 读回有效 provider 的诊断结果。对需要重载的目标按宿主管理路径处理，保留其他会话；若要求确认恢复，执行一次已授权的真实短请求，检查正文和终态。

## 成功标准

诊断有明确的链路与版本证据；修复完成需目标实例确实加载期望传输且真实请求成功。配置被识别不等于模型请求可达。

## 坑与恢复

- HTTP-only 不会关闭宿主 Socket.IO、本地 `ws+unix` 或设备网络，也不证明所有旧会话都已切换。
- 不依赖已被目标版本移除的 feature flag；当前 provider 能力和启动覆盖必须一起核对。
- 恢复本次变更时还原修改前的 provider 选择及相关块，保留预先存在的自定义 provider；不无条件删除整段用户配置。

## 证据

旧环境 2026-09-02 有 HTTP-only 个例；原版本、设备及验证缺口保存在私有历史。2026-10-15 核对官方 provider 字段。本次未切换传输、重启或重新发模型请求。
