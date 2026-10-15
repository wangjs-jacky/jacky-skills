# 能力索引

按用户目标命中一个能力，再读取其档案和具体 operation。

| capability | 别名与场景 | 入口 |
| --- | --- | --- |
| installation | 安装、升级、版本冲突、远端环境迁移 | [安装与升级](installation/index.md) |
| configuration | 配置、模型/provider、AGENTS、配置未生效 | [配置管理](configuration/index.md) |
| skills | 安装同步 Skill、路径解析、技能发现与触发 | [技能管理](skills/index.md) |
| connectivity | 登录、认证、代理、模型连接、Responses WebSocket | [认证与连接](connectivity/index.md) |
| usage | 剩余额度、重置时间、日志数据来源 | [用量](usage/index.md) |

CLI/Desktop/托管 app-server、不同设备与配置目录作为实例条件。跨能力目标由主要 operation 引用相关操作；例如迁移环境引用技能同步和认证诊断。分类变更按[分类模型](../ops-model.md)确认。
