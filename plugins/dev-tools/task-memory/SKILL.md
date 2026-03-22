---
name: task-memory
description: 跨会话任务记忆工具。记录任务历史，支持会话中断后恢复上下文。触发于 /task-memory 命令或"任务记忆"、"继续之前"、"任务历史"等关键词。
---

<role>
你是 Task Memory 管理器。你的职责是：

1. **持久化任务状态** - 保存到本地文件，跨会话有效
2. **恢复上下文** - 新会话开始时读取历史记录
3. **记录进展** - 记录每次重要的用户输入和 AI 输出
</role>

---

<purpose>

## 核心场景

```
用户在做一个长任务：
1. 上下文会超限，会话会中断
2. 用户会开启新会话继续工作
3. 需要知道"之前做了什么"
4. 需要记录"这次做了什么"

Task Memory 解决：
- 跨会话的任务连续性
- 历史记录持久化
- 上下文恢复
```

</purpose>

---

<commands>

| 命令 | 说明 |
|------|------|
| `/task-memory start <任务名>` | 开始新任务（或恢复已有任务） |
| `/task-memory save [描述]` | 保存当前进展 |
| `/task-memory recall` | 回忆：读取并总结历史记录 |
| `/task-memory history` | 查看完整历史 |
| `/task-memory end` | 结束任务 |

</commands>

---

<process>

<step name="start" priority="first">

**命令**: `/task-memory start <任务名>`

**行为**:
1. 检查 `.harness/memory/` 是否已有该任务
2. 如果存在 → 读取历史，展示摘要
3. 如果不存在 → 创建新任务目录

**产物**:
```
.harness/memory/
├── current.json           # 当前任务指针
└── tasks/
    └── <task-id>/
        ├── meta.json      # 任务元信息
        ├── session-01.md  # 会话 1 记录
        ├── session-02.md  # 会话 2 记录
        └── ...
```

**示例**:
```
用户: /task-memory start "开发用户认证模块"

AI: 检测到已有任务记录...

## 📋 任务恢复: 开发用户认证模块

- 创建时间: 2026-03-20
- 会话次数: 3
- 最后更新: 2026-03-22

### 最近进展 (Session 3)
- 完成了邮箱登录 API
- 遇到问题：密码加密库兼容性
- 待处理：手机验证码功能

继续上次的工作？
```

</step>

<step name="save">

**命令**: `/task-memory save [描述]`

**行为**:
1. 记录当前会话的关键内容
2. 追加到 session 文件
3. 更新 current.json

**自动触发时机**（AI 主动执行）:
- 会话即将结束（检测到上下文接近限制）
- 完成重要里程碑
- 用户说"保存一下"

**记录格式**:
```markdown
## Session N - 2026-03-22 15:30

### 用户输入
> "修复登录 API 的 bug"

### AI 行动
- 定位问题：密码加密库版本不兼容
- 修复方案：升级 bcrypt 到 5.x
- 修改文件：src/auth/password.ts

### 结果
- ✅ 登录 API 正常工作
- 测试用例通过

### 待处理
- 手机验证码功能
- 第三方 OAuth 集成
```

</step>

<step name="recall">

**命令**: `/task-memory recall`

**行为**:
1. 读取 current.json 找到当前任务
2. 读取所有 session 文件
3. 生成摘要

**输出**:
```
## 📋 任务回忆: 开发用户认证模块

### 时间线
| 日期 | 会话 | 主要内容 |
|------|------|----------|
| 03-20 | S1 | 初始设计、技术选型 |
| 03-21 | S2 | 实现邮箱登录 |
| 03-22 | S3 | 修复密码加密 bug |

### 已完成
- [x] 技术栈确定 (React + Node.js)
- [x] 邮箱登录 API
- [x] 密码加密功能

### 进行中
- [ ] 手机验证码

### 待处理
- [ ] 第三方 OAuth
- [ ] 登录日志

### 关键决策
1. 选择 bcrypt 而非 argon2（兼容性考虑）
2. JWT 有效期设为 7 天
```

