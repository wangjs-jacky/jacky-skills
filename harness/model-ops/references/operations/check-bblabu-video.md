---
id: model-ops.check-bblabu-video
title: 核对 BBLABU 视频目录与状态
status: verified
last_verified: 2026-11-26
---

# 视频目录与状态

目标：使用本次指定账号池条目，单次核对视频在售目录、Key 可见型号和平台记录的运行状态，不提交生成任务。

## 凭据与请求

1. 从本机 `experience.local.md` 进入视频接入记录，解析 Account Pool OPS 的 platform／entry 引用。经其 `Pool().get_secret()` 在请求进程内存读取，不输出 Key、不拼入命令参数或文件。
2. 请求 `GET https://api.bblabu.ai/v1/availability?category=video`，使用 Bearer 鉴权。这是只读、不扣模型额度的状态接口。
3. `GET https://api.bblabu.ai/v1/models` 核对当前 Key 的精确型号。目录可见不独立保证实际生成权限。
4. 官方网页当前从 `GET /api/video-catalog` 取得逐型号能力，从 `GET /api/pricing` 取得分组价格；这两处公开数据不替代所选 Key 的权限核对。保存本次时间、HTTP 状态、目录版本及不含凭据的响应。

## 状态语义与限流

- `models` 是当前 category 的完整在售列表，无分页；`catalog_version` 随目录改变。只在 HTTP 200、目录有效且 `ready=true`、`stale=false` 时，与此前同类别正常快照做上架／下架差集。
- `ready=false` 或 `stale=true` 保留上一份正常快照，不把缺失条目当作下架或故障；没有旧快照就报告尚无有效目录。
- `latest_status` 为 available／degraded／unavailable／unknown。unknown 是缺少可核对记录，不是故障。
- `status_basis=default` 或 timeline 格子的 `assumed=true` 是默认值，不是实际探测成功。observed 也只是平台最近记录，不是本机完成生成。
- `observed_at`、`fetched_at`、`pace` 与状态各自保留；过期不等于模型故障，典型耗时不是完成保证。
- 所有 Key 和类别共用每账号 30 秒一次限制；单 IP 每分钟最多 60 次。按任务需要单次查询并复用有效快照，不建立定时拉取或轮询服务。
- 429 记录 `Retry-After` 后结束本次查询；401／403 报告鉴权或访问失败；503 保留旧状态并报告当前查询失败。不换 Key 绕限流，不自动重复请求。

## 成功标准与证据

安全存储读回、HTTP 200、有效 video 目录及当前 Key 型号核对分别成立，才标记本检查成功。生成和成片验收归[生成 operation](generate-bblabu-video.md)。

2026-11-26：在当前 Mac mini 的指定视频 Key 下，两项鉴权接口均返回 200，ready=true、stale=false；各返回的 51 个视频型号集合一致。具体目录、平台状态与账号池引用保留本机记录，不固化为长期状态。
