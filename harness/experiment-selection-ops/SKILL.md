---
name: experiment-selection-ops
description: "Use when a technical choice needs a comparative experiment, including visual designs, animations, functions or libraries; when the decision report lacks traceable evidence; or when articles, videos and cases should inform such experiments. 适用于技术选型、对比实验与方法积累，不用于只查API或只制作单一成品。"
---

# 选型实验 OPS

以**任务类型 → 场景/比较目标 operations**积累方法。工具、库、模型都是候选。帮助形成有直接证据的条件建议，允许无定论；一次案例的赢家不等于实验框架的赢家。

安装/配置时先读[可选全局前置提示词](references/global-agents-prompt.md)。普通使用直接开始；保存提示词不会修改全局规则。

## 开始与路由

1. 从本 Skill 实际目录确认唯一知识根。历史只读快照只用于指定测试，写回遵循[知识协议](references/knowledge-schema.md)，不能成为第二个当前库。
2. 读[类型索引](references/task-types/index.md)，只加载命中类型的档案和目标 operation。分类不清或准备改变分类轴时再读[分类模型](references/ops-model.md)。没有经验就按当前条件设计，明确尚未验证。
3. 复核当前用户目标、授权、版本、工具、环境、预算与旧经验适用范围。模型与 effort 记录本次请求及可取得的有效字段，不固定未来型号。只读调研与真实运行分别说明。

## 每轮闭环

- **读方法、复核、设计执行**：按[设计与真实执行](references/methods/design-and-execution.md)，在取结果前留下问题、候选、案例、变量、判断及停止条件；小实验可以把短计划放同一文件，不必拆成多个研发任务。
- **检查与解释**：按类型取得可打开/可播放/可运行的相应产物，保留失败、缺失与偏离。有连续数据推断需求才读[统计方法](references/methods/statistics.md)。
- **报告**：用[报告指南](references/methods/reporting.md)串起必要过程、数字、解释与条件建议；关键错误阻断依赖它的主张。图表、文字和案例按决策需要选用，无统一图数、总分或篇幅。
- **写回、更新索引、交付**：每次完成、失败或中断都按[知识协议](references/knowledge-schema.md)判断并执行；报告实际写回位置或未保存原因。自动沉淀是 Agent 工作协议，不是后台服务或宿主钩子。

资料输入是文章、视频/转录或优秀案例时，读[方法提炼](references/methods/materials.md)；同时提取选题、比较过程、变量、测试办法与呈现，不只摘取写作风格。

## 证据与执行边界

0.1.0初始知识来自固定上游与旧原版观察。08实际用0.1.0取得两类同题局部证据，随后一次修订和受影响项复验结束；09已合并两份知识补丁的最终可采纳内容，两个operation为partial，仍无完整成功日期。历史单调总耗时invalid、初版协调读取顺序偏离、两视觉子CLI超时、残留轻微卡点与未测/真人未知均保留。0.1.1时钟修订仅有受影响项检查；09在0.1.2 / 0.1.2-evidence合并后，又从01实际保存原文新增三项documented共享方法及薄路由，当时最终为0.2.0 / 0.2.0-methods，该阶段未重跑业务。任务10随后实际使用该0.2版本完成CSV场景；三初判冻结后的直接证据支持三共享方法在这个场景的局部应用。现合入CSV operation、路由和相关边界，实现仍为0.3.0，知识现为0.3.1-final-evidence；保持partial且无成功日期。新operation不是原0.2读取内容。2026-10-17三路fresh独立受影响项复验结束：数据角色实际从新入口检索CSV并有限应用，核对移动离线安装、正常/缺worker同出口和共享源身份；逻辑与可读性角色支持受影响说明，未代验数据。0.3未作业务整轮，跨类型、方法因果优势及真人理解仍未知。本次最终变化只有证据/日期/阶段事实，无新增步骤或路由。[版本说明](version.json)与[来源索引](references/sources/index.md)保留阶段范围；来源摘录不是额外Skill入口，任务完成不改变知识等级。

使用宿主已授权的执行工具。网页操作遵守其治理与执行技能；环境要求 Ego 时先读 ego-ops 再用 ego-browser。缺失工具则披露相应未验项。专业领域约束仍由其权威规则负责，本 Skill 不复制工具手册或扩大安装、发布、付费与外部写入权限。

真人偏好和理解只能由真人反馈。按需的独立多 Agent 初判先各自冻结，再查直接证据协调，不能多数票抵消关键事实错误；没有独立审阅时如实说明。

调用例：用本 Skill 比较同一文档首页的两种设计方法，交付真实页面、中性评看入口与条件建议，并回写这类比较经验。此例不自动启动实验。
