---
site: douyin
operation: extract-public-video-source
title: 提取公开视频真实媒体来源
risk: low
last_verified: 2026-10-02
---

# 提取公开视频真实媒体来源

## 目标

提取公开抖音视频的实际可播放媒体地址与来源元数据并完成身份复核

## 前置条件与授权

仅在本次明确授权范围内执行；对象不唯一、影响范围扩大或不可逆时停止并确认。

## 入口

打开抖音公开视频详情页 /video/{videoId}

## 已验证步骤

1. 在 www.douyin.com 的公开视频详情页打开目标 URL，并检查页面 URL 的 /video/{videoId} 与任务目标一致。
2. 等待页面完成 hydration，读取页面标题、meta description 中作者、video.currentSrc 和可选 poster 或 og:image。
3. 将 sourceUrl、实际 HTTPS mediaUrl、title、author、canonicalUrl、videoId 写入指定 attempt 的 source.json。
4. 回读 source.json，重新核验页面 URL、videoId 和媒体地址仍然匹配，再结束浏览器任务空间。

## 检查点

- 页面标题与目标视频内容一致，当前地址仍是目标 /video/{videoId}。
- video.currentSrc 是实际 HTTPS 可播放地址；网页 URL 不作为 mediaUrl。
- source.json 写入成功且回读字段完整。

## 成功标准

页面身份、元数据、可播放媒体地址和 source.json 回读均通过核验。

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；结果不明时回到检查点，不更新验证日期。

## 验证证据

- 2026-10-02：页面标题、描述、video.currentSrc、目标 URL、source.json 回读和 session-bound browser screenshot。
