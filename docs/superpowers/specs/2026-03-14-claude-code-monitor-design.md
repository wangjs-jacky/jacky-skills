# Claude Code Monitor - 设计方案

> **状态**: Draft
> **创建日期**: 2026-03-14
> **作者**: Jacky Wang

## 1. 概述

### 1.1 目标

Claude Code Monitor 是一个用于监控和调试 Claude Code Skills 执行的插件，核心功能包括：

- **追踪 skill 执行流程** - 记录读了哪些文件、调了哪些子 skill
- **性能分析** - 统计各环节耗时，排查慢操作
- **验证预期** - 确认 skill 是否按设计的方式工作

### 1.2 核心需求

| 需求 | 描述 |
|------|------|
| 全量监控 | 捕获所有工具调用（Read、Bash、Skill、Agent 等） |
| 多种输出 | 支持终端实时输出、文件日志、Web 可视化 |
| Slash 命令控制 | `/monitor on/off/status` 控制监控开关 |
| 渐进式扩展 | 预留 Agent 模式升级路径 |

### 1.3 技术方案

使用 Claude Code 的 **PreToolUse** 和 **PostToolUse** hooks 捕获所有工具调用事件。

## 2. 项目结构

```
plugins/monitoring/
├── .claude-plugin/
│   └── plugin.json              # 插件配置
├── hooks/
│   ├── hooks.json               # Hook 事件注册
│   ├── run-hook.cmd             # 跨平台脚本包装器
│   ├── pre-tool-use             # PreToolUse hook
│   └── post-tool-use            # PostToolUse hook
├── commands/
│   ├── monitor.md               # /monitor 主命令
│   ├── monitor-on.md            # /monitor-on
│   ├── monitor-off.md           # /monitor-off
│   └── monitor-status.md        # /monitor-status
├── skills/
│   └── claude-monitor/
│       └── SKILL.md             # Monitor skill 定义
├── lib/
│   ├── core.sh                  # 核心逻辑（状态管理、事件记录）
│   ├── formatter.sh             # 事件格式化
│   ├── output-terminal.sh       # 终端输出
│   ├── output-file.sh           # 文件日志
│   └── output-web.sh            # Web 服务器
├── web/
│   ├── index.html               # Web 界面
│   ├── styles.css               # 样式
│   └── app.js                   # 前端逻辑
└── docs/
    └── FUTURE-AGENT.md          # 方案 C 扩展路径
```

## 3. 核心数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                      Claude Code Session                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Tool Invocation                             │
│            (Read / Bash / Skill / Agent / ...)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────┐          ┌──────────────────────┐
│    PreToolUse        │          │    PostToolUse       │
│    Hook Script       │          │    Hook Script       │
│                      │          │                      │
│  • 记录工具名称      │          │  • 记录执行结果      │
│  • 记录输入参数      │          │  • 记录输出摘要      │
│  • 记录开始时间      │          │  • 计算耗时          │
│  • 检查监控状态      │          │  • 写入事件文件      │
└──────────┬───────────┘          └──────────┬───────────┘
           │                                 │
           └─────────────┬───────────────────┘
                         ▼
           ┌──────────────────────────┐
           │     事件数据文件          │
           │  ~/.claude/monitor/      │
           │  sessions/<id>.jsonl     │
           └─────────────┬────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  终端输出   │  │  文件日志   │  │  Web 界面   │
