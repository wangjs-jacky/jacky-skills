# 第三方许可、署名与改动说明

本文件是随包携带的许可范围说明，不能将整个包称作MIT。精确commit/路径/摘录范围、原文与摘录SHA及解释归属在[来源catalog](references/sources/catalog.json)，中文入口在[来源索引](references/sources/index.md)。

| 内容 | 原作者/来源与固定commit | 适用许可及包内原件 | 本次改动 |
| --- | --- | --- | --- |
| `references/sources/excerpts/kd-*.txt`；设计/统计指南采用的原则 | K-Dense Inc.；[K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills)；`a1043ef544e3a100c28e70a736b6cf32554d0677` | MIT；[完整版权与许可](licenses/k-dense-MIT.txt)，Copyright (c) 2025 K-Dense Inc. | 原文选段用省略分隔符连接，未改段内字节；中文指导裁剪为技术选型，不带上游脚本/依赖。软件/方法论文引用已在来源索引保留 |
| `references/sources/excerpts/scholar-*.txt`；报告/证据传播指南采用的原则 | Gaorui Zhang；[Galaxy-Dawn/claude-scholar](https://github.com/Galaxy-Dawn/claude-scholar)，codex分支；`b672e80951a2348dd6136316d096603bf2dc5b83` | MIT；[完整版权与许可](licenses/claude-scholar-MIT.txt)，Copyright (c) 2026 Gaorui Zhang | 选择比较单位、主张契约、图解释和叙事段；中文改编取消固定图数/节数/分析文件及Obsidian写回默认 |
| `references/sources/excerpts/squares-experiment-loop.txt`；设计执行指南中失败/记录/真实性准入的改编部分 | **Joshua Levy, the squares project (https://github.com/jlevy/squares)**；`e2e018f32b2627a7d4b38ed95790bee145b1524a`；Copyright (c) 2026 Joshua Levy | 文档为[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)；[原LICENSE全文](licenses/squares-LICENSE.txt)，含免责声明 | 仅选invariant 2、8–13并以中文改编；加入同一真实拒绝通路控制、产品失败/仪器无效区分、条件报告与唯一写回；移除原文其他统计/自治默认。没有复制其代码/第三方例外目录 |

Squares原LICENSE中“代码MIT / 其他CC BY 4.0”的区别及第三方例外保持原文随包；本包所用Squares材料属于文档，保留上述署名、原链接、许可、免责声明和修改说明。相关改编部分按CC BY 4.0条件提供，不主张原作者为本包背书。

本次本地源码交付没有替用户选择新增独立内容的整体公开发布许可证；不以此限制原上游材料已有许可权利，也不将上游MIT与CC BY 4.0混写成一种。第三方原件的SHA随冻结清单核对，分发时保留本说明及对应许可。

## 09新增选段与改编

同一K-Dense固定commit下新增hypothesis-generation两份参考、experimental-design区组/因子两份参考的选段；同一Scholar codex commit下新增Research Question Card、示例Figure Catalog与Common Pitfalls选段。新增原文与摘录SHA、行段、原作者和单一解释归属均在catalog；段内原字节未改，省略处有分隔符。分别沿用上表K-Dense与Gaorui Zhang的MIT版权/许可全文。三份中文方法将预测区分、区组/交互和诊断视图改编为工程选型步骤；不将示例数据冒称本项目实验、不继承强制图数/误差条/质量分或额外依赖。Squares选段和许可未变。来源中提到的外部书籍/论文未在本轮独立阅读，不赋予额外验证身份。
