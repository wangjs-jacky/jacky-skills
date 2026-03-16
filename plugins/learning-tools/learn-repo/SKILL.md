---
name: learn-repo
description: "初始化 GitHub 仓库学习项目：克隆仓库、翻译文档、生成定制化 CLAUDE.md。触发词：学习仓库、learn repo、初始化学习项目"
---

# Learn Repo - 仓库学习项目初始化器

## 概述

**一键初始化 GitHub 仓库学习项目，自动完成克隆、翻译、分析、生成学习笔记结构。**

```
用户输入: /learn-repo https://github.com/owner/repo
         ↓
1. 解析 URL → 提取仓库名
2. 确定目标目录 → {GITHUB_PROJECTS_DIR}/{name}-study
3. 调用辅助脚本 → 克隆 + 删除 .git + 初始化
4. 翻译文档 → 调用 parallel-translation
5. 分析内容 → 文档 + 代码扫描
6. 生成 CLAUDE.md → 定制化学习指南
         ↓
学习项目就绪！
```

## 触发条件

- 用户说 "学习这个仓库" / "learn repo" / "初始化学习项目"
- 用户提供 GitHub URL 并表达学习意图
- 用户输入 `/learn-repo <url>`

---

## 执行步骤

### 第一步：解析输入

从用户输入中提取仓库 URL 或短格式：

| 输入格式 | 示例 |
|---------|------|
| 完整 URL | `https://github.com/ruvnet/ruflo` |
| Git URL | `https://github.com/ruvnet/ruflo.git` |
| 短格式 | `ruvnet/ruflo` |

**URL 规范化逻辑：**
```
如果是短格式 (owner/repo):
    URL = "https://github.com/" + 输入
否则:
    URL = 输入 (去除 .git 后缀)
```

**提取仓库名：**
```bash
# 从 URL 中提取最后一段，去除 .git 后缀
repo_name = basename(url) - ".git"
```

### 第二步：确定目标目录

**优先级顺序：**

1. 读取全局配置 `GITHUB_PROJECTS_DIR`
2. 如果未配置，使用 AskUserQuestion 询问用户

**目标目录命名规则：**
```
{GITHUB_PROJECTS_DIR}/{repo_name}-study
```

**示例：**
- 仓库: `ruvnet/ruflo`
- 目标: `~/jacky-github/ruflo-study`

### 第三步：检查目标目录

使用 Bash 工具检查目录是否存在：

```bash
if [ -d "{TARGET_DIR}" ]; then
    echo "EXISTS"
else
    echo "NOT_EXISTS"
fi
```

**如果目录已存在：**
- 使用 AskUserQuestion 询问是否覆盖
- 选项：覆盖 / 取消

### 第四步：调用辅助脚本

**脚本路径：** `{SKILL_DIR}/init-study-repo.sh`

使用 Bash 工具执行：

```bash
/Users/jiashengwang/jacky-github/jacky-skills/plugins/learning-tools/learn-repo/init-study-repo.sh "{REPO_URL}" "{TARGET_DIR}"
```

**脚本输出：**
- 成功：目标目录路径
- 失败：错误信息

**进度提示：**
```
✓ 创建目标目录 {TARGET_DIR}
✓ 克隆仓库到 {TARGET_DIR}/{repo_name}/
✓ 删除 .git 目录
✓ 创建 notes/ 目录
✓ 初始化 Git 仓库
```

**目录结构：**
```
{repo}-study/           # 学习项目根目录
├── CLAUDE.md           # 学习配置（由 AI 生成）
├── README.md           # 学习项目说明（由 AI 生成）
├── notes/              # 学习笔记
└── {repo}/             # 原始仓库（子目录）
    ├── README.md       # 原始 README
    └── ... (原始代码)
```

### 第五步：翻译文档

**调用 parallel-translation skill：**

使用 Skill 工具：

```
skill: "parallel-translation"
args: "{TARGET_DIR}"
```

**翻译范围：**
- `README.md` → `README.zh-CN.md`
- `docs/**/*.md` → `docs/**/*.zh-CN.md`
- 其他 `.md` 文件

**进度提示：**
```
✓ 翻译文档（使用 parallel-translation）
```

### 第六步：分析仓库内容

#### 6.1 读取文档（优先中文版）

使用 Read 和 Glob 工具：

```
1. 优先读取 README.zh-CN.md（如存在）
2. 否则读取 README.md
3. 扫描 docs/ 目录下的 .md 文件
4. 查找 CONTRIBUTING.md、ARCHITECTURE.md 等
```

#### 6.2 扫描目录结构

使用 Bash 工具：

```bash
cd "{TARGET_DIR}"
ls -la
find . -maxdepth 2 -type d | head -30
```

**识别关键目录模式：**
- `agents/` → Agent 定义
- `commands/` → 命令/工具
- `tools/` → 工具函数
- `hooks/` → 钩子
- `skills/` → Skills 定义
- `plugins/` → 插件
- `src/` → 源代码

