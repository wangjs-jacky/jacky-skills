# 执行端与集成运行时

- system: execution
- aliases: CLI、daemon、worker、Codex、SDK、执行机、代理、外部集成

## 系统共识

全局包、启动器、daemon 与既有 worker 可运行不同版本。外部集成先定位实际 Paws 调用边界，不替代其自身项目经验库。

## 操作目录

只读当前目标命中的一条 operation。verified 也只覆盖该条 scope；historical/pending 不作为今日成功保证。

| 目标／症状 | 操作 | 状态 | 最近验证 |
| --- | --- | --- | --- |
| 更新本机 CLI 与 daemon | [update-cli](operations/update-cli.md) | verified | 2026-10-03 |
| 发布 CLI 或 SDK 包 | [publish-package](operations/publish-package.md) | historical | none |
| 排查新会话启动 | [diagnose-session-start](operations/diagnose-session-start.md) | verified | 2026-10-03 |
| 排查执行端认证 | [diagnose-auth](operations/diagnose-auth.md) | historical | none |
| 排查额度刷新 | [refresh-quota](operations/refresh-quota.md) | historical | none |
| 排查与恢复原会话 | [resume-session](operations/resume-session.md) | historical | none |
| 排查历史库兼容与锁 | [diagnose-history-store](operations/diagnose-history-store.md) | historical | none |
| 排查执行机资源与回收 | [manage-resources](operations/manage-resources.md) | historical | none |
| 排查设备环境扫描 | [inspect-environment](operations/inspect-environment.md) | historical | none |
| 排查进程代理与上游连接 | [diagnose-proxy](operations/diagnose-proxy.md) | historical | none |
| 排查 SDK 与外部集成 | [diagnose-integration](operations/diagnose-integration.md) | historical | none |
| 排查模型选择与能力 | [diagnose-model](operations/diagnose-model.md) | historical | none |
| 核对原生插话链路 | [diagnose-steer](operations/diagnose-steer.md) | historical | none |

## 共性陷阱

在线、目录 RPC 成功、模型可用和新会话可创建是不同结果。旧 worker 不随 daemon 热更新；进程缺少登记不证明可清理。

## 本机环境

需要真实入口、版本或机器时读取[私有系统索引](../../../local/systems/execution/index.md)，共享安装可无此文件。只读核实命令解析、符号链接、runner、Node/cwd、代理来源、daemon 注册及目标 worker；关联具体会话，不打印凭据或完整环境。

跨系统目标回到[发布路由](../../release-routing.md)；只继续受影响系统。
