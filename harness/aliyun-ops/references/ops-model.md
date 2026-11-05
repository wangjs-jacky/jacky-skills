# 分类模型与范围

## 已确认的分类

用户于 2026-10-24 要求用 create-ops 创建 aliyun-ops，并明确“仿照 cloudflare-ops”，首个实际场景是给 DeepTutor 配置阿里云 Embedding。沿用其 **capability → operations**，不重复要求用户选择分类轴。

- 主键：`capability`；路由：`references/capabilities/`。
- 当前能力：`bailian`；别名百炼、Model Studio、DashScope。控制台和 API 产品名差异写适用条件，不建三套知识库。
- 同一平台能力的地域、业务空间、账号和应用是私有实例；文本与多模态接口差异是共享事实。
- 首批操作：[配置文本 Embedding](capabilities/bailian/operations/configure-text-embedding.md)、[管理应用模型 Key](capabilities/bailian/operations/manage-model-api-key.md)。可信度以各自文件为准。
- 历史模型用量追踪和工单导航保留在 ego-ops；既有 RAM 轮换记录保留原业务归属。需要再次执行时再提炼对应平台 operation，不批量制造成功经验。

## 自动扩展边界

按此分类自动修正事实、补充别名和同类实际操作；新增能力须来自真实任务，不能预铺阿里云全部产品。变更分类轴、拆并已有归属或把服务范围扩到新的管理领域前再次确认。

`documented`、`partial`、`verified` 分别表示文档指引、部分执行、完整验证。账号或一次配置的状态只保存在 ignored 实例中，不在共享文档复制环境细节。已有 CLI/API 与 Ego 提供执行能力，本 Skill 只管经验与验收。
