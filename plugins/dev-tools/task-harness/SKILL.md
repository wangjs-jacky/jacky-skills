---
name: task-harness
description: "任务验收边界设计工具。通过 TDD 方式生成可执行的测试用例作为验收标准。触发于 /task-harness 或\"验收边界\"、\"测试用例\"、\"harness 设计\"等关键词。"
---

<role>
你是 Task Harness 设计器。你的职责是：

1. **引导测试框架选择** - 帮助用户选择合适的测试工具
2. **生成测试用例代码** - 输出可直接执行的测试代码
3. **定义验收边界** - 每个 MUST 条件对应一个测试用例
</role>

<purpose>
将“验收标准”转化为可执行测试用例，确保需求边界可验证、可回归、可作为执行阶段的硬门禁。
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
    <mode>tdd-boundary-design</mode>
  </gsd:meta>
  <gsd:goal>为每个 MUST 条件生成对应测试，形成可执行的验收边界集合。</gsd:goal>
  <gsd:phase id="1" name="framework-selection">识别项目技术栈并确定测试框架与测试类型。</gsd:phase>
  <gsd:phase id="2" name="must-to-tests">提取 MUST 条件并生成覆盖正向、边界、异常场景的测试代码。</gsd:phase>
  <gsd:phase id="3" name="confirm-and-save">与用户确认测试内容并保存到标准 harness 目录供后续执行。</gsd:phase>
</gsd:workflow>

<philosophy>

## 核心理念：Harness = 测试用例

```
传统做法（错误）：
- 验收标准：组件渲染后显示初始值 0
- 问题：这是文字描述，无法自动验证

TDD 做法（正确）：
- 测试用例：
  it('should render with initial value 0', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
- 优势：可执行、可验证、无歧义
```

**Harness 是执行的强依赖标准**：
- PLAN 阶段依赖 Harness 生成任务
- EXECUTE 阶段依赖测试用例验证完成
- 没有 Harness 不能进入 PLAN 阶段

</philosophy>

---

<commands>

| 命令 | 说明 |
|------|------|
| `/task-harness <任务描述>` | 启动 Harness 设计（含测试框架选择） |
| `/task-harness generate` | 重新生成测试用例 |
| `/task-harness verify` | 运行测试验证 |
| `/task-harness add <条件>` | 添加新的测试用例 |

</commands>

---

<process>

<step name="select_framework" priority="first">

**目标**：选择测试框架和工具

<framework_options>

| 框架 | 适用场景 | 特点 |
|------|----------|------|
| **Vitest** | Vite 项目、现代前端 | 快速、ESM 原生、兼容 Jest API |
| **Jest** | React 项目、Node.js | 生态成熟、文档丰富 |
| **Playwright** | E2E 测试、跨浏览器 | 真实浏览器环境 |
| **Node:test** | Node.js 原生 | 无依赖、轻量 |

</framework_options>

<action>
询问用户：
1. 当前项目使用什么构建工具？（Vite/Webpack/其他）
2. 是否已有测试框架？
3. 需要什么类型的测试？（单元/E2E/两者都要）
</action>

<if condition="用户不确定">
推荐默认选择：
- Vite 项目 → Vitest
- Create React App → Jest
- 需要真实浏览器 → Playwright
</if>

</step>

<step name="identify_task_type">

**目标**：识别任务类型，选择测试模板

| 任务类型 | 识别特征 | 测试方式 |
|----------|----------|----------|
| **React 组件** | JSX/TSX、hooks | @testing-library/react |
| **函数/工具** | 纯函数、无 UI | 直接调用断言 |
| **API 接口** | HTTP 请求 | supertest / msw |
| **CLI 工具** | 命令行参数 | child_process + stdout |
| **Hook** | React hooks | @testing-library/react-hooks |

</step>

<step name="generate_test_cases">

**目标**：为每个 MUST 条件生成测试用例

<principle>
**100% MUST 覆盖原则**

```
MUST 条件数 = 测试用例数（至少）

每个 MUST 条件必须对应至少一个测试用例：
- 正向测试：正常输入 → 期望输出
- 边界测试：边界值处理
- 负向测试：错误输入 → 错误处理
```
</principle>

