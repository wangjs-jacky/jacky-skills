---
platform: open-vsx
updated: 2026-10-15
docs_checked: 2026-10-15
---

# Open VSX

## 边界、认证与限制

以 registry、namespace、扩展 name、version 和目标平台定位。2026-10-15 核对 Eclipse Open VSX 发布文档：

- 公共 open-vsx.org 的注册、关联 Eclipse 账号和 Publisher Agreement 有独立要求；不能沿用 VS Code Marketplace 已发布来推断此处也已配置。协议同意由用户明确处理。
- `package.json` 的 publisher 对应 namespace。发布前 namespace 需存在，创建 namespace 不自动取得 verified owner 标记。
- 当前所读官方教程使用 access token 与 `ovsx`，并支持发布现有 VSIX。Token 放凭据存储或 CI secrets；经验只记录来源。仅添加 `id-token: write` 不足以证明项目具备 OIDC 发布能力；其他认证方式须另查当前官方依据。
- 从源码打包会使用 vsce 并运行 `vscode:prepublish`。是否禁用依赖收集取决于实际打包方式，不能默认所有扩展都加 `--no-dependencies`。
- 扫描可能拒绝包含秘密、命中阻断或 namespace 相似性问题的扩展。依据具体返回修复，不将关闭校验作为常规发布方式。

## 操作目录

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| publish-extension | documented | — | [发布扩展](operations/publish-extension.md) |

## 共享陷阱与来源

双市场分别检查命名空间、身份与可用版本；另一市场成功不是本平台的证据。自建 registry 需明确地址和实际规则，不假定与公共 registry 完全相同。

- [Eclipse Open VSX Publishing Extensions](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [同页原始 Markdown](https://raw.githubusercontent.com/wiki/eclipse/openvsx/Publishing-Extensions.md)

本次只核对官方资料，未创建账号、签署协议、创建 namespace 或真实上传。
