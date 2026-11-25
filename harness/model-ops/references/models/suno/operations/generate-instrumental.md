---
id: model.suno.generate-instrumental
title: 生成纯器乐并保存音频
status: verified
last_verified: 2026-11-26
---

# 生成纯器乐

目标：在用户当次授权内，用已选供应商的 Suno 路由生成音乐，保存并交付可播放音频。当前完整验证范围为 BBLABU 的 `su2-suno-v6-mini`。

## 调用前

1. 通过 Account Pool OPS 查目标平台的脱敏条目与限定鉴权记录。Key 由 `Pool().get_secret()` 在业务进程内存读取，使用当前指定条目。
2. 核对官网当前型号目录、参数与费用。`GET /v1/models` 可确认该 Key 的可见目录；`GET /v1/availability?category=music` 只反映运行状态，账号所有 Key 共用每 30 秒一次限流。两者均不保证实际生成成功。
3. 公开计价的“平台刀”不是美元或人民币；将单次标价按当前充值汇率估算，实际扣款与失败退款分别核对。历史报价和本机结果保存在私有实例记录。

用户提供作品时，先分清风格借鉴与旋律沿用。要相近风格的原创旋律、即兴创作时，按本操作把乐器、音色、空间感及演奏语汇写成文字，重新生成，不传upload_url、source_task_id、source_track或旧曲persona。要翻奏／重编原曲时再读 [真实音频参考生成](generate-from-audio.md)。Mini 简易路由只接收文字；只看标题或画面写提示，不得描述成已经听辨或完成声音风格匹配。外部通用理解服务按实际需要选用。

## 已验证接口

BBLABU 创建：`POST https://api.bblabu.ai/v1/music`，JSON 请求。

```json
{
  "model": "su2-suno-v6-mini",
  "prompt": "Original clean electric guitar instrumental, spacious delay and reverb, lyrical winter mood, no vocals, no drums.",
  "instrumental": true,
  "n": 1
}
```

此路由只允许 `model`、`prompt`、`instrumental`、`n`，其中 `n` 只能为 1，prompt 最多 3000 字符。不要套用其他模型的 duration、bpm、seed 或格式参数。提示词可以描述目标时长，实际结果长度仍须读回。

创建成功后保存不含凭据的请求和任务号；只查询当前任务的 `GET /v1/music/{task_id}`。任务未完成或创建结果未知时，不能重复提交以催进度。查询方式须遵循当前任务的基础设施约束，不因此创建后台轮询服务。

`status=completed` 时读取 `music_url` 数组，`extra` 的数组按音轨位置对应。接口可能一次返回多轨，按一次创建记录；本次实际返回一轨。

## 下载与交付

结果为本站需同一 Key 鉴权的代理地址。发送凭据前校验 HTTPS、精确主机 `api.bblabu.ai` 和当前任务的 `/v1/music/{task_id}/content/` 路径，禁止把 Bearer 随跨域重定向转发。文档标注代理音频保存 7 天，完成后及时本地保存。

下载后用媒体工具核对格式、音轨、采样率、实际时长与完整解码。需要短试听时保留完整原件，从已生成文件截取并加入合适收尾；本地剪辑不新增模型调用。按宿主要求发送可播放音频附件，完整提示词、原音频、剪辑和哈希保留在原业务任务。

## 成功边界与排障

- 创建成功、任务 completed、音频下载、完整解码和附件交付分别取证。无声检测或解码检查不能证明吉他音色、无人声或听感贴近参考，用户试听认可单独记录。
- 请求超时但创建结果未知时保留不确定状态；只读状态查询失败不构成重新生成或切换 Key 的理由。
- 其他模型返回的错误不能外推成 Suno 不可用；具体失败、解释器与网络条件保留在本机实例和原任务。

验证日期沿用原真实生成证据。登记本方法不代表又调用了一次模型；原实例导航见本家族索引与 `experience.local.md`。
