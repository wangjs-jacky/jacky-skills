---
name: web-search
description: |
  网络信息获取唯一决策入口。三层能力：
  ① Layer 1 — OpenCLI 100+ 站点直采（含 External CLI 桥接 + 本机扩展 CLI）
  ② Layer 2 — 通用搜索降级链（WebSearch → Tavily → DuckDuckGo）
  ③ Layer 3/4 — 已知 URL 读取 + 浏览器 CDP 兜底
  触发场景：搜索、查询、调研、读取网页、抓 SPA、登录后内容、采集前置「先搜后采」
  不触发场景：URL 已明确且已确认走 OpenCLI（如 ob-collect 拿到具体视频 URL 后直接执行）
  特殊指令：/web-search setup（注册 Tavily + 扫描本机 CLI）
  沉淀机制：搜索完成后按规则更新 experience.local.md
---

# Web Search 工具决策

> 完整 Tradeoff 矩阵和经验沉淀参考 Obsidian 文章 OBA-w8s3k7p2。
> `${CLAUDE_SKILL_DIR}` 指本 SKILL.md 所在目录。

## 0. 一句话决策（90% 场景）

```
拿到信息获取请求
  │
  ├─ GitHub URL？────────→ 原生 `gh` 结构化获取
  │                          ↓ `gh` 确实无法获取所需内容
  │                         Layer 3 / Layer 4 网页降级
  │
  ├─ 其他 URL？──────────→ Layer 1（OpenCLI 路由）
  │                          ├─ 内置 100+ 站点
  │                          ├─ External CLI 桥接（lark/notion/...）
  │                          └─ 本机扩展 CLI（yuque-cli/linear/...）
  │                          ↓ 全部未命中
  │                         Layer 3（已知 URL 读取）
  │                          ↓ 需要登录/SPA 失败
  │                         Layer 4（浏览器 CDP 兜底）
  │
  └─ 没有 URL ───────────→ Layer 2（通用搜索降级链）
                             WebSearch → Tavily → DuckDuckGo
```

**核心原则**：零成本优先、按需升级、一工具失败立即换下一级，**不要在同一工具反复重试**。

## 1. 首次使用提示（仅出现一次）

进入 skill 时先读 `${CLAUDE_SKILL_DIR}/experience.local.md` 顶部。如果**没有** `setup-completed: ` 标记：

> 💡 提示：跑 `/web-search setup` 可一次性完成 Tavily API Key 配置 + 扫描本机的搜索/采集 CLI 工具（语雀/Linear/Notion 等）。配好后下次自动用上，不会有打断。

跑过一次后，setup 命令会在 experience.local.md 顶部写入 `setup-completed: {ISO 时间}`，从此不再提示。

## 1.5 GitHub 特殊路由：原生 `gh` 绝对优先

当 URL 为 `github.com` 或任务明确涉及 GitHub 仓库、文件、PR、Issue、Release、Actions 等信息时：

1. **必须首先使用本机原生 `gh` CLI**，优先调用 `gh api`，或使用 `gh repo` / `gh pr` / `gh issue` / `gh release` / `gh run` 等结构化命令。
2. 需要阅读仓库源码时，优先用 `gh api repos/<owner>/<repo>/contents/<path>` 、Git Trees API 或临时 clone，不先抓 GitHub HTML 页面。
3. 只有在 `gh` 已证明无法取得目标内容时（例如 GitHub 之外的嵌入页面、必须渲染的视觉内容），才降级到 Layer 3 网页读取，再必要时进入 Layer 4 浏览器。
4. 不得因为 OpenCLI 未安装、daemon 异常或 Extension 未连接而跳过 `gh`；GitHub 路由不依赖 OpenCLI。

## 2. Layer 1：OpenCLI 站点路由（URL 已知）

### 2.1 依赖检查

> GitHub 任务不执行本节的 OpenCLI 前置检查，直接按 1.5 节调用原生 `gh`。

```bash
which opencli >/dev/null && opencli doctor 2>&1 | head -3
```

期望三项全绿（Daemon / Extension / Connectivity）。未安装时跳过 Layer 1，**不引导安装**。

### 2.2 高频站点清单（覆盖 80% 场景）

> 域名命中此表 → **必须**用 OpenCLI 对应命令；不命中 → 进 2.4/2.5/2.6。

