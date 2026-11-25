---
id: model.tripo3d
title: Tripo3D 三维生成
summary: 按精确版本区分文本、单图、多视图、贴图类型与点数计费。
---

# Tripo3D

BBLABU 当前登记 `tripo3d`、`tripo3d-p1`、`tripo3d-p2`、`tripo3d-v3.1`。供应商将这些名称归入 Tripo3D 家族；名称和路由不独立证明底层版本身份。

- [3D 目录与鉴权](../../operations/check-bblabu-threed.md)：先核对所选 Key 的精确型号与当前状态。
- [生成三维网格并保存](../../operations/generate-bblabu-threed.md)：文生、单图和多视图分开准备，参数类型按具体型号读取。
- `tripo3d` 的 prompt 在图生时仍必填，texture 是 `no / standard / HD` 字符串，不支持多视图。
- P1／P2／v3.1 的 texture 是布尔参数，支持的面数与四边面／部件拆分能力不同，按实际点数结算；不能套用基础型号的贴图档位。
- 具体账号池引用、公开能力和价格快照从 `experience.local.md` 的本机 3D 接入记录进入。

2026-11-26 只读鉴权与目录通过；真实生成、网格文件和可用质量尚未验证。
