---
platform: github
operation: publish-release
status: documented
last_verified: null
---

# 发布 GitHub Release

## 目标

将指定源码版本及附件发布为要求的草稿、预发布或正式 Release。

## 前置条件与授权

读[平台档案](../index.md)，明确 repo、tag、源码提交、Release 状态及 latest 策略、标题/说明和精确附件列表。项目决定附件类型及架构，不把只上传 DMG 等项目习惯推广为平台规则。

## 流程与检查点

1. 核对现有远端 tag 指向的提交和已有 Release；产物与该版本对应，复用有效构建输出，避免通配符误选旧产物。
2. 已准备 tag 时使用 `--verify-tag`，不能让 CLI 从默认分支隐式建错 tag。确需新建时只创建/推送精确 tag，并确认它是否触发其他发布 workflow。
3. 按项目选择 CI 或 gh 执行发布，避免同目标双路径同时上传。Release notes 用文件传入。
4. 读回 tag、Release 状态、附件名称/大小及可用校验信息；需要下载能力时取得相称的访问证据。
5. 部分附件失败时记录已完成部分；先检查 immutable releases 与当前状态，再决定补传或其他恢复，不默认覆盖。

## 成功标准

tag 对应预期源码，Release 状态满足本次目标，指定附件完整并与目标版本相符。只做草稿时只声明草稿完成；要求正式可下载时草稿或上传接受不能作为最终成功。

## 坑与恢复

tag 错误、附件身份不明或已发布不可变版本时停止相关写入并说明具体差异，不能删 tag 重推当作通用修复。不能用“撤销 Release”推断包 registry 也会回滚。

## 证据与边界

2026-10-15 已核对 gh release create 官方规则；未创建 Release 或上传附件。按[写回协议](../../../knowledge-schema.md)维护实例与操作证据。
