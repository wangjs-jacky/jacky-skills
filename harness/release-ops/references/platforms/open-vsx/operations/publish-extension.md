---
platform: open-vsx
operation: publish-extension
status: documented
last_verified: null
---

# 发布 Open VSX 扩展

## 目标

将明确 namespace 下的扩展版本与目标平台发布到指定 Open VSX registry。

## 前置条件与授权

读[平台档案](../index.md)。核对 registry、namespace/name/version、源码或 VSIX、项目工作流及有效发布身份。公共 registry 的账号关联、协议和 namespace 条件分别核对，不能由另一市场成功推断齐全。

## 流程与检查点

1. 定位现有发布入口和目标身份；缺少 namespace 或协议时说明具体条件，用户同意协议等动作按当前授权处理。
2. 复用身份、版本与平台相符的 VSIX；需要源码打包时检查依赖和 `vscode:prepublish`，不无条件禁用依赖收集。
3. 使用项目 CI 或当前 `ovsx publish --help` 支持的精确文件/registry 方式。凭据通过适用存储或 CI 注入，不写入命令正文、经验或聊天。
4. 读回目标 registry 的 namespace、扩展、版本、平台和可用产物，区分上传接受、扫描结果与可见状态。
5. 多市场单独报告结果；本平台缺失时仅恢复本目标，不重发已成功的另一市场。

## 成功标准

精确 registry/namespace/扩展/版本/平台满足发布目标，所需元数据与制品可核对。namespace 已创建或 token 配好不能作为扩展发布成功证据。

## 坑与恢复

扫描拒绝按当前返回定位，不默认关闭检查。没有明确官方与项目依据时不将 `id-token: write` 当作完成认证，也不假设复用 VS Code Marketplace 的身份或 Token。结果不确定时先查现有版本，再决定后续动作。

## 证据与边界

2026-10-15 核对 Open VSX 官方发布教程，未执行真实上传或账号操作。按[写回协议](../../../knowledge-schema.md)维护。
