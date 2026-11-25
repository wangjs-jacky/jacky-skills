---
id: model-ops.operations
title: 模型生命周期操作
summary: 只读当前目标需要的生命周期说明，推理进入家族操作。
---

# 生命周期操作

| ID | 目标 | 入口 |
| --- | --- | --- |
| lifecycle.deploy | 新部署或恢复一个可调用实例 | [部署并验证](deploy.md) |
| lifecycle.check | 判断当前能用什么、哪里可用 | [检查可用性](check.md) |
| lifecycle.diagnose | 定位下载、加载、调用或质量问题 | [诊断](diagnose.md) |
| lifecycle.upgrade | 升级模型／运行时并验证回退 | [升级与回退](upgrade.md) |

## 云端视频共用操作

先从模型家族进入；下列仅复用同一供应商协议，不把供应商提升为模型家族。

| ID | 目标 | 验证范围 | 入口 |
| --- | --- | --- | --- |
| model-ops.check-bblabu-video | 当前视频目录、状态与 Key 可见型号 | 只读鉴权已验证 | [目录与状态](check-bblabu-video.md) |
| model-ops.generate-bblabu-video | 逐型号准备、提交、保存及验收 | 协议已核对，真实生成未执行 | [生成与保存](generate-bblabu-video.md) |

## 云端 3D 共用操作

| ID | 目标 | 验证范围 | 入口 |
| --- | --- | --- | --- |
| model-ops.check-bblabu-threed | 3D 状态、目录和 Key 可见型号 | 只读鉴权已验证 | [目录与鉴权](check-bblabu-threed.md) |
| model-ops.generate-bblabu-threed | 按型号生成、下载并验收网格 | 协议已核对，真实生成未执行 | [生成与下载](generate-bblabu-threed.md) |
