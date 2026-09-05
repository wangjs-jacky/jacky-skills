---
site: pxb7
operation: zzz-list
title: 螃蟹绝区零账号列表读取
risk: low
last_verified: 2026-09-05
---

# 螃蟹绝区零账号列表读取

## 目标

低频读取绝区零公开列表，保留唯一商品 ID、人民币价格、标题与来源

## 前置条件与授权

- 仅在当前登录、权限和用户授权范围内执行。
- 对象不唯一、影响范围扩大或不可逆时停止并向用户确认。

## 入口

https://www.pxb7.com/buy/10312/1

## 已验证步骤

1. 在本轮命名 task space 复核 www.pxb7.com、页面标题中的绝区零、权限及验证状态
2. 以当前页上下文读取 selectSearchPageList，gameId 为 10312，query 为 绝区零；单页不超过 20 条，最多 3 页，价格范围通过 price 筛选传入
3. 按 productId 去重；接口价格单位为分，转换成人民币元；保留 showTitle 与商品 URL

## 检查点

- 页面身份必须为绝区零，出现登录墙、验证码、风控或用户接管即停止
- 每条商品必须有唯一数字 ID、数值价格和同站详情 URL

## 成功标准

返回至少一条当前可读的结构化列表记录，详情链接和价格可复核

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；遇到结果不明时回到检查点，不更新验证日期。

## 验证证据

- 2026-09-05 ego-browser 实测：返回 3 条唯一列表记录，列表到详情价格与 ID 一致；run-ego-operation --allow-exploration 返回 ok=true

- 2026-09-05 普通执行复验：未传 allow-exploration，操作知识解析为 verified_operation_available；完成双平台列表与详情、游戏估值和报告门禁，精确关闭本轮 task space。
