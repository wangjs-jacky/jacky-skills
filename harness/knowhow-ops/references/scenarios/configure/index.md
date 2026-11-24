---
id: knowhow-ops.scenario.configure
title: 配置软件或插件
summary: 保存配置前检查现状与恢复点，应用后从用户日常入口验证实际功能。
scenario: configure
use_when:
  - 用户希望 AI 配好软件、编辑器或笔记插件、本地客户端等功能。
  - 配置已填写但连接、调用或使用结果仍未验证。
avoid_when:
  - 仅询问配置选项含义或要求比较方案。
  - 主要目标是像新用户一样评审整个产品，应进入 tryout。
---

# 配置软件或插件

软件和插件名称属于适用条件，不分别建立分类轴。保护已有配置、连接与工作内容；文件写入、宿主加载和真实功能可用分别核对。

| ID | operation 与用途 | use_when | avoid_when |
| --- | --- | --- | --- |
| `knowhow-ops.configure.apply-and-verify` | [应用配置并验证](operations/apply-and-verify.md)：完成必要设置与实际功能验收。 | 已有具体配置目标，需要在当前环境调通。 | 只有建议而未要求应用；变更会扩大到未授权账号或服务。 |

密钥由当前账号池能力安全取用；不得进入共享配置示例、录屏或经验正文。任务收尾遵循[知识规范](../../knowledge-schema.md)。
