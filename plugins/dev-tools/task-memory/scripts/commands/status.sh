#!/bin/bash

# task-memory status 命令

task_status() {
  if ! has_current_task; then
    info "当前没有进行中的任务"
    exit 0
  fi

  local task_info=$(get_current_task_info)
  local task_id=$(echo "$task_info" | jq -r '.task_id')
  local task_name=$(echo "$task_info" | jq -r '.task_name')
  local started_at=$(echo "$task_info" | jq -r '.started_at')

  local task_dir="$(pwd)/$TASKS_DIR/$task_id"
  local deviation_count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')

  title "当前任务状态"

  echo -e "任务 ID: ${CYAN}$task_id${NC}"
  echo -e "任务名称: ${CYAN}$task_name${NC}"
  echo -e "开始时间: ${CYAN}$started_at${NC}"
  echo -e "偏差记录: ${CYAN}$deviation_count${NC} 个"
  echo ""

  # 显示最近的偏差
  if [[ $deviation_count -gt 0 ]]; then
    echo "最近偏差:"
    ls -1t "$task_dir"/deviation-*.md 2>/dev/null | head -3 | while read file; do
      local seq=$(basename "$file" .md | sed 's/deviation-//')
      local desc=$(grep "^## 问题描述" -A1 "$file" 2>/dev/null | tail -1 | sed 's/^ *//')
      echo -e "  ${YELLOW}[$seq]${NC} ${desc:-无描述}"
    done
  fi

  echo ""
  separator
}
