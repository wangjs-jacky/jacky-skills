---
name: topic-debate
description: 让多个异构 AI（Claude 子 agent + Codex）对一个辩题做匿名多方对抗辩论，由独立第三方裁判判赢并给出判词。当用户想"辩论一下 X"、"让 AI 辩论这个题目"、"对抗讨论这个观点"、或输入 /topic-debate [辩题] 时触发。产出 debate-log.md + verdict.md，不碰任何已有文件。
---

# topic-debate

> 多方对抗辩论：编排器拆立场 → 各方独立立论 → 交叉反驳（≤3 轮自适应停机）→ 独立裁判判赢 + 判词。Claude 子 agent 与 Codex 是异构辩手，互相匿名；主循环只编排，**绝不下场辩论**。

**触发**：`/topic-debate <辩题>` 或自然语言「辩论一下 X / 让 AI 辩论这个题目 / 对抗讨论这个观点」。

本 SKILL.md 是**编排剧本**——你（Claude Code 主循环）作为**中立编排器**逐步执行。长提示词在 `references/`，按需读取并注入。**你自己绝不立论、不反驳、不补论点**，只调度子 agent / Codex、拆立场、匿名转译、判定收敛、写日志、调度裁判。

---

<yolo:config>
mode: yolo
desc: 拆立场→立论→反驳→裁判一气跑完，中间不停。
hard_gates:
  - 辩题为空 / 无法拆出 ≥2 个有意义的对立立场 → 停下问用户。
  - Codex 不可用且未授权降级 → 停下问用户是否降级。
  - 连续空轮（双方都无有效产出）→ 停下报告，不静默续跑。
safe_to_auto:
  - 立场拆分、每轮辩论调度、收敛判定、写日志、裁判合成 —— 全自动推进。
</yolo:config>

---

## 角色

| 角色 | 实体 | 说明 |
|------|------|------|
| 编排器 | 你（主循环） | 中立调度，拆立场、转译、判定、记录，**不辩论** |
| 辩手甲 | fresh Claude 子 agent（Agent 工具，general-purpose） | 异构视角之一 |
| 辩手乙 | Codex（`codex-companion.mjs task`） | GPT 侧视角 |
| 辩手丙/丁… | 额外 Claude 子 agent（立场 ≥3 时） | 补足立场数 |
| 裁判 | fresh Claude 子 agent | 零辩论记忆，独立判赢 + 写判词 |

向任一辩手 / 裁判传递信息时，**统一用「辩手甲 / 辩手乙 / 辩手丙」中性标签，绝不泄漏对方是 Claude/Codex/GPT**。

---

## 步骤 0：前置检查 + 拆立场

1. **入参须是非空辩题**。否则打印用法 `/topic-debate <辩题>` 并停止。

2. **拆立场（编排器中立工作，不是辩论）**：读 `references/stance-split.md`，把辩题拆成 **2~4 个互斥且有意义的立场**：
   - 二元题（「相亲 vs 自由恋爱」「远程 vs 坐班」）→ 2 方对立。
   - 开放题 / 程度题 → 可设 3~4 方，允许含「看情况 / 折中」派，但每方必须能拿出**可被反驳的明确主张**，不能是和稀泥。
   - 拆不出 ≥2 个有意义对立立场 → 这不是辩题，停下告诉用户并建议改用普通问答。

3. **定位 Codex companion**（异构性来源）：

   ```bash
   COMPANION=$(ls -t ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | head -1)
   [ -z "$COMPANION" ] && COMPANION=$(ls -t ~/.claude/plugins/marketplaces/openai-codex/*/scripts/codex-companion.mjs 2>/dev/null | head -1)
   echo "${COMPANION:-NOT_FOUND}"
   ```

   若为 `NOT_FOUND`：告知用户 Codex 未就绪（建议 `/codex:setup`），询问是否**降级为「全 Claude 子 agent」**模式（见步骤 5）。本会话用户已授权自主完成时，直接降级并在日志标注。

4. **分配辩手 → 立场**（异构优先）：
   - 立场 1 → **辩手乙（Codex）**；立场 2 → **辩手甲（Claude 子 agent）**。
   - 立场 ≥3 → 多出的立场依次给 **辩手丙 / 丁**（Claude general-purpose 子 agent）。
   - 降级模式：全部立场都用 Claude 子 agent，system 提示强调「死守本方立场、专找对方破绽」。
   - 记下「标签 ↔ 立场 ↔ 实体」映射表（仅编排器自己持有，**绝不告知任何辩手对方是谁/哪个模型**）。

5. **建产物目录**：把辩题转成 slug（小写、空格转 `-`、去标点、截断 40 字符），设 `DEBATE_DIR="<slug>.debate/"`：

   ```bash
   DEBATE_DIR="${SLUG}.debate"; mkdir -p "$DEBATE_DIR"
   ```

   在 `$DEBATE_DIR/debate-log.md` 顶部写：辩题、立场↔标签映射（**不含模型身份**）、模式（正常 / 降级）、生成时间。

---

## 步骤 1：独立立论（第 1 轮，并行，互不可见）

