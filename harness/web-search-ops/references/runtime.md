# 有文档的 HTTP 与官方 Feed

需要执行通用搜索、公开文档读取、Product Hunt Feed，或排查环境时读取。helper 使用 Node.js 标准库与原生 `fetch`，不依赖采集框架；Python 仅桥接已有账号池的 macOS Keychain 后端。

## 接口依据

| 路径 | 已公开的接口与文档 | 边界 |
|------|--------------------|------|
| Tavily Search | `POST https://api.tavily.com/search`；[官方文档](https://docs.tavily.com/documentation/api-reference/endpoint/search) | Bearer Key；query、max_results、basic 搜索；账号池未配置时不发送未授权请求 |
| Exa MCP | `https://mcp.exa.ai/mcp` 的 `web_search_exa` / `web_fetch_exa`；[官方文档](https://docs.exa.ai/reference/exa-mcp) | 官方托管 MCP，经普通 HTTP 调用，不经过 AgentReach；仍可能限流 |
| Jina Reader | `https://r.jina.ai/` 加公开 URL；[官方文档](https://jina.ai/reader/) | 公开普通文档，不传私有页面、凭据或登录 URL；不能证明全文完整 |
| Product Hunt Feed | `https://www.producthunt.com/feed` | 官方公开 Atom，返回顺序仅为 Feed 顺序，不是实时排名 API |
| Product Hunt GraphQL | `https://api.producthunt.com/v2/api/graphql`；[官方文档](https://api.producthunt.com/v2/docs) | 需要授权 Token；本 helper 没有虚构无鉴权的关键词接口 |
| GitHub | 原生 gh 与 [官方 REST](https://docs.github.com/en/rest) | 优先一手结构化内容，读取与写操作授权分别处理 |
| V2EX | [官方 API 说明](https://www.v2ex.com/p/7v9TEc53)及官方 RSS | 可按文档单次请求；本 helper 未封装全部 API |

平台原生官方 API、第三方有文档的公共读取服务、普通公开文档 HTTP 和 Ego 浏览器是不同路径。平台网页内部 JSON、签名/WBI 接口、腾讯 smartbox/报价或雪球私有端点不能仅因可请求就视作稳定开发者 API。

## CLI

将 `OPS_DIR` 设置为本次真实加载的 Skill 目录，安装入口为符号链接也可运行：

```bash
node "$OPS_DIR/scripts/web-search.mjs" search '搜索关键词' --limit 5 --timeout 20
node "$OPS_DIR/scripts/web-search.mjs" read 'https://example.com' --timeout 20
node "$OPS_DIR/scripts/web-search.mjs" feed producthunt --limit 5 --timeout 20
node "$OPS_DIR/scripts/web-search.mjs" gh --timeout 20 -- api repos/owner/repo
node "$OPS_DIR/scripts/web-search.mjs" doctor
```

`search` 为 Tavily → Exa，各最多一次；缺少 Key 不发送 Tavily 请求。`read` 为 Jina HTTP → 官方 Exa `web_fetch_exa`，接受官方 MCP 的可读 Markdown 返回。`feed` 只接受 `producthunt`，不支持臆造的分类/关键词查询参数。`gh` 的 `--` 后参数通过数组原样传给原生 gh，不经 shell。每个请求/子进程默认 20 秒，最高 60 秒；读取响应限制 2 MiB。

JSON 返回 `ok/backend/items/meta/error`；`meta.attempts` 含后端、结果、有限脱敏错误和耗时，`gh` 原生输出在 `data`。Product Hunt 保留 `published_at/updated_at/author` 原字段，缺失字段为 null；`rank` 和 `meta.ranking=feed_order` 仅描述本次 Feed 顺序。空结果、坏 JSON、错误 envelope、登录/验证页不能算成功。

`doctor` 只发现 gh、账号池脚本、Tavily 脱敏配置状态与本机 HTTP 能力，不请求外部服务；configured 不等于鉴权或业务已验收。公开来源 URL 限 HTTP(S)，拒绝明显本机/私网地址和带凭据/签名参数的链接；不应向第三方读取服务发送任何私有目标。

## 安全账号池与非敏感配置

密钥操作先读 `account-pool-ops`。helper 从已有账号池读取 Tavily 默认条目，未配置返回 `NOT_CONFIGURED`；不读取环境变量或旧版本地 JSON 明文 Key，不遍历其他 Key、不自动切换条目。Python 子进程导入既有 Pool，Keychain 返回值只经内存管道进入 Node 请求，不能回显、写文件或加入进程参数。

可选 `config.local.json` 只能放非敏感路径与已验证的 gh CA 修复：

```json
{
  "ghCommand": "gh",
  "pythonCommand": "python3",
  "useEnvironmentProxy": true,
  "systemCaCommands": ["gh"]
}
```

账号池脚本默认从当前 `CODEX_HOME/skills`、用户 `.agents/skills`、`.claude/skills` 下查找 `account-pool-ops/scripts/account_pool.py`；非标准安装可配置 `accountPoolScript`，它只是脚本路径，不是 Key。没有安全后端时跳过 Tavily并报告具体缺口，不降级明文保存。

`systemCaCommands` 默认无值；只有证据确认当前 SSL_CERT_FILE/SSL_CERT_DIR 覆盖失效、命令正常信任库可用时才启用 `gh`。它只移除该 gh 子进程的这两个覆盖，TLS 校验继续开启。HTTP 服务沿 Node 正常 TLS 信任配置，不关闭验证、不硬编码代理、不改全局 shell/Codex 设置。

`useEnvironmentProxy` 默认 false，仅在当前网络确需已有 HTTP(S)_PROXY 时显式配置 true。helper 在真实 HTTP 请求前检查 Node 的 `http.setGlobalProxyFromEnv`，只在**当前 helper 进程**启用已有环境代理；旧版本无此 API 会报告明确缺项。也可用 Node 24 参数 `node --use-env-proxy "$OPS_DIR/scripts/web-search.mjs" read 'https://example.com'`。两种方式均不写入 OS/全局 shell 代理或改动 TLS；不要据某条 HTTP 传输失败判定服务不可用。诊断保留有限的底层 `cause.code`，不转储环境、请求头或代理凭据。

## 验证

给用户可直接发送的搜索条目、预期路径和判定边界见 [try-it.md](try-it.md)。账号池新增可用默认条目后，当前 helper 会在下一次查询内存取用，无需把 Key 写入配置；`doctor` 仅说明配置状态，真实使用仍以当次 `backend` 和 `meta.attempts` 为准。

```bash
node --test "$OPS_DIR/tests/web-search.test.mjs" "$OPS_DIR/tests/ego-channels.test.mjs"
```

HTTP 测试使用注入 transport/安全凭据替身，无网络、无真实 Key；覆盖主次路由、未配置跳过、超时、脱敏、Atom 日期/顺序与符号链接入口。Ego 纯函数与调用边界可用替身测试，实际选择器和站点可用性须由当前真实 Ego 页面验证并归档至 ego-ops。不要把测试通过当作 Tavily 真实鉴权、浏览器登录或各站全文读取成功。
