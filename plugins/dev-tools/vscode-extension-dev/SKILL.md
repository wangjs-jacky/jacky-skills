---
name: vscode-extension-dev
description: "VSCode 插件完整开发脚手架。从项目初始化、开发环境配置、功能模块生成到发布自动化。TRIGGER: VSCode 插件开发、vscode extension、创建插件、插件脚手架、发布到 Marketplace"
---

# VSCode 插件开发脚手架

完整的 VSCode 插件开发体系搭建工具，支持从零创建到双平台自动发布。

## 运行模式

| 模式 | 说明 | 使用场景 |
|------|------|----------|
| `yolo` | 自动执行，仅关键步骤确认 | 熟悉流程、快速迭代 |
| `interactive` | 每步确认，详细引导 | 首次使用、学习流程 |

**默认**: `interactive`

---

## 前置依赖

- Node.js 18.x+
- pnpm（推荐）或 npm
- GitHub CLI (`gh`) - 用于配置 Secrets
- VS Code 1.85.0+

---

## Phase 1: 项目检测与初始化

**目标**: 确定项目状态，创建或更新项目结构

**步骤**:

### 1.1 检测现有项目

```bash
# 检测是否已有 VSCode 插件项目
if [ -f package.json ] && grep -q '"engines".*"vscode"' package.json; then
    echo "✅ 检测到现有 VSCode 插件项目"
    jq '{name, displayName, version, publisher}' package.json
else
    echo "📦 需要初始化新项目"
fi
```

### 1.2 选择项目类型（新项目）

| 类型 | 说明 | 包含内容 |
|------|------|----------|
| **基础插件** | 最小化模板 | 命令、激活事件 |
| **状态栏插件** | Quick AI 风格 | 状态栏图标、配置项、命令 |
| **WebView 插件** | 带 UI 界面 | WebView、消息通信 |
| **语言支持** | 语法高亮、补全 | Grammar、Language Configuration |
| **自定义** | 选择需要的模块 | 按需组合 |

### 1.3 创建项目结构

```
<project-name>/
├── .vscode/
│   ├── launch.json             # 调试配置
│   ├── tasks.json              # 任务配置
│   └── extensions.json         # 推荐扩展
├── .github/workflows/
│   └── release.yml             # 自动发布
├── src/
│   ├── extension.ts            # 入口文件
│   ├── commands/               # 命令模块
│   └── utils/                  # 工具函数
├── package.json
├── tsconfig.json
├── webpack.config.js
├── .eslintrc.json
├── .vscodeignore
├── README.md
├── README.zh-CN.md
└── CHANGELOG.md
```

**Checkpoint**: 项目目录结构创建完成，package.json 包含 `engines.vscode` 字段

---

## Phase 2: 核心配置文件

**目标**: 生成开发环境所需的配置文件

**步骤**:

### 2.1 package.json

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
  "engines": { "vscode": "^1.85.0" },
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
    "@types/node": "18.x",
    "typescript": "^5.3.3",
    "ts-loader": "^9.5.1",
    "webpack": "^5.90.3",
    "webpack-cli": "^5.1.4",
    "@vscode/vsce": "^3.2.1",
    "ovsx": "^0.10.9"
  },
  "vsce": { "dependencies": false },
  "ovsx": { "dependencies": false }
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

