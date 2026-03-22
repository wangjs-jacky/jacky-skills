# 通用模式：Approve 检查点设计

本文件沉淀的是**用户确认/检查点**的可复用设计模式，用于 workflow 中需要人工介入的关键节点。

## 核心原则

| 原则 | 说明 |
|------|------|
| **Claude 自动化一切** | 检查点只用于验证和决策，不用于手动执行命令 |
| **用户只做人需要做的事** | 视觉检查、UX 评估、"感觉对不对" |
| **Auto-mode 可绕过** | 当 `workflow.auto_advance = true` 时，非阻塞型检查点可自动通过 |

## 1) Human-Verify 检查点（验证型）

**用途**：Claude 完成工作后，需要人工确认是否正确。

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Claude 自动构建的内容] - 服务运行在 [URL]</what-built>
  <how-to-verify>
    访问 [URL] 并验证：
    1. 视觉检查点 1
    2. 视觉检查点 2
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>
```

### 关键要素

| 要素 | 说明 | 示例 |
|------|------|------|
| `gate="blocking"` | 阻塞型检查点，必须用户响应 | `gate="blocking"` |
| `what-built` | 说明 Claude 完成了什么 | "登录页面已部署到 localhost:3000" |
| `how-to-verify` | 具体的验证步骤（只包含视觉/交互检查） | "1. 点击登录按钮 2. 验证跳转正确" |
| `resume-signal` | 告诉用户如何继续 | "Type 'approved' or describe issues" |

### 验证步骤规范

**✅ 正确的验证步骤**（用户可以直接操作）：
- 访问页面并检查布局
- 点击按钮验证交互
- 检查特定元素的显示
- 验证表单提交流程

**❌ 错误的验证步骤**（不应包含）：
- 运行 CLI 命令
- 检查日志文件
- 执行测试脚本

> **原则**：CLI 命令、日志检查等应由 Claude 自动执行，检查点只包含用户可以直观验证的内容。

## 2) Decision 检查点（决策型）

**用途**：需要人工做出选择，影响实现方向。

```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>[需要决定什么]</decision>
  <context>[为什么这个决策很重要]</context>
  <options>
    <option id="option-a">
      <name>[选项名称]</name>
      <pros>[优点]</pros>
      <cons>[权衡/缺点]</cons>
    </option>
    <option id="option-b">
      <name>[选项名称]</name>
      <pros>[优点]</pros>
      <cons>[权衡/缺点]</cons>
    </option>
  </options>
  <resume-signal>Select: option-a or option-b</resume-signal>
</task>
```

### 关键要素

| 要素 | 说明 |
|------|------|
| `decision` | 明确需要决定的问题 |
| `context` | 决策的背景和影响 |
| `options` | 选项列表，每个包含 name/pros/cons |
| `resume-signal` | 如何选择（选项 ID） |

### 选项设计规范

1. **提供足够的上下文** - 用户不需要额外查询就能做决定
2. **列出优缺点** - 帮助用户权衡
3. **选项数量适中** - 建议 2-4 个选项
4. **选项 ID 简洁** - 便于用户输入（如 `option-a`、`fast`、`safe`）

## 3) Human-Action 检查点（行动型）

**用途**：需要用户执行特定操作（如认证、授权）。

```xml
<task type="checkpoint:human-action" gate="blocking">
  <action-required>[用户需要执行的操作]</action-required>
  <why-required>[为什么需要这个操作]</why-required>
  <steps>
    1. 访问 [URL]
    2. 点击授权
    3. 返回此处
  </steps>
  <resume-signal>Type "done" after completing the action</resume-signal>
