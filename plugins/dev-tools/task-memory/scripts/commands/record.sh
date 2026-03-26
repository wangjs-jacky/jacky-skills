#!/bin/bash

# task-memory record/save 命令

task_record() {
  local description="$1"
  local trigger="${2:-manual}"
  set_storage_paths

  # 参数校验
  if [[ -z "$description" ]]; then
    error "请提供偏差描述"
    echo "用法: task-memory record <描述>"
    exit 1
  fi

  # 检查是否有进行中的任务
  if ! has_current_task; then
    error "没有进行中的任务"
    echo "请先使用 'task-memory start' 开始一个任务"
    exit 1
  fi

  local task_id=$(get_current_task_id)
  local sequence=$(get_next_deviation_sequence "$task_id")

  # 追加偏差记录
  append_deviation_record "$task_id" "$sequence" "$description" "$trigger"

  local deviation_file="$(pwd)/$TASKS_DIR/$task_id/deviation-$sequence.md"

  title "偏差记录已创建"

  echo -e "任务 ID: ${CYAN}$task_id${NC}"
  echo -e "偏差序号: ${CYAN}$sequence${NC}"
  echo ""
  echo -e "偏差描述: ${YELLOW}$description${NC}"
  echo ""
  echo -e "记录文件: ${CYAN}$deviation_file${NC}"
  echo ""
  info "请编辑 deviation-$sequence.md 文件，填写发现原因、修复方案和根因分析"
  echo ""
  separator
}

task_save() {
  local description="${1:-会话进展}"
  local trigger="${2:-manual}"
  task_record "$description" "$trigger"
}
