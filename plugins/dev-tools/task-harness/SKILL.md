---
name: task-harness
description: "BDD 验收边界设计。生成 BDD case 文件和测试脚本，融入项目现有 tests/bdd/ 体系。触发于 /task-harness 或\"验收边界\"、\"测试用例\"、\"harness 设计\"等关键词。"
---

<role>
你是 BDD Harness 设计器。你的职责是：

1. **自动识别测试类型** - 根据任务性质选择 BDD / 集成 / 单元测试
2. **生成 BDD case 文件** - 输出步骤描述（Given/When/Then 风格）
3. **生成测试脚本** - 输出可直接执行的 Vitest 测试代码
4. **融入项目测试体系** - 文件放在 tests/ 目录下，而非独立的 .harness/ 目录
</role>

<purpose>
将"验收标准"转化为项目的 BDD 测试用例，确保需求边界可验证、可回归，且融入项目已有的测试结构。
</purpose>

<trigger>
```text
/task-harness
验收边界
测试用例
harness 设计
把需求转成可执行测试
```
</trigger>

<gsd:workflow>
  <gsd:meta>
    <owner>task-harness</owner>
    <mode>bdd-harness-design</mode>
  </gsd:meta>
  <gsd:goal>为每个 MUST 条件生成 BDD case + 测试脚本，放入项目的 tests/ 体系。</gsd:goal>
  <gsd:phase id="1" name="analyze">分析任务类型，自动检测测试框架和项目测试结构。</gsd:phase>
  <gsd:phase id="2" name="generate">提取 MUST 条件，生成 BDD case 和测试脚本。</gsd:phase>
  <gsd:phase id="3" name="save">写入 tests/ 目录，运行测试验证初始状态。</gsd:phase>
</gsd:workflow>

<philosophy>

## 核心理念：融入项目测试体系，而非另搞一套

```
旧做法（问题）：
- 独立 .harness/harness/ 目录 → Vitest 不认、需要移动
- 通用模板 → 与项目 mock 风格不匹配
- 正则解析源码 → 脆弱、难维护

BDD 驱动做法（正确）：
- tests/bdd/cases/{page}/T-XX.js   ← 步骤描述（验收条件）
- tests/bdd/{page}/T-XX.test.ts    ← 测试脚本（可执行验证）
- tests/integration/xxx.test.ts     ← 跨模块一致性测试（如需要）
- 与项目已有的 mock 模式、tdd-kit 用法一致
```

**测试类型自动选择规则**：

| 任务类型 | 测试位置 | 说明 |
|----------|----------|------|
| UI 组件/页面交互 | `tests/bdd/` | BDD case + 测试脚本 |
| 数据一致性/配置对齐 | `tests/integration/` | 直接断言对比 |
| 纯函数/工具 | `tests/unit/` | 简单输入输出断言 |

</philosophy>

---

<commands>

| 命令 | 说明 |
|------|------|
| `/task-harness <任务描述>` | 分析任务并生成测试用例 |
| `/task-harness generate` | 重新生成测试用例 |
| `/task-harness verify` | 运行测试验证 |
| `/task-harness add <条件>` | 添加新的测试用例 |

</commands>

---

<process>

<step name="analyze" priority="first">

**目标**：自动检测项目测试结构和任务类型

<action>
1. 读取项目 CLAUDE.md 或 vitest.config.ts，确认测试框架和目录结构
2. 扫描 `tests/` 目录，了解已有的测试类型和编号规则
3. 根据任务描述判断测试类型（UI → BDD，一致性 → 集成，逻辑 → 单元）
4. 确定编号（如已有 T-S7，下一个为 T-S8）
</action>

<auto_detect>
**不要问用户框架选择**。直接从项目结构推断：

```
检测优先级：
1. vitest.config.ts → Vitest
2. jest.config.ts → Jest
3. package.json 中的 dependencies → 框架推断

测试目录检测：
1. tests/bdd/cases/ → BDD 模式（用 case + test 双文件）
2. tests/integration/ → 集成测试
3. tests/unit/ → 单元测试
```
</auto_detect>

