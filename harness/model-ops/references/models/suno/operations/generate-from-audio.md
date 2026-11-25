---
id: model.suno.generate-from-audio
title: 使用真实音轨作为生成参考
status: verified
last_verified: 2026-11-26
---

# 音频参考生成

目标：让用户提供的真实音轨进入音乐生成请求，取得相关风格的重编或变体。当前供应商条件为 BBLABU 的 `suno-cover-audio`。它是翻唱／重编接口，不能保证完全换旋律而只借用风格；结果听感另行验收。

用户要求新旋律、以即兴创作为主时，选择[文字生成新作](generate-instrumental.md)。Cover保留原曲旋律符合其翻奏用途，不能靠提示词要求“fresh phrases”、降低参考权重或修改曲目标题就声称完成了重新作曲。编码字节、波形或解码哈希不同，也不能证明旋律不同。已有一次任务中，用户先评价音色方向“好听”，随后明确指出旋律听起来相同；这两项反馈必须分别保留。

## 选择接口

先按现有供应商文档检查音频输入。`su2-suno-v6-mini` 的简易文字接口没有参考音频字段；`suno-cover-audio` 支持 `upload_url` 和 `audioWeight`。不要把简单文字路由的参数边界理解成整个音乐模型家族不支持音频参考，也不要求先向另一家通用理解模型上传素材。

## 输入来源与凭据

1. 从用户授权的作品取得真实音轨，核对来源、时长、可解码性和完整哈希。网页地址、画面、标题及文字提示均不能代替音频输入。
2. 此接口要求公网可直接下载的 HTTPS 音频地址。使用符合当前任务范围的短期文件地址；完整下载并比对原音轨哈希，不能只确认链接返回 200 或文件名相同。
3. 可重放的临时签名下载地址只在生成请求内存中使用；请求留档替换为占位符，记录原音轨哈希、字节数与有效期。结果和素材仍归原任务。
4. Key 从 Account Pool OPS 的本次指定条目读入内存，只发给核验过的供应商 API 主机；文件托管、音轨下载或跨域跳转均不携带该 Bearer。

## 已核对的调用契约

`POST https://api.bblabu.ai/v1/music`，JSON 示例：

```json
{
  "model": "suno-cover-audio",
  "upload_url": "https://temporary-audio-host.example/reference.mp3",
  "prompt": "Use the supplied recording as the primary reference for guitar tone, articulation, groove and effects. Create a related instrumental variation with fresh melodic phrases.",
  "instrumental": true,
  "n": 1,
  "audioWeight": 0.6,
  "styleWeight": 0.7,
  "version": "v6-mini"
}
```

`audioWeight`／`styleWeight` 范围均为 0–1；`n` 只能是 1；version 可用值按当前文档核对。示例权重是一次试样条件，不作为长期默认值。`source_task_id` 是另一种引用本站既有生成结果的方式，不能用来代替外部用户作品的真实音轨。

继续生成已喜欢曲目的变体时，可用同账号上次结果的 `extra.job_id` 作为 `source_task_id`，并用 `source_track` 选择从0开始的曲目；不传 `upload_url`。此时复用平台已有生成音频，无需重新托管文件。不要把本站返回的外层 `task_...` 创建任务号当成上游 `extra.job_id`。原音轨来源、用户认可范围与每轮结果仍需保持可追溯。此已有结果复用路径也已完成创建、下载、解码与试听附件交付验证。

调用前核对路由单价与当前状态；目录可见不代表调用一定成功，degraded 表示运行波动。创建成功后保留任务号，仅查询该任务终态，不因等待重复创建。具体查询方式继续遵守当前基础设施约束。

## 结果验收

任务 completed 后，沿本家族[下载与交付方法](generate-instrumental.md#下载与交付)验证音频、保留原版并交付试听。分别记录：真实参考字节已提供、请求已接受、任务完成、下载与解码、用户听感反馈。技术路径通过不能代替用户认可，也不能冒称宿主本身已听到不支持输入的音频。

验证结果：2026-11-26，原音轨与托管字节完整哈希一致，带真实音轨的创建请求返回200；任务completed，一次返回两轨，均下载200、完整解码通过，两份30秒试听已成功发送。此verified仅覆盖输入、生成和交付的技术路径，主观相似度及旋律新颖性仍由用户试听评估。实例与原始证据从本机索引进入，不在共享正文保存账号引用、动态任务号或签名地址。
