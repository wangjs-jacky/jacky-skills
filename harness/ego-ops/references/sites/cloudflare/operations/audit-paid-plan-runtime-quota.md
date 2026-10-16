---
site: cloudflare
operation: audit-paid-plan-runtime-quota
title: 只读核对付费套餐与运行时配额
risk: low
last_verified: 2026-10-02
---

## 目标
确认账单订阅、当前Workers计划与生产运行时配额错误是否一致；此操作只产生诊断结论，不证明故障已恢复。

## 前置条件与授权
用户授权排查其生产服务及付费恢复问题。使用Ego独立任务空间，保留用户已接管的付款窗口，不修改计费、取消状态、支付方式或部署。

## 入口
账户Manage account → Billing → Subscriptions；Compute → Workers plans；Workers & Pages → 目标Worker → Observability。

## 已验证步骤
1. 在订阅表定位Workers Paid，读取状态和本期结束日期；Ending不能独自证明运行时访问正常。
2. 同一账户Workers plans核对Paid列的Current plan。
3. 在已授权Dashboard同源GET账户subscriptions与Workers account-settings，仅保留计划、状态、账期及usage model。
4. 读取目标Worker设置及当前deployment，只保留数据库绑定名称、类名、当前版本与提交；不得输出密钥值或私人身份信息。
5. 在Observability的Events搜索框输入带引号的配额异常短语，提交后等待结果更新，读取付费后的事件时间、原始错误与异常调用堆栈。
6. 在Durable Objects总览核对当前账期、SQL读量和超额费用；进入已经核实的生产namespace，选择Data Studio。按部署代码确认现有对象名称，在下拉框输入后必须选择实际候选，确认Explore启用；不要创建测试对象代替生产对象验证。
7. Explore旁的外链图标不保证弹窗；操作后核对当前受管标签和真实URL，实时确认对象身份。只执行SELECT name FROM sqlite_schema WHERE type = 'table' LIMIT 1，等待结果表及Rows Read显示；不打开认证数据表内容、不导出用户数据、不执行写SQL。

## 检查点
所有核对对象必须属于同一生产账户。日志中的free tier错误原文与界面Paid属于两个独立证据，不能据此自行断言套餐传播、取消续费或旧实例缓存是根因。公共匿名认证绕过数据库时，其200不能证明私有数据库已恢复。只读控制台查询成功与业务恢复时间相邻不能证明前者修复了后者；业务路径须另用新授权会话验证。

## 成功标准
可以按时间顺序出具经验证的套餐、生产绑定、部署及错误位置；已有付费与错误并存时，明确记录矛盾和未知根因，不将调查成功写成服务恢复。

## 失败模式与恢复
日志查询更新会重新创建事件行；引用失效时重新观察当前结果再选择同一事件。Observability导航自动落到events子页，截图前必须核对已记录任务空间、精确目标和包含查询参数的实际预期URL；校验失败则停止该次截图，不上传替代图。对象选择框仅输入文本时Explore可能仍禁用；从当前实际候选列表选中对象后核对身份，再执行查询。此流程未验证任何付费配额异常的恢复方法。

## 验证证据
真实页面核对了Paid Current plan、订阅Paid、生产Standard模式，并在付费后的生产错误事件中核对到数据库初始化堆栈及免费档读额度异常。同一生产对象的只读schema查询返回一行且Rows Read为1，已观察到真实查询成功；同期私有API恢复由独立CLI探针验证，具体恢复机制仍未证明。独立编号的原图、标注和会话绑定回执保存于项目验收文档；可分享知识不保存账户标识、版本标识、个人信息或完整业务响应。
