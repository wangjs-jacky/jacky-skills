---
id: thinking-ops.sources
title: 来源、版本与改编
summary: 记录方法资料、版本、署名和改编边界；初始资料不限定知识库的数量或来源。
---

# 来源、版本与改编

本库持续吸收新材料、用户做法和实践经验。本文件记录资料归属与版本，不定义方法的完整清单；新增条目在自身正文或元数据记录来源，需要共享说明时再补充此处。

## 初始导入资料

用户最初指定：[zdrjson/thinking-prompts-skill](https://github.com/zdrjson/thinking-prompts-skill/tree/main#02-two-layer)。2026-11-25 经 GitHub 只读接口核对，引用版本为 [`5c38a09408f868b118e013c820b245b39ca48ec4`](https://github.com/zdrjson/thinking-prompts-skill/commit/5c38a09408f868b118e013c820b245b39ca48ec4)。这是初始资料的来源记录，不是本库的唯一内容来源。

- 该资料的内容源：[data/prompts.json](https://github.com/zdrjson/thinking-prompts-skill/blob/5c38a09408f868b118e013c820b245b39ca48ec4/data/prompts.json)。本次读取的 main 数据与所引版本一致。
- 上游使用方式：[SKILL.md](https://github.com/zdrjson/thinking-prompts-skill/blob/5c38a09408f868b118e013c820b245b39ca48ec4/SKILL.md)，强调实际运用、一次读取一套和对话式逐轮提问。
- 说明：[README.md](https://github.com/zdrjson/thinking-prompts-skill/blob/5c38a09408f868b118e013c820b245b39ca48ec4/README.md)。
- 上游署名：卡兹克《[都Agent时代了，我还是想分享给你这12个我最常用的Prompt。](https://mp.weixin.qq.com/s/NAdhdFrUq9-BKelqzqpwBQ)》。本次没有另行读取核实该文章，不能将仓库整理版说成作者原稿。

这批条目的 `source_prompt` 保存原资料编号和 ID，仅用于追溯。当前方法通过[场景索引](scenarios/index.md)查找；新方法不需要来自该仓库，也不要求使用其编号。

## OPS 适配

将初始资料概括为可执行的方法，保留核心问题、动作与产出；新增选型线索、避用条件、灵感落地、串联、成功标准和反馈写回。后续内容按各自来源和证据继续积累，运行时不依赖联网加载这个仓库。

不照搬默认万字篇幅、专家身份自称或天赋定论。按请求调整深度，将心理概念作为探索线索。这些是本 OPS 的适配，不宣称上游已有。

更新来源先看实际差异，再改命中条目。来源核对日期不充当使用验证日期。

## 许可告知

上游组织、封装和代码采用 MIT；Prompt 正文版权归卡兹克，不将其一并声称为 MIT。保留[固定版本 LICENSE](https://github.com/zdrjson/thinking-prompts-skill/blob/5c38a09408f868b118e013c820b245b39ca48ec4/LICENSE)全文：

```text
MIT License

Copyright (c) 2026 zdrjson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

注：仓库内 Prompt 正文蒸馏自卡兹克的公开文章，版权归原作者所有；MIT 许可适用于本仓库的组织、封装与代码部分。
```

来源核对与封装不等于方法已在真人困惑中验证；每个条目独立维护实际应用证据。
