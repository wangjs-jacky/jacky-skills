---
name: github-repo-publish
description: Use when user wants to publish local code repository to GitHub, needs to create remote repo, push code, generate README, set about info, or release packaged artifacts like VSCode extensions (.vsix). Triggers on requests like "publish to GitHub", "push to remote", "create GitHub repo", or "release extension".
---

# GitHub 仓库发布

## 概述

将本地代码仓库一键发布到 GitHub，自动处理 README、About 信息、Release 发布等。

**核心原则：最小化交互，自动化处理。**

## 触发条件

```
用户说"发布到 GitHub" / "push 到远端" / "创建 GitHub 仓库"
    ↓
使用此 skill
```

## 前置检查

### 检查远程仓库是否已存在

```bash
git remote -v
```

- **如果 origin 已存在**：仓库已发布，直接推送更新 `git push origin <branch>`
- **如果 origin 不存在**：继续创建新仓库流程

### 检查 gh CLI 是否可用

```bash
gh --version
```

- 如果未安装：提示 `brew install gh` 然后 `gh auth login`
- 如果未登录：提示 `gh auth login`

## 工具选择

**必须使用 `gh` CLI**（GitHub CLI），不是 git 命令。

- `gh repo create` - 创建仓库
- `gh release create` - 创建 Release
- `gh repo edit` - 修改 About 信息

## 完整流程

### 1. 确定仓库名（仅此一次交互）

**优先级顺序：**
1. 用户显式指定的名称
2. `package.json` 的 `name` 字段（需清理 scope）
3. 当前目录名

```bash
# 清理 package.json name 的 scope 前缀
# @org/cool-tool → cool-tool
CLEANED_NAME=$(echo "$PACKAGE_NAME" | sed 's/^@[\w-]*\//')

# 转换规则：转小写，空格转连字符，移除非字母数字
```

**交互规则：**
- 用户说"按默认的来"/"别问我" → 直接使用默认值，无交互
- 正常情况 → 使用 AskUserQuestion 确认一次（可跳过）

**交互限制：最多一次交互确认仓库名。**

### 2. 检查并生成 README.md

```bash
# 检查 README 是否存在
if [ ! -f README.md ]; then
    # 读取仓库代码，生成中英双语 README
    # 必须包含：项目名称、简介、安装方法、使用说明
fi
```

**README 必须是中英双语格式：**

```markdown
# Project Name

[English](#english) | [中文](#chinese)

<a name="english"></a>
## English

Brief description...

### Installation
...

### Usage
...

<a name="chinese"></a>
## 中文

简介...

### 安装
...

### 使用
...
```

### 3. 初始化 Git（如需要）

```bash
# 检查是否已初始化
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit"
fi
```

### 4. 创建远程仓库并推送

```bash
# 配置代理（全局配置要求）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 创建仓库并推送
gh repo create $REPO_NAME --public --source=. --push --description "$DESCRIPTION"

# 完成后取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 5. 设置 About 信息

根据代码内容自动总结：
- Description：从 package.json description 或代码功能总结
- Topics：从 package.json keywords 或技术栈提取

```bash
gh repo edit --description "$DESCRIPTION"
# 如需设置 topics
gh repo edit --add-topic "$TOPIC1,$TOPIC2"
```

### 6. 特殊项目处理

#### 6.1 VSCode 插件（.vsix 发布到 Release）

```bash
# 检测是否为 VSCode 插件
if grep -q '"engines".*"vscode"' package.json; then
    # 打包插件
    npx vsce package

    # 获取版本号
    VERSION=$(node -p "require('./package.json').version")

    # 创建 tag
    git tag "v$VERSION"
    git push origin "v$VERSION"

    # 创建 Release 并上传 .vsix
    gh release create "v$VERSION" \
        --title "v$VERSION" \
        --notes "Release v$VERSION" \
        "*.vsix"
