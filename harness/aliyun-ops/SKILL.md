---
name: aliyun-ops
description: "阿里云使用与运维经验库：按能力与 operations 维护百炼模型、Embedding、API Key、地域和费用排障经验。用于阿里云服务的配置、接入与诊断；浏览器操作仍交给 Ego。"
---

# Aliyun OPS

按 **capability → operations** 维护阿里云经验。账号、地域、项目和机器是实例，不为每个环境复制平台规则。分类依据见[模型与范围](references/ops-model.md)。

## 安装时

负责安装或配置的 Agent 先读[全局前置提示词](references/global-agents-prompt.md)，核对真实宿主文件及既有授权。创建或安装本 Skill 不等于授权修改全局规则；普通使用不重复安装交互。

## 读取与执行

1. 从本 Skill 实际目录定位资料。存在 `experience.local.md` 时先读小型实例索引，再读[能力索引](references/capabilities/index.md)，只展开本次能力、operation 和具体实例。
2. 用当前账号、地域、业务空间、SDK/CLI 版本、权限和实际配置复核历史；模型标识、域名与 API Key 的地域必须对应。价格、配额和免费额度按当前官方资料及账号读回复核。
3. 选择现有 CLI、官方 SDK 或 API。旧 CLI 不认识操作时先核对产品和 API 版本，不把 `bailian` 与新版 `modelstudio` 接口混用，不从历史命令猜参数。
4. 实际网页操作先读取 `ego-ops`，再按 `ego-browser` 操作与收尾。导航和控件经验归 Ego；模型、权限、费用与接口事实归本库，避免双份维护。
5. 按目标 operation 的成功标准验收。保存配置、列出模型、HTTP 200 和结构校验分别只能证明相应层面；接入模型要有真实推理，Embedding 要核对向量并验证应用消费。

用户已明确授权的同范围操作直接继续。知识写回不额外授权购买套餐、扩大配额、轮换/停用其他服务密钥、删除资源或对外发布。

## 凭据与服务分工

- RAM AccessKey 用于云管理签名；百炼模型 API Key 用于模型推理；Coding Plan/Token Plan 的 Key 及端点另有适用范围，不能互换。
- 优先复用用户指定的有效凭据源；需要新 Key 时按应用隔离，并在服务支持时限制模型范围。不得重新启用用户停用或已泄露的旧 Key。
- 密钥只在进程内、受控传输和应用私有凭据存储中处理，不打印、不放命令参数或 URL。经验文件即使被忽略也不能存密钥、Cookie、签名 URL 或完整响应。
- 本库不自带云端执行器、后台监控或强制拦截钩子；不为收集经验额外建服务。

## 每次结束时自动写回

完成、失败或中断均读取[知识格式](references/knowledge-schema.md)，按证据更新唯一归属，修正旧结论并同步索引。完整成功才标 `verified`、更新 `last_verified`；部分执行和文档事实不能冒充业务成功。

运行 `node <skill-root>/scripts/validate-knowledge.mjs`，核对结构、链接、状态和可分享内容，再报告写回位置、验证范围及未完成项。没有新事实时说明原因；重复成功仍维护真实验证日期。写回不自动 commit、push 或部署。
