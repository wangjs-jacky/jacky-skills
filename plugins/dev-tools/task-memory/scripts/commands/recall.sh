#!/bin/bash

# task-memory recall 命令

resolve_target_task_id() {
  local input="${1:-}"
  local tasks_dir

  set_storage_paths
  tasks_dir="$(pwd)/$TASKS_DIR"

  if [[ -n "$input" ]]; then
    if [[ -d "$tasks_dir/$input" ]]; then
      echo "$input"
      return
    fi

    local found
    found="$(find_task_id_by_name "$input")"
    if [[ "$found" == MULTIPLE:* ]]; then
      local candidates="${found#MULTIPLE:}"
      error "存在多个同名任务，请使用任务 ID"
      for id in $candidates; do
        echo "- $id"
      done
      exit 1
    fi

    if [[ -n "$found" ]]; then
      echo "$found"
      return
    fi
  fi

  if has_current_task; then
    get_current_task_id
    return
  fi

  get_latest_task_id
}

task_recall() {
  local selector="${1:-}"
  local task_id
  task_id="$(resolve_target_task_id "$selector")"

  if [[ -z "$task_id" ]]; then
    info "暂无可回忆的任务记录"
    exit 0
  fi

  set_storage_paths
  local task_dir="$(pwd)/$TASKS_DIR/$task_id"
  local init_file="$task_dir/init.md"
  local review_file="$task_dir/review.md"
  local task_name="未知任务"
  local created_at="未知"
  local description=""
  local deviation_count=0
  local status="paused"
  local last_updated="未知"

  if [[ -f "$init_file" ]]; then
    task_name=$(grep "^task_name:" "$init_file" 2>/dev/null | head -1 | cut -d: -f2- | sed "s/^ *//; s/^'//; s/'$//")
    description=$(grep "^description:" "$init_file" 2>/dev/null | head -1 | cut -d: -f2- | sed "s/^ *//; s/^'//; s/'$//")
    created_at=$(grep "^created_at:" "$init_file" 2>/dev/null | head -1 | cut -d: -f2- | sed 's/^ *//')
  fi

  deviation_count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')

  if [[ -f "$review_file" ]]; then
    status="completed"
    last_updated=$(grep "^created_at:" "$review_file" 2>/dev/null | head -1 | cut -d: -f2- | sed 's/^ *//')
  elif has_current_task && [[ "$(get_current_task_id)" == "$task_id" ]]; then
    status="in_progress"
    last_updated=$(jq -r '.started_at // empty' "$(pwd)/$CURRENT_FILE" 2>/dev/null)
  else
    local latest_file
    latest_file=$(ls -1t "$task_dir"/deviation-*.md "$init_file" 2>/dev/null | head -1)
    if [[ -n "$latest_file" ]]; then
      last_updated=$(grep "^created_at:" "$latest_file" 2>/dev/null | head -1 | cut -d: -f2- | sed 's/^ *//')
    fi
  fi

  title "任务回忆"
  echo -e "任务 ID: ${CYAN}$task_id${NC}"
  echo -e "任务名称: ${CYAN}$task_name${NC}"
  echo -e "状态: ${CYAN}$status${NC}"
  echo -e "创建时间: ${CYAN}$created_at${NC}"
  echo -e "最近更新: ${CYAN}${last_updated:-未知}${NC}"
  echo -e "偏差记录: ${CYAN}$deviation_count${NC} 个"
  if [[ -n "$description" ]]; then
    echo ""
    echo "任务目标:"
    echo "$description"
  fi

  if [[ $deviation_count -gt 0 ]]; then
    echo ""
    echo "最近偏差:"
    ls -1t "$task_dir"/deviation-*.md 2>/dev/null | head -5 | while read -r file; do
      local seq
      local desc
      seq=$(basename "$file" .md | sed 's/deviation-//')
      desc="$(extract_deviation_description "$file")"
      echo -e "  ${YELLOW}[$seq]${NC} ${desc:-无描述}"
    done
  fi

  if [[ -f "$review_file" ]]; then
    echo ""
    echo -e "复盘报告: ${CYAN}$review_file${NC}"
  fi

  echo ""
  separator
}
