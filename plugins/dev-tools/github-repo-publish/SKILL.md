---
name: github-repo-publish
description: Use when user wants to publish local code repository to GitHub, needs to create remote repo, push code, generate README, set about info, or release packaged artifacts like VSCode extensions (.vsix). Triggers on requests like "publish to GitHub", "push to remote", "create GitHub repo", or "release extension".
---

# GitHub 仓库发布

将本地代码仓库一键发布到 GitHub，自动处理 README、About 信息、Release 发布等。

**核心原则：最小化交互，自动化处理。**

## 前置依赖

- `gh` CLI (GitHub CLI) - `brew install gh`
- 已登录 gh - `gh auth login`
- Git 已初始化（可选，会自动处理）

## 运行模式

**开始时确认模式：**

| 模式 | 行为 |
|------|------|
| `yolo` | 自动推进低风险步骤，仅高危操作确认 |
| `interactive` | 每步确认（默认） |

## 执行流程

### Phase 1: 前置检查

**目标**：确认环境就绪，检测项目类型

**步骤**：

1. **检查远程仓库状态**
   ```bash
   git remote -v
   ```
   - origin 已存在 → 直接进入 Phase 5（推送更新）
   - origin 不存在 → 继续创建流程

2. **验证 gh CLI**
   ```bash
   gh --version && gh auth status
   ```

3. **检测项目类型**
   ```bash
   # VSCode 插件
   grep -q '"engines".*"vscode"' package.json && echo "vscode-extension"

   # Node.js 库
   grep -qE '"main"|"module"|"exports"' package.json && echo "nodejs-library"

   # Skills 项目（含 Plugin）
   [ -d "plugins" ] && find plugins -name "plugin.json" | head -1
   ```

**Checkpoint**：gh 已登录且远程仓库状态已确认

### Phase 2: 版本检查（Skills 项目专用）

**目标**：确保 Plugin 版本号正确

**触发条件**：检测到 `plugins/` 目录和 `.claude-plugin/plugin.json`

**步骤**：

1. **识别改动的 Plugin**
   ```bash
   git diff --name-only HEAD | grep "plugins/" | sed 's|plugins/\([^/]*\)/.*|\1|' | sort -u
   ```

2. **分析变更类型并建议版本**
   | 变更类型 | 版本更新 | 示例 |
   |----------|----------|------|
   | 新增/删除 Skill | MINOR | 1.0.0 → 1.1.0 |
   | 修改 Skill | PATCH | 1.0.0 → 1.0.1 |
   | 破坏性变更 | MAJOR | 1.0.0 → 2.0.0 |

3. **更新版本号**（如需要）
   ```bash
   # 使用 jq
   jq '.version = "1.1.0"' plugin.json > tmp.json && mv tmp.json plugin.json

   # 或使用 sed（无 jq）
   sed -i '' 's/"version": "[0-9]\+\.[0-9]\+\.[0-9]\+"/"version": "1.1.0"/' plugin.json
   ```

**Checkpoint**：所有改动 Plugin 的版本号已确认/更新

### Phase 3: 仓库准备

**目标**：生成必要文件，确定仓库名

**步骤**：

1. **确定仓库名**（最多一次交互）
   优先级：用户指定 > package.json name（清理 scope） > 目录名
   ```bash
   # 清理 scope: @org/cool-tool → cool-tool
   CLEANED_NAME=$(echo "$PACKAGE_NAME" | sed 's/^@[\w-]*\//')
   ```

2. **生成 README 文件**（如不存在）
   ```
   project/
   ├── README.md      # 英文版（主文件）
   └── README_CN.md   # 中文版
   ```
   两个文件互相链接，README.md 为 GitHub 默认显示。

3. **初始化 Git**（如需要）
   ```bash
   [ ! -d .git ] && git init && git add . && git commit -m "Initial commit"
   ```

4. **补充 .gitignore**（如需要）
   VSCode 插件需添加 `*.vsix`

**Checkpoint**：仓库名已确认，README 已就绪

### Phase 4: 创建远程仓库

**目标**：创建 GitHub 仓库并推送代码

**步骤**：

1. **创建仓库并推送**
   ```bash
   gh repo create $REPO_NAME --public --source=. --push --description "$DESCRIPTION"
   ```

3. **设置 About 信息**
   ```bash
   # Description 使用中文
   gh repo edit --description "中文描述"

   # Topics 使用英文
   gh repo edit --add-topic "nodejs,typescript,cli-tool"
   ```

4. **清理代理**（如已配置）
   ```bash
   git config --global --unset http.proxy
   git config --global --unset https.proxy
   ```

> **注意**：代理配置应使用全局 CLAUDE.md 中定义的端口（HTTP: 10802），而非在此硬编码。

**Checkpoint**：仓库已创建，代码已推送，About 已设置

### Phase 5: 推送更新（远程已存在时）

**目标**：推送本地更新到已有仓库

**步骤**：
```bash
# 如需代理，使用全局 CLAUDE.md 中定义的端口
git push origin $(git branch --show-current)
```

### Phase 6: 特殊处理

**目标**：处理项目特定的发布流程

#### VSCode 插件 → Release

```bash
# 打包
npx vsce package

# 创建 tag 并推送
VERSION=$(node -p "require('./package.json').version")
git tag "v$VERSION" && git push origin "v$VERSION"

# 创建 Release
gh release create "v$VERSION" --title "v$VERSION" --notes "Release v$VERSION" "*.vsix"
```

#### Node.js 库 → 提示 npm

```bash
echo "检测到 Node.js 库，如需发布到 npm："
echo "  npm publish --access public  # scoped packages"
echo "  npm publish                  # regular packages"
```

**Checkpoint**：项目特定发布流程已完成

## 验证

- [ ] 远程仓库可访问：`gh repo view`
- [ ] README 正确显示
- [ ] About 信息（中文描述 + Topics）
- [ ] VSCode 插件：Release 包含 .vsix

## 快速参考

| 操作 | 命令 |
|------|------|
| 创建仓库 | `gh repo create $NAME --public --source=. --push` |
| 设置描述 | `gh repo edit --description "$中文描述"` |
| 创建 Release | `gh release create $TAG --title "$TITLE" "*.vsix"` |
| 推送更新 | `git push origin <branch>` |

## 错误处理

| 错误 | 解决 |
|------|------|
| `gh: command not found` | `brew install gh` |
| 未登录 gh | `gh auth login` |
| 仓库已存在 | 直接推送更新 |
| 代理连接失败 | 使用正确端口（HTTP: 10802）或直连 |
| `.vsix already exists` | 删除旧文件重新打包 |

## 禁止事项

- ❌ 多次交互确认（最多一次）
- ❌ 询问 README（自动生成）
- ❌ 询问 About（自动总结）
- ❌ 合并中英文 README
- ❌ 提交 .vsix 到仓库
- ❌ 远程已存在时报错退出

## Next Up

- [ ] 确认运行模式（yolo/interactive）
- [ ] 可复制命令: `gh repo create <name> --public --source=. --push`
- [ ] 验证: `gh repo view`
