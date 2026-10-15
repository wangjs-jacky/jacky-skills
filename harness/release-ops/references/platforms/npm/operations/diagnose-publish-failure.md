---
platform: npm
operation: diagnose-publish-failure
status: documented
last_verified: null
---

# 排查 npm 发布失败

## 目标

定位指定发布尝试的失败阶段、实际结果与有证据支持的原因，给出下一步。

## 前置条件与授权

读[平台档案](../index.md)，定位具体包、版本、registry、源码与执行记录。诊断先只读；只读取必要日志并避免凭据输出。发现日志含敏感材料时不复制进经验。

## 流程与检查点

1. 先查询目标版本是否已发布、渠道是否正确；命令报错不能代替 registry 状态。
2. 区分未触发 workflow、构建/打包失败、认证拒绝、权限/包政策拒绝、版本冲突、上传不确定与发布后读回失败。
3. OIDC 路径核对 runner、Node/npm、身份绑定、workflow/environment 与 allowed actions；Token 路径核对来源、有效性和权限，交互路径核对账号及当前认证要求。
4. 核对 working-directory/workspace 和 registry，不用错误包或错误仓库的成功日志作依据。失败码只是线索，结合配置与实际状态验证根因。
5. 输出已验证事实、未排除假设和最小下一步；已授权修复可继续对应[配置](configure-publishing.md)或[发布](publish-package.md)操作并分别记录结果。

## 成功标准

本次尝试及真实结果已定位，诊断结论有对应证据，下一步与根因相关。只得到“可能是 Token”不足以标为 verified；定位成功不代表已经修复或发布成功。

## 坑与恢复

不把所有 401/403 当成同一原因，不把自托管与托管 runner 混为一谈，不用新建长期 Token、自动升版本或反复发布试错。证据缺失就保留 partial 及需要补充的信息。

## 证据与边界

2026-10-15 文档与设计指导，未复现真实故障。按[写回协议](../../../knowledge-schema.md)维护诊断与修复的独立证据。
