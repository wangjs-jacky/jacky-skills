---
name: monitor-status
description: 查看 Claude Code 监控状态
---

# 查看监控状态

请执行以下命令查看监控状态：

```bash
# 检查状态文件
if [ -f ~/.claude/monitor/status.json ]; then
  echo "📊 监控状态:"
  echo ""
  cat ~/.claude/monitor/status.json

  # 提取会话 ID
  SESSION_ID=$(cat ~/.claude/monitor/status.json | grep -o '"sessionId"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')

  # 检查会话文件
  SESSION_FILE=~/.claude/monitor/sessions/${SESSION_ID}.jsonl
  if [ -f "$SESSION_FILE" ]; then
    echo ""
    echo "📈 会话统计:"
    EVENT_COUNT=$(wc -l < "$SESSION_FILE" | tr -d ' ')
    echo "  - 事件数量: ${EVENT_COUNT}"

    # 如果有 jq，显示工具分布
    if command -v jq &>/dev/null; then
      echo "  - 工具分布:"
      cat "$SESSION_FILE" | jq -r '.tool.name' 2>/dev/null | sort | uniq -c | sort -rn | head -5 | while read count name; do
        echo "    ${name}: ${count}"
      done
    fi
  fi
else
  echo "监控未启动"
  echo ""
  echo "使用 /monitor-on 启用监控"
fi
```
