---
name: doc-to-tutorial
description: "将任意内容（文件夹/文件/文字）转换为交互式教程并启动预览服务。触发词：文档转教程、生成交互式教程、创建教程、制作教程、tutorial、interactive tutorial、转教程、做教程、写教程、文档变教程、把文档做成教程"
---

<role>
你是一个交互式教程生成专家。帮助用户将各种内容（文件夹、文件、文字描述）转换为结构化的交互式教程，并启动本地预览服务。
</role>

<purpose>
当用户需要将现有文档、项目或知识内容转换为交互式学习教程时，提供从内容分析、结构拆分、教程生成到预览部署的完整流程。
</purpose>

<philosophy>
**核心理念：内容转教程，交互式学习。**

- 自动识别内容来源类型（文件夹/文件/文字）
- 严格过滤敏感信息，保护隐私安全
- 遵循 GSD 风格的教程结构
- 检查点驱动，关键节点确认
- 即时预览，快速迭代
</philosophy>

<trigger>
```
帮我把这个文档转成教程
把 /path/to/my-project 生成交互式教程
创建一个 tutorial
制作教程
做教程
写教程
文档变教程
把文档做成教程
将这个文件夹转为交互式学习材料
generate tutorial
create interactive tutorial
```
</trigger>

<!-- ========== GSD Workflow XML 结构 ========== -->
<gsd:workflow>
  <gsd:meta>
    <name>doc-to-tutorial</name>
    <trigger>文档转教程、生成交互式教程、创建教程、制作教程、tutorial、interactive tutorial、转教程、做教程、写教程、文档变教程、把文档做成教程</trigger>
    <requires>Read, Write, Glob, Bash, AskUserQuestion</requires>

    <!-- 执行前检查点 -->
    <checkpoints>
      <checkpoint order="1">依赖检查通过（gsd-creator-skills）</checkpoint>
      <checkpoint order="2">内容来源已确认</checkpoint>
      <checkpoint order="3">敏感信息已处理</checkpoint>
      <checkpoint order="4">教程元数据已收集</checkpoint>
      <checkpoint order="5">生成的教程内容已确认</checkpoint>
      <checkpoint order="6">预览服务启动成功</checkpoint>
    </checkpoints>

    <!-- 安全约束 -->
    <constraints>
      <constraint>必须过滤敏感信息（.env、个人路径、credentials）</constraint>
      <constraint>生成的教程不包含真实密码或密钥</constraint>
      <constraint>使用占位符替换个人路径（如 &lt;YOUR_PATH&gt;）</constraint>
      <constraint>每个交互点必须等待用户确认后才继续</constraint>
    </constraints>
  </gsd:meta>

  <gsd:goal>将任意内容源转换为符合 interactive-tutorial 框架标准的交互式教程，并启动本地预览</gsd:goal>

  <gsd:phase name="dependency-check" order="0">
    <gsd:step>检查 gsd-creator-skills 依赖是否已安装</gsd:step>
    <gsd:step>若未安装，提示用户安装或确认跳过</gsd:step>
    <gsd:checkpoint>依赖就绪或用户确认跳过</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="collect-context" order="1">
    <gsd:step>检测内容来源类型（文件夹/文件/文字）</gsd:step>
    <gsd:step>扫描并过滤敏感信息</gsd:step>
    <gsd:step>收集教程元数据（标题、分类、难度、时长）</gsd:step>
    <gsd:checkpoint>内容来源、敏感信息处理、元数据全部确认</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="generate-tutorial" order="2">
    <gsd:step>分析源内容，拆分为逻辑步骤</gsd:step>
    <gsd:step>生成 config.json 元数据文件</gsd:step>
    <gsd:step>为每个步骤生成 .mdx 文件</gsd:step>
    <gsd:checkpoint>用户确认生成的教程结构和内容</gsd:checkpoint>
  </gsd:phase>

  <gsd:phase name="preview" order="3">
    <gsd:step>检查 INTERACTIVE_TUTORIAL_FRAMEWORK_PATH 配置</gsd:step>
    <gsd:step>启动 interactive-tutorial 预览服务</gsd:step>
    <gsd:checkpoint>预览服务运行正常，用户可访问</gsd:checkpoint>
  </gsd:phase>
