#!/bin/bash

# task-memory start 命令

task_start() {
  local task_name="$1"
  local description="${2:-}"

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
