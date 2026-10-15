---
platform: vscode-marketplace
updated: 2026-10-15
docs_checked: 2026-10-15
---

# VS Code Marketplace

## 边界、认证与限制

以 publisher、扩展 name、version、目标架构和稳定/预发布渠道确定对象。2026-10-15 核对官方发布文档：

- 官方推荐 Microsoft Entra ID 的 workload identity federation/managed identity 自动发布方式，并公告 Azure DevOps 的 global PAT 于 2026-12-01 退役。执行时查看当前迁移指引和项目实际方式，不沿用“PAT 永久有效”说明，也不把未来退役公告描述为当下所有 PAT 已不可用。
- 已有 PAT 流程核对当前有效性、publisher 权限和官方要求；认证信息留专用配置或密钥存储，不写进全局 AGENTS/CLAUDE 文档。
- `vsce` 可以打包，也可用 `publish --packagePath` 发布指定 VSIX；复用产物前核对版本、源码与目标架构。
- `vscode:prepublish` 是打包生命周期的一部分。官方指出 devDependencies 自动忽略；不能仅为排除开发依赖而无条件使用 `--no-dependencies`，否则可能移除运行依赖。打包列表按真实项目核对。
- 当前预发布文档要求三段版本，用 `--pre-release` 区分渠道；稳定版与预发布版不能复用同一版本号。不直接套 npm 的 semver prerelease 规则。

## 操作目录

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| publish-extension | documented | — | [发布扩展](operations/publish-extension.md) |

## 共享陷阱与来源

发布器接受请求、市场验证完成、公开版本可读是不同阶段。按当前目标保留未完成项，不用固定等待几分钟代替证据。平台架构包与 web 目标按项目需要决定，不统一复制模板排除所有 `node_modules` 或源码目录。

- [Publishing extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

上述为文档核对，未执行真实发布、认证迁移或安装验证。其他大小/数量限额在实际命中时再核对。
