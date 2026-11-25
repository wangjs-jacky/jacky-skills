---
id: model.doubao-asr
title: 可选豆包云端识别
summary: 保留原有识别适配，只有明确选择云端时进入。
---

# 豆包云端识别

这是已有 `volc.seedasr.auc` 录音文件识别适配的保留，不属于本地部署。音频会上传；本地失败与已有密钥都不自动授权调用。

```bash
bash scripts/run.sh doubao audio.m4a -f md --dry-run
```

实际调用去掉 dry-run 前，按 `account-pool-ops` 确认可用的授权条目，仅在业务进程内存／环境注入 `DOUBAO_APP_ID`、`DOUBAO_ACCESS_TOKEN`。本工具不读取旧明文配置、不提供另一个设置向导，也不自动轮换账号。

原服务使用提交后查询结果的协议。迁移只保留执行能力；费用、服务开通与当前限制仍按[官方文档](https://www.volcengine.com/docs/6561)和实际账号核对。结构和模拟检查不宣称云端业务通过，失败不回退其他引擎。
