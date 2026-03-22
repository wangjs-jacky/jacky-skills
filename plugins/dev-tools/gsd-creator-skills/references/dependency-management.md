# Skill 依赖管理规范

> 当 skill 依赖于其他 GitHub 仓库的 skill 时，使用本规范管理依赖

## 依赖清单格式

在每个 skill 根目录下创建 `skill-deps.json`：

```json
{
  "$schema": "./skill-deps.schema.json",
  "dependencies": {
    "<dep-name>": {
      "source": "github:<owner>/<repo>",
      "path": "<skill-path-in-repo>",
      "ref": "main",
      "version": "v1.0.0",
      "commit": "abc123def456...",
      "installMode": "offline",
      "installedAt": "2026-03-22T10:00:00Z",
      "localPath": "references/_deps/<repo-name>/<skill-path>"
    }
  }
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `source` | ✅ | 依赖来源，格式 `github:<owner>/<repo>` |
| `path` | ✅ | 仓库内 skill 路径 |
| `ref` | ❌ | Git 引用（branch/tag/commit），默认 `main` |
| `version` | ❌ | 语义化版本（如有） |
| `commit` | ✅ | 安装时的 commit hash（用于变更检测） |
| `installMode` | ✅ | `offline` 或 `j-skills` |
| `installedAt` | ❌ | 安装时间（ISO 8601） |
| `localPath` | ✅ | 本地离线安装路径（仅 `offline` 模式） |

## 安装模式对比

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **j-skills** | 自动更新、版本管理 | 需要用户前置安装 | 开发环境、频繁更新 |
| **offline** | 无外部依赖、可离线使用 | 手动更新 | 生产环境、网络受限 |

## 离线安装流程

### Phase 1: 克隆依赖

```bash
# 1. 创建依赖存放目录
mkdir -p references/_deps

# 2. 浅克隆仓库（仅最新提交）
git clone --depth 1 https://github.com/<owner>/<repo>.git references/_deps/<repo-name>

# 3. 记录 commit hash
cd references/_deps/<repo-name>
git rev-parse HEAD
```

### Phase 2: 记录依赖信息

更新 `skill-deps.json`：

```json
{
  "dependencies": {
    "create-skills": {
      "source": "github:daymade/claude-code-skills",
      "path": "create-skills",
      "ref": "main",
      "commit": "abc123def456...",
      "installMode": "offline",
      "installedAt": "2026-03-22T10:00:00Z",
      "localPath": "references/_deps/claude-code-skills/create-skills"
    }
  }
}
```

### Phase 3: 验证依赖

```bash
# 检查 skill 文件是否存在
ls references/_deps/<repo-name>/<skill-path>/SKILL.md
```

## j-skills 安装流程

### Phase 1: 检查前置条件

```bash
# 确认 j-skills 已安装
j-skills --version

# 确认依赖 skill 已链接
j-skills link --list | grep <dep-name>
```

### Phase 2: 安装依赖

```bash
# 如果未链接，先克隆并链接
git clone https://github.com/<owner>/<repo>.git /tmp/<repo-name>
cd /tmp/<repo-name>/<skill-path>
j-skills link

# 安装到环境
j-skills install <dep-name> -g
```

### Phase 3: 记录依赖信息

更新 `skill-deps.json`：

```json
{
  "dependencies": {
    "create-skills": {
      "source": "github:daymade/claude-code-skills",
      "path": "create-skills",
      "ref": "main",
      "version": "v1.0.0",
      "commit": "abc123def456...",
      "installMode": "j-skills",
      "installedAt": "2026-03-22T10:00:00Z"
    }
  }
}
```

## 更新依赖流程

### 检查更新

```bash
# 离线模式
cd references/_deps/<repo-name>
git fetch origin
git log HEAD..origin/<ref> --oneline

# j-skills 模式
cd /tmp/<repo-name>
git fetch origin
git log HEAD..origin/<ref> --oneline
```

### 执行更新

```bash
# 离线模式
cd references/_deps/<repo-name>
git pull origin <ref>
git rev-parse HEAD  # 更新 skill-deps.json 中的 commit

# j-skills 模式
cd /tmp/<repo-name>/<skill-path>
git pull origin <ref>
j-skills install <dep-name> -g --force
```

## 目录结构示例

```
gsd-creator-skills/
├── SKILL.md
├── skill-deps.json              # 依赖清单
├── references/
│   ├── _deps/                   # 离线依赖目录
│   │   └── claude-code-skills/  # 克隆的上游仓库
│   │       └── create-skills/
│   │           └── SKILL.md
│   ├── gsd-xml-tags.md
│   └── ...
└── scripts/
    └── update-deps.sh           # 依赖更新脚本（可选）
```

## Schema 定义

创建 `skill-deps.schema.json` 供 IDE 校验：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["dependencies"],
  "properties": {
    "dependencies": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["source", "path", "commit", "installMode"],
        "properties": {
          "source": {
            "type": "string",
            "pattern": "^github:[^/]+/[^/]+$"
          },
          "path": { "type": "string" },
          "ref": { "type": "string" },
          "version": { "type": "string" },
          "commit": { "type": "string" },
          "installMode": {
            "type": "string",
            "enum": ["offline", "j-skills"]
          },
          "installedAt": { "type": "string", "format": "date-time" },
          "localPath": { "type": "string" }
        }
      }
    }
  }
}
```

## 最佳实践

1. **优先使用离线模式** - 确保依赖稳定可用
2. **记录完整 commit hash** - 便于追踪变更
3. **定期检查更新** - 使用 `scripts/update-deps.sh` 自动化
4. **版本锁定** - 使用 tag 或 commit 而非 branch
5. **清理旧依赖** - 删除不再使用的 `_deps` 子目录

## 常见问题

**Q: 如何判断依赖是否需要更新？**
A: 对比本地 commit hash 与远程最新 commit，不同则需要更新。

**Q: 离线模式如何更新？**
A: `cd references/_deps/<repo> && git pull origin <ref>`

**Q: j-skills 模式依赖丢失怎么办？**
A: 重新执行 `j-skills install <dep-name> -g`

**Q: 如何删除依赖？**
A:
1. 从 `skill-deps.json` 移除条目
2. 离线模式：删除 `references/_deps/<repo>`
3. j-skills 模式：`j-skills uninstall <dep-name> -g`
