---
name: ob-collect
description: "Obsidian 万物采集器。委托 web-search 路由层获取内容（100+ 站点 + Layer 1-4 全栈），采集到 raw/ 并编译为结构化 wiki 笔记。支持批量并行、断点续传。触发词：采集、导入知识库、ob-collect、视频转笔记、采集书签、批量采集。"
---

<role>Obsidian 万物采集器。委托 web-search 拿内容，自身专注于编译为结构化 wiki 笔记（raw/ 归档 + 主题分类 + 索引维护 + 批量并行 + 断点续传）。</role>
<purpose>采集模式 — 将 URL/PDF/视频/文本采集到 raw/ 并编译到 wiki/{theme}/。建议 ≤ 500 字，超出部分用 [[reference]] 链接补充。</purpose>
<trigger>

```text
触发词：
- 采集文章 / 导入到知识库 / 学习记录 / 摄入资料
- ob-collect / ob-learn / 把这个加到知识库
- 采集视频 / 视频转笔记 / 导入视频字幕
- 采集公众号 / 微信文章
- 采集书签 / 采集收藏 / 采集稍后观看
- 批量采集 / 处理这些链接
- 采集我的 Twitter 书签 / B站收藏 / YouTube 稍后

示例：
- "ob-collect https://example.com/article"
- "帮我采集这篇文章到知识库"
- "把这个 PDF 导入知识库"
- "采集一下这篇文章：RLHF 和 CoT 的关系"
- "采集这个 B 站视频的字幕"
- "批量采集这些链接：url1, url2, url3"
- "采集我的 YouTube 稍后观看"
```

</trigger>
<gsd:workflow xmlns:gsd="urn:gsd:workflow">
  <gsd:meta>requires=OBSIDIAN_REPO,opencli; focus=ingest,compile</gsd:meta>
  <gsd:deps>
    <dep name="web-search" source="local" skillName="web-search" required="true" />
    <dep name="ob-router" source="local" skillName="ob-router" required="true" />
    <dep name="ob-compile" source="local" skillName="ob-compile" required="true" />
    <dep name="audio-to-subtitle" source="plugin" pluginName="video-processing" skillName="audio-to-subtitle" required="false" />
  </gsd:deps>
  <gsd:goal>将来源采集到 raw/ 编译到 wiki/{theme}/。</gsd:goal>
  <gsd:phase>**委托 ob-router skill** 解析当前激活仓库路径（硬委托，不自行读取文件），识别输入类型和来源平台。</gsd:phase>
  <gsd:phase>委托 web-search 获取内容 → 主题分类 → 预览确认 → 写入 raw/ → 编译到 wiki/{theme}/。</gsd:phase>
  <gsd:phase>更新索引：wiki/{theme}/index.md、wiki/index.md（新主题时）、wiki/log.md、.kb/manifest.json。如果当前在 git 项目中，同步更新项目 CLAUDE.md 的 Obsidian 索引段。</gsd:phase>
</gsd:workflow>

# Obsidian 万物采集 (ob-collect)

## 配置检查

**执行前必读**：本 skill 需要以下配置。

### 【硬约束】仓库路径一律委托 ob-router 解析

> **不要自行读取 `ob-router.json` 或 `CLAUDE.md`。仓库路由是 ob-router 的职责，本 skill 不维护路径逻辑。**

调用 ob-router skill 获取 `$OBSIDIAN_REPO`，ob-router 内部处理以下优先级：

1. `~/.claude/ob-router.json` → `repos[active]` 路径
2. 若文件不存在 → 从 CLAUDE.md 中的 `OBSIDIAN_REPO` 读取，并**主动提示用户运行 `ob-router init` 持久化**
3. 若存在多个已注册仓库 → **主动询问用户要切换到哪个仓库**，不静默使用默认值
4. 以上均失败 → AskUserQuestion 询问路径

将 ob-router 返回的路径保存为 `$OBSIDIAN_REPO`，后续全程使用此变量。

5. 检查 `opencli` 是否可用：`opencli doctor`，三项全绿才继续

**脚本依赖检查**：

掘金小册采集功能需要本地脚本依赖。执行相关功能前检查：

1. 检查 `{SKILL_DIR}/scripts/node_modules/` 是否存在
2. 如果不存在，执行：`cd {SKILL_DIR}/scripts && npm install`
3. 安装完成后继续执行

