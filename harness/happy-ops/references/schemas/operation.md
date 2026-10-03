# 操作条目约定

路径：references/systems/<system>/operations/<operation>.md。一份正文只描述一个可复用目标，异常分支可留在同一条操作。

## Markdown 字段

- system: 与父系统目录一致的稳定 slug
- operation: 与文件名一致的稳定 slug
- status: verified、historical、pending 或 superseded
- last_verified: YYYY-MM-DD 或 none
- risk: low、medium 或 high
- scope: 验证覆盖范围与限制

verified 必须有真实成功日期和证据链接。historical/pending 可保留过去实际成功日期，但必须写清当前为何不推荐直接执行；本次迁移没有按日期自动升级状态。superseded 额外要求 replacement 字段，使用指向替代 operation 的 Markdown 链接。

## 必需章节

按顺序包含非空的：目标、前置条件与授权、入口、步骤与检查点、成功标准、失败模式与恢复、验证证据。历史整理条目的步骤是待现场复核的先验，不标为本轮已验证。

## 唯一正文与证据

公共 operation 保存脱敏方法；local/systems/<system>/operations/<operation>.md 只保存本机参数、来源、失败观察与执行证据指针，不复制公共步骤。原始案例仍只有一份，可被多个操作引用。共享安装没有私有文件时应能读取方法，但不能将缺失证据当成本机验证。
