# Harness 模板库

> 此文件包含各类任务的 Harness 模板，供主 SKILL.md 引用。
> 模板融入项目的 tests/ 体系，不使用独立的 .harness/ 目录。

## BDD Case 模板（UI 组件/页面）

### 模板文件：`tests/bdd/cases/{page}/T-{prefix}{N}.js`

```javascript
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
  ],
}
```

### 测试脚本：`tests/bdd/{page}/T-{prefix}{N}.test.ts`

```typescript
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

  /**
   * T-{{prefix}}{{N}} 完整流程（N 步）:
   * Step 1: {{步骤1描述}}
   * Step 2: {{步骤2描述}}
   */
  it('完整流程: {{步骤摘要}}', async () => {
    // 准备 mock 数据
    apiMock.mockResolvedValue({
      success: true,
      data: {{mockData}},
    })

    // Step 1: {{描述}}
    const { default: Page } = await import('{{pageComponentPath}}')
    render(React.createElement(Page))

    const pageEl = await screen.findByTestId('{{pageTestId}}')
    expect(pageEl).toBeTruthy()

    // Step 2: {{描述}}
    // ...
  })
})
```

---

## 集成测试模板（数据一致性/配置对齐）

### 文件：`tests/integration/{name}-consistency.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../..')

describe('{{name}} 一致性', () => {
  it('should have same count', () => {
    const sourceA = getFromSourceA()
    const sourceB = getFromSourceB()
    expect(sourceB.length).toBe(sourceA.length)
  })

  it('should have matching entries', () => {
    const aNames = getFromSourceA()
    const bNames = getFromSourceB()
    const missing = aNames.filter((n) => !bNames.includes(n))
    expect(missing, `缺失: ${missing.join(', ')}`).toEqual([])
  })
})
```

---

## 单元测试模板（纯函数/工具）

### 文件：`tests/unit/{name}.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { {{functionName}} } from '{{modulePath}}'

describe('{{functionName}}', () => {
  it('should handle normal input', () => {
    const result = {{functionName}}({{validInput}})
    expect(result).toEqual({{expectedOutput}})
  })

  it('should handle edge case: empty input', () => {
    const result = {{functionName}}([])
    expect(result).toEqual([])
  })

  it('should throw for invalid input', () => {
    expect(() => {{functionName}}(null)).toThrow()
  })
})
```

---

## 编号规则速查

| 页面 | 前缀 | 目录 |
|------|------|------|
| Develop | `T-D` | cases/develop/, bdd/develop/ |
| Skills | `T-S` | cases/skills/, bdd/skills/ |
| Settings | `T-ST` | cases/settings/, bdd/settings/ |
| 集成测试 | 无编号 | tests/integration/ |
| 单元测试 | 无编号 | tests/unit/ |
