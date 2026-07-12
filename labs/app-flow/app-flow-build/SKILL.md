---
name: app-flow-build
description: "在需要创建、修改、重构、修复 App 代码，或只读诊断崩溃、定位根因、给出候选补丁时使用；支持独立窄任务，也支持作为 app-flow 的当前行动。它不做产品调研、原型/设计、独立评审或打包发布，除非当前行动本身就是改代码。"
---

# App Flow Build

把当前 App 代码变更落实为可验证的实现。架构、技术栈和验证方法必须来自目标仓库证据，不预设 React Native、Expo、Flutter、原生或其他方案。

## 边界与准备

- 先读取目标仓库根级以及目标目录最近层级适用的 `AGENTS.md` / `CLAUDE.md`，遵循它们指向的 source of truth；规则冲突时以最具体且适用于当前文件的为准。再检查现有架构、依赖、脚本、测试和代码模式。
- 先用代码、配置、日志或失败测试诊断根因，再修改；证据不足时缩小未知项，不猜框架或重写无关系统。
- 只读诊断不要求已获写文件授权，也不修改文件；返回定位证据、标为 `proposed / not-applied` 的最小候选补丁，以及标为 `not run` 的回归方法。证据不足则返回 `blocked`，不伪造根因、补丁或测试结果。
- 只处理当前代码行动：功能、数据、导航、原生集成、重构或修复，以及相称测试。产品范围、原型交互、最终视觉规范、独立评审与打包交付留给匹配能力。
- 保留用户已有与无关改动；不覆盖、回退或顺手整理它们。
- 未获得具体渠道与动作的明确授权不得发布。长时间执行只延长持续性，不扩大 push、deploy、Release 等外部副作用权限。

## 实现与验证

1. 写清当前目标、可核验 acceptance、允许修改范围和未知项。
2. 从现场证据确定最小改动点；能复现时先留下失败证据或测试，再实现最小修复。
3. 沿目标仓库已有结构实现功能、数据、导航、原生集成或修复，并添加与风险相称的测试。
4. 用新鲜命令输出验证改动、相关测试与回归；失败就报告真实诊断。编译或 typecheck 通过不等于 UX 或人工验收通过，未执行的检查必须明确标注。

## 参考知识

需要构建产物时按需读取，不预先展开：

- [`references/build-production.md`](references/build-production.md)：正式构建的通用取舍——版本、runtime、签名、可复现与产物核对。
- [`references/build-preview.md`](references/build-preview.md)：预览/开发构建的通用取舍——快速迭代、独立 profile 与内部分发。

这些是跨技术栈的思路骨架，不是具体命令；真实命令与本机私有配置只留在被忽略的 `local/`，不写进可分享文件。

## 独立与 Flow 两种模式

- **独立模式**：短任务直接返回结果，不建立全局恢复点。
- **Flow 模式**：把完整 `outcome`、`acceptance_status`、`changes`、`evidence`、`tests`、`unknowns`、`risks`、`next` 返回给 `app-flow` 父 owner，由它独占任务恢复权，本能力不创建全局恢复指针。

`acceptance_status` 显式取值：`completed`（全部 acceptance 有新鲜证据）、`partial`（部分满足且已列剩余项）、`failed`（当前行动或必要验证失败）、`unverified`（有实现/候选但必要验证未执行）、`blocked`（缺证据、输入或授权无法安全继续）。只有新鲜证据支持时才能声称文件已改或测试通过。

## 本地 Memory

本 Skill 只拥有自己的 `local/`，默认被 `.gitignore` 排除。首次需要读写时，从当前 Skill 目录按需加载 `../../../docs/philosophy/references/local-memory.md`；引用不可读时以本节摘要继续并保留诊断。默认从 `local/INDEX.md` 进入一个作用域 map，再读少量命中正文，不递归扫描。

Memory 使用不可变记录，修正由新记录 `supersedes` 旧 ID；保存不等于可信。secrets、tokens、`.env`、PII 和原始私密日志不得进入 `local/`；确需留证据时只保存最小化、脱敏的必要部分。稳定、脱敏、反复验证的方法才晋升到 `references/`。
