# 新机器 Skill 配置清单（Bootstrap 前置依赖）

> 扫描日期 2026-06-22 · 本机 MacBook Air M2 (ARM64) · 由 5 个 subagent 实读 174 个 SKILL.md 生成。
> 用途：**换新机器时照此表，把所有 skill 的外部前置条件一次配齐。**
> 状态图例：✓ 本机已满足 ／ ✗ 缺失需装 ／ ❓ 需人工确认（登录态/有效性）。

## 总览

| 类别 | 数量 | 说明 |
|------|------|------|
| **纯 prompt（装上即用）** | 97 | 纯方法论/知识/库参考，无任何外部依赖。装好 skill 本体即可用。 |
| **需配置** | 77 | 依赖外部 CLI / 凭证 / 登录 / 配置文件，下面逐类列出。 |
| 合计 | 174 | |

**换新机三步走**：① 搬 `~/.claude/CLAUDE.md` + 几个 config/experience 文件（§4）→ 大批配置变量瞬间满足；② 跑 §1 的 CLI 安装命令；③ 按 §2/§3 补真凭证与登录。§7 的几个 skill 换机也跑不了（公司内网/云沙箱），跳过。

---

## §1 外部 CLI 工具

> 装法可直接 copy。本机已装的换机重装即可；标 ✗ 的是当前就缺的。

### 已装 ✓（换机重装一遍）
```bash
# Homebrew 系
brew install gh ffmpeg yt-dlp ossutil docker jq potrace librsvg poppler himalaya
#   gh=github  ffmpeg/yt-dlp=视频  ossutil=阿里云OSS  librsvg→rsvg-convert(fireworks-tech-graph)
#   poppler→pdftotext(tutor-setup/kb-retriever)  himalaya=邮件  potrace(animate-prompt)

# npm 全局系（node via nvm）
npm i -g vercel @vscode/vsce @wangjs-jacky/j-skills @wangjs-jacky/ticktick-cli \
         @wangjs-jacky/video2text @fly-ai/flyai-cli mcp2cli
npm i -g @jackwener/opencli         # opencli（注意本机用 alias: env -u all_proxy opencli）

# python（anaconda）/ 其它
pip install mlx-whisper             # audio-to-subtitle 本地引擎
# uv / swiftc(Xcode CLT) / cargo·rustc(rustup) / pnpm 按需
xcode-select --install              # 提供 swiftc(claude-monitor) + 基础编译
```

### 缺失 ✗（换机/本机都要补）
| CLI | 哪些 skill 要用 | 装法 | 本机 |
|-----|----------------|------|------|
| `wrangler` | cloudflare / workers-best-practices / turnstile-spin / cloudflare-email-service / sandbox-sdk | `npm i -g wrangler`（或全程 `npx wrangler`） | ✗ 走 npx |
| `aliyun` CLI + agentexplorer 插件 | alibabacloud-find-skills | `curl -fsSL https://aliyuncli.alicdn.com/setup.sh \| bash` → `aliyun configure` → `aliyun plugin install --names agentexplorer` | ✗ |
| `ovsx` | vsix-publish（发 Open VSX） | `npm i -g ovsx`（或 npx） | ✗ 走 npx |
| `playwright-cli` | playwright-cli | 装提供该命令的工具 + `playwright install chromium` | ✗（只有 anaconda 的 `playwright`，命令名不同） |
| `agent-reach` + `pipx` + 子 CLI(`xhs`/`bili`/`mcporter`) | agent-reach | 装 agent-reach → `agent-reach install --env=auto`；`pipx install xiaohongshu-cli bilibili-cli` | ✗ |
| `mmx-cli`(MiniMax TTS) | web-video-presentation（仅合成音频分支） | 装 MiniMax CLI + key；或换其它 TTS | ✗ 可绕过 |
| `pytesseract`+`pdf2image`+`tesseract` | pdf（仅 OCR 路径） | `pip install pytesseract pdf2image` + `brew install tesseract` | ✗ 非 OCR 不需 |
| `autotrace` | animate-prompt（仅自绘 stroke，极脆弱） | skill 自述可绕过 | ✗ 可忽略 |

### 本地项目依赖（需先 clone + build，不是 brew/npm 能装的）
- **`m3u8-dl`**：`cd ~/jacky-github/video-downloader/packages/m3u8-dl && npm run build && npm link`
- **video2text 的 whisper 模型**：装完 CLI 后需下载 whisper.cpp 模型到 node_modules
- **doc-to-tutorial 框架**：clone interactive-tutorial-framework，并在 CLAUDE.md 配 `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH`

---

## §2 凭证 / Token / API Key

