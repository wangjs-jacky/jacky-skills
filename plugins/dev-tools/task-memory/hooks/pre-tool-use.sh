#!/bin/bash

# Task Memory - PreToolUse 钩子
# 检测用户输入中的偏差关键词，提示记录

INPUT="$1"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CURRENT_FILE="$(pwd)/.harness/memory/current.json"

# 检查是否存在当前任务
if [[ ! -f "$CURRENT_FILE" ]]; then
  exit 0
fi

# 偏差关键词列表
DEVIATION_KEYWORDS=(
  "不对"
  "重做"
  "不是这样的"
  "搞错了"
  "bug"
  "修复"
  "问题"
  "错误"
  "失败"
  "为什么"
  "怎么会"
  "没想到"
  "漏了"
  "忘了"
  "疏忽"
)

# 检查输入是否包含关键词
for keyword in "${DEVIATION_KEYWORDS[@]}"; do
  if echo "$INPUT" | grep -qi "$keyword"; then
    # 输出提示
    cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Task Memory 检测到偏差关键词
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检测到关键词: "$keyword"

这看起来可能是一次偏差或修正。是否要记录？
- 输入 /task-memory record "<描述>" 记录这次偏差
- 或继续当前操作

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
    break
  fi
done