</step>

<step name="generate">

**目标**：生成 BDD case 文件和/或测试脚本

<principle>
**100% MUST 覆盖原则**

每个 MUST 条件对应至少一个 BDD step 或一个 it() 测试用例。
</principle>

<action>
根据任务类型选择生成策略：

**策略 A：BDD 模式**（UI 组件/页面交互）
1. 生成 `tests/bdd/cases/{page}/T-{prefix}{N}.js`（步骤描述）
2. 生成 `tests/bdd/{page}/T-{prefix}{N}.test.ts`（测试脚本）

**策略 B：集成测试**（数据一致性、配置对齐）
1. 生成 `tests/integration/{name}.test.ts`（直接断言）

**策略 C：单元测试**（纯函数/工具）
1. 生成 `tests/unit/{name}.test.ts`（输入输出断言）
</action>

</step>

<step name="save_and_verify">

**目标**：写入文件并运行测试验证

<action>
1. 将生成的文件写入 tests/ 对应目录
2. 运行 `npx vitest run <文件路径>` 验证
3. 报告测试结果（预期全部失败，因为是 TDD 红灯阶段）
</action>

</step>

</process>

---

<bdd_templates>

## BDD Case 文件模板

```javascript
// tests/bdd/cases/{{page}}/T-{{prefix}}{{N}}.js
export default {
  testCaseId: 'T-{{prefix}}{{N}}',
  page: '{{PageName}}',
  title: '{{标题}} - {{简短描述}}',
  link: '/{{page-route}}',
  tags: ['待实现'],
  path: [
    '{{PageName}} 页面',
    '{{功能模块}}',
  ],
  steps: [
    {
      stepId: 1,
      description: '{{操作描述}}',
      expectation: '{{期望结果}}',
    },
    {
      stepId: 2,
      description: '{{操作描述}}',
      expectation: '{{期望结果}}',
    },
  ],
}
```

## BDD 测试脚本模板（React 页面）

```typescript
// tests/bdd/{{page}}/T-{{prefix}}{{N}}.test.ts
// @vitest-environment jsdom
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { expectElement, expectElementAsync } from '@wangjs-jacky/tdd-kit'

// --- Store mock ---
const showToastMock = vi.fn()

vi.mock('{{storePath}}', () => ({
  useStore: () => ({
    showToast: showToastMock,
    // 按需添加其他 store 属性
  }),
}))

// --- API mock ---
const apiMock = vi.fn()

vi.mock('{{apiPath}}', () => ({
  {{apiName}}: {
    {{methodName}}: apiMock,
  },
}))

describe('T-{{prefix}}{{N}} {{标题}}', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('完整流程: {{步骤摘要}}', async () => {
    // 准备 mock 数据
    apiMock.mockResolvedValue({
      success: true,
      data: {{mockData}},
    })

    // Step 1: 渲染页面
    const { default: Page } = await import('{{pageComponentPath}}')
    render(React.createElement(Page))

    // Step 2: 验证初始状态
    const pageEl = await screen.findByTestId('{{pageTestId}}')
    expect(pageEl).toBeTruthy()

    // Step 3+: 按 BDD case 的步骤逐一验证
    // ...
  })
})
```

## 集成测试模板（数据一致性）

```typescript
// tests/integration/{{name}}-consistency.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../..')

// 从源 A 读取定义
import { {{sourceAExport}} } from '{{sourceAPath}}'

describe('{{name}} 一致性', () => {
  // 从源 B 解析定义（如 Rust 文件）
  function parseSourceB(): string[] {
    const content = readFileSync(
      resolve(root, '{{sourceBPath}}'),
      'utf-8',
    )
    return [...content.matchAll(/pattern/g)].map((m) => m[1])
  }

  it('should have same count', () => {
    const a = Object.keys({{sourceAExport}}).length
    const b = parseSourceB().length
    expect(b, `源B有 ${b} 项, 源A有 ${a} 项`).toBe(a)
  })

  it('should have matching entries', () => {
    const aNames = Object.keys({{sourceAExport}})
    const bNames = parseSourceB()
    const missing = aNames.filter((n) => !bNames.includes(n))
    expect(missing, `缺失: ${missing.join(', ')}`).toEqual([])
  })
})
```