const extensionConfig = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: { vscode: 'commonjs vscode' },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [{ test: /\.ts$/, exclude: /node_modules/, use: [{ loader: 'ts-loader' }] }]
  },
  devtool: 'nosources-source-map'
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
    }
  ]
}
```

### 2.5 .vscodeignore

```
.vscode/**
.vscode-test/**
src/**
**/*.ts
**/*.map
.gitignore
node_modules/**
*.vsix
.git/**
docs/**
*.md
!README.md
!CHANGELOG.md
```

**Checkpoint**: 所有配置文件就位，`pnpm install && pnpm run compile` 无错误

---

## Phase 3: 功能模块生成

**目标**: 根据项目类型生成核心代码

**步骤**:

### 3.1 基础 extension.ts

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension is now active!');

    const helloCommand = vscode.commands.registerCommand(
        '<extension-name>.hello',
        () => vscode.window.showInformationMessage('Hello World!')
    );
    context.subscriptions.push(helloCommand);
}

export function deactivate() {}
```

### 3.2 状态栏插件模板

```typescript
import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext) {
    // 创建状态栏图标
    statusBarItem = vscode.window.createStatusBarItem(
        '<extension-name>.statusBar',
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.text = '$(robot) Action';
    statusBarItem.tooltip = 'Quick Action';
    statusBarItem.command = '<extension-name>.quickAction';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 注册命令
    context.subscriptions.push(
        vscode.commands.registerCommand('<extension-name>.quickAction', async () => {
            const config = vscode.workspace.getConfiguration('<extension-name>');
            const command = config.get<string>('command', 'echo "Hello"');
            const terminal = vscode.window.createTerminal({ name: 'Quick Action' });
            terminal.sendText(command + '\n');
            terminal.show();
        })
    );
}

export function deactivate() { statusBarItem?.dispose(); }
```

### 3.3 package.json contributes

```json
{
  "contributes": {
    "commands": [{
      "command": "<extension-name>.quickAction",
      "title": "Quick Action",
      "category": "<Category>"
    }],
    "keybindings": [{
      "command": "<extension-name>.quickAction",
      "key": "cmd+shift+a",
      "when": "editorTextFocus"
    }],
    "configuration": {
      "title": "<Extension Name>",
      "properties": {
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

**Checkpoint**: `pnpm run watch` 成功，F5 调试可激活插件

---

## Phase 4: 发布环境配置

**目标**: 配置双平台自动发布

**步骤**:

### 4.1 检查配置状态

```bash
echo "🔍 VSCode 插件发布配置检查"

echo -e "\n📋 GitHub Secrets:"
gh secret list 2>/dev/null | grep -E "VSCE_PAT|OVSX_PAT" || echo "  ❌ 未配置"

echo -e "\n📋 GitHub Workflow:"
ls .github/workflows/release.yml 2>/dev/null && echo "  ✅ 已创建" || echo "  ❌ 未创建"

echo -e "\n📋 package.json:"
grep -q '"publisher"' package.json && echo "  ✅ publisher 已配置" || echo "  ❌ 缺少 publisher"
```

### 4.2 获取 PAT

**VSCode Marketplace Token (VSCE_PAT)**:
1. 访问 https://dev.azure.com
2. 右上角 → Personal access tokens → New Token
3. 配置: Name=`vsce-publish`, Expiration=`90天`, Scopes=`Marketplace → Manage`
4. 复制 Token

**Open VSX Token (OVSX_PAT)**:
1. 访问 https://open-vsx.org/user-settings/tokens
2. GitHub 登录 → Create Token → 复制

### 4.3 配置 Secrets

```bash
# 方式 1: gh CLI（推荐）
gh secret set VSCE_PAT  # 粘贴 VSCE Token
gh secret set OVSX_PAT  # 粘贴 OVSX Token

# 方式 2: 网页配置
# https://github.com/<username>/<repo>/settings/secrets/actions
```

### 4.4 创建 Workflow

`.github/workflows/release.yml`:

```yaml
name: Release Extension

on:
  push:
    tags: ['v*.*.*']

permissions:
  contents: read

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run publish:vsce
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
      - run: npm run publish:ovsx
        env:
          OVSX_PAT: ${{ secrets.OVSX_PAT }}
      - uses: softprops/action-gh-release@v2
        with:
          files: '*.vsix'
          generate_release_notes: true
```

**Checkpoint**: `gh secret list` 显示 VSCE_PAT 和 OVSX_PAT

---

## Phase 5: 文档生成

**目标**: 生成标准文档模板

### README.md

```markdown
# <Extension Name>

[中文文档](./README.zh-CN.md)

## Features
- Feature 1
- Feature 2

## Requirements
- VS Code 1.85.0+
- Node.js 18.x+

## Extension Settings
- `<extension-name>.command`: Command to execute

## Keyboard Shortcuts
| Command | Mac | Windows |
|---------|-----|---------|
| Quick Action | `Cmd+Shift+A` | `Ctrl+Shift+A` |

## License
MIT
```

### CHANGELOG.md

```markdown
# Change Log

## [0.0.1] - 2024-01-01
### Added
- Initial release
```

**Checkpoint**: README.md 和 CHANGELOG.md 存在且内容完整

---

## 验证

```bash
# 1. 编译检查
pnpm run build

# 2. 本地打包测试
pnpm run package:vsix
# VSCode: Cmd+Shift+P → "Install from VSIX"

# 3. 发布配置检查
gh secret list | grep -E "VSCE_PAT|OVSX_PAT"
```

---

## 开发工作流

```bash
# 开发
pnpm install
pnpm run watch
# F5 启动调试

# 发布
npm version patch          # 0.0.1 → 0.0.2
git push --follow-tags     # 触发自动发布
```

---

## Next Up

当前阶段完成后:

- [ ] 本地测试: `pnpm run build && pnpm run package:vsix`
- [ ] 首次发布: `npm version patch && git push --follow-tags`
- [ ] 查看状态: https://github.com/<username>/<repo>/actions

**恢复命令**: `/vscode-extension-dev --resume`

---

## 禁止事项

- **不要跳过项目检测**: 必须先检测项目状态
- **不要覆盖已有配置**: 检测后询问是否覆盖
- **不要自动创建 Secrets**: PAT 必须用户手动输入
- **不要忽略 Open VSX**: 同时配置两个平台
- **不要在配置未完成时触发发布**: 会失败

---

## 参考资料

- [VSCode Extension API](https://code.visualstudio.com/api)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Open VSX 发布指南](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
