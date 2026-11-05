---
capability: connectivity
operation: diagnose-proxy
status: documented
last_verified: null
---

# 诊断代理与连接阶段

## 目标与前置

确认目标进程是否使用预期代理，并定位失败或等待发生的网络阶段。先绑定实际实例，不能把另一会话或浏览器请求归为同一链路。

## 流程

1. 核对宿主启动方式与实际代理注入，区分系统代理、shell 环境、进程环境和 provider endpoint。只记录状态或脱敏地址。
2. 按需做单次、限定目标的可达性检查，区分 DNS、代理 CONNECT、TLS、HTTP 响应和模型流；公共端点成功只能证明其覆盖的网络段。
3. 查目标进程的必要连接信息，避免遍历或打印所有日志。代理连接数不等于上游请求数，也不证明回答质量或账号上限。
4. 需要改注入时只针对目标命令或宿主管理配置，保留原网络策略；不为测速关闭认证、Host/Origin 检查或证书校验。
5. 任务要求真实性能结论时记录首响应、首正文、回合终态和进程收尾，绑定账号、模型、上下文和样本条件。真实请求沿用授权。

## 成功标准

能说明目标代理是否生效及已观察的故障/等待阶段。恢复后只声明证据覆盖的链路；没有分段证据时不推断根因。

## 坑与恢复

桌面 app-server 不一定继承 shell 代理；HTTP-only 不能修复 HTTPS 本身不可达。相同用户问题不等于相同上下文；进程收尾等待不能全部计为模型思考。

### 第三方网关的 429 与备用路由（2026-11-04，源码/文档核对）

- 分开核对原生登录账号切换、网关内账号重选、跨 provider 备用路由。只有经过目标网关的请求才受其请求级重试控制；把多个账号列在界面中本身不能证明正在失败的请求会自动重发。
- 429 需要同时看返回层、错误体、Retry-After、额度窗口和请求进度。OpenCodex 当前还用 429 表达 upstream_reset_replay_refused（上游是否执行不明，拒绝自动重发）；它不能当作账号额度耗尽。记录失败请求与下一次尝试的关联及最终完成，不能用一句 exceeded retry limit 推断实际尝试次数。
- 外层只有远端池的 URL/Key 时只能选择可见的 provider/key，不能直接选择该池内部的 OAuth 账号。二次路由须另有可用候选；同一后台池的多个入口不自动构成独立容量。
- Magpie 的当前文档说明，识别到额度/限速失败可冷却账号并切换候选，前提是尚未向客户端发送回复。流式输出已开始、续传引用与会话账号绑定需按项目及版本另验；多层重试还可能放大上游尝试和等待时间。
- 本轮只核对第三方主分支文档和代码，未操作用户的账号池，也未演练 429。此前单次模型调用成功不能替代多账号故障切换验收。

来源：[Magpie 路由及账号文档](https://github.com/yetone/magpie/blob/c360d9d30d96fa6adf38f103dda0b107c0bbcf66/docs/reference.md)、[OpenCodex 429 诊断](https://github.com/lidge-jun/opencodex/blob/cab7eb7d0332ae0ebb4289d7c6bac1de666b6e40/docs-site/src/content/docs/reference/codex-retry-diagnostics.md)、[OpenCodex Combos](https://github.com/lidge-jun/opencodex/blob/cab7eb7d0332ae0ebb4289d7c6bac1de666b6e40/docs-site/src/content/docs/guides/combos.md)。这些是对应第三方项目的行为，不构成 OpenAI 原生客户端或上游服务保证。

## 证据

来自旧环境 2026-09-02 代理继承记录及 2026-10-13 延迟记录，项目专属测量仍由原工程记录维护。本次没有改变代理或执行网络测速。