│  (实时)     │  │  (持久化)   │  │  (可视化)   │
└─────────────┘  └─────────────┘  └─────────────┘
```

## 4. 事件数据格式

每个工具调用生成一条 JSON 记录（JSON Lines 格式）：

```json
{
  "id": "evt_1705123456789_001",
  "sessionId": "sess_1705123456789",
  "timestamp": "2026-03-14T21:30:56.789Z",
  "type": "tool_call",
  "tool": {
    "name": "Read",
    "input": {
      "file_path": "/Users/jiashengwang/jacky-github/jacky-skills/README.md"
    }
  },
  "timing": {
    "start": 1705123456789,
    "end": 1705123456800,
    "duration_ms": 11
  },
  "result": {
    "status": "success",
    "output_preview": "# jacky-skills\n\n这是一个...",
    "output_size": 8690
  },
  "metadata": {
    "skill_context": "brainstorming",
    "depth": 1
  }
}
```

### 4.1 字段说明

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | string | 事件唯一标识，格式 `evt_<timestamp>_<seq>` |
| `sessionId` | string | 会话标识，格式 `sess_<timestamp>` |
| `timestamp` | string | ISO 8601 格式时间戳 |
| `type` | string | 事件类型：`tool_call` / `thinking` / `notification` |
| `tool.name` | string | 工具名称：Read、Bash、Skill、Agent 等 |
| `tool.input` | object | 工具输入参数 |
| `timing.start` | number | 开始时间（Unix 毫秒） |
| `timing.end` | number | 结束时间（Unix 毫秒） |
| `timing.duration_ms` | number | 耗时（毫秒） |
| `result.status` | string | 执行状态：`success` / `error` |
| `result.output_preview` | string | 输出预览（截断到前 200 字符） |
| `result.output_size` | number | 输出大小（字节） |

## 5. Hook 脚本设计

### 5.1 事件注册 (hooks/hooks.json)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" pre-tool-use",
            "async": true
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" post-tool-use",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### 5.2 PreToolUse Hook (hooks/pre-tool-use)

```bash
#!/usr/bin/env bash
# PreToolUse hook - 记录工具调用开始

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
source "${SCRIPT_DIR}/../lib/core.sh"

# 检查监控是否启用
if ! is_monitor_enabled; then
  exit 0
fi

# 从 stdin 读取工具调用信息
read -r TOOL_INPUT

# 记录事件
record_event "pre" "$TOOL_INPUT"

exit 0
```

### 5.3 PostToolUse Hook (hooks/post-tool-use)

```bash
#!/usr/bin/env bash
# PostToolUse hook - 记录工具调用结束

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
source "${SCRIPT_DIR}/../lib/core.sh"

# 检查监控是否启用
if ! is_monitor_enabled; then
  exit 0
fi

# 从 stdin 读取工具调用结果
read -r TOOL_RESULT

# 记录事件并计算耗时
record_event "post" "$TOOL_RESULT"

# 可选：终端实时输出
if is_terminal_output_enabled; then
  print_event_terminal "$TOOL_RESULT"
fi

exit 0
```

## 6. Slash 命令设计

### 6.1 /monitor (主命令)

```markdown
---
name: monitor
description: 监控 Claude Code 运行状态 - 查看工具调用、性能分析
---

# /monitor - Claude Code Monitor

监控当前会话的工具调用情况。

## 用法

- `/monitor on` - 启用监控
- `/monitor off` - 禁用监控
- `/monitor status` - 查看监控状态
- `/monitor view` - 打开 Web 界面
- `/monitor report` - 生成分析报告

## 子命令

请使用以下子命令：
- `/monitor-on` - 启用监控
- `/monitor-off` - 禁用监控
- `/monitor-status` - 查看状态
```

### 6.2 /monitor-on

```markdown
---
name: monitor-on
description: 启用 Claude Code 监控
---

请执行以下操作来启用监控：

1. 创建监控状态文件：
```bash
mkdir -p ~/.claude/monitor/sessions
SESSION_ID="sess_$(date +%s)"
echo '{
  "enabled": true,
  "sessionId": "'"$SESSION_ID"'",
  "startTime": "'"$(date -Iseconds)"'",
  "outputModes": ["terminal", "file", "web"],
  "webPort": 3777
}' > ~/.claude/monitor/status.json
```

2. 告知用户：✅ 监控已启用，所有工具调用将被记录到 `~/.claude/monitor/sessions/`
```

### 6.3 /monitor-off

```markdown
---
name: monitor-off
description: 禁用 Claude Code 监控
---

请执行以下操作来禁用监控：

