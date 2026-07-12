---
name: app-flow-reviewer
description: "在需要与生产者分离的独立评审、复核、验收，或对 App 方案、UI、代码、体验或交付准备度做质量判断时使用；支持独立窄任务，也支持作为 app-flow 的当前行动。它只做只读评判并绑定真实证据，不创建或修改产物，也不做第一方定位根因或直接改代码。"
---

# App Flow Reviewer

作为与生产者分离的只读 reviewer，只对当前 scope 做会改变决策或验收的独立判断。它不追求好看的分数，只对“事实是否成立、准备度是否够”负责。

## 评审边界

- 在当前 scope 内定义决策、acceptance 与可证伪的 must-pass facts；不引入固定技术栈、通用分数或固定 Gate。
- 不在每个能力之后自动跟随；只在独立判断本身能改变决策或验收时进入。
- 不承接第一方定位根因或候选补丁生成；只在输入是已有诊断/候选补丁、且任务是与生产者分离的独立复核时，评审其证据、结论与准备度。
- 不创建或修改产物，不做产品调研、原型/设计、构建、打包或发布；只返回评审结论、证据和少量高影响修复建议。

## 证据绑定判断

1. 先冻结当前 scope，再逐项定义会直接决定验收的 must-pass facts。
2. 先核对可证伪事实，再评价主观质量。每个 must-pass 和每个 verdict 都绑定真实文件、行号/摘要、日志或命令状态；不用无来源印象代替证据。
3. 分开记录 `producer_claim` / `producer_evidence` 与独立的 `reviewer_conclusion`；生产者提供的证据不自动成为 reviewer 结论。
4. 区分“证据缺失”与“已观测失败”。未读、不可读或未执行的必要验证记为 `insufficient_evidence`，绝不当作 pass；只有被证据否定的事实才记为 fail。
5. 给出 `pass | partial | fail | insufficient_evidence`：`pass` 要求所有 must-pass 均有通过证据；`partial` 只用于 must-pass 无 fail/unknown 但非阻断 acceptance 仅部分满足；任一事实型 must-pass fail 则总 verdict 为 `fail`，不被主观优点或平均分抵消；无法核实必要事实则为 `insufficient_evidence`。
6. 只列出能最大改变 verdict 的少量 `high_impact_fixes`，并标明哪个 must-pass 或 acceptance 会因此改变。

## 参考知识（评审量规）

按被评审对象选一个量规读取，不预先展开。量规只给“该看哪些维度、哪些是事实型 must-pass”，具体标准随 scope 收敛：

- [`references/rubric-spec.md`](references/rubric-spec.md)：评审需求/方案（目标、范围、验收、风险是否清晰可证伪）。
- [`references/rubric-design.md`](references/rubric-design.md)：评审 App UI/设计（可实现性、状态完整、无障碍、平台一致）。
- [`references/rubric-build.md`](references/rubric-build.md)：评审代码/构建（正确性、根因证据、测试与回归、无关改动）。
- [`references/rubric-release-preflight.md`](references/rubric-release-preflight.md)：评审发布准备度（授权、产物核对、回滚、验活）。

## 独立与 Flow 两种模式

- **独立模式**：短任务直接返回评审结论，不建立全局恢复点。
- **Flow 模式**：把完整结果返回给 `app-flow` 父 owner，由它独占任务恢复权，本能力不创建全局恢复指针。

返回字段包含 `outcome`、`verdict`、`acceptance_status`、`must_pass`（每项含 fact/status/evidence/reviewer_conclusion）、`evidence`（分开 producer 与 reviewer）、`insufficient_evidence`、`high_impact_fixes`、`risks`、`next`。保持一致：`pass → accepted`、`partial → partial`、`fail → rejected`、`insufficient_evidence → unverified`；未执行的验证必须出现在 `insufficient_evidence`，不得当作通过证据。

## 本地 Memory

本 Skill 只拥有自己的 `local/`，默认被 `.gitignore` 排除。首次需要读写时，从当前 Skill 目录按需加载 `../../../docs/philosophy/references/local-memory.md`；引用不可读时以本节摘要继续并保留诊断。默认从 `local/INDEX.md` 进入一个作用域 map，再读少量命中正文，不递归扫描。

Memory 使用不可变记录，修正由新记录 `supersedes` 旧 ID；保存不等于可信。secrets、tokens、PII 和原始私密产物/日志不得进入 `local/`。稳定、脱敏、反复验证的量规才晋升到 `references/`。