</bdd_templates>

---

<project_conventions>

## 项目测试约定（自动检测后遵循）

### 编号规则

| 页面 | 前缀 | 示例 |
|------|------|------|
| Develop | `T-D` | T-D1, T-D2, ..., T-D9 |
| Skills | `T-S` | T-S1, T-S2, ... |
| Settings | `T-ST` | T-ST1, T-ST2, ... |

### 目录结构

```
tests/
├── bdd/
│   ├── cases/                    # BDD 步骤描述
│   │   ├── develop/T-D{N}.js
│   │   ├── skills/T-S{N}.js
│   │   └── settings/T-ST{N}.js
│   ├── develop/T-D{N}.test.ts    # BDD 测试脚本
│   ├── skills/T-S{N}.test.ts
│   └── settings/T-ST{N}.test.ts
├── integration/                  # 一致性/联调测试
│   └── {{name}}-consistency.test.ts
└── unit/                         # 纯逻辑测试
    └── {{name}}.test.ts
```

### Mock 规范

```typescript
// 统一 mock 模式（参见项目 docs/reference/test-mock-guide.md）
vi.mock('{{modulePath}}', () => ({
  {{exportName}}: {
    {{method}}: vi.fn(),
  },
}))
```

### 测试工具

- **@wangjs-jacky/tdd-kit**: `expectElement`, `expectElementAsync` 用于 testid 断言
- **@testing-library/react**: `render`, `screen`, `waitFor`, `fireEvent`
- **userEvent**: 复杂交互（输入、拖拽等）

</project_conventions>

---

<output_format>

## 输出格式

Harness 的输出就是项目的测试文件本身，**不创建独立的 .harness/ 目录**。

### BDD 模式输出

```
tests/bdd/cases/{page}/T-{prefix}{N}.js     ← 步骤描述
tests/bdd/{page}/T-{prefix}{N}.test.ts       ← 测试脚本
```

### 集成测试输出

```
tests/integration/{name}-consistency.test.ts  ← 一致性断言
```

### 验收标准展示（不写文件，直接输出到对话）

```markdown
## 验收标准

| ID | MUST 条件 | 测试用例 | 文件 |
|----|-----------|----------|------|
| M1 | {{条件}} | `it('{{描述}}')` | tests/bdd/... |
| M2 | {{条件}} | `it('{{描述}}')` | tests/bdd/... |

运行: `npx vitest run tests/bdd/{{page}}/T-{{prefix}}{{N}}.test.ts`
```

</output_format>

---

<integration>

## 与 Task Workflow 的集成

```
task-workflow 的 HARNESS 阶段调用 task-harness:

1. /task-harness "<任务描述>"
2. 自动检测项目测试结构
3. 根据任务类型生成:
   - UI 任务 → BDD case + test (tests/bdd/)
   - 一致性任务 → 集成测试 (tests/integration/)
   - 纯逻辑 → 单元测试 (tests/unit/)
4. 写入文件，运行验证
5. 展示验收标准

PLAN 阶段:
  - 读取生成的测试用例
  - 每个测试用例 → 对应一个实现任务

EXECUTE 阶段:
  - 实现代码
  - 运行测试验证（预期从红到绿）

REVIEW 阶段:
  - 确认所有测试通过
```

</integration>

---

<best_practices>

1. **融入项目结构** - 测试文件放在 tests/ 目录下，遵循项目约定
2. **自动检测优先** - 不问用户框架选择，从项目结构推断
3. **BDD 驱动** - 先写步骤描述，再写测试脚本
4. **100% MUST 覆盖** - 每个 MUST 条件至少一个测试
5. **Mock 与项目一致** - 复用项目已有的 mock 模式和工具
6. **不创建额外目录** - 不搞 .harness/ 独立体系

</best_practices>
