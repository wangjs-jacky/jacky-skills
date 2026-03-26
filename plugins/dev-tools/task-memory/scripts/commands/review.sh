#!/bin/bash

# task-memory review 命令

task_review() {
  local task_id="$1"
  set_storage_paths

  if [[ -z "$task_id" ]]; then
    error "请提供任务 ID"
    echo "用法: task-memory review <任务ID>"
    exit 1
  fi

  local review_file="$(pwd)/$TASKS_DIR/$task_id/review.md"

  if [[ ! -f "$review_file" ]]; then
    error "找不到复盘报告: $review_file"
    echo "提示: 任务可能尚未结束，请先使用 'task-memory end' 结束任务"
    exit 1
  fi

  cat "$review_file"
}
