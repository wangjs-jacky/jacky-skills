#!/bin/bash

# Task Memory - Stop 钩子
# 会话结束时检查是否有进行中的任务，提示保存

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CURRENT_FILE_PRIMARY="$(pwd)/.harness/memory/current.json"
CURRENT_FILE_LEGACY="$(pwd)/.task-memory/current.json"
CURRENT_FILE="$CURRENT_FILE_PRIMARY"

if [[ ! -f "$CURRENT_FILE" && -f "$CURRENT_FILE_LEGACY" ]]; then
  CURRENT_FILE="$CURRENT_FILE_LEGACY"
fi

# 检查是否存在当前任务
if [[ ! -f "$CURRENT_FILE" ]]; then
  exit 0
fi

# 读取当前任务信息
TASK_ID=$(jq -r '.task_id // empty' "$CURRENT_FILE" 2>/dev/null)

if [[ -z "$TASK_ID" ]]; then
  exit 0
fi

TASK_NAME=$(jq -r '.task_name // empty' "$CURRENT_FILE" 2>/dev/null)

# 输出提示信息
cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Task Memory 提醒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检测到有进行中的任务:
  任务 ID: $TASK_ID
  任务名称: ${TASK_NAME:-未知}

本次会话即将结束，建议：
1. 使用 /task-memory save "本次进展" 记录本次进展
2. 使用 /task-memory recall 查看任务摘要
3. 如果任务已完成，使用 /task-memory end 结束

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
