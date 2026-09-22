---
site: x
domains:
- x.com
aliases:
- Twitter
- X
updated: 2026-09-16
---

# X

## 平台特征

- `https://x.com/i/flow/login` 当前会进入新版登录流程；以可见的“使用 Google 继续”语义入口为准，不依赖中间路径。
- Google 登录在独立弹窗中完成，原 X 标签页保持打开；成功后弹窗会自动关闭，原标签页转到 `/home`。
- 登录成功不代表拥有互动权限。若主页出现停用、封禁或只读提示，只能继续已获授权的公开浏览操作。
- 公开账号资料页以 `article` 承载帖子；资料页可能折叠长帖，`/status/{id}` 直达页可用于读取主帖全文。

## 操作目录

| operation | intent | risk | last_verified | reference |
| --- | --- | --- | --- | --- |
| read-public-profile-latest-posts | 在已登录且仅获查看授权时读取指定公开账号的最新帖子并生成带原帖链接的摘要 | low | 2026-09-15 | [说明](operations/read-public-profile-latest-posts.md) |
| login-with-google | 在用户明确授权后通过 Google 登录 X，并用 X 首页及账号状态验证结果 | medium | 2026-09-15 | [说明](operations/login-with-google.md) |

## 站点级陷阱

当前没有已验证且跨 operation 的站点级陷阱；操作特有失败记录在对应 operation 文档中。
