# 认证与连接

能力：`connectivity`。先确认请求实例、认证来源与网络层，再判断恢复方法。

## 共用事实与边界

- ChatGPT 登录、API key、自定义 provider 的认证来源分别核对；另一配置根已登录不能证明当前会话登录。凭据存在不证明未过期、账号可访问目标模型或链路成功。
- 系统代理、交互 shell、桌面应用和托管 app-server 的环境可能不同。只输出需要的代理状态摘要，代理 URL 自身也可能带秘密。
- 模型上游 Responses WebSocket、HTTPS 流式响应、宿主客户端连接和本地 Unix socket 是不同链路，关闭其中一种不证明其他连接变化。
- 官方配置参考包含 provider 的 `supports_websockets`、`requires_openai_auth` 与 `wire_api`；具体命令和字段仍按目标版本核对。
- `codex doctor` 可提供诊断报告，当前官方 CLI 文档也有此命令；旧版本先查帮助。报告可能涉及账号、路径或项目，只摘录相关非敏感结论。
- 连接计数、代理可达、HTTP 200、模型目录可见均不能单独证明真实模型任务完成。用量限制和认证失败也不能仅凭超时互相推断。

## Operations

- [认证诊断](operations/diagnose-auth.md)
- [代理诊断](operations/diagnose-proxy.md)
- [Responses WebSocket 诊断](operations/diagnose-websocket.md)

## 来源

2026-10-15 阅读 [CLI reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli)、[Authentication](https://learn.chatgpt.com/docs/auth)、[Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) 与 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)。旧 HTTP-only 个例的实际 endpoint、设备与版本留私有历史，不能推成永久官方接口承诺。