</gsd:workflow>

---

## 配置变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `TUTORIAL_OUTPUT_PATH` | 教程输出目录 | `<当前工作区>/content/` |
| `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH` | 框架路径（**必须配置**） | 无默认值 |

> ⚠️ **必须配置**：`INTERACTIVE_TUTORIAL_FRAMEWORK_PATH` 需要在全局 CLAUDE.md 中设置，指向 interactive-tutorial-framework 的路径。
>
> 示例（添加到 ~/.claude/CLAUDE.md）：
> ```
> | `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH` | 框架路径 | `/path/to/interactive-tutorial-framework` |
> ```

## 前置依赖

### 必需

- **Node.js >= 18.0.0**
- **@wangjs-jacky/interactive-tutorial** - npm 全局包

```bash
npm install -g @wangjs-jacky/interactive-tutorial
```

### 验证安装

```bash
interactive-tutorial --version
```

### 可选（推荐）

- **gsd-creator-skills** - 用于参考 GSD 最佳实践

```bash
j-skills install gsd-creator-skills -g
```

## 执行流程

### Phase 0: 依赖检查

**目标**：确保必要依赖已就绪

**依赖列表**：
| 依赖 | 类型 | 说明 |
|------|------|------|
| `gsd-creator-skills` | skill | GSD 风格参考标准 |

**步骤**：
1. 检查 `gsd-creator-skills` 是否在全局 skills 目录中
2. 若未安装，提示用户：`j-skills install gsd-creator-skills -g`

> 🛑 **Checkpoint** — 必须确认
>
> | 检查项 | 说明 |
> |--------|------|
> | ✅ 依赖就绪 | gsd-creator-skills 已安装或用户确认跳过 |

### Phase 1: 收集上下文

**目标**：了解用户要转换的内容来源

**步骤**：

#### 1.1 检测内容来源类型

| 来源类型 | 说明 | 处理方式 |
|----------|------|----------|
| **文件夹路径** | 将文件夹内容转为教程 | 扫描目录结构，分析文件内容 |
| **单个文件路径** | 将文件内容转为教程 | 解析文件，拆分为步骤 |
| **直接输入文字** | 将用户描述转为教程 | 理解描述，结构化输出 |

#### 1.2 过滤个人内容（重要）

> ⚠️ **排除规则**：以下内容不应包含在生成的教程中

| 排除类型 | 示例 |
|----------|------|
| 环境变量文件 | `.env`、`.env.local`、`.env.*` |
| 依赖目录 | `node_modules/`、`vendor/` |
| 版本控制 | `.git/`、`.svn/` |
| 个人路径 | `/Users/xxx/`、`C:\Users\xxx\` |
| 敏感信息 | credentials、secrets、passwords |

**处理策略**：
1. 检测到敏感信息时警告用户
2. 提供脱敏选项
3. 使用占位符替换（如 `<YOUR_PATH>`、`<YOUR_API_KEY>`）

#### 1.3 收集教程元数据

| 字段 | 必需 | 说明 |
|------|------|------|
| 教程标题 | ✅ | 教程名称 |
| 教程分类 | 可选 | 如：入门指南、进阶教程 |
| 难度级别 | 可选 | 初级/中级/高级 |
| 预计时长 | 可选 | 如：30 分钟 |
| 标签 | 可选 | 用于分类搜索 |

> 🛑 **Checkpoint** — 必须确认
>
> | 检查项 | 说明 |
> |--------|------|
> | ✅ 内容来源 | 已明确内容来源类型和路径 |
> | ✅ 个人内容 | 已检测并处理敏感信息（脱敏/排除） |
> | ✅ 元数据 | 已收集教程标题等必要信息 |

### Phase 2: 生成教程内容

**目标**：根据内容来源生成交互式教程文件

**输出目录**：`$TUTORIAL_OUTPUT_PATH/<tutorial-name>/`（默认为当前工作区下的 `content/` 目录）

**目录结构**：
```
<当前工作区>/content/<tutorial-name>/
├── config.json           # 教程元数据
└── steps/
    ├── 01-intro.mdx      # 步骤 1
    ├── 02-step-two.mdx   # 步骤 2
    └── ...
