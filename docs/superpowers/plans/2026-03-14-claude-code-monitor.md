# Claude Code Monitor 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个 Claude Code 监控插件，通过 PreToolUse/PostToolUse hooks 捕获所有工具调用，支持终端/文件/Web 多种输出方式。

**Architecture:** 使用 Claude Code hooks 机制（PreToolUse/PostToolUse）在工具执行前后捕获事件，将事件数据以 JSON Lines 格式写入本地文件，通过 slash 命令控制监控开关。

**Tech Stack:** Bash (hooks), Markdown (commands), HTML/CSS/JS (Web UI)

---

## 文件结构

```
plugins/monitoring/
├── .claude-plugin/
│   └── plugin.json              # 插件配置
├── hooks/
│   ├── hooks.json               # Hook 事件注册
│   ├── run-hook.cmd             # 跨平台脚本包装器
│   ├── pre-tool-use             # PreToolUse hook
│   └── post-tool-use            # PostToolUse hook
├── commands/
│   ├── monitor.md               # /monitor 主命令
│   ├── monitor-on.md            # /monitor-on
│   ├── monitor-off.md           # /monitor-off
│   └── monitor-status.md        # /monitor-status
├── skills/
│   └── claude-monitor/
│       └── SKILL.md             # Monitor skill 定义
├── lib/
│   ├── core.sh                  # 核心逻辑
│   ├── formatter.sh             # 事件格式化
│   ├── output-terminal.sh       # 终端输出
│   └── output-file.sh           # 文件日志
├── web/
│   ├── index.html               # Web 界面
│   ├── styles.css               # 样式
│   └── app.js                   # 前端逻辑
└── docs/
    └── FUTURE-AGENT.md          # 方案 C 扩展路径
```

---

## Chunk 1: 插件骨架与核心库

### Task 1: 创建插件目录结构

**Files:**
- Create: `plugins/monitoring/.claude-plugin/plugin.json`
- Create: `plugins/monitoring/lib/core.sh`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/{.claude-plugin,hooks,commands,skills/claude-monitor,lib,web,docs}
```

- [ ] **Step 2: 创建 plugin.json**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/.claude-plugin/plugin.json << 'EOF'
{
  "name": "monitoring",
  "version": "1.0.0",
  "description": "Claude Code Monitor - 监控工具调用、性能分析、Skills 调试",
  "author": {
    "name": "Jacky Wang",
    "email": "wangjs.jacky@gmail.com",
    "url": "https://github.com/wangjs-jacky"
  },
  "homepage": "https://github.com/wangjs-jacky/jacky-skills/tree/main/plugins/monitoring",
  "repository": "https://github.com/wangjs-jacky/jacky-skills",
  "license": "MIT",
  "keywords": [
    "claude-code",
    "monitor",
    "debugging",
    "profiling",
    "hooks"
  ],
  "skills": [
    "./skills/claude-monitor/"
  ],
  "commands": [
    "./commands/monitor.md",
    "./commands/monitor-on.md",
    "./commands/monitor-off.md",
    "./commands/monitor-status.md"
  ]
}
EOF
```

- [ ] **Step 3: 验证目录创建成功**

```bash
ls -la /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/
```

Expected: 显示 .claude-plugin, hooks, commands, skills, lib, web, docs 目录

- [ ] **Step 4: 创建核心库 lib/core.sh**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/lib/core.sh << 'COREOF'
#!/usr/bin/env bash
# Claude Code Monitor - Core Library
# 核心函数：状态管理、事件记录、输出控制

set -euo pipefail

# ============================================================================
# 常量定义
# ============================================================================
MONITOR_DIR="${HOME}/.claude/monitor"
STATUS_FILE="${MONITOR_DIR}/status.json"
CONFIG_FILE="${MONITOR_DIR}/config.json"
SESSIONS_DIR="${MONITOR_DIR}/sessions"

# ============================================================================
# 状态管理函数
# ============================================================================

# 检查监控是否启用
is_monitor_enabled() {
  [[ -f "$STATUS_FILE" ]] && grep -q '"enabled"[[:space:]]*:[[:space:]]*true' "$STATUS_FILE"
}

# 获取当前会话 ID
get_session_id() {
  if [[ -f "$STATUS_FILE" ]]; then
    grep '"sessionId"' "$STATUS_FILE" | sed 's/.*"sessionId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/'
  else
    echo ""
  fi
}

# 获取当前时间戳（毫秒）
get_timestamp_ms() {
  if date +%s%3N 2>/dev/null | grep -q '^[0-9]*$'; then
    date +%s%3N
  else
    # macOS fallback
    echo $(( $(date +%s) * 1000 ))
  fi
}

# 获取 ISO 8601 时间戳
get_iso_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
}

# 获取当前时间（HH:MM:SS 格式）
get_time_hms() {
  date +"%H:%M:%S"
}

