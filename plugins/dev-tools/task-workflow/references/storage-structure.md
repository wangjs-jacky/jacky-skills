# 存储结构与工具集成

> 本文件包含目录结构、task-slug 规则、工具集成说明、最佳实践和反模式。

## 目录结构

```
.harness/
├── current.json                         # 活跃任务指针（仅一个）
└── tasks/
    └── {task-slug}/                     # 每个任务独立目录
        ├── workflow.json                # 工作流状态（含 stageTimeline）
        ├── listen/                      # LISTEN 阶段产物
        │   ├── intent.md                # 初始意图
        │   ├── deviation-*.md           # 偏差记录
        │   └── review.md               # 复盘报告
        ├── brainstorm/                  # BRAINSTORM 阶段产物
        │   ├── mindmap.md               # 设计脑图
        │   ├── options.md               # 方案对比
        │   └── decision.md              # 最终决策
        ├── harness/                     # HARNESS 阶段产物
        │   ├── harness.md               # 验收标准
        │   └── verify.sh                # 验证脚本
        ├── plan/                        # PLAN 阶段产物
        │   └── PLAN.md                  # 任务列表
        └── execute/                     # EXECUTE 阶段产物（代码引用）
```

### workflow.json 模板

```json
{
  "taskId": "wf-2026-03-22-001",
  "name": "<任务名称>",
  "taskSlug": "<task-slug>",
  "status": "in_progress",
  "currentStage": "INIT",
  "createdAt": "2026-03-22T10:00:00Z",
  "updatedAt": "2026-03-22T10:00:00Z",
  "stageTimeline": {
    "INIT": {
      "enteredAt": "2026-03-22T10:00:00Z",
      "exitedAt": null
    }
  },
  "deviations": 0,
  "dependencies": ["task-memory", "task-harness"]
}
```

### current.json 模板

```json
{
  "activeTaskSlug": "<task-slug>",
  "currentStage": "INIT",
  "updatedAt": "2026-03-22T10:00:00Z"
}
```

---

## task-slug 规则

`task-slug` 用于目录命名，规则如下：
- 全部转小写
- 非字母数字字符转为 `-`
- 合并连续 `-`
- 去除首尾 `-`
- 若结果为空，回退到 `task-<timestamp>`

生成命令：
```bash
TASK_SLUG="$(printf '%s' "$TASK_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/-\{2,\}/-/g; s/^-//; s/-$//')"
```

---

## 工具集成

### 与 superpowers 的集成

| superpowers skill | 阶段 | 用途 |
|-------------------|------|------|
| `brainstorming` | BRAINSTORM | 创意发散 |
| `writing-plans` | PLAN | 编写执行计划 |
| `executing-plans` | EXECUTE | 执行计划 |

### 与 task-memory 的集成

| task-memory 命令 | 阶段 | 用途 |
|------------------|------|------|
| `start` | LISTEN | 记录初始意图 |
| `record` | EXECUTE | 记录偏差 |
| `end` | REVIEW | 生成复盘 |

### 与 task-harness 的集成

| task-harness 命令 | 阶段 | 用途 |
|-------------------|------|------|
| `/task-harness` | HARNESS | 定义验收边界 |

---

## 最佳实践

1. **不要跳过 LISTEN** - 初始意图是偏差检测的基础
2. **不要跳过 HARNESS** - 没有明确边界就无法验证完成
3. **及时记录偏差** - 发现偏差立即记录，避免遗忘
4. **认真做 REVIEW** - 复盘是改进的关键
5. **保存 workflow.json** - 便于中断后恢复，stageTimeline 提供完整阶段追溯

---

## 反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| 跳过 BRAINSTORM | 思考不足导致返工 | 至少做简短的方案探索 |
| 模糊的 Harness | 无法验证完成 | 使用可量化的标准 |
| 不记录偏差 | 无法复盘改进 | 发现偏差立即记录 |
| 不做 REVIEW | 无法沉淀经验 | 认真分析偏差根因 |

---

## Harness 模板

```markdown
# Harness: {{任务名称}}

## 验收标准

### 必须 (MUST)
- [ ] {{可验证条件 1}}
- [ ] {{可验证条件 2}}

### 应该 (SHOULD)
- [ ] {{可验证条件 3}}

## 验证命令
```bash
# 执行验证的命令
```
```

### Harness 反模式示例

```
错误: "界面要美观"        -> 无法验证
正确: "Lighthouse 分数 >= 90" -> 可验证

错误: "性能要好"          -> 模糊
正确: "首屏加载 < 2s"     -> 可量化
```

---

## PLAN 模板

```xml
<plan>
<task type="auto" id="T1">
  <name>{{任务名称}}</name>
  <files>{{涉及的文件}}</files>
  <action>{{具体行动}}</action>
  <verify>{{验证命令}}</verify>
  <harness_ref>{{对应的 Harness 条件}}</harness_ref>
</task>

<task type="checkpoint" id="C1" gate="blocking">
  <what-built>{{已构建的内容}}</what-built>
  <how-to-verify>{{验证方式}}</how-to-verify>
  <resume-signal>{{继续信号}}</resume-signal>
</task>
</plan>
```
