---
name: model-ops
description: 模型与推理服务的部署、检查、调用、升级及排障经验库。按模型家族渐进读取，覆盖 Whisper、Qwen3-TTS、BreezeTTS2，以及已登记的 Suno 音乐、云端视频和 Tripo3D／TRELLIS 三维生成 API；声音素材与角色版本沿用 Voice Material OPS。
---

# Model OPS

按**模型家族 → operation**管理调用与运行经验。具体型号、量化版本、执行框架和机器是条件或部署实例；语音识别、合成、音色设计是查找能力，不建立交叉副本。[已确认分类](references/ops-model.md)。

安装／配置本 Skill 的 Agent 先读[安装与可选全局前置](references/global-agents-prompt.md)，按已有授权处理；普通使用直接进入任务。

## 从目标进入

1. 有 `experience.local.md` 时先读其小型本机索引，再从[模型清单](references/models/index.md)进入本次家族与操作。当前请求优先于个人已保存偏好，临时覆盖不改变长期选择。
2. 部署、检查、排障或升级读[生命周期操作](references/operations/index.md)的命中项；推理读家族的转写／语音合成／音乐／视频／3D 生成操作。没有当前部署时按官方工具和真实环境探索，不能把文件存在当成可调用。
3. 执行前复核本次解释器、权重／版本、输入与支持参数。使用对应原生 CLI、SDK、已有服务或本库的轻量适配器，不要求所有模型常驻或实现相同接口。
4. 生成涉及固定声音时，先让 `voice-material-ops` 从唯一库解析声音 ID、版本、参考音频、逐字稿与哈希，再交给所选模型。声音、角色与认可记录仍只归该库；普通 ASR 无需选声。
5. 核对真实产物与用户入口，按操作说明检查内容和质量；交付原任务所需文件。技术成功、内容抽查、用户试听认可分别报告。
6. 完成、失败或中断均执行[自动写回](references/knowledge-schema.md)：修正可复用方法和本机实例，保留原验证条件／日期，同步索引并读回；完整文稿和成品归原任务。

## 已有执行工具

从本 Skill 实际目录运行；从其他 cwd 调用时用已解析的绝对路径。

```bash
bash scripts/run.sh whisper --list-models
bash scripts/run.sh whisper --doctor
bash scripts/run.sh whisper audio.m4a -m large-v3 -f md --dry-run
bash scripts/run.sh whisper audio.m4a -m large-v3 -f md
bash scripts/run.sh qwen3-tts --help
```

启动器按 `MODEL_OPS_PYTHON` → 本库 `local/runtime.json` 中的家族解释器 → 当前 Python 选择环境。仅查询不加载权重；可读缓存直接使用本地路径。转写的模型与格式明确传入，不运行场景问答或暗填默认值。

Qwen3-TTS 复用 MLX-Audio 原生参数；先按[Qwen3-TTS 操作](references/models/qwen3-tts/index.md)选择 Base／CustomVoice／VoiceDesign。现有 BreezeCast／播客服务沿[原运行入口](references/models/breezetts2/index.md)使用。

云端转写是[单独的可选适配](references/models/doubao-asr/index.md)，需要本次明确选择；本地失败不触发上传、切换账号或更换引擎。平台密钥按 `account-pool-ops` 取用，不保存在本库。

云端音乐从 [Suno 家族](references/models/suno/index.md)进入，按本次授权核对供应商路由、参数和费用；已保存的 Key 与单次成功不构成持续付费授权。调用记录和已验证限制归本库，密钥保管及鉴权记录归 Account Pool OPS，音频成品留在原任务。

云端视频按[模型清单](references/models/index.md)进入 Seedance、MiniMax H3、Grok Imagine、Gemini Omni、Wan、Muse 或 Vidu 家族。BBLABU 路径先读[目录与状态检查](references/operations/check-bblabu-video.md)，实际生成再读[视频提交与结果保存](references/operations/generate-bblabu-video.md)。具体账号池引用从本机索引解析；状态目录、Key 可见型号和真实生成分别验证，不把登记解释为逐模型生成成功。

云端 3D 从 [Tripo3D](references/models/tripo3d/index.md) 或 [TRELLIS](references/models/trellis/index.md) 进入，先读[3D 目录与鉴权](references/operations/check-bblabu-threed.md)，生成再读[三维网格生成与下载](references/operations/generate-bblabu-threed.md)。凭据与本机接入配置从本机索引解析，不把目录、状态或 Key 保存成功当作已生成三维模型。

## 扩展与范围

已确认标准内的新模型、同类操作和真实经验按实际任务补充；更改分类轴、拆并既有归属或扩大新媒体职责时再确认。模型迁移与经验维护不自动授权停止无关服务、改默认声音、下载其他大模型、提交或发布。

本库接替原独立转写 Skill 的有效工具与经验；调用方直接进入 Model OPS，模型缓存、声音库与业务成品保留。
