---
id: model-ops.generate-bblabu-video
title: 经 BBLABU 提交视频并保存结果
status: documented
last_verified: null
---

# 提交视频与保存结果

本方法已根据供应商公开教程和能力目录核对协议，尚未执行真实视频生成。先完成[视频目录与状态检查](check-bblabu-video.md)，再按当前任务的内容、素材与费用授权调用；保存 Key 和登记入口不等于授权付费试生成。

## 逐型号核对

- 从当前 Key 的 `/v1/models` 选精确 ID，不删线路前缀、不猜大小写或后缀，不擅自替换为同系列其他路由。
- 读取 `/api/video-catalog` 中该 ID 的 `description`、`hints`、`material_notes`、时长、清晰度、比例、references、frames 及 task_pricing。结构数值与文字说明冲突时保留冲突，以具体型号教程核实，不把 0 当作已证实的零秒能力。
- 普通参考图、首帧／尾帧、参考视频和参考音频不是同一种输入。核对数量、最少参考图、合计上限、组合互斥与真人素材规则，不把某线路支持泛化到整个家族。
- 按该 Key 分组读取 `/api/pricing` 的 `group_task_pricing`；区分按条和按秒、清晰度档位、参考视频输入时长是否另计。平台刀不等于美元，历史人民币估算不作为固定价格。
- 参考输入须为供应商可直接下载的 HTTPS 媒体文件。网页分享链接、localhost、需登录地址不能直接替代；上传或公开素材继续按原任务范围处理，不为接入自动发布私有素材。

## 接口与参数

Base URL 为 `https://api.bblabu.ai/v1`。使用账号池内存取出的 Bearer Key，JSON 请求；不要拼成 `/v1/v1/videos`。

| 操作 | 方法与路径 | 范围 |
| --- | --- | --- |
| 创建 | `POST /v1/videos` | 付费业务动作；只提交本次授权的任务 |
| 查询 | `GET /v1/videos/{id}` | 对已保存的同一任务单次查询 |
| 结果 | `GET /v1/videos/{id}/content` | 按真实响应核对内容类型或结果地址 |

必填 `model`、`prompt`。`duration`、`resolution`、`aspect_ratio`、`generate_audio`、`seed`、`watermark` 只在所选型号明确支持时发送。`n` 省略或为 1。

普通线路使用 `reference_image_urls`、`reference_videos`、`reference_audios`、`first_image_url`、`last_image_url`；目录标记 `official` 的线路可能改用 `referenceImages`、`referenceVideos`、`referenceAudios`、`first_image`、`last_image` 与 `ratio`。按精确型号文档选择，不能混用。

例如以下仅是已核对公开约束的 Grok 请求体，不代表已提交：

```json
{
  "model": "grok-imagine-video",
  "prompt": "蓝色陶瓷杯放在木桌上，晨光从左侧照入，镜头缓慢推近。",
  "duration": 6,
  "resolution": "480p",
  "aspect_ratio": "16:9"
}
```

## 任务状态与恢复

创建后立即保存不含凭据的请求、HTTP 状态及返回的 `id` 或 `task_id`。HTTP 200 只证明接口受理，不能当作视频生成成功。网络中断且提交结果未知时保留不确定状态，先核对使用日志，不盲目重提。

queued／pending／in_progress／processing 表示未完成；completed（或供应商实际返回的成功终态）后才保存产物；failed／cancelled 保留错误与账单待核事项。已有 ID 时继续处理同一任务，不重新创建催进度。

本库登记单次查询方式，不照搬供应商示例中的 `while + sleep` 轮询循环，不建立定时状态服务。若具体任务需要自动完成通知，先核对供应商实际支持的事件机制；未知时不虚构回调能力。

## 下载与验收

从真实响应的 `video_url`、`url`、`data[0].url` 或 content 入口解析结果，不猜测已存在文件。带凭据请求只发往校验后的精确 API 主机与当前任务路径，禁止把 Bearer 通过跨域重定向转发；公开 CDN 地址不携带本站 Key。

下载到原业务任务目录，核对时长、分辨率、帧率、音轨和全片解码。真实查看画面、动作连续性和声音；技术检查不能代替用户观感。Happy 远端交付时发送实际可播放视频文件。创建、完成、下载、解码、内容核查、用户认可及实际扣费分别记录，首次完整成功后才能刷新本 operation 的验证状态。

官方入口：[媒体教程](https://api.bblabu.ai/docs?category=media)、[公开能力目录](https://api.bblabu.ai/api/video-catalog)、[公开价格](https://api.bblabu.ai/api/pricing)。前端文件名属于当次快照，下一次从当前官网重新解析，不依赖旧 bundle 路径长期有效。