| 类别 | 域名 | 命令 | 认证 |
|------|------|------|------|
| **视频/播客** | youtube.com / youtu.be | `youtube search/transcript/video/download` | 🔐 |
| | bilibili.com | `bilibili search/subtitle/video/favorite` | 🔐 |
| | xiaoyuzhou.fm | `xiaoyuzhou transcript/episode/search` | 🌐 |
| | apple-podcasts | `apple-podcasts episodes/search/top` | 🌐 |
| | spotify | `spotify ...` | 🌐 |
| **社交** | twitter.com / x.com | `twitter search/thread/bookmarks` | 🔐 |
| | reddit.com | `reddit search/read` | 🔐 |
| | xiaohongshu.com | `xiaohongshu search/note` | 🔐 |
| | weibo.com | `weibo search/post` | 🔐 |
| | bsky.app | `bluesky ...` | 🌐 |
| | jike (即刻) | `jike ...` | 🔐 |
| **技术社区** | news.ycombinator.com | `hackernews search/read` | 🌐 |
| | stackoverflow.com | `stackoverflow search` | 🌐 |
| | v2ex.com | `v2ex topic/search` | 🌐/🔐 |
| | linux.do | `linux-do ...` | 🔐 |
| | dev.to | `devto ...` | 🌐 |
| | huggingface.co | `hf search/dataset/model` | 🌐 |
| **资讯/内容** | zhihu.com | `zhihu answer/search` | 🔐 |
| | 36kr.com | `36kr article/search/hot` | 🌐 |
| | medium.com | `medium ...` | 🔐 |
| | substack.com | `substack ...` | 🌐/🔐 |
| | mp.weixin.qq.com | `weixin article/account` | 🔐 |
| | douban.com | `douban subject/search` | 🔐 |
| **学术** | arxiv.org | `arxiv search/paper` | 🌐 |
| | wikipedia.org | `wikipedia ...` | 🌐 |
| | scholar.google.com | `google-scholar search` | 🌐 |
| **财经** | eastmoney.com | `eastmoney ...` | 🌐/🔐 |
| | xueqiu.com | `xueqiu ...` | 🔐 |
| **AI 平台** | chatgpt.com | `chatgpt ...` | 🔐 |
| | gemini.google.com | `gemini ...` | 🔐 |
| | doubao.com | `doubao ...` | 🔐 |
| | deepseek.com | `deepseek ...` | 🔐 |
| | Google 搜索（无登录）| `opencli google search "<keyword>"` | 🌐 |

**认证标识**：🌐 public（无需登录） / 🔐 cookie（需本机 Chrome 已登录该站点） / 🔧 ui（需本机已装对应桌面应用）

### 2.3 重操作确认

执行前**必须询问用户**：字幕提取（`youtube transcript` / `bilibili subtitle`）、下载媒体（`<site> download`）、批量搜索（多个 opencli 组合）。

不需要确认：单次 search、获取详情、热门趋势。

### 2.4 未命中 → grep 兜底

URL 域名不在 2.2 表里时：

```bash
opencli list 2>&1 | grep -i <域名前缀或关键词>
```

命中 → 用该命令；未命中 → 进 2.5 / 2.6。

### 2.5 External CLI 桥接

OpenCLI 主命令下挂载了第三方工具，与内置站点同等优先级：

| 命令 | 适用域名 / 用途 |
|------|----------------|
| `opencli lark-cli` | feishu.cn / larksuite.com（消息/文档/表格/日历，200+ 命令）|
| `opencli dws` | dingtalk.com（钉钉 Workspace）|
| `opencli wecom-cli` | wecom.com（企业微信）|
| `opencli obsidian` | 本地 Obsidian vault（笔记/搜索/标签）|
| `opencli vercel` | vercel.com（部署/域名/env/日志）|

碰到对应域名时优先用这些，而不是 Layer 3 通用读取。

### 2.6 本机扩展 CLI（用户安装的非 OpenCLI 工具）

URL 域名既不在内置清单也没有 External 桥接时：

**第一步：读 experience.local.md 的「本机扩展站点」表**（最权威）

如果表里已有该域名 → 直接用记录的 CLI。

**第二步：懒汉式探测本机是否有相关工具**

```bash
# 示例：碰到 yuque.com
which yuque-cli yuque 2>/dev/null
# 示例：碰到 linear.app
which linear 2>/dev/null
```

找到 → 调用该 CLI → **追加到 experience.local.md 的「本机扩展站点」表**：

