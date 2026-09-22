# Ego Ops 知识 schema（兼容入口）

知识规范已拆分为两个可渐进读取的 schema：

- [站点索引 schema](schemas/site-index.md)：定义根路由和单站点索引。
- [Operation 文档 schema](schemas/operation.md)：定义单个可复用操作。

历史文档引用本文件时，仍可从这里进入规范；不要把真实站点步骤、临时对象、完整响应或认证材料写入本文件。

## 一级站点索引

路径：`references/sites/index.md`。只保存站点、域名、别名、最近验证日期和站点索引相对链接。

## 站点索引

路径：`references/sites/<site-slug>/index.md`。只保存跨 operation 的平台特征、operation 路由和站点级陷阱。

## Operation

路径：`references/sites/<site-slug>/operations/<operation-slug>.md`。保存目标、授权、入口、已验证步骤、检查点、成功标准、失败恢复和验证证据。

所有知识必须脱敏、可复用，并通过 `scripts/validate-knowledge.mjs`；失败任务不得刷新验证日期。