# ============================================================================
# 事件记录函数
# ============================================================================

# 生成事件 ID
generate_event_id() {
  local ts=$(get_timestamp_ms)
  local seq=$(printf "%03d" $(( RANDOM % 1000 )))
  echo "evt_${ts}_${seq}"
}

# 获取工具图标
get_tool_icon() {
  local tool_name="$1"
  case "$tool_name" in
    Read)      echo "📖" ;;
    Write)     echo "✏️" ;;
    Edit)      echo "🔧" ;;
    Bash)      echo "⚡" ;;
    Grep)      echo "🔍" ;;
    Glob)      echo "📁" ;;
    Skill)     echo "🎯" ;;
    Agent)     echo "🤖" ;;
    WebSearch) echo "🌐" ;;
    WebFetch)  echo "🔗" ;;
    AskUserQuestion) echo "❓" ;;
    LSP)       echo "📡" ;;
    NotebookEdit) echo "📓" ;;
    Task)      echo "📋" ;;
    *)         echo "⚙️" ;;
  esac
}

# 记录 PreToolUse 事件
record_pre_event() {
  local tool_input="$1"

  # 解析工具名称
  local tool_name=$(echo "$tool_input" | grep -o '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"toolName"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "Unknown")

  # 生成事件 ID 并存储到临时文件
  local event_id=$(generate_event_id)
  local ts=$(get_timestamp_ms)

  echo "${event_id}|${ts}|${tool_name}" > "${MONITOR_DIR}/.pre_${tool_name}_${ts}"

  # 如果终端输出启用，打印开始事件
  if is_terminal_output_enabled; then
    local icon=$(get_tool_icon "$tool_name")
    echo "$(get_time_hms) │ ${icon} ${tool_name} │ 开始..."
  fi
}

# 记录 PostToolUse 事件
record_post_event() {
  local tool_result="$1"

  # 解析工具名称和结果
  local tool_name=$(echo "$tool_result" | grep -o '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"toolName"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "Unknown")

  # 查找对应的 pre 事件
  local pre_file=$(ls -t "${MONITOR_DIR}"/.pre_${tool_name}_* 2>/dev/null | head -1)
  local event_id="evt_$(get_timestamp_ms)_000"
  local start_ts=$(get_timestamp_ms)

  if [[ -f "$pre_file" ]]; then
    local pre_data=$(cat "$pre_file")
    event_id=$(echo "$pre_data" | cut -d'|' -f1)
    start_ts=$(echo "$pre_data" | cut -d'|' -f2)
    rm -f "$pre_file"
  fi

  # 计算耗时
  local end_ts=$(get_timestamp_ms)
  local duration_ms=$(( end_ts - start_ts ))

  # 解析结果状态
  local status="success"
  if echo "$tool_result" | grep -qi "error\|failed"; then
    status="error"
  fi

  # 提取输出预览
  local output_preview=$(echo "$tool_result" | head -c 200 2>/dev/null || echo "")
  local output_size=${#tool_result}

  # 构建事件 JSON
  local session_id=$(get_session_id)
  local event_json=$(cat <<EOF
{"id":"${event_id}","sessionId":"${session_id}","timestamp":"$(get_iso_timestamp)","type":"tool_call","tool":{"name":"${tool_name}"},"timing":{"start":${start_ts},"end":${end_ts},"duration_ms":${duration_ms}},"result":{"status":"${status}","output_preview":"${output_preview}","output_size":${output_size}}}
EOF
)

  # 写入会话文件
  local session_file="${SESSIONS_DIR}/${session_id}.jsonl"
  echo "$event_json" >> "$session_file"

  # 如果终端输出启用，打印完成事件
  if is_terminal_output_enabled; then
    local icon=$(get_tool_icon "$tool_name")
    local duration_str="${duration_ms}ms"
    if [[ $duration_ms -ge 1000 ]]; then
      duration_str="$(( duration_ms / 1000 )).$(( (duration_ms % 1000) / 100 ))s"
    fi
    echo "$(get_time_hms) │ ${icon} ${tool_name} │ 完成 (${duration_str})"
  fi
}

# ============================================================================
# 输出控制函数
# ============================================================================

# 检查终端输出是否启用
is_terminal_output_enabled() {
  [[ -f "$STATUS_FILE" ]] && grep -q '"terminal"' "$STATUS_FILE"
}

# 检查文件输出是否启用
is_file_output_enabled() {
  [[ -f "$STATUS_FILE" ]] && grep -q '"file"' "$STATUS_FILE"
}

# ============================================================================
# 辅助函数
# ============================================================================

# 初始化监控目录
init_monitor_dir() {
  mkdir -p "$MONITOR_DIR"
  mkdir -p "$SESSIONS_DIR"
}

# 启用监控
enable_monitor() {
  init_monitor_dir

  local session_id="sess_$(date +%s)"
  local start_time=$(date -Iseconds)

  cat > "$STATUS_FILE" << EOF
{
  "enabled": true,
  "sessionId": "${session_id}",
  "startTime": "${start_time}",
  "outputModes": ["terminal", "file"],
  "webPort": 3777
}
EOF

  # 创建空会话文件
  touch "${SESSIONS_DIR}/${session_id}.jsonl"

  echo "✅ 监控已启用"
  echo "   Session ID: ${session_id}"
  echo "   日志文件: ${SESSIONS_DIR}/${session_id}.jsonl"
}

# 禁用监控
disable_monitor() {
  if [[ -f "$STATUS_FILE" ]]; then
    local session_id=$(get_session_id)
    local stop_time=$(date -Iseconds)

    # 更新状态文件
    cat > "$STATUS_FILE" << EOF
{
  "enabled": false,
  "sessionId": "${session_id}",
  "stoppedAt": "${stop_time}"
}
EOF

    echo "⏹️ 监控已禁用"
  else
    echo "⚠️ 监控未启动"
  fi
}

# 显示监控状态
show_status() {
  if [[ ! -f "$STATUS_FILE" ]]; then
    echo "监控未启动"
    echo ""
    echo "使用 /monitor-on 启用监控"
    return
  fi

  echo "📊 监控状态:"
  echo ""
  cat "$STATUS_FILE" | sed 's/[{},"]/ /g' | sed 's/  */ /g' | sed 's/^/  /'

  local session_id=$(get_session_id)
  local session_file="${SESSIONS_DIR}/${session_id}.jsonl"

  if [[ -f "$session_file" ]]; then
    echo ""
    echo "📈 会话统计:"
    local event_count=$(wc -l < "$session_file" | tr -d ' ')
    echo "  - 事件数量: ${event_count}"

    # 统计各工具调用次数
    if command -v jq &>/dev/null; then
      echo "  - 工具分布:"
      cat "$session_file" | jq -r '.tool.name' 2>/dev/null | sort | uniq -c | sort -rn | head -5 | while read count name; do
        echo "    ${name}: ${count}"
      done
    fi
  fi
}
COREOF
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/lib/core.sh
```

- [ ] **Step 5: 验证核心库创建成功**

```bash
head -20 /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/lib/core.sh
```

Expected: 显示 `#!/usr/bin/env bash` 和注释

- [ ] **Step 6: 提交 Chunk 1**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/monitoring/
git commit -m "feat(monitor): 创建插件骨架和核心库

- 添加 plugin.json 插件配置
- 添加 lib/core.sh 核心函数库
- 实现状态管理、事件记录函数"
```

---

### Task 2: 创建 Hook 脚本

**Files:**
- Create: `plugins/monitoring/hooks/hooks.json`
- Create: `plugins/monitoring/hooks/run-hook.cmd`
- Create: `plugins/monitoring/hooks/pre-tool-use`
- Create: `plugins/monitoring/hooks/post-tool-use`

- [ ] **Step 1: 创建 hooks.json**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/hooks.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" pre-tool-use",
            "async": true
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" post-tool-use",
            "async": true
          }
        ]
      }
    ]
  }
}
EOF
```

- [ ] **Step 2: 创建跨平台包装器 run-hook.cmd**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/run-hook.cmd << 'EOF'
: << 'CMDBLOCK'
@echo off
REM Cross-platform polyglot wrapper for hook scripts.
REM On Windows: cmd.exe runs the batch portion, which finds and calls bash.
REM On Unix: the shell interprets this as a script (: is a no-op in bash).
REM
REM Hook scripts use extensionless filenames (e.g. "pre-tool-use" not
REM "pre-tool-use.sh") so Claude Code's Windows auto-detection -- which
REM prepends "bash" to any command containing .sh -- doesn't interfere.
REM
REM Usage: run-hook.cmd <script-name> [args...]

if "%~1"=="" (
    echo run-hook.cmd: missing script name >&2
    exit /b 1
)

set "HOOK_DIR=%~dp0"

REM Try Git for Windows bash in standard locations
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    "C:\Program Files (x86)\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM Try bash on PATH (e.g. user-installed Git Bash, MSYS2, Cygwin)
where bash >nul 2>nul
if %ERRORLEVEL% equ 0 (
    bash "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM No bash found - exit silently rather than error
exit /b 0
CMDBLOCK

# Unix: run the named script directly
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$1"
shift
exec bash "${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"
EOF
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/run-hook.cmd
```

- [ ] **Step 3: 创建 pre-tool-use hook**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/pre-tool-use << 'EOF'
#!/usr/bin/env bash
# PreToolUse hook - 记录工具调用开始

set -euo pipefail

# 确定插件根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 加载核心库
source "${PLUGIN_ROOT}/lib/core.sh"

# 检查监控是否启用
if ! is_monitor_enabled; then
  exit 0
fi

# 从 stdin 读取工具调用信息
if [[ -t 0 ]]; then
  # 无 stdin 输入，直接退出
  exit 0
fi

TOOL_INPUT=$(cat)

# 记录事件
record_pre_event "$TOOL_INPUT"

exit 0
EOF
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/pre-tool-use
```

- [ ] **Step 4: 创建 post-tool-use hook**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/post-tool-use << 'EOF'
#!/usr/bin/env bash
# PostToolUse hook - 记录工具调用结束

set -euo pipefail

# 确定插件根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 加载核心库
source "${PLUGIN_ROOT}/lib/core.sh"

# 检查监控是否启用
if ! is_monitor_enabled; then
  exit 0
fi

# 从 stdin 读取工具调用结果
if [[ -t 0 ]]; then
  # 无 stdin 输入，直接退出
  exit 0
fi

TOOL_RESULT=$(cat)

# 记录事件并计算耗时
record_post_event "$TOOL_RESULT"

exit 0
EOF
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/post-tool-use
```

- [ ] **Step 5: 验证 hook 脚本创建成功**

```bash
ls -la /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/hooks/
```

Expected: 显示 hooks.json, run-hook.cmd, pre-tool-use, post-tool-use，且脚本有执行权限

- [ ] **Step 6: 提交 Task 2**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/monitoring/hooks/
git commit -m "feat(monitor): 添加 PreToolUse/PostToolUse hooks

- hooks.json 注册 hook 事件
- run-hook.cmd 跨平台脚本包装器
- pre-tool-use/post-tool-use hook 脚本"
```

---

### Task 3: 创建 Slash 命令

**Files:**
- Create: `plugins/monitoring/commands/monitor.md`
- Create: `plugins/monitoring/commands/monitor-on.md`
- Create: `plugins/monitoring/commands/monitor-off.md`
- Create: `plugins/monitoring/commands/monitor-status.md`

- [ ] **Step 1: 创建 /monitor 主命令**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/commands/monitor.md << 'EOF'
---
name: monitor
description: 监控 Claude Code 运行状态 - 查看工具调用、性能分析
---

# /monitor - Claude Code Monitor

监控当前会话的工具调用情况，用于调试 Skills 和分析性能。

## 用法

| 命令 | 描述 |
|------|------|
| `/monitor on` | 启用监控 |
| `/monitor off` | 禁用监控 |
| `/monitor status` | 查看监控状态 |

## 快捷命令

- `/monitor-on` - 快速启用监控
- `/monitor-off` - 快速禁用监控
- `/monitor-status` - 快速查看状态

## 功能

- 📊 **全量监控** - 捕获所有工具调用（Read、Bash、Skill、Agent 等）
- ⏱️ **性能分析** - 统计各环节耗时
- 📁 **文件日志** - JSON Lines 格式，支持 jq 查询

## 日志位置

- 状态文件: `~/.claude/monitor/status.json`
- 会话日志: `~/.claude/monitor/sessions/<session-id>.jsonl`

## 示例

```bash
# 查看所有 Read 操作
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.tool.name == "Read")'

# 统计工具调用次数
cat ~/.claude/monitor/sessions/*.jsonl | jq -r '.tool.name' | sort | uniq -c
```
EOF
```

- [ ] **Step 2: 创建 /monitor-on 命令**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/commands/monitor-on.md << 'EOF'
---
name: monitor-on
description: 启用 Claude Code 监控
---

# 启用监控

请执行以下操作来启用 Claude Code 监控：

```bash
# 创建监控目录
mkdir -p ~/.claude/monitor/sessions

# 生成会话 ID
SESSION_ID="sess_$(date +%s)"
START_TIME=$(date -Iseconds)

# 写入状态文件
cat > ~/.claude/monitor/status.json << STATUS_EOF
{
  "enabled": true,
  "sessionId": "${SESSION_ID}",
  "startTime": "${START_TIME}",
  "outputModes": ["terminal", "file"],
  "webPort": 3777
}
STATUS_EOF

# 创建空会话文件
touch ~/.claude/monitor/sessions/${SESSION_ID}.jsonl

# 输出确认信息
echo "✅ 监控已启用"
echo "   Session ID: ${SESSION_ID}"
echo "   日志文件: ~/.claude/monitor/sessions/${SESSION_ID}.jsonl"
```

启用后，所有工具调用（Read、Bash、Skill、Agent 等）将被自动记录。
EOF
```

- [ ] **Step 3: 创建 /monitor-off 命令**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/commands/monitor-off.md << 'EOF'
---
name: monitor-off
description: 禁用 Claude Code 监控
---

# 禁用监控

请执行以下操作来禁用 Claude Code 监控：

```bash
# 检查状态文件是否存在
if [ -f ~/.claude/monitor/status.json ]; then
  # 提取当前会话 ID
  SESSION_ID=$(cat ~/.claude/monitor/status.json | grep -o '"sessionId"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')
  STOP_TIME=$(date -Iseconds)

  # 更新状态文件
  cat > ~/.claude/monitor/status.json << STATUS_EOF
{
  "enabled": false,
  "sessionId": "${SESSION_ID}",
  "stoppedAt": "${STOP_TIME}"
}
STATUS_EOF

  echo "⏹️ 监控已禁用"
  echo "   Session ID: ${SESSION_ID}"
else
  echo "⚠️ 监控未启动"
fi
```

禁用后，工具调用将不再被记录。之前的日志文件仍然保留。
EOF
```

- [ ] **Step 4: 创建 /monitor-status 命令**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/commands/monitor-status.md << 'EOF'
---
name: monitor-status
description: 查看 Claude Code 监控状态
---

# 查看监控状态

请执行以下命令查看监控状态：

```bash
# 检查状态文件
if [ -f ~/.claude/monitor/status.json ]; then
  echo "📊 监控状态:"
  echo ""
  cat ~/.claude/monitor/status.json

  # 提取会话 ID
  SESSION_ID=$(cat ~/.claude/monitor/status.json | grep -o '"sessionId"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')

  # 检查会话文件
  SESSION_FILE=~/.claude/monitor/sessions/${SESSION_ID}.jsonl
  if [ -f "$SESSION_FILE" ]; then
    echo ""
    echo "📈 会话统计:"
    EVENT_COUNT=$(wc -l < "$SESSION_FILE" | tr -d ' ')
    echo "  - 事件数量: ${EVENT_COUNT}"

    # 如果有 jq，显示工具分布
    if command -v jq &>/dev/null; then
      echo "  - 工具分布:"
      cat "$SESSION_FILE" | jq -r '.tool.name' 2>/dev/null | sort | uniq -c | sort -rn | head -5 | while read count name; do
        echo "    ${name}: ${count}"
      done
    fi
  fi
else
  echo "监控未启动"
  echo ""
  echo "使用 /monitor-on 启用监控"
fi
```
EOF
```

- [ ] **Step 5: 验证命令创建成功**

```bash
ls -la /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/commands/
```

Expected: 显示 monitor.md, monitor-on.md, monitor-off.md, monitor-status.md

- [ ] **Step 6: 提交 Task 3**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/monitoring/commands/
git commit -m "feat(monitor): 添加 /monitor slash 命令

- /monitor - 主命令，显示用法
- /monitor-on - 启用监控
- /monitor-off - 禁用监控
- /monitor-status - 查看状态和统计"
```

---

### Task 4: 创建 Skill 定义

**Files:**
- Create: `plugins/monitoring/skills/claude-monitor/SKILL.md`

- [ ] **Step 1: 创建 SKILL.md**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/skills/claude-monitor/SKILL.md << 'EOF'
---
name: claude-monitor
description: Claude Code Monitor - 监控 Claude Code 运行状态。当用户想查看 Claude Code 在做什么、是否在"偷懒"、执行了哪些操作时触发此 skill。
---

# Claude Code Monitor

监控 Claude Code 的运行状态，记录所有工具调用，用于调试 Skills 和分析性能。

## 触发场景

- 用户问"Claude Code 在做什么"
- 用户想查看当前会话的执行情况
- 用户想分析某个 Skill 的执行流程
- 用户想排查 Skill 执行慢的原因

## 快速开始

### 1. 启用监控

```
/monitor-on
```

### 2. 执行你的任务

正常使用 Claude Code，所有工具调用会被自动记录。

### 3. 查看状态

```
/monitor-status
```

### 4. 禁用监控

```
/monitor-off
```

## 日志文件

| 文件 | 位置 | 描述 |
|------|------|------|
| 状态文件 | `~/.claude/monitor/status.json` | 当前监控状态 |
| 会话日志 | `~/.claude/monitor/sessions/<id>.jsonl` | 事件流（JSON Lines） |

## 事件格式

每个工具调用生成一条 JSON 记录：

```json
{
  "id": "evt_1705123456789_001",
  "sessionId": "sess_1705123456789",
  "timestamp": "2026-03-14T21:30:56.789Z",
  "type": "tool_call",
  "tool": {
    "name": "Read"
  },
  "timing": {
    "start": 1705123456789,
    "end": 1705123456800,
    "duration_ms": 11
  },
  "result": {
    "status": "success",
    "output_size": 8690
  }
}
```

## 查询示例

使用 `jq` 查询日志：

```bash
# 查看所有 Read 操作
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.tool.name == "Read")'

# 统计工具调用次数
cat ~/.claude/monitor/sessions/*.jsonl | jq -r '.tool.name' | sort | uniq -c | sort -rn

# 查看耗时超过 1s 的操作
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.timing.duration_ms > 1000)'

# 生成统计报告
cat ~/.claude/monitor/sessions/*.jsonl | jq -s '
  {
    total_events: length,
    tools: (group_by(.tool.name) | map({name: .[0].tool.name, count: length})),
    total_duration_ms: (map(.timing.duration_ms) | add // 0)
  }
'
```

## 监控的工具

| 工具 | 图标 | 描述 |
|------|------|------|
| Read | 📖 | 文件读取 |
| Write | ✏️ | 文件写入 |
| Edit | 🔧 | 文件编辑 |
| Bash | ⚡ | 命令执行 |
| Grep | 🔍 | 内容搜索 |
| Glob | 📁 | 文件搜索 |
| Skill | 🎯 | Skill 调用 |
| Agent | 🤖 | 子代理 |
| WebSearch | 🌐 | 网络搜索 |
| Task | 📋 | 后台任务 |

## 使用场景

### 场景 1：调试 Skill 执行流程

1. 启用监控
2. 执行你的 Skill
3. 查看日志，分析执行了哪些步骤

### 场景 2：分析性能瓶颈

1. 启用监控
2. 执行慢的 Skill
3. 查询耗时超过 1s 的操作：

```bash
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.timing.duration_ms > 1000)'
```

### 场景 3：验证 Skill 行为

1. 启用监控
2. 执行 Skill
3. 检查日志，确认是否符合预期
EOF
```

- [ ] **Step 2: 验证 Skill 创建成功**

```bash
head -30 /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/skills/claude-monitor/SKILL.md
```

Expected: 显示 frontmatter 和标题

- [ ] **Step 3: 提交 Task 4**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/monitoring/skills/
git commit -m "feat(monitor): 添加 claude-monitor skill 定义

- 完整的 skill 文档
- 触发场景说明
- 使用示例和 jq 查询"
```

---

## Chunk 2: Web 界面与文档

### Task 5: 创建 Web 界面

**Files:**
- Create: `plugins/monitoring/web/index.html`
- Create: `plugins/monitoring/web/styles.css`
- Create: `plugins/monitoring/web/app.js`

- [ ] **Step 1: 创建 index.html**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/web/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Monitor</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1>🖥️ Claude Code Monitor</h1>
        <span class="session-id" id="sessionId">Session: --</span>
      </div>
      <div class="header-right">
        <button class="btn" id="refreshBtn">🔄 刷新</button>
        <button class="btn" id="openFileBtn">📁 打开日志</button>
      </div>
    </header>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value" id="eventCount">0</span>
        <span class="stat-label">events</span>
      </div>
      <div class="stat">
        <span class="stat-value" id="totalDuration">0s</span>
        <span class="stat-label">duration</span>
      </div>
      <div class="stat">
        <span class="stat-value" id="toolCount">0</span>
        <span class="stat-label">tools</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <input type="text" class="filter-input" id="filterInput" placeholder="过滤工具名称...">
      <select class="filter-select" id="statusFilter">
        <option value="all">全部状态</option>
        <option value="success">成功</option>
        <option value="error">错误</option>
      </select>
    </div>

    <!-- Timeline -->
    <div class="timeline" id="timeline">
      <div class="empty-state">
        <p>暂无事件数据</p>
        <p>请先使用 /monitor-on 启用监控</p>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
EOF
```

- [ ] **Step 2: 创建 styles.css**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/web/styles.css << 'EOF'
/* Claude Code Monitor - Terminal Noir Theme */

:root {
  --color-bg: #0a0a0b;
  --color-bg-elevated: #131316;
  --color-bg-hover: #1a1a1d;
  --color-text: #e5e5e7;
  --color-text-muted: #6b6b76;
  --color-primary: #00ff88;
  --color-primary-dim: rgba(0, 255, 136, 0.15);
  --color-border: rgba(255, 255, 255, 0.06);
  --color-success: #00ff88;
  --color-error: #ff4757;
  --color-warning: #ffb800;
  --color-blue: #00d4ff;
  --color-purple: #bf5af2;
  --color-yellow: #ffd60a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 20px;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.session-id {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-family: 'SF Mono', Monaco, monospace;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* Buttons */
.btn {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-input {
  flex: 1;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.875rem;
}

.filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filter-select {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Timeline */
.timeline {
  background: var(--color-bg-elevated);
  border-radius: 8px;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.event-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.2s;
}

.event-item:hover {
  background: var(--color-bg-hover);
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  width: 70px;
  flex-shrink: 0;
}

.event-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.event-detail {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-duration {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  width: 60px;
  text-align: right;
  flex-shrink: 0;
}

.event-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 12px;
  flex-shrink: 0;
}

.event-status.success {
  background: var(--color-success);
}

.event-status.error {
  background: var(--color-error);
}

/* Tool Colors */
.tool-read { color: var(--color-blue); }
.tool-write { color: var(--color-success); }
.tool-edit { color: var(--color-warning); }
.tool-bash { color: var(--color-yellow); }
.tool-grep { color: var(--color-blue); }
.tool-skill { color: var(--color-purple); }
.tool-agent { color: var(--color-purple); }

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
  }

  .stats-bar {
    flex-wrap: wrap;
  }

  .filter-bar {
    flex-direction: column;
  }
}
EOF
```

- [ ] **Step 3: 创建 app.js**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/web/app.js << 'EOF'
// Claude Code Monitor - Web UI

const TOOL_ICONS = {
  Read: '📖',
  Write: '✏️',
  Edit: '🔧',
  Bash: '⚡',
  Grep: '🔍',
  Glob: '📁',
  Skill: '🎯',
  Agent: '🤖',
  WebSearch: '🌐',
  WebFetch: '🔗',
  AskUserQuestion: '❓',
  LSP: '📡',
  NotebookEdit: '📓',
  Task: '📋',
  default: '⚙️'
};

const TOOL_COLORS = {
  Read: 'tool-read',
  Write: 'tool-write',
  Edit: 'tool-edit',
  Bash: 'tool-bash',
  Grep: 'tool-grep',
  Skill: 'tool-skill',
  Agent: 'tool-agent'
};

let events = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshBtn').addEventListener('click', loadEvents);
  document.getElementById('openFileBtn').addEventListener('click', openLogFile);
  document.getElementById('filterInput').addEventListener('input', renderTimeline);
  document.getElementById('statusFilter').addEventListener('change', renderTimeline);

  loadEvents();
});

// 加载事件（模拟数据，实际需要从文件读取）
async function loadEvents() {
  // 由于浏览器安全限制，无法直接读取本地文件
  // 这里显示提示信息
  const timeline = document.getElementById('timeline');

  timeline.innerHTML = `
    <div class="empty-state">
      <p>📂 Web 界面需要通过本地服务器访问</p>
      <p>请在终端运行以下命令查看日志：</p>
      <code style="display: block; margin-top: 16px; padding: 12px; background: #1a1a1d; border-radius: 6px; font-family: monospace;">
        cat ~/.claude/monitor/sessions/*.jsonl | jq
      </code>
    </div>
  `;

  // 更新统计
  updateStats([]);
}

// 打开日志文件（提示用户）
function openLogFile() {
  alert('请在终端运行以下命令打开日志目录：\n\nopen ~/.claude/monitor/sessions/');
}

// 更新统计信息
function updateStats(events) {
  document.getElementById('eventCount').textContent = events.length;

  const totalDuration = events.reduce((sum, e) => sum + (e.timing?.duration_ms || 0), 0);
  document.getElementById('totalDuration').textContent = formatDuration(totalDuration);

  const uniqueTools = new Set(events.map(e => e.tool?.name).filter(Boolean));
  document.getElementById('toolCount').textContent = uniqueTools.size;
}

// 渲染时间线
function renderTimeline() {
  const filterText = document.getElementById('filterInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;

  const filtered = events.filter(event => {
    const toolName = event.tool?.name?.toLowerCase() || '';
    const matchesText = !filterText || toolName.includes(filterText);

    const status = event.result?.status || 'success';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesText && matchesStatus;
  });

  const timeline = document.getElementById('timeline');

  if (filtered.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state">
        <p>没有匹配的事件</p>
      </div>
    `;
    return;
  }

  timeline.innerHTML = filtered.map(event => {
    const icon = TOOL_ICONS[event.tool?.name] || TOOL_ICONS.default;
    const colorClass = TOOL_COLORS[event.tool?.name] || '';
    const time = new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour12: false });
    const duration = formatDuration(event.timing?.duration_ms || 0);
    const status = event.result?.status || 'success';

    return `
      <div class="event-item">
        <span class="event-time">${time}</span>
        <span class="event-icon">${icon}</span>
        <div class="event-content">
          <div class="event-name ${colorClass}">${event.tool?.name || 'Unknown'}</div>
          <div class="event-detail">${truncate(event.result?.output_preview || '', 50)}</div>
        </div>
        <span class="event-duration">${duration}</span>
        <span class="event-status ${status}"></span>
      </div>
    `;
  }).join('');
}

// 格式化时长
function formatDuration(ms) {
  if (!ms) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// 截断文本
function truncate(str, maxLen) {
  if (!str) return '';
  str = str.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}
EOF
```

- [ ] **Step 4: 验证 Web 文件创建成功**

```bash
ls -la /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/web/
```

Expected: 显示 index.html, styles.css, app.js

- [ ] **Step 5: 提交 Task 5**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/monitoring/web/
git commit -m "feat(monitor): 添加 Web 界面

- index.html - 页面结构
- styles.css - Terminal Noir 主题样式
- app.js - 事件展示和过滤逻辑"
```

---

### Task 6: 创建文档

**Files:**
- Create: `plugins/monitoring/docs/FUTURE-AGENT.md`

- [ ] **Step 1: 创建 FUTURE-AGENT.md**

```bash
cat > /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/docs/FUTURE-AGENT.md << 'EOF'
# Agent 模式（方案 C）- 未来扩展

本文档描述 Claude Code Monitor 的未来升级路径：Agent 模式。

## 当前状态（方案 A）

- Hook 脚本捕获事件 → 写入文件 → 静态 Web 页面
- 需要手动刷新查看最新数据
- 适合事后分析

## 目标状态（方案 C）

- Hook 脚本捕获事件 → Agent 持续监听 → WebSocket 实时推送
- Web 页面实时更新
- 适合实时监控

## 升级路径

```
Phase 1 (当前)                    Phase 2 (目标)
┌─────────────────┐               ┌─────────────────┐
│  PreToolUse     │               │  PreToolUse     │
│  PostToolUse    │               │  PostToolUse    │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  事件数据       │               │  事件数据       │
│  (JSON Lines)   │  ──────────▶  │  (JSON Lines)   │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  文件存储       │               │  后台 Agent     │
│  (单次写入)     │               │  (持续监听)     │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  静态 Web 页面  │               │  WebSocket 推送 │
│  (手动刷新)     │               │  (实时更新)     │
└─────────────────┘               └─────────────────┘
```

## 实现步骤

### 1. 创建 Agent 进程

新增 `agent/` 目录：

```
agent/
├── monitor-agent.sh      # Agent 主进程
├── file-watcher.sh       # 文件监听器
└── websocket-server.py   # WebSocket 服务器
```

### 2. 文件监听器

使用 `fswatch` 或 `inotifywait` 监听会话文件变化：

```bash
#!/bin/bash
# file-watcher.sh

SESSION_FILE="$1"
fswatch -o "$SESSION_FILE" | while read; do
  # 读取新增内容并发送
  tail -1 "$SESSION_FILE" | send_to_websocket
done
```

### 3. WebSocket 服务器

使用 Python 的 `websockets` 库：

```python
# websocket-server.py
import asyncio
import websockets
import json

connected_clients = set()

async def handler(websocket):
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.discard(websocket)

async def broadcast(event):
    for client in connected_clients:
        await client.send(json.dumps(event))

async def main():
    async with websockets.serve(handler, "localhost", 3778):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
```

### 4. 更新 Web 前端

在 `app.js` 中添加 WebSocket 客户端：

```javascript
const ws = new WebSocket('ws://localhost:3778');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  events.push(data);
  renderTimeline();
  updateStats(events);
};
```

### 5. 新增命令

- `/monitor-agent` - 启动 Agent 模式
- `/monitor-agent-stop` - 停止 Agent

## 接口兼容性

为了确保平滑升级，保持以下接口不变：

| 接口 | 说明 |
|------|------|
| 数据格式 | JSON Lines（每行一个事件） |
| 存储位置 | `~/.claude/monitor/sessions/` |
| Hook 脚本 | `hooks/pre-tool-use`, `hooks/post-tool-use` |
| 状态文件 | `~/.claude/monitor/status.json` |

## 依赖

Agent 模式需要额外安装：

- `fswatch` (macOS) 或 `inotify-tools` (Linux)
- Python 3.7+
- `websockets` Python 库

## 时间线

- **Q1 2026**: 方案 A MVP（当前）
- **Q2 2026**: 方案 C Agent 模式
EOF
```

- [ ] **Step 2: 提交 Task 6**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/monitoring/docs/
git commit -m "docs(monitor): 添加 Agent 模式扩展路径文档

- 描述方案 C 的实现步骤
- 保持接口兼容性
- WebSocket 实时推送方案"
```

---

## 最终提交

- [ ] **提交所有更改并推送到远程**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add -A
git status
```

确认无误后：

```bash
git push origin main
```

---

## 验证清单

完成实现后，验证以下功能：

- [ ] `/monitor-on` 能成功启用监控
- [ ] `/monitor-status` 能显示监控状态
- [ ] `/monitor-off` 能成功禁用监控
- [ ] Hook 脚本能正确捕获工具调用
- [ ] 会话文件正确记录事件
- [ ] Web 界面能正常访问

---

## 测试命令

```bash
# 测试核心库
source /Users/jiashengwang/jacky-github/jacky-skills/plugins/monitoring/lib/core.sh
is_monitor_enabled && echo "enabled" || echo "disabled"

# 手动启用监控
enable_monitor

# 查看状态
show_status

# 禁用监控
disable_monitor
```
