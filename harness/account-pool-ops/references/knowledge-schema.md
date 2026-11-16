# 知识格式与写回

## 唯一归属

- ops-model.md维护用户确认分类，platforms/index.md维护别名路由。
- 平台index维护共享事实和操作目录，operations记录目标/条件/方法/成功标准/坑/证据。
- operation元数据：platform、operation、status、last_verified。documented和partial日期为空，目标真实完成才verified并填日期。
- local/accounts.json只存Keychain服务引用、SHA-256指纹、默认/启用状态、时间和限定范围的鉴权结果，目录0700、文件0600；密钥正文只在系统安全存储。
- experience.local.md及local保存本机实例与验证导航，不保存Key、Cookie、签名URL、完整任务列表或会话全文。

## 每次写回

完成、失败、中断都维护本次真实结果，修正失效结论并同步索引。保存成功、诊断完成、鉴权有效与模型生成成功分别记录。重复成功维护日期，无新事实不复制正文，不为刷新日期擅自发请求。

同范围新平台和操作自动补充；改变分类轴或凭据类型前确认。写回失败分别报告安全材料、元数据与经验完成哪一步；不能把Git忽略当成可保存明文的许可。

## 校验

运行scripts/validate_registry.py检查路由、元数据、Keychain引用形状、文件权限和明显明文Key模式，运行官方Skill校验和scripts/test_account_pool.py。校验不调用生成API、不枚举Keychain；结构通过不证明账号或模型可用。
