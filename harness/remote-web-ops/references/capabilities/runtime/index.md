---
capability: runtime
---
# 服务运行

服务、权威数据与工具执行的位置先由架构方案明确；此能力核对远端服务是否能持续支持外部Web使用。部署拓扑与平台实施细节沿architecture-deploy-ops及目标平台OPS。

SSH可读、进程监听或health200各自仅证明一段；后台进程的启动依赖和业务目录读取、外部客户端业务、完整重启恢复分别验收。新部署不覆盖已有持久数据。

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| deploy-and-verify | documented | — | [部署并验收](operations/deploy-and-verify.md) |

来源：已有架构部署方法的工作分层，本档案没有声明某环境整机恢复已经验证。恢复启动、发布切换等新操作按实际任务扩展。