> `{SKILL_DIR}` 为本 SKILL.md 所在目录的绝对路径。

**目录初始化检查**：

首次使用时，确认以下目录存在（不存在则创建）：

```
$OBSIDIAN_REPO/raw/
├── web/            # 通用网页采集（博客、技术文章等）
├── wechat/         # 微信公众号文章
├── videos/         # 【视频/音频唯一落盘区】所有视频/播客字幕转写，按 raw/videos/{作者名}/ 归档
│   └── {作者名}/   # 例：raw/videos/罗永浩的十字路口/
├── finance/        # 【财经例外】财经类 UP主 视频源仍归此处 raw/finance/{作者名}/（沿用既有聚合）
│   └── {作者名}/   # 例：raw/finance/牛牛复利/
├── news/           # 资讯聚合（Hacker News、Reddit 等）
├── official/       # 官方文档和文章（Claude Code、OpenAI 等）
├── notes/          # 自由笔记（人工输入的原始文档）
├── ai-notes/       # AI 调研产出（AI 查询/分析/整理的原始资料）
└── juejin/         # 掘金小册（全书提取，含图片）

$OBSIDIAN_REPO/wiki/{ai,claude,current-affairs,career,dev-tools,front-end,obsidian,tauri,distill}/
$OBSIDIAN_REPO/.kb/
```

如果 `wiki/index.md` 不存在，创建初始索引。

## 获取内容（默认委托 web-search + 明确例外）

> **【硬约束】所有「如何拿到内容」的决策**默认**由 `dev-tools:web-search`（`web-search`）skill 负责。本 skill 不维护路由表。** 从当前环境的 Skills 目录取得该 skill 的实际路径并读取；不要从本 skill 的安装目录拼接跨 skill 相对路径，也不要把标识中的 `:` 转成目录分隔符。
>
> **例外口子由本节末尾的「例外清单」统一管理**。未列入清单的绕过路径一律视为违规。

### 调用流程

收到 URL / 主题 / 文件后：

