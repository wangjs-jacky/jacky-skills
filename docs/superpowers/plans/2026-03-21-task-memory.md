# Task Memory 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个长任务对话记录工具，帮助开发者复盘初始设计与实际执行的偏差，改进 prompt 设计。

**Architecture:** 采用 Skill + Hooks + 脚本的混合架构。SKILL.md 定义命令和流程，Shell 脚本处理文件操作，Hooks 实现自动化触发。数据存储在项目目录的 `.task-memory/` 中。

**Tech Stack:** Bash 脚本、Markdown + YAML frontmatter、Claude Code Hooks

---

## 文件结构

```
plugins/dev-tools/task-memory/
├── SKILL.md                    # Skill 主文件
├── scripts/
│   ├── task-memory.sh          # 主入口脚本
│   ├── lib/
│   │   ├── common.sh           # 公共函数
│   │   └── storage.sh          # 存储操作
│   └── commands/
│       ├── start.sh            # 开始任务
│       ├── record.sh           # 记录偏差
│       ├── status.sh           # 查看状态
│       ├── end.sh              # 结束任务
│       ├── list.sh             # 列出任务
│       └── review.sh           # 查看复盘
├── templates/
│   ├── init.md.tpl             # 初始设计模板
│   └── deviation.md.tpl        # 偏差记录模板
└── hooks/
    ├── hooks.json              # Hooks 配置
    ├── on-stop.sh              # Stop 钩子
    └── pre-tool-use.sh         # PreToolUse 钩子
```

---

## Chunk 1: 基础设施（公共库和模板）

### Task 1.1: 创建目录结构

**Files:**
- Create: `plugins/dev-tools/task-memory/` 目录结构

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/{scripts/{lib,commands},templates,hooks}
```

- [ ] **Step 2: 验证目录创建成功**

```bash
ls -la /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/
```

Expected: 显示 scripts、templates、hooks 目录

---

### Task 1.2: 公共函数库 (common.sh)

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/lib/common.sh`

- [ ] **Step 1: 创建 common.sh**

```bash
#!/bin/bash

# Task Memory - 公共函数库

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1" >&2
}

# 打印分隔线
separator() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 打印标题
title() {
  echo ""
  separator
  echo -e "${CYAN}$1${NC}"
  separator
  echo ""
}

# 生成任务 ID
generate_task_id() {
  local prefix="task"
  local date=$(date +%Y-%m-%d)
  local tasks_dir="$(pwd)/.task-memory/tasks"

  # 确保目录存在
  mkdir -p "$tasks_dir"

  # 计算当日序号
  local sequence=$(ls -1d "$tasks_dir"/"$prefix-$date"-* 2>/dev/null | wc -l | tr -d ' ')
  sequence=$((sequence + 1))
  printf "%s-%s-%03d" "$prefix" "$date" "$sequence"
}

# 获取时间戳 (ISO 8601)
get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# 获取本地时间
get_local_time() {
  date +"%Y-%m-%d %H:%M:%S"
}

# 确保存储目录存在
ensure_storage() {
  mkdir -p "$(pwd)/.task-memory/tasks"
}

# 检查是否有进行中的任务
has_current_task() {
  local current_file="$(pwd)/.task-memory/current.json"
  [[ -f "$current_file" ]] && [[ -n $(jq -r '.task_id // empty' "$current_file" 2>/dev/null) ]]
}

# 获取当前任务 ID
get_current_task_id() {
  local current_file="$(pwd)/.task-memory/current.json"
  jq -r '.task_id // empty' "$current_file" 2>/dev/null
}

# 获取当前任务信息
get_current_task_info() {
  local current_file="$(pwd)/.task-memory/current.json"
  if [[ -f "$current_file" ]]; then
    cat "$current_file"
  else
    echo "{}"
  fi
}
```

- [ ] **Step 2: 验证文件创建**

```bash
cat /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/scripts/lib/common.sh | head -20
```

Expected: 显示文件前 20 行

---

### Task 1.3: 存储操作库 (storage.sh)

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/lib/storage.sh`

- [ ] **Step 1: 创建 storage.sh**

```bash
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
```

- [ ] **Step 2: 验证文件创建**

```bash
cat /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/scripts/lib/storage.sh | head -20
```

Expected: 显示文件前 20 行

---

### Task 1.4: 提交基础设施

- [ ] **Step 1: 提交代码**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/dev-tools/task-memory/scripts/lib/
git commit -m "feat(task-memory): add common and storage libraries"
```

