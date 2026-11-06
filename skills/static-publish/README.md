# Static Publish：把自己的静态网页发布出去

适合使用 Codex、Claude Code 等有文件与终端能力的 Agent 发布静态网页。页面入口在 Cloudflare；选定的大图片、字体、媒体和下载文件可放进**你自己的 OSS**。普通小站先用同站资源即可，别为首次发布多开一个云服务。

你提供网页目录、公开范围和发布授权，Agent 做配置、检查、构建和官方 CLI 操作。账号注册、交互登录、组织权限及付费决定由你完成；账号、资源与账单始终归你。这个文件夹不是独立桌面 App，也不提供运营方统一账号托管。

## 1. 安装或直接使用文件夹

没有安装过也可以对 Agent 说：

> 从我给的 static-publish 文件夹读取 SKILL.md，为这个网页完成本地发布准备。先告诉我缺哪一步，不安装工具、不登录、不发布。

希望以后用 `$static-publish` 自动发现时，安装**完整文件夹**，保留 scripts、references、assets 和 agents：

| 宿主 | 项目内安装 | 用户级安装 |
|---|---|---|
| Codex | `.agents/skills/static-publish/` | `~/.agents/skills/static-publish/` |
| Claude Code | `.claude/skills/static-publish/` | `~/.claude/skills/static-publish/` |

