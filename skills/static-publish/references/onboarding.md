# 首次使用：自己的账号与存储

需要 OSS、没有可用配置、准备创建桶或遇到云端访问失败时读取。普通同站资源准备只需下方配置说明，无需云账号。

用户如何安装和首次使用见[使用说明](../README.md)。没有配置先运行 `doctor.mjs --preflight`；Agent 审阅公开文件后用 `project.mjs init` 生成项目入口，而不是要求用户先理解配置 schema。预检与初始化不安装工具、不登录、不建桶；创建目录应在公开根外。普通网页只需要 site.json，资源配置按需增加。

## 按已有条件继续

| 当前条件 | 操作 | 继续的依据 |
|---|---|---|
| 已有项目配置与可用 Bucket | 复核精确地域、前缀和当前身份，复用 | 对象读写及实际公开访问通过 |
| 知道 Bucket，但身份不能列桶 | 对已知目标测试必要对象权限 | 不把 ListBuckets 失败当作无法上传 |
| 已有账号，无合适 Bucket | 按目标地区和公开性选择一次性创建方案 | 具体建桶授权、地域、访问方式与计费条件明确 |
| 无云账号或服务未激活 | 指明官方注册、认证/激活或权限授予步骤 | 用户完成平台必要动作后继续；不在聊天中索要长期密钥 |
| 不使用 OSS | 采用 same-origin 并沿原页面托管发布 | 本地资源快照及正式页面引用可用 |

先检测已安装工具和现有认证，不通过读取并打印完整认证文件完成“检查”。OSS 首个脚本适配器使用 `aliyun oss`，由 CLI 自己消费现有配置或运行环境中的身份；缺少 CLI/身份时引导用户通过官方工具配置。

后续使用其他官方工具或 SDK 时，先核对当前接口与参数；不要假造等价命令，不静默安装依赖、更换全局账号或自动创建长期密钥。机器、RAM 用户、角色或 CI 可以有不同的凭据来源。

## 什么时候共用桶

同一所有者、地域、公开性、生命周期及权限要求相容时，可以共用一个桶，使用 `project-a/...` 和 `project-b/...`。前缀只是对象路径，权限隔离还需对应 RAM/Bucket Policy；不要声称目录天然隔离权限或费用。

独立所有者、公开与私有材料、不同地域或删除/费用责任明显不同时拆桶。每个人的账号和资源归本人；本 Skill 不把所有使用者引向作者的桶，也不把运营方 AccessKey 分发给使用者。

## 新建桶与公开对象

新建前核对归属和目标，已有适合资源不重复创建。私有默认 ACL 是可用起点；公开图片通过明确选定对象或受限前缀提供只读访问，上传者仍使用签名身份。不要启用 public-read-write。

新桶可能默认启用 BlockPublicAccess，导致公开对象 ACL 被拒绝。分别读取账号级、桶级及目标对象权限。用户已授权公开静态资源和具体目标时，可完成该范围内必要的新桶配置；不能把它扩大成关闭账号级防护、改变旧业务桶或违背组织策略。缺少管理权限时由管理员一次配置，日常身份只需本项目前缀相应对象读写权限。

脚本 `publish` 只上传明确的新对象并核验旧对象，不自动进行上述管理动作。发生既有对象公开访问或内容冲突时停止，不用覆盖/改 ACL 掩盖失败。

无桶的一次性接入按以下顺序，由 Agent 指出当前唯一缺项；账号/组织交互由用户或管理员完成：

