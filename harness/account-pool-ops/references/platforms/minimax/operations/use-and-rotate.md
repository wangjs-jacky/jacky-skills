---
platform: minimax
operation: use-and-rotate
status: documented
last_verified: null
---

# 取用与轮换

## 目标与前置

在已授权的业务进程内取用指定Key，或在用户明确要求时切换默认。真实平台业务轮换、撤销与删除未执行。

## 方法

- 从Skill路径定位模块，通过Pool().get_secret('minimax', entry)内存读取，不打印；业务端点沿条目中已验证的区域。
- 新Key先新增与验证，旧项保留；只有明确要求才运行set-default --platform minimax --entry 已有名称。
- 不自动尝试其他Key，不把额度不足解释为可绕过的失败；收费任务次数和规格仍由业务任务授权。
- 删除Keychain原件或平台侧撤销需明确对象与授权，当前CLI没有真实条目删除入口。

## 成功标准与边界

取用与业务目的一致，默认项可读回，旧材料不丢失。现有测试验证元数据切换保护；2026-11-16已在明确授权内实际取用已存Key，完成一次H3生成，具体证据归verify-model。真实平台轮换、撤销及删除仍未执行，本operation不升级为全范围verified。