#### 6.3 扫描配置文件

```bash
# 检查关键配置文件
for file in package.json Cargo.toml pyproject.toml go.mod; do
    if [ -f "$file" ]; then
        echo "Found: $file"
    fi
done
```

#### 6.4 智能推断分类

基于扫描结果，自动推断学习问题分类：

| 发现的模式 | 推断分类 |
|-----------|---------|
| `agents/` | Agent 架构、Agent 通信 |
| `commands/` | 命令系统、CLI 设计 |
| `hooks/` | 生命周期、事件处理 |
| `tools/` | 工具链、辅助函数 |
| `skills/` | Skill 设计、Prompt 工程 |
| `plugins/` | 插件机制、扩展性 |
| 配置文件 | 依赖管理、构建系统 |

### 第七步：生成 CLAUDE.md

**模板：**

```markdown
# CLAUDE.md - {仓库名} 学习项目

## 项目定位

本项目用于**深入学习 {仓库描述}**。

原始仓库：{原始 URL}

## 学习目标

{自动生成的分类和问题}

## 学习方法

1. **问题先行**：阅读源码前先列出想解决的问题
2. **阅读源码**：带着问题去代码目录寻找答案
3. **笔记记录**：将每个问题的答案记录到 `.notes/` 目录

## 参考资源

- [GitHub 仓库]({原始URL})
- [中文文档](./README.zh-CN.md)（如有）

---

## 对话知识实时归档

**核心理念：对话即知识，有价值的内容应当被自动捕获和沉淀。**

用户以问题为导向持续提问，不会主动要求记录。AI 需要：
1. **自主判断**是否值得归档
2. **自主决定**归档到哪个分类
3. **自动执行**归档，无需询问确认

### 判断标准

**值得归档**：技术原理、操作指南、概念解释、问题排查、最佳实践、工具对比

**不需要归档**：简单事实查询、一次性任务、纯代码修改无知识增量

### 归档规则

- **存储路径**：`.notes/{主题分类}/{问题关键词}.md`
- **分类方式**：根据问题主题自动创建分类目录
- **执行时机**：每次回答结束后，如果判断有价值，立即写入文件
- **内容原则**：提炼知识点，非逐字抄录

### 文件模板

```markdown
# {问题关键词}

> 一句话总结

## 问题

{用户的问题}

## 答案

{提炼后的知识点}

## 代码示例（如有）

```

> **重要**：整个过程完全自动化，不打断用户节奏。
```

**写入文件：**

使用 Write 工具将内容写入 `{TARGET_DIR}/CLAUDE.md`

### 第八步：输出完成提示

```
学习项目已准备就绪！

📁 位置: {TARGET_DIR}
📝 CLAUDE.md: 已生成定制化学习指南
📚 文档翻译: 已翻译为中文

运行以下命令开始学习：
cd {TARGET_DIR}
```

---

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| URL 格式无效 | 提示正确格式示例 |
| 仓库不存在 | 提示检查 URL，确认仓库是公开的 |
| 目标目录已存在 | 询问是否覆盖 |
| Git 克隆失败 | 提示网络问题，建议配置代理 |
| 配置变量未定义 | 询问用户输入路径 |

---

## 配置变量

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `GITHUB_PROJECTS_DIR` | GitHub 项目存放目录 | `/Users/xxx/jacky-github` |

---

## 使用示例

### 示例 1：完整 URL

```
用户: /learn-repo https://github.com/ruvnet/ruflo

AI: 正在初始化 ruflo 学习项目...
    ✓ 创建目标目录 ~/jacky-github/ruflo-study
    ✓ 克隆仓库到 ~/jacky-github/ruflo-study/ruflo/
    ✓ 删除 .git 目录
    ✓ 创建 notes/ 目录
    ✓ 初始化 Git 仓库
    ✓ 翻译文档（使用 parallel-translation）
    ✓ 分析仓库内容
    ✓ 生成 CLAUDE.md

    学习项目已准备就绪！
    运行 `cd ~/jacky-github/ruflo-study` 开始学习。
```

### 示例 2：短格式

```
用户: /learn-repo discreteprojects/get-shit-done

AI: 正在初始化 get-shit-done 学习项目...
    (同上流程)
```

---

## 快速参考卡

```
┌─────────────────────────────────────────────────────┐
│              /learn-repo 使用指南                    │
├─────────────────────────────────────────────────────┤
│ 输入格式:                                            │
│   /learn-repo https://github.com/owner/repo        │
│   /learn-repo owner/repo                           │
│                                                     │
│ 输出:                                               │
│   {GITHUB_PROJECTS_DIR}/{repo}-study/              │
│   ├── CLAUDE.md       # 定制化学习指南              │
│   ├── README.md       # 学习项目说明                │
│   ├── notes/          # 学习笔记目录                │
│   └── {repo}/         # 原始仓库代码                │
└─────────────────────────────────────────────────────┘
```
