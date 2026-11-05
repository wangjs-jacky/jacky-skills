---
capability: access
operation: protect-private-worker-assets
status: partial
last_verified: null
---

# 保护Worker静态应用与私有API

## 目标

所有应用入口和私有对象读取都受正确身份约束，明确Static Assets及内部绑定的身份传递边界。

## 适用状态与前置条件

已知生产/预览/备用域、静态路由方式、个人或组织身份范围。读取[能力档案](../index.md)，核对实际账户和配置；设计不授予创建策略或修改生产的权限。

## 设计与执行

1. 枚举并保护每个入口，未使用入口禁用，不能只测主域登录页。
2. Static Assets场景用官方Cf-Access-Jwt-Assertion验签方案，固定issuer/audience、算法、到期和身份范围；禁止只信邮箱头。
3. JWKS从配置的团队域按请求取用与缓存，kid不命中时本次请求最多刷新一次，失败拒绝；不依据token提供的任意URL请求密钥。
4. 通过binding显式传最小授权身份给DO/Workflow，下游不依赖ctx.access自动继承；客户端不能选择任意工作区。
5. 变更API及WS检查Origin/CSRF；连接保存到期与撤销版本，每次收发核对，不周期查认证状态。明确Access后台变更与存量连接撤销的差异。
6. 资料内容私有且不公共缓存；静态前端不含凭据。实际测试鉴权头、文件下载、WS握手与全部入口。

## 坑与恢复

ctx.access缺失有路由原因，不能自动降为匿名授权。JWKS失败不跳过验签。页面能打开不证明私有API拒绝未登录用户；本地模拟不代替生产。鉴权失败应保持明确错误，不启动自动刷新/重连循环。

## 成功标准

未登录、伪造邮箱头、错误aud/issuer、过期token、跨源WS、跨工作区ID和备用入口绕过全部拒绝；合法本人操作、私有下载与显式重连通过；注销/到期后存量连接不再收到业务数据。

## 验证证据与边界

2026-10-24核对官方文档并完成设计，未配置真实账户或测试生产。状态documented，无last_verified。

2026-10-25真实Worker所有路径均先鉴权；未配置Access的首页、bootstrap、任务与事件入口均返回401/private,no-store。测试运行时使用真实RSA签名与模拟JWKS验证本人、错误身份、过期、错误aud/issuer、篡改、跨源与CSRF拒绝。真实账户尚未初始化Zero Trust，免费开通页另要求持续超额扣费授权，因此未提交。未完成真实Access登录、备用入口与登录后浏览器验收。 状态partial，last_verified保持为空。

2026-10-25后续：用户明确接受免费版计费条件后，单Worker全部流量保护与精确邮箱策略已生效，issuer/audience取实际读回。合法本人真实登录、私有原件请求和WebSocket连接通过；匿名及伪造邮箱头的首页、bootstrap、文件请求均302至Access且未返回私有数据。跨标签注销、错误真实身份等完整条件尚未完成，保持partial/null。

2026-10-25补验：真实登录页面向变更API提交缺少X-CSRF-Token的POST，云端返回403/CSRF_DENIED。跨标签注销验收因浏览器控制权中断，没有结果；原有完整成功条件仍未覆盖，保持partial/null。

2026-10-25最终浏览器补验：合法本人注销后旧WS收到4001/Logged out，跨标签缓存清空，旧私有读取返回Access重定向且无正文；再次登录保留原有资料。前端需独立处理认证重定向、会话关闭与同源注销通知，Access本身不会清理React缓存。真实错误账号、完整到期矩阵等尚未全覆盖，保持partial/null。
