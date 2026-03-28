---
name: claude-monitor
description: "Claude Code Monitor - 监控 Claude Code 运行状态。当用户想查看 Claude Code 在做什么、是否在\"偷懒\"、执行了哪些操作时触发此 skill。"
---

<role>Claude Code 运行态监控助手，负责采集、查询并解释会话中的工具调用行为。</role>
<purpose>帮助用户快速回答“Claude 在做什么”、定位慢点与异常步骤，并支持 Skill 调试与性能分析。</purpose>
<trigger>

```text
触发词：
- Claude Code 在做什么
- 看看它执行了哪些操作
- monitor-on / monitor-status / monitor-off
- 分析这个 skill 为什么慢
- 查看工具调用日志

示例：
- “帮我看下 Claude Code 现在在干嘛”
- “这个 skill 执行太慢，查一下瓶颈”
```

</trigger>
<gsd:workflow xmlns:gsd="urn:gsd:workflow">
  <gsd:meta>commands=/monitor-on|/monitor-status|/monitor-off; logs=~/.claude/monitor/sessions/*.jsonl</gsd:meta>
  <gsd:goal>在最小干预下提供可追踪、可查询、可复盘的 Claude Code 执行证据。</gsd:goal>
  <gsd:phase>按用户意图启用或检查监控状态，确认日志写入路径可用。</gsd:phase>
  <gsd:phase>采集并筛选事件流，按工具类型、耗时和错误信号做结构化查询。</gsd:phase>
  <gsd:phase>输出结论与下一步排查建议，必要时给出可复现命令。</gsd:phase>
</gsd:workflow>

# Claude Code Monitor

监控 Claude Code 的运行状态，记录所有工具调用，用于调试 Skills 和分析性能。

## 触发场景

- 用户问"Claude Code 在做什么"
- 用户想查看当前会话的执行情况
- 用户想分析某个 Skill 的执行流程
- 用户想排查 Skill 执行慢的原因

## 快速开始

### 1. 启用监控

```
/monitor-on
```

### 2. 执行你的任务

正常使用 Claude Code，所有工具调用会被自动记录。

### 3. 查看状态

```
/monitor-status
```

### 4. 禁用监控

```
/monitor-off
```

## 日志文件

| 文件 | 位置 | 描述 |
|------|------|------|
| 状态文件 | `~/.claude/monitor/status.json` | 当前监控状态 |
| 会话日志 | `~/.claude/monitor/sessions/<id>.jsonl` | 事件流（JSON Lines） |

## 事件格式

每个工具调用生成一条 JSON 记录：

```json
{
  "id": "evt_1705123456789_001",
  "sessionId": "sess_1705123456789",
  "timestamp": "2026-03-14T21:30:56.789Z",
  "type": "tool_call",
  "tool": {
    "name": "Read"
  },
  "timing": {
    "start": 1705123456789,
    "end": 1705123456800,
    "duration_ms": 11
  },
  "result": {
    "status": "success",
    "output_size": 8690
  }
}
```

## 查询示例

使用 `jq` 查询日志：

```bash
# 查看所有 Read 操作
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.tool.name == "Read")'

# 统计工具调用次数
cat ~/.claude/monitor/sessions/*.jsonl | jq -r '.tool.name' | sort | uniq -c | sort -rn

# 查看耗时超过 1s 的操作
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.timing.duration_ms > 1000)'

# 生成统计报告
cat ~/.claude/monitor/sessions/*.jsonl | jq -s '
  {
    total_events: length,
    tools: (group_by(.tool.name) | map({name: .[0].tool.name, count: length})),
    total_duration_ms: (map(.timing.duration_ms) | add // 0)
  }
'
```

## 监控的工具

| 工具 | 图标 | 描述 |
|------|------|------|
| Read | 📖 | 文件读取 |
| Write | ✏️ | 文件写入 |
| Edit | 🔧 | 文件编辑 |
| Bash | ⚡ | 命令执行 |
| Grep | 🔍 | 内容搜索 |
| Glob | 📁 | 文件搜索 |
| Skill | 🎯 | Skill 调用 |
| Agent | 🤖 | 子代理 |
| WebSearch | 🌐 | 网络搜索 |
| Task | 📋 | 后台任务 |

## 使用场景

### 场景 1：调试 Skill 执行流程

1. 启用监控
2. 执行你的 Skill
3. 查看日志，分析执行了哪些步骤

### 场景 2：分析性能瓶颈

1. 启用监控
2. 执行慢的 Skill
3. 查询耗时超过 1s 的操作：

```bash
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.timing.duration_ms > 1000)'
```

### 场景 3：验证 Skill 行为

1. 启用监控
2. 执行 Skill
3. 检查日志，确认是否符合预期