---

## Chunk 2: 核心命令脚本

### Task 2.1: 主入口脚本 (task-memory.sh)

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/task-memory.sh`

- [ ] **Step 1: 创建 task-memory.sh**

```bash
#!/bin/bash

# Task Memory - 主入口脚本
# 用法: task-memory <command> [args...]

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMMANDS_DIR="$SCRIPT_DIR/commands"
LIB_DIR="$SCRIPT_DIR/lib"

# 加载公共库
source "$LIB_DIR/common.sh"
source "$LIB_DIR/storage.sh"

# 显示帮助
show_help() {
  cat <<EOF
Task Memory - 长任务对话记录工具

用法:
  task-memory <command> [args...]

命令:
  start <任务名> [描述]    开始新任务
  record <描述>            记录偏差
  status                   查看当前状态
  end                      结束任务并生成复盘报告
  list                     列出所有任务
  review <任务ID>          查看复盘报告
  help                     显示帮助

示例:
  task-memory start "修复登录 bug"
  task-memory record "发现接口返回结构不一致"
  task-memory status
  task-memory end
EOF
}

# 解析命令
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  start)
    source "$COMMANDS_DIR/start.sh"
    task_start "$@"
    ;;
  record)
    source "$COMMANDS_DIR/record.sh"
    task_record "$@"
    ;;
  status)
    source "$COMMANDS_DIR/status.sh"
    task_status "$@"
    ;;
  end)
    source "$COMMANDS_DIR/end.sh"
    task_end "$@"
    ;;
  list)
    source "$COMMANDS_DIR/list.sh"
    task_list "$@"
    ;;
  review)
    source "$COMMANDS_DIR/review.sh"
    task_review "$@"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    error "未知命令: $COMMAND"
    show_help
    exit 1
    ;;
esac
```

- [ ] **Step 2: 设置执行权限**

```bash
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/scripts/task-memory.sh
```

---

### Task 2.2: start 命令

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/commands/start.sh`

- [ ] **Step 1: 创建 start.sh**

```bash
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
  echo -e "描述: ${description:-无}"
  echo ""
  echo -e "初始设计文件: ${CYAN}$init_file${NC}"
  echo ""
  info "请编辑 init.md 文件，填写初始设计和预期步骤"
  echo ""
  separator
}
```

- [ ] **Step 2: 验证文件创建**

```bash
cat /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/scripts/commands/start.sh
```

---

### Task 2.3: record 命令

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/commands/record.sh`

- [ ] **Step 1: 创建 record.sh**

```bash
#!/bin/bash

# task-memory record 命令

task_record() {
  local description="$1"
  local trigger="${2:-manual}"

  # 参数校验
  if [[ -z "$description" ]]; then
    error "请提供偏差描述"
    echo "用法: task-memory record <描述>"
    exit 1
  fi

  # 检查是否有进行中的任务
  if ! has_current_task; then
    error "没有进行中的任务"
    echo "请先使用 'task-memory start' 开始一个任务"
    exit 1
  fi

  local task_id=$(get_current_task_id)
  local sequence=$(get_next_deviation_sequence "$task_id")

  # 追加偏差记录
  append_deviation_record "$task_id" "$sequence" "$description" "$trigger"

  local deviation_file="$(pwd)/$TASKS_DIR/$task_id/deviation-$sequence.md"

  title "偏差记录已创建"

  echo -e "任务 ID: ${CYAN}$task_id${NC}"
  echo -e "偏差序号: ${CYAN}$sequence${NC}"
  echo ""
  echo -e "偏差描述: ${YELLOW}$description${NC}"
  echo ""
  echo -e "记录文件: ${CYAN}$deviation_file${NC}"
  echo ""
  info "请编辑 deviation-$sequence.md 文件，填写发现原因、修复方案和根因分析"
  echo ""
  separator
}
```

---

### Task 2.4: status 命令

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/commands/status.sh`

- [ ] **Step 1: 创建 status.sh**

```bash
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
```

---

### Task 2.5: end 命令

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/commands/end.sh`

- [ ] **Step 1: 创建 end.sh**

```bash
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
```

---

### Task 2.6: list 命令

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/commands/list.sh`

