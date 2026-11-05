# 分类与范围

本文件是分类标准的唯一归属；运行步骤归 operation，共用方法归 methods。

## 已确认决策

- 服务范围：技术选型的比较实验、证据报告与持续方法积累。
- 主键：`task_type`；目录为 `references/task-types/`。其下 operation 表示可复用场景/比较目标，而非点击动作、工具 API 或一轮 run。
- 确认依据：用户于2026-10-16明确要求“主 key 按任务类型，例如视觉稿、动画”，函数/库使用相应场景产物，并在完整目标复述后确认“准确，按这个目标继续整理任务”。任务07继续沿用该分类，未重新征求确认。
- 工具、Skill、模型、库、候选版本是实例条件；不建同层候选目录。文件名用稳定 kebab-case。

| task_type | 名称与别名 | 首批内容与唯一入口 |
| --- | --- | --- |
| visual-design | 视觉稿、UI稿、页面设计比较 | [类型档案](task-types/visual-design/index.md)；文档首页比较 operation |
| function-library | 函数/库、API实现、校验库比较 | [类型档案](task-types/function-library/index.md)；Node配置校验比较 operation |
| animation | 动画、motion、动效比较 | [类型档案](task-types/animation/index.md)；有播放/采样方法指导，尚无本项目实跑场景 operation |

表中内容有实际指导；不预建其他类型或空 operations。多产物任务按所要作的主要决定选一个归属，引用其他类型的条件，不生成类型×候选×环境组合目录。

## 归类与扩展

同一用户目标、成功标准与授权边界相同，沿用 operation；版本/机器不同写条件。成功标准或决定明显不同才拆 operation。已有标准内的真实经验、同类 operation 和别名可自动补充。新增内容必须有可复用指导，尚无实测可以 documented，不能填成功日期。

改变分类轴、拆并/重命名已有归属或扩大服务范围时再确认。新案例本身不触发全库重构；本项目十项研发任务也不是日后每个小实验的固定流程。

## 唯一归属

| 内容 | 唯一位置 |
| --- | --- |
| 分类标准与扩展策略 | 本文件 |
| 类型共用产物/约束、operation导航 | 对应类型 index |
| 场景步骤、成功标准、适用/不适用与证据边界 | 对应 operation |
| 跨类型的设计、统计、报告、资料提炼 | 对应 methods 文档，类型引用它 |
| 原文身份/许可/摘录 | sources目录及包内许可；解释只保留在相应方法/operation |
| 私有机器路径、原始证据位置映射 | ignored `experience.local.md` 与 `local/` |

知识使用 `evidence_level: documented / partial / verified`，不使用任务调度状态。只有当前声明的目标全部成功标准确实完成，才写 `last_verified`。详见[知识协议](knowledge-schema.md)。源码/链接核对日期不等于业务成功日期。

当前安装根默认是唯一当前知识根；冻结测试副本不是可写知识库。读取权限、执行能力和全局触发沿用实际宿主，不依赖 create-ops 或其他上游 Skill 的本机安装位置。