```markdown
| yuque.com | yuque-cli | yuque-cli doc <id> | 2026-05-11 |
```

找不到 → 回到 Layer 3。

> 这张表是 skill 的**知识扩展点**：用户安装新 CLI 后被发现一次，之后所有会话都自动用上。

### 2.7 OpenCLI 命令失败的降级

| 报错信号 | 处理 |
|---------|------|
| Authentication required / 401 / 403 | 提示用户在浏览器登录该站点后重试（不引导扫码，OpenCLI 不支持）|
| Daemon not running | 跑 `opencli doctor`，按提示修复 |
| 超时（>120s）| 退到 Layer 4 |

## 3. Layer 2：通用搜索降级链（无 URL）

### 3.1 决策链

```
WebSearch（内置，零配置）
  ├─ 结果够 → 完成
  └─ 不够 → 检查 Tavily 配置
            ├─ 已配置 → Tavily（AI answer，~1.3s）
            └─ 未配置 → 智能降级（见 3.3）
```

### 3.2 Trade-off 对照

| 工具 | 速度 | 要 Key | 免费额度 | 适用 |
|------|------|-------|---------|------|
| **WebSearch**（内置）| 中 | 否 | 共享 Z.ai | 日常通用首选 |
| **Tavily** | 1.3s | 是 | 1000/月 | 需要 AI 摘要 |
| **DuckDuckGo**（`ddgs`）| ~10s | 否 | 无限 | 兜底 |
| `mcp__web-search-prime` | 中 | 否 | 周/月有限 | **仅**限定 domain/recency 时用 |
| `mcp__zread__search_doc` | 快 | 否 | 无限 | GitHub 仓库内搜索 |

### 3.3 Tavily 未注册时的智能降级（LLM 自数会话搜索次数）

进入 Layer 2 前回顾本会话历史，估算已搜索次数：

```
if 已搜索 < 3 次:
  静默跳 DDG，不弹提示

elif 已搜索 ≥ 3 次 AND 本会话未提示过:
  仅提示一次：
    "本会话已搜索 N 次。注册 Tavily 可减少等待（10s → 1.3s）。
     执行 /web-search setup（1 分钟），或继续用 DDG。"
  用户选择后本会话不再提示

else (用户已跳过提示):
  静默 DDG
```

> 计数完全靠 LLM 上下文记忆，不写文件，避免污染 experience.local.md。

### 3.4 Tavily 用法

```bash
# Key 读取：环境变量优先 → config.local.json 兜底（与 6.1 配置顺序一致）
TAVILY_KEY="${TAVILY_API_KEY:-}"
[ -z "$TAVILY_KEY" ] && [ -f "${CLAUDE_SKILL_DIR}/config.local.json" ] && \
  TAVILY_KEY=$(python3 -c "import json; print(json.load(open('${CLAUDE_SKILL_DIR}/config.local.json'))['tavily']['apiKey'])" 2>/dev/null)

# Key 不存在时直接报告并跳到 DDG，不要假装能继续
[ -z "$TAVILY_KEY" ] && { echo "Tavily 未配置，跳到 DDG"; } || {
  # 搜索（含 AI answer）
  curl -s -X POST "https://api.tavily.com/search" \
    -H "Content-Type: application/json" \
    -d "{\"api_key\":\"$TAVILY_KEY\",\"query\":\"<keyword>\",\"max_results\":5,\"include_answer\":true}"

  # 提取 URL 内容
  curl -s -X POST "https://api.tavily.com/extract" \
    -H "Content-Type: application/json" \
    -d "{\"api_key\":\"$TAVILY_KEY\",\"urls\":[\"<url>\"]}"
}
```

### 3.5 DuckDuckGo (`ddgs`) 用法

```bash
# 依赖检查 / 安装
python3 -c "from ddgs import DDGS" 2>/dev/null || pip3 install --break-system-packages ddgs

# 基本搜索（建议带代理，国内更稳）
python3 -c "from ddgs import DDGS; [print(r['title'], r['href']) for r in DDGS(proxy='http://127.0.0.1:10802').text('<keyword>', max_results=5)]"

# 时效过滤（d=日 / w=周 / m=月 / y=年）
python3 -c "from ddgs import DDGS; [print(r['title']) for r in DDGS().text('<keyword>', max_results=5, timelimit='w')]"

# 新闻 / 视频 / 图片 / 书籍 / 帖子 / 抽取：text|news|images|videos|books|threads|extract
python3 -c "from ddgs import DDGS; [print(r['title'], r['date']) for r in DDGS().news('<keyword>', max_results=5)]"
```

