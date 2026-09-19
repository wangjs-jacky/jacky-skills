---
site: pxb7
operation: neverness-to-everness-detail
title: 螃蟹异环账号详情读取
risk: low
last_verified: 2026-09-05
---

# 螃蟹异环账号详情读取

## 目标

读取一个异环主体商品的角色、装备、资源、价格、绑定与验号事实

## 前置条件与授权

- 仅在当前登录、权限和用户授权范围内执行。
- 对象不唯一、影响范围扩大或不可逆时停止并向用户确认。

## 入口

https://www.pxb7.com/product/<numeric-product-id>/1

## 已验证步骤

1. 在本轮命名 task space 复核 www.pxb7.com、页面标题中的异环、权限及验证状态
2. 从已验证列表取得数字 product ID，在同一 task space 打开详情；交叉核对 URL、主体编号和人民币价格
3. 以商品推荐标题为边界，只读取前面的主体文本和 ReportCharacter / ReportWeapon 卡片；展示编号单独保留，不能代替 URL 的数字 ID

## 检查点

- 页面身份必须为异环，出现登录墙、验证码、风控或用户接管即停止
- 来源价格与 ID 一致；角色和装备来自主体卡片或明确标题清单，缺失状态不猜测

## 成功标准

仅返回请求商品，价格、具名资产和来源齐全，展示编号与链接 ID 分开保存

## 失败模式与恢复

尚未记录经证实且可复现的失败模式；遇到结果不明时回到检查点，不更新验证日期。

## 验证证据

- 2026-09-05 ego-browser 实测：从当前列表进入详情，唯一商品身份、数值价格及主体具名资产通过校验；run-ego-operation --allow-exploration 返回 ok=true

- 2026-09-05 普通执行复验：未传 allow-exploration，操作知识解析为 verified_operation_available；完成双平台列表与详情、游戏估值和报告门禁，精确关闭本轮 task space。
