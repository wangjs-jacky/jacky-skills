# 来源、许可与初始证据边界

本目录保存方法出处与必要原文身份；运行时只为具体主张追溯，**不默认加载所有摘录**。中文版指南是裁剪/改编及本项目缺口推导，不是上游全文翻译或效果证明。精确文件、commit、行段、SHA、改编落点和元数据在[catalog.json](catalog.json)；版权和许可见[第三方说明](../../THIRD_PARTY_NOTICES.md)。

## 实际采用的固定上游

| 来源与固定身份 | 采用内容/唯一解释归属 | 精确摘录与许可 |
| --- | --- | --- |
| K-Dense-AI/scientific-agent-skills，`a1043ef544e3a100c28e70a736b6cf32554d0677`；experimental-design 1.5、statistical-analysis 2.0 | 事前问题/单位/变量/控制/重复、依赖与估计对象、统计完整性；[设计执行](../methods/design-and-execution.md)与[统计](../methods/statistics.md) | [设计摘录](excerpts/kd-experimental-design.txt)、[统计摘录](excerpts/kd-statistical-analysis.txt)；[MIT原件](../../licenses/k-dense-MIT.txt)，Copyright (c) 2025 K-Dense Inc. |
| Galaxy-Dawn/claude-scholar，明确使用`codex`分支`b672e80951a2348dd6136316d096603bf2dc5b83`；results-analysis 0.2.0、results-report 0.1.0 | 比较单位、证据→允许主张→报告、实际图及其解释；[报告](../methods/reporting.md) | [分析摘录](excerpts/scholar-results-analysis.txt)、[报告摘录](excerpts/scholar-results-report.txt)、[证据传播原件](excerpts/scholar-evidence-propagation.txt)；[MIT原件](../../licenses/claude-scholar-MIT.txt)，Copyright (c) 2026 Gaorui Zhang |
| jlevy/squares，`e2e018f32b2627a7d4b38ed95790bee145b1524a`；experiment-loop无语义版本 | invariant 2及8–13：失败留存、稳定身份、源头记录、真实性、注释更正、仪器、skip；[设计执行](../methods/design-and-execution.md)相关段 | [摘录](excerpts/squares-experiment-loop.txt)；文档为[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，[原LICENSE](../../licenses/squares-LICENSE.txt)；署名 **Joshua Levy, the squares project (https://github.com/jlevy/squares)** |

Squares原库代码MIT，文档/数据/图等CC BY 4.0；本包采用的是文档，不把它笼统标MIT。没有复制原库第三方例外目录、代码工具或完整campaign资产。K-Dense/Scholar携带原MIT版权全文。所有摘录内容保持原段字节，省略边界与哈希算法见catalog；摘录不包含完整上游运行依赖，不作为额外执行入口。

Squares摘录中fdu/metabrowser的数字和例子是上游作者的说明，本包没有捕获或复现其外部floating-main实现，不把这些例子当本项目独立验证证据。

采用规模与维护沿用2026-10-16T15:25:27.285529Z查询快照：K-Dense 51,194 stars、Scholar 5,806、Squares 39；最近push分别为10-15 23:57:39Z、09-23 07:23:56Z、10-16 14:04:56Z，均非fork/未归档。它们是仓库级历史元数据，当前版本、组件维护响应及单Skill采用率未由本轮联网复核；stars不作为效果指标。完整元数据保存在catalog。

### K-Dense方法引用

Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). *Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents*. https://doi.org/10.48550/arXiv.2609.00065 。本包因实质采用方法保留这条软件/方法引用；来自固定原文及原项目已保存元数据，本轮未联网刷新论文记录/版本，也未独立重审其全部引用文献。以后正式引用且可联网时按[arXiv原记录](https://arxiv.org/abs/2609.00065)核当前作者/发表信息，不拼接猜测版本后缀；论文引用不能证明候选效果。

## 从项目已观察RED导出的指导

下列是2026-10-17对四份旧原版运行的04事实核验、05报告预检和06采用范围形成的摘要，**不是新 Skill 的业务验证**。对应三份决策/核验文档SHA在catalog，原始产物未随可分享包携带，只有持有者ignored实例映射能定位；离线使用者不能仅凭摘要复核旧页面/库运行字节。

| 观察ID/定位 | 已观察的有界缺口 | 指导归属 |
| --- | --- | --- |
| V1 / Q-V1-01、02、05、06 | 任务名比文本/所测Dialog路径宽；关闭/焦点缺单列读回；截图定位、工具适配范围需明确 | [文档首页operation](../task-types/visual-design/operations/compare-docs-homepages.md) |
| V2 / Q-V2-03、04、05 | 图题viewport与client对象混用；单例/术语、最终版和修订范围需解释 | 同一视觉operation及[报告指南](../methods/reporting.md) |
| L1 / Q-L1-01–04、06、07 | 91记录/88种JSON；issue/路径/配置混称；负控未过真实gate；范围重叠解释过强；遗漏收尾、来源未随匿名包交付 | [配置校验operation](../task-types/function-library/operations/compare-node-config-validation.md)、[设计执行](../methods/design-and-execution.md)及[统计](../methods/statistics.md)各自相应方法 |
| L2 / Q-L2-01–07 | 别名只查局部、产品解释未决；部署前提缺失；几何比/百分比分母、issue/路径、机制因果及复算范围需收窄 | 同一配置operation、[统计](../methods/statistics.md)及[报告指南](../methods/reporting.md) |
| 用户确认/06 | 按任务类型积累；动画要可播放案例；文章/视频/案例同时提炼设计与表达 | [分类模型](../ops-model.md)、[动画指导](../task-types/animation/index.md)、[资料提炼](../methods/materials.md) |

以上初始导入知识为documented；后来的08部分实测不回填为这一阶段已验证。旧案例中的正确性、有限页面通过或库选择不能转移成新operation的verified，旧内层赢家也不指定外层框架或未来候选赢家。初始阶段没有本项目动画运行或新资料入库证据；动画业务仍未测，资料入库与实际复用须分别判断。

## 明确没有继承的上游默认

未要求安装A的四个Skill或其统计栈，未带入B整套campaign/softschema/fleet、队列/自治runner、外部floating-main实现；未采用固定n、范围重叠无效应、诊断p值自动换检验、统一图数/十节/一页、自动Obsidian写回/提交/发布。选择依据是用户目标与已观察缺口，不是上游整体质量排名。

create-ops和官方skill-creator用于创建本包，writing-skills用于按既有RED组织指导；运行资源已放在包内，不依赖创建工具的安装位置。目录内没有其本机绝对链接或整库副本。


## 新Skill的局部执行来源

C-VISUAL-20261017：实现0.1.0、知识0.1.0-initial冻结快照的公开文档首页同题运行。实际过程、成功范围、宿主恢复、300秒超时与未知统一解释在[文档首页operation](../task-types/visual-design/operations/compare-docs-homepages.md)的局部证据节。它与上文旧原版观察来源分开，不将本轮局部结果推广为普遍效果。原始计划、页面、JSON、截图及精确模型客户端记录仍归任务证据；私有定位由持有者ignored映射维护。这是原补丁交出时的历史说明。08最终已有三路核验与一次修订复验，但仍有轻微阅读卡点、初版协调读取顺序偏离及大量未测边界，真人反馈未知；完整可采纳范围已合并进该operation。

C-LIBRARY / task08-C-library：同一0.1.0业务快照的固定版本配置校验接入，证据和行动细化统一归[配置校验operation](../task-types/function-library/operations/compare-node-config-validation.md)。task08-final-acceptance记录最终可采纳范围；task08-library-timing-revision01标明历史单调值invalid/null，task08-visual-revision01限定上缘定位和后补稳定帧。三份残留轻微卡点、原协调顺序偏离、两视觉子CLI超时与真人未知不因合并消失。这些来源只支持两个operation的partial；原报告/补丁/修订/冻结及其SHA映射保留在ignored本机实例，未随共享包携带。

## 09从已保存公开原文提炼的互补方法

本轮没有用户额外视频、没有联网新采集；实际读取01保存的下列固定原文段落。它们是资料提炼，全部documented、last_verified=null；原文/摘录SHA、git blob、URL、commit、节名与行段见[catalog](catalog.json)。原文保存的身份核对不等于方法实测，stars不参与升级。

| 方法与可检索问题 | 读取的固定来源与段落 | 唯一解释正文 |
| --- | --- | --- |
| 选题、替代解释、反证、无定论出口 | K-Dense `a1043ef…`：hypothesis_quality_criteria的Feasibility、Testability/Falsifiability/Discriminability及Prediction-level review；experimental_design_patterns的Design starts from the prediction、Within-unit/crossover。Scholar codex `b672e809…`：Research Question Card | [从选题到比较](../methods/question-to-contrast.md)；[假说选段](excerpts/kd-hypothesis-quality.txt)、[设计链选段](excerpts/kd-discriminating-tests.txt)、[问题卡选段](excerpts/scholar-question-card.txt) |
| 批次混杂、区组、顺序、因素交互 | K-Dense同commit：randomization_and_blocking的Blocking/Batch effects/Documentation；factorial_and_doe的Why factorial/Full factorial/Fractional/Resolution | [区组与条件交互](../methods/blocking-and-interactions.md)；[区组选段](excerpts/kd-randomization-blocking.txt)、[因子选段](excerpts/kd-factorial-doe.txt) |
| 汇总掩盖波动、分条件反向、过程暂态、图表论证 | Scholar codex同commit：example-figure-catalog的Main comparison/Convergence dynamics；common-pitfalls的单位、均值与报告陷阱 | [诊断视图](../methods/diagnostic-figures.md)；[图目录选段](excerpts/scholar-figure-catalog.txt)、[陷阱选段](excerpts/scholar-analysis-pitfalls.txt) |

中文步骤是本项目的工程适配，原意与推导在各正文分开；不把说明例的训练结果当本项目证据。新增摘录仍分别携带现有K-Dense/Scholar MIT许可；未复制它们的脚本、运行栈或研究数据。原文提到的书籍、论文、NIST/FDA/CONSORT及可视化资源没有在本轮独立阅读；保留原有方法引用不表示论文已读或效果已证。所有在线URL仅用固定commit定位，未联网刷新当前版本或链接可达性。

09本次只证明来源字节可追溯、材料已入唯一知识根和静态检索路径可达；尚未实跑这些新步骤、验证图表表达效果、真人理解或新场景迁移。
