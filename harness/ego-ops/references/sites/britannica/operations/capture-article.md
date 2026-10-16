---
site: britannica
operation: capture-article
title: 采集公开文章正文
risk: low
last_verified: 2026-10-02
---

# 采集公开文章正文

## 目标

在公开 Britannica 文章页面核验来源并保存可验证正文段落

## 前置条件与授权

仅在本次明确授权范围内执行；对象不唯一、影响范围扩大或不可逆时停止并确认。

## 入口

打开公开的 HTTPS Britannica 文章 URL；以当前页面的文章地址和可见 main 或 article 主体作为入口。

## 已验证步骤

1. 导航到用户提供的 HTTPS Britannica 文章 URL，并等待页面完成 DOM 加载。
2. 复核当前地址使用 HTTPS、主机属于 britannica.com 且路径仍对应用户提供的文章；确认可见 main 或 article 主体包含足量正文。
3. 读取可见文章主体中的标题、段落和列表文本，排除导航、页脚、侧栏、表单和隐藏内容，并保存到当前 attempt 的 source-article.json。
4. 读回 source-article.json，复核 sourceUrl、canonicalUrl、contentKind 和正文块均与当前页面一致。

## 检查点

- 导航或页面加载后重新读取当前 URL 和主体语义，不依据过期页面状态继续。
- 保存后复核文件存在且正文块非空，同时确认页面 URL 未改变。

## 成功标准

页面身份和文章主体均通过复核，source-article.json 成功保存并可由固定 article 流程读取。

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；结果不明时回到检查点，不更新验证日期。

## 验证证据

- 2026-10-02：当前 Britannica 人工智能文章页面的可见 main/article 主体、源文件读回结果和受会话绑定的浏览器截图证据。
