#!/bin/bash

# Task Memory - 存储操作库

STORAGE_DIR=".task-memory"
TASKS_DIR="$STORAGE_DIR/tasks"
CURRENT_FILE="$STORAGE_DIR/current.json"

# 初始化任务目录
init_task_dir() {
  local task_id="$1"
  mkdir -p "$(pwd)/$TASKS_DIR/$task_id"
}

# 设置当前任务
set_current_task() {
  local task_id="$1"
  local task_name="$2"
  local description="${3:-}"

  cat > "$(pwd)/$CURRENT_FILE" <<EOF
{
  "task_id": "$task_id",
  "task_name": "$task_name",
  "description": "$description",
  "started_at": "$(get_timestamp)"
}
EOF
}

# 清除当前任务
clear_current_task() {
  rm -f "$(pwd)/$CURRENT_FILE"
}

# 获取下一个偏差序号
get_next_deviation_sequence() {
  local task_id="$1"
  local task_dir="$(pwd)/$TASKS_DIR/$task_id"
  local count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')
  printf "%02d" $((count + 1))
}

# 获取下一个偏差序号
get_next_deviation_sequence() {
  local task_id="$1"
  local task_dir="$(pwd)/$TASKS_DIR/$task_id"
  local count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')
  printf "%02d" $((count + 1))
}

# 写入初始设计文件
write_init_file() {
  local task_id="$1"
  local task_name="$2"
  local description="$3"
  local output_file="$(pwd)/$TASKS_DIR/$task_id/init.md"

  cat > "$output_file" <<EOF
---
task_id: $task_id
type: init
created_at: $(get_timestamp)
task_name: $task_name
description: $description
---

## 任务目标

$description

## 初始设计

1.
2.
3.

## 涉及文件

-
EOF
}

# 追加偏差记录
append_deviation_record() {
  local task_id="$1"
  local sequence="$2"
  local description="$3"
  local trigger="${4:-manual}"
  local output_file="$(pwd)/$TASKS_DIR/$task_id/deviation-$sequence.md"

  cat > "$output_file" <<EOF
---
task_id: $task_id
type: deviation
sequence: $sequence
created_at: $(get_timestamp)
trigger: $trigger
related_files: []
---

## 问题描述

$description

## 发现原因



## 修复方案



## 根因分析

EOF
}

# 生成复盘报告
generate_review_report() {
  local task_id="$1"
  local task_name="$2"
  local started_at="$3"
  local output_file="$(pwd)/$TASKS_DIR/$task_id/review.md"
  local ended_at=$(get_timestamp)
  local task_dir="$(pwd)/$TASKS_DIR/$task_id"

  # 统计偏差数量
  local deviation_count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')

  cat > "$output_file" <<EOF
---
task_id: $task_id
type: review
created_at: $ended_at
total_deviation: $deviation_count
---

# 复盘：$task_name

## 统计

- 开始时间: $started_at
- 结束时间: $ended_at
- 偏差次数: $deviation_count

## 偏差列表

EOF

  # 列出所有偏差
  if [[ $deviation_count -gt 0 ]]; then
    for file in "$task_dir"/deviation-*.md; do
      local seq=$(basename "$file" .md | sed 's/deviation-//')
      local desc=$(grep "^## 问题描述" -A1 "$file" 2>/dev/null | tail -1 | sed 's/^ *//')
      echo "- [$seq] ${desc:-无描述}" >> "$output_file"
    done
  else
    echo "无偏差记录" >> "$output_file"
  fi

  echo "" >> "$output_file"
  echo "---" >> "$output_file"
  echo "" >> "$output_file"
  echo "可手动补充改进建议。" >> "$output_file"
}
