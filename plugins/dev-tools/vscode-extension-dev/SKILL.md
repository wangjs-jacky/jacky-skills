---
name: vscode-extension-dev
description: VSCode 插件完整开发脚手架。从项目初始化、开发环境配置、功能模块生成到发布自动化的一站式工具。触发词：VSCode 插件开发、vscode extension、创建插件、插件脚手架。
---

# VSCode 插件开发脚手架

## 概述

完整的 VSCode 插件开发体系搭建工具：

| 模块 | 功能 |
|------|------|
| **项目初始化** | 创建完整项目结构、配置文件 |
| **开发环境** | TypeScript、Webpack、ESLint、调试配置 |
| **功能模块** | 命令、状态栏、配置项、快捷键模板 |
| **文档模板** | README、CHANGELOG、LICENSE |
| **CI/CD** | GitHub Actions 自动发布 |
| **发布引导** | PAT、Secrets 配置引导 |

## 触发条件

```
用户说"创建 VSCode 插件" / "初始化插件项目" / "配置插件发布"
    ↓
使用此 skill
```

---

## 运行模式

| 模式 | 说明 |
|------|------|
| **引导模式** | 每步确认，适合首次使用 |
| **快速模式** | 自动执行，仅关键步骤确认 |

---

## Phase 1: 项目初始化

### 1.1 检测现有项目

```bash
# 检测是否已有 VSCode 插件项目
if [ -f package.json ] && grep -q '"engines".*"vscode"' package.json; then
    echo "✅ 检测到现有 VSCode 插件项目"
    # 显示项目信息
else
    echo "📦 需要初始化新项目"
fi
```

### 1.2 新项目初始化选项

**询问用户选择项目类型：**

| 类型 | 说明 | 包含内容 |
|------|------|----------|
| **基础插件** | 最小化模板 | 命令、激活事件 |
| **状态栏插件** | Quick AI 风格 | 状态栏图标、配置项、命令 |
| **WebView 插件** | 带 UI 界面 | WebView、消息通信 |
| **语言支持** | 语法高亮、补全 | Grammar、Language Configuration |
| **自定义** | 选择需要的模块 | 按需组合 |

### 1.3 完整项目结构

```
<project-name>/
├── .vscode/                    # VSCode 配置
│   ├── launch.json             # 调试配置
│   ├── tasks.json              # 任务配置
│   ├── settings.json           # 工作区设置
│   └── extensions.json         # 推荐扩展
├── .github/
│   └── workflows/
│       └── release.yml         # 自动发布
├── src/
│   ├── extension.ts            # 入口文件
│   ├── commands/               # 命令模块
│   ├── providers/              # Provider 模块
│   └── utils/                  # 工具函数
├── test/                       # 测试文件
├── docs/                       # 文档
├── package.json                # 项目配置
├── tsconfig.json               # TypeScript 配置
├── webpack.config.js           # Webpack 配置
├── .eslintrc.json              # ESLint 配置
├── .gitignore                  # Git 忽略
├── .vscodeignore               # 打包忽略
├── README.md                   # 英文文档
├── README.zh-CN.md             # 中文文档
├── CHANGELOG.md                # 更新日志
└── LICENSE                     # 许可证
```

---

## Phase 2: 核心配置文件

### 2.1 package.json 模板

```json
{
  "name": "<extension-name>",
  "displayName": "<Display Name>",
  "description": "<Extension description>",
  "version": "0.0.1",
  "publisher": "<your-publisher-id>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/<username>/<extension-name>.git"
  },
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onStartupFinished"],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [],
    "keybindings": [],
    "configuration": {}
  },
  "scripts": {
    "vscode:prepublish": "pnpm run package",
    "compile": "webpack",
    "watch": "webpack --watch",
    "package": "webpack --mode production --devtool hidden-source-map",
    "compile-tests": "tsc -p . --outDir out",
    "watch-tests": "tsc -p . -w --outDir out",
    "pretest": "pnpm run compile-tests && pnpm run compile && pnpm run lint",
    "lint": "eslint src --ext ts",
    "test": "vscode-test",
    "build": "pnpm run package",
    "package:vsix": "vsce package",
    "publish:vsce": "vsce publish",
    "publish:ovsx": "ovsx publish --no-dependencies",
    "publish:all": "pnpm run publish:vsce && pnpm run publish:ovsx",
    "deploy": "pnpm run build && pnpm run publish:all"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/mocha": "^10.0.6",
    "@types/node": "18.x",
    "@typescript-eslint/eslint-plugin": "^7.0.2",
    "@typescript-eslint/parser": "^7.0.2",
    "eslint": "^8.56.0",
    "typescript": "^5.3.3",
    "ts-loader": "^9.5.1",
    "webpack": "^5.90.3",
    "webpack-cli": "^5.1.4",
    "@vscode/test-cli": "^0.0.6",
    "@vscode/test-electron": "^2.3.9",
    "@vscode/vsce": "^3.2.1",
    "ovsx": "^0.10.9"
  },
  "vsce": {
    "dependencies": false
  },
  "ovsx": {
    "dependencies": false
  }
}
```

