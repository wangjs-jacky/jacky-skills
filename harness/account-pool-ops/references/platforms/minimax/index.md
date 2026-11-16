---
platform: minimax
updated: 2026-11-16
---

# MiniMax

## 范围与共享事实

同平台覆盖相关API产品，不为每个模型复制Key池。视频H3和H3-Image接口不同；有Key不代表所有区域、产品或收费权限可用。

2026-11-16实际检查确认应分别记录中国区与国际区鉴权，不因平台名相同推断Key跨区有效。具体账号结果仅留在本机条目，不泛化为供应商规则。

## 操作目录

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| register-key | verified | 2026-11-16 | [入库](operations/register-key.md) |
| verify-key | verified | 2026-11-16 | [鉴权](operations/verify-key.md) |
| verify-model | verified | 2026-11-16 | [单次模型实测](operations/verify-model.md) |
| use-and-rotate | documented | — | [取用与轮换](operations/use-and-rotate.md) |

## 限制与来源

不持久化Key正文到知识文件，不自动创建或重试收费任务。保存、鉴权与生成分别验证。已在明确单次预算内验证一次中国区原版H3生成，不外推所有型号、区域、精确时长或运行接入成功。

[官方H3任务列表](https://platform.minimax.io/docs/api-reference/video-generation-v2-list)、[创建视频](https://platform.minimax.io/docs/api-reference/video-generation-v2-create)、[H3-Image](https://platform.minimax.io/docs/guides/image-generation)。