1. 先确认同站是否适用；若超过25 MiB或明确要求独立资源分发，再继续OSS方案。检查用户账号内已知可复用桶，不要求日常身份能列举整个账号。
2. 必须新建时，向用户列出具体桶名、地域、存储/冗余选择、私有默认ACL、选定公开对象/前缀及存储/请求/外网流量费用责任。获得此目标授权后，Agent查当前官方创建接口，或用户在OSS控制台创建；不发散为自动购买套餐。
3. 管理员核对账号级/桶级阻断和组织策略，仅配置此次授权的新桶公开路线。日常身份只获得此项目前缀所需对象读写/公开ACL动作；最小策略按当前官方RAM规则核对，不向用户分发作者凭据。不能用关闭账号级防护替代这一步。
4. Agent填写 bucket/region/prefix/publicBaseURL，先doctor --auth，再对一个选定非敏感对象publish并核验匿名GET和浏览器实际用法。NoSuchKey不证明有写权限，403也不自动表示密钥失效。
5. 若默认数据Endpoint不可用、组织不允许公开ACL、缺域名/备案或管理员授权，明确停在哪一步；只有同站满足限制才可切同站。其他公开分发方案先设计和授权，不能假装当前适配器已经覆盖。

## 域名、备案与不同账号

不要承诺所有用户都能照搬老账号的默认域名方式。新开通服务账号、地域及具体数据API的条件应查当前官方公告和账号实际返回，不能只按Bucket创建时间判断。下面的通用域名文档不能单独证明某条历史日期政策今天仍适用于该账号；缺少具体依据时保留“未确认”，不写死未经复核的日期。

内地 Bucket 自定义域名与内地 CDN 有各自备案条件，存储开通本身不等于所有分发路线均可使用。不具备所选路线条件时，可采用同站资源、满足条件的域名路线或境外资源候选，分别测试，不承诺换地域必然更快。

脚本首个 OSS 上传适配器使用该地域默认 Endpoint。它适用于默认数据 Endpoint 可用的账号；如果上传必须经 CNAME，需按官方支持的 CLI/SDK 做具体适配，不能伪称当前 publish 子命令已覆盖。仍可使用 prepare 生成相同对象键、通过合适工具上传，再用 verify 验证公开地址；也可直接使用同站模式。

默认域名返回 `Content-Disposition: attachment` / `x-oss-force-download` 不足以判断 img 嵌入失败。按实际页面 CSP/资源策略和普通 img 的 load/自然尺寸确认。直接打开在线预览、img、fetch/canvas CORS 是不同验收项。

官方资料：

