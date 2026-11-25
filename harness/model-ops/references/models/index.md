---
id: model-ops.models
title: 模型清单
summary: 先按能力找到家族，再读对应操作与本机部署。
---

# 模型清单

| ID／家族 | 能力及何时读取 | 下一层 |
| --- | --- | --- |
| model.whisper | 已有音视频转文字／字幕，或检查 MLX-Whisper 环境与缓存 | [Whisper](whisper/index.md) |
| model.qwen3-tts | 文字合成语音、参考声音复用、按描述设计声音 | [Qwen3-TTS](qwen3-tts/index.md) |
| model.breezetts2 | 复用现有 BreezeCast 或播客语音服务 | [BreezeTTS2](breezetts2/index.md) |
| model.doubao-asr | 用户明确选择现有豆包云端转写，需要上传音频 | [可选云端适配](doubao-asr/index.md) |
| model.suno | 文本生成音乐／纯器乐，或复用已验证的 Suno 供应商路由 | [Suno 云端音乐](suno/index.md) |
| model.seedance | BBLABU Seedance 2.0／2.5 视频路由；先核对逐型号素材与计费条件 | [Seedance](seedance/index.md) |
| model.minimax-h3 | BBLABU MiniMax H3 视频路由 | [MiniMax H3](minimax-h3/index.md) |
| model.grok-imagine | BBLABU Grok Imagine 视频路由 | [Grok Imagine](grok-imagine/index.md) |
| model.gemini-omni | BBLABU Gemini Omni 及其目录归入 gemini 系列的 omni 路由 | [Gemini Omni](gemini-omni/index.md) |
| model.wan | BBLABU Wan 视频路由 | [Wan](wan/index.md) |
| model.muse | BBLABU Muse 视频及其目录归入 video 类的 podcast 路由 | [Muse](muse/index.md) |
| model.vidu | BBLABU Vidu 视频路由 | [Vidu](vidu/index.md) |
| model.tripo3d | BBLABU Tripo3D 文字／单图／多视图生成三维网格，能力逐型号核对 | [Tripo3D](tripo3d/index.md) |
| model.trellis | BBLABU TRELLIS 单图生成三维网格 | [TRELLIS](trellis/index.md) |

缓存、依赖、后台服务状态和实际业务成功分别核对。这里只声明已有接入范围，不证明当前机器已运行所有服务。

上述视频家族共用供应商检查与生成 operation，供应商不是新的模型家族。2026-11-26 已验证 BBLABU 视频目录与选定 Key 的只读鉴权；视频生成、下载与成片质量尚未验证。目录名称是供应商声明，不独立证明上游底层型号身份。

2026-11-26 新增 Tripo3D／TRELLIS 的云端 3D 接入，5 个型号的状态与 Key 可见目录已只读验证，真实网格生成与下载未执行；不表示本机已安装权重。
