# Task Memory - 长任务对话记录工具设计文档

> 创建日期: 2026-03-21
> 状态: 已确认

## 1. 概述

### 1.1 目的

记录开发任务从开始到结束的完整过程，帮助开发者：
- 复盘初始设计与实际执行的偏差
- 分析偏差产生的原因
- 改进未来的 prompt 设计

### 1.2 目标用户

使用 Claude Code 进行开发任务的用户，希望：
- 理解为什么初始设计会遗漏问题
- 积累经验，优化 prompt 编写能力

### 1.3 核心场景

- **跨会话任务**：任务可能跨越多个 Claude Code 会话
- **单会话长对话**：长时间交互需要记录关键节点和决策

---

## 2. 架构设计

### 2.1 整体架构

采用 **Skill + Hooks + 脚本** 的混合架构：

```
┌─────────────────┐
│    SKILL.md     │  ← Prompt 逻辑，定义命令和流程
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌────────┐
│ Hooks │ │ Scripts│  ← 自动化触发 + 文件操作
└───────┘ └────────┘
         │
         ▼
┌─────────────────┐
│  .task-memory/  │  ← 本地存储
└─────────────────┘
```

### 2.2 平台策略

| 平台 | 支持方式 |
|------|----------|
| Claude Code | Hooks 自动化 + 完整功能 |
| Codex | 手动命令（后续支持） |

---

## 3. 目录结构

### 3.1 Skill 目录

```
task-memory/
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

### 3.2 项目存储目录（自动生成）

```
<project>/
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

## 4. 命令设计

### 4.1 命令列表

| 命令 | 描述 |
|------|------|
| `/task-memory start <任务名> [描述]` | 开始新任务 |
| `/task-memory record <描述>` | 记录偏差 |
| `/task-memory status` | 查看当前状态 |
| `/task-memory end` | 结束任务 |
| `/task-memory list` | 列出所有任务 |
| `/task-memory review <任务ID>` | 查看复盘报告 |

### 4.2 使用流程

```
1. /task-memory start "修复登录 bug"
   → 创建任务目录，生成 init.md 模板

2. (正常工作中...)
   → Hooks 检测偏差关键词，提示确认

3. /task-memory record "发现接口返回结构不一致"
   → 生成 deviation-XX.md

4. /task-memory status
   → 查看当前任务进度

5. /task-memory end
   → 生成 review.md，结束任务

6. /task-memory list
   → 列出历史任务
```

---

## 5. Hooks 设计

### 5.1 Hooks 配置

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

### 5.2 触发流程

```
用户输入
    │
    ▼
┌─────────────────┐
│  PreToolUse     │ ──► 检测偏差关键词 ──► 提示记录
└─────────────────┘
    │
    ▼
 工具执行 / 对话继续
    │
    ▼
┌─────────────────┐
│  Stop           │ ──► 提示保存当前进度
└─────────────────┘
```

### 5.3 偏差关键词

```
不对、重做、不是这样的、搞错了、bug、修复、问题、
错误、失败、为什么、怎么会、没想到、漏了、忘了、疏忽
```

---

## 6. 文件格式

### 6.1 init.md（初始设计）

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

### 6.2 deviation-XX.md（偏差记录）

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

### 6.3 review.md（复盘报告 - 简化版）

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

## 7. 复盘报告设计（简化版）

复盘报告仅包含：
- 任务基本信息
- 时间统计
- 偏差列表（简要）

不做复杂的自动分析和分类，用户可手动补充改进建议。

---

## 8. 实现优先级

| 优先级 | 内容 |
|--------|------|
| P0 | 核心命令：start、record、end |
| P1 | Hooks 集成：on-stop、pre-tool-use |
| P2 | 辅助命令：status、list、review |
| P3 | Codex 平台支持 |
