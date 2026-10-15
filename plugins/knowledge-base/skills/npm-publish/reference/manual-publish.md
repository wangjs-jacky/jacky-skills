# 手动发布 npm 包：兼容入口

先按本 Skill 的[入口](../SKILL.md)定位 release-ops，读取其 npm 平台档案和 `operations/publish-package.md`，选择项目允许的本机发布分支。

只有当前项目采用本机发布才使用该分支；已配置 CI/Trusted Publishing 时沿用该项目流程。缺少认证配置转 `operations/configure-publishing.md`，失败转 `operations/diagnose-publish-failure.md`。

发布步骤、限制和证据规则统一在 release-ops 维护。原来的固定登录/OTP 假设、全量推 tag 和默认升版本连锁命令不再作为通用流程。