### 3.6 知识扩展点

发现新搜索后端（Serper / SearXNG / Brave）适合补充进降级链时：

1. 验证免费额度、速度、是否需要 Key
2. 追加到 3.2 Trade-off 表
3. 在 experience.local.md「有效模式」记录使用经验

## 4. Layer 3：已知 URL 的页面读取

适用：URL 已知，但 Layer 1 没有专属命令、External 桥接、本机扩展都没匹配。

| 工具 | JS 渲染 | 速度 | 适合 |
|------|--------|-----|------|
| `mcp__web_reader__webReader` | ❌ | 快 | 静态博客、文档站 |
| `mcp__zread__read_file` | — | 快 | GitHub 仓库内文件 |
| `WebFetch` | ❌ | 快 | 最后兜底 |

**经验规则**：
- SPA 或需要交互 → Layer 4（统一交给 Ego Lite）
- 静态页 → `mcp__web_reader` 先试，慢再换 `WebFetch`
- GitHub 文件 → `mcp__zread__read_file`（不用 clone）

## 5. Layer 4：浏览器任务委派

进入条件：Layer 1/3 已证明需要真实浏览器交互，例如必须复用登录会话、反爬阻断或需要点击操作。

先加载 `ego-ops`，按站点和 operation 读取经验，再加载 `ego-browser` 执行。传递搜索目标、已尝试工具、失败事实和登录态需求，遵守其授权、任务空间及证据规则。

若公开页面已能在 Layer 3 读取，就留在 Layer 3；SPA、JS 渲染或任何交互需求都由 `ego-ops → ego-browser` 链路处理。

## 6. /web-search setup 命令（一次性配置）

用户执行 `/web-search setup` 时按顺序完成。**核心是 Tavily Key 配置；CLI 扫描是可选扩展**。

### 6.1 Tavily Key 配置（核心步骤）

#### 先检测是否已配置

```bash
CFG="${CLAUDE_SKILL_DIR}/config.local.json"
TAVILY_KEY=""

# 优先级 1: 环境变量（团队/CI 推荐）
[ -n "$TAVILY_API_KEY" ] && TAVILY_KEY="$TAVILY_API_KEY"

# 优先级 2: skill 本地配置
[ -z "$TAVILY_KEY" ] && [ -f "$CFG" ] && \
  TAVILY_KEY=$(python3 -c "import json,sys; d=json.load(open('$CFG')); print(d.get('tavily',{}).get('apiKey',''))" 2>/dev/null)

# 验证 Key 有效性（轻量调用，max_results=1）
if [ -n "$TAVILY_KEY" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.tavily.com/search" \
    -H "Content-Type: application/json" \
    -d "{\"api_key\":\"$TAVILY_KEY\",\"query\":\"ping\",\"max_results\":1}")
  case "$STATUS" in
    200) echo "✓ Tavily 已配置且 Key 有效" ;;
    401|403) echo "✗ Tavily Key 无效（HTTP $STATUS），请重新配置" ; TAVILY_KEY="" ;;
    *) echo "⚠ Tavily 探测异常（HTTP $STATUS），但 Key 已配置" ;;
  esac
else
  echo "✗ Tavily 未配置"
fi
```

#### 未配置时的注册引导

如果上一步报「未配置」或「Key 无效」：

1. 访问 https://app.tavily.com 注册账号
2. Dashboard → API Keys → 复制 Key（格式 `tvly-xxx`）
3. 写入配置（**二选一**）：

   **方式 A：环境变量（推荐，跨 skill 复用）**

   把下面这行加到 `~/.zshrc` 或 `~/.bashrc`，然后 `source` 一下：
   ```bash
   export TAVILY_API_KEY="tvly-粘贴你的 Key"
   ```

   **方式 B：skill 本地配置（隔离作用域）**
   ```bash
   cat > "${CLAUDE_SKILL_DIR}/config.local.json" << 'EOF'
   {
     "tavily": {
       "apiKey": "<粘贴你的 Key>",
       "enabled": true
     }
   }
   EOF
   ```

4. 配置后重跑 `/web-search setup` 验证。

> Layer 2 中读取 Key 的代码（3.4 节）也按 **环境变量优先 → config.local.json 兜底** 的顺序读取，与本节一致。

