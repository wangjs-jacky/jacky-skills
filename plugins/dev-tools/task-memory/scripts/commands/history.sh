#!/bin/bash

# task-memory history 命令

task_history() {
  local selector="${1:-}"
  local task_id=""
  set_storage_paths

  local tasks_dir="$(pwd)/$TASKS_DIR"

  if [[ -n "$selector" ]]; then
    if [[ -d "$tasks_dir/$selector" ]]; then
      task_id="$selector"
    else
      local found
      found="$(find_task_id_by_name "$selector")"
      if [[ "$found" == MULTIPLE:* ]]; then
        local candidates="${found#MULTIPLE:}"
        error "存在多个同名任务，请使用任务 ID"
        for id in $candidates; do
          echo "- $id"
        done
        exit 1
      fi
      task_id="$found"
    fi
  fi

  if [[ -z "$task_id" && has_current_task ]]; then
    task_id="$(get_current_task_id)"
  fi

  if [[ -z "$task_id" ]]; then
    task_id="$(get_latest_task_id)"
  fi

  if [[ -z "$task_id" ]]; then
    info "暂无历史记录"
    exit 0
  fi

  local task_dir="$tasks_dir/$task_id"
  if [[ ! -d "$task_dir" ]]; then
    error "找不到任务: $task_id"
    exit 1
  fi

  title "任务历史: $task_id"

  if [[ -f "$task_dir/init.md" ]]; then
    echo "=== init.md ==="
    cat "$task_dir/init.md"
    echo ""
  fi

  local file
  for file in "$task_dir"/deviation-*.md; do
    [[ -f "$file" ]] || continue
    echo "=== $(basename "$file") ==="
    cat "$file"
    echo ""
  done

  if [[ -f "$task_dir/review.md" ]]; then
    echo "=== review.md ==="
    cat "$task_dir/review.md"
    echo ""
  fi

  separator
}
