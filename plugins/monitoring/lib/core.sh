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
