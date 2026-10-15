---
platform: vscode-marketplace
operation: publish-extension
status: documented
last_verified: null
---

# 发布 VS Code Marketplace 扩展

## 目标

将指定 publisher 的扩展、版本、渠道及目标架构发布到 VS Code Marketplace。

## 前置条件与授权

读[平台档案](../index.md)。明确源码、publisher/name/version、engines.vscode、稳定/预发布、目标平台和项目发布入口；核对当前身份及认证方式，不从全局指令文件提取 PAT。

## 流程与检查点

1. 读取项目配置、打包规则和发布 workflow。已有 CI 走原入口，首次配置按当前官方认证指引及授权处理，记录未完成的 publisher/身份关联事项。
2. 按实际 bundling 与运行依赖核对包内容，不机械排除 `node_modules`、源码或所有依赖。检查 `vscode:prepublish` 和构建入口，复用有效 VSIX。
3. 显式核对 VSIX 中身份、版本与目标；本机按当前 vsce 支持的 `publish --packagePath <file>` 或项目命令发布，CI 路径只触发项目所需入口。
4. 读回该扩展版本的市场处理状态与目标平台，不只看 CLI 上传成功。目标要求公开可下载时取得该状态证据；仍在验证中时保留待办。
5. 同时发布 Open VSX 时读取其独立[操作](../../open-vsx/operations/publish-extension.md)，共享适用产物，但分别维护身份、认证和结果。

## 成功标准

正确 publisher/扩展/版本/架构/渠道已达到本次要求的发布状态；需要公开下载时能关联实际制品。安装/功能验证未执行就不声称已验证运行行为。

## 坑与恢复

先查是否已接受相同目标版本，避免重新打包出不同内容后盲重发。市场处理失败按真实原因修正。新建身份、迁移认证、撤销版本或扩大目标平台范围需要对应任务授权，不由发布失败自动触发。

## 证据与边界

2026-10-15 已核对官方发布说明，未执行发布、认证迁移或试装。按[写回协议](../../../knowledge-schema.md)维护。
