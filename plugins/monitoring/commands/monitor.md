---
name: monitor
description: 监控 Claude Code 运行状态 - 查看工具调用、性能分析
---

# /monitor - Claude Code Monitor

监控当前会话的工具调用情况，用于调试 Skills 和分析性能。

## 用法

| 命令 | 描述 |
|------|------|
| `/monitor on` | 启用监控 |
| `/monitor off` | 禁用监控 |
| `/monitor status` | 查看监控状态 |

## 快捷命令

- `/monitor-on` - 快速启用监控
- `/monitor-off` - 快速禁用监控
- `/monitor-status` - 快速查看状态

## 功能

- 📊 **全量监控** - 捕获所有工具调用（Read、Bash、Skill、Agent 等）
- ⏱️ **性能分析** - 统计各环节耗时
- 📁 **文件日志** - JSON Lines 格式，支持 jq 查询

## 日志位置

- 状态文件: `~/.claude/monitor/status.json`
- 会话日志: `~/.claude/monitor/sessions/<session-id>.jsonl`

## 示例

```bash
# 查看所有 Read 操作
cat ~/.claude/monitor/sessions/*.jsonl | jq 'select(.tool.name == "Read")'

# 统计工具调用次数
cat ~/.claude/monitor/sessions/*.jsonl | jq -r '.tool.name' | sort | uniq -c
```
