#!/bin/bash

# task-memory list 命令

task_list() {
  set_storage_paths
  local tasks_dir="$(pwd)/$TASKS_DIR"

  if [[ ! -d "$tasks_dir" ]]; then
    info "暂无任务记录"
    exit 0
  fi

  local total=$(ls -1d "$tasks_dir"/*/ 2>/dev/null | wc -l | tr -d ' ')

  if [[ $total -eq 0 ]]; then
    info "暂无任务记录"
    exit 0
  fi

  title "任务列表 (共 $total 个)"

  printf "  %-30s | %-25s | %-8s | %s\n" "任务 ID" "任务名称" "偏差数" "创建日期"
  echo "  ─────────────────────────────────────────────────────────────────────"

  ls -1t "$tasks_dir" | head -20 | while read task_id; do
    local init_file="$tasks_dir/$task_id/init.md"
    local task_name=$(grep "^task_name:" "$init_file" 2>/dev/null | cut -d: -f2- | sed "s/^ *//; s/^'//; s/'$//")
    local created=$(grep "^created_at:" "$init_file" 2>/dev/null | cut -d: -f2- | sed 's/^ *//' | cut -dT -f1)
    local deviation_count=$(ls -1 "$tasks_dir/$task_id"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')

    task_name="${task_name:-未知}"
    created="${created:-未知}"

    printf "  %-30s | %-25s | %-8s | %s\n" "$task_id" "${task_name:0:25}" "$deviation_count" "$created"
  done

  echo ""
  separator
}
