# Operation 文档 schema

operation 文件位于 `references/sites/<site-slug>/operations/<operation-slug>.md`，只记录一个可复用目标的已验证操作。

## YAML frontmatter

必须包含以下字段：

```yaml
site: <site-slug>
operation: <operation-slug>
title: <中文操作名>
risk: low|medium|high
last_verified: YYYY-MM-DD
```

- `site` 必须与父站点目录和站点索引一致。
- `operation` 必须与文件名一致，并使用安全 slug。
- `risk` 只能是 `low`、`medium` 或 `high`。
- `last_verified` 只能在操作由可观察结果证明成功后刷新。

## 正文章节

必须按以下顺序包含八个非空章节：

1. `## 目标`
2. `## 前置条件与授权`
3. `## 入口`
4. `## 已验证步骤`
5. `## 检查点`
6. `## 成功标准`
7. `## 失败模式与恢复`
8. `## 验证证据`

步骤必须使用稳定控件语义或定位策略，不得保存临时引用号、坐标、点击流水、动态对象 ID、完整响应或任何认证材料。成功标准必须能够由页面成功提示、读回结果、状态变化、列表变化或导出结果观察证明。