fi
```

#### 6.2 Node.js 库（提示 npm 发布）

```bash
# 检测是否为 Node.js 库（有 main/module/exports 但无 vscode）
if [ -f package.json ] && [ -z "$VSCODE_ENGINE" ]; then
    # 检查是否有 main, module, 或 exports
    if grep -qE '"main"|"module"|"exports"' package.json; then
        echo "检测到 Node.js 库，如需发布到 npm，请运行："
        echo "  npm publish --access public  # scoped packages"
        echo "  npm publish                  # regular packages"
    fi
fi
```

**注意：此 skill 专注于 GitHub 发布，npm 发布由用户自行决定。**

## 快速参考

| 步骤 | 命令 |
|------|------|
| 创建仓库 | `gh repo create $NAME --public --source=. --push` |
| 设置描述 | `gh repo edit --description "$DESC"` |
| 创建 Release | `gh release create $TAG --title "$TITLE" "*.vsix"` |
| 打 tag | `git tag $TAG && git push origin $TAG` |

## 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `gh: command not found` | 未安装 GitHub CLI | `brew install gh` |
| `permission denied` | 未登录 gh | `gh auth login` |
| `repository already exists` | 远程仓库已存在 | 直接推送更新或使用 `gh repo edit` |
| `.vsix already exists` | 重复打包 | 删除旧的 .vsix 文件 |
| `origin already exists` | 本地已配置远程 | 检查 `git remote -v`，直接 push |

## 禁止事项

- **不要多次交互**：最多一次确认仓库名
- **不要询问 README**：没有就自动生成
- **不要询问 About**：自动从代码总结
- **不要忽略 Release**：VSCode 插件必须发布到 Release
- **不要提交 .vsix 到仓库**：只发布到 Release，添加到 .gitignore
- **不要在远程已存在时报错**：智能处理，直接推送更新

## 完整检查清单

- [ ] 检查远程仓库是否已存在（`git remote -v`）
- [ ] 确认仓库名（最多一次交互）
- [ ] 检查/生成中英双语 README.md
- [ ] 检查/补充 .gitignore
- [ ] 初始化 git（如需要）
- [ ] 配置代理
- [ ] 创建远程仓库并推送
- [ ] 设置 About 描述和 topics
- [ ] 检测 VSCode 插件 → 打包 → 打 tag → 创建 Release
- [ ] 取消代理

## 流程图

```dot
digraph github_publish {
    rankdir=TB;
    node [shape=box];

    start [label="用户: 发布到 GitHub" shape=oval];

    subgraph cluster_check {
        label="前置检查";
        style=dashed;
        check_remote [label="git remote -v"];
        check_gh [label="gh --version"];
    }

    remote_exists [label="远程已存在?" shape=diamond];
    push_only [label="git push origin <branch>"];

    subgraph cluster_create {
        label="创建新仓库";
        style=dashed;
        get_name [label="获取仓库名\n(package.json > 目录名)"];
        check_readme [label="README 存在?" shape=diamond];
        gen_readme [label="生成中英双语 README"];
        init_git [label="git init (如需要)"];
        set_proxy [label="配置代理"];
        create_repo [label="gh repo create --push"];
        set_about [label="gh repo edit\n设置 About"];
    }

    vscode_check [label="VSCode 插件?" shape=diamond];
    release_flow [label="vsce package\n→ git tag\n→ gh release create"];

    done [label="完成!" shape=oval];

    start -> check_remote -> check_gh -> remote_exists;
    remote_exists -> push_only [label="是"];
    remote_exists -> get_name [label="否"];
    push_only -> done;

    get_name -> check_readme;
    check_readme -> gen_readme [label="否"];
    check_readme -> init_git [label="是"];
    gen_readme -> init_git;

    init_git -> set_proxy -> create_repo -> set_about -> vscode_check;
    vscode_check -> release_flow [label="是"];
    vscode_check -> done [label="否"];
    release_flow -> done;
}
```