### 6.2 扫描本机 CLI 工具（可选扩展，按需添加）

> 当你**装了**网站专用 CLI（如语雀 `yuque-cli`、Linear `linear` 等）时，把它加进下面的扫描清单，下次进 Layer 1 时遇到对应域名会自动用上。**当前清单只列 1 个示例，按需扩展**。

```bash
EXP="${CLAUDE_SKILL_DIR}/experience.local.md"
DATE=$(date +%Y-%m-%d)

# 确保「本机扩展站点」表存在
grep -q "^## 本机扩展站点" "$EXP" 2>/dev/null || cat >> "$EXP" << 'EOF'

## 本机扩展站点

| 域名 | CLI 命令 | 用法示例 | 发现日期 |
|------|---------|---------|---------|
EOF

# 扫描清单（按需追加；格式: 域名|命令|用法）
# 示例：
for tool in \
  "yuque.com|yuque-cli|yuque-cli doc <id>"; do
  domain="${tool%%|*}"; rest="${tool#*|}"; cmd="${rest%%|*}"; usage="${rest##*|}"
  if which "$cmd" >/dev/null 2>&1 && ! grep -q "| $domain |" "$EXP"; then
    echo "| $domain | $cmd | $usage | $DATE |" >> "$EXP"
    echo "✓ 发现 $cmd → 已登记 $domain"
  fi
done
```

**扩展示例**（用户按需添加新行到 for 列表）：
```
"linear.app|linear|linear issue list"
"notion.so|notion-cli|notion-cli page <id>"
"<新域名>|<新 CLI 命令>|<用法示例>"
```

### 6.3 写入 setup-completed 标记

```bash
# 顶部追加，抑制首次使用提示
if ! grep -q "^setup-completed:" "$EXP"; then
  TMP=$(mktemp)
  echo "setup-completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$TMP"
  echo "" >> "$TMP"
  cat "$EXP" >> "$TMP"
  mv "$TMP" "$EXP"
fi
```

## 7. 硬约束

- 禁止首选 `mcp__web-search-prime` 做通用搜索（配额有限）
- 禁止用 `mcp__web_reader` 读已知 SPA（按 Layer 3 选择支持 JS 的读取器；需交互再委派 Layer 4）
- 一个工具失败立即升级，不在同一工具反复重试
- Layer 1 命中 OpenCLI 时禁止跳 Layer 3（domain-specific 永远更准）
- GitHub 信息必须先用原生 `gh`；只有 `gh` 确实无法获取所需内容时，才能降级到网页读取或浏览器
- 子 Agent 任务分发用「获取/了解/调研」等中性词，避免暗示特定工具
- Tavily 注册引导**仅本会话提示一次**
- 本机扩展站点表必须先读、后探测（已记录的域名直接用，不重复探测）

## 8. 经验沉淀机制

经验存储在 `${CLAUDE_SKILL_DIR}/experience.local.md`，由 LLM 自动维护。

### 8.1 读取规则

搜索开始前**必须先读取** experience.local.md，作为工具选择的先验。优先级：
**本机扩展站点 > 失败模式 > 有效模式 > Trade-off 矩阵**

### 8.2 写入规则

搜索完成后按下表写入：

| 触发条件 | 写入位置 | 内容 |
|---------|---------|------|
| 首次发现本机有非内置 CLI 能搞定某域名 | 本机扩展站点表 | `\| 域名 \| CLI \| 用法 \| 日期 \|` |
| 工具在新场景表现特别好 | 有效模式表 | `\| 结论 \| 日期 \| 场景 \|` |
| 工具在特定场景失败 | 失败模式表 | `\| 陷阱 \| 日期 \| 正确做法 \|` |

**不写**：按预期工作的常规调用 / 未经验证的猜测。

### 8.3 回退策略

按经验选择工具后结果不达标 → 立即回退到下一级 → 将旧经验改为失败模式。

### 8.4 写入示例

```markdown
## 本机扩展站点
| yuque.com | yuque-cli | yuque-cli doc <id> | 2026-05-11 |

## 有效模式
| Tavily 在编程问答比 WebSearch 命中率高 | 2026-05-11 | 编程概念解释 |

## 失败模式
| web_reader 读取动态页面返回空 | 2026-05-11 | 先换 Layer 3 读取器；确需交互则委派 Layer 4 ego-ops → ego-browser |
```
