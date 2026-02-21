---
name: claude-monitor
description: Claude Code Monitor - 监控所有 Claude Code 会话状态。触发条件：用户想查看 Claude Code 在做什么、是否在"偷懒"、卡住了、还在运行吗；或者用户提到 claude-monitor、会话监控、悬浮窗通知、等待输入提醒等关键词。
---

# Claude Code Monitor 使用指南

监控所有 Claude Code 会话，当等待输入或会话结束时通过优雅的悬浮窗通知用户。

## 使用场景

- 用户问"Claude Code 在偷懒吗"、"卡住了吗"、"还在跑吗"
- 用户想查看当前所有 Claude Code 会话的状态
- 用户询问如何安装或配置 Claude Monitor
- 用户遇到悬浮窗不显示或其他问题
- 用户想了解如何自定义通知行为

## 快速安装

### npx 一键安装（推荐）

```bash
npx @wangjs-jacky/claude-monitor init
```

### 手动安装步骤

1. **创建目录**
   ```bash
   mkdir -p ~/.claude-monitor/hooks
   ```

2. **下载 Hooks 脚本**
   从 https://github.com/wangjs-jacky/jacky-claude-monitor/tree/main/hooks 下载所有 `.sh` 文件到 `~/.claude-monitor/hooks/`

3. **编译 Swift 悬浮窗**
   ```bash
   curl -o /tmp/main.swift https://raw.githubusercontent.com/wangjs-jacky/jacky-claude-monitor/main/swift-notify/main.swift
   swiftc -o ~/.claude-monitor/claude-float-window /tmp/main.swift -framework Cocoa
   ```

4. **配置 Claude Code Hooks**

   运行以下命令查看配置：
   ```bash
   npx @wangjs-jacky/claude-monitor config
   ```

   将输出内容添加到 `~/.claude/settings.json`

## CLI 命令

### 基础命令

```bash
claude-monitor init              # 安装 Hooks 和悬浮窗
claude-monitor config            # 查看当前配置
claude-monitor start             # 启动守护进程
claude-monitor stop              # 停止守护进程
claude-monitor status            # 查看守护进程状态
claude-monitor list              # 列出所有活跃会话
claude-monitor list --verbose    # 详细模式（显示提问和工具调用历史）
claude-monitor reset             # 重置为默认配置
claude-monitor help              # 显示帮助信息
```

### 配置管理

```bash
# 查看当前配置
claude-monitor config

# 关闭所有悬浮窗
claude-monitor set floatingWindow.enabled false

# 关闭"思考中"弹窗
claude-monitor set floatingWindow.scenarios.thinking.enabled false

# 关闭"执行工具"弹窗
claude-monitor set floatingWindow.scenarios.executing.enabled false

# 只对特定工具显示"执行中"弹窗
claude-monitor set floatingWindow.scenarios.executing.tools "Bash,Task"

# 修改弹窗持续时间（秒）
claude-monitor set floatingWindow.scenarios.thinking.duration 5

# 关闭"会话结束"弹窗
claude-monitor set floatingWindow.scenarios.sessionEnd.enabled false
```

## 配置说明

配置文件位置: `~/.claude-monitor/config.json`

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `floatingWindow.enabled` | 悬浮窗总开关 | `true` |
| `floatingWindow.scenarios.thinking.enabled` | 思考中弹窗 | `true` |
| `floatingWindow.scenarios.thinking.duration` | 思考弹窗持续时间(秒) | `3` |
| `floatingWindow.scenarios.executing.enabled` | 执行工具弹窗 | `true` |
| `floatingWindow.scenarios.executing.duration` | 执行弹窗持续时间(秒) | `2` |
| `floatingWindow.scenarios.executing.tools` | 显示弹窗的工具列表 | `["Bash", "Task"]` |
| `floatingWindow.scenarios.waitingInput.enabled` | 等待输入弹窗 | `true` |
| `floatingWindow.scenarios.waitingInput.duration` | 等待弹窗持续时间(0=一直显示) | `0` |
| `floatingWindow.scenarios.sessionEnd.enabled` | 会话结束弹窗 | `true` |
| `floatingWindow.scenarios.sessionEnd.duration` | 结束弹窗持续时间(秒) | `3` |

## Hooks 配置

在 `~/.claude/settings.json` 中添加以下配置：

```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/session-start.sh" }] }
    ],
    "SessionEnd": [
      { "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/session-end.sh" }] }
    ],
    "UserPromptSubmit": [
      { "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/prompt-submit.sh" }] }
    ],
    "PreToolUse": [
      { "matcher": "AskUserQuestion", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/waiting-input.sh" }] },
      { "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/tool-start.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": "AskUserQuestion", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/input-answered.sh" }] },
      { "matcher": "", "hooks": [{ "type": "command", "command": "~/.claude-monitor/hooks/tool-end.sh" }] }
    ]
  }
}
```

## 故障排查

### 1. 悬浮窗不显示

**检查清单：**

```bash
# 检查守护进程是否运行
claude-monitor status

# 检查 Swift 悬浮窗程序是否存在
ls -la ~/.claude-monitor/claude-float-window

# 检查配置是否启用悬浮窗
claude-monitor config | grep -A5 floatingWindow

# 手动测试悬浮窗
~/.claude-monitor/claude-float-window "测试" "这是测试消息" 3
```

### 2. 代理环境变量问题

如果设置了代理（如 `http_proxy`、`all_proxy`），可能导致 hooks 无法连接守护进程。

**解决方案：** 所有 hooks 中的 curl 命令已添加 `--noproxy "*"` 参数。

或设置环境变量：
```bash
export NO_PROXY="localhost,127.0.0.1"
export no_proxy="localhost,127.0.0.1"
```

### 3. 守护进程无法启动

```bash
# 检查端口是否被占用
lsof -i :17530

# 手动启动查看错误
node ~/.claude-monitor/daemon.js

# 检查日志
tail -f ~/.claude-monitor/logs/daemon.log
```

### 4. 会话状态不同步

```bash
# 查看所有会话状态
claude-monitor list --verbose

# 重启守护进程
claude-monitor stop && claude-monitor start
```

### 5. Hooks 不执行

```bash
# 检查 hooks 文件权限
ls -la ~/.claude-monitor/hooks/

# 确保所有脚本可执行
chmod +x ~/.claude-monitor/hooks/*.sh

# 检查 settings.json 格式
cat ~/.claude/settings.json | jq .
```

## Web Dashboard

访问 http://localhost:17530/dashboard 查看实时会话状态和事件历史。

**功能：**
- 实时会话列表
- 工具调用历史
- 会话事件日志
- 状态统计

## 卸载

```bash
# 删除所有配置和数据
rm -rf ~/.claude-monitor

# 从 settings.json 中移除 hooks 配置
```

## 项目信息

- **仓库**: https://github.com/wangjs-jacky/jacky-claude-monitor
- **npm 包**: @wangjs-jacky/claude-monitor
- **守护进程端口**: 17530
- **支持系统**: macOS only
