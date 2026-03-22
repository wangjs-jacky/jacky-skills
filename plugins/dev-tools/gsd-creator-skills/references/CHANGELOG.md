# creator-skills 修订记录

本文件记录 **本 skill 的 references** 相对重要变更，便于与 `get-shit-done-study/notes` 或 GSD 源码对齐时做 diff。

格式：`YYYY-MM-DD — 摘要 — 可选：来源笔记路径`

## 2026-03-22

- 新增 `gsd-xml-tags.md`：GSD 对齐的 workflow 词汇表、与 multi-agent 工具 XML 的差异说明。
- 新增 `hooks-patterns.md`：Claude 项目 hook、skill checkpoint、Clojure 上下文、React hooks 分场景说明。
- 新增 `notes-import/README.md`：外部笔记接入方式与同步检查清单。
- 新增 `scripting-workflow-techniques.md`：Shell 脚本解耦、进度外置、查询脚本省上下文、workflow 设计模式（管道、状态机、查询/变更分离、幂等、薄编排）。
- 新增 `cross-session-workflow-skill-design.md`：从 GSD 提炼 pause/resume、`.continue-here.md`、`STATE.md`、`Next Up` 阶段引导与 `resume-signal` 模板。
- 新增 `resume-next-stage-patterns.md`：通用的恢复协议、`next_action` 字段与阶段结束 `Next Up` 模板（从独立 `cross-session-workflow` 合并而来）。
- 新增 `yolo-mode-patterns.md`：从 GSD 的 `yolo|interactive` 提炼运行模式开关、自动推进边界与强制确认规则。
- `SKILL.md`：参考索引与「复杂需求」技巧小节、最佳实践第 6 条、持续优化引用更新。