### A. 已在 `~/.claude/CLAUDE.md`（换机把 CLAUDE.md 搬过去即满足）
`VSCE_PAT`、`OVSX_PAT`、`OBSIDIAN_REST_API_KEY`、以及一批「skill 配置变量」（`OBSIDIAN_REPO` / `OBSIDIAN_VAULT_NAME` / `VIDEO2TEXT_REPO` / `JACKY_SKILLS_DIR` 等）——这些 skill 运行时从 CLAUDE.md 读，不是 shell env，`printenv` 查不到属正常。**有效性建议换机后人工复核一次。**

### B. 真缺失 ✗（需到对应平台申请后配置）
| 凭证 | 用于 skill | 怎么拿 / 配 |
|------|-----------|-------------|
| `CLOUDFLARE_API_TOKEN`（+`ACCOUNT_ID`） | turnstile-spin（**禁用 wrangler login**，scope 不够） | dash.cloudflare.com/profile/api-tokens 建含 `Turnstile:Edit`+`Workers Scripts:Edit` 的 Custom Token |
| `OPENAI_API_KEY`（+可选 `ENABLE_GARDEN_IMAGEGEN=1`） | gpt-image-2(Mode A) / article-with-images(OpenAI 出图) | platform.openai.com |
| `FEISHU_APP_ID` / `FEISHU_APP_SECRET` | feishu-editor / feishu-reader（**硬需**，内置 fallback 别依赖） | 飞书开放平台建应用 + 开通文档读写权限 |
| `GITLAB_TOKEN`（或 `GITLAB_TOKEN_<HOST>`） | code-review / gitlab-diff-cache / mr-sync（仅私有 GitLab MR） | 有内置兜底，私有库/401 时才需自配 |
| `AGENT_BROWSER_ENCRYPTION_KEY` | agent-browser（用到加密 cookie 时） | `export AGENT_BROWSER_ENCRYPTION_KEY=$(openssl rand -hex 32)` |
| Groq API Key | agent-reach（视频转写） | `agent-reach configure groq-key`（console.groq.com/keys） |
| MiniMax key | web-video-presentation 音频 | MiniMax 平台 |
| `DOUBAO_APP_ID`/`ACCESS_TOKEN` | audio-to-subtitle（豆包云端引擎） | 本机 `~/.audio2subtitle/config.json` 已配（❓复核有效性） |
| `FLYAI_API_KEY` / `VERCEL_TOKEN` | flyai / vercel（均可选，登录可替代） | 可选增强 |

---

## §3 登录 / 认证（含网页端验证，无法纯脚本完成）

| 动作 | 用于 | 本机状态 |
|------|------|---------|
| `gh auth login` | github-repo-publish / gh-workflow-generator / repo-study / github-profile-coolify | ✓ 已登录(wangjs-jacky)，但**缺 `workflow` scope** → `gh auth refresh -h github.com -s workflow` |
| `wrangler login`（Cloudflare 浏览器授权） | cloudflare / workers / sandbox-sdk / cloudflare-email-service | ❓ 需确认（turnstile-spin 走 API Token 不走这个） |
| `vercel login` | deploy-to-vercel / vercel-cli | ❓ `vercel whoami` 返回空，疑似未登录 |
| `npm login`（或 `~/.npmrc` authToken） | npm-publish / github-repo-publish 发包 | ❓ `.npmrc` 有 token 但 `npm whoami` 未过 → 可能过期，发布前复核 |
| `tt login`（滴答清单） | tt / tt-worker / tt-defer | ✓ 已登录 |
| `aliyun configure`（AK/SK） | alibabacloud-find-skills | ✗ |
| Codex 登录（`/codex:setup`） | multi-agent / topic-debate | ✓ codex 1.0.4 已装登录 |
| Tailscale 登录 | ssh-connect / remote-dev-sync | ✓ |
| 各站点浏览器 cookie 登录（抖音/小红书/B站…） | opencli-ops / agent-reach / web-connect | 按需，用到哪个登哪个 |

---

## §4 配置 / 经验文件（换机要随身带的文件）

> 这些是「人配过一次」的状态，换机直接拷过去最省事（含敏感信息的别进公开 git）。

