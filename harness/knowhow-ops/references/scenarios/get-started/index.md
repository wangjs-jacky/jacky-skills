---
id: knowhow-ops.scenario.get-started
title: 上手工具
summary: 从陌生工具的当前入口开始，围绕一个实际目标学习并操作，交付可验证结果。
scenario: get-started
use_when:
  - 用户没有精力研究复杂工具，希望 AI 代为摸索并实际完成任务。
  - 工具的功能、入口或使用路径尚不熟悉，需要边探索边验证。
avoid_when:
  - 只要求搜索介绍、比较产品或解释术语。
  - 目标已经明确且只有软件或插件配置变更，应进入 configure。
---

# 上手工具

以用户要办成的事组织探索，不把功能清单、官方教程摘要或接口连通当交付结果。网页优先依 `ego-ops` → `ego-browser`，确有桌面障碍时再加入当前可用桌面能力。

| ID | operation 与用途 | use_when | avoid_when |
| --- | --- | --- | --- |
| `knowhow-ops.get-started.complete-task` | [探索并完成实际任务](operations/complete-task.md)：在工具中做出一个可检查结果。 | 初次接触工具，需把目标转成实际操作并完成。 | 只有资料研究或概念说明；没有实际使用目标。 |

制作讲解时附加[教学场景](../teach/index.md)，不复制主任务的操作事实。任务收尾遵循[知识规范](../../knowledge-schema.md)。
