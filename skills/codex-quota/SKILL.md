---
name: codex-quota
description: 查询 Codex 剩余额度、已用比例和重置时间。读取本地 Codex 会话日志，适用于“还有多少额度”“查一下 Codex 用量”及核对 Happy 额度显示；不用于 API 账单或任务 token 预算。
---

# Codex 剩余额度

直接运行本 Skill 的脚本，无需额外的 MCP 工具或联网登录：

```bash
node <本 Skill 目录>/scripts/query.mjs
```

默认读取当前 `CODEX_HOME`，未设置时使用 `~/.codex`。核对 Happy 截图或默认本机数据时运行：

```bash
node <本 Skill 目录>/scripts/query.mjs --compare-default
```

用户指定目录时使用 `--home /absolute/codex-directory`。脚本只读 `sessions/` 和 `archived_sessions/` 的 JSONL，不读取认证文件，不发送模型请求。缺少 Node 时说明依赖，不为查询安装整个 Happy。

## 解释结果

- 先报告剩余比例，再给窗口长度、重置时间、额度记录时间；明确是日志最后记录的数据。
- 窗口必须按 `windowMinutes` 解读：10080 分钟为 7 天，300 分钟为 5 小时。不能把 `primary` 固定叫 5h 或把 `secondary` 固定叫 7d；已有 `paws codex usage` 的打印标签存在这个问题。
- 当前会话可能采用隔离目录。比较模式的两份结果分别标注来源，不能混合窗口、断言属于同一账号，或把时间差归因于目录本身。截图与默认目录吻合，只能说明读数吻合。
- 只使用最新有效 `codex` 配额记录；缺失或 null 的 `limit_id` 兼容旧日志。跳过其他模型独立额度。后续无额度记录不能抹掉已有有效记录；不同时间的窗口不要拼接。
- `expired: true` 表示已到日志记录的重置时间；说明数据已过期，不能直接推断已经恢复 100%。没有有效记录时报告未知，不得当成零剩余或无限。
- `partial: true` 表示扫描不完整，说明限制。扫描时间与额度记录时间不同，重新扫描不会向 OpenAI 刷新额度。
- 不把日志正文、对话内容、认证信息输出给用户。通常不需要展示目录、JSON 或内部术语。

典型回答： “7 天额度剩余 99%，已用 1%；9 月 19 日 17:15 重置。数据记录于 9 月 13 日 11:24（北京时间）。”
