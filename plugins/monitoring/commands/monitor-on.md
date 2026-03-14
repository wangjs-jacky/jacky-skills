---
description: 启用 Claude Code 监控
---

# 启用监控

请执行以下操作来启用 Claude Code 监控：

```bash
# 创建监控目录
mkdir -p ~/.claude/monitor/sessions

# 生成会话 ID
SESSION_ID="sess_$(date +%s)"
START_TIME=$(date -Iseconds)

# 写入状态文件
cat > ~/.claude/monitor/status.json << STATUS_EOF
{
  "enabled": true,
  "sessionId": "${SESSION_ID}",
  "startTime": "${START_TIME}",
  "outputModes": ["terminal", "file"],
  "webPort": 3777
}
STATUS_EOF

# 创建空会话文件
touch ~/.claude/monitor/sessions/${SESSION_ID}.jsonl

# 输出确认信息
echo "✅ 监控已启用"
echo "   Session ID: ${SESSION_ID}"
echo "   日志文件: ~/.claude/monitor/sessions/${SESSION_ID}.jsonl"
```

启用后，所有工具调用（Read、Bash、Skill、Agent 等）将被自动记录。
