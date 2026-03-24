---
name: doc-to-tutorial
description: "将任意内容（文件夹/文件/文字）转换为交互式教程并启动预览服务。触发词：文档转教程、生成交互式教程、tutorial"
---

# 文档转交互式教程

将任意内容（文件夹/文件/文字）转换为交互式教程并启动预览服务。

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

> ⚠️ **Checkpoint - 必须确认**
>
> | 检查项 | 说明 |
> |--------|------|
> | ✅ 依赖就绪 | gsd-creator-skills 已安装或用户确认跳过 |

### Phase 1: 收集上下文

**目标**：了解用户要转换的内容来源

**步骤**：
1. **检测内容来源类型**：
   - **文件夹路径** - 将文件夹内容转为教程
   - **单个文件路径** - 将文件内容转为教程
   - **直接输入文字** - 将用户描述转为教程

2. **过滤个人内容**（重要）：
   > ⚠️ **排除规则**：以下内容不应包含在生成的教程中
   > - `.env`、`.env.local` 等环境变量文件
   > - `node_modules/` 目录
   > - `.git/` 目录
   > - 包含个人路径的配置（如 `/Users/xxx/`）
   > - 包含敏感信息的文件（credentials、secrets）

   如果检测到源内容包含个人路径或敏感信息，应：
   - 警告用户
   - 提供脱敏选项
   - 在生成的教程中使用占位符（如 `<YOUR_PATH>`）

3. **收集教程元数据**：
   - 教程标题
   - 教程分类（可选）
   - 难度级别（初级/中级/高级）
   - 预计时长（可选）

> ⚠️ **Checkpoint - 必须确认**
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

**可用组件**：
| 组件 | 用途 |
|------|------|
| `<CodeBlock>` | 代码块，支持 `language` 和 `copyable` 属性 |
| `<Tip>` | 提示框，`type` 可选 `info/warning/success/error` |
| `<Checkpoint>` | 检查点按钮，用于用户确认完成 |

**步骤**：
1. 分析源内容，拆分为逻辑步骤
2. 为每个步骤生成 `.mdx` 文件
3. 生成 `config.json` 元数据

> ⚠️ **Checkpoint - 需要确认**
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

> ⚠️ **Checkpoint - 验证服务**
>
> | 检查项 | 说明 |
> |--------|------|
> | ✅ 服务启动 | interactive-tutorial 服务正常运行 |
> | ✅ 预览可用 | 用户可以在浏览器访问预览页面 |

## 输出位置

教程默认输出到当前工作区：
- **默认位置**：`<当前工作区>/content/<tutorial-name>/`
- **自定义位置**：通过 `TUTORIAL_OUTPUT_PATH` 变量指定

> 注：框架自带 UI，无需生成 index.html 文件。

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

## 示例用法

```
用户：帮我把 /path/to/my-project 转成交互式教程
     ↓
Claude：分析项目结构，生成教程步骤
     ↓
Claude：创建 config.json 和 steps/*.mdx 到当前工作区 content 目录
     ↓
Claude：运行 npm run tutorial:serve -- --tutorial my-project --port 5174 --open
     ↓
输出：浏览器自动打开预览页面
```

## Next Up

- [ ] 安装依赖: `npm install -g @wangjs-jacky/interactive-tutorial`
- [ ] 测试命令: `interactive-tutorial --version`
- [ ] 首次使用: 提供一个文件夹路径进行转换测试
