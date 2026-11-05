---
capability: oss
operation: provision-public-assets-bucket
status: verified
last_verified: 2026-11-03
---

# 创建可复用资源桶并验证选定公开图片

## 目标

为同一所有者的多个静态网页建立可复用的资源存储，按项目前缀组织，验证选定公开图片可被目标页面使用；不把建桶、上传或 HTTP 200 当作性能改善。

## 适用状态与前置条件

用户已明确授权新建资源桶及为公开资源配置必要访问方式。复用现有安全凭据源；不打印或把密钥作为命令参数。核对目标地域、名称归属、公开/私有资料及现有桶是否适合复用，不能以每个项目都建桶作为固定步骤。用量按账号规则计量，套餐购买另依实际授权。

## 设计与执行

1. 默认在同一所有者、地域与资源公开性一致的项目间复用一个桶，使用项目前缀。前缀不自动提供权限隔离；不同用户默认各自账号/桶，托管多租户另需服务端身份与受限上传授权。
2. 已有桶可直接核验已知目标，不要求日常上传身份拥有账号列桶或建桶权限。新桶使用明确地域/endpoint；Standard/LRS 与私有 ACL 是可按需求调整的起点。不得改已有业务桶来代替新资源桶配置。
3. 读回新桶 ACL 与桶级/账号级 BlockPublicAccess。新桶阻断公开 ACL 时，公开资源路线可在已有具体授权下只配置这个新桶；保留私有默认 ACL，只有明确发布对象为 public-read，不启用公开写入。若账号级阻断或组织策略不允许，不擅自扩大为账号级变更。
4. 上传自制、无敏感信息的小图片探针，明确 MIME 和缓存；无签名 HTTPS GET 核对状态、字节、哈希及强制下载头，匿名列表应按设计拒绝。
5. 真实浏览器从目标站点 origin 以普通 img/Image 验证 load 和预期自然尺寸；浏览器操作交由 Ego，截图及经验按 Ego OPS。直接打开、img、CORS fetch/canvas 分别验收。
6. 生成资源清单，正式资源先发布并验证，再切页面引用；只测探针时不得声称生产资源已迁移。保存配置与证据时排除凭据和签名 URL。

## 坑与恢复

- 0016-00000901 / Put public object acl is not allowed 可由新桶 BlockPublicAccess=true 引起；先读回真实配置，不把它当作 AK 失效，不无条件关闭账号级阻断。
- 旧 aliyun oss 内嵌工具可能没有新版 public-access-block 子命令。使用已安装新版官方 CLI/SDK 或官方签名 API；不凭空编造命令，不为此输出密钥或修改全局身份。
- OSS 可覆盖上传时指定的 inline，实际返回 attachment 与 x-oss-force-download。已观察到这种响应下普通 Image 仍可解码；不以响应头单独推断 img 失败，不把这一成功推广为全部账号/地区或 CORS 功能。
- 2025-03-20 起新开通服务账号的内地默认公网数据 API 限制与 Bucket 创建时间不是同一条件。对新用户重新检测；默认域名不满足时提供符合其域名条件的路线或同站资源模式。

## 成功标准

新桶归属、地域、存储和 ACL 已读回；必要公开对象配置限定于授权目标，匿名对象读取/类型/哈希与浏览器解码通过；桶列表按设计拒绝。现有桶、账号级配置和站点部署是否变化明确记录。该成功只覆盖资源准备和图片访问，不涵盖生产迁移、真实画质、性能或计费预算。

## 验证证据与边界

2026-11-03：既有老账号下新建上海 Standard/LRS 私有桶；新桶 BlockPublicAccess=true 导致公开对象上传 403，读回账号级为 false，仅调整新桶后公开只读探针上传成功。38 字节 WebP 匿名 GET 200、类型与哈希正确，匿名桶列表 403；实际网页 origin 内 Image 加载为预期 2×2。未改旧桶、账号级配置、DNS、CDN、传输加速或网站；未迁移生产资源、购买套餐或核验用户地区性能。具体桶名/账号事实及证据归所属 Goal First 目标。

官方来源（2026-11-03）：[Block Public Access](https://help.aliyun.com/en/oss/user-guide/block-public-access)、[0016-00000901](https://help.aliyun.com/en/oss/user-guide/0016-00000901)、[PutBucketPublicAccessBlock](https://help.aliyun.com/en/oss/developer-reference/block-public-access-at-the-bucket-level/)、[默认域名与访问](https://help.aliyun.com/zh/oss/user-guide/access-oss-via-bucket-domain-name)。
