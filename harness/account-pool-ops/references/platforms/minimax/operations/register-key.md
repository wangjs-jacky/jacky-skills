---
platform: minimax
operation: register-key
status: verified
last_verified: 2026-11-16
---

# 安全入库

## 目标与前置

用户明确提供平台API密钥并要求保管，只保存到当前设备，不扩大为跨机同步。

## 执行

1. 查脱敏条目，通过隐藏交互或进程stdin导入，不把Key拼进命令或文件。
2. 运行scripts/account_pool.py import-key --platform minimax。首次primary，后续不同Key新增，相同指纹读回核对后不重复保存。
3. Security.framework写入Keychain，注册表仅存引用/指纹/时间；目录0700、文件0600并原子保存。
4. 在进程内读回并比对指纹，只报告条目名与保存结果。

## 成功标准

安全项可读回且指纹一致，注册表与输出不含Key，旧项未覆盖。仅有元数据不证明密钥已保存。

## 坑与恢复

Keychain不可用时报告OSStatus，禁止明文回退。安全项已写入而注册表失败时保留安全项并报告引用，核对后恢复元数据，不盲目覆盖或删除。

## 证据

2026-11-16真实Keychain随机测试项写入/读回/仅自身清理通过；用户条目已保存并在内存中取回用于只读鉴权。9项测试覆盖别名、元数据保密、多Key默认保留、去重、禁止覆盖、显式切默认、禁用不回退、篡改引用与失败不虚报。
