#!/bin/bash

# Task Memory - 公共函数库

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1" >&2
}

# 打印分隔线
separator() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 打印标题
title() {
  echo ""
  separator
  echo -e "${CYAN}$1${NC}"
  separator
  echo ""
}

# 生成任务 ID
generate_task_id() {
  local prefix="task"
  local date=$(date +%Y-%m-%d)
  local tasks_dir="$(pwd)/.task-memory/tasks"

  # 确保目录存在
  mkdir -p "$tasks_dir"

  # 计算当日序号
  local sequence=$(ls -1d "$tasks_dir"/"$prefix-$date"-* 2>/dev/null | wc -l | tr -d ' ')
  sequence=$((sequence + 1))
  printf "%s-%s-%03d" "$prefix" "$date" "$sequence"
}

# 获取时间戳 (ISO 8601)
get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# 获取本地时间
get_local_time() {
  date +"%Y-%m-%d %H:%M:%S"
}

# 确保存储目录存在
ensure_storage() {
  mkdir -p "$(pwd)/.task-memory/tasks"
}

# 检查是否有进行中的任务
has_current_task() {
  local current_file="$(pwd)/.task-memory/current.json"
  [[ -f "$current_file" ]] && [[ -n $(jq -r '.task_id // empty' "$current_file" 2>/dev/null) ]]
}

# 获取当前任务 ID
get_current_task_id() {
  local current_file="$(pwd)/.task-memory/current.json"
  jq -r '.task_id // empty' "$current_file" 2>/dev/null
}

# 获取当前任务信息
get_current_task_info() {
  local current_file="$(pwd)/.task-memory/current.json"
  if [[ -f "$current_file" ]]; then
    cat "$current_file"
  else
    echo "{}"
  fi
}