- [访问域名与 Endpoint](https://help.aliyun.com/zh/oss/user-guide/access-oss-via-bucket-domain-name)
- [绑定自定义域名](https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names)
- [阻断公共访问](https://help.aliyun.com/en/oss/user-guide/block-public-access)
- [公开对象 ACL 被拒绝](https://help.aliyun.com/en/oss/user-guide/0016-00000901)

规则以当前官方资料及实际账号读回为准。价格、套餐与流量费用另按地域和账户核对；不把开桶描述为使用免费。

## 配置与依赖

Node.js 22+ 用于资源 helper；OSS publish 增加已认证的阿里云 CLI。截图和具体网页发布工具仅在使用对应能力时需要，不强制所有用户安装浏览器或云 CLI。

- `publicDir`：相对配置文件的公开资源根目录，也可明确指定绝对目录。
- `files`：普通文件的显式相对路径；支持图片、字体、MP4/WebM、ZIP/PDF，不接受隐藏项、路径越界、子路径符号链接或整个工程目录。
- `storage.prefix`：项目独占的、无隐藏/越界片段的小写路径，例如 `project-name` 或 `team/project-name`。
- `storage.publicBaseURL`：OSS 为无凭据、无签名/查询串的 HTTPS 根地址；同站可用 `/assets`。它在追加 prefix/key 前表示资源根，不要再重复填写项目前缀。
- `storage.bucket` / `region`：OSS 模式必需，例如示例名 `example-web-assets` 与 `cn-shanghai`；不要把 `oss-` 加入 region。
- `storage.profile`：可选，仅引用官方 CLI 的已有身份名；不复制身份内容。

同站完整配置：

```json
{
  "version": 1,
  "publicDir": "./public",
  "files": ["covers/card.webp"],
  "storage": {
    "provider": "same-origin",
    "prefix": "my-project",
    "publicBaseURL": "/assets"
  }
}
```

`prepare CONFIG dist/assets` 将写出 `dist/assets/my-project/objects/...` 及同前缀清单；页面部署根为 dist 时，URL 即 `/assets/my-project/objects/...`。输出根目录和 URL 映射要一致。

## 把清单接入网页

已有构建直接消费清单的 `files[].source → publicURL`。没有构建时，Agent可只把选定HTML的URL属性改成 `{{asset:cover.svg}}`，用下面命令生成新HTML：

```bash
node "$SKILL_DIR/scripts/resources.mjs" prepare resources.json dist/assets
node "$SKILL_DIR/scripts/resources.mjs" render dist/assets/my-project/assets-manifest.json index.template.html dist/index.html
```

上面假设prefix为my-project、模板source为cover.svg；实际使用真实清单，不手写示意哈希。render接受明确模板和清单，只替换显式标记并HTML转义，拒绝未知source或覆盖输出；它不理解任意JS/CSS模板，不替换无标记的旧URL。样例见[完整构建](../assets/example/build.mjs)，可对新目录离线执行。

同站构建还应把实际同站依赖加入site.json：清单的key前加实际资源根（上例为assets/），另列HTML/CSS/详情页。OSS分支的内容URL是外站地址，不把OSS对象再列作同站文件。site plan会拦住明显未选引用，但动态JS、内嵌数据srcset、外站资源和嵌套SVG需浏览器核对。

跨域字体、fetch或canvas需要时，管理员在具体授权桶配置必要CORS：匹配真实页面Origin、必要GET/HEAD及实际请求头；再在该Origin验证。普通img解码不自动要求相同CORS设置。不要把全域允许或允许携带凭据作为通用修复；已有业务桶的CORS变更需确认影响。

## 用诊断命令定位下一步

`doctor.mjs` 接受资源配置或页面配置；默认仅检查本地。`--auth` 才会各执行一次官方身份或精确对象请求，结果只输出结论，不回显账号列表、认证日志或凭据。缺 Wrangler 可用 `--wrangler` 指向项目现有官方入口（包含 .js/.mjs 入口时用当前 Node 启动），不改全局 PATH。

无配置预检为 `doctor.mjs --preflight [--oss] [--images] [--wrangler CLI]`，只读取本地工具版本，configChecked/authenticationChecked/cloudWriteChecked均为false；不允许同时--auth。缺配置返回CONFIG_NOT_FOUND及初始化下一步。OSS错误只保留NoSuchBucket、AccessDenied、公开阻断等安全分类，不回显官方原始日志；先按nextStep定位，不自动重试。

- 本地 ready=true 仅表示选定检查通过，不表示登录已查、对象可公开写或页面已部署；同时读取 authenticationChecked/cloudWriteChecked。
- Cloudflare whoami 只验证身份及可选 accountId 匹配，上传 dry-run/实际上传再验证权限。需要登录时在本机执行官方 wrangler login。
- OSS --auth 对第一个选定内容 key 做 stat，NoSuchKey 仅证明精确读路径可到达；写入、对象公开性及实际访问由 publish 完成。已知桶无需列桶或管理权限。
- 不因为缺少 OSS 而自动建桶；同站模式不执行 Aliyun 命令。确需一次性建桶时由 Agent 在具体账号、地域及公开范围授权内使用当前官方工具配置，脚本不调整账号级保护。
- 缺账号或组织权限时列出一项当前必要的人工作业，再继续不依赖它的本地准备。不要在聊天索取 AccessKey，不安装后台服务或更换用户已有身份。

分支最小依赖：资源计划/同站快照只需 Node；图片派生另需 cwebp；OSS 上传另需 Aliyun CLI 自有身份；页面发布另需 Wrangler 自有身份；浏览器验收另需宿主可用浏览器。仓库内图片测试的 fixture 生成用 ffmpeg，它是测试依赖，不是使用 Skill 的依赖。
