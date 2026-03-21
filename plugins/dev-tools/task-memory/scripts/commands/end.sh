#!/bin/bash

# task-memory end 命令

task_end() {
  if ! has_current_task; then
    error "没有进行中的任务"
    exit 1
  fi

  local task_info=$(get_current_task_info)
  local task_id=$(echo "$task_info" | jq -r '.task_id')
  local task_name=$(echo "$task_info" | jq -r '.task_name')
  local started_at=$(echo "$task_info" | jq -r '.started_at')

  local task_dir="$(pwd)/$TASKS_DIR/$task_id"
  local deviation_count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')

  # 生成复盘报告
  generate_review_report "$task_id" "$task_name" "$started_at"

  # 清除当前任务
  clear_current_task

  local review_file="$(pwd)/$TASKS_DIR/$task_id/review.md"

  title "任务已结束"

  echo -e "任务 ID: ${CYAN}$task_id${NC}"
  echo -e "任务名称: ${CYAN}$task_name${NC}"
  echo -e "偏差记录: ${CYAN}$deviation_count${NC} 个"
  echo ""
  echo -e "复盘报告: ${CYAN}$review_file${NC}"
  echo ""
  separator
}
