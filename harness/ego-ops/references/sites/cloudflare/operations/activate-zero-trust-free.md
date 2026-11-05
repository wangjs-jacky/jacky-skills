---
site: cloudflare
operation: activate-zero-trust-free
title: 开通Zero Trust免费版
risk: high
last_verified: 2026-10-25
---

# 开通Zero Trust免费版

## 目标

在用户明确接受当前免费版及超额计费条款后开通Zero Trust，并确认订阅生效。

## 前置条件与授权

已登录目标账户，用户已授权开通免费版及页面显示的持续超额计费条件。普通部署授权不自动涵盖新计费条款；同范围明确授权已有记录时不重复询问。不升级付费套餐、不扩大到其他应用。

## 入口

Cloudflare控制台的Zero Trust开通流程，最终进入Activate Zero Trust Free结算页。

## 已验证步骤

1. 核对当前账户、套餐名称、当期费用、免费范围和持续计费文本，使用本次页面证据，不把历史价格当永久承诺。
2. 在用户已明确授权的范围内接受Terms of Service、Privacy Policy和超出免费额度的按月扣费条件。
3. 单次点击Activate Zero Trust Free，等待Authorizing结束；结果不明时先观察，不能重复提交。
4. 确认Purchase complete及subscription is active，再选择Continue to Zero Trust。
5. 在Cloudflare One概览核对实际Plan及Team name；沿用实际团队身份，不因名称自动生成而重建组织。

## 检查点

勾选必须对应用户授权的当前条款；点击完成不等于订阅已生效。支付确认页和One概览是两项不同证据，后续应用保护需独立配置和验证。

## 成功标准

确认页显示订阅已生效，概览显示Zero Trust Free及实际团队名，已上报确认页验证帧。此成功不代表Access应用已建立或业务已完成登录验收。

## 失败模式与恢复

本次没有已验证的支付失败根因或恢复方法。任务空间失效与用户接管属于浏览器控制权边界，按ego-browser规则处理，不记成Cloudflare站点缺陷。

## 验证证据

2026-10-25：用户接受免费版和超额计费条款后，在原任务空间提交一次；确认页显示Purchase complete、subscription is active，概览显示Zero Trust Free，隔离验证帧已上报。实际账户、团队和回执仅保存在本机目标档案。
