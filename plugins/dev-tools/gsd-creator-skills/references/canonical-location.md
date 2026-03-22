# creator-skills 主副本说明

若你在多处看到同名 `creator-skills`（例如本仓库插件目录、全局 `~/.agents/skills/`、`~/.claude/skills/` 经 j-skills 安装后的链接等），**以本仓库中的源文件为准**：

- **主副本路径**：`jacky-skills/plugins/dev-tools/creator-skills/`（`SKILL.md` 位于该目录根下）。

**更新流程**：

1. 在本仓库中编辑 `SKILL.md` 与 `references/`。
2. 使用 `j-skills link` / `j-skills install` 将本 skill 安装到目标环境（安装结果通常为指向注册表的软链接，修改仓库内文件即可热更新）。
3. 若曾手动复制过整份 skill 到其它目录，请改为以本仓库为源重新 `link` 或同步，避免双份漂移。
