---
site: github
operation: verify-release-summary
title: 核验发布流程的最终摘要与源码版本
risk: low
last_verified: 2026-10-19
---

# 核验发布流程的最终摘要与源码版本

## 目标

只读核对已完成部署的摘要commit、origin与实际执行步骤，不重跑工作流或触发发布。

## 前置条件与授权

已知本次目标源码提交与其精确run URL；CI／API已读回实际发布job及关键步骤成功。拥有发布授权不等于可以操作其他run或绕过兼容检查。

## 入口

GitHub Actions中明确的run URL与Summary页面；只在本任务记录的数字任务空间、精确target和预期URL中操作。

## 已验证步骤

1. 打开明确run后核对标题、Status和源码提交，不从“最新run”猜测目标。
2. 在部署job的摘要中查找发布结果表，读取Commit与Origin并对照本次授权目标；摘要不存在时不能用整体Success替代。
3. 将摘要与CLI读回的实际上传、校验、激活、live verify步骤结果相互对应；skipped发布与成功发布分别报告。
4. 使用会话绑定截图助手捕获最终验证页面并上报，维护经验后再独立结束任务空间。

## 检查点

每轮核对空间归属、精确target及显式预期URL；读取实际摘要字段，不点击Re-run all jobs等写操作。发布摘要不能替代线上HTML／资源或真实设备验证。

## 成功标准

目标run和部署job成功，摘要Commit／Origin与预期一致，最终页面截图上报成功；已覆盖和未覆盖的线上／设备检查明确分开。

## 失败模式与恢复

本次没有验证可复用的站点失败与恢复路径。空间失效、用户接管、对象不唯一或URL改变时停止，不换空间猜测目标。

## 验证证据

2026-10-17：实际Actions Summary显示部署成功，发布结果表的完整commit与目标origin读回一致，并与CLI关键步骤结果交叉核对；会话绑定截图上报成功。仅覆盖发布摘要，只读未重跑任务，也不据此声称手机已更新。

2026-10-19：同一授权合并的正式Web与production OTA流水线均成功，CLI读回关键发布步骤实际执行。真实Actions页面分别读回Web的完整Commit/Origin与OTA的Update ID/channel/runtime/源码；两帧均经空间和会话绑定验证并报告。额外HTTP核对正式首页/设置revision、入口1CSS/3JS最终响应及实际批注标识；OTA的latest与不可变manifest、源码和主包SHA-256对应。此处只共享只读核验方法，具体运行/地址/版本归目标档案；未据此声明生产聊天E2E或手机实际加载。