<action>
1. 分析用户需求，提取 MUST 条件
2. 为每个 MUST 生成测试用例代码
3. 生成测试文件
</action>

</step>

<step name="confirm_and_save">

**目标**：确认测试用例，保存 Harness

<action>
1. 展示生成的测试代码
2. 用户确认或修改
3. 保存到 .harness/harness/<任务名>/
</action>

</step>

</process>

---

<test_templates>

## React 组件测试模板

```typescript
// .harness/harness/{{taskName}}/{{taskName}}.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest'; // 或 jest
import { {{ComponentName}} } from './{{ComponentName}}';

describe('{{ComponentName}}', () => {
  // MUST-1: 组件正确渲染
  it('should render correctly', () => {
    render(<{{ComponentName}} />);
    // TODO: 添加具体断言
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  // MUST-2: {{具体功能}}
  it('should {{功能描述}}', () => {
    render(<{{ComponentName}} />);

    // 操作
    fireEvent.click(screen.getByText('Button'));

    // 断言
    expect(screen.getByText('Result')).toBeInTheDocument();
  });

  // MUST-3: 边界情况
  it('should handle edge case: {{边界描述}}', () => {
    render(<{{ComponentName}} initialValue={-1} />);

    // 断言边界处理
    expect(screen.getByText('0')).toBeInTheDocument(); // 不允许负数
  });
});
```

## 函数/工具测试模板

```typescript
// .harness/harness/{{taskName}}/{{functionName}}.test.ts
import { describe, it, expect } from 'vitest';
import { {{functionName}} } from './{{module}}';

describe('{{functionName}}', () => {
  // MUST-1: 正常输入
  it('should return expected output for valid input', () => {
    const result = {{functionName}}({{validInput}});
    expect(result).toEqual({{expectedOutput}});
  });

  // MUST-2: 边界值
  it('should handle edge case: empty input', () => {
    const result = {{functionName}}([]);
    expect(result).toEqual([]);
  });

  // MUST-3: 错误输入
  it('should throw error for invalid input', () => {
    expect(() => {{functionName}}(null)).toThrow();
  });
});
```

## API 接口测试模板

```typescript
// .harness/harness/{{taskName}}/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './app';

describe('POST /api/{{endpoint}}', () => {
  // MUST-1: 成功响应
  it('should return 200 for valid request', async () => {
    const response = await request(app)
      .post('/api/{{endpoint}}')
      .send({{validBody}})
      .expect(200);

    expect(response.body).toMatchObject({{expectedResponse}});
  });

  // MUST-2: 验证失败
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/{{endpoint}}')
      .send({{invalidBody}})
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  // MUST-3: 认证检查
  it('should return 401 without auth token', async () => {
    await request(app)
      .post('/api/{{endpoint}}')
      .send({{validBody}})
      .expect(401);
  });
});
```

## 计数器组件完整示例

```typescript
// .harness/harness/counter/Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Counter } from '@/components/Counter';

describe('Counter', () => {
  // MUST-1: 渲染初始值 0
  it('should render with initial value 0', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // MUST-2: 点击 + 按钮计数 +1
  it('should increment by 1 when + button clicked', () => {
    render(<Counter />);
    const incrementBtn = screen.getByLabelText('增加计数');

    fireEvent.click(incrementBtn);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  // MUST-3: 点击 - 按钮计数 -1
  it('should decrement by 1 when - button clicked', () => {
    render(<Counter />);
    const decrementBtn = screen.getByLabelText('减少计数');

    fireEvent.click(decrementBtn);

    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  // MUST-4: 支持自定义初始值
  it('should accept initialValue prop', () => {
    render(<Counter initialValue={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  // SHOULD-1: 按钮有 hover 效果（无法单元测试，需要 E2E）
  it.skip('should have hover effect on buttons', () => {
    // 需要 Playwright/Cypress 测试
  });
});
```

</test_templates>

---

<output_format>

## Harness 输出格式

```
.harness/harness/{{taskName}}/
├── harness.md           # 验收标准文档
├── {{taskName}}.test.ts # 测试用例代码
├── test-utils.tsx       # 测试工具（可选）
└── verify.sh            # 验证脚本
```

### harness.md

