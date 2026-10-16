---
site: cloudflare
operation: publish-http-tunnel-route
title: 配置并核验 HTTP 应用隧道入口
risk: high
last_verified: 2026-10-15
---

# 配置并核验 HTTP 应用隧道入口

## 目标

为已授权本地服务建立独立隧道和代理 DNS，并在控制台核验

## 前置条件与授权

仅在本次明确授权范围内执行；对象不唯一、影响范围扩大或不可逆时停止并确认。

## 入口

Cloudflare 控制台目标域名的 DNS Records 页面。

## 已验证步骤

1. 先核对目标账户、域名、已有 DNS 记录与隧道；只创建本次获准的独立入口。
2. 通过当前已登录页面的同源 API 创建远程管理隧道，写入指定 HTTP 源站和 404 兜底路由；返回的 connector 凭据仅写受限本机文件，不输出。
3. 源站 connector 上线后读回隧道状态和 ingress，再创建代理 CNAME 并读回目标。
4. 重新加载 DNS Records，在 Search 搜索目标子域名，核验对应记录的编辑控件与页面。

## 检查点

- 隧道配置须按对象结构比较，不用 JSON 键顺序比较。目标 DNS 已存在时不得覆盖。
- Search 会增加 search 与 page 查询参数；截图应核对本次操作明确产生的精确 URL 与原 target，而不是直接采信当前任意页面。

## 成功标准

独立隧道 healthy，ingress 与指定源站一致，代理 CNAME 读回正确，DNS 页面存在该记录；公网业务验收另归 Cloudflare OPS。

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；结果不明时回到检查点，不更新验证日期。

## 验证证据

- 2026-10-15：另一个具有应用认证的HTTP服务重复执行成功；独立Tunnel healthy、指定ingress与代理CNAME均实读一致，DNS精确搜索页面及会话绑定截图已验证。未修改原有路由，真实应用验收归Cloudflare OPS。

- 2026-10-14 UTC：同源 API 创建与读回、DNS 搜索结果控件和会话绑定截图均已核验；未修改其他隧道。