</step>

<step name="history">

**命令**: `/task-memory history`

**行为**: 展示完整的 session 记录（不做摘要）

</step>

<step name="end">

**命令**: `/task-memory end`

**行为**:
1. 保存最终状态
2. 清空 current.json
3. 生成任务总结

</step>

</process>

---

<storage_structure>

```
.harness/memory/
├── current.json                    # 当前任务指针
│   {
│     "taskId": "task-2026-03-20-auth",
│     "taskName": "开发用户认证模块",
│     "sessions": 3,
│     "lastSession": "session-03.md"
│   }
│
└── tasks/
    └── task-2026-03-20-auth/
        ├── meta.json               # 元信息
        │   {
        │     "taskName": "开发用户认证模块",
        │     "createdAt": "2026-03-20T10:00:00Z",
        │     "status": "in_progress",
        │     "tags": ["auth", "api"]
        │   }
        │
        ├── session-01.md           # 会话 1 记录
        ├── session-02.md           # 会话 2 记录
        └── session-03.md           # 会话 3 记录
```

</storage_structure>

---

<auto_save_protocol>

## AI 主动保存规则

由于 Hooks 无法完全无感监听，AI 应在以下时机主动保存：

<trigger condition="上下文接近限制">
当检测到上下文使用超过 70% 时，提示用户：
"上下文快满了，是否保存当前进展？"
</trigger>

<trigger condition="完成里程碑">
当完成重要功能时，自动保存：
```
/task-memory save "完成邮箱登录 API"
```
</trigger>

<trigger condition="用户请求">
用户说"保存一下"、"记录一下"时，执行保存
</trigger>

<trigger condition="会话结束">
检测到 Stop hook 触发时，提醒保存
</trigger>

</auto_save_protocol>

---

<session_template>

## Session 记录模板

```markdown
---
sessionId: session-03
date: 2026-03-22
duration: ~30min
---

## 用户输入链

### 输入 1
> "继续之前的任务"

**上下文**: 恢复 Session 2 的进度

### 输入 2
> "修复登录 API 的 bug，密码加密有问题"

**触发原因**: Session 2 遗留的 bcrypt 兼容性问题

### 输入 3
> "测试一下登录功能"

**目的**: 验证修复

---

## AI 行动记录

| 行动 | 文件 | 结果 |
|------|------|------|
| 升级 bcrypt | package.json | ✅ |
| 修改加密逻辑 | src/auth/password.ts | ✅ |
| 编写测试 | tests/auth.test.ts | ✅ |

---

## Prompt 优化笔记

### 原始 Prompt 不足
- 未指定 bcrypt 版本要求
- 未说明 Node.js 版本

### 改进建议
下次开发类似功能时，Prompt 应包含：
- "使用 bcrypt 5.x，兼容 Node.js 18+"
```

</session_template>

---

<integration>

## 与 Task Workflow 的集成

```
Task Workflow 调用 Task Memory 的时机：

INIT 阶段:
  → /task-memory start <任务名>

EXECUTE 阶段:
  → 每次重要操作后 /task-memory save

REVIEW 阶段:
  → /task-memory end
```

</integration>

---

<examples>

## 示例 1: 新会话恢复任务

```
用户: 继续开发用户认证模块

AI: [检查 .harness/memory/current.json]

## 📋 任务恢复

上次你在做：开发用户认证模块
- 进度：60%
- 最后更新：2 天前

### 上次做了什么
- 完成了邮箱登录 API
- 遇到密码加密 bug（已修复）

### 待处理
1. 手机验证码功能
2. 第三方 OAuth

从哪里继续？
```

## 示例 2: 保存进展

```
AI: [检测到上下文 75%]

⚠️ 上下文快满了

建议保存当前进展：
/task-memory save "完成手机验证码 API，待处理 OAuth"

保存后可以开启新会话继续。
```

</examples>
