# 站点索引 schema

站点索引文件位于 `references/sites/<site-slug>/index.md`，只记录跨 operation 的站点事实与 operation 路由。

## YAML frontmatter

必须包含以下字段：

```yaml
site: <site-slug>
domains:
  - <canonical-domain>
aliases:
  - <产品别名>
updated: YYYY-MM-DD
```

- `site` 必须与目录名一致，并使用安全 slug。
- `domains` 保存同一产品的多个域名或环境映射，不按环境复制站点目录。
- `aliases` 保存产品名、常用简称等中文或原文别名。
- `updated` 是最近一次已验证站点事实或 operation 路由的日期。

## 正文章节

正文必须按顺序包含以下非空章节：

```markdown
# <site-slug>

## 平台特征

只记录跨 operation、由真实页面验证过的登录、导航、加载或页面架构事实。

## 操作目录

以表格列出每个已知 operation，并链接到 `operations/<operation-slug>.md`。

## 站点级陷阱

只记录跨 operation 且失败现象、根因和恢复方式都已经验证过的陷阱。
```

操作特有的失败写入 operation 文档；跨 operation 的失败才写入站点索引。不得写入密码、Cookie、Authorization、Token、个人数据、动态业务对象 ID 或可重放凭证。
