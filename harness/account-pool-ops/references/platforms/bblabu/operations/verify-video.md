---
platform: bblabu
operation: verify-video
status: verified
last_verified: 2026-11-26
---

# 视频 Key 安全保存与只读鉴权

目标：保存当前用户指定的视频 Key，并确认安全读回、状态接口与 Key 可见型号目录；不提交付费视频任务。

1. 先查平台脱敏条目。使用 `import-key` 隐藏输入或 stdin 导入；相同指纹去重，不同 Key 新增，保留旧项和原默认。
2. 从本机已验证的解释器在进程内调用 `Pool().get_secret()`，由账号池核对 Keychain 指纹，不打印 Key、不传给命令参数或日志。
3. 单次请求 `GET /v1/availability?category=video` 与 `GET /v1/models`，只向精确 HTTPS API 主机发送鉴权，拒绝跨域转发。
4. 前者返回平台完整目录和运行记录；后者核对该 Key 的目录。可见型号、平台状态和实际生成权限各自报告，200 不证明逐模型业务成功。
5. 将 HTTP 状态、时间、目录版本、数量及验证范围写入所选条目的 verification；方法及限流语义归 Model OPS，不在账号池复制另一份模型目录。

所有 Key／类别共用每账号 30 秒一次 availability 限流。429 保留 Retry-After 后结束，不换 Key 绕过，不创建周期探测。解释器或 Keychain 错误分别记录，不直接认定 Key 失效。

成功标准：安全存储可读回且指纹匹配；两项只读接口鉴权成功，视频目录有效；原默认与旧条目保留；明确未做视频生成。已存 Key 不构成持续付费或跨设备复制授权。

2026-11-26：当前 Mac mini 的新视频条目完成上述检查，两个接口均为 HTTP 200，ready=true、stale=false，型号集合一致。实际引用与证据由本机 experience.local.md 导航，不在共享文件中链接私有实例。
