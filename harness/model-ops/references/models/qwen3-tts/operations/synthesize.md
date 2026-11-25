---
id: model.qwen3-tts.synthesize
title: 文稿合成与固定参考复用
status: partial
last_verified: null
---

# 合成

先确定 Base／CustomVoice 变体及当前可读权重。使用固定角色声音时由 Voice Material OPS 解析明确版本、参考音频、逐字稿与哈希；本库只接收引用和执行参数，不新建声音目录。

`bash scripts/run.sh qwen3-tts --help` 复用当前解释器的 MLX-Audio 原生生成器。Base 参考合成使用其 `--model`、`--text`、`--ref_audio`、`--ref_text`、`--lang_code`、`--output_path` 等实际支持参数；启动器拒绝只给参考音频却隐式转录参考文本。完整缓存优先传本地路径，避免不必要下载。

CustomVoice 使用当前模型支持的 `--voice`；表演参数按变体核对，不把另一模型的 speaker ID 或指令直接套用。先生成短样本，再处理长稿；是否分段与拼接按业务工具已有机制完成，不强制一种队列。

记录实际模型、参考版本、参数和产物，检查解码、核心文字及声线；用户认可范围按对应引擎条件记录。新模型试读不能自动获得原参考声音的全部认可。音频及完整文稿归原任务，映射和试听结果交 Voice Material OPS。

失败保留输入／片段，在原选择和授权内排障，不静默换声、改角色绑定或切云端。


使用完成后，声音库可用 record-engine-use 为原 voice/version 登记模型、部署、参考哈希和产物证据，初始保持 not_reviewed。实际反馈用 review-engine-use 只更新指定 use；不为跨模型登记创建新参考或覆盖原认可。具体命令从 Voice Material OPS 的 library-format 读取。

本地Base参考合成的技术路径已取得真实短中文文稿生成、解码和核心词句回转录证据；声线的完整主观验收与跨条件一致性尚未完成，顶层保持partial、不刷新完整成功日期。实际部署和证据从本机索引进入。
