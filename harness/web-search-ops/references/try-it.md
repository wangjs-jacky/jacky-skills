# Web Search 试用条目

用户要亲自测试搜索时读取。web-search 是兼容入口，主 Skill 为 web-search-ops。以下是可直接发送到支持此 Skill 的会话中的文字指令；不用假设宿主注册了某个斜杠命令。一次选择一项，结果默认只取 3 条。

## 可直接发送的指令

| 想测试什么 | 指令 | 应命中的路径 |
|------------|------|--------------|
| B站当下热点 | 用 web-search-ops 看 B站当前热搜词，再看综合热门的 3 条视频，分别给来源。 | Ego read-hot-search 与 read-popular-videos |
| 抖音无关键词发现 | 用 web-search-ops 看抖音当前热榜和搜索发现，给我 3 个适合继续研究的议题。 | Ego read-hot-ranking 与 read-search-discovery |
| 小红书新近讨论 | 用 web-search-ops 找小红书最近发布的 AI 工作流笔记，读取 1 条正文和已加载评论。 | Ego 搜索、实际筛选、详情与评论 |
| 通用搜索与官方资料 | 用 web-search 搜索 MCP 和 Function Calling 的区别，给我 3 条官方来源及简短解释。 | 账号池 Tavily；未配置或失败才有限回退 |
| 小宇宙节目发现 | 用 web-search 搜索小宇宙里讨论 AI 创业的节目或单集，给我 3 个标题、简短介绍和链接。 | 通用搜索限定小宇宙域名；说明公开索引范围 |
| Product Hunt 新品 | 用 web-search 读取 Product Hunt 官方 Feed 的前 5 条产品，列出名称、简介、日期和链接。 | 直接官方 Atom Feed |
| 小红书站内搜索 | 用 web-search 通过 Ego 搜小红书的“AI 工作流”，给我 3 条笔记标题、作者和链接。 | Ego 当前渲染笔记卡片 |
| 抖音站内搜索 | 用 web-search 通过 Ego 搜抖音的“AI 视频工具”，给我 3 条视频标题、作者和链接。 | Ego 当前渲染视频卡片 |
| B站站内搜索 | 用 web-search 通过 Ego 搜 B站的“AI Agent 教程”，给我 3 条视频标题和链接。 | Ego 当前渲染视频卡片 |
| GitHub 一手资料 | 用 web-search 查 Panniantong/Agent-Reach 的默认分支和 README，概括当前声明的渠道并给仓库链接。 | 原生 gh / GitHub 官方 API |
| 已知网页阅读 | 用 web-search 读取 https://example.com/ ，告诉我页面标题和正文要点。 | Jina Reader，失败时官方 Exa 读取 |

## 怎样判断测试通过

结果须来自本次真实调用，来源能核对；回复末尾列出实际渠道和已有计时证据。例如 `渠道：Tavily；本次查询：2.1 秒`，数字必须取真实结果，不能沿用示例或历史耗时。没有可靠计时就写“未计时”。Ego 查询耗时、任务空间准备及整个回答耗时也不能混用。

通用搜索返回 Exa 时说明 Tavily 路径的具体缺口，不能称为 Tavily 已通过。Product Hunt Feed 只代表订阅源及其顺序，不代表实时热榜、完整历史或自由关键词 API。小宇宙公开索引未命中不代表站内没有节目；搜索摘要不能当完整简介或音频转录。

浏览器项先走 `ego-ops → 站点 operation → ego-browser`，由本轮运行时负责受控任务空间、页面验证、Happy 关键帧和收尾。需要登录或验证码时按控制权规则交接，不能回退站内私有 HTTP、OpenCLI 或其他浏览器控制器。作者等字段缺失时明确注明，不从其他接口猜补。