- [ ] **Step 1: 创建 list.sh**

```bash
#!/bin/bash

# task-memory list 命令

task_list() {
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
    local task_name=$(grep "^task_name:" "$init_file" 2>/dev/null | cut -d: -f2- | sed 's/^ *//')
    local created=$(grep "^created_at:" "$init_file" 2>/dev/null | cut -d: -f2- | sed 's/^ *//' | cut -dT -f1)
    local deviation_count=$(ls -1 "$tasks_dir/$task_id"/deviation-*.md 2>/dev/null | wc -l | tr -d ' ')

    task_name="${task_name:-未知}"
    created="${created:-未知}"

    printf "  %-30s | %-25s | %-8s | %s\n" "$task_id" "${task_name:0:25}" "$deviation_count" "$created"
  done

  echo ""
  separator
}
```

---

### Task 2.7: review 命令

**Files:**
- Create: `plugins/dev-tools/task-memory/scripts/commands/review.sh`

- [ ] **Step 1: 创建 review.sh**

```bash
#!/bin/bash

# task-memory review 命令

task_review() {
  local task_id="$1"

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
```

---

### Task 2.8: 提交核心命令

- [ ] **Step 1: 设置所有脚本执行权限**

```bash
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/scripts/commands/*.sh
```

- [ ] **Step 2: 提交代码**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/dev-tools/task-memory/scripts/
git commit -m "feat(task-memory): add core command scripts"
```

---

## Chunk 3: SKILL.md 主文件

### Task 3.1: 创建 SKILL.md

**Files:**
- Create: `plugins/dev-tools/task-memory/SKILL.md`

- [ ] **Step 1: 创建 SKILL.md**

```markdown
---
name: task-memory
description: 长任务对话记录工具。记录任务执行过程中的偏差，帮助改进 prompt 设计。触发于 /task-memory 命令或"任务记录"、"偏差记录"、"prompt 复盘"等关键词。
---

# Task Memory - 长任务对话记录工具

## 用途

记录开发任务从开始到结束的完整过程，重点关注：
- 初始设计/Prompt 的内容
- 执行过程中发现的偏差和修正
- 最终复盘分析，改进未来的 prompt 设计

## 前提条件

**需要安装 jq（JSON 处理工具）：**

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## 命令

### /task-memory start <任务名> [描述]

开始一个新任务，记录初始设计。

**参数**：
- `<任务名>`：任务的简短标识（必填）
- `[描述]`：任务的详细描述（可选）

**示例**：
```
/task-memory start "修复登录 bug" "用户反馈登录后页面白屏"
```

**行为**：
1. 在 `.task-memory/tasks/` 下创建新任务目录
2. 生成 `init.md`，包含：
   - 任务目标
   - 初始设计方案（需手动填写）
   - 预期步骤（需手动填写）
   - 涉及的文件（需手动填写）
3. 更新 `.task-memory/current.json` 标记当前任务

---

### /task-memory record <描述>

记录一次偏差或修正。

**参数**：
- `<描述>`：偏差的简短描述（必填）

**示例**：
```
/task-memory record "发现事件冒泡导致点击无响应"
```

**行为**：
1. 检测当前是否有进行中的任务
2. 生成 `deviation-XX.md` 文件，包含：
   - 问题描述
   - 发现原因（需手动填写）
   - 修复方案（需手动填写）
   - 根因分析（需手动填写）

---

### /task-memory status

查看当前任务状态。

**输出**：
- 当前任务信息（ID、名称、开始时间）
- 已记录的偏差数量
- 最近 3 条偏差摘要

---

### /task-memory end

结束当前任务，生成复盘报告。

**行为**：
1. 汇总所有偏差记录
2. 生成 `review.md`，包含：
   - 时间线统计
   - 偏差列表
3. 清空 `.task-memory/current.json`

---

### /task-memory list

列出项目中所有任务记录。

---

### /task-memory review <任务ID>

重新查看某个任务的复盘报告。

**示例**：
```
/task-memory review task-2026-03-21-001
```

---

## 文件格式

### init.md（初始设计）

```markdown
---
task_id: task-2026-03-21-001
type: init
created_at: 2026-03-21T10:00:00Z
task_name: 修复登录 bug
description: 用户反馈登录后页面白屏
---

## 任务目标

用户反馈登录后页面白屏

## 初始设计

1. 检查登录接口返回
2. 检查路由跳转逻辑
3. 检查页面渲染条件

## 涉及文件

- src/pages/Login.tsx
- src/services/auth.ts
```

