# 外部笔记接入（get-shit-done-study / GSD）

本目录用于**可选**接入你在 `get-shit-done-study/notes`（或其它路径）中的学习笔记，便于把其中**稳定、可复用**的规则沉淀到：

- `references/gsd-xml-tags.md` — GSD 对齐的 XML 标签表
- `references/hooks-patterns.md` — Hooks 与上下文记忆模式

## 推荐做法

1. **符号链接（推荐）**：在本机将笔记目录链到此处，避免双份拷贝。

   ```bash
   # 示例：按你的实际路径修改源目录
   ln -s /path/to/get-shit-done-study/notes ./notes-symlink
   ```

2. **选择性拷贝**：只拷贝与 skill 设计相关的 Markdown 片段到 `references/notes-import/snippets/`，并在 `references/CHANGELOG.md` 中记录来源与日期。

3. **不落库**：若笔记含隐私或体积过大，不要提交到 git；仅在本地使用 symlink，并把 `.gitignore` 中忽略 `notes-symlink/`（如需要可单独添加规则）。

## 同步检查清单

从笔记向 reference 迁移时，建议核对：

- [ ] 标签名是否与当前 `gsd-xml-tags.md` 中的词汇表一致或已更新词汇表
- [ ] 实验性内容是否标为 `experimental`
- [ ] 是否与 `references/upstream-guide.md` 中的 daymade 流程冲突（冲突时在本 skill 内写明取舍）