### 2.2 tsconfig.json

```json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES2022",
    "lib": ["ES2022"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "outDir": "out"
  }
}
```

### 2.3 webpack.config.js

```javascript
//@ts-check
'use strict';
const path = require('path');

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: { level: "log" }
};

module.exports = [extensionConfig];
```

### 2.4 .vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "preLaunchTask": "webpack: watch"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": ["${workspaceFolder}/out/test/**/*.js"],
      "preLaunchTask": "tasks: watch-tests"
    }
  ]
}
```

### 2.5 .vscode/tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "watch",
      "problemMatcher": "$tsc-watch",
      "isBackground": true,
      "presentation": { "reveal": "never" },
      "group": { "kind": "build", "isDefault": true }
    },
    {
      "type": "npm",
      "script": "watch-tests",
      "problemMatcher": "$tsc-watch",
      "isBackground": true,
      "presentation": { "reveal": "never" }
    }
  ]
}
```

### 2.6 .vscodeignore

```
.vscode/**
.vscode-test/**
src/**
**/*.ts
**/*.map
.gitignore
**/tsconfig.json
**/.eslintrc.*
node_modules/**
!node_modules/production-dependency/**
*.vsix
.git/**
docs/**
*.md
!README.md
!CHANGELOG.md
```

### 2.7 .eslintrc.json

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/naming-convention": "warn",
    "@typescript-eslint/semi": "warn",
    "curly": "warn",
    "eqeqeq": "warn",
    "no-throw-literal": "warn",
    "semi": "off"
  },
  "ignorePatterns": ["out", "dist", "**/*.d.ts"]
}
```

---

## Phase 3: 功能模块模板

### 3.1 基础 extension.ts 模板

```typescript
// VS Code Extension API
import * as vscode from 'vscode';

/**
 * 激活扩展时调用
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Extension is now active!');

    // 注册命令
    const helloCommand = vscode.commands.registerCommand(
        '<extension-name>.hello',
        () => {
            vscode.window.showInformationMessage('Hello World!');
        }
    );
    context.subscriptions.push(helloCommand);
}

/**
 * 停用扩展时调用
 */
export function deactivate() {}
```

### 3.2 状态栏插件模板（Quick AI 风格）

```typescript
import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension is now active!');

    // 创建状态栏图标
    createStatusBarItem(context);

    // 注册命令
    const command = vscode.commands.registerCommand(
        '<extension-name>.quickAction',
        executeQuickAction
    );
    context.subscriptions.push(command);

    // 监听配置变更
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('<extension-name>')) {
                updateStatusBarItem();
            }
        })
    );
}

function createStatusBarItem(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration('<extension-name>');
    const iconStyle = config.get<string>('iconStyle', 'icon+text');

    statusBarItem = vscode.window.createStatusBarItem(
        '<extension-name>.statusBar',
        vscode.StatusBarAlignment.Right,
        100
    );

    statusBarItem.text = iconStyle === 'icon'
        ? '$(robot)'
        : '$(robot) Action';
    statusBarItem.tooltip = 'Quick Action';
    statusBarItem.command = '<extension-name>.quickAction';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
}

async function executeQuickAction(): Promise<void> {
    const config = vscode.workspace.getConfiguration('<extension-name>');
    const command = config.get<string>('command', 'echo "Hello"');

    const terminal = vscode.window.createTerminal({
        name: 'Quick Action',
        cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    });

    terminal.sendText(command + '\n');
    terminal.show();
}

export function deactivate() {
    statusBarItem?.dispose();
}
```

### 3.3 package.json contributes 模板

```json
{
  "contributes": {
    "commands": [
      {
        "command": "<extension-name>.quickAction",
        "title": "Quick Action",
        "category": "<Category>"
      }
    ],
    "keybindings": [
      {
        "command": "<extension-name>.quickAction",
        "key": "cmd+shift+a",
        "mac": "cmd+shift+a",
        "when": "editorTextFocus"
      }
    ],
    "configuration": {
      "title": "<Extension Name>",
      "properties": {
        "<extension-name>.showIcon": {
          "type": "boolean",
          "default": true,
          "description": "在状态栏显示图标"
        },
        "<extension-name>.iconStyle": {
          "type": "string",
          "enum": ["icon", "icon+text"],
          "enumDescriptions": ["仅显示图标", "显示图标和文字"],
          "default": "icon+text",
          "description": "状态栏图标显示样式"
        },
        "<extension-name>.command": {
          "type": "string",
          "default": "echo 'Hello'",
          "description": "执行的命令"
        }
      }
    }
  }
}
```

---

## Phase 4: 文档模板

### 4.1 README.md 模板

```markdown
# <Extension Name>