### deviation-XX.md（偏差记录）

```markdown
---
task_id: task-2026-03-21-001
type: deviation
sequence: 01
created_at: 2026-03-21T11:30:00Z
trigger: manual
related_files:
  - src/pages/Login.tsx
---

## 问题描述

点击登录按钮后页面白屏

## 发现原因

登录接口返回的数据结构与预期不一致

## 修复方案

修改数据访问路径，添加防御性检查

## 根因分析

初始设计时没有先打印接口返回数据确认结构
```

### review.md（复盘报告）

```markdown
---
task_id: task-2026-03-21-001
type: review
created_at: 2026-03-21T14:00:00Z
total_deviation: 2
---

# 复盘：修复登录 bug

## 统计

- 开始时间: 2026-03-21T10:00:00Z
- 结束时间: 2026-03-21T14:00:00Z
- 偏差次数: 2

## 偏差列表

- [01] 接口返回结构不一致
- [02] 事件冒泡导致点击无响应

---

可手动补充改进建议。
```

---

## 使用流程

```
1. 开始任务
   /task-memory start "修复登录 bug"

2. 正常工作中...
   (Claude Code Hooks 检测偏差关键词，提示确认)

3. 手动记录偏差
   /task-memory record "发现接口返回结构不一致"

4. 查看进度
   /task-memory status

5. 结束任务
   /task-memory end
   → 生成复盘报告

6. 回顾历史
   /task-memory list
   /task-memory review task-2026-03-21-001
```

---

## 存储位置

所有数据存储在项目目录下的 `.task-memory/` 中：

```
<your-project>/
└── .task-memory/
    ├── current.json            # 当前任务状态
    └── tasks/
        └── task-2026-03-21-001/
            ├── init.md         # 初始设计
            ├── deviation-01.md # 偏差记录 1
            ├── deviation-02.md # 偏差记录 2
            └── review.md       # 复盘报告
```

---

## 最佳实践

1. **任务开始时记录初始设计** - 不要跳过这一步，这是复盘的基础
2. **及时记录偏差** - 发现问题时立即记录，避免遗忘
3. **填写根因分析** - 这是最有价值的部分，帮助改进 prompt
4. **定期回顾复盘报告** - 积累经验，避免重复犯错
```

- [ ] **Step 2: 提交代码**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/dev-tools/task-memory/SKILL.md
git commit -m "feat(task-memory): add SKILL.md main file"
```

---

## Chunk 4: Hooks 集成

### Task 4.1: Hooks 配置文件

**Files:**
- Create: `plugins/dev-tools/task-memory/hooks/hooks.json`

- [ ] **Step 1: 创建 hooks.json**

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/on-stop.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/pre-tool-use.sh \"$TOOL_INPUT\""
          }
        ]
      }
    ]
  }
}
```

---

### Task 4.2: Stop 钩子脚本

**Files:**
- Create: `plugins/dev-tools/task-memory/hooks/on-stop.sh`

- [ ] **Step 1: 创建 on-stop.sh**

```bash
#!/bin/bash

# Task Memory - Stop 钩子
# 会话结束时检查是否有进行中的任务，提示保存

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CURRENT_FILE="$(pwd)/.task-memory/current.json"

# 检查是否存在当前任务
if [[ ! -f "$CURRENT_FILE" ]]; then
  exit 0
fi

# 读取当前任务信息
TASK_ID=$(jq -r '.task_id // empty' "$CURRENT_FILE" 2>/dev/null)

if [[ -z "$TASK_ID" ]]; then
  exit 0
fi

TASK_NAME=$(jq -r '.task_name // empty' "$CURRENT_FILE" 2>/dev/null)

# 输出提示信息
cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Task Memory 提醒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检测到有进行中的任务:
  任务 ID: $TASK_ID
  任务名称: ${TASK_NAME:-未知}

本次会话即将结束，建议：
1. 使用 /task-memory record 记录本次进展
2. 使用 /task-memory status 查看当前状态
3. 如果任务已完成，使用 /task-memory end 结束

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
```

- [ ] **Step 2: 设置执行权限**

```bash
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/hooks/on-stop.sh
```

---

### Task 4.3: PreToolUse 钩子脚本

**Files:**
- Create: `plugins/dev-tools/task-memory/hooks/pre-tool-use.sh`

- [ ] **Step 1: 创建 pre-tool-use.sh**

```bash
#!/bin/bash

