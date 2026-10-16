---
site: cloudflare
operation: cancel-workers-renewal
title: 取消Workers下期续费并保留本期权限
risk: high
last_verified: 2026-10-02
---

## 目标

停止已开通Workers Paid的下一账期续费，保留本期服务至账单列出的结束日期。

## 前置条件与授权

用户明确授权取消Workers下一期续费。已登录正确账户，核对Workers Paid的Active状态、续费日期和目标产品；不改动其他产品或付款方式。

## 入口

账户Manage Account → Billing → Subscriptions。先确认Subscribed列表里Workers Paid对应的行。

## 已验证步骤

1. 打开Workers Paid所在行的Row actions，选Cancel；不要使用其他产品的菜单。
2. 读取Cancel对话框里的保留本期权限与结束日期说明。取消原因按用户实际意图选择，单账期使用可选临时需要更多功能。
3. 勾选本期结束前仍可使用的确认框，点击Confirm。
4. 等待结果并读回Workers Paid对应行，状态应变为Ending；重新加载同页后再次核对状态与结束日期。

## 检查点

确认框明确写明取消后保留权限至本期结束。日期必须来自当前页面，不能按自然月或历史记录推断。等待超时应先读回，不应盲目再次点击Confirm。

## 成功标准

Workers Paid由Active变为Ending，且整页重新加载后仍显示Ending和同一本期结束日期。其他订阅不变；不把取消续费说成取消已经产生的用量费。

## 失败模式与恢复

确认后的等待曾超时，但随后读回已为Ending；因此等待超时不能当作取消失败，也不能直接重复提交。如果页面显示权限会立即失效，停止执行并重新核对用户授权范围。

## 验证证据

2026-10-02通过Ego在订阅列表实时确认Active、续费日期，Cancel确认保留本期权限；执行后重新加载证明Ending与结束日期保留，绑定截图与回执已归档。不保存账户动态ID、个人资料或付款数据。
