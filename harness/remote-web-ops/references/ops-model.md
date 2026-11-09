# 分类与操作模型

## 范围与依据

用户于2026-11-09确认名称remote-web-ops，目标覆盖远端Web部署、开通访问入口和体验优化。主键采用对齐过程中讨论的capability；具体五类划分为本次实施选择，非平台产品清单。

- 集合：references/capabilities/；主键：capability。
- runtime：运行条件与部署恢复；connectivity：请求经过的路径；identity：身份与权限；resource-delivery：前端资源交付；realtime：持续连接语义。
- 机器、服务名、域名、账号、环境和版本是实例条件。相同服务换域名不新建能力，相同方法跨服务复用其适用条件。
- 按主要解决的能力归属，不按修改哪个代码文件归属。修改网关缓存属于resource-delivery；退出权限属于identity，引用realtime的连接清理机制。
- 一个完整案例的目标/状态/过程留Goal First；本Skill保留方法与最小证据摘要。部署拓扑、平台事实和浏览器操作分别引用原有领域OPS。

## 首批操作导航

操作状态和成功日期只以[能力索引](capabilities/index.md)路由到的operation为正文来源：

| capability | 当前操作 | 用途 |
| --- | --- | --- |
| runtime | deploy-and-verify | 部署与分层验收，当前为设计指引 |
| connectivity | diagnose-access-path | 区分路径事实、差分样本与切换结论 |
| identity | verify-session-boundaries | 验证HTTP/API身份、退出与旧权限失效 |
| resource-delivery | diagnose-loading | 分离首次/刷新、传输与可交互瓶颈 |
| resource-delivery | optimize-browser-cache | 仅对当前可证明的版本资源优化缓存 |
| realtime | verify-ws-session-lifecycle | 核对WS握手、授权和注销后的关闭 |

私网备用入口、上游拆包和SSE专项可成为后续操作，当前不预建成功步骤。一次恢复的验收目标与持续长稳不同，按成功标准拆分，不用一个大操作包住所有结论。

## 扩展策略

按现有能力自动补同类操作、别名和版本差异；需要新增同标准能力时说明归类依据和证据。改变分类轴、拆并既有归属或扩展服务范围再与用户对齐。

首次操作由当前证据和授权决定；不因为存在目录就默认某服务已部署、某提供商已配置或可修改全局代理。