1. 读 `references/opening-prompt.md` 与 `references/json-contract.md`。为**每个辩手**构造立论提示 `P_i`，替换 `{{TOPIC}}`（辩题）、`{{SELF_STANCE}}`（该辩手要死守的立场）、`{{SELF_LABEL}}`（甲/乙/丙）。
2. **并行**发起所有辩手：
   - **Claude 侧辩手（甲/丙/丁）**：用 Agent 工具起 general-purpose 子 agent，prompt = `P_i` + 附 json-contract 正文。要求返回 envelope JSON。
   - **Codex 侧辩手（乙）**：起 Codex 后台任务，轮询完成后取回：
     ```bash
     # 起任务：输出形如 "Codex Task started ... as task-xxxx"
     JOB=$(node "$COMPANION" task --background "$P_ESCAPED" | grep -oE 'task-[A-Za-z0-9-]+' | head -1)
     # 轮询直到 status=completed（每 6s 一次，Codex 通常数十秒～数分钟）
     until node "$COMPANION" status "$JOB" --json | grep -q '"status": *"completed"'; do sleep 6; done
     # 取回：辩手乙的最终输出在 result JSON 的 .job.summary 字段
     node "$COMPANION" result "$JOB" --json | python3 -c 'import json,sys;print(json.load(sys.stdin)["job"]["summary"])'
     ```
     （`P_ESCAPED` 为转义后的提示文本。`.job.summary` 即 Codex 的完整回答，对它做 JSON 抽取。）
3. 对每侧返回做 **JSON 抽取**（见下「JSON 抽取兜底」），得到每个辩手第 1 轮 envelope。
4. **立即增量写日志**：把第 1 轮各方 envelope 追加到 `$DEBATE_DIR/debate-log.md`（带轮次标题 + 可读转录：立场、论点、论证）。

---

## 步骤 2-3：交叉反驳（循环，≤3 轮）

从 round=2 开始，最多到 round=3。每轮：

1. 读 `references/rebuttal-prompt.md`。为**每个辩手**构造提示，替换：
   - `{{SELF_LABEL}}` / `{{SELF_STANCE}}`：该辩手自己。
   - `{{TOPIC}}`：辩题。
   - `{{SELF_PREV}}`：该辩手上一轮 envelope。
   - `{{OTHERS_PREV}}`：**其他所有辩手**上一轮 envelope 的拼接（每条标「辩手X」标签，**只带内容、不带身份**——此处天然匿名）。
2. **并行**让所有辩手产出本轮 envelope（甲/丙/丁走 Agent 子 agent，乙走 Codex task）。抽取 JSON。
3. **立即增量写**本轮各方 envelope 到 `debate-log.md`。
4. **收敛判定**（辩论版——不是达成共识，是没新东西了）：

   ```
   stop = 所有辩手本轮 no_new_points 都为 true
   ```
   即：本轮**没有任何一方**提出新论点或新反驳 → 辩论自然终止，进步骤 4。
   - `stop == true` → 跳出循环。
   - 否则 round<3 继续下一轮；round==3 强制停。
5. **空轮保护**：若本轮**所有方**都是空 / 非法产出，**不得**据此判停 —— 记为失败轮，重试该轮一次；再失败则带现有日志进裁判并在日志标注。

> 注意：辩论里**立场不收敛是正常的**。停机条件是「无新增论点 / 反驳」，不要求任何一方改变立场或妥协。

---

## 步骤 4：裁判（判赢 + 判词，1 次）

1. 读 `references/judge-prompt.md`，替换 `{{TOPIC}}`（辩题）、`{{STANCES}}`（各标签对应的立场，**不含模型身份**）、`{{DEBATE_LOG}}`（完整 `debate-log.md` 内容，已匿名）。
2. 用 Agent 工具起一个**全新** general-purpose 子 agent 当裁判（不复用任何辩论上下文）。
3. 把裁判输出写入 `$DEBATE_DIR/verdict.md`，含：
   - **判赢结论**：哪一方（辩手甲/乙/丙）论证最有力，一句话定论。
   - **判词**：为什么这方胜出（论点强度、反驳是否有效、有无逻辑硬伤）。
   - **逐方点评表**：`| 辩手 | 立场 | 最强论点 | 致命弱点 | 评分 |`。
   - 裁判只看论据 merit，**不知道也不该知道**谁是哪个模型。

---

## 步骤 5：降级路径（Codex 不可用）

所有立场都由**独立 Claude 子 agent**扮演，每个 system 提示强调「你死守『<本方立场>』，立场要鲜明、专找对方破绽、绝不妥协」。其余流程（匿名、循环、收敛、裁判）完全不变。在 `debate-log.md` 顶部标注 `模式：降级（全 Claude，无异构）`。

---

## 步骤 6：收尾

打印：
- `debate-log.md` 与 `verdict.md` 的绝对路径
- 辩题、拆了几方立场、跑了几轮、是否自然收敛 / 触顶、是否降级
- 裁判判赢结论（一句话）
- 一句话：**这是 AI 辩论的参考结论，非定论；过程全程在 debate-log.md 可追溯。**

---

## JSON 抽取兜底

从模型 / Codex 返回文本中提取 envelope：
1. 优先匹配 ```json ...``` 围栏内内容；否则取第一个 `{` 到最后一个 `}`。
2. `JSON.parse` / `python3 -c "import json,sys;json.load(sys.stdin)"` 校验。
3. 失败 → 对该方**重请求一次**（提示里追加"上次输出非合法 JSON，请只输出 envelope JSON"）。
4. 再失败 → `debate-log.md` 记 `WARNING: <辩手> round<N> JSON 无效，按空产出处理`，该方该轮 `arguments:[]`、`rebuttals:[]`、`no_new_points:true`。

---

## 硬约束

- 主循环**不立论、不反驳、不补论点、不评判输赢** —— 只拆立场、搬运、匿名、判定停机、记录、调度裁判。
- 任何传给辩手 / 裁判的内容**不得**出现 Claude / Codex / GPT / 模型名等身份线索。
- **绝不读写、覆盖任何与辩论无关的已有文件**；所有产物只落在 `<slug>.debate/` 目录。
- 硬上限 3 轮，杜绝死循环。
- 辩题拆不出 ≥2 个有意义对立立场时，明确告诉用户「这不是个辩题」，不要硬辩。
