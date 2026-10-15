# 安装与升级

能力：`installation`。目标是明确可用程序的来源、版本与作用域，并能恢复原状态。

## 共用事实与边界

- PATH CLI、桌面内置程序和宿主启动的 app-server 分别核对；升级一个入口不能证明其他进程已更新。
- 沿用真实安装渠道。官方 CLI 页面提供多种安装方式；旧环境中的 Homebrew 偏好不能推广到所有机器。自更新能力需当前版本及安装来源支持。
- 不用“文件已安装”代替认证、模型访问或旧进程重载验证。版本号和升级日期只代表对应入口。
- 远端设备以当前用户指向及设备登记为准；退役主机不得因旧记录再次成为默认目标。

## Operations

- [安装或升级](operations/install-upgrade.md)
- [诊断版本冲突](operations/diagnose-version-conflict.md)
- [迁移环境](operations/migrate-environment.md)

## 来源

2026-10-15 阅读 [Codex CLI](https://learn.chatgpt.com/docs/codex/cli) 与 [CLI reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli)。旧环境记录提供了独立版本目录不支持自更新的个例，执行前重新核对。
