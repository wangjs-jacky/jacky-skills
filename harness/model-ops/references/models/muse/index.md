---
id: model.muse
title: Muse 视频与播客视频路由
summary: 读取 Muse 普通、固定时长及 podcast 视频型号的具体条件。
---

# Muse

BBLABU 的 `mu1-muse-video*` 与 `mu1-muse-podcast` 当前归 video 类。podcast 路由不等于本机播客 TTS 服务；声音角色仍按对应原任务和声音素材规则处理。

- [检查目录与状态](../../operations/check-bblabu-video.md)。
- [提交视频与保存结果](../../operations/generate-bblabu-video.md)：普通短片、固定时长和 podcast 逐型号核对，不能从名称自动套用 duration 或 resolution。
- 当结构化时长字段为 0，但文字说明给出范围或固定值时，先核对型号说明，不把 0 当作合法输出时长。
- 当前 Key、目录及价格从 `experience.local.md` 进入本机视频接入记录。

2026-11-26 只读目录与鉴权通过；真实视频、声音和口型效果尚未验证。
