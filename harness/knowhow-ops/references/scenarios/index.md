---
id: knowhow-ops.scenarios
title: Knowhow OPS 场景清单
summary: 先按主要结果选择场景，再进入对应 operation；教学可作为实际任务的附加交付。
use_when:
  - 用户希望 AI 探索并实际使用工具、配置软件、试用产品或交付操作讲解。
avoid_when:
  - 只有无关资料摘要、翻译或不涉及软件操作讲解的通用视频后期。
---

# 场景清单

按主要结果路由。一次任务以一个场景拥有总体目标，其他场景仅引用所需能力和证据。

| ID | 场景与用途 | use_when：何时读 | avoid_when：关键避用条件 |
| --- | --- | --- | --- |
| `knowhow-ops.scenario.get-started` | [上手工具](get-started/index.md)：代用户探索陌生工具并完成一个实际任务。 | 想用好工具，尚不熟悉入口、概念或工作流。 | 只有概念介绍；已知需求仅为修改一项配置。 |
| `knowhow-ops.scenario.configure` | [配置软件或插件](configure/index.md)：应用配置并验证从日常入口可用。 | 软件、插件、连接或本地功能需要设置与调通。 | 仅比较配置方案；主要目标是系统性产品体验评审。 |
| `knowhow-ops.scenario.tryout` | [试用自研产品](tryout/index.md)：沿真实用户路径发现可用性与功能问题。 | 用户要求像第一次使用的人一样操作自己的产品。 | 只有源码审查；需要正式实现修复但尚无试用任务。 |
| `knowhow-ops.scenario.teach` | [教学交付](teach/index.md)：制作或修订软件操作讲解。 | 新录教程，或已有实操录像需重配音、调整镜头与交付。 | 无软件操作讲解目标的通用剪辑；没有操作依据而准备伪造成功。 |

首次使用可读[分类模型](../ops-model.md)。命中场景后只读对应索引及当前 operation；不能把全部 operation 一次装入上下文。
