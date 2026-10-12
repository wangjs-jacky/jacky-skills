# 定位、读取与核验 Codex 历史

## 发现候选

脚本依赖 Node.js 20+；需要分页/fork 的原生历史时，还需要与来源兼容的 `codex` CLI。无 npm 依赖。默认使用进程的 `CODEX_HOME`，否则使用用户目录中的 `.codex`；也可显式指定 `--codex-home`。来源可能在不同账号 profile 下，先从已知运行环境确定路径，不盲扫所有账号目录。

```bash
node <this-skill>/scripts/codex-history.mjs list \
  --project /path/to/project --from 2026-10-11 --to 2026-10-12 \
  --timezone Asia/Shanghai
```

日期两端包含当天；按事件时间与指定时区筛选，不按文件名中的 UTC 日期判断。`list` 仅输出候选元数据与路径，不输出聊天正文。它扫描 `sessions/` 和 `archived_sessions/`，检查会话与 turn 的 cwd；shared-parent 仅为低置信度候选。跨项目谈话、别名路径或缺失 cwd 仍需人工/AI 核对。指定 `--session <thread-id>` 可以独立于 cwd 找来源；可重复该选项。`session_index.jsonl` 可辅助标题检索，但不能替代正文。

## 导出单会话证据

对确认的文件逐个处理。目标必须是尚不存在的目录，避免覆盖已有分析或来源；中间文件权限为仅当前用户可读写。

```bash
node <this-skill>/scripts/codex-history.mjs export \
  --source /path/to/rollout.jsonl --out /path/to/private-scratch/session-a
```

得到 `source.json` 和 `events.jsonl`。前者记录快照时间、哈希、行数、会话身份、时间范围与缺口；后者每行是带原始位置的证据事件，便于分段读取。脚本不生成“正确/错误”的判断，也不把全部日志转写成笔记。

默认 `--native auto`：若日志标记 paginated、包含 fork 来源或压缩记录，尝试通过本机 `codex app-server` 读取持久化历史。也可用 `--native always` 主动交叉检查，或 `--native never` 仅处理 JSONL 并记录缺口。`--codex-bin` 可指定兼容 CLI 可执行文件。

原生读取只发送 `initialize`、`initialized`、`thread/read`、`thread/turns/list` 和必要时 `thread/items/list`。不发送 resume、fork、start 或 turn/start；不会让原会话继续执行或发起模型推理。CLI 启动仍可能写它自己的运行日志。当前分页接口将 turn/item 按升序翻页，处理到 `nextCursor` 为空；不把默认 summary 当成完整条目。旧版本只在方法不支持时降级到 `thread/read(includeTurns=true)`，缺失条目继续列为限制。

## 完整性与引用

- **JSONL 不是所有版本唯一的历史来源。** 分页版本可能依赖 `thread_history_*.sqlite` 的投影和已提交 WAL。原生 API 使用当前运行时读取这些数据，比自造 SQLite 查询可靠。API 无法读取时保留局部回放并明确缺口；不要改历史模式、改数据库或开启原会话“修复”。
- **fork 必须尊重截止点。** `history_base.thread_id`、`end_ordinal_exclusive` 等用于祖先定位；使用运行时的可见历史，不自行把父线程后续操作拼进子线程。缺父历史或索引时不能称全量。比较父/子时按 turn/item ID 将继承部分标为承接背景，项目操作次数只计一次。
- **解析到不等于发生过。** 旧版 `response_item` 与新版 `event_msg.item_completed` / native items 可能表示同一事件。按 call/item/turn ID 对齐；call 与 result 配对；同文不同 ID 的用户消息保留。没有稳定 ID 时以邻近位置与上下文判断并保留歧义。
- **来源保真。** `events.jsonl` 的 rollout 事件包含原始行号、ordinal、时间和 record；native 事件含 thread/turn/item ID。不同源分区不等于跨源先后关系。哈希对应读取到的字节快照；文件在读取中改变、坏行、截断结尾、未知类型、未结束轮次都需要检查。
- **不可恢复内容。** 工具返回本身的截断、过期附件、删除消息和未记录操作不会因为导出而恢复。密文推理与 usage/world-state 等非回放内容不导出。完整性仅针对可读取、选定范围的对话与操作；源时间缺失时不能生成精确耗时。

长日志按连续范围阅读，每段记录已读行/turn、尚未配对的调用、待验证判断和后续关联。直到范围末尾才写总览；不能只读取末尾摘要。临时分段笔记无需加入最终目录。

## 增量与归档

以完整 thread ID 匹配已有 Markdown（即使标题或日期改变）。对照其覆盖范围与来源哈希：追加历史只补新步骤；源被重写或删除时保留旧引用并说明差异。用户手写区不重建覆盖。一个线程可同时覆盖多天；新线程同日仍单独建篇。会话之间按首次活动排序；同一时刻用源顺序，不伪造串行依赖。

默认不复制原始历史。如果用户要求长期离线可追溯，再归档选定 JSONL、附件以及该版本读取所需的索引/祖先依赖。SQLite 使用只读一致性备份，包含已提交 WAL 的数据；不直接复制一个正在写入的主数据库文件。不得顺带复制认证库或整个账号目录。笔记引用同步指向归档位置；若只存了 Markdown 或临时导出，明确它不等于可恢复的完整 Codex 历史。
