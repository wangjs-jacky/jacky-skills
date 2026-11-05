---
site: cloudflare
operation: create-private-r2-bucket
title: 创建独立私有R2存储桶
risk: medium
last_verified: 2026-10-25
---

## 目标

为已授权应用创建独立R2桶，并确认公开访问禁用。

## 前置条件与授权

用户已授权独立应用云端资源；账户已启用R2。本操作不包含首次订阅付款、升级、开启公开访问或改动已有桶。

## 入口

Cloudflare控制台 → Storage & databases → R2 Object Storage → Overview。

## 已验证步骤

1. 核对目标账户与已有桶列表，确认拟建名称未被占用。
2. 选择Create bucket，在Bucket name填写应用专属名称，按需求核对Location与Default Storage Class。本次使用Automatic及Standard。
3. 创建后等待对象页实际出现目标桶名与Objects/Settings页签。URL改变时旧表单可能仍在渲染，不能只凭URL当作完成。
4. 核对对象页Public Access为Disabled、Default Storage Class为Standard，以及空桶就绪提示；在已验证状态上报隔离截图。

## 检查点

桶名不可变；不覆盖既有名称，不点击公开访问开关。CLI的R2权限不足不等于控制台无权限；使用当前已验证控制台身份完成范围内操作，不为此扩大所有CLI权限。

## 成功标准

新桶对象页显示正确名称、Standard、Public Access Disabled；已有桶保持原状。应用通过binding读写仍需独立运行验收。

## 失败模式与恢复

创建后的SPA可在URL已变时保留旧表单；等待目标对象页内容出现再截取成功帧。本次没有桶创建失败。

## 验证证据

2026-10-25在既有R2账户中创建应用专属空桶，控制台明确显示公开访问禁用，已上报验证帧；随后Worker的R2条件写入成功。账户、桶名和帧路径只归本机项目档案。
