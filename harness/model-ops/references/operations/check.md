---
id: model-ops.check
title: 检查当前可用性
status: documented
last_verified: null
---

# 检查当前可用性

依本机索引核对目标家族、部署实例与当前解释器；只检查与当前任务有关的环境。

分开报告：支持哪些型号、权重是否可读、依赖能否导入、实际执行环境能否访问、服务是否可连接、真实推理是否已验证。历史成功或端口打开不等于当前能完成请求。

Whisper 可用 `bash scripts/run.sh whisper --list-models` 与 `--doctor`；Qwen 可用 `bash scripts/run.sh qwen3-tts --doctor` 和原生 `--help`。这些检查不生成声音、不自动下载权重、不请求云端鉴权。

需要实际业务验证时按当前授权调用一次短样本。只读查询不刷新真实推理或用户试听成功日期；按证据修正实例与父索引。
