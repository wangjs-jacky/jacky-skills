---
capability: workers
operation: bind-worker-route-over-existing-dns
status: verified
last_verified: 2026-10-18
---

# 保留代理DNS并将既有入口切到Worker

## 目标

将用户授权的既有hostname通过精确Worker Route切到已部署服务，保留原DNS、其他路由和持久状态，并验证真实应用。

## 适用状态与前置条件

用户已授权正式入口切换。已明确目标zone、hostname、Worker、原DNS及namespace，目标hostname存在Cloudflare代理DNS。已有Custom Domain的外部DNS冲突不代表必须删除域名；Route是另一种部署方式。

## 设计与执行

1. 记录原DNS的ID、类型、目标与代理状态，保存旧服务和数据回滚材料。读取当前zone路由，确认精确目标没有被其他服务使用。
2. 按实际权限选择CLI/API；CLI读取或写入403与浏览器会话失效分别诊断。需要真实网页时先遵循ego-ops，再用Ego恢复既有登录，不自动扩大OAuth权限。
3. 只创建目标hostname的精确路径模式，例如app.example.com/*，指定既有Worker。通过POST /zones/{zone_id}/workers/routes创建，再单次GET读回；不使用覆盖整个zone的泛化模式。
4. 源码Wrangler同步相同pattern与zone_name。仅更新代码的受限私有配置如果不管理路由，部署后仍须读回已设置Route，不将CLI上传成功当作路由已正确发布。
5. 核对DNS各字段保持、namespace和其他域/路由保持；验证正式页面登录、匿名与跨源拒绝、实际资产、保留历史及本机执行。后续新增旧历史须安全归档，不覆盖新服务数据。
6. 所有观察通过用户动作、事件或单次读回完成；不增加路由、DNS或业务状态轮询。

## 坑与恢复

- Route需要已有代理DNS；DNS-only或无记录不能直接套用。Worker必须实际处理应用路径，不能默认fetch回原站从而仍依赖本机。
- 登录恢复、路由写成功、DNS保持和真实业务成功分别留证。成功登录不自动授予其他资源的写权限。
- 已有路由对象、目标服务或域名归属不唯一时停止，不能根据空的另一种域列表推断可覆盖。
- 回滚为移除本次精确Route并恢复原服务入口；保存原件，不自动删除旧服务或备份。

## 成功标准

精确Route指向预期Worker，原DNS字段及其他映射保持，namespace与历史保留；正式页面通过鉴权和真实执行验证，源码配置与实际拓扑一致。只声明当前测试覆盖的上线完成，不扩展成长期稳定性或完整项目E2E。

## 验证证据与边界

2026-10-18：既有代理CNAME保持原ID/目标/代理状态，精确Route创建和读回成功。原namespace/旧历史保留，旧站新增消息幂等归档，正式登录/API/资产匹配、原生工具exit0、刷新历史及桌面/手机布局通过；其他五个应用域保持。旧服务/数据保留用于回滚，无新增轮询。平台长稳、完整计量和所有后台权限未在本操作中验证。实际标识与截图回执仅存本机应用档案。

来源：[Workers Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)、[Workers路由实践](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)及项目锁定Wrangler schema；官方路由区别与配置于2026-10-18核对，未重核其他套餐/限额数字。
