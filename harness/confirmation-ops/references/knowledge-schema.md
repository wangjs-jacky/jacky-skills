# 知识与自动写回

## 唯一归属

| 文件 | 内容 |
| --- | --- |
| references/scenarios/index.md | 稳定场景、别名、入口 |
| 各场景 index.md | 共用边界、operation 链接 |
| operations/*.md | 判断步骤、成功标准和通用反例；不存个人授权 |
| experience.local.md | 本机个人规则与证据的小型路由 |
| local/rules/<scenario>.md | 个人偏好、持续委托、动作授权和撤销记录 |
| local/evidence/*.md | 脱敏证据定位及局部验证；不复制完整会话 |

事实陈述和真人动作完成回执放证据记录，不转换为选择规则；可引用其在领域 OPS 的唯一归属。

个人规则必须能对应**人作出的选择**。公共示例不是活动规则，不从另一用户/机器自动导入授权。

## 一条个人规则所需信息

```yaml
rule_id: stable-unique-id
scenario: solution-design
operation: choose-approach
state: candidate                 # candidate / active / suspended / revoked / superseded / consumed
kind: preference                 # preference / procedure / action_grant
scope:
  user: current-user
  project: explicit-project-or-any
  task: explicit-task-or-any
trigger: semantic-condition
preconditions: [observable-condition]
choice: semantic-choice-not-option-number
allowed_effects: [explicitly-covered-effect]
exceptions: [protected-condition]
source:
  type: direct-user-choice        # direct-user-choice / standing-delegation / imported-history
  evidence_ref: local-evidence-anchor
  decided_at: original-decision-time
  captured_at: actual-recording-time
reuse_basis: explicit-grant-or-bounded-preference
expires: null                    # null 表示未指定日期，不代表无限授权
supersedes: null
last_applied: null
last_outcome: not-run
last_verified: null
```

字段值必须具体到足够判定，不能把示例中的占位值当作活动规则。多项等价选择可合并证据，但不合并不同影响边界的许可。

## 如何学习，避免再问一次“记住吗”

- 用户明确要求本 Skill 捕获选择：保存每次有价值的人类决定无需追加确认。
- 单次偏好：可形成**原目标与相同影响边界内**的可复用偏好；“只这次”不生成长期规则。是否跨任务、跨项目必须有依据，不能自行扩展。
- 单次执行许可：必须写明具体任务、资源和结束边界，不能用 task:any 与 expires:null 表示“仅本次”。获准的一次动作完成后记 consumed，不用于重复执行；本任务多步许可在约定任务结束后失效。不能因多次回答“是”变成跨任务持续授权。只在用户明确“以后/后续同类都这样”等范围内创建持续 `action_grant`。当前任务本身已授权的动作不因此收窄。
- 明确委托：如“这项任务后续方案按你推荐”，创建任务范围的流程/偏好规则，并保留此前已定目标与例外。
- 导入日志：只提取可见的人类选择及足够的上下文，排除当前会话、嵌入的系统提示、工具输出和模型推理。孤立“可以/继续”、截断问答、仅助手转述属于 candidate；能定位明确历史持续授权时才可按其原范围 active，执行前仍复核。
- 重复同一确认：合并证据，不复制一条规则；自主采用后的成功只更新执行结果，不算第二次用户同意。统计次数可以帮助发现候选习惯，不能作为权限阈值。
- 用户更正：更新/撤销唯一规则，保留必要的替代关系；不能只在旧错误后追加相反结论。对撤销与保留对象的记忆和对“是”的记忆同样重要。

## 状态与日期分开

个人规则的 `state` 表示是否可应用；授权有效不等于执行成功。Operation 的 `status` 为 documented / partial / verified，表示其声明目标的验证证据。

`last_verified` 只记录该规则在所声明边界内完成真实执行并验证结果的时间。结构检查、历史抽取、模拟题、文件写入均不能刷新业务成功日期。历史导入保留原时间；本次读取时间记 `captured_at`。授权规则不得因执行失败自动扩大清理范围。

## 每次完成、失败或中断

1. 对照实际决策和操作结果，判断哪些事实值得保存；未答复不创建活动规则。
2. 写入正确的个人规则或公共 operation，来源使用脱敏摘要与位置，不保留凭据、完整对话、工具参数/返回、推理块或签名链接。
3. 更新采用日期、结果、撤销关系与必要验证日期；没有完整成功不写成功。
4. 同步小型索引；同条件同日无新增可无 diff，不追加流水账。当前安装只读时明确说明未保存并给出补丁/可写唯一源，不悄悄建第二套库。
5. 校验字段、相对链接、隐私与适用边界；报告实际文件和未验证项。

`.gitignore` 必须覆盖 `experience.local.md`、`*.local.*`、`local/`。ignored 不是凭据保险箱。知识保存不执行部署、删资源、发消息或修改其他 Skill。
