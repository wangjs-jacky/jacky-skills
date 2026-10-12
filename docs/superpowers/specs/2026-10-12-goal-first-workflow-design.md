# Goal-First Workflow Design

## Intent

Create an experimental, reusable Skill that turns a newly stated project goal into an independent, file-backed execution workspace. It must preserve the user's original goal, break work into small tasks, let each task carry a copyable prompt and one simple status, and leave auditable results, sources, questions, and ideas in the task that produced them.

The Skill serves users who say things such as “开启一次需求”, “把这个需求拆成可追踪任务”, or “为这个项目建立可审计流程”. It is not a project-management product, a background task runner, or a replacement for a domain-specific implementation skill.

## Location and maturity

The initial implementation lives at `labs/goal-first-workflow/`. It stays experimental until it has completed at least two materially different end-to-end projects. The existing `goal-first-dev-sop/example/` remains an external real-case fixture; its Qv2ray, hosting, proxy, and personal-server details are not copied into the reusable Skill.

## Structure

```text
labs/goal-first-workflow/
  SKILL.md
  assets/project-template/
    AGENTS.template.md
    PROMPT.template.md
    problem.template.md
    task-index.template.md
    task-prompt.template.md
  references/workflow-rules.md
  scripts/init-goal-project.sh
```

`SKILL.md` is the thin entrypoint: it selects this workflow only for goal-to-task execution work, gathers or records the minimum context, chooses task boundaries based on the actual goal, initializes a target workspace, and maintains the lifecycle rules. It does not prescribe a fixed number of tasks or a particular technical stack.

`assets/project-template/` holds portable starting files. The initializer copies them into a user-specified project-local directory and renames them to their runtime names. The resulting workspace must remain usable after it is disconnected from `jacky-skills`.

`references/workflow-rules.md` holds detailed conventions: directory ownership, task naming, the five allowed statuses, evidence/FAQ/source/idea routing, and external-authority boundaries. It is only read when creating or maintaining a workflow.

`scripts/init-goal-project.sh` accepts exactly one destination directory, refuses to overwrite an existing non-empty destination, copies the neutral templates, creates `tasks/`, and prints the next file to edit. It does not create tasks, infer a goal, make network calls, or change Git state.

## Project-local contract

Each generated workspace has this minimum shape:

```text
<goal-directory>/
  AGENTS.md
  PROMPT.md
  problem.md
  tasks/
    01-<short-task-name>/
      index.md
      PROMPT.md
```

The user writes or reviews `problem.md` first. Once it is sufficiently clear, the AI creates only the necessary numbered task directories. Every task `index.md` has a YAML frontmatter with one key only:

```yaml
status: pending
```

The allowed values are `pending`, `running`, `review`, `done`, and `blocked`. Results, proof, failed attempts, FAQ, source records, and ideas are created only when actual material exists, and live in the task that generated them. A task's `index.md` is its only status/entry page.

## Execution flow

```text
User goal
  -> problem.md
  -> task breakdown
  -> one selected task
  -> result / evidence / feedback
  -> update next task or branch
```

The AI must not treat task planning as authorization to execute every task. A task may require user-supplied information, payment, account access, or approval to alter external systems. In that case it records `blocked` and the concrete missing condition, rather than inventing results or bypassing authority.

## Non-goals

- No fixed five-step workflow, protocol, framework, provider, or example project.
- No task percentage, secondary progress dashboard, database, or background monitor.
- No credentials, private logs, or unredacted screenshots in generated project files.
- No automatic Git commit, push, purchase, deployment, or external modification.

## Validation

The implementation must be checked by:

1. The repository's skill audit, including frontmatter and discoverability checks.
2. A temporary-directory run of the initializer proving expected files are created and an existing non-empty destination is protected.
3. A content check proving the generated workspace is independent of `jacky-skills` absolute paths and contains no Qv2ray-specific material.

## Graduation criteria

Promote the lab to `skills/goal-first-workflow/` only after two distinct projects have completed their task lifecycle, and review shows that the template did not force inappropriate task boundaries or conceal authorization/status problems.
