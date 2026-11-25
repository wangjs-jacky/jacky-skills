---
id: model-ops.check-bblabu-threed
title: BBLABU 3D 目录与只读鉴权
status: verified
last_verified: 2026-11-26
---

# 3D 目录与鉴权

目标：核对当前指定 3D Key 的安全读回、在售目录、可见型号和平台状态，不提交付费生成。

1. 从本机索引解析 3D 接入配置及 Account Pool OPS 的 platform／entry。由 `Pool().get_secret()` 在业务进程内存读取，不打印、不进入命令参数或配置文件；独立条目保留平台原默认与旧项。
2. 单次请求 `GET https://api.bblabu.ai/v1/availability?category=threed`，Bearer 鉴权；单次 `GET /v1/models` 核对该 Key 可见型号。拒绝携带凭据跨域跳转。
3. 从当前官网引用的公开模型 catalog／教程核对 category=threed 的逐型号 API、参数和价格；`/api/pricing` 补充当前分组价格。不依赖旧静态文件名长期有效，不把 catalog 的 `usd` 字段名直接解释为美元。
4. 保存查询时间、HTTP 状态、目录版本和不含凭据的快照，比较同类别型号集合。目录可见与 available 不证明已通过实际生成。

## 状态与限流

`models` 为本类别完整目录，无分页；实际响应的 `data[].category` 应为 `threed`，不要因旧说明只枚举 image／video 就丢弃有效 3D 系列。仅在有效 200、ready=true、stale=false 时与此前同类别正常快照做上架／下架差集。

ready=false 或 stale=true 保留上一份正常状态；没有旧快照就报告尚无有效目录。unknown 是暂无可核对记录，assumed=true 或 status_basis=default 是默认值，均不等同于故障或探测成功；observed 仅为平台最近调用记录。pace 不是完成时限保证。

账号所有 Key／类别共用每 30 秒一次限制，单 IP 每分钟最多 60 次。按需要单次查询并复用快照，不建立定时拉取服务。429 记录 Retry-After 后结束，401／403 报告鉴权或访问失败，503 保留旧状态；不换 Key 绕限流，不自动重复查询。

## 证据边界

2026-11-26：当前 Mac mini 指定新 3D Key 安全读回及指纹核对通过；两个鉴权接口均为 200，ready=true、stale=false，5 个型号集合一致。完整条件从本机索引进入。真实生成及网格验收继续按[生成 operation](generate-bblabu-threed.md)，未刷新其成功日期。
