---
capability: bailian
operation: manage-model-api-key
status: verified
last_verified: 2026-10-24
---

# 为应用管理模型 Key

## 目标

在指定地域/业务空间创建应用专用的模型 API Key，限制其模型访问范围，安全交给应用并读回配置。

## 适用状态与前置条件

已有明确应用接入授权和可用云管理身份。先确认目标地域/空间及是否已有本应用 Key；不要从整个账号任取其他应用的 Key，不启用已停用或泄露的旧 Key。此操作不包含 RAM AccessKey 轮换、停用其他 Key 或购买套餐。

## 设计与执行

1. 优先核对现有授权来源，仅读取必要元数据，避免完整 Key 列表和响应进入日志。
2. 当前 CLI 不支持管理 API 时，核对官方 SDK 中产品、版本、地域 endpoint 和请求 schema，再选择 API 或控制台。已验证的 ModelStudio 2026-02-10 接口可用 `ListWorkspaces`、按 description 过滤的 `ListApiKeys`、`CreateApiKey` 和 `GetApiKey`。Python SDK 的 `get_api_key` 直接接收 Key ID 字符串，其余三者使用各自 Request 对象；以安装版本源码为准。
3. 创建前检查是否已存在同一用途 Key；用应用名描述。已验证的自定义权限为 `auth.type=Custom`、`modelAccessScope.allowAllModels=false`，并将 `accessibleModels` 限定到本次模型。未配置 IP 白名单会允许所有 IPv4/IPv6 来源；这只是模型范围限制，不能称作来源 IP 限制。
4. 返回明文只留在进程内，经受控 stdin/环境或私有设置送至应用；不得放进聊天、命令参数、截图、经验或 Git。私有凭据存储限制文件权限。
5. 读回启用状态、业务空间、模型访问范围，进行一次目标模型小请求。只报告验收摘要。

## 坑与恢复

RAM 管理签名凭据与模型推理 Key 不是同一种。请求结果不明时先查同用途元数据，不能无上限重复创建。不要把 Token Plan/Coding Plan Key 当标准 Embedding Key。

## 成功标准

应用专用 Key 已创建/复用，启用状态和限定模型读回一致；应用凭据存储完成，目标模型实际调用成功；未改变无关 Key 或账号设置。

## 验证证据与边界

2026-10-24：通过已授权管理身份读取默认业务空间和本应用匹配列表（0 个），创建仅允许 `text-embedding-v4` 的专用 Key；GetApiKey 读回 disabled=0、自定义权限和同一模型范围。经 SSH stdin 交给目标应用，官方 config check/apply 通过；应用实际发起两段文本请求并取得两个 1024 维有效向量。未修改其他 Key 或 RAM 身份；本次没有执行浏览器创建流程，不生成相应 Ego 成功经验。实际实例与证据位置仅在私有索引。
