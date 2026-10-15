# npm 自动发布配置：兼容入口

先按[入口](../SKILL.md)定位 release-ops，读取其 npm 平台档案和 `operations/configure-publishing.md`。根据项目的 runner、工具版本、信任配置和当前官方支持选择认证模式；不把缺少 NPM_TOKEN 判为未配置。

配置与第一次真实发布分别验证，实际发布转 `operations/publish-package.md`。workflow 使用当前项目文件和触发规则，不能照搬固定模板后替换已有链路。

Token 的有效期和 2FA 约束按当前规则核对，不使用“一次配置永久有效”的旧结论。凭据值由专用存储承载，不写进经验或全局指令。
