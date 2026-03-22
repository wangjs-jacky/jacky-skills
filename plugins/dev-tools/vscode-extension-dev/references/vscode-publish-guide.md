# VSCode 插件发布完全指南

> 本文档为 VSCode 插件发布的参考知识库，包含完整的手动发布流程和自动化配置。

## 一、基础概念

### 1.1 核心配置项

```json
{
  "name": "my-extension",           // 插件唯一标识（全局唯一）
  "displayName": "My Extension",    // 显示名称
  "version": "1.0.0",               // 版本号（语义化版本）
  "publisher": "your-publisher-id", // 发布者 ID（需注册）
  "description": "插件描述",
  "engines": {
    "vscode": "^1.60.0"             // 支持的 VSCode 最低版本
  },
  "main": "./out/extension.js",     // 入口文件
  "activationEvents": [],           // 激活事件
  "contributes": {}                 // 贡献点（命令、菜单等）
}
```

### 1.2 Publisher 注册

1. 访问 https://marketplace.visualstudio.com/
2. 使用 GitHub 或 Microsoft 账号登录
3. 点击右上角 → Create Publisher
4. 填写 Publisher ID

> **重要**：`name` + `publisher` 组合必须全局唯一。

## 二、发布平台

| 平台 | 说明 | 用户覆盖 |
|------|------|----------|
| **VSCode Marketplace** | 官方市场，VSCode 内置搜索 | 最广 |
| **Open VSX Registry** | 开源市场，VSCodium 等使用 | 较广 |
| **GitHub Releases** | GitHub 仓库发布页 | 需手动安装 |

## 三、发布工具安装

```bash
# 安装 vsce（VSCode Extension Manager）
npm install -g @vscode/vsce

# 安装 ovsx（Open VSX 发布工具）
npm install -g ovsx
```

## 四、Personal Access Token 配置

### 4.1 VSCode Marketplace PAT (VSCE_PAT)

1. 访问 https://dev.azure.com
2. 点击右上角用户图标 → **Personal access tokens**
3. 点击 **New Token**
4. 配置：
   - **Name**: `vsce-publish`（自定义名称）
   - **Organization**: All accessible organizations
   - **Expiration**: 建议 90 天或更长
   - **Scopes**:
     - ✅ **Marketplace** → **Manage**
5. 点击 **Create**，**立即复制 Token**（只显示一次！）

### 4.2 Open VSX PAT (OVSX_PAT)

1. 访问 https://open-vsx.org/user-settings/tokens
2. 点击 **Create Token**
3. 复制生成的 Token

## 五、GitHub Secrets 配置

### 方法一：使用 gh CLI（推荐）

```bash
# 添加 VSCode Marketplace PAT
gh secret set VSCE_PAT
# 粘贴 PAT，按 Enter

# 添加 Open VSX PAT
gh secret set OVSX_PAT
# 粘贴 PAT，按 Enter

# 验证
gh secret list
```

### 方法二：GitHub 网页操作

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 **New repository secret**
3. 添加两个 secrets：
   - `VSCE_PAT`: Azure DevOps 的 PAT
   - `OVSX_PAT`: Open VSX 的 PAT

## 六、手动发布流程

### 6.1 打包插件

```bash
vsce package
# 生成：your-extension-1.0.0.vsix
```

### 6.2 发布到 VSCode Marketplace

```bash
# 登录（首次需要）
vsce login your-publisher-id
# 输入 PAT

# 发布
vsce publish
```

### 6.3 发布到 Open VSX

```bash
# 首次需要登录
ovsx create-publisher your-publisher-id
# 输入 PAT

# 发布
ovsx publish
```

### 6.4 本地测试安装

```
VSCode: Cmd+Shift+P → "Install from VSIX" → 选择 .vsix 文件
```

## 七、GitHub Actions 自动化

### 7.1 Workflow 文件

创建 `.github/workflows/release.yml`：

```yaml
name: Release Extension

on:
  push:
    tags:
      - 'v*.*.*'  # 匹配 v1.0.0 格式的 tag

permissions:
  contents: read

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write      # 用于创建 Release
      id-token: write      # 用于 OIDC 发布到 Open VSX
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
          draft: false
          prerelease: false
```

### 7.2 package.json 发布脚本

```json
{
  "scripts": {
    "build": "vsce package",
    "package:vsix": "vsce package",
    "publish:vsce": "vsce publish",
    "publish:ovsx": "ovsx publish",
    "publish:all": "npm run publish:vsce && npm run publish:ovsx",
    "deploy": "npm run build && npm run publish:all"
  }
}
```

### 7.3 触发自动发布

```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 推送代码和 tag
git push origin main --follow-tags
```

### 7.4 发布流程图

```
开发者执行 npm version
       ↓
更新 package.json 版本号
       ↓
创建 Git commit + tag (v1.0.0)
       ↓
推送到 GitHub
       ↓
GitHub Actions 触发
       ↓
┌──────┼──────┐
↓      ↓      ↓
VSCode  Open   GitHub
Market  VSX    Release
```

## 八、.vscodeignore 配置

```
.vscode/**
.vscode-test/**
src/**
**/*.ts
**/*.map
.gitignore
**/tsconfig.json
**/.eslintrc.*
**/*.md
!README.md
!CHANGELOG.md
node_modules/**
!node_modules/production-dependency/**
```

## 九、常见问题

### 9.1 扩展名已被占用

```
错误：The extension 'xxx' already exists in the Marketplace.
```

**解决方案：**
1. 修改 `name`
2. 或修改 `displayName` 添加区分

### 9.2 PAT 验证失败

```
错误：TF400813: The user is not authorized to access this resource.
```

**解决方案：**
1. 检查 GitHub Secrets 中的 `VSCE_PAT` 是否正确
2. 重新创建 PAT，确保勾选 **Marketplace → Manage**
3. 确认 PAT 未过期

### 9.3 README 未显示

```json
// package.json
{
  "vsce": {
    "baseContentUrl": "https://github.com/username/repo/raw/master/"
  }
}
```

### 9.4 打包文件过大

使用 `.vscodeignore` 排除不需要的文件。

## 十、发布检查清单

- [ ] `package.json` 中 `name` 和 `publisher` 已正确配置
- [ ] `name` 在目标 publisher 下全局唯一
- [ ] README.md 存在且内容完整
- [ ] LICENSE 文件存在
- [ ] 版本号已更新（如需要）
- [ ] GitHub Secrets 已配置 `VSCE_PAT` 和 `OVSX_PAT`
- [ ] GitHub Actions workflow 文件已创建
- [ ] 本地测试 `vsce package` 成功

## 十一、参考资料

- [VSCode Extension API 官方文档](https://code.visualstudio.com/api)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Open VSX 发布指南](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