| 文件 | 喂养的 skill | 内容 |
|------|-------------|------|
| **`~/.claude/CLAUDE.md`** ⭐ | 几乎所有（配置变量 + 主机指针） | 换机**第一件事**，一搬一大批配置变量满足 |
| `~/.claude/ob-router.json` | 全部 ob-*（ob-index/tidy/chat/collect/bridge…） | Obsidian 多仓库路由；或换机后 `ob-router init` 重建 |
| `experience.local.md` ×N（gitignored） | ssh-connect（主机/IP 清单）· remote-dev-sync · web-search(Tavily) · opencli-ops | 含内网 IP/凭证，**不进公开 git**，单独拷 |
| `~/.ssh/config` + 私钥 + 远端 authorized_keys | ssh-connect / remote-dev-sync / sync-plugin-to-repo | SSH 别名 + 免密 |
| `~/.npmrc` | npm-publish / 发包 | authToken |
| `~/.config/himalaya/config.toml` | himalaya | 邮箱账户 + IMAP/SMTP |
| `~/.audio2subtitle/config.json` | audio-to-subtitle | 豆包凭证 |
| `~/.config/tt-auto/config.json` | tt-worker | 任务池 projectId |
| `~/.claude.json`（MCP 段） | web-perf / pencil / flyai / web-connect | MCP server 注册（见 §5） |

---

## §5 MCP servers（在 `~/.claude.json` 注册）

| MCP server | 用于 skill | 注册 |
|-----------|-----------|------|
| `chrome-devtools` | web-perf | `npx -y chrome-devtools-mcp@latest`（本机✓已配） |
| `Pencil` | pencil-opencli-workflow / web-connect | 本机✓已配 |
| Fliggy / 飞猪 | flyai | 随 flyai-cli |
| `mcporter`(LinkedIn/exa) | agent-reach(career/search) | ✗ 待装 |

---

## §6 系统级 / 工具链（按项目而非全局）

- **Rust 工具链**（`rustup` → cargo/rustc）：tauri-v2 / tauri-troubleshooting / web-to-tauri-migration-loop（本机 cargo✓）
- **Docker daemon 运行**：sandbox-sdk（`docker info` 须成功）
- **代理端口校准**：claude-network-check 脚本写死 `7890`，本机实际 `10802/10888`，运行前改；web-design-guidelines/agent-browser-troubleshooting 拉 GitHub 需走代理 10802

---

## §7 换机也跑不了 / 受限的 skill（跳过）

| skill | 原因 |
|-------|------|
| 内部业务适配 / 定制测试工具 | 依赖内部框架、私有 npm registry 和内部 MCP，通用机器无法独立运行 |
| 内部仓库同步工具 | 远程硬编码企业内网 Git，换外网机不可用 |
| `feishu-editor` / `feishu-reader` | 需自建飞书应用凭证（内置 fallback 是公司的，不应用） |
| `ppt-generation` | 依赖 `/mnt/skills/public/...` 宿主脚本，面向 **Anthropic 托管沙箱**，本地 Mac 跑不了（本机做 PPT 用 §05 的 web-design-engineer / html-artifacts 替代） |
| `code-review`(GitLab MR 分支) | 内置公司 GitLab token；纯本地 diff 审查不受影响 |

---

## 附录：77 个「需配置」skill 的主依赖速查

> 按主依赖归组，便于「我要用某能力 → 先确认这个依赖在不在」。

- **gh + 登录**：github-repo-publish, gh-workflow-generator, repo-study, github-profile-coolify(+workflow scope)
- **wrangler / Cloudflare**：cloudflare, workers-best-practices, turnstile-spin, cloudflare-email-service, sandbox-sdk
- **OBSIDIAN_REPO + ob-router**：ob-collect, ob-compile, ob-summary, ob-index, ob-tidy, ob-bridge, ob-project-log, ob-topic, ob-chat, ob-benchmark, config-obsidian, article-with-images
- **ffmpeg(+yt-dlp/mlx_whisper)**：audio-to-subtitle, m3u8-dl, fix-neat-video, animate-prompt, video-to-text, agent-reach, ob-collect
- **opencli / CDP**：opencli-ops, web-connect, ob-collect
- **Codex companion**：multi-agent, topic-debate
- **vsce/ovsx + PAT**：vscode-extension-dev, vsix-publish
- **tt CLI + 登录**：tt, tt-worker（tt-defer 仅需 tt 在）
- **vercel + 登录**：deploy-to-vercel, vercel-cli
- **GitLab token（私有）**：code-review, gitlab-diff-cache, mr-sync
- **飞书应用凭证**：feishu-editor, feishu-reader
- **ssh + Tailscale + experience**：ssh-connect, remote-dev-sync
- **node 脚本 + 专用 key/凭证**：图像生成、设计转换、航旅查询、本地知识库、教程、邮件、浏览器自动化、性能分析、文档转教程、桌面迁移、PDF、视频演示、npm 发布等工具；内部仓库同步、业务适配和定制测试工具依赖私有环境，新机器默认跳过。

> 完整逐 skill 明细（功能/依赖/安装/状态）见生成它的 5 份扫描记录（本次会话 subagent 产物）。
