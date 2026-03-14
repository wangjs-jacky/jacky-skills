# Agent 模式（方案 C）- 未来扩展

本文档描述 Claude Code Monitor 的未来升级路径：Agent 模式。

## 当前状态（方案 A）

- Hook 脚本捕获事件 → 写入文件 → 静态 Web 页面
- 需要手动刷新查看最新数据
- 适合事后分析

## 目标状态（方案 C）

- Hook 脚本捕获事件 → Agent 持续监听 → WebSocket 实时推送
- Web 页面实时更新
- 适合实时监控

## 升级路径

```
Phase 1 (当前)                    Phase 2 (目标)
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

## 实现步骤

### 1. 创建 Agent 进程

新增 `agent/` 目录：

```
agent/
├── monitor-agent.sh      # Agent 主进程
├── file-watcher.sh       # 文件监听器
└── websocket-server.py   # WebSocket 服务器
```

### 2. 文件监听器

使用 `fswatch` 或 `inotifywait` 监听会话文件变化：

```bash
#!/bin/bash
# file-watcher.sh

SESSION_FILE="$1"
fswatch -o "$SESSION_FILE" | while read; do
  # 读取新增内容并发送
  tail -1 "$SESSION_FILE" | send_to_websocket
done
```

### 3. WebSocket 服务器

使用 Python 的 `websockets` 库：

```python
# websocket-server.py
import asyncio
import websockets
import json

connected_clients = set()

async def handler(websocket):
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.discard(websocket)

async def broadcast(event):
    for client in connected_clients:
        await client.send(json.dumps(event))

async def main():
    async with websockets.serve(handler, "localhost", 3778):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
```

### 4. 更新 Web 前端

在 `app.js` 中添加 WebSocket 客户端：

```javascript
const ws = new WebSocket('ws://localhost:3778');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  events.push(data);
  renderTimeline();
  updateStats(events);
};
```

### 5. 新增命令

- `/monitor-agent` - 启动 Agent 模式
- `/monitor-agent-stop` - 停止 Agent

## 接口兼容性

为了确保平滑升级，保持以下接口不变：

| 接口 | 说明 |
|------|------|
| 数据格式 | JSON Lines（每行一个事件） |
| 存储位置 | `~/.claude/monitor/sessions/` |
| Hook 脚本 | `hooks/pre-tool-use`, `hooks/post-tool-use` |
| 状态文件 | `~/.claude/monitor/status.json` |

## 依赖

Agent 模式需要额外安装：

- `fswatch` (macOS) 或 `inotify-tools` (Linux)
- Python 3.7+
- `websockets` Python 库

```bash
# macOS
brew install fswatch
pip install websockets

# Linux
sudo apt install inotify-tools
pip install websockets
```

## 时间线

- **Q1 2026**: 方案 A MVP（当前）
- **Q2 2026**: 方案 C Agent 模式
