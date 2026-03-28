# 完整示例与阶段详解

> 本文件包含完整的任务工作流示例和每个阶段的详细说明。

## 完整示例

```
用户: /task-workflow 开发用户认证模块

AI: 启动任务工作流

## INIT
- 任务 ID: wf-2026-03-22-001
- 目录: .harness/ 已创建

## LISTEN
启动 task-memory 监听...
/task-memory start "开发用户认证模块" "支持邮箱、手机、第三方登录"

初始意图已记录:
- 预期目标: 实现用户认证功能
- 预期文件: src/auth/, src/api/auth.ts
- 预期输出: 可用的登录系统

## BRAINSTORM
/brainstorming

请描述需求细节...

用户: 支持邮箱密码登录、手机验证码登录、微信/GitHub OAuth

AI: [生成方案对比]
    方案 A: 统一认证接口
    方案 B: 分离认证服务

    你选择哪个方案？

用户: 方案 A

AI: 已记录决策

## HARNESS
/task-harness "实现用户认证模块"

定义验收标准...

[问答过程...]

生成 Harness:
### MUST
- [ ] 邮箱登录返回有效 token
- [ ] 手机号格式验证
- [ ] 第三方登录跳转正确

## PLAN
/writing-plans

生成执行计划:
1. T1: 创建 User 模型
2. T2: 实现邮箱登录 API
3. T3: 实现手机验证码
4. C1: Checkpoint - 验证登录流程
5. T4: 集成第三方 OAuth

## EXECUTE
/executing-plans

执行 T1: 创建 User 模型...
T1 完成

执行 T2: 实现邮箱登录 API...
发现偏差: 密码加密库与预期不同
/task-memory record "密码加密库使用 bcrypt 而非 argon2"
T2 完成（含偏差修复）

[继续执行...]

## REVIEW
/task-memory end

生成复盘报告:
- 总耗时: 4h
- 偏差数: 3
- 改进建议: ...

工作流完成！
```

---

## 阶段详解

### INIT 阶段

**检查清单**：
- 生成 `task-slug`
- 创建 `.harness/tasks/{task-slug}/` 目录
- 生成 `workflow.json`（含 stageTimeline）
- 生成 `current.json`

**workflow.json 模板**：

```json
{
  "taskId": "wf-2026-03-22-001",
  "name": "<任务名称>",
  "taskSlug": "<任务名称规范化后的slug>",
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

**目录创建命令**：
```bash
mkdir -p .harness/tasks/{task-slug}/{listen,brainstorm,harness,plan,execute,review}
```

---

### LISTEN 阶段

**执行要点**：
1. 检查是否有历史会话
2. 记录初始 Prompt 与约束
3. 建立当前会话记录

**恢复场景**：如果存在历史记录，读取并展示摘要，询问用户从哪里继续。

---

### BRAINSTORM 阶段

**引导问题**：

```
1. 这个任务要解决什么问题？
2. 有哪些可能的实现方式？
3. 每种方式的优缺点是什么？
4. 有什么技术限制或约束？
5. 预期的交付物是什么？
```

**产物模板**：

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

### HARNESS 阶段

**验收标准分类**：

| 级别 | 含义 | 验证方式 |
|------|------|----------|
| MUST | 必须满足 | 自动化测试 |
| SHOULD | 强烈建议 | 手动验证 |
| MAY | 可选功能 | 演示确认 |

**任务类型参考**：函数 / 网页 / CLI / 脚本 / API / 配置

---

### PLAN 阶段

**任务拆分原则**：
1. **原子性** - 每个任务可独立完成
2. **可验证** - 完成后能判断是否成功
3. **粒度适中** - 不太大也不太小
4. **依赖明确** - 前后关系清晰

**成功标准**：
- 所有 MUST 条件都有对应任务
- 每个任务都有 verify 定义
- 任务顺序符合依赖关系

---

### EXECUTE 阶段

**偏差记录触发词**：

```
- "发现..."
- "不对..."
- "问题是..."
- "应该..."
- "需要修改..."
- "忘记..."
- "漏了..."
```

**核心职责**：
- 编写测试用例（基于 HARNESS MUST 条件）
- 实现功能代码
- 记录执行偏差到 task-memory
- 不负责验证循环（验证逻辑在 VERIFY 阶段）

**门控确认**：
使用 AskUserQuestion 询问：
- 问题："任务代码已编写完成，是否进入 VERIFY？"
- 选项：approve（进入 VERIFY）/ adjust（调整实现）/ add（补充遗漏任务）

---

### VERIFY 阶段

**规则**：
- quick 模式不能跳过 VERIFY
- yolo 模式不能跳过 VERIFY
- 进入 REVIEW 前 MUST 全部通过

**核心职责**：
- 读取所有 HARNESS 的 MUST 条件
- 运行 `verify.sh` 验证脚本
- 失败则循环修复（最多 5 次）
- 超过重试上限则暂停询问用户

**验证循环**：

```bash
while ! bash .harness/tasks/{task-slug}/harness/verify.sh; do
  # 分析失败原因
  # 修复代码
  # 记录到 task-memory
  :
done
```

**门控确认**：
使用 AskUserQuestion 询问：
- 问题："所有 HARNESS MUST 条件是否全部通过？"
- 选项：
  - approve：全部通过，进入 REVIEW
  - report：查看详细测试报告
  - fix：返回修复问题

**异常处理**（重试 5 次后）：
- 重新设计 HARNESS
- 重新制定 PLAN
- 手动介入修复

---

### REVIEW 阶段

**复盘问题**：

```
1. 哪些地方与预期不同？
2. 为什么会出现这些偏差？
3. 如何避免类似问题？
4. Harness 定义是否完整？
5. 下次可以改进什么？
```

**输出文件**：

```
.harness/
├── current.json                        # 活跃任务指针（已指向当前任务）
└── tasks/
    └── user-auth-module/
        ├── workflow.json               # 完整工作流状态（含 stageTimeline）
        ├── listen/
        │   ├── intent.md               # 初始意图
        │   ├── deviation-*.md          # 偏差记录
        │   └── review.md              # 复盘报告
        ├── brainstorm/
        │   ├── mindmap.md
        │   ├── options.md
        │   └── decision.md
        ├── harness/
        │   ├── harness.md              # 验收标准
        │   └── verify.sh               # 验证脚本
        └── plan/
            └── PLAN.md                 # 执行计划
```
