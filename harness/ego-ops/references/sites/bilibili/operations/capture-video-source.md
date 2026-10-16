---
site: bilibili
operation: capture-video-source
title: 采集 Bilibili 视频源
risk: medium
last_verified: 2026-10-01
---

# 采集 Bilibili 视频源

## 目标

在已验证的视频页面暂停自动播放并提取身份匹配的源信息

## 前置条件与授权

仅在本次明确授权范围内执行；对象不唯一、影响范围扩大或不可逆时停止并确认。

## 入口

通过 HTTPS 视频页路径 /video/{BVID} 进入目标视频

## 已验证步骤

1. 使用页面 URL 和视频页状态核对同一 BVID
2. 暂停页面内所有 HTMLVideoElement 并关闭 autoplay
3. 调用固定 source 与 captions helper 保存身份匹配的收据

## 检查点

- source.json 已保存且页面仍匹配原 BVID

## 成功标准

source.json 与字幕探测收据存在，页面身份复核通过

## 失败模式与恢复

来源及完整字幕已落盘后，证据接口调用异常不等于来源丢失；2026-10-02 实际任务重新获取同一拥有空间及标签页、核对原来源后完成证据捕获与上传。新 Node.js 回合不能把未初始化的 page.targetId 当作实际目标变化；先从 task.tabs() 读取已记录标签对应的 targetId，再比对预先记录的目标。只有来源身份与所有权仍能独立复核时才能有界恢复；真实归属或来源变化仍停止。

## 验证证据

- 页面仍停留在已核验视频，且 source.json 写入成功
- 2026-10-02：两条公开视频真实完成，来源字幕文件与上传 completed 回执一致；其中一条证据异常恢复后完成，Studio 整页刷新后字幕和观点仍可读。只证明本次有限样本，不能外推全站成功率。
