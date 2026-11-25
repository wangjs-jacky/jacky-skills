#!/usr/bin/env bash
# ============================================================
# 新机器 Skill 前置依赖 — 自动安装（非交互部分）
# 配套清单：docs/新机器-skill-配置清单.md
#
# 只装「能脚本化」的 CLI（brew / npm -g / pip）；幂等：已装的跳过。
# 登录 / token / 搬配置文件 这些没法自动，结尾会打印手动清单。
#
# 用法：
#   bash bootstrap-new-machine.sh            # 实际安装
#   bash bootstrap-new-machine.sh --dry-run  # 只打印将执行的命令，不装
#
# 硬约束：本机是 Apple Silicon，统一用 ARM 原生 Homebrew (/opt/homebrew)。
# ============================================================
set -u
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
BREW=/opt/homebrew/bin/brew

g(){ printf "\033[32m%s\033[0m\n" "$*"; }   # 绿
y(){ printf "\033[33m%s\033[0m\n" "$*"; }   # 黄
r(){ printf "\033[31m%s\033[0m\n" "$*"; }   # 红
hd(){ printf "\n\033[1m== %s ==\033[0m\n" "$*"; }
have(){ command -v "$1" >/dev/null 2>&1; }
run(){ if [ "$DRY" = 1 ]; then echo "  [dry-run] $*"; else echo "  + $*"; eval "$*" || r "  ! 失败（继续）: $*"; fi; }

# ---- 前置：ARM Homebrew ----
if [ ! -x "$BREW" ]; then
  r "未找到 ARM Homebrew ($BREW)。先装（原生 ARM）："
  echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  exit 1
fi
if ! have node || ! have npm; then
  r "缺 node/npm。先装 nvm + node（本机用 nvm 管理）后再跑本脚本。"; exit 1
fi

ensure_brew(){ # cmd formula
  if have "$1"; then g "✓ $1"; else y "✗ $1 → brew install $2"; run "$BREW install $2"; fi
}
ensure_npm(){ # cmd package
  if have "$1"; then g "✓ $1"; else y "✗ $1 → npm i -g $2"; run "npm i -g $2"; fi
}
ensure_pip(){ # cmd package
  if have "$1"; then g "✓ $1"; else y "✗ $1 → pip install $2"; run "pip install $2"; fi
}

hd "Homebrew CLI（视频/发布/邮件/图形工具链）"
ensure_brew gh gh
ensure_brew ffmpeg ffmpeg
ensure_brew yt-dlp yt-dlp
ensure_brew ossutil ossutil
ensure_brew jq jq
ensure_brew potrace potrace
ensure_brew rsvg-convert librsvg
ensure_brew pdftotext poppler
ensure_brew himalaya himalaya
ensure_brew pipx pipx
ensure_brew docker docker   # 仅 CLI；daemon 另需 Docker Desktop / colima

hd "npm 全局 CLI（发布/采集/Obsidian/部署）"
ensure_npm vercel vercel
ensure_npm wrangler wrangler
ensure_npm vsce @vscode/vsce
ensure_npm ovsx ovsx
ensure_npm j-skills j-skills
ensure_npm opencli @jackwener/opencli
ensure_npm tt @wangjs-jacky/ticktick-cli
ensure_npm video2text @wangjs-jacky/video2text
ensure_npm flyai @fly-ai/flyai-cli
ensure_npm s @serverless-devs/s

hd "pip（转写/MCP 桥）"
ensure_pip mlx_whisper mlx-whisper
ensure_pip mcp2cli mcp2cli

hd "Xcode Command Line Tools（swiftc → claude-monitor 悬浮窗）"
if have swiftc; then g "✓ swiftc"; else y "✗ → xcode-select --install"; run "xcode-select --install"; fi

hd "本地项目依赖（需先 clone 仓库）"
M3U8="$HOME/jacky-github/video-downloader/packages/m3u8-dl"
if have m3u8-dl; then g "✓ m3u8-dl 已 link"
elif [ -d "$M3U8" ]; then y "→ build + link m3u8-dl"; run "cd '$M3U8' && npm run build && npm link"
else r "✗ m3u8-dl：先 clone video-downloader 到 ~/jacky-github 再重跑"; fi

# ============================================================
hd "✅ 自动部分完成 —— 以下需你手动处理（无法脚本化）"
cat <<'EOF'

【1】从旧机搬这些文件（含登录态/凭证/经验，别进公开 git）：
  ~/.claude/CLAUDE.md            ⭐ 第一优先，一搬一大批 skill 配置变量满足
  ~/.claude/ob-router.json       （或新机跑 `ob-router init` 重建）
  ~/.claude.json                 （MCP server 注册：chrome-devtools / Pencil / Fliggy）
  experience.local.md × N        （ssh-connect 主机清单 / remote-dev-sync / web-search Tavily / opencli-ops）
  ~/.ssh/config + 私钥           （+ 远端 authorized_keys 加公钥）
  ~/.npmrc                       （npm 发布 token）
  ~/.config/himalaya/config.toml （邮箱）
  ~/.audio2subtitle/config.json  （豆包 ASR）
  ~/.config/tt-auto/config.json  （tt-worker 任务池）

【2】登录 / 认证（含网页验证）：
  gh auth login  &&  gh auth refresh -h github.com -s workflow   # 补 workflow scope
  wrangler login            # Cloudflare 浏览器授权
  vercel login
  npm whoami                # 验证 .npmrc token 是否过期，过期则 npm login
  tt login                  # 滴答清单
  tailscale up              # 远程连接
  /codex:setup              # Codex（multi-agent/topic-debate）
  # aliyun（alibabacloud-find-skills）：
  curl -fsSL https://aliyuncli.alicdn.com/setup.sh | bash
  aliyun configure && aliyun plugin install --names agentexplorer

【3】导出真凭证（建议写进 ~/.zshrc 或对应 skill 的 config）：
  CLOUDFLARE_API_TOKEN   # turnstile-spin（权限含 Turnstile:Edit + Workers Scripts:Edit；禁用 wrangler login）
  OPENAI_API_KEY         # gpt-image-2 / article-with-images
  FEISHU_APP_ID / FEISHU_APP_SECRET   # feishu-editor / feishu-reader
  AGENT_BROWSER_ENCRYPTION_KEY=$(openssl rand -hex 32)   # agent-browser 加密
  # Groq key（agent-reach 转写）: agent-reach configure groq-key

【4】特殊：
  - agent-reach 子 CLI：agent-reach install --env=auto；pipx install xiaohongshu-cli bilibili-cli
  - playwright-cli：本机命令名特殊，需单独装提供该命令的工具
  - claude-network-check：脚本里代理端口写死 7890，改成本机实际 10802/10888
  - 跑不了的（跳过）：内部业务适配 / 定制测试工具（依赖私有环境）、演示文稿生成工具（云沙箱专用）

明细见同目录《新机器-skill-配置清单.md》。
EOF
g "\nDone."
