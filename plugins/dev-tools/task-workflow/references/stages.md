# Task Workflow 阶段详解

> 此文件提供每个阶段的详细说明和操作指南。

## 阶段转换图

```
INIT → LISTEN → BRAINSTORM → HARNESS → PLAN → EXECUTE ⇄ VERIFY → REVIEW
                    ↑             ↑         ↑          ↑
                    └─────────────┴─────────┴──────────┘
                               可随时回退
```

---

## INIT 阶段

### 目标
初始化工作流目录和状态文件。

### 检查清单
- [ ] 创建 `.harness/` 目录
- [ ] 生成 `workflow.json`
- [ ] 生成 `task-slug`

### workflow.json 模板

```json
{
  "taskId": "wf-2026-03-22-001",
  "name": "<任务名称>",
  "taskSlug": "<任务名称规范化后的slug>",
  "stage": "INIT",
  "createdAt": "2026-03-22T10:00:00Z",
  "updatedAt": "2026-03-22T10:00:00Z",
  "history": [
    {
      "stage": "INIT",
      "enteredAt": "2026-03-22T10:00:00Z"
    }
  ],
  "deviations": 0,
  "dependencies": ["task-memory", "task-harness"]
}
```

### task-slug 规则
- [ ] 全部转小写
- [ ] 非字母数字字符替换为 `-`
- [ ] 连续 `-` 合并
- [ ] 去除首尾 `-`
- [ ] 空结果时回退到 `task-<timestamp>`

---

## LISTEN 阶段

### 目标
启动 task-memory，记录初始意图并支持跨会话恢复。

### 输入
- workflow.json
- 用户原始任务描述

### 输出
- `.harness/memory/init.md`
- 任务追踪上下文

### 执行要点
1. 检查是否有历史会话
2. 记录初始 Prompt 与约束
3. 建立当前会话记录

---

## BRAINSTORM 阶段

### 目标
创意发散，生成多个设计方案并选择最优解。

### 输入
- 任务描述
- 用户需求细节

### 输出
- 设计脑图
- 方案对比
- 最终决策

### 引导问题

```
1. 这个任务要解决什么问题？
2. 有哪些可能的实现方式？
3. 每种方式的优缺点是什么？
4. 有什么技术限制或约束？
5. 预期的交付物是什么？
```

### 产物模板

```markdown
# 设计脑图：<任务名>

## 核心问题
<要解决的问题>

## 方案列表

### 方案 A: <名称>
- 描述: <简述>
- 优点: <列出>
- 缺点: <列出>
- 复杂度: 低/中/高

### 方案 B: <名称>
...

## 最终选择
选择方案 X，理由：<说明>
```

---

## HARNESS 阶段

### 目标
定义可检测的验收标准。

### 输入
- 设计方案
- 需求细节

### 输出
- Harness 定义
- 验证脚本（`verify.sh`）

### 验收标准分类

| 级别 | 含义 | 验证方式 |
|------|------|----------|
| MUST | 必须满足 | 自动化测试 |
| SHOULD | 强烈建议 | 手动验证 |
| MAY | 可选功能 | 演示确认 |

### Harness 模板

```markdown
# Harness: <任务名>

## 任务类型
<函数/网页/CLI/脚本/API/配置>

## 验收标准

### MUST
- [ ] <标准1>
- [ ] <标准2>

### SHOULD
- [ ] <标准3>

### MAY
- [ ] <标准4>

## 验证命令

```bash
bash .harness/harness/<task-slug>/verify.sh
```
```

---

## PLAN 阶段

### 目标
将任务分解为可执行步骤，并为每个步骤绑定验证方式。

### 输入
- Harness 定义
- 设计方案

### 输出
- `PLAN.md`
- 任务依赖关系
- 每项任务的 verify 定义

### 任务拆分原则
1. **原子性** - 每个任务可独立完成
2. **可验证** - 完成后能判断是否成功
3. **粒度适中** - 不太大也不太小
4. **依赖明确** - 前后关系清晰

### 任务模板

```markdown
# 任务列表

- [ ] T1: <任务描述>
  - 依赖: 无
  - verify: <命令>

- [ ] T2: <任务描述>
  - 依赖: T1
  - verify: <命令>
```

---

## EXECUTE 阶段

### 目标
执行任务并记录偏差。

### 输入
- PLAN.md
- Harness 定义

### 输出
- 偏差记录
- 执行日志

### 偏差记录触发词

```
- "发现..."
- "不对..."
- "问题是..."
- "应该..."
- "需要修改..."
- "忘记..."
- "漏了..."
```

### 执行流程

```
1. 选择下一个未完成任务
2. 执行任务
3. 进入 VERIFY 阶段运行验证
4. 记录偏差（如有）
5. 标记任务完成
6. 重复直到所有任务完成
```

---

## VERIFY 阶段

### 目标
强制验证 MUST 条件；测试通过才允许推进。

### 输入
- 当前任务代码
- `verify.sh`

### 输出
- 验证结果（通过/失败）
- 失败分析与修复记录

### 验证循环

```bash
while ! bash .harness/harness/<task-slug>/verify.sh; do
  # 分析失败原因
  # 修复代码
  # 记录到 task-memory
  :
done
```

### 规则
- [ ] quick 模式不能跳过 VERIFY
- [ ] yolo 模式不能跳过 VERIFY
- [ ] 进入 REVIEW 前 MUST 全部通过

---

## REVIEW 阶段

### 目标
复盘总结，沉淀经验。

### 输入
- 偏差记录
- Harness 验证结果
- 任务完成情况

### 输出
- 复盘报告
- 改进建议

### 复盘问题

```
1. 哪些地方与预期不同？
2. 为什么会出现这些偏差？
3. 如何避免类似问题？
4. Harness 定义是否完整？
5. 下次可以改进什么？
```

---

## 阶段回退

允许从任意阶段回退到之前的阶段：

```
/task-workflow goto BRAINSTORM    # 回到设计阶段
/task-workflow goto HARNESS       # 回到验收定义
```

### 回退时保留的产物

| 回退到 | 保留产物 | 需重做产物 |
|--------|----------|------------|
| BRAINSTORM | workflow.json, memory/ | harness/, plan/, execute 后产物 |
| HARNESS | workflow.json, memory/, planning/ | harness/, plan/, execute 后产物 |
| PLAN | workflow.json, memory/, planning/, harness/ | plan/, execute 后产物 |
| EXECUTE | 全部 | - |
