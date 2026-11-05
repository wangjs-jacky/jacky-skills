---
name: self-learning-hyperframes
description: 作为 self-learning 的 HyperFrames 产出能力，自主学习本地教学音视频或公开视频链接，把教程讲授的方法、可观察动效和屏幕代码转成有证据、可恢复、可渲染的 HyperFrames Demo，并记录实际使用的内容、Skills、工具与可复用经验。仅在 self-learning 调用，或用户明确要求从教学素材制作 HyperFrames Demo 时使用；普通学习任务不要单独触发。
---

# Self Learning · HyperFrames

把自己当作会看、会验证、会复盘的学习者。忠实复现教程教授的因果机制与时间关系，不追求逐像素复制，也不要把“看起来像”当成学会。

## 边界

- 用于完成“摄取教程 → 提取方法与动效 → 构建 Demo → 真实渲染评审 → 沉淀经验”的完整任务。
- 若用户只要下载、字幕、素材整理或通用视频剪辑，直接路由对应能力，不建立完整学习 run。
- 不复制 ASR、抽帧、素材管理或 HyperFrames 实现能力；探测并调用当前环境已有的 Skills 与工具。
- HyperFrames 创作、环境故障与兼容性诊断按官方 Skills 和当前运行证据处理；机器专属经验保存在 ignored 本机记录，不写回共享工作流。

## Reference 地图

只在对应时刻读取，避免把全部细节一起装入上下文：

| Reference | 何时完整读取 |
|---|---|
| [workflow.json](references/workflow.json) | 建立、恢复或推进 run 前；它是 12 阶段与失效传播的机器事实 |
| [contracts.md](references/contracts.md) | 写任何 run artifact、receipt、证据引用或最终指针前 |
| [extraction-protocol.md](references/extraction-protocol.md) | 执行 `ingest` 到 `observe_motion`，或提取证据不足需要回退时 |
| [capabilities.json](references/capabilities.json) | 选择能力、执行 probe 或首选能力失败时 |
| [rubric.json](references/rubric.json) | `verify` 开始前，以及 R1、R2 评分前 |
| [learning-loop.md](references/learning-loop.md) | Phase 0 选择旧经验，以及 Review、反馈或 finalize 后沉淀本轮学习时 |

## Phase 0：模式与本地上下文

1. 完整读取存在的 `experience.local.md`；把 `runtime.local.json` 仅作为可能过期的提示。
2. Phase 0 只查长期 index；`preflight` 完成后按 learning loop 最多选择 1–3 条直接相关经验，并始终写 `memory-selection.json`。无命中也写空 selection，但不创建空长期 `local/`。
3. 用户明确授权无人值守或批量执行时进入自动模式，持续选择范围内最安全、可逆的下一步；否则使用协作模式，只询问会改变 Demo 数量、核心方法或公开素材边界的决定。
4. 确认目标是 Git 仓库，且 `.learning/runs/`、`.learning.lock` 和本 Skill 的 `/local/` 私有层不会进入 Git。

## 建立或恢复 run

- 新任务先用 `scripts/init_run.py start` 建立私有 run，再摄取来源；规划完成前不要占 Demo 编号。
- 恢复任务先用 `scripts/validate_run.py --apply-invalidation` 校验 hash 链。只跳过仍匹配真实源媒体、当前 workflow、直接上游、schema 与实际输出 hash 的阶段。
- 任一来源、证据、源码、fixture、日志、观看材料或成片漂移时，从首个不可信阶段向下失效；不要凭记忆续跑。

## 12 阶段

严格按 workflow 推进，不静默跳过失败：

| 阶段 | 核心动作 | 主要交付 |
|---|---|---|
| `preflight` | 确认授权、范围、模式、能力面与私有边界 | `preflight.json` |
| `ingest` | 取得可读媒体并绑定真实媒体字节 | `ingest.json` |
| `transcript` | 提取并复核时间码字幕 | `transcript.json` |
| `learn_method` | 分层提炼教程事实、代码事实与实现推断 | `method-spec.json` |
| `observe_motion` | 粗采、密采、观看并建立动效证据 | `motion-spec.json` |
| `plan_demo` | 决定 Demo 数量、机制边界、slug 与素材策略 | `asset-plan.json` |
| `build` | 原子绑定编号并调用 HyperFrames 能力实现 | Demo 源码 + draft MP4 |
| `verify` | 修完全部机械 must-pass | `verification.json` |
| `review_r1` | 独立完整观看 draft，只选一个最大问题 | `score-r1.json` |
| `revise` | 只修 `top_fix.dimension`，冻结其余维度 | `revision.json` + 新 MP4 |
| `review_r2` | 用新证据独立复评并硬停止 | `score-r2.json` |
| `finalize` | 绑定唯一 final、更新索引并沉淀学习 | `final.json` |

