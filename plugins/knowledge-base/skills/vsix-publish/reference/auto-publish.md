# 扩展自动发布：兼容入口

先按[入口](../SKILL.md)定位 release-ops，读取实际市场的档案及 `operations/publish-extension.md`。CI 只是执行方式，两个市场的身份、认证和结果分别核对。

复用项目当前 workflow 和产物，不无条件覆盖模板。Marketplace 的认证方式按当前官方迁移指引决定；不能只给 Open VSX job 添加 `id-token: write` 就声称已具备 OIDC。

凭据只在适用密钥存储或 CI 引用中配置，不写入全局 AGENTS/CLAUDE。不得把 `continue-on-error` 当作跳过项目发布门槛的默认配置；也不通过重推旧 tag 充当通用回滚。成功条件、恢复和自动沉淀统一遵循 release-ops。
