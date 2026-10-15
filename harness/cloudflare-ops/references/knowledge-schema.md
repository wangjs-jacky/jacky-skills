# 知识格式与验证状态

新增或写回知识时读取。文件采用 Markdown，frontmatter 仅提供路由和校验需要的字段。`capability`、`operation` 使用稳定的 kebab-case，不含账户、应用或环境名。

## 能力档案

路径：`references/capabilities/<capability>/index.md`。

```yaml
---
capability: durable-objects
updated: 2026-10-14
docs_checked: 2026-10-14
---
```

- `updated`：内容实际变更日期。
- `docs_checked`：实际核对官方文档日期；尚未核对用 `null` 并标出待核实项。
- 必须包含：能力与边界、限制与额度、操作目录、已知坑、资料来源。
- 每条额度写清套餐、后端/调用条件、作用域、单位、周期和超限行为；未知写未知，不搬用相近产品数字。
- 每条事实应能关联官方来源和适用日期；请求/CPU/时长/容量/行数分别计量。只核对一项时在该项标日期，不能把整表日期刷新成已经全部复核。
- 能力路由表链接本档案；操作目录的 `operation/status/last_verified/reference` 与文件一致，未验证日期显示 `—`。目录附简短场景描述即可，不复制步骤。

## Operation

路径：`references/capabilities/<capability>/operations/<operation>.md`。

```yaml
---
capability: durable-objects
operation: design-stateful-service
status: documented
last_verified: null
---
```

正文必须包含：目标、适用状态与前置条件、设计与执行、坑与恢复、成功标准、验证证据与边界。成功标准对应该操作自身目标，不能用另一个较小目标的证据代替。

| status | 含义 | last_verified |
| --- | --- | --- |
| documented | 官方资料或设计指引，未完成真实场景验证 | `null` |
| partial | 有部分运行证据，仍存在未完成或未核实的成功条件 | `null`；已验证部分的日期写正文 |
| verified | 声明的目标和全部成功标准有实际执行证据 | 真实验证日期 |

这里的状态是知识可信程度，与任务的 pending/running/done 无关。来源核对不等于业务验证，本地证据不等于生产读回。诊断 operation 可以在诊断完成后成为 verified，整改 operation 仍可为 partial。

运行证据注明日期、环境类别、观察方式、结果与边界。不要在公共文件链接私有证据；可写“实例证据保存在本机记录”，私有实例反向引用公共知识即可。历史案例未重新执行时沿用原日期，不填写今天。

## 应用实例与隐私

`experience.local.md` 只作本机小型索引。具体实例写入 ignored 的 `local/applications/<app>.md`：

- 当前核对日期、应用/环境/脚本/namespace 映射，以及真实配置来源。
- 使用的 capability 和 operation 链接，不复制平台限额或共享操作步骤。
- 部署/运行状态、代码与证据位置、已验证结果和未完成问题。
- 真实账户、地址、绝对路径与版本 ID 仅保存在本机；凭据、原始业务数据、签名 URL 任何位置都不记录。

缺失本机实例时不阻断能力知识读取；需要操作应用时依据当前配置重新定位。被忽略不等于可以保存秘密。

## 写回与校验

更新正确的唯一来源，再同步相应索引。事实已失效时修正文案并说明原因，不能仅追加新结论；有价值的旧证据保留在本机历史记录。不要凭“看起来解决了”升级 status。

运行 `node <skill-root>/scripts/validate-knowledge.mjs`。它静态检查路径归属、状态日期、索引映射、相对链接和明显私有标识；不访问 Cloudflare，不刷新日期、不自动更改状态，也不检查实际代码是否轮询。隐私仍需人工核对，尤其是专有域名和账户标识。