1. **本地 PDF / 纯文本 / AI 调研产出** → 跳过 web-search，直接用 Read / 内容本身
2. **掘金小册 URL（`juejin.cn/book/*`）** → 跳过 web-search，使用本 skill 的[掘金小册采集模式](#掘金小册采集模式)
3. **其他 URL** → 委托 web-search：
   - web-search Layer 1（OpenCLI 路由 / External CLI 桥接 / 本机扩展 CLI）拿内容
   - Layer 1 未命中 → web-search 自动走 Layer 3（web_reader / WebFetch）
   - 登录、反爬、SPA 或交互失败 → web-search 自动走 Layer 4（Browser Control → Ego Ops → Ego Lite）
4. **无 URL（如「采集 RLHF 这个话题」）** → 先调 web-search Layer 2（WebSearch → Tavily → DDG）拿候选列表，用户选定后回到步骤 3
5. **视频/音频专用**：URL 命中 YouTube/B站/小宇宙/播客等时，仍由 web-search 调 OpenCLI subtitle/transcript；**无字幕时**回到本 skill 的 [ASR 回退流程](#asr-回退流程)

**为什么硬委托**：路由表是单一真理来源。两份路由会必然分裂，LLM 选错的成本远高于多一次 skill 跳转。

### 平台 → raw 子目录映射（采集独有）

web-search 负责"怎么拿"，ob-collect 负责"放哪儿"。raw/ 归档目录按平台类别映射：

| 平台类别 | raw 子目录 | 域名示例 |
|---------|-----------|---------|
| **视频 / 播客（非财经）** | `raw/videos/{作者名}/` | youtube / bilibili / xiaoyuzhou |
| **视频 / 播客（财经类）** | `raw/finance/{作者名}/` | 财经 UP主（见下方判定） |
| 微信公众号 | `raw/wechat/` | mp.weixin.qq.com |
| 资讯聚合 | `raw/news/` | hackernews / reddit / 36kr |
| 通用网页 | `raw/web/` | medium / substack / zhihu / douban |
| 掘金小册 | `raw/juejin/` | juejin.cn/book |
| 本地 PDF | `raw/web/` | — |
| 人工输入 | `raw/notes/` | — |
| AI 调研 | `raw/ai-notes/` | — |

> **【硬约束·视频统一落盘】** 任何来源（B站/YouTube/小宇宙/抖音/小红书/播客…）的视频、音频转写，**一律按作者落到 `raw/videos/{作者名}/`**——禁止再写到 `raw/{作者名}/`（顶层）、`raw/bilibili/`、`raw/bilibili-batch/` 等任何其它位置。视频内容只有这一个家。
>
> **财经例外**：若作者是财经投资类 UP主（实盘/股市/宏观/财报解读，如 王站岗、牛牛复利、貔貅PX、硬核姬老板、来去由心、胡慢慢滚雪球、梦想早日退休的韭菜、战国时代、追涨杀跌的小白、坤元财研、YaowAlpha投资笔记 等），归到 `raw/finance/{作者名}/`，沿用既有财经聚合区。无法判定财经属性时，默认进 `raw/videos/{作者名}/`。
>
> **作者名缺失时**：用平台账号名或频道名；仍无法确定时用 `raw/videos/未知作者/`，不要散落到顶层。

> `{A2S_DIR}` 为 audio-to-subtitle skill 所在目录：优先从已安装 Skill 注册表解析，本地开发时可用 `$JACKY_SKILLS_DIR/plugins/video-processing/skills/audio-to-subtitle`（ASR 回退流程会用到）

### 例外清单（绕过 web-search 的口子）

以下场景是已注册的例外，直接调用底层工具而不经 web-search：

| 例外场景 | 直接调用 | 理由 |
|---------|---------|------|
| 掘金小册采集 | `node scripts/extract-juejin-booklet.mjs` | API 路由 + 图片下载有专用脚本，效率优于通用路由 |
| 批量采集 Sub Agent 内部 | 直接调用 opencli 命令 | 批处理时直接调用 opencli 减少 skill 跳转开销 |
| ASR 回退流程 | `opencli <site> download` + ffmpeg + ASR | download + ffmpeg + ASR 三步紧耦合，由本 skill 内聚管理 |

**注册规则**：未来如需新增「绕过 web-search」的口子，**必须先在本清单注册并说明理由**，否则一律走 web-search。

## 可扩展模式与约束（核心范式）

> 与 web-search 同范式：**能力按需累加 + 经验沉淀 + 约束在范式之内**。
> - web-search 沉淀「怎么找到内容」（站点路由 / 工具降级链 / 本机扩展 CLI）
> - ob-collect 沉淀「哪些内容值得保留 + 怎么归档」（raw 子目录 / 主题分类 / 提取约束）

### 可扩展点（按需添加，不要预先列满）

| 扩展点 | 怎么扩展 | 落地位置 |
|--------|---------|---------|
| 新增 raw 子目录类型 | 在上方「平台 → raw 子目录映射」表追加一行 + 约定该类型 frontmatter | 本 SKILL.md + [references/frontmatter-schema.md](references/frontmatter-schema.md) |
| 新增主题分类 | 在下方「主题关键词映射」表追加（kebab-case 英文目录 + 关键词）| 本 SKILL.md |
| 新增内容类型的提取规则 | 例如「行业研报」「论文」要哪些字段、wiki 模板长什么样 | [references/compile-templates.md](references/compile-templates.md) |
| 新增视频平台字幕来源 | 由 web-search Layer 1 路由表负责，本 skill 不维护 | web-search SKILL.md 第 2.2 节 |

### 必须遵守的范式（硬约束，不可扩展）

> 这些是采集质量的底线，**新增扩展点不能破坏这些约束**。

1. **视频类只存字幕，不存视频本身；字幕资产必须可复用**
   - 每条新采集视频都必须在 `raw/videos/{作者名}/captions/` 留存 `{video_id}.srt`（UTF-8、带起止时间）。有平台字幕时优先保留其原始格式，并额外生成或规范化为该 SRT。
   - 同时留存 `{video_id}.meta.json`，至少记录 `video_id`、`source_url`、`caption_source`（`platform` 或 `asr`）、`language`、`generated_at`、`segment_count`；ASR 另记 `engine` 与 `model`。
   - 优先 OpenCLI `subtitle`/`transcript`（web-search Layer 1 自动调用）；字幕缺失 → 调用 audio-to-subtitle skill 做 ASR（用本地音视频大模型转字幕），输出格式固定为 SRT。
   - raw 学习摘记的 frontmatter 必须写入 `caption_file`、`caption_status: archived`、`caption_source`；时间轴摘记、摘要和 wiki 归纳都不能替代逐字字幕。
   - ASR 完成后**立即删除**临时视频/音频文件（详见 ASR 回退流程），不得删除已验证的字幕资产。
   - 例外：用户**显式**要求保留视频时才下载，且事前确认
2. **raw 层一次写入不可修改**（要改进 → 在 wiki 层追加引用，不动 raw）
3. **每篇 wiki 文章必须有 article_id**（`OBA-{8 位 lowercase}` 格式）
4. **新主题目录用 kebab-case 英文命名**（如 `wiki/llm-evals/`，不用中文目录名）
5. **frontmatter 必须三件套**：`tags`（非空）/ `type`（预定义值）/ `updated_at`（YYYY-MM-DD）
   - **raw 层额外必填 `status` 字段**（`uncompiled` | `compiled`），契约对象为 ob-compile 和 ob-index，详见 [references/frontmatter-schema.md](references/frontmatter-schema.md) 的「raw 层契约」一节
6. **不为一次性需求扩展**：模式 ≥ 3 次重复才固化为新子目录 / 新主题；否则归入 `raw/notes/` 或现有目录

### 沉淀机制 & 职能边界

经验沉淀写入 `${OBSIDIAN_REPO}/.kb/collect-experience.md`（含模板 / 写入规则 / 固化回流），与 web-search 的职能边界划分，详见 **[references/extension-protocol.md](references/extension-protocol.md)**。

一句话总结：
- **web-search 管「怎么拿」**（URL 路由 + 本机 CLI + 通用搜索降级）
- **ob-collect 管「放哪 + 留什么」**（raw 子目录 + 主题分类 + 视频字幕范式 + frontmatter）

## 主题分类

采集内容需要确定目标 wiki 主题目录。按以下优先级判断：

1. **用户指定**：用户说"放到 Claude"、"归类到时事" → 直接使用
2. **关键词匹配**：根据内容关键词自动推荐

### 主题关键词映射

| 主题 | 目录 | 关键词 |
|------|------|--------|
| AI 技术 | `wiki/ai/` | AI, LLM, GPT, transformer, 机器学习, 深度学习 |
| Claude 生态 | `wiki/claude/` | Claude, Claude Code, Skills, MCP, hooks, Subagents |
| Tauri | `wiki/tauri/` | Tauri, 桌面应用, tauri-app, Sidecar, invoke |
| 开发工具 | `wiki/dev-tools/` | VSCode, IDE, 编辑器, CLI, 终端, Git |
| 前端开发 | `wiki/front-end/` | React, JavaScript, TypeScript, CSS, 前端, 算法 |
| 时事分析 | `wiki/current-affairs/` | 经济, 政治, 国际, 金融, 投资, 时事 |
| 职业发展 | `wiki/career/` | 职级, 面试, 求职, 职业规划 |
| Obsidian | `wiki/obsidian/` | Obsidian, 知识管理, 笔记, 双链 |

无匹配时自动创建新主题目录（kebab-case 英文命名）。

匹配后展示推荐主题，用户可在确认时修改。

## 采集流程

### 采集模式判断（接到任务的第一步）

**【硬约束】接到采集任务时，第一步必须判断采集模式。模式判断仅在采集开始时执行一次，不在中途切换。**

| 输入特征 | 模式 | 行为 |
|---------|------|------|
| 单 URL + 内容预估 > 3000 字 | **长文一站式** | 写 raw（`status: compiled`） + 立即编译单篇 wiki |
| 单 URL + 短文 (< 3000 字) | **长文一站式** | 同上 |
| 用户明确说"采集这一篇" | **长文一站式** | 同上 |
| 多 URL（≥ 3 个）批量输入 | **集锦批量** | 仅写 raw（`status: uncompiled`），**不立即编译** |
| 同作者批量（B 站收藏夹、公众号专题等） | **集锦批量** | 同上 |
| 视频字幕（任意数量，YouTube/B 站/播客等） | **集锦批量** | 同上 |
| 用户明确说"批量采集 / 采集 X 的所有文章" | **集锦批量** | 同上 |

两种模式的核心差异：
- **长文一站式** → raw 写入即标 `status: compiled`，紧接着同步生成 wiki/{theme}/{slug}.md
- **集锦批量** → raw 写入标 `status: uncompiled`，**只归档不编译**，等达到阈值或用户主动触发 ob-compile

### 流程概要

1. **识别输入类型**：URL → 委托 web-search，PDF → Read，视频 → 委托 web-search（含 ASR 兜底），文本 → 直接使用
2. **平台检测**：根据 URL 域名确定 raw/ 子目录（命令路由由 web-search 决定）
3. **获取内容**：web-search 返回正文后，提取关键要点（3-5 条）
4. **图片检测与处理**：获取内容后，**必须**检测页面中的图片（见[图片处理规范](#图片处理规范)）
5. **主题分类**：根据关键词映射确定目标主题目录
6. **预览确认**：展示平台、主题、标题、来源、要点、标签，等待用户确认。**必须同时展示 raw 层和 wiki 层两步路径**：
   - raw 层：`raw/{子目录}/文件名`（原始内容存放位置）
   - wiki 层：`wiki/{theme}/文件名`（编译归纳目标位置）
7. **写入 raw/**：带 frontmatter 的原始笔记，**图片以 OCR callout + 嵌入的形式写入 raw 层**
   - **【硬约束】raw frontmatter 必须带 `status` 字段**（值为 `uncompiled` 或 `compiled`）
   - 长文一站式模式 → 写入时直接标 `status: compiled`
   - 集锦批量模式 → 写入时标 `status: uncompiled`
   - 详见 [references/frontmatter-schema.md](references/frontmatter-schema.md) 的「raw 层契约」一节
8. **编译到 wiki/{theme}/**（仅长文一站式模式立即执行；集锦批量模式跳过本步）：生成主题文章 → 引用 raw 层（不重复嵌入图片）→ 更新主题 index → 更新全局 index/log/manifest
9. **集锦批量模式的批后检查**：写入完成后，检查 `raw/{author}/` 或 `raw/{platform}/` 下 `status: uncompiled` 数量是否达到 **20 篇阈值**
   - 达到 → 提示用户「raw/X 下已有 N 篇未编译，是否触发 `ob-compile --author X --mode thematic`？」
   - 未达到 → 静默归档，等阈值或用户主动触发

### 关键规则

- 文件名规范：`{YYYY-MM-DD}-{slug}.md`
- **raw 层 `status` 字段**（契约链：ob-collect 写入 → ob-compile 翻转 → ob-index 消费）
  - 写入时：长文一站式 → `status: compiled`；集锦批量 → `status: uncompiled`
  - 翻转责任不在本 skill：ob-compile 完成编译后会将 `uncompiled` 翻转为 `compiled`
  - 不得省略：缺失 status 字段会破坏 ob-compile 与 ob-index 的契约链
- **article_id 分配**：每篇新建的 wiki 文章必须在 frontmatter 中包含 `article_id` 字段
  - 格式：`OBA-{8位随机小写字母数字}`（如 `OBA-k7jm2p9q`）
  - 全局唯一：随机生成后验证唯一性
  - 生成命令：`python3 -c "import random,string; print(''.join(random.choices(string.ascii_lowercase+string.digits,k=8)))"`
  - 验证命令：`grep -rh "OBA-{生成的ID}" "$OBSIDIAN_REPO/wiki/" --include="*.md"`（无输出则唯一）
  - 如果碰撞则重新生成，直到唯一
- 概念文章已存在时：读取并合并，不覆盖
- 概念冲突时：标注矛盾，追加说明
- 详细模板见 [references/compile-templates.md](references/compile-templates.md)

## 图片处理规范

> **【硬约束】网页内容包含图片时，必须完整处理。图片归属 raw 层，wiki 层只做引用，不重复嵌入。**

核心规则速览：

1. **不能用 `innerText` 读图片** — `<img>` 会被忽略，需 `querySelectorAll('img')` 单独提取
2. **先滚动再读 `data-src`** — 多数平台图片懒加载，`src` 是 SVG 占位符
3. **【硬约束】图片下载到「就近 attachments」目录** — 不写死全局 `$OBSIDIAN_REPO/attachments/`，而是和 raw md 同级：`{raw_md_dir}/attachments/{date-slug}/img_NNN.{ext}`，编号 1-based 三位补零（如 `img_001.jpeg`）
4. **Read 工具直读图片做 OCR**（Claude 多模态）
5. **raw 层格式**：`> [!note] OCR callout` 在前，`![[图片]]` 在后
6. **wiki 层不嵌入图片**，只用 `[[raw/.../文件名]]` 引用 raw

### 就近 attachments 路径规则（硬约束）

为什么不用全局 `$OBSIDIAN_REPO/attachments/`：raw 内容和它的图片应该是一个目录单元，移动/备份/迁移作为整体。Obsidian `app.json` 的 `attachmentFolderPath` 是给手动新建笔记用的，**不适用程序化批量采集**。

路径规则按 raw md 的归档层级就近：

| raw md 路径 | 就近 attachments 路径 |
|-------------|----------------------|
| `raw/wechat/{author}/{date}-{slug}.md` | `raw/wechat/{author}/attachments/{date}-{slug}/img_NNN.{ext}` |
| `raw/{author}/{title}.md`（视频） | `raw/{author}/attachments/{slug}/img_NNN.{ext}` |
| `raw/web/{date}-{slug}.md` | `raw/web/attachments/{date}-{slug}/img_NNN.{ext}` |
| `raw/juejin/{book-slug}/{ch}.md` | `raw/juejin/{book-slug}/attachments/{ch}/img_NNN.{ext}` |

raw md 中的图片引用一律用相对 wikilink：`![[attachments/{date-slug}/img_NNN.jpeg]]`（Obsidian 会自动解析相对路径）。

完整提取工作流、各平台 img 标签特性矩阵、OCR 模板、常见陷阱见 **[references/wechat-extract.md](references/wechat-extract.md)**。

## 特殊来源工作流

遇到以下来源时，先读取 [references/source-workflows.md](references/source-workflows.md)，再执行对应专属流程：

| 来源或模式 | 必须读取的章节 |
|-----------|---------------|
| 视频 / 音频 | 视频/音频采集模式（含登录态直链与 ASR 回退） |
| 批量 URL | 批量采集模式（含状态追踪与断点续传） |
| 收藏 / 书签 | 采集收藏/书签 |
| 掘金小册 | 掘金小册采集模式 |
| 微信公众号批量文章 | 微信公众号批量采集模式（含两阶段规范化和七件套 frontmatter） |

这些专属流程仍受本文件的仓库路由、来源优先级、图片路径、写入后验证与职能边界约束。

## 写入后验证

遵循 [frontmatter-schema](references/frontmatter-schema.md) 中的验证清单：
1. **Frontmatter**：确认 tags（非空）、type（预定义值）、updated_at 存在
2. **Wikilink**：扫描所有 `[[xxx]]` 引用，确认目标文件存在于 vault 中
3. **索引**：确认文章已出现在对应 `wiki/{theme}/index.md` 中
4. **交叉引用**：在同目录已有文章中查找 tags 重叠的文章，添加反向链接

### 更新项目 CLAUDE.md 索引段

编译完成后，如果当前在 git 项目中，自动更新项目 CLAUDE.md 中的 Obsidian 索引段。流程参考 [ob-project-log/references/claude-index-format.md](../ob-project-log/references/claude-index-format.md) 中的"共享更新流程"。

**注意**：ob-collect 写入的内容通常在主题目录（wiki/{theme}/），不一定有项目级索引。此时更新会静默跳过，不影响主流程。如果用户已为当前项目建立了 Obsidian 项目索引（wiki/projects/{project}/），则同步更新 CLAUDE.md。

## 异常处理

| 场景 | 处理 |
|------|------|
| 视频无字幕 | OpenCLI download → A2S ASR 转录（见 ASR 回退流程） |
| A2S 转录失败 | 提示用户提供文字稿 |
| web-search 全部 Layer 失败 | 提示用户检查 URL 或手动粘贴内容（路由失败由 web-search 内部处理）|
| 内容为空或过短 | 提示用户确认是否继续 |
| 概念文章已存在 | 读取并更新，不创建重复 |
| 概念冲突 | 在文章中标注矛盾，追加说明 |
| 主题无法自动匹配 | 自动创建新主题目录（kebab-case 英文命名） |
| 批量连续失败（≥3 次） | 自动暂停，报告失败项 |
| HTTP 429/403 | 立即停止，提示等待后重试 |
