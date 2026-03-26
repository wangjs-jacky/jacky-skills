#!/bin/bash

# Task Memory - 存储操作库

PRIMARY_STORAGE_DIR=".harness/memory"
LEGACY_STORAGE_DIR=".task-memory"

resolve_storage_dir() {
  local primary_root="$(pwd)/$PRIMARY_STORAGE_DIR"
  local legacy_root="$(pwd)/$LEGACY_STORAGE_DIR"
  local primary_tasks="$primary_root/tasks"
  local legacy_tasks="$legacy_root/tasks"

  if [[ -d "$primary_tasks" ]] && [[ -n "$(ls -A "$primary_tasks" 2>/dev/null)" ]]; then
    echo "$PRIMARY_STORAGE_DIR"
    return
  fi

  if [[ -d "$legacy_tasks" ]] && [[ -n "$(ls -A "$legacy_tasks" 2>/dev/null)" ]]; then
    echo "$LEGACY_STORAGE_DIR"
    return
  fi

  if [[ -f "$primary_root/current.json" && -d "$primary_tasks" ]]; then
    echo "$PRIMARY_STORAGE_DIR"
    return
  fi

  if [[ -f "$legacy_root/current.json" && -d "$legacy_tasks" ]]; then
    echo "$LEGACY_STORAGE_DIR"
    return
  fi

  if [[ -f "$primary_root/current.json" ]]; then
    echo "$PRIMARY_STORAGE_DIR"
    return
  fi

  if [[ -f "$legacy_root/current.json" ]]; then
    echo "$LEGACY_STORAGE_DIR"
    return
  fi

  if [[ -d "$primary_tasks" ]]; then
    echo "$PRIMARY_STORAGE_DIR"
    return
  fi

  if [[ -d "$legacy_tasks" ]]; then
    echo "$LEGACY_STORAGE_DIR"
    return
  fi

  echo "$PRIMARY_STORAGE_DIR"
}

set_storage_paths() {
  STORAGE_DIR="$(resolve_storage_dir)"
  TASKS_DIR="$STORAGE_DIR/tasks"
  CURRENT_FILE="$STORAGE_DIR/current.json"
}

sanitize_inline_text() {
  local text="${1:-}"
  text="${text//$'\r'/ }"
  text="${text//$'\n'/ }"
  echo "$text"
}

yaml_quote() {
  local value
  value="$(sanitize_inline_text "$1")"
  value="${value//\'/\'\'}"
  printf "'%s'" "$value"
}

extract_deviation_description() {
  local file="$1"
  awk '
    BEGIN { in_block=0 }
    /^## 问题描述/ { in_block=1; next }
    in_block && /^## / { exit }
    in_block {
      line=$0
      gsub(/^[ \t]+|[ \t]+$/, "", line)
      if (line != "") {
        print line
        exit
      }
    }
  ' "$file"
}

get_latest_task_id() {
  set_storage_paths
  local tasks_dir="$(pwd)/$TASKS_DIR"
  if [[ ! -d "$tasks_dir" ]]; then
    return
  fi
  ls -1t "$tasks_dir" 2>/dev/null | head -1
}

