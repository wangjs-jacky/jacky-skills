---
name: task-memory
description: 长任务对话记录工具。记录任务执行过程中的偏差，帮助改进 prompt 设计。触发于 /task-memory 命令或"任务记录"、"偏差记录"、"prompt 复盘"等关键词。
---

# Task Memory - 长任务对话记录工具

## 用途

记录开发任务从开始到结束的完整过程，重点关注：
- 初始设计/Prompt 的内容
- 执行过程中发现的偏差和修正
- 最终复盘分析，改进未来的 prompt 设计

## 前提条件

**需要安装 jq（JSON 处理工具）：**

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## 命令

### /task-memory start <任务名> [描述]

开始一个新任务，记录初始设计。

**参数**：
- `<任务名>`：任务的简短标识（必填）
- `[描述]`：任务的详细描述（可选）

**示例**：
```
/task-memory start "修复登录 bug" "用户反馈登录后页面白屏"
```

**行为**：
1. 在 `.harness/memory/tasks/` 下创建新任务目录
2. 生成 `init.md`，包含：
   - 任务目标
   - 初始设计方案（需手动填写）
   - 预期步骤（需手动填写）
   - 涉及的文件（需手动填写）
3. 更新 `.harness/memory/current.json` 标记当前任务

---

### /task-memory record <描述>

记录一次偏差或修正。

**参数**：
- `<描述>`：偏差的简短描述（必填）

**示例**：
```
/task-memory record "发现事件冒泡导致点击无响应"
```

**行为**：
1. 检测当前是否有进行中的任务
2. 生成 `deviation-XX.md` 文件，包含：
   - 问题描述
   - 发现原因（需手动填写）
   - 修复方案（需手动填写）
   - 根因分析（需手动填写）

---

### /task-memory status

查看当前任务状态。

**输出**：
- 当前任务信息（ID、名称、开始时间）
- 已记录的偏差数量
- 最近 3 条偏差摘要

---

### /task-memory end

结束当前任务，生成复盘报告。

**行为**：
1. 汇总所有偏差记录
2. 生成 `review.md`，包含：
   - 时间线统计
   - 偏差列表
3. 清空 `.harness/memory/current.json`

---

### /task-memory list

列出项目中所有任务记录。

---

### /task-memory review <任务ID>

重新查看某个任务的复盘报告。

**示例**：
```
/task-memory review task-2026-03-21-001
```

---

## 文件格式

### init.md（初始设计）

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

### deviation-XX.md（偏差记录）

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

### review.md（复盘报告）

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

## 使用流程

```
1. 开始任务
   /task-memory start "修复登录 bug"

2. 正常工作中...
   (Claude Code Hooks 检测偏差关键词，提示确认)

3. 手动记录偏差
   /task-memory record "发现接口返回结构不一致"

4. 查看进度
   /task-memory status

5. 结束任务
   /task-memory end
   → 生成复盘报告

6. 回顾历史
   /task-memory list
   /task-memory review task-2026-03-21-001
```

---

## 存储位置

所有数据存储在项目目录下的 `.harness/memory/` 中：

```
<your-project>/
└── .harness/
    └── memory/
        ├── current.json            # 当前任务状态
        └── tasks/
            └── task-2026-03-21-001/
                ├── init.md         # 初始设计
                ├── deviation-01.md # 偏差记录 1
                ├── deviation-02.md # 偏差记录 2
                └── review.md       # 复盘报告
```

---

## 最佳实践

1. **任务开始时记录初始设计** - 不要跳过这一步，这是复盘的基础
2. **及时记录偏差** - 发现问题时立即记录，避免遗忘
3. **填写根因分析** - 这是最有价值的部分，帮助改进 prompt
4. **定期回顾复盘报告** - 积累经验，避免重复犯错
