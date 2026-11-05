---
capability: waf
operation: diagnose-api-user-agent-rejection
status: verified
last_verified: 2026-10-24
---

# 诊断API请求的客户端签名拒绝

## 目标

区分客户端签名/请求头导致的Cloudflare拒绝、源站鉴权失败与独立网络故障，并验证所测客户端的合规接入方式。诊断成功不表示所有客户端或生产Worker已验收。

## 适用状态与前置条件

用户授权诊断其API；有已知有效凭据和源站只读入口。公网出现403，保留最小脱敏正文、Content-Type、CF-Ray及网络路径；凭据始终留受控进程。

## 设计与执行

1. 同一Key分别检查源站与公网的模型目录等只读端点，增加无Key负例。不要仅凭Server:cloudflare认定WAF。
2. 固定主机、路径、Key及网络路线，仅比较默认客户端User-Agent和诚实应用User-Agent，例如 `my-app/1.0`。每项单次请求，禁止后台查询循环。
3. 1010官方定义为客户端签名拒绝；结合只改UA的差分，可定位签名/请求头类别。未读取账户设置/安全事件时，不声称知道具体BIC开关或规则ID。
4. 保存应用客户端defaultHeaders并确认真正发送；公网保留TLS验证。验证一次真实流式业务请求的终态和正确结果。
5. 无凭据负例仍需拒绝。Worker、直连、代理、其他SDK分别验收，不能相互代替。

## 坑与恢复

- 默认UA触发拒绝不代表密钥或额度错误；响应Content-Type不同的历史403不得合并归因。
- Cloudflare Origin证书不是浏览器公共信任证书。若隔离源站诊断绕过证书验证，明确它只适用于该诊断；生产公网不得沿用。
- 明确应用UA是当前实测接入方式，不构成永久免拦保证；不得以全Zone关闭防护作为默认修复。需要规则调整时先读取实际规则和授权，只针对必要主机/路径。
- 配置文件存在不等于客户端已应用；默认头应在实际网络请求中使用。

## 成功标准

同路径/同Key的UA差异可复现，源站与公网结果可以区分；明确客户端能完成真实业务且负向鉴权有效；记录未测路径和账户规则未知。这个operation仅对诊断与所测客户端恢复负责，不包含全平台部署。

## 验证证据与边界

2026-10-24实际私有API场景：两条客户端网络路线均在Python默认UA下返回403/1010，明确应用UA后目录200；源站及公网无Key401；公网流式真实推理收到response.completed且合成答案正确。客户端配置已持久化，未修改Cloudflare规则或重启源站。未读Zone BIC设置，未验证Worker出站；早期另一条直连TLS超时单独保留。实例证据存本机记录。

官方依据：[1010](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/)、[BIC](https://developers.cloudflare.com/waf/tools/browser-integrity-check/)。2026-10-24读取官方文档，与运行证据分开。