</task>
```

> **重要**：Human-Action 检查点在 auto-mode 下**仍然阻塞**，因为涉及认证/授权的操作不能自动化。

## 4) 用户响应处理

### 批准信号

以下响应视为**批准**：
- `"approved"`、`"yes"`、`"y"`、`"ok"`
- `"pass"`、`"next"`、`"done"`、`"✓"`
- 空响应（直接回车）

### 问题报告

其他任何内容视为**问题描述**，进入问题修复流程：
- 用户描述具体问题
- Claude 根据描述修复
- 重新触发验证检查点

### 决策选择

用户选择选项时的响应格式：
- `"option-a"` 或 `"a"` - 选择选项 A
- `"fast"` - 如果选项 ID 是 `fast`
- 部分匹配也可接受（如 `"a"` 匹配 `"option-a"`）

## 5) Auto-Mode 行为

当 `workflow.auto_advance = true` 时：

| 检查点类型 | Auto-Mode 行为 |
|------------|----------------|
| `human-verify` | 自动批准，继续执行 |
| `decision` | 自动选择第一个选项 |
| `human-action` | **仍然阻塞**（认证门不能自动化） |

### Auto-Mode 配置

```json
{
  "workflow": {
    "auto_advance": true,
    "default_decision": "first",  // 或 "safest"
    "skip_verify": true
  }
}
```

## 6) Markdown 格式模板

如果不使用 XML，也可以用 Markdown 表格格式：

### 验证型

```markdown
> ⚠️ **Checkpoint - 需要验证**
>
> | 检查项 | 说明 |
> |--------|------|
> | ✅ 视觉检查 1 | 页面布局正确 |
> | ✅ 视觉检查 2 | 按钮可点击 |
>
> **回复 "approved" 通过，或描述问题**
```

### 决策型

```markdown
> ⚠️ **Checkpoint - 需要选择**
>
> | 选项 | 说明 | 权衡 |
> |------|------|------|
> | 🔵 **option-a** | 选项 A 描述 | 优点快，缺点不安全 |
> | 🟢 **option-b** | 选项 B 描述 | 优点安全，缺点慢 |
>
> **选择: option-a 或 option-b**
```

### 行动型

```markdown
> ⚠️ **Checkpoint - 需要操作**
>
> **操作步骤**：
> 1. 访问 https://example.com/auth
> 2. 完成授权
> 3. 返回此处
>
> **完成后回复 "done"**
```

## 7) 完整示例

### 示例 1：部署后验证

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    用户登录功能已部署到 http://localhost:3000/login
    - 支持邮箱/密码登录
    - 包含记住我选项
    - 错误提示已实现
  </what-built>
  <how-to-verify>
    访问 http://localhost:3000/login 并验证：
    1. 页面布局正确，表单居中显示
    2. 输入错误密码时显示红色错误提示
    3. 登录成功后正确跳转到首页
    4. "记住我" 功能正常工作
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or describe any issues found</resume-signal>
</task>
```

### 示例 2：技术选型决策

```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>选择数据存储方案</decision>
  <context>
    需要存储用户会话数据。
    选择会影响性能、成本和运维复杂度。
  </context>
  <options>
    <option id="redis">
      <name>Redis</name>
      <pros>高性能、成熟方案、支持过期</pros>
      <cons>需要额外部署、内存成本</cons>
    </option>
    <option id="postgres">
      <name>PostgreSQL</name>
      <pros>已有实例、无额外成本、持久化</pros>
      <cons>性能略低、需要定期清理</cons>
    </option>
    <option id="memory">
      <name>内存存储</name>
      <pros>零配置、最快速度</pros>
      <cons>重启丢失、不支持分布式</cons>
    </option>
  </options>
  <resume-signal>Select: redis, postgres, or memory</resume-signal>
</task>
```

### 示例 3：OAuth 授权

```xml
<task type="checkpoint:human-action" gate="blocking">
  <action-required>完成 GitHub OAuth 授权</action-required>
  <why-required>
    需要访问用户的 GitHub 仓库列表。
    这一步涉及用户隐私授权，无法自动化。
  </why-required>
  <steps>
    1. 点击链接打开授权页面: https://github.com/login/oauth/authorize?...
    2. 确认授权请求
    3. 完成后自动返回
  </steps>
  <resume-signal>Type "done" after completing authorization</resume-signal>
</task>
```

## 8) 设计技巧清单

| 技巧 | 说明 |
|------|------|
| ✅ 把 CLI 命令移出检查点 | Claude 自动执行，只让用户做视觉/交互验证 |
| ✅ 提供明确的 resume-signal | 用户不需要猜测该输入什么 |
| ✅ 列出完整的验证步骤 | 减少用户遗漏检查项的可能 |
| ✅ 决策点提供优缺点 | 帮助用户快速做决定 |
| ✅ 行动点说明原因 | 让用户理解为什么需要手动操作 |
| ❌ 不要让用户执行 CLI 命令 | 这应该由 Claude 自动完成 |
| ❌ 不要省略 resume-signal | 模糊的指令会增加沟通成本 |

## 9) 灵感来源

灵感来自 GSD 的 workflow 检查点设计，但本文件已抽象为通用协议，可用于任意需要用户确认的 skill 场景。
