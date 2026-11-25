---
id: model.qwen3-tts.design-voice
title: 设计合成声音候选
status: documented
last_verified: null
---

# 设计声音

先让 Voice Material OPS 检索已有声音与作品绑定；任务确实需要新设计时，选择 VoiceDesign 变体。用户的角色事实和用于生成的音色描述分开记录。

核对本机 MLX-Audio 支持的 `--instruct` 和生成参数，以代表性的实际台词生成候选。固定已有角色不因换工具自动重设计。生成不等于用户试听认可。

模型版本、描述与运行条件归本库；参考 WAV、对应文字、哈希、候选版本和来源按 Voice Material OPS 唯一目录保存。仅当参考改变才追加声音版本，显式绑定后再用于正式任务。不能只留提示词或软件内部 ID 作为恢复资料。