## 全局不变量

- **事实**：每条结论绑定真实 source ID、媒体 hash、时间范围以及实际 cue、帧或代码证据；占位字符串不能算证据。
- **分层**：保持 `tutorial_fact`、`visual_observation`、`code_fact` 与 `implementation_inference` 独立；本地设计选择不冒充教程事实。
- **证据**：字幕不能替代视觉观察；均匀接触表不能替代关键段密集证据；实现结果不能反向证明来源。
- **可恢复**：每阶段 artifact 绑定当前输出、直接上游、schema、workflow 与相关源码/fixture/回执 hash。
- **能力**：只对当前输入适用的候选执行无副作用 probe；probe 不下载、不安装、不改写环境。
- **素材**：原媒体、完整字幕、私人照片和绝对路径只留在私有 run；公开 Demo 自带原创或明确授权 fixture，并能在 clean checkout 中 check/render。
- **编号**：`plan_demo` 后才用 `bind-demo` 原子分配；不手猜编号，不用锁文件是否存在推断锁状态。
- **留痕**：只记录本轮实际读取的内容、调用的 Skills/工具、版本、回执与产物 hash；不能由模型自报使用事实。

## Must-pass 与两轮停止

1. `verify` 先完成 rubric 中所有 must-pass；失败项必须先修，无法修复则 `blocked`，不消耗 R1/R2。
2. R1 与 R2 都审阅真实完整 MP4，并使用各自实际解码、framemd5、全片 watch sheets、关键段密集帧带与时间码问题记录。
3. R1 只输出一个可修的 `top_fix`。`revise` 只改同一维度并生成不同 MP4 hash。
4. R2 不复用 R1 观看结论；完成后把 `top_fix` 设为 `null` 并硬停止，不开启第三轮。
5. final 必须指向 R2 审阅的同一 hash。must-pass 全绿但总分低于 80 时使用 `completed_with_residuals`，不隐藏残余。

## 何时 blocked

仅在以下条件停止并写明可验证理由：

- 来源未授权、不可读，或目标范围需要用户作实质选择；
- 当前阶段所有适用能力候选都真实失败；
- 隐私或公开素材边界无法满足；
- 机械 must-pass 经修复仍无法通过。

风格小选择、已有安全默认值或低风险可逆步骤不是 blocked 理由。

## 学习沉淀与收尾

- 新 `workflow 1.1.0` run 以 `required=true`、`state=collecting`、`contract_version=1.0.0`、`selection=null`、`sidecars={}` 初始化；preflight 后 selection 必须指向 `memory-selection.json`（无命中也写空选择），且所有 descriptor 的 `{path, sha256}` 都由 validator 重算。
- 每个 completed stage/workflow capability 都记录真实 content/Skill/tool event，或明确 `missing|degraded|not_recorded` coverage；无执行不能静默缺席，模型自报 hash/receipt 不能算证据。
- Finalize 按 `skill-usage-manifest` → `usage-ledger` → `retrospective` → 原子 `state=frozen` 的唯一顺序落盘。之后 Review/用户反馈只新增 feedback candidate；不得改写 retrospective、R2、final、manifest、ledger 或重新渲染。
- `workflow 1.0.0` 默认继续有效；显式 `backfill` 只从旧 run 已保存事实幂等生成 `state=backfilled` sidecars，未知 Skill/tool 写 `not_recorded`，不用当前环境补造，且除 sidecars/`run.json.extensions` 外旧文件和 final hash 不变。
- 机器路径、私有偏好和单机经验只进被忽略的 local memory；跨案例验证的通用规则才进入共享 Skill reference；未验证想法留在 backlog。
- 更新 Demo 索引后只暂存精确目标文件，分别用 `scripts/audit_staged.py` 审计 Skill 与 Demo 仓库的 Git index；空暂存集必须失败。
- 最终用 `scripts/validate_run.py --ffprobe on` 验证唯一成片，并报告 Demo 路径、final hash、测试/check/render、R2 分数、账本状态与残余。
