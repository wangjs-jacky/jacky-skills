# 自托管 Server

- system: server
- aliases: 后端、API、Socket、数据库、凭据中继、目录接口

## 系统共识

后端由实际 runner、release、配置和 schema 决定；Web/OTA 发布不代表后端更新。

## 操作目录

只读当前目标命中的一条 operation。verified 也只覆盖该条 scope；historical/pending 不作为今日成功保证。

| 目标／症状 | 操作 | 状态 | 最近验证 |
| --- | --- | --- | --- |
| 部署自托管 Server | [deploy](operations/deploy.md) | verified | 2026-10-03 |
| 排查 API 与 Socket 连接 | [diagnose-connection](operations/diagnose-connection.md) | historical | none |
| 排查安装包目录接口 | [diagnose-native-catalog](operations/diagnose-native-catalog.md) | historical | none |
| 排查凭据同步与账号归属 | [diagnose-credential-sync](operations/diagnose-credential-sync.md) | historical | none |
| 排查会话同步与恢复接口 | [diagnose-session-sync](operations/diagnose-session-sync.md) | historical | none |
| 核对应用会话与授权入口 | [diagnose-app-delegation](operations/diagnose-app-delegation.md) | historical | none |

## 共性陷阱

历史标题中的当前 Server 只是当时快照；health 正常不证明目标接口生效。生产独立补丁不能被未知 main 差异覆盖。

## 本机环境

需要真实入口、版本或机器时读取[私有系统索引](../../../local/systems/server/index.md)，共享安装可无此文件。只读核实当前 runner/config、进程入口、release revision、schema/migrations 和实际 health/Socket/API 路径；激活前再次核对。

跨系统目标回到[发布路由](../../release-routing.md)；只继续受影响系统。