# Task Memory - PreToolUse 钩子
# 检测用户输入中的偏差关键词，提示记录

INPUT="$1"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CURRENT_FILE="$(pwd)/.task-memory/current.json"

# 检查是否存在当前任务
if [[ ! -f "$CURRENT_FILE" ]]; then
  exit 0
fi

# 偏差关键词列表
DEVIATION_KEYWORDS=(
  "不对"
  "重做"
  "不是这样的"
  "搞错了"
  "bug"
  "修复"
  "问题"
  "错误"
  "失败"
  "为什么"
  "怎么会"
  "没想到"
  "漏了"
  "忘了"
  "疏忽"
)

# 检查输入是否包含关键词
for keyword in "${DEVIATION_KEYWORDS[@]}"; do
  if echo "$INPUT" | grep -qi "$keyword"; then
    # 输出提示
    cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Task Memory 检测到偏差关键词
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检测到关键词: "$keyword"

这看起来可能是一次偏差或修正。是否要记录？
- 输入 /task-memory record "<描述>" 记录这次偏差
- 或继续当前操作

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
    break
  fi
done
```

- [ ] **Step 2: 设置执行权限**

```bash
chmod +x /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/hooks/pre-tool-use.sh
```

---

### Task 4.4: 提交 Hooks

- [ ] **Step 1: 提交代码**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/dev-tools/task-memory/hooks/
git commit -m "feat(task-memory): add hooks for auto-detection"
```

---

## Chunk 5: 模板文件（可选）

### Task 5.1: 初始设计模板

**Files:**
- Create: `plugins/dev-tools/task-memory/templates/init.md.tpl`

- [ ] **Step 1: 创建 init.md.tpl**

```markdown
---
task_id: {{task_id}}
type: init
created_at: {{created_at}}
task_name: {{task_name}}
description: {{description}}
---

## 任务目标

{{description}}

## 初始设计

1.
2.
3.

## 预期步骤

1.
2.

## 涉及文件

-
```

---

### Task 5.2: 偏差记录模板

**Files:**
- Create: `plugins/dev-tools/task-memory/templates/deviation.md.tpl`

- [ ] **Step 1: 创建 deviation.md.tpl**

```markdown
---
task_id: {{task_id}}
type: deviation
sequence: {{sequence}}
created_at: {{created_at}}
trigger: {{trigger}}
related_files: []
---

## 问题描述

{{description}}

## 发现原因



## 修复方案



## 根因分析

```

---

### Task 5.3: 提交模板

- [ ] **Step 1: 提交代码**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git add plugins/dev-tools/task-memory/templates/
git commit -m "feat(task-memory): add markdown templates"
```

---

## Chunk 6: 最终验证

### Task 6.1: 验证目录结构

- [ ] **Step 1: 检查目录结构**

```bash
find /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory -type f | sort
```

Expected: 显示所有文件

- [ ] **Step 2: 验证脚本可执行**

```bash
ls -la /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory/scripts/task-memory.sh
```

Expected: 显示 `-rwxr-xr-x` 权限

---

### Task 6.2: 链接到全局

- [ ] **Step 1: 使用 j-skills 链接**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills/plugins/dev-tools/task-memory
j-skills link
```

- [ ] **Step 2: 验证链接**

```bash
j-skills link --list
```

Expected: 显示 task-memory

---

### Task 6.3: 最终提交

- [ ] **Step 1: 查看所有更改**

```bash
cd /Users/jiashengwang/jacky-github/jacky-skills
git status
```

- [ ] **Step 2: 提交所有剩余更改**

```bash
git add plugins/dev-tools/task-memory/
git commit -m "feat(task-memory): complete task-memory skill implementation"
```

---

## 实现优先级总结

| 优先级 | 内容 | Chunk |
|--------|------|-------|
| P0 | 公共库、核心命令（start、record、end） | 1, 2 |
| P1 | Hooks 集成 | 4 |
| P2 | 辅助命令（status、list、review）、SKILL.md | 2, 3 |
| P3 | 模板文件 | 5 |