这是当前官方说明的本地发现目录，见 [Codex Skills](https://developers.openai.com/codex/skills/) 和[安装目录对照](https://developers.openai.com/api/reference/cli#use-the-cli-from-a-coding-agent)。已有安装器或隔离宿主可能管理其他入口（例如 CODEX_HOME 下的 skills）；先核对已有路径，不重复装同名副本、不覆盖已有目录或链接。安装后确认宿主实际列出该 Skill；没有发现时按宿主说明重载或开启新会话。

拿到整个 jacky-skills 仓库时也可按根 README 使用 `./install.sh --skill static-publish`，无需安装全部 Skills。本 Skill 不依赖作者的 OPS、目录或账号；所在宿主自己的治理规则继续适用。

## 2. 第一次需要什么

| 需要的能力 | 何时需要 | 缺少时谁做什么 |
|---|---|---|
| [Node.js 22+](https://nodejs.org/en/download) | 所有本地工具 | 你授权 Agent 按系统安装；先核对 `node --version`，无 Node 时本包无法自行运行。 |
| [官方 Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) | Cloudflare 页面发布 | Agent 在项目内安装并锁定版本，或用你已有入口，不改全局 PATH。安装需要你的授权。 |
| 自己的 Cloudflare 账号和部署权限 | 获得正式 URL | 你完成注册、必要验证及本机 OAuth 登录；Agent 单次核对目标身份。首次还可能需要设置 workers.dev 子域。 |
| Aliyun CLI、自己的 OSS 服务/身份/可用桶 | 仅选择 OSS | 按[接入条件](references/onboarding.md)复用已有桶。无桶先评估同站，确有需要才单独授权一次初始化。 |
| [cwebp](https://developers.google.com/speed/webp/download) | 仅图片减重 | 按系统安装官方 WebP 工具；上传现有图片不需要它。 |
| 浏览器 | 交互登录、实际图片解码和网页功能验收 | 使用你可用的浏览器；Agent 自动控制时遵循宿主规则。仅字节核验不能宣称页面交互已通过。 |

普通发布不需要 ffmpeg、Python、j-skills 或作者其他 Skill。ffmpeg 仅用于仓库图片测试；Python/PyYAML 是仓库审计依赖。npm 仅在选择 npm 安装 Wrangler 时需要，本地 helper 没有 npm 包依赖。

平台范围：Node 工具使用标准库，目前真实本地实证在 macOS。下面终端示例使用 Bash/zsh；Linux 和原生 Windows 的完整安装/云发布未实测，不保证照抄所有 Shell 命令可用。Windows 可先使用已具备 Node/CLI 的 WSL 环境；若用原生环境，Agent 应适配路径，并通过 `--wrangler` 指向项目的官方 `.js` 入口。不能把这种建议当作 Windows 已验收。

## 3. 最短路径：先准备同站小网页

最简单的请求是：

> 使用 $static-publish 发布这个静态网页。先检查公开文件和已有工具，使用我自己的 Cloudflare 账号；没有必要就不用 OSS。缺少安装或登录条件时，只告诉我当前需要完成的一步。

Agent 从真实安装路径解析 `SKILL_DIR`。下面命令逐条执行、逐条检查结果；不原样复制未知占位值。

先做无配置预检：

```bash
node "$SKILL_DIR/scripts/doctor.mjs" --preflight
```

它只检查本地 Node/Wrangler 版本，不查身份、不建配置、不安装工具。需要 OSS 才加 `--oss`；需要图片派生才加 `--images`。输出 `ready=false` 时看 `nextStep`。没有配置也能先知道缺什么。

例如你的 `public/` 已有入口、CSS、封面和详情页，可生成位于公开根之外的 `.publish/`：

```bash
node "$SKILL_DIR/scripts/project.mjs" init .publish --public-dir ./public --name my-static-page --file index.html --file style.css --file cover.svg --file detail.html
node "$SKILL_DIR/scripts/site.mjs" plan .publish/site.json
node "$SKILL_DIR/scripts/site.mjs" prepare .publish/site.json .publish/releases/release-001
node "$SKILL_DIR/scripts/site.mjs" check .publish/releases/release-001
```

`--name` 是你确认的候选 Worker 名称，不是系统自动分配的安全目标；Agent 上线前还必须确认归属和是否已存在。`--file` 只列经过审阅的公开文件，必需文件逐个加入；不会递归公开工程。已有目录不覆盖，缺引用会报错，不自动把未知文件加入公开集合。

`.publish/index.md` 是该项目的管理入口，`site.json` 是页面配置的唯一来源；云配置和证据都留在公开根外。已有正式项目不重复 init，继续使用原配置。

想先演练时，让 Agent 把本包 [assets/example/public](assets/example/public) 复制到一个**新的本地演练目录**，按上述4文件准备快照；别覆盖你的网页。这份完整小站无需外部资源和图片编码器。

也有可直接运行的[完整构建例子](assets/example/build.mjs)，演示资源清单→HTML占位符→配置→快照：`node "$SKILL_DIR/assets/example/build.mjs" NEW_DEMO_DIR`。目标目录必须不存在；整个过程只用 Node，不调用云 CLI，不产生线上 URL。它是示例构建，不是任意网页转换器。

## 4. 完成账号接入，再首次上线

本地快照通过后，才补实际缺少的云条件：

1. Agent 核对可用 Wrangler；需要安装时，经授权在网页工程根目录安装并锁定版本，例如 `npm install --save-dev --save-exact wrangler@4.151.1`。该版本是首版实证版本，使用其他版本先核对官方帮助；不运行裸 npx 临时下载未知版本。
2. 你使用自己的 Cloudflare 账号，在本机通过官方 Wrangler `login` 完成交互授权；已有正确身份则跳过。不要把 Token 发到聊天。Wrangler 未设置子域时，首发会提示配置 workers.dev；自定义域名不是普通同站首发的必需条件。
3. Agent 用真实 CLI 入口执行一次 `whoami`，核对账号和精确 Worker。认证、权限或网络失败不能当作“目标不存在”。
4. 按[发布流程](references/release.md)分流：确认不存在的新目标首次 `deploy` 会直接上线；已有目标使用候选上传、基线复核、激活、活动版本读回。不要用新快照生成器覆盖已有业务 Worker 的绑定、路由或安全头。
5. 验收完整文件、活动版本和浏览器功能，再保存本地回执。脚本本身不代你操作云控制接口。

比如项目有本地 Wrangler 时，配置后的只读身份检查可使用：

```bash
node "$SKILL_DIR/scripts/doctor.mjs" .publish/site.json --auth --wrangler ./node_modules/wrangler/bin/wrangler.js
```

登录成功、首发命令成功、字节通过、浏览器通过分别报告。没有首版旧版本时，不能承诺回退。

## 5. 什么时候再用 OSS

文件较大、需要独立资源分发，或你明确选择 OSS 时再接入。Cloudflare Static Assets 每文件最多25 MiB；默认按免费档连同生成的 `_headers` 最多20,000文件检查。已确认 Workers 付费档时可设置 `worker.plan: "paid"`，上限100,000文件；这个字段不会开通或购买服务。

OSS 选定资源通过清单得到内容哈希 URL；HTML 入口、目录和需要同源 DOM 的 iframe 文档留在 Cloudflare。前缀用于组织项目，权限隔离还需 RAM/Bucket Policy。OSS 不等于已开 CDN，也不保证国内加速。

完整接入、CNAME-only、公开访问/备案条件见[接入条件](references/onboarding.md)。静态图片 GET 成功不证明跨域字体、fetch/canvas 可用；应另验必要 CORS。配置中的公开 URL 不会改变上传 Endpoint。

只想接入选定封面时，可以在 HTML 模板的 URL 属性中使用 `{{asset:cover.svg}}`，再通过 `resources render` 消费清单，详见[清单接入例子](references/onboarding.md#把清单接入网页)。工具不会自动重写任意网页。

## 6. 日常管理、失败和升级

查看项目本地历史：

```bash
node "$SKILL_DIR/scripts/project.mjs" status .publish
```

这个命令不查云；历史记录不保证目标现在仍是该活动版本。更新沿用配置，生成新的 release；激活前单次读回真实基线。保存回执与按旧版回退的具体步骤见[发布与回退](references/release.md#保存项目发布回执)。回退只切完整旧版本，不删除共享桶或其他前缀。

| 看到的结果 | 当前下一步 |
|---|---|
| `CONFIG_NOT_FOUND` | 初次运行 project init；已有项目核对实际配置。 |
| `MISSING_REFERENCE` | 修正引用，或把确认可公开的依赖加入 files，再 plan。动态 JS/外站仍需浏览器。 |
| `STATIC_SIZE_LIMIT` / `STATIC_FILE_LIMIT` | 调整资源分流或公开集合；超25 MiB不能强行同站发布。 |
| `NoSuchBucket` | 核对桶名/地域；无桶可选同站或单独授权初始化。 |
| `AccessDenied` / `PUBLIC_ACCESS_BLOCKED` | 核对 Endpoint 和组织/对象权限；不关闭账号防护来绕过。 |
| 上传/核验中途失败 | 读取 verified/failed/notAttempted；保留旧页面。修复后明确重跑，正确旧对象会核验复用；不自动循环重试。 |
| `EEXIST` | 换新输出名；不覆盖快照、HTML输出或回执。 |

升级只替换本 Skill 的共享文件，先保留旧包并核对安装入口；用户的 `.publish/`、源网页、快照和云身份不放在 Skill 内，不随升级覆盖。现有配置仍使用 version=1；本次新增检查可能揭示旧清单漏引用，按提示修正再发布。已有同源链接直接读取更新后的源码；独立复制安装则需显式更新，不能只改源码就声称另一台机器已升级。

所有脚本都没有业务状态轮询、后台扫描或自动建桶。只完成本地准备时，会明确保留“尚未发布”的状态。