[中文文档](./README.zh-CN.md)

Brief description of what this extension does.

## Features

- Feature 1
- Feature 2

## Requirements

- VS Code 1.85.0 or higher
- Node.js 18.x or higher

## Extension Settings

This extension contributes the following settings:

- `<extension-name>.showIcon`: Enable/disable status bar icon
- `<extension-name>.command`: Command to execute

## Keyboard Shortcuts

| Command | Mac | Windows/Linux |
|---------|-----|---------------|
| Quick Action | `Cmd+Shift+A` | `Ctrl+Shift+A` |

## Known Issues

None at this time.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md)

## License

MIT
```

### 4.2 README.zh-CN.md 模板

```markdown
# <插件名称>

[English](./README.md)

简要描述插件功能。

## 功能特性

- 功能 1
- 功能 2

## 系统要求

- VS Code 1.85.0 或更高版本
- Node.js 18.x 或更高版本

## 扩展设置

本扩展提供以下设置：

- `<extension-name>.showIcon`: 启用/禁用状态栏图标
- `<extension-name>.command`: 要执行的命令

## 快捷键

| 命令 | Mac | Windows/Linux |
|------|-----|---------------|
| Quick Action | `Cmd+Shift+A` | `Ctrl+Shift+A` |

## 更新日志

参见 [CHANGELOG.md](./CHANGELOG.md)

## 许可证

MIT
```

### 4.3 CHANGELOG.md 模板

```markdown
# Change Log

All notable changes to this project will be documented in this file.

## [0.0.1] - 2024-01-01

### Added
- Initial release
- Basic functionality

## [Unreleased]

### Added
- Nothing yet

### Changed
- Nothing yet

