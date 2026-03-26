#!/bin/bash

# task-memory start 命令

task_start() {
  local task_name="$1"
  local description="${2:-}"
  local tasks_dir
  local existing_task_id=""

  # 参数校验
  if [[ -z "$task_name" ]]; then
    error "请提供任务名称"
    echo "用法: task-memory start <任务名> [描述]"
    exit 1
  fi

  # 检查是否有进行中的任务
  if has_current_task; then
    local current_id=$(get_current_task_id)
    warn "已有进行中的任务: $current_id"
    echo "请先使用 'task-memory end' 结束当前任务"
    exit 1
  fi

  # 确保存储目录存在
  ensure_storage
  set_storage_paths
  tasks_dir="$(pwd)/$TASKS_DIR"

  if [[ -d "$tasks_dir/$task_name" ]]; then
    existing_task_id="$task_name"
  else
    local found
    found="$(find_task_id_by_name "$task_name")"
    if [[ "$found" == MULTIPLE:* ]]; then
      local candidates="${found#MULTIPLE:}"
      error "存在多个同名任务，请使用任务 ID 恢复"
      for id in $candidates; do
        echo "- $id"
      done
      exit 1
    elif [[ -n "$found" ]]; then
      existing_task_id="$found"
    fi
  fi

  if [[ -n "$existing_task_id" ]]; then
    local init_file="$tasks_dir/$existing_task_id/init.md"
    local existing_task_name
    local existing_description
    existing_task_name=$(grep "^task_name:" "$init_file" 2>/dev/null | head -1 | cut -d: -f2- | sed "s/^ *//; s/^'//; s/'$//")
    existing_description=$(grep "^description:" "$init_file" 2>/dev/null | head -1 | cut -d: -f2- | sed "s/^ *//; s/^'//; s/'$//")

    set_current_task "$existing_task_id" "${existing_task_name:-$task_name}" "${existing_description:-$description}"

    local deviation_count
    deviation_count=$(ls -1 "$tasks_dir/$existing_task_id"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')
    local review_file="$tasks_dir/$existing_task_id/review.md"

    title "任务已恢复"
    echo -e "任务 ID: ${CYAN}$existing_task_id${NC}"
    echo -e "任务名称: ${CYAN}${existing_task_name:-$task_name}${NC}"
    echo -e "偏差记录: ${CYAN}$deviation_count${NC} 个"
    if [[ -f "$review_file" ]]; then
      echo -e "状态: ${YELLOW}该任务已有复盘报告，恢复后可继续追加记录${NC}"
      echo -e "复盘报告: ${CYAN}$review_file${NC}"
    fi
    echo ""
    separator
    return
  fi

  # 生成任务 ID
  local task_id=$(generate_task_id)

  # 创建任务目录
  init_task_dir "$task_id"

  # 设置当前任务
  set_current_task "$task_id" "$task_name" "$description"

  # 写入初始设计文件
  write_init_file "$task_id" "$task_name" "$description"

  local init_file="$(pwd)/$TASKS_DIR/$task_id/init.md"

  title "任务已创建"

  echo -e "任务 ID: ${CYAN}$task_id${NC}"
  echo -e "任务名称: ${CYAN}$task_name${NC}"
  echo -e "描述: ${description:-无}${NC}"
  echo ""
  echo -e "初始设计文件: ${CYAN}$init_file${NC}"
  echo ""
  info "请编辑 init.md 文件，填写初始设计和预期步骤"
  echo ""
  separator
}
