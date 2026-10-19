---
capability: workers
operation: bind-custom-domain
status: verified
last_verified: 2026-10-18
---

# 为既有静态报告绑定独立自定义域名

## 目标

为已部署Worker绑定用户授权zone下未占用的独立子域名，保留既有域名映射，并验证文件和实际浏览器阅读、导出。

## 适用状态与前置条件

用户明确指定域名或zone；已有Worker身份、活动版本与可核验静态原件。先确认目标在当前账号的域名映射及占用状态，不覆盖根站、既有服务或冲突DNS。认证由现有Wrangler配置消费；需要API时凭据仅在进程内通过stdin/内存使用，不写文件、参数或日志。

## 设计与执行

1. 读取当前Worker自定义域列表核对zone归属及目标是否占用。zones列表为空不能独立证明zone不存在；本次同一OAuth在账号Worker域名列表中实际可见目标zone。
2. 使用目标Worker的domains changeset预览新origins，只允许预期新增；检查conflicting、removed、updated。任一包含既有对象变更应先复核授权与影响，不执行自动覆盖。
3. 在项目Wrangler routes中增加明确pattern、zone_name和custom_domain:true；用项目锁定CLI的triggers deploy发布域名配置。通过API读回新hostname对应Worker及zone，比较先前域名映射。
4. 核对HTTPS网页、ZIP、报告等资源与本地原件，浏览器按ego-ops验证完整阅读和实际文件下载。DNS或证书未就绪时记录单次观察，不创建自动状态轮询或定时重试。
5. 更新仓库首页、公开部署配置与验证记录，精确提交推送并读回；不要修改已冻结的实验文章或demo。

## 坑与恢复

- 所查Wrangler4.151.1源码在非交互发布Custom Domains时会允许覆盖已有origin/DNS，不能依赖没有确认弹窗来证明安全。先以服务端changeset确认无冲突、移除及更新，再执行；同名目标必须先核对归属。
- 同一URL在curl与浏览器中可能有不同HTML字节。本次域名的自动Web Analytics注入使实际HTML下载增加367字节；仅为本站静态_headers设置public,max-age=0,must-revalidate,no-transform后，重新加载及真实下载恢复原件哈希，页面未请求外部资源。不据此泛化所有统计脚本或所有Cloudflare特性，也不修改整个zone的设置。
- Wrangler部署JSON列表不能假定首项为最新；按created_on选最新部署并核对版本与流量。实际版本确认与文件、浏览器证据分开保存。

## 成功标准

仅预期新子域名绑定至正确Worker，先前域名映射保持；公开关键文件与原件一致；所测桌面、窄屏和真实导出成功并报告最终浏览器状态；仓库入口与配置一致。没有新增业务状态查询、Cron或扫描器。

## 验证证据与边界

2026-10-18：现有OAuth实际读取账号Worker域列表，变更预览仅有一个added，无conflicting/removed/updated。项目triggers deploy成功，新域名读回映射正确，五个先前映射保持。响应头修正部署后，网页、ZIP、报告经HTTPS读回200/哈希一致；浏览器1440×1000阅读材料和评审、真实ZIP下载，以及390×844单栏/章节和实际HTML原字节下载通过，最终截图已报告。

仅使用既有静态Worker与用户明确授权的子域名，没有更改根站、全局代理或其他域名，没有重建状态对象。未做跨地区、长期稳定性、整个Cloudflare平台内部审计；原默认域直连失败仍是历史事实。实际账号、zone、Worker、域名、版本、提交与截图回执保存在本机实例。

来源：2026-10-18官方Custom Domains文档、项目锁定Wrangler help/schema与相关发布源码，以及本次API、HTTP和Ego证据。


2026-10-18既有hostname迁移边界：另一次操作的domains changeset只显示added、既有域modified:false且conflicting为空，实际domains/records PUT仍返回100117“externally managed DNS records，须先删除”。因此changeset不是覆盖现有DNS必然成功的保证；非交互override标志也可能不足。该凭据的Zone DNS/Routes读取403，控制台未加载，旧记录未删除，绑定未完成。本operation的verified仍仅覆盖上述未占用新子域；不能把本次迁移失败刷新为成功，也不能自行扩大OAuth权限。

2026-10-18补充：独立静态画廊绑定用户指定未占用子域，changeset仅新增，API读回目标正确且5个旧映射保持；9文件HTTPS哈希一致，桌面主要交互与390px手机搜索/布局验收通过并报告最终截图。仅triggers配置变更，无新增业务状态查询；实际地址、源码与证据归本机实例。

2026-10-19局部补充：新静态交互站点按用户指定zone绑定独立子域；changeset仅一项added，triggers deploy后API映射正确，七项既有映射保持。新域十个关键文件HTTPS200且SHA-256一致，仓库配置与主页同步并读回提交。本轮只核对域名与HTTP，未执行浏览器阅读或导出，因此不刷新本operation包含浏览器流程的last_verified。具体信息归本机目标档案。