```

**config.json 格式**：
```json
{
  "title": "教程标题",
  "coverEmoji": "🧭",
  "category": "分类",
  "difficulty": "初级|中级|高级",
  "duration": "X 分钟",
  "tags": ["标签1", "标签2"],
  "featured": false,
  "description": "教程简介",
  "steps": [
    { "id": "intro", "title": "欢迎使用", "order": 1 },
    { "id": "step-2", "title": "步骤 2 标题", "order": 2 }
  ]
}
```

**MDX 步骤格式**：
```mdx
---
id: step-id
title: 步骤标题
---

import { CodeBlock, Tip, Checkpoint } from '@components';

# 步骤标题

步骤内容...

## 子标题

<CodeBlock language="bash" copyable>{`命令示例`}</CodeBlock>

<Tip type="info" title="提示">
提示内容
</Tip>

<Checkpoint stepId="step-id" label="我已完成此步骤" />
```

**可用 MDX 组件**：
| 组件 | 用途 | 属性 |
|------|------|------|
| `<CodeBlock>` | 代码块 | `language`, `copyable` |
| `<Tip>` | 提示框 | `type` (info/warning/success/error), `title` |
| `<Checkpoint>` | 检查点按钮 | `stepId`, `label` |

**步骤**：
1. 分析源内容，拆分为逻辑步骤
2. 为每个步骤生成 `.mdx` 文件
3. 生成 `config.json` 元数据

> 🛑 **Checkpoint** — 用户确认
>
> | 操作 | 说明 |
> |------|------|
> | 🛑 等待 | 用户确认生成的教程结构和内容 |
> | ✅ 通过 | 用户确认后继续 |

### Phase 3: 启动预览服务

**目标**：使用 @wangjs-jacky/interactive-tutorial 启动本地预览

**步骤**：

1. **确认** 教程目录位于当前工作区的 `content/<tutorial-name>/` 下
2. **检查** `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH` 是否已配置：
   - 若未配置，提示用户在全局 CLAUDE.md 中添加配置
3. **执行** 启动命令：
   ```bash
   # 使用框架 CLI（需要先配置 INTERACTIVE_TUTORIAL_FRAMEWORK_PATH）
   cd $INTERACTIVE_TUTORIAL_FRAMEWORK_PATH
   npm run tutorial:serve -- --tutorial <tutorial-name> --port 5174 --open
   ```
4. **输出** 预览 URL（浏览器会自动打开）

**命令选项**：
```bash
# 基础启动（自动打开浏览器）
interactive-tutorial serve /path/to/framework/content --tutorial my-tutorial --open

# 指定端口
interactive-tutorial serve /path/to/framework/content --tutorial my-tutorial --port 5174 --open

