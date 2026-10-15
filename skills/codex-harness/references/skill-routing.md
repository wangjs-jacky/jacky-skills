# Skill 路由表

`codex-harness` 只做前后护栏。真正执行时，优先把任务路由到现有 skill。

## 路由顺序

先过程，再领域：

1. 过程 skill
2. 领域 skill
3. 收尾验证 skill

## 高频场景

| 场景 | 先用 | 再用 |
|------|------|------|
| Codex 安装、配置、技能、认证连接、额度 | `codex-ops` 对应 capability / operation | 操作需要的执行 Skill；额度使用 `codex-quota` |
| 需求模糊、需要先拆方案 | `brainstorming` | 对应领域 skill |
| 修 bug、异常排查、回归定位 | `systematic-debugging` | 对应领域 skill |
| 新功能实现且逻辑/回归风险高 | `test-driven-development` | 对应领域 skill |
| 代码评审 / review | `code-review` | `verification-before-completion` |
| UI、页面、交互、视觉质量 | `web-design-guidelines` | `web-design-engineer` |
| 多个独立问题可并行处理 | `dispatching-parallel-agents` | 对应领域 skill |
| 完成前做最终核对 | `verification-before-completion` | 无 |
| 创建或维护 skill | `creator-skills` | `skill-creator` |
| skill 没触发、触发错、流程失灵 | `skill-optimizer` | `creator-skills` |

## 路由原则

- 同时命中多个 skill 时，优先过程 skill
- 只用最小集合，不要把所有 skill 都读一遍
- Codex 自身运维按 `codex-ops` 的能力路由，通用过程 Skill 不应反过来覆盖其版本、配置归属与证据边界；普通编码不因运行在 Codex 中就触发该 OPS。
- 已有脚本、reference、模板足够时，直接复用，不再新增流程
- 用户明确点名某个 skill 时，优先满足用户要求

## 何时不需要再分流

以下情况可以只保留 `codex-harness`：

- 简单单文件修改，且没有明显领域 skill 更合适
- 明确只是补一条经验到 `experience.local.md`
- 只是确认一次已有约定，不需要进入复杂执行流程
