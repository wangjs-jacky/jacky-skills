---
capability: resource-delivery
---
# 资源交付

区分服务端响应、跨网传输、浏览器代码加载与应用恢复。下载的前端插件模块不代表把服务器执行器、模型凭据或整个项目复制到客户端。

缓存必须以当前资源的内容、版本机制和原有约束为依据。体积区分压缩传输/解码后大小；load、DOM就绪与可交互分别记录。HTTP网关可能覆盖上游缓存头，同一文件须逐段核对。

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| diagnose-loading | verified | 2026-11-09 | [定位外部加载瓶颈](operations/diagnose-loading.md) |
| optimize-browser-cache | verified | 2026-11-09 | [优化浏览器资源缓存](operations/optimize-browser-cache.md) |

来源：单一版本第三方Web的真实源站/网关/外部客户端对照。缓存TTL和URL识别不在能力层固定；拆包及其他应用适配尚无本Skill成功结论。
