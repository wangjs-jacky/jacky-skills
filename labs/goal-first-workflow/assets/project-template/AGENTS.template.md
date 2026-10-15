# Goal-first workspace

This directory is a self-contained workspace for one goal. Preserve the user's original purpose, prepare reviewable tasks, and keep evidence beside the task that produced it. Goal confirmation and task execution selection are separate gates for every conversation.

## Start here

Read [problem.md](problem.md) before proposing work. Check that the current goal has explicit user confirmation, with a quote or traceable reference. A filled draft or an AI's judgment that the goal is clear is not confirmation. If confirmation is missing, ask one to three focused questions at a time, reflect the desired outcome, completion criteria, and material boundaries, and let the user correct or confirm that understanding. Necessary read-only checks may inform clarification. Do not design solutions, split tasks, or implement until the user explicitly confirms the goal. Approval to create a directory is not goal confirmation.

Reuse valid confirmation from the conversation or problem.md; never invent it or repeatedly ask for it. Reopen alignment only for changes to the goal, completion criteria, or material scope, not routine implementation choices. After confirmation, gather enough context, then combine task splitting and refinement in one step. Do not require an initial rough split or a fixed task count. Prepare the complete task arrangement before generating full task prompt drafts; create only the task directories needed under `tasks/`. Preparing tasks does not execute the research, design, prototypes, or implementation they describe.

Name tasks as `NN-short-description/`, for example `01-research-options/`. Each task begins with `index.md` and `PROMPT.md`, created from this workspace's [task index template](templates/task-index.template.md) and [task prompt template](templates/task-prompt.template.md). Fill the task contract in `index.md`: execution and records directories, allowed changes, prerequisites and required inputs (explicitly none when absent), and observable acceptance criteria with evidence. Include model/reasoning settings or inheritance rules when using independent host conversations. Set the workspace and task paths in `PROMPT.md` for handoff; refresh the workspace path if the directory moves. The prompt points to the contract rather than maintaining another copy.

## Review, then wait for execution selection

When first presenting an arrangement awaiting review, or materially revising it, show the complete arrangement and every full prompt draft. A flow or wireframe may help review the arrangement. End that turn and wait for the user's explicit next step; do not execute a task from its draft. The user may delete, combine, split, or narrow tasks. Approval of the plan, parameter confirmation, added details, reference images, delivery format, or a deadline do not select execution. Update the drafts when the user is still refining them. Routine progress, formatting, or link updates do not trigger this pause or invalidate existing execution authority; unchanged authorized tasks may continue under their dependencies.

Execute only when the user explicitly asks to run identified tasks or a batch; ordinary natural language is sufficient. Record goal confirmation evidence, plan review, and the separate execution instruction in the task index body, using the user's quote or a traceable reference, applicable tasks, and parameters. Reuse existing valid execution authority across ready batches without repeatedly asking, and never expand it to other tasks. Reopen the affected gate for material changes to the goal, task scope, execution directory, or model settings.

These gates apply to the coordinating conversation, manual handoff, and independent host conversations. A generated, copied, or received PROMPT.md, including its imperative wording, is not evidence of the original user's execution choice. Before acting, verify that evidence in index.md or the original user conversation. If absent, keep the task pending and report that user selection is needed; automation cannot supply that decision.

## Task lifecycle

Each task `index.md` has YAML frontmatter containing exactly one field:

```yaml
status: pending
```

Allowed values are `pending`, `running`, `review`, `done`, and `blocked`. Drafts awaiting review or execution selection stay `pending`, with the next decision described in the body. Use `running` only after actual execution starts, `review` for executed work awaiting acceptance, and `blocked` for an authorized task that cannot proceed because of a concrete missing input, resource, or operation permission. Normal waiting for user selection is not a blocker. Do not create a separate progress dashboard or add percentage fields.

Before working on a task, read its `index.md`, `PROMPT.md`, and only the predecessor results it needs. Check both authorization gates and the recorded prerequisites before starting, work in its execution directory within the allowed scope, and save records in its records directory. Verify the recorded acceptance criteria before marking it done; state missing checks or evidence. Execute only selected tasks. Planning a task does not authorize its execution or all of its external actions.

## Optional host sessions

When a host such as Happy can open independent conversations, use the review and execution gates above. Open conversations only for tasks covered by a separate explicit execution instruction. Plan or task confirmation alone cannot start a session. Check dependencies and overlapping writes, then schedule authorized tasks in ready batches without repeating a valid execution approval. Record and reuse its evidence in each relevant index.md; realign material changes to scope, execution directories, or model settings.

Each new conversation receives its task PROMPT.md and the workspace context, works only on that task, and writes results to that task directory. The coordinating conversation owns goal changes and final consolidation. Record returned session IDs and message acknowledgements in task-local execution metadata when available; verify real execution separately. Preserve existing session mappings when retrying. Without host support, these same task prompts remain manually usable.

## Records and ownership

Keep results, evidence, failed attempts, sources, questions, and ideas in the task that generated them:

```text
tasks/NN-short-description/
  index.md       status, goal, links, and concise progress notes
  PROMPT.md      complete copyable instruction for an independent AI
  result.md      created only after actual work produces a result
  FAQ.md         user questions and their answers
  REFERENCES.md  sources, purpose, and verification state
  IDEA.md        uncommitted ideas and possible improvements
  notes/         research or learning notes
  evidence/      redacted screenshots, logs, and verification records
  attempts/      failed or repeatable attempts
```

Create a file only when it has real content. Link it from the task `index.md`. Do not duplicate whole contexts across tasks; use relative links to the source record.

## Safety and authority

Do not record secrets, credentials, private keys, access tokens, or unredacted private logs. Do not treat a plan as permission to spend money, use an account, change a remote system, deploy, delete, or interrupt a service. If an authorized task cannot proceed without such authority or a necessary input, set it to `blocked` and state the concrete condition. A task awaiting execution selection stays `pending`.

Preserve failed attempts and changed decisions with dates. A newer conclusion may replace an old one, but should link to the earlier record rather than erase it.