find_task_id_by_name() {
  local task_name="$1"
  set_storage_paths
  local tasks_dir="$(pwd)/$TASKS_DIR"

  if [[ ! -d "$tasks_dir" ]]; then
    return
  fi

  local matched=()
  local task_id
  for task_id in $(ls -1 "$tasks_dir" 2>/dev/null); do
    local init_file="$tasks_dir/$task_id/init.md"
    [[ -f "$init_file" ]] || continue
    local found_name
    found_name=$(grep "^task_name:" "$init_file" 2>/dev/null | head -1 | cut -d: -f2- | sed "s/^ *//; s/^'//; s/'$//")
    if [[ "$found_name" == "$task_name" ]]; then
      matched+=("$task_id")
    fi
  done

  if [[ ${#matched[@]} -eq 1 ]]; then
    echo "${matched[0]}"
    return
  fi

  if [[ ${#matched[@]} -gt 1 ]]; then
    printf "MULTIPLE:%s" "${matched[*]}"
    return
  fi
}

sync_storage_aliases() {
  local source_file="$1"
  local alias_name="$2"
  set_storage_paths

  local source_root="$(pwd)/$STORAGE_DIR"
  local alias_root
  if [[ "$STORAGE_DIR" == "$PRIMARY_STORAGE_DIR" ]]; then
    alias_root="$(pwd)/$LEGACY_STORAGE_DIR"
  else
    alias_root="$(pwd)/$PRIMARY_STORAGE_DIR"
  fi

  mkdir -p "$source_root" "$alias_root"
  cp "$source_file" "$source_root/$alias_name"
  cp "$source_file" "$alias_root/$alias_name"
}

# 初始化任务目录
init_task_dir() {
  local task_id="$1"
  set_storage_paths
  mkdir -p "$(pwd)/$TASKS_DIR/$task_id"
}

# 设置当前任务
set_current_task() {
  local task_id="$1"
  local task_name="$2"
  local description="${3:-}"
  set_storage_paths

  local current_path="$(pwd)/$CURRENT_FILE"
  mkdir -p "$(dirname "$current_path")"

  jq -n \
    --arg task_id "$task_id" \
    --arg task_name "$task_name" \
    --arg description "$description" \
    --arg started_at "$(get_timestamp)" \
    '{
      task_id: $task_id,
      task_name: $task_name,
      description: $description,
      started_at: $started_at
    }' > "$current_path"

  local alt_current
  if [[ "$CURRENT_FILE" == "$PRIMARY_STORAGE_DIR/current.json" ]]; then
    alt_current="$(pwd)/$LEGACY_STORAGE_DIR/current.json"
  else
    alt_current="$(pwd)/$PRIMARY_STORAGE_DIR/current.json"
  fi
  mkdir -p "$(dirname "$alt_current")"
  cp "$current_path" "$alt_current"
}

# 清除当前任务
clear_current_task() {
  set_storage_paths
  rm -f "$(pwd)/$PRIMARY_STORAGE_DIR/current.json" "$(pwd)/$LEGACY_STORAGE_DIR/current.json"
}

# 获取下一个偏差序号
get_next_deviation_sequence() {
  local task_id="$1"
  set_storage_paths
  local task_dir="$(pwd)/$TASKS_DIR/$task_id"
  local count=$(ls -1 "$task_dir"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')
  printf "%02d" $((count + 1))
}

# 写入初始设计文件
write_init_file() {
  local task_id="$1"
  local task_name="$2"
  local description="$3"
  set_storage_paths
  local output_file="$(pwd)/$TASKS_DIR/$task_id/init.md"

  local yaml_task_name
  local yaml_description
  yaml_task_name="$(yaml_quote "$task_name")"
  yaml_description="$(yaml_quote "$description")"

  cat > "$output_file" <<EOF
---
task_id: $task_id
type: init
created_at: $(get_timestamp)
task_name: $yaml_task_name
description: $yaml_description
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

  sync_storage_aliases "$output_file" "init.md"
}

# 追加偏差记录
append_deviation_record() {
  local task_id="$1"
  local sequence="$2"
  local description="$3"
  local trigger="${4:-manual}"
  set_storage_paths
  local output_file="$(pwd)/$TASKS_DIR/$task_id/deviation-$sequence.md"

  local yaml_trigger
  yaml_trigger="$(yaml_quote "$trigger")"

  cat > "$output_file" <<EOF
---
task_id: $task_id
type: deviation
sequence: $sequence
created_at: $(get_timestamp)
trigger: $yaml_trigger
related_files: []
---

## 问题描述

$description

## 发现原因



## 修复方案



## 根因分析

EOF

  sync_storage_aliases "$output_file" "last-deviation.md"
}

# 生成复盘报告
generate_review_report() {
  local task_id="$1"
  local task_name="$2"
  local started_at="$3"
  set_storage_paths
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
      local desc
      desc="$(extract_deviation_description "$file")"
      echo "- [$seq] ${desc:-无描述}" >> "$output_file"
    done
  else
    echo "无偏差记录" >> "$output_file"
  fi

  echo "" >> "$output_file"
  echo "---" >> "$output_file"
  echo "" >> "$output_file"
  echo "可手动补充改进建议。" >> "$output_file"

  sync_storage_aliases "$output_file" "review.md"
}

set_storage_paths