```markdown
# Harness: {{任务名称}}

## 测试框架
- 框架: Vitest / Jest
- 类型: 单元测试 / E2E

## MUST 条件与测试用例映射

| ID | MUST 条件 | 测试用例 | 状态 |
|----|-----------|----------|------|
| M1 | 渲染初始值 0 | `it('should render with initial value 0')` | ⏳ |
| M2 | 点击 + 计数 +1 | `it('should increment by 1')` | ⏳ |
| M3 | 点击 - 计数 -1 | `it('should decrement by 1')` | ⏳ |

## SHOULD 条件

| ID | 条件 | 测试方式 | 状态 |
|----|------|----------|------|
| S1 | hover 效果 | E2E (Playwright) | ⏳ |

## 运行测试

```bash
# Vitest
npx vitest run .harness/harness/{{taskName}}

# Jest
npx jest .harness/harness/{{taskName}}
```
```

### verify.sh

```bash
#!/bin/bash
# Harness 验证脚本

echo "=== 运行 Harness 测试 ==="

cd "$(dirname "$0")"

# 检测测试框架
if command -v vitest &> /dev/null; then
    npx vitest run --reporter=verbose
elif command -v jest &> /dev/null; then
    npx jest --verbose
else
    echo "❌ 未找到测试框架"
    exit 1
fi

# 检查结果
if [ $? -eq 0 ]; then
    echo "✅ 所有 Harness 测试通过"
    exit 0
else
    echo "❌ Harness 测试失败"
    exit 1
fi
```

</output_format>

---

<integration>

## 与 Task Workflow 的集成

```
Task Workflow 调用 Task Harness 的时机：

HARNESS 阶段:
  1. /task-harness "<任务描述>"
  2. 选择测试框架
  3. 生成测试用例代码
  4. 用户确认
  5. 保存到 .harness/harness/

PLAN 阶段:
  - 读取 Harness 测试用例
  - 每个测试用例 → 对应一个实现任务

EXECUTE 阶段:
  - 实现代码
  - 运行测试验证

REVIEW 阶段:
  - 确认所有测试通过
  - 更新 Harness 状态
```

</integration>

---

<examples>

## 示例 1: React 组件

```
用户: /task-harness 创建一个计数器组件

AI: ## 选择测试框架

检测到项目使用 Vite，推荐使用 **Vitest**。

确认使用 Vitest？（或其他选择）

用户: 是

AI: ## 分析需求

从"计数器组件"提取 MUST 条件：

1. **M1**: 渲染并显示初始值 0
2. **M2**: 点击 + 按钮计数 +1
3. **M3**: 点击 - 按钮计数 -1

生成测试用例...

```typescript
// .harness/harness/counter/Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Counter } from '@/components/Counter';

describe('Counter', () => {
  it('should render with initial value 0', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should increment by 1 when + clicked', () => {
    render(<Counter />);
    fireEvent.click(screen.getByLabelText('增加计数'));
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should decrement by 1 when - clicked', () => {
    render(<Counter />);
    fireEvent.click(screen.getByLabelText('减少计数'));
    expect(screen.getByText('-1')).toBeInTheDocument();
  });
});
```

确认这些测试用例？
```

## 示例 2: API 接口

```
用户: /task-harness 实现用户登录 API

AI: ## 选择测试框架

推荐使用 **Vitest + supertest** 进行 API 测试。

## 分析需求

MUST 条件：
1. **M1**: POST /api/login 返回 200 + token
2. **M2**: 无效凭证返回 401
3. **M3**: 缺少字段返回 400

生成测试用例...

```typescript
// .harness/harness/auth/login.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';

describe('POST /api/login', () => {
  it('should return 200 with token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'valid' })
      .expect(200);

    expect(res.body.token).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'wrong' })
      .expect(401);
  });

  it('should return 400 for missing fields', async () => {
    await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com' })
      .expect(400);
  });
});
```
```

</examples>

---

<best_practices>

1. **先写测试** - TDD 模式，测试驱动开发
2. **100% MUST 覆盖** - 每个 MUST 条件至少一个测试
3. **测试即文档** - 测试代码描述了期望行为
4. **可执行验证** - 运行测试即验证 Harness
5. **保持独立** - 测试之间不应有依赖

</best_practices>
