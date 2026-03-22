# 状态模板与检测逻辑（v2）

## 1. 检测范围与原则

- `status` 只检查**当前目录**（不扫描子目录，不递归）
- 通过目录名与 `.study-meta.json` 判断是否 study 项目
- 重点标识：当前项目是否由 `repo-study` 创建
- 课题按 `topics[]` 归纳，进度为持续态（无完成态）
- 若启用远程检查，必须检测本地/远程 commit 差异
- 若检测到落后，必须先提示用户是否更新再继续研究

---

## 2. 当前目录检测流程

```text
当前目录
  ↓
检查目录名是否 *-study
  ↓
检查 .study-meta.json 是否存在
  ↓
存在 meta ? ── 否 ──> non-study / study-without-meta
  ↓ 是
判断来源：
  1) repo-study-managed (v2)
  2) non-repo-study
  ↓
若为有效项目，比较远程/本地 commit
  ↓
输出 status（topics / 进度 / skill 封装状态 / 远程版本状态）
```

---

## 3. 版本检查命令（v2）

```bash
# 获取远程最新 commit SHA
REMOTE_SHA=$(gh api repos/${OWNER}/${REPO}/commits/main --jq '.sha')

# 读取本地记录的 commit SHA（v2 优先，兼容 v1）
LOCAL_SHA=$(jq -r '.repo.commitSha // .commitSha // empty' .study-meta.json)

if [ "$REMOTE_SHA" != "$LOCAL_SHA" ]; then
  echo "有更新"
else
  echo "已是最新"
fi
```

### 检测到更新时提示模板

```markdown
⏸️ **检测到远程仓库有更新**

| 项目 | 值 |
|------|-----|
| 当前版本 | {LOCAL_SHA} (本地) |
| 最新版本 | {REMOTE_SHA} (远程) |

是否更新源码？

1. 是，更新到最新版本（推荐）
2. 否，继续使用当前版本研究
```

---

## 4. 状态文件模板（.study-meta.json v2）

```json
{
  "schemaVersion": "2.0",
  "managedBy": {
    "skill": "repo-study",
    "createdBySkill": true,
    "createdAt": "2026-03-22T15:25:00+08:00"
  },
  "repo": {
    "name": "trending-skills",
    "url": "https://github.com/Aradotso/trending-skills.git",
    "githubUrl": "https://github.com/Aradotso/trending-skills",
    "owner": "Aradotso",
    "branch": "main",
    "commitSha": "40e63eaa569133ed4a29aea21fa11b64aa27468a"
  },
  "topics": [
    {
      "id": "github-actions-auto-skill-generation",
      "name": "GitHub Actions 自动生成 Agent Skills",
      "category": "architecture",
      "tags": ["github-actions", "automation", "skills"],
      "state": "active",
      "progress": {
        "questionCount": 2,
        "noteCount": 1,
        "guideCount": 0,
        "skillTemplateCount": 0,
        "runnableSkillCount": 0,
        "lastActivityAt": "2026-03-22T17:30:00+08:00"
      },
      "questions": [
        {
          "id": "q-001",
          "text": "如何使用 GitHub Actions 去实现自动生成 agent skills 的能力",
          "createdAt": "2026-03-22T15:25:00+08:00"
        }
      ],
      "artifacts": [
        {
          "type": "note",
          "path": "notes/architecture/github-actions-auto-skill-generation.md",
          "createdAt": "2026-03-22T15:26:00+08:00"
        }
      ],
      "skillPackaging": {
        "hasSkillTemplate": false,
        "hasRunnableSkill": false
      }
    }
  ],
  "timestamps": {
    "createdAt": "2026-03-22T15:25:00+08:00",
    "lastUpdated": "2026-03-22T17:30:00+08:00"
  }
}
```

---

## 5. status 脚本输出要求

脚本：`scripts/repo-study-status.sh`

### 5.1 默认文本输出（示例）

```text
Repo Study Status
Current Directory: /path/to/trending-skills-study
Directory Suffix (*-study): yes
Study Meta (.study-meta.json): yes
Project Origin: repo-study-managed
Created By repo-study: yes
Remote Check: outdated
Local Commit: abc123
Remote Commit: def456

Update Prompt:
检测到远程仓库有更新，是否更新源码？
1. 是，更新到最新版本（推荐）
2. 否，继续使用当前版本研究

Topics: 2
1) GitHub Actions 自动生成 Agent Skills [architecture]
   progress: questions=2 notes=1 guides=0 skill_templates=0 runnable_skills=0
   packaging: none
2) Prompt Engineering 模式归纳 [patterns]
   progress: questions=3 notes=2 guides=1 skill_templates=1 runnable_skills=0
   packaging: template-only
```

### 5.2 JSON 输出（示例）

```json
{
  "currentDir": "/path/to/trending-skills-study",
  "checks": {
    "nameEndsWithStudy": true,
    "hasStudyMeta": true
  },
  "projectOrigin": "repo-study-managed",
  "createdByRepoStudy": true,
  "remoteCheck": {
    "enabled": true,
    "status": "outdated",
    "localCommitSha": "abc123",
    "remoteCommitSha": "def456",
    "updateRecommended": true,
    "prompt": "检测到远程仓库有更新，是否更新源码？"
  },
  "summary": {
    "topicCount": 2,
    "questionCount": 5,
    "noteCount": 3,
    "guideCount": 1,
    "skillTemplateCount": 1,
    "runnableSkillCount": 0
  },
  "topics": []
}
```

---

## 6. 研究笔记模板（按主题）

### 6.1 主题笔记

```markdown
# {主题}

> 一句话总结

## 背景问题
{本轮研究问题}

## 核心发现
{研究发现}

## 关键代码位置
- `path/to/file.ts:123` - 说明

## 可复用模式
{可以借鉴的设计点}
```

### 6.2 主题下多轮追加建议

- 同一主题允许多问题、多轮产出
- 追加时优先更新 `topics[].questions[]` 与 `topics[].artifacts[]`
- 每次追加后刷新 `topics[].progress`

---

## 7. 常用命令

```bash
# 当前目录状态（文本）
scripts/repo-study-status.sh --check-remote

# 当前目录状态（JSON）
scripts/repo-study-status.sh --json --check-remote

# 仅读取创建来源标记
jq -r '.managedBy.skill // "unknown"' .study-meta.json
```
