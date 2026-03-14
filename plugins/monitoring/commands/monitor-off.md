---
name: monitor-off
description: 禁用 Claude Code 监控
---

# 禁用监控

请执行以下操作来禁用 Claude Code 监控：

```bash
# 检查状态文件是否存在
if [ -f ~/.claude/monitor/status.json ]; then
  # 提取当前会话 ID
  SESSION_ID=$(cat ~/.claude/monitor/status.json | grep -o '"sessionId"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')
  STOP_TIME=$(date -Iseconds)

  # 更新状态文件
  cat > ~/.claude/monitor/status.json << STATUS_EOF
{
  "enabled": false,
  "sessionId": "${SESSION_ID}",
  "stoppedAt": "${STOP_TIME}"
}
STATUS_EOF

  echo "⏹️ 监控已禁用"
  echo "   Session ID: ${SESSION_ID}"
else
  echo "⚠️ 监控未启动"
fi
```

禁用后，工具调用将不再被记录。之前的日志文件仍然保留。
