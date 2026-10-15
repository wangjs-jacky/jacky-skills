---
platform: npm
updated: 2026-10-15
docs_checked: 2026-10-15
---

# npm

## 边界、认证与限制

以精确 registry、包名、版本和 dist-tag 定位发布对象。以下是 2026-10-15 核对官方文档后的规则，未来执行需结合当前项目和来源复核：

- 同一 registry 的包名与版本组合不能重复发布，即使撤销过该版本也不能复用。上传返回错误时先核对版本实际是否存在。
- Trusted Publishing 通过已配置的 CI 身份使用 OIDC，不能用本机 `npm whoami` 或缺少 `NPM_TOKEN` 判定其不可用。官方当前要求 npm CLI 至少 11.5.1、Node.js 至少 22.14.0；这是文档门槛，不代表当前项目已符合。
- GitHub 路径需核对包配置中的 owner、repository、workflow 文件名及可选 environment，workflow 的实际发布 job 需要 OIDC 权限。当前文档限定受支持的云托管 runner，不能将自托管 runner 视为等价。
- Trusted Publisher 的 allowed actions 要与操作相符：当前文档区分 stage publish、直接 publish 和 dist-tag 管理。没有显式允许直接发布时，不能仅凭信任关系存在就运行直接 publish；按项目采用的方式读取当前官方说明。
- 交互登录、Token 与 OIDC 是不同模式。Token 有效期、权限和 2FA 约束按当前包政策核实，不记录“一次配置永久使用”或“所有 granular token 默认绕过 2FA”。
- 公开/受限访问和 `latest`/预发布 dist-tag 要按目标明确指定；名称带 scope 不授予改为公开的权限。monorepo 定位正确 workspace、版本来源和 tarball。

## 操作目录

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| configure-publishing | documented | — | [配置发布](operations/configure-publishing.md) |
| publish-package | documented | — | [发布包](operations/publish-package.md) |
| diagnose-publish-failure | documented | — | [排查失败](operations/diagnose-publish-failure.md) |

## 共享陷阱与来源

先读取实际 workflow 的触发条件、working-directory 与发布身份，不猜文件名。npm tarball 的 integrity 可用于核对产物；打包命令可能运行 lifecycle 脚本，检查项目脚本后再决定执行。CI 完成不等于 registry 已取得正确版本或标签。

- [Trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)

本次只核对上述机制，不将文档示例的 workflow、Node 版本或缓存偏好直接应用到所有项目。没有实际发布证据。
