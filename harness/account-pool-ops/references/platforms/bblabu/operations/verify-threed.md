---
platform: bblabu
operation: verify-threed
status: verified
last_verified: 2026-11-26
---

# 3D Key 安全保存与只读鉴权

目标：保存用户指定 3D Key，确认安全读回与目录鉴权，不提交付费三维生成。

1. 先查平台脱敏元数据，以隐藏输入或 stdin 导入；相同指纹去重，不同 Key 新增，保留旧条目与原默认。
2. 请求进程经 `Pool().get_secret()` 读取选定条目并核对 Keychain 指纹，不输出、不放命令参数或配置文件。
3. 对精确 HTTPS API 主机单次请求 `GET /v1/availability?category=threed` 和 `GET /v1/models`；不转发 Bearer 至跨域跳转。
4. 分别记录 HTTP、时间、ready／stale、catalog_version 及型号集合。可见型号和平台状态不证明实际生成成功；完整模型能力与调用方法归 Model OPS。
5. 在该条目的 verification 保存限定验证范围并同步本机索引，不保存另一份模型／价格目录。账号所有 Key 和类别共用每 30 秒一次 availability 限流，不轮询、不切换 Key 绕限流。

成功标准：Keychain 可读回且指纹一致，两项鉴权均成功且目录有效，原有条目与默认保留；明确未执行生成。保存不扩大到持续付费或跨设备复制。

2026-11-26：当前 Mac mini 新 3D 条目满足上述条件，两个接口均为 200，ready=true、stale=false，5 个型号集合一致。实例由本机 experience.local.md 导航，不在共享文件中链接私有记录。