### Fixed
- Nothing yet
```

---

## Phase 5: GitHub Actions 自动发布

### 5.1 Workflow 文件

创建 `.github/workflows/release.yml`：

```yaml
name: Release Extension

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: read

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Publish to Visual Studio Marketplace
        run: npm run publish:vsce
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}

      - name: Publish to Open VSX Registry
        run: npm run publish:ovsx
        env:
          OVSX_PAT: ${{ secrets.OVSX_PAT }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            *.vsix
          generate_release_notes: true
```

---

## Phase 6: 发布配置引导

### 6.1 检查配置状态

```bash
# 检查所有配置项
echo "🔍 VSCode 插件发布配置检查"

# 1. 检查 Secrets
echo -e "\n📋 GitHub Secrets:"
gh secret list 2>/dev/null | grep -E "VSCE_PAT|OVSX_PAT" || echo "  ❌ 未配置"

# 2. 检查 Workflow
echo -e "\n📋 GitHub Actions Workflow:"
ls .github/workflows/release.yml 2>/dev/null && echo "  ✅ 已创建" || echo "  ❌ 未创建"

# 3. 检查 package.json
echo -e "\n📋 package.json 配置:"
grep -q '"publish:vsce"' package.json && echo "  ✅ publish:vsce" || echo "  ❌ 缺少 publish:vsce"
grep -q '"publisher"' package.json && echo "  ✅ publisher 已配置" || echo "  ❌ 缺少 publisher"
```

### 6.2 PAT 配置引导

**使用 AskUserQuestion 展示：**

```
📋 配置 Personal Access Token

发布 VSCode 插件需要两个 Token：

┌─────────────────────────────────────────────────────────┐
│ 🔑 VSCode Marketplace Token (VSCE_PAT)                  │
├─────────────────────────────────────────────────────────┤
│ 获取地址：https://dev.azure.com                          │
│                                                         │
│ 步骤：                                                   │
│ 1. 登录（GitHub/Microsoft 账号）                         │
│ 2. 右上角 → Personal access tokens                      │
│ 3. New Token                                            │
│ 4. 配置：                                                │
│    - Name: vsce-publish                                 │
│    - Organization: All accessible orgs                  │
│    - Expiration: 90 天                                  │
│    - Scopes: Marketplace → Manage ✅                    │
│ 5. Create → 立即复制！                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🔑 Open VSX Token (OVSX_PAT)                            │
├─────────────────────────────────────────────────────────┤
│ 获取地址：https://open-vsx.org/user-settings/tokens     │
│                                                         │
│ 步骤：                                                   │
│ 1. 登录（GitHub 账号）                                   │
│ 2. Create Token                                        │
│ 3. 复制生成的 Token                                     │
└─────────────────────────────────────────────────────────┘
```

**交互选项：**

| 选项 | 说明 |
|------|------|
| ✅ 已获取两个 PAT | 继续配置 Secrets |
| 🔄 只获取了 VSCE_PAT | 先配置一个 |
| ⏳ 稍后配置 | 保存进度 |

### 6.3 Secrets 配置

**选项 1：gh CLI（推荐）**

```bash
# 交互式输入
echo "🔐 配置 VSCode Marketplace PAT"
echo "请粘贴你的 VSCE_PAT（输入后按 Enter）："
gh secret set VSCE_PAT

echo "🔐 配置 Open VSX PAT"
echo "请粘贴你的 OVSX_PAT（输入后按 Enter）："
gh secret set OVSX_PAT

# 验证
echo "✅ Secrets 配置完成！"
gh secret list | grep -E "VSCE_PAT|OVSX_PAT"
```

**选项 2：网页手动配置**

```
1. 打开：https://github.com/<username>/<repo>/settings/secrets/actions
2. 点击 New repository secret
3. 添加：
   - Name: VSCE_PAT, Value: [粘贴 PAT]
   - Name: OVSX_PAT, Value: [粘贴 PAT]
```

---

## Phase 7: 开发工作流

### 7.1 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式（热重载）
pnpm run watch

# 调试
# F5 启动调试，或使用 .vscode/launch.json
```

### 7.2 打包测试

```bash
# 打包
pnpm run build

# 本地安装测试
# VSCode: Cmd+Shift+P → "Install from VSIX"
```

### 7.3 发布流程

```bash
# 1. 更新版本号
npm version patch  # 0.0.1 → 0.0.2
npm version minor  # 0.0.1 → 0.1.0
npm version major  # 0.0.1 → 1.0.0

# 2. 推送（触发自动发布）
git push origin main --follow-tags

# GitHub Actions 自动执行：
# → 打包 .vsix
# → 发布到 VSCode Marketplace
# → 发布到 Open VSX
# → 创建 GitHub Release
```

---

## 完整执行流程

### Step 1: 项目检测

```
🔍 项目检测结果

检测到 VSCode 插件项目：quick-ai ✅

项目信息：
- Name: quick-ai
- Publisher: jackywjs
- Version: 0.0.6

配置状态：
- [x] package.json 已配置
- [x] TypeScript 已配置
- [x] Webpack 已配置
- [ ] GitHub Secrets 未配置
- [ ] GitHub Workflow 未配置
```

### Step 2: 选择操作

```
请选择要执行的操作：

[📦 初始化新项目] - 创建完整项目结构
[🔧 配置发布环境] - 配置 PAT、Secrets、Workflow
[📝 生成功能模块] - 创建命令、状态栏等模块
[📄 生成文档模板] - README、CHANGELOG、LICENSE
[🚀 完整流程] - 从初始化到发布配置
```

### Step 3: 执行并输出 Next Up

```
✅ 配置完成！

📍 Next Up

当前阶段：发布环境配置完成
下一阶段：本地测试

继续命令：
  /vscode-extension-dev --resume

下一步操作：
  1. 本地测试：pnpm run build
  2. 首次发布：npm version patch && git push --follow-tags
  3. 查看状态：https://github.com/xxx/quick-ai/actions
```

---

## 与 github-repo-publish 集成

```
用户说"发布到 GitHub"
    ↓
1. 检查发布配置
   - 未配置 → 先引导 vscode-extension-dev
   - 已配置 → 继续
    ↓
2. 调用 github-repo-publish
   - 创建仓库
   - 推送代码
   - 创建 Release（.vsix）
    ↓
3. GitHub Actions 自动发布
   - VSCode Marketplace
   - Open VSX
```

---

## 参考资料

- [VSCode 插件发布完全指南](./references/vscode-publish-guide.md)
- [VSCode Extension API](https://code.visualstudio.com/api)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Open VSX 发布指南](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)

---

## 禁止事项

- **不要跳过项目检测**：必须先检测项目状态
- **不要覆盖已有配置**：检测后询问是否覆盖
- **不要自动创建 Secrets**：PAT 必须用户手动输入
- **不要忽略 Open VSX**：同时配置两个平台
- **不要在配置未完成时触发发布**：会失败
