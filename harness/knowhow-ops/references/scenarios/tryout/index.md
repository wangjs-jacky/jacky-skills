---
id: knowhow-ops.scenario.tryout
title: 试用自研产品
summary: 以用户日常入口和具体目标走查自研软件，记录可复现障碍与已验证结果。
scenario: tryout
use_when:
  - 用户希望 AI 像真实用户或第一次使用者一样使用自己开发的产品。
  - 需要观察入口发现、理解、操作、反馈和完成过程中的问题。
avoid_when:
  - 只有静态源码审查或已明确的代码实现任务。
  - 只有视觉美化要求，没有实际使用任务。
---

# 试用自研产品

以可完成的使用目标开始，允许经过真实困惑、回退和恢复。不能用开发者知道的隐藏入口、直接改数据或后台 API 绕过界面后宣称普通用户已走通。

| ID | operation 与用途 | use_when | avoid_when |
| --- | --- | --- | --- |
| `knowhow-ops.tryout.first-user-walkthrough` | [首次用户路径走查](operations/first-user-walkthrough.md)：完成一个目标并记录真实障碍。 | 要评价自研软件的可发现性、反馈与任务完成体验。 | 只有技术健康检查；需要绕过普通入口才能得到结果却不披露。 |

试用结果与修复结果分开。用户已授权的实现工作可交回开发流程，但发现问题不自动授权发布或修改正式数据。收尾遵循[知识规范](../../knowledge-schema.md)。