1. 更新监控状态文件：
```bash
if [ -f ~/.claude/monitor/status.json ]; then
  SESSION_ID=$(cat ~/.claude/monitor/status.json | grep sessionId | cut -d'"' -f4)
  echo '{
    "enabled": false,
    "sessionId": "'"$SESSION_ID"'",
    "stoppedAt": "'"$(date -Iseconds)"'"
  }' > ~/.claude/monitor/status.json
fi
```

2. 告知用户：⏹️ 监控已禁用
```

### 6.4 /monitor-status

```markdown
---
name: monitor-status
description: 查看 Claude Code 监控状态
---

请执行以下命令查看监控状态：

```bash
if [ -f ~/.claude/monitor/status.json ]; then
  cat ~/.claude/monitor/status.json
  echo ""
  echo "📊 会话统计："
  SESSION_ID=$(cat ~/.claude/monitor/status.json | grep sessionId | cut -d'"' -f4)
  if [ -f ~/.claude/monitor/sessions/${SESSION_ID}.jsonl ]; then
    EVENT_COUNT=$(wc -l < ~/.claude/monitor/sessions/${SESSION_ID}.jsonl)
    echo "  - 事件数量: $EVENT_COUNT"
  fi
else
  echo "监控未启动"
fi
```
```

## 7. 状态管理

### 7.1 文件结构

```
~/.claude/monitor/
├── status.json           # 当前监控状态
├── config.json           # 配置（输出方式等）
└── sessions/
    ├── sess_1705123456789.jsonl    # 会话 1 的事件流
    ├── sess_1705123555000.jsonl    # 会话 2 的事件流
    └── ...
```

### 7.2 status.json 格式

```json
{
  "enabled": true,
  "sessionId": "sess_1705123456789",
  "startTime": "2026-03-14T21:30:56+08:00",
  "outputModes": ["terminal", "file", "web"],
  "webPort": 3777
}
```

### 7.3 config.json 格式

```json
{
  "defaultOutputModes": ["file"],
  "maxOutputPreview": 200,
  "maxSessionFiles": 100,
  "webPort": 3777
}
```

## 8. 输出模块设计

### 8.1 终端输出

实时打印事件，格式：

```
21:30:56 │ 📖 Read    │ README.md
21:30:58 │ 🔍 Grep    │ pattern: "hooks" in *.json
21:31:00 │ ⚡ Bash    │ git log --oneline -5
21:31:02 │ 🎯 Skill   │ brainstorming
21:31:15 │ ✅ Done    │ Duration: 19s, Tokens: 12,433
```

### 8.2 文件日志

JSON Lines 格式，支持 `jq` 查询：

```bash
# 查看所有 Read 操作
cat session.jsonl | jq 'select(.tool.name == "Read")'

# 统计各工具调用次数
cat session.jsonl | jq -r '.tool.name' | sort | uniq -c | sort -rn

# 查看耗时超过 1s 的操作
cat session.jsonl | jq 'select(.timing.duration_ms > 1000)'

# 生成统计报告
cat session.jsonl | jq -s '
  {
    total_events: length,
    tools: (group_by(.tool.name) | map({name: .[0].tool.name, count: length})),
    total_duration_ms: (map(.timing.duration_ms) | add),
    slowest: (sort_by(-.timing.duration_ms) | .[0:5])
  }
