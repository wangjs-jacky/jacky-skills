---
name: web-search
description: >-
  搜索与读取网络资料：优先使用有文档的官方 API、公开官方 Feed 和当前可用搜索工具，
  通用搜索优先安全配置的 Tavily，GitHub 优先原生 gh；抖音、小红书、B站等网页只走 Ego。
  支持 Product Hunt 官方 Feed、公开文档读取，以及 /web-search setup 能力盘点与有限验证。
---

# Web Search 工具决策

从本轮实际加载的 `SKILL.md` 解析目录，记作 `SKILL_DIR`；不能假设宿主提供 `CLAUDE_SKILL_DIR`。存在 `experience.local.md` 时仅读取当前问题相关记录；当前用户范围和真实能力优先于旧经验。

## 路由

| 用户目标 | 首选路径 | 补充或失败路径 |
|----------|----------|----------------|
| 通用搜索 | 已安全配置的 Tavily | 当前实际可用的内置搜索；官方 Exa MCP HTTP 保底 |
| GitHub 仓库、源码、Issue、PR 等 | 原生 `gh` / 官方 REST | 明确失败事实后选择公开文档读取或 Ego |
| Product Hunt 产品发现 | 官方公开 Atom Feed | 已有授权 Token 时可按官方 GraphQL 文档查询；网页交给 Ego |
| 公开普通文档、文章 | 原站公开 HTTP/官方文档格式 | 官方 Jina Reader；需要浏览器时进入 Ego |
| V2EX | 官方已文档化 API/官方 RSS，按实际需求选择 | 网页交给 Ego |
| 抖音、小红书、B站 | **直接 Ego 浏览器** | 当前页面内观察与提取；不回退站内私有接口或原生采集 CLI |
| 其他需要登录、渲染、点击、截图的网页 | **直接 Ego 浏览器** | 报告登录/验证/内容缺口，按 Ego 控制权规则处理 |

当前范围不包含 LinkedIn。雪球网页可走 Ego；腾讯报价/smartbox、雪球私有 API 等未经确认的内部端点不能宣传成稳定官方 API 集成。

每次先查当前会话真实工具列表。内置搜索会随宿主/会话变化，不能把某轮缺失推广到后续轮次，也不能虚构 `WebSearch`、`WebFetch` 或其他函数。CLI 存在、凭据可用、联网成功、取得目标内容分别验证。

## 通用搜索与公开 HTTP

Tavily 是用户偏好的通用搜索主路径；先遵循 `account-pool-ops` 查已有条目。无可用条目时明确记为未配置，使用当前已有搜索能力或 Exa；不要求在聊天粘贴 Key、不反复注册提示。

```bash
node "$SKILL_DIR/scripts/web-search.mjs" search '搜索关键词' --limit 5 --timeout 20
node "$SKILL_DIR/scripts/web-search.mjs" read 'https://example.com' --timeout 20
node "$SKILL_DIR/scripts/web-search.mjs" feed producthunt --limit 5 --timeout 20
```

helper 的 `search` 直接调用 Tavily 官方 API，未配置或返回不可用结果时单次回退到官方 Exa MCP HTTP；宿主内置搜索由 Agent 按实际能力另行选择。`read` 使用官方 Jina Reader，失败后单次回退到官方 Exa `web_fetch_exa`，仅用于公开普通文档；抖音、小红书、B站等站点仍按上表进入 Ego。`feed producthunt` 直接读取官方 Atom，不借搜索引擎替代产品列表。

Product Hunt 的 `rank` 仅表示本次 Feed 条目顺序，日期按 Feed 原字段保留；不能据此声称实时榜单、关键词 API 或完整历史列表。官方 GraphQL 需要 Token，当前是否配置以账号池为准。

工具返回错误、坏 JSON、空正文、登录/验证页或无来源的结果均不算成功。一个后端对同一请求最多一次，不轮询、不重复请求耗时路径。结果保留可核对来源；搜索摘要不能当作完整正文或全部评论。

具体官方接口、有限请求、配置、凭据与测试方法见 [runtime.md](references/runtime.md)。

## GitHub 必须先 gh

任务明确涉及 GitHub URL、仓库、源码、PR、Issue、Release 或 Actions 时先用原生 `gh`，优先官方 REST、Contents/Git Trees API 及结构化命令；需要完整仓库时按任务临时 clone。不得先抓 GitHub HTML、调用通用搜索代替一手源码，也不依赖浏览器采集框架。

```bash
node "$SKILL_DIR/scripts/web-search.mjs" gh --timeout 20 -- repo view owner/repo --json name,url,description
```

helper 仍调用原生 gh；只有已经验证的信任库覆盖冲突才启用该命令的本地 CA 修复。读取任务不扩大到评论、推送或其他外部写操作。

## 浏览器统一走 Ego

任何浏览器打开、读取、点击、填写、截图、测试、调试，**先加载 `ego-ops`，按站点索引 → 当前站点 → operation 渐进读取，再加载当前登记路径的 `ego-browser` 并遵循 `ego-browser skill`**。

使用运行时提供的当前任务空间、目标 Page 和 Happy 验收/捕获上下文；同一目标复用同一任务空间和页面。不在本 Skill 中启动浏览器、选择 profile、创建旁路任务空间或导出 Cookie。用户接管、验证码或登录需求按 Ego 规则暂停/交接。

抖音、小红书、B站的具体搜索 URL、就绪条件、DOM 提取与调用示例见 [site-routes.md](references/site-routes.md)。`scripts/ego-channels.mjs` 只操作调用者交入的现有 Ego Page；捕获、报告、任务空间生命周期与收尾仍由本轮运行时负责。默认提取少量真实渲染结果，避免全页转储、固定 sleep 和多余标签页。

禁止绕过这条边界使用其他浏览器控制器、浏览器采集框架或站内未公开 API。AgentReach、OpenCLI、DDGS 不属于本 Skill 的运行时依赖或默认降级链；历史安装与证据保留在被忽略的本机档案，不代表当前路由。

## 试用与验收

用户要求试用、测试条目或检查搜索是否生效时，读 [try-it.md](references/try-it.md)，按目标提供可直接发送的自然语言指令。默认少量结果，每项附标题、简短说明和来源链接；测试结果最后注明**实际渠道和本次耗时**，缺少计时证据就明确未计时。Tavily 回退 Exa、Feed 列表、网页内搜索分别说明，不把兜底成功当作指定渠道成功。凭据现状按账号池复核，不从历史“未配置”记录推断当前状态。

## setup 与经验维护

`/web-search setup` 先做被动能力和账号池元数据盘点，再按当前需求做少量公开只读验证：

```bash
node "$SKILL_DIR/scripts/web-search.mjs" doctor
```

不要自动安装、更新工具、注册账号、修改全局代理/CA 或批量测试全部站点。平台密钥只通过 `account-pool-ops` 安全后端取用；不进入 shell 参数、明文本地配置、启动文件或日志。已获同范围授权直接继续，确有缺项需用户决定才进入 `confirmation-ops`。

本机事实继续保存在被忽略的 `experience.local.md`，大段证据链接至同 Skill 的 `local/`。保留历史并注明失效范围，不把旧路线当作当前可用性。浏览器知识唯一归 `ego-ops`；每次成功、失败或中断按其规则写回，不能凭单元测试刷新真实站点成功日期。最终交付提供结论、来源和未取得内容；修复或环境排障任务再说明必要工具细节。
