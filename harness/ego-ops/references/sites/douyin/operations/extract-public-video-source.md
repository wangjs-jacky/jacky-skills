---
site: douyin
operation: extract-public-video-source
title: 提取公开视频真实媒体来源
risk: low
last_verified: 2026-10-19
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
2. 等待页面完成 hydration，读取页面标题、meta description 中作者、video.currentSrc 和可选 poster 或 og:image。若 currentSrc 为 blob，不将其作为下载地址。先核对当前活动播放器与视频身份，再检查当前页实际加载的媒体资源；只有音轨与视频轨候选均唯一、来源关系明确时才保存分轨地址。存在多个候选时先甄别，不按列表首项猜测。
3. 按任务需要通过 page.fetch(mediaUrl, { saveAs }) 下载公开视频；记录 sourceUrl、title、author、videoId、时长和媒体文件名。播放地址若带签名，仅在本次提取中使用，不写入长期记录。
4. 回读元数据并检查媒体文件，重新核验页面 URL、视频身份与可播放媒体相匹配；整个浏览器目标完成后再结束任务空间。

## 检查点

- 页面标题与目标视频内容一致，当前地址仍是目标 /video/{videoId}。
- 已取得实际 HTTPS 媒体地址；它可以来自 currentSrc，也可以来自已核验播放器实际加载的唯一媒体资源。blob 和网页 URL 不作为 mediaUrl。分轨音频保存为 audioUrl 与 mediaUrl，匹配视频保存为 videoUrl。
- source.json 写入成功且回读字段完整；需要文件时，下载响应成功且本地媒体可解析。

## 成功标准

页面身份、元数据、可播放媒体地址和 source.json 回读均通过核验。

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；结果不明时回到检查点，不更新验证日期。

## 验证证据

- 2026-10-02：页面标题、描述、video.currentSrc、目标 URL、source.json 回读和 session-bound browser screenshot。
- 2026-10-19：在详情页等待完成加载后成功核验作者、标题与来源，通过 page.fetch 下载实际视频，HTTP 200；本地 ffprobe 解析成功，关键浏览器画面已通过会话绑定校验。

- 2026-10-19补充：另一次详情页使用blob/MSE，已核对唯一活动播放器、作者、标题、时长及唯一音视频资源后保存分轨来源；后续固定执行器真实下载、合并、提音成功。浏览器仅证明来源，下载与转录由独立运行证据证明；原空间消失后已停止浏览器，未宣称新最终截图。签名地址只用于私有操作输入，未写入本站点知识。
