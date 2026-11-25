---
id: model.whisper
title: Whisper / MLX-Whisper
summary: Apple Silicon 上的本地识别及时间轴字幕导出。
---

# Whisper

当前适配实现为 MLX-Whisper。支持 large-v3、large-v3-turbo、medium、small、base、tiny；支持列表不代表这些权重均已下载。准确率与耗时按素材和硬件判断，不能把用户偏好当作普遍性能结论。

- [transcribe：音视频转写](operations/transcribe.md)
- 最近实测：2026-11-25，缓存 large-v3 / turbo 的短中文 SRT，以及 turbo 的单条约16分钟中文教程 MD 离线转写通过；条件、专名误识别与结尾时间轴限制见 transcribe，不外推其他素材或平台媒体获取能力。
- 环境和部署按[生命周期操作](../../operations/index.md)；本机实例循 Skill 的私有索引。

解释器需可导入 mlx_whisper 和 Metal，预处理需 ffmpeg。本工具优先使用可读的本地快照，不为缓存版本检查联网。量化从真实权重配置核实，没有“传一个参数就变成 4-bit”的实现。

2026-11-26：约297秒教程旁白的turbo/SRT核对及静音幻觉边界见 transcribe。
