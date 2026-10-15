---
name: codex-env-config
description: "Codex 环境配置兼容入口：安装升级、环境迁移、运行配置、认证、代理、Responses WebSocket 与技能同步统一读取 codex-ops 对应能力及 operation。"
---

# Codex 环境配置：兼容入口

共享经验已归入独立 `codex-ops`；本入口保持原名称和触发范围。

## 路由

1. 从当前技能目录或安装注册表定位并读取 `codex-ops/SKILL.md`，不能假设它位于本 Plugin 内。
2. 按目标读取对应能力与 operation：

| 目标 | capability / operation |
| --- | --- |
| 安装升级、版本冲突 | installation / install-upgrade、diagnose-version-conflict |
| 远端环境适配 | installation / migrate-environment |
| 配置、全局指令、配置未生效 | configuration 下对应操作 |
| 技能安装同步与发现 | skills / install-sync、diagnose-discovery |
| 认证、代理、Responses WebSocket | connectivity 下对应诊断操作 |

3. 本机旧记录已迁移时，`experience.local.md` 仅提供新源与历史入口；其他安装若仍保留旧文件，将其视为带日期的历史，不先把整份记录当成当前配置。
4. 完成、失败或中断后按 Codex OPS 写回唯一归属；当前规则、版本和设备身份优先于旧记录。

## 安装与依赖缺失

通过 knowledge-base Plugin 单独安装此入口时，同时安装仓库中的独立 `harness/codex-ops`；全量安装器已包含 harness。依赖缺失时明确说明，按当前授权安装或继续不受影响的只读盘点，不凭记忆复刻旧操作。
安装 Agent 读取 Codex OPS 的全局前置提示词；只有确认规则和目标范围后才写全局，不把正常安装授权等同于修改全局。

## 保留边界

- 只读取必要认证摘要，不打印或记录秘密。
- 目标机器、安装来源、配置根、hooks/MCP/代理和凭据存储必须按当前环境适配。
- HTTP-only 的条件、传输层区分、恢复与实际请求验证在 connectivity/diagnose-websocket 维护；旧私有后端 URL 不作为通用配置。
- 查询脚本和额度字段解释继续由 `codex-quota` 维护。
