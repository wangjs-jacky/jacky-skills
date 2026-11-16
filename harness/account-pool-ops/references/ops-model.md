# 分类与操作范围

## 已确认分类

- 状态：已确认。
- 依据：2026-11-16用户明确要求账号池以平台为主键，示例“minmax → 密钥”，后续交由Agent管理同类凭据；不复制原始Key到决策记录。
- 服务范围：平台API密钥的安全保管、引用、只读鉴权与轮换记录。
- 主键：platform；路由为references/platforms/。
- 同一供应商的别名归同一平台；minmax/MiniMax/minimaxi归minimax。账号、区域、环境和模型权限是条目属性，不另建分类树。
- 当前真实平台只有MiniMax，不预建虚构账号。未来用户提供其他平台API密钥时按同一规则增加实际条目。

## 首批操作

| platform | operation | 目标 |
| --- | --- | --- |
| minimax | [register-key](platforms/minimax/operations/register-key.md) | 安全入库与读回核对 |
| minimax | [verify-key](platforms/minimax/operations/verify-key.md) | 只读鉴权并保存区域结果 |
| minimax | [verify-model](platforms/minimax/operations/verify-model.md) | 在明确单次预算内验证真实模型生成及产物，分别记录API与文件差异 |
| minimax | [use-and-rotate](platforms/minimax/operations/use-and-rotate.md) | 内存中取用及按明确要求切换默认 |

primary是首次条目；key-随机标识是后续条目。同平台可有多Key，新增不覆盖旧项、不自动切默认或故障轮换。

## 扩展与授权

当前分类下新平台、别名、真实Key与同类操作自动维护；改变主键、拆并归属或扩大到密码/Cookie/交易凭据前确认。创建Skill、保管Key和修改全局指令是不同授权范围；安装时按global-agents-prompt.md展示准确规则与目标，再复核用户明确决定。本机授权与加载结果仅留在被忽略的私有记录，不能随Skill分发成为其他用户、设备或任务的许可。跨机复制及付费生成仍须符合具体任务授权。

共享事实归平台档案，目标经验归operation，本机引用与验证结果归local；文档、部分执行、完整成功分别标记，迁入日期不冒充验证日期。