# 不自动打开浏览器
interactive-tutorial serve /path/to/framework/content --tutorial my-tutorial --port 5174
```

> ✅ **Checkpoint** — 验证服务
>
> | 检查项 | 说明 |
> |--------|------|
> | ✅ 服务启动 | interactive-tutorial 服务正常运行 |
> | ✅ 预览可用 | 用户可以在浏览器访问预览页面 |

---

## 成功标准

<success_criteria>
完成以下所有项目即视为任务成功：

- [ ] **依赖检查**：gsd-creator-skills 已安装或用户确认跳过
- [ ] **内容来源**：已识别并确认内容来源类型
- [ ] **敏感信息**：已过滤或脱敏处理
- [ ] **元数据收集**：教程标题、分类等信息已确认
- [ ] **教程生成**：config.json 和 steps/*.mdx 文件已创建
- [ ] **用户确认**：教程结构和内容已通过用户审核
- [ ] **预览服务**：本地预览服务正常运行并可访问
</success_criteria>

---

## 快速参考

<quick_reference>
### 常用命令

| 操作 | 命令 |
|------|------|
| 安装 CLI | `npm install -g @wangjs-jacky/interactive-tutorial` |
| 验证安装 | `interactive-tutorial --version` |
| 启动预览 | `npm run tutorial:serve -- --tutorial <name> --port 5174 --open` |
| 安装 GSD 参考 | `j-skills install gsd-creator-skills -g` |

### 输出位置

- **默认**：`<当前工作区>/content/<tutorial-name>/`
- **自定义**：设置 `TUTORIAL_OUTPUT_PATH` 变量

### 配置变量

| 变量 | 位置 | 说明 |
|------|------|------|
| `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH` | 全局 CLAUDE.md | 框架路径（必须） |
| `TUTORIAL_OUTPUT_PATH` | 全局/项目 CLAUDE.md | 输出目录（可选） |
</quick_reference>

---

## 常见问题

### Q: interactive-tutorial 命令找不到？
A: 确保已全局安装：`npm install -g @wangjs-jacky/interactive-tutorial`，并检查 Node.js 版本 >= 18。

### Q: 如何添加新的步骤？
A: 在 `steps/` 目录下创建新的 `.mdx` 文件，并在 `config.json` 的 `steps` 数组中添加对应条目。

### Q: 支持哪些 MDX 组件？
A: 支持 `CodeBlock`、`Tip`、`Checkpoint` 组件，分别用于代码块、提示框和用户确认点。

### Q: 框架路径如何修改？
A: 在全局 CLAUDE.md 中设置 `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH` 变量，或在运行时指定。

### Q: 如何在其他目录生成教程？
A: 设置 `TUTORIAL_OUTPUT_PATH` 环境变量，或在执行时指定输出目录。

### Q: 敏感信息如何处理？
A: 自动检测并排除 `.env`、`.git`、`node_modules` 等敏感内容。个人路径使用 `<YOUR_PATH>` 占位符替换。

---

## 示例用法

```
用户：帮我把 /path/to/my-project 转成交互式教程
     ↓
Claude：Phase 0 - 检查依赖
     ↓
Claude：Phase 1 - 分析项目结构，检测敏感信息
     ↓
Claude：Phase 1 - 收集教程元数据（标题、难度等）
     ↓
Claude：Phase 2 - 创建 config.json 和 steps/*.mdx
     ↓
用户：确认教程结构
     ↓
Claude：Phase 3 - 启动预览服务
     ↓
输出：浏览器自动打开 http://localhost:5174
```

---

## Next Up

- [ ] 安装依赖: `npm install -g @wangjs-jacky/interactive-tutorial`
- [ ] 配置框架路径: 在全局 CLAUDE.md 中设置 `INTERACTIVE_TUTORIAL_FRAMEWORK_PATH`
- [ ] 测试命令: `interactive-tutorial --version`
- [ ] 首次使用: 提供一个文件夹路径进行转换测试

---

## 用户交互点总结

| 阶段 | 标记 | 用户操作 |
|------|------|----------|
| Phase 0 | 🛑 | 确认依赖安装或跳过 |
| Phase 1 | 📝 | 提供内容来源（路径或文字） |
| Phase 1 | 🛑 | 确认敏感信息处理方式 |
| Phase 1 | 📝 | 输入教程元数据（标题、分类等） |
| Phase 2 | 🛑 | 确认生成的教程结构和内容 |
| Phase 3 | ✅ | 验证预览服务可用 |

**LLM 执行提示**：
- 🛑 → **必须等待用户确认**，不能自动跳过
- 📝 → **需要用户输入**，使用 AskUserQuestion
- ✅ → **需要验证结果**，确认后才继续
