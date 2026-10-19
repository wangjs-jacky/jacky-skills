---
capability: workers
operation: remove-custom-domain
status: verified
last_verified: 2026-10-18
---

# 撤下既有Worker域名并保留执行连接

## 目标

撤下用户指定的单一Custom Domain，保留Worker、状态namespace、其他域名及依赖该入口的执行连接。解绑不代表另一个正式入口已切换。

## 适用状态与前置条件

用户明确要求移除目标入口。通过账号域列表核对唯一hostname、service和记录ID；先确认Agent等连接是否仍依赖它。部署授权不包含删除Worker或数据库。

## 设计与执行

1. 保存原域映射及依赖配置；确认无活动任务，不清空journal。若执行器仍使用该域，先切至同一Worker上已验证的其他认证入口，再确认实际连接。
2. 配置中移除目标route及对应应用origin。只允许执行器访问的默认地址，不应因此自动获得管理员网页权限。
3. 使用项目锁定CLI检查和部署；routes=[]不保证主动清理原Custom Domains，必须读回账号域列表。
4. 如绑定仍存在，以已有列表中的精确ID调用DELETE /accounts/{account_id}/workers/domains/{domain_id}。随后单次GET确认目标消失，其他域保持；不要用整个服务删除替代。
5. 核对状态namespace与本机journal保持、执行器实际重连通过、保留入口可用和撤下入口不再提供应用。结果不明先读回，不重复写入，不添加轮询。

## 坑与恢复

- 成功DELETE可能没有JSON响应体；先按HTTP状态处理，空响应不强行json()。解析异常发生在写操作之后时，须读回确认，不能盲目重删。
- 账号Worker路由GET可读，不代表PUT有权写；曾出现GET200/空而PUT403。Zone读取/写入也分别验证，不按权限名称猜测结果，不扩大全局OAuth范围。
- 移除预览域不能解除另一个域名的外部DNS冲突。保留域名、替换旧DNS映射和保留DNS新增Worker Route是不同动作。

## 成功标准

账号域列表无指定绑定且其他映射保持；Worker及状态namespace保留；原依赖连接通过新地址重连且journal未清空；配置不再重新发布旧入口。仅声明已撤下绑定，不以无DNS读取权限时的HTTP状态冒充DNS记录完整核验。

## 验证证据与边界

2026-10-18：真实执行器先迁至同一Worker默认地址，迁移前云端无活动任务；迁移后及解绑后显式WSS连接均通过，journal数量保持。部署去除应用兼容origin，随后精确DELETE及GET确认绑定消失、其他五个域保持、namespace不变；撤下域HTTP530、保留旧站和Worker默认health200，默认管理员API403。没有新增轮询，也未将另一个域名的正式切换写成成功。未核验全球DNS缓存消退或长期连接稳定性。

来源：项目锁定Wrangler内置Cloudflare SDK的域名删除接口定义与本次真实API/执行连接证据；标识与路径仅保存在本机实例。
