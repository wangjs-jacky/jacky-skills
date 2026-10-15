# 发布平台索引

先按目标分发平台命中，再读该平台和本次 operation。项目、账号和发布方式是条件，不复制平台目录。

| platform | 别名 / 场景 | 档案 |
| --- | --- | --- |
| github | GitHub、仓库推送、PR 合并、GitHub Releases | [GitHub](github/index.md) |
| npm | npm registry、Node 包、npm Trusted Publishing | [npm](npm/index.md) |
| vscode-marketplace | VS Code Marketplace、Visual Studio Marketplace、vsce | [VS Code Marketplace](vscode-marketplace/index.md) |
| open-vsx | Open VSX、ovsx、扩展 registry | [Open VSX](open-vsx/index.md) |

GitHub Actions 是项目执行机制；例如 Actions 发布 npm 包仍读取 npm 档案。新平台有实际需求后再按[分类模型](../ops-model.md)扩展。