'
```

### 8.3 Web 界面

启动本地 HTTP 服务器（默认端口 3777），提供可视化界面。

## 9. Web 界面设计

### 9.1 视觉风格

深色主题，Terminal Noir 风格：

```css
:root {
  --color-bg: #0a0a0b;
  --color-bg-elevated: #131316;
  --color-text: #e5e5e7;
  --color-text-muted: #6b6b76;
  --color-primary: #00ff88;
  --color-border: rgba(255, 255, 255, 0.06);
}
```

### 9.2 界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  🖥️ Claude Code Monitor          Session: sess_xxx   [⚙️]  │
├─────────────────────────────────────────────────────────────┤
│  📊 Stats: 42 events │ 12.4s │ 24,433 tokens │ 6 tools     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  21:30:56 ─────────────────────────────────────────────────│
│  │                                                         │
│  ├─ 📖 Read                                                │
│  │    └─ README.md (11ms)                                  │
│  │                                                         │
│  ├─ 🔍 Grep                                                │
│  │    └─ "hooks" in *.json (23ms)                          │
│  │                                                         │
│  ├─ 🎯 Skill: brainstorming                                │
│  │    ├─ 📖 Read: SKILL.md                                 │
│  │    ├─ 💭 Thinking... (2.3s)                             │
│  │    └─ ✅ Completed (8.2s)                               │
│  │                                                         │
│  └─ ⚡ Bash: git log (45ms)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 功能特性

- **时间线视图** - 按时间顺序展示所有事件
- **层级折叠** - Skill/Agent 调用可展开/折叠
- **详情面板** - 点击事件查看完整输入/输出
- **统计面板** - 工具分布、耗时分布、Token 使用
- **过滤功能** - 按工具类型、时间范围过滤

## 10. 工具图标映射

| 工具 | 图标 | 颜色 | 描述 |
|------|------|------|------|
| Read | 📖 | 蓝色 | 文件读取 |
| Write | ✏️ | 绿色 | 文件写入 |
| Edit | 🔧 | 橙色 | 文件编辑 |
| Bash | ⚡ | 黄色 | 命令执行 |
| Grep | 🔍 | 蓝色 | 内容搜索 |
| Glob | 📁 | 灰色 | 文件搜索 |
| Skill | 🎯 | 紫色 | Skill 调用 |
| Agent | 🤖 | 紫色 | 子代理 |
| WebSearch | 🌐 | 青色 | 网络搜索 |
| WebFetch | 🔗 | 青色 | 网页获取 |
| AskUserQuestion | ❓ | 绿色 | 用户询问 |
| LSP | 📡 | 灰色 | LSP 查询 |
| NotebookEdit | 📓 | 蓝色 | Notebook 编辑 |
| Thinking | 💭 | 紫色 | 思考过程 |

## 11. 未来扩展：Agent 模式（方案 C）

### 11.1 升级路径

```
Phase 1 (方案 A)                    Phase 2 (方案 C)
┌─────────────────┐               ┌─────────────────┐
│  PreToolUse     │               │  PreToolUse     │
│  PostToolUse    │               │  PostToolUse    │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  事件数据       │               │  事件数据       │
│  (JSON Lines)   │  ──────────▶  │  (JSON Lines)   │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  文件存储       │               │  后台 Agent     │
│  (单次写入)     │               │  (持续监听)     │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  静态 Web 页面  │               │  WebSocket 推送 │
│  (手动刷新)     │               │  (实时更新)     │
└─────────────────┘               └─────────────────┘
```

### 11.2 升级改动点

Phase 1 → Phase 2 只需：

1. **新增** `agent/` 目录（后台监听进程）
2. **修改** `web/`（加入 WebSocket 客户端）
3. **新增** `/monitor-agent` 命令启动 Agent

**不变的部分**：
- 核心 hooks 逻辑
- 数据格式
- 存储结构

### 11.3 详细设计见

`docs/FUTURE-AGENT.md`（待创建）

## 12. 实现优先级

### P0 - MVP

- [ ] Hook 脚本（PreToolUse/PostToolUse）
- [ ] 状态管理（status.json）
- [ ] 文件日志输出
- [ ] /monitor 命令

### P1 - 增强

- [ ] 终端实时输出
- [ ] Web 界面（静态）
- [ ] 统计报告生成

### P2 - 优化

- [ ] 配置文件支持
- [ ] 会话文件清理
- [ ] 性能优化

### P3 - 未来

- [ ] Agent 模式（方案 C）
- [ ] WebSocket 实时推送
- [ ] 多会话对比分析

## 13. 参考资料

- [Claude Code hooks: A practical guide with examples (2026)](https://www.eesel.ai/blog/hooks-in-claude-code)
- [Claude Code Hooks Guide: All 12 Lifecycle Events Explained](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns)
- [Claude Code 完整指南（四）：Hooks（自动化事件触发）](https://blog.csdn.net/qq_20042935/article/details/156891507)
