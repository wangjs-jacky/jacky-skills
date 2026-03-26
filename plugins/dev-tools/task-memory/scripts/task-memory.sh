#!/bin/bash

# Task Memory - 主入口脚本
# 用法: task-memory <command> [args...]

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMMANDS_DIR="$SCRIPT_DIR/commands"
LIB_DIR="$SCRIPT_DIR/lib"

# 加载公共库
source "$LIB_DIR/common.sh"
source "$LIB_DIR/storage.sh"

# 检查依赖
require_dependencies() {
  if ! command -v jq >/dev/null 2>&1; then
    error "缺少依赖: jq"
    echo "请先安装 jq 后重试。"
    exit 1
  fi
}

# 显示帮助
show_help() {
  cat <<EOF
Task Memory - 长任务对话记录工具

用法:
  task-memory <command> [args...]

命令:
  start <任务名|任务ID> [描述] 开始新任务或恢复已有任务
  save [描述]                 保存当前进展（record 的别名）
  record <描述>               记录偏差
  recall [任务名|任务ID]      回忆任务摘要（默认当前任务）
  history [任务名|任务ID]     查看完整历史
  status                      查看当前状态
  list                        列出所有任务
  end                         结束任务并生成复盘报告
  review <任务ID>             查看复盘报告
  help                     显示帮助

示例:
  task-memory start "修复登录 bug"
  task-memory save "完成登录 API 初版"
  task-memory recall
  task-memory history
  task-memory status
  task-memory end
EOF
}

# 解析命令
COMMAND="${1:-help}"
shift || true

require_dependencies

case "$COMMAND" in
  start)
    source "$COMMANDS_DIR/start.sh"
    task_start "$@"
    ;;
  save)
    source "$COMMANDS_DIR/record.sh"
    task_save "$@"
    ;;
  record)
    source "$COMMANDS_DIR/record.sh"
    task_record "$@"
    ;;
  recall)
    source "$COMMANDS_DIR/recall.sh"
    task_recall "$@"
    ;;
  history)
    source "$COMMANDS_DIR/history.sh"
    task_history "$@"
    ;;
  status)
    source "$COMMANDS_DIR/status.sh"
    task_status "$@"
    ;;
  end)
    source "$COMMANDS_DIR/end.sh"
    task_end "$@"
    ;;
  list)
    source "$COMMANDS_DIR/list.sh"
    task_list "$@"
    ;;
  review)
    source "$COMMANDS_DIR/review.sh"
    task_review "$@"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    error "未知命令: $COMMAND"
    show_help
    exit 1
    ;;
esac
