---
name: web-search-ops
description: >-
  搜索、看热点、发现站内内容与读取公开资料的选路和经验入口：按站点与目标复用官方 API、Feed
  和 Ego OPS 的搜索、热榜、推荐、作者、正文、评论等操作。通用搜索优先 Tavily，浏览器只走 Ego。
---

# Web Search OPS

先判断用户要找什么，再选择该站点最合适的入口。用户问热点可以读热搜、热门或排行榜；已有关键词用搜索；沿作者、合集、话题和评论扩展时使用对应操作，不能把站点所有任务都变成搜索框查询。

## 安装与兼容

安装或配置时读取 [全局前置提示词](references/global-agents-prompt.md)，按已有授权处理；普通使用直接进入下面的路由。旧 `web-search` 是兼容入口，执行逻辑、私有配置和本机记录唯一归本 OPS。

从本轮实际加载位置解析 `OPS_DIR`。本机事实先查 `experience.local.md` 的相关条目；分类与写回规则见 [ops-model.md](references/ops-model.md) 和 [knowledge-schema.md](references/knowledge-schema.md)。

## 按目标选路

1. 明确站点时先读 [站点目录](references/sites/index.md)，只进入命中的站点索引。目录列出目标入口与有限边界；不要先打开搜索框。
2. 站点索引引用 Ego OPS 时，按当前安装目录解析 `ego-ops`，读取其站点索引和选中 operation。**浏览器经验正文唯一归 Ego OPS**，本 OPS 只维护发现入口、目标选择和原生 API 方法。
3. 同一站点可能有热搜词、热门作品、排行榜、主题推荐、作者、合集、讨论等不同入口。按用户目标选少量操作，不要求全部执行；不把推荐排序宣传成热度榜，不把评论抽样当全部舆论。
4. 未指定站点时用 [全网搜索](references/sites/web/operations/search-web.md)。已知普通网页用 [网页读取](references/sites/web/operations/read-web.md)。GitHub 走原生 gh，Product Hunt 新品先官方 Feed，其他官方接口按站点索引执行。
5. 没有现成记录时说明经验缺口，在当前授权内探索并写回；目录无匹配不等于平台没有能力。登录、验证码或控制权交接遵守 Ego，站点私有 HTTP 接口和其他浏览器控制器不作兜底。

## 查询实时能力目录

目录工具只读取知识文件，不打开浏览器，也不执行站点操作。它在查询时读取 Ego OPS 的当前站点索引，因此新增案例无需复制到本 OPS。

```bash
node "$OPS_DIR/scripts/catalog.mjs" sites
node "$OPS_DIR/scripts/catalog.mjs" list --site bilibili
node "$OPS_DIR/scripts/catalog.mjs" list --site douyin --query read-hot-ranking
node "$OPS_DIR/scripts/catalog.mjs" get ego-ops:bilibili/read-hot-search
```

全量盘点时才使用 `sites --counts`；普通任务只读一个站点。`--query` 是文字或 ID 子串过滤，语义选路结合站点索引中的目标菜单。返回稳定来源 ID、摘要、风险、来源登记的验证日期和实际文件位置；只有 `get` 才展开选中正文。日期是历史证据范围，不保证当前页面一定可用。操作名称是检索线索，不构成写操作授权。

## API 与浏览器执行

- 通用搜索：账号池安全配置的 Tavily → 官方 Exa MCP，一次有限回退。当前宿主的内置搜索仍按真实工具列表判断。
- 普通网页阅读：官方 Jina Reader → 官方 Exa 读取；公开 HTTP 只能用于适合的普通资料。抖音、小红书、B站及短链在 helper 中强制进入 Ego。
- 平台正式 API、平台官方 Feed、第三方搜索/读取服务和浏览器是不同来源。原生 CLI 存在不证明它使用官方 API。
- Tavily 密钥沿 `account-pool-ops`，只在进程内取用；不写入环境文件、源码、参数或日志，不轮换其他条目。
- 任何浏览器动作先 `ego-ops → 站点 → operation → ego-browser`。本轮已读且适用的内容复用；任务空间、目标 Page、登录与 Happy 验收由当前 Ego 运行时管理。
- `scripts/ego-channels.mjs` 保留三个站点的关键词卡片读取工具；它不能代替热榜、评论或作者等其他 operation。

现有 CLI 参数与网络配置见 [runtime.md](references/runtime.md)。每个后端对同一请求最多一次，不反复重试耗时路径。

## 结果和自动写回

保留标题、必要摘要、可核对来源和实际内容范围；试用或诊断时注明真实渠道及已有计时证据，没有计时就写未计时。例子见 [try-it.md](references/try-it.md)。

完成、失败或中断均执行：读取 → 当前证据复核 → 执行 → 对照成功标准 → 写回唯一归属 → 同步导航 → 报告。浏览器知识写入 Ego OPS 对应 operation/索引并按其规则校验；原生 API 经验和目标选路修正写入本 OPS。新 Ego 案例由实时目录自动发现，不手抄第二份步骤；机器证据和配置仅留 ignored 本机记录。

当前范围不含淘宝和 LinkedIn，不从通用 Ego 导航重新引入这些已排除渠道。音频转录沿用用户选择的本地服务；搜索和 Show Notes 不等于逐字转录。创建、安装、写全局规则、真实业务验证和 GitHub 分发分别核对，不自行扩大到提交或发布。
