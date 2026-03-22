# 状态模板与检测逻辑

## 1. 三种场景检测

### 场景判断流程

```
用户输入：调研下 xxx 在某领域是如何实现的
                    ↓
         ┌─────────────────────┐
         │ 1. 解析仓库 URL      │
         │ 2. 提取研究问题       │
         │ 3. 计算目标目录       │
         └─────────────────────┘
                    ↓
         ┌─────────────────────┐
         │ 项目目录是否存在？    │
         └─────────────────────┘
           ↓              ↓
          否              是
           ↓              ↓
    ┌──────────┐   ┌─────────────────────┐
    │ 创建项目  │   │ 使用 gh api 检查版本  │
    └──────────┘   └─────────────────────┘
           ↓              ↓              ↓
           ↓      有更新？           已是最新
           ↓         ↓                 ↓
           ↓   ┌──────────┐      ┌──────────┐
           ↓   │ 询问更新  │      │ 直接研究  │
           ↓   └──────────┘      └──────────┘
           ↓         ↓                 ↓
           └─────────┴─────────────────┘
                     ↓
              ┌──────────┐
              │ 开始研究  │
              └──────────┘
```

### 版本检查命令

```bash
# 提取 owner 和 repo
# git@github.com:owner/repo.git → owner/repo

# 获取远程最新 commit SHA
REMOTE_SHA=$(gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha')

# 读取本地记录的 commit SHA
LOCAL_SHA=$(cat ~/jacky-github/${REPO}-study/.study-meta.json | jq -r '.commitSha')

# 比较
if [ "$REMOTE_SHA" != "$LOCAL_SHA" ]; then
    echo "有更新"
else
    echo "已是最新"
fi
```

## 2. 状态文件模板 (.study-meta.json)

```json
{
  "repoName": "claudehub",
  "repoUrl": "git@github.com:chris-hendrix/claudehub.git",
  "githubUrl": "https://github.com/chris-hendrix/claudehub",
  "owner": "chris-hendrix",
  "branch": "main",
  "commitSha": "abc123def456...",
  "createdAt": "2024-03-22T10:00:00Z",
  "lastUpdated": "2024-03-22T10:00:00Z",
  "lastResearchQuestion": "Agent 通信是如何实现的"
}
```

## 3. 研究笔记模板

### 3.1 架构笔记 (notes/architecture/)

```markdown
# {主题}

> 一句话总结

## 背景

{用户的研究问题}

## 核心发现

{研究发现}

## 代码位置

- `path/to/file.ts:123` - 说明

## 可复用点

{可以借鉴的设计点}
```

### 3.2 设计模式笔记 (notes/patterns/)

```markdown
# {模式名称}

## 问题场景

{这个模式解决什么问题}

## 实现方式

{项目中如何实现}

## 代码示例

```typescript
// 相关代码
```

## 适用场景

{什么情况下可以使用}
```

## 4. 用户交互模板

### 4.1 检测到更新时

```markdown
⏸️ **检测到远程仓库有更新**

| 项目 | 值 |
|------|-----|
| 当前版本 | abc123 (本地) |
| 最新版本 | def456 (远程) |

是否更新源码？

1. 是，更新到最新版本（推荐）
2. 否，继续使用当前版本研究
```

### 4.2 研究完成时

```markdown
## 🔍 研究发现：{主题}

### 核心发现

{研究发现}

### 代码位置

- `path/to/file.ts:123`

### 笔记已保存

📝 notes/architecture/{主题}.md

---

**Continue Research:**
- 提出更多问题继续研究
- `/repo-study status` — 查看学习项目状态
```

## 5. URL 解析规则

| 输入格式 | 解析结果 |
|----------|----------|
| `git@github.com:owner/repo.git` | owner: `owner`, repo: `repo` |
| `https://github.com/owner/repo` | owner: `owner`, repo: `repo` |
| `github.com/owner/repo` | owner: `owner`, repo: `repo` |

**正则表达式：**

```bash
# SSH 格式
git@github.com:([^/]+)/([^.]+).git

# HTTPS 格式
https://github.com/([^/]+)/([^/]+)
```
