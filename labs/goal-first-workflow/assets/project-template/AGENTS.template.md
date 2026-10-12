# Goal-first workspace

This directory is a self-contained workspace for one goal. Preserve the user's original purpose, break work into small independently executable tasks, and keep evidence beside the task that produced it.

## Start here

Read [problem.md](problem.md) before proposing work. If it is still a filling draft, help the user complete it or wait for them to do so. When the goal is clear, create only the task directories needed for this goal under `tasks/`.

Name tasks as `NN-short-description/`, for example `01-research-options/`. Each task begins with `index.md` and `PROMPT.md`, created from the corresponding workflow templates.

## Task lifecycle

Each task `index.md` has YAML frontmatter containing exactly one field:

```yaml
status: pending
```

Allowed values are `pending`, `running`, `review`, `done`, and `blocked`. Update the status when work materially changes. Do not create a separate progress dashboard or add percentage fields.

Before working on a task, read its `index.md`, `PROMPT.md`, and only the predecessor results it needs. Execute one selected task at a time. Planning a task does not authorize all of its external actions.

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

Do not record secrets, credentials, private keys, access tokens, or unredacted private logs. Do not treat a plan as permission to spend money, use an account, change a remote system, deploy, delete, or interrupt a service. If work needs such authority or an input that is unavailable, set the task to `blocked` and state the concrete condition.

Preserve failed attempts and changed decisions with dates. A newer conclusion may replace an old one, but should link to the earlier record rather than erase it.
