---
id: model.qwen3-tts
title: Qwen3-TTS
summary: 先区分 Base、CustomVoice 与 VoiceDesign，再选择对应生成方式。
---

# Qwen3-TTS

| 变体 | 用途与条件 |
| --- | --- |
| Base | 参考音频与对应文本条件下的语音合成；跨语言、跨模型声线保持需要试读 |
| CustomVoice | 使用该模型支持的内置 speaker 和可用表演指令；不能把内置 speaker 自动当作库内某声音 |
| VoiceDesign | 通过描述设计合成音色，生成的候选再交 Voice Material OPS 归档 |

型号／精度／量化与 MLX-Audio 版本归部署实例。当前复用原生工具，不把本库写成另一套 TTS SDK。

- [synthesize：文稿合成及参考声线复用](operations/synthesize.md)
- [design-voice：设计合成音色](operations/design-voice.md)
- 环境与模型安装按[生命周期操作](../../operations/index.md)。
- 参考：[Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)、[MLX-Audio](https://github.com/Blaizzy/mlx-audio)。实际参数以当前安装版本 `--help` 和运行证据为准。
