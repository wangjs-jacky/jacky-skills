---
site: cloudflare
operation: audit-active-zone-dns-export
title: 核验 Active Zone 并导出 DNS
risk: low
last_verified: 2026-09-07
---

# 核验 Active Zone 并导出 DNS

## 目标

确认已委派域名的 Zone、套餐、DNS 记录和 Universal SSL 状态，并导出 BIND 区文件

## 前置条件与授权

- 仅在当前登录、权限和用户授权范围内执行。
- 对象不唯一、影响范围扩大或不可逆时停止并向用户确认。

## 入口

https://dash.cloudflare.com/

## 已验证步骤

1. 从账户首页进入唯一目标域名并确认 Zone 已受 Cloudflare 保护、套餐与 DNS Setup 状态
2. 进入 DNS Records，逐条核对名称、类型、内容、代理状态和 TTL
3. 使用 Export 对话框下载 BIND zone file，并从下载完成事件确认文件落地
4. 进入 SSL/TLS Edge Certificates，确认覆盖根域与通配符的 Universal 证书为 Active

## 检查点

- 目标域名不唯一、Zone 非 Active、记录与外部权威查询不一致或页面要求更改配置时停止

## 成功标准

控制台显示 Zone Active/受保护、DNS 记录可枚举、区文件下载完成且 Universal SSL Active

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；遇到结果不明时回到检查点，不更新验证日期。

## 验证证据

- 域名 Overview 的受保护状态、DNS Records 表格、下载完成事件、Edge Certificates Active 行
