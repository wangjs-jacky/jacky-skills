# 系统目录

按目标对象选择一个系统，读其 index，再读一条 operation。环境、频道和机器不生成重复系统。

| 系统 | 命中词 | 入口 |
| --- | --- | --- |
| Web 前端 | PC Web、浏览器、页面、静态资源、反向代理 | [web](web/index.md) |
| Android App | 手机、App、APK、OTA、更新、推送、扫码 | [android](android/index.md) |
| 自托管 Server | 后端、API、Socket、数据库、凭据中继、目录接口 | [server](server/index.md) |
| 执行端与集成运行时 | CLI、daemon、worker、Codex、SDK、执行机、代理、外部集成 | [execution](execution/index.md) |

跨端合并发布先读[发布路由](../release-routing.md)；未知故障先读[排障路由](../troubleshooting.md)缩小对象。
