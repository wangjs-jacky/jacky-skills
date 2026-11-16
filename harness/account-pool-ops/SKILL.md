---
name: account-pool-ops
description: "按平台安全管理用户API密钥：入库、多密钥引用、只读鉴权、默认项与轮换记录。用户提供Key、管理账号池或平台API接入需取用已有凭据时使用；普通内置生图或无鉴权请求不触发。"
---

# 账号密钥池

按 **platform → 密钥条目 → operation** 管理API凭据；平台是分类主键，条目为平台内实例。`minmax`、`MiniMax`、`minimaxi`归`minimax`。范围见[分类模型](references/ops-model.md)。

当前安全后端支持macOS Keychain。脚本沿用Python标准库，通过ctypes直接调用Security.framework，避免将密钥传入shell或命令参数；运行不依赖第三方Python包。其他系统缺少安全后端时明确停止，不降级为明文存储。

## 安装与全局前置

安装/配置Agent先读[安装提示词](references/global-agents-prompt.md)。创建或安装Skill不授权修改全局AGENTS；已有同范围授权则复用，否则展示准确规则与文件后只问一次。未授权不阻塞正常使用；普通操作跳过安装交互。

## 渐进读取与执行

1. 从本Skill实际路径定位根目录，读[平台索引](references/platforms/index.md)，仅读目标平台与operation；本机实例沿 `experience.local.md` 进入 `local/`。
2. 用 `python3 scripts/account_pool.py list --platform <平台>` 查脱敏元数据，已有条目可用时不再索要Key；不枚举全部Keychain。
3. 导入用 `import-key` 的隐藏交互或进程stdin。脚本经Security.framework保存至macOS Keychain；`local/accounts.json`只存引用、指纹和验证范围。无安全后端时停止保存，禁止明文降级。
4. 业务进程内调用 `Pool().get_secret(platform, entry)`，不打印返回值。密钥不放命令参数、临时文件、源码、Skill、日志、回复、网页或Git；私有Git也不作为凭据存储。
5. MiniMax的 `verify-minimax` 对选定条目每区只发一次只读请求。鉴权、余额、模型权限和生成成功分别验证。

## 账号池规则

- 首次条目为primary；后续不同Key新增，旧项保留；相同指纹核对引用后不重复保存。新增不切换默认项，不自动循环尝试其他Key。
- 用户明确要求时才用 `set-default` 切换。轮换先新增和验证；当前工具没有真实条目删除命令，平台侧撤销与删除原件需明确对象和授权。
- 保管/取用Key不扩大付费、部署、账号修改、跨设备复制或发布权限。当前范围仅API密钥，不自动扩展登录密码、Cookie、验证码、2FA恢复码或交易凭据。
- 同范围平台、别名和操作按真实工作自动补充；改变分类轴、拆并归属或扩大凭据类型前确认。

## 验证与写回

按[知识格式](references/knowledge-schema.md)执行：读取 → 当前事实复核 → 操作 → 对照成功标准 → 写回唯一归属 → 同步索引 → 报告。完成、失败、中断均维护，不等用户提醒。只有目标真实完成才刷新成功日期；安全保存、鉴权结果和业务完成不相互替代。

共享方法归平台/operation，实际服务引用与检查结果仅归local。重复成功维护日期，无新事实不复制正文。安全项已保存而元数据失败时分别报告，不擅自删除用户Key“回滚”。

运行 `scripts/test_account_pool.py`、`scripts/validate_registry.py` 和官方结构检查；真实安全后端用 `keychain-self-test`，它只创建并清理自己的随机临时条目。校验不代表全部模型可用。不得为维护记录新增付费调用或定时探测服务。

调用示例：`使用 $account-pool-ops 查看MiniMax已存条目，并只读验证默认Key。`
