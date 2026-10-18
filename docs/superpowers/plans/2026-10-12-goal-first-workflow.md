# Goal-First Workflow Implementation Plan

> Historical document: on 2026-10-16 the Skill was renamed to `goal-first`. Current entry: [goal-first](../../../labs/goal-first/SKILL.md); project knowledge is maintained by [goal-first-ops](../../../harness/goal-first-ops/SKILL.md). Original implementation names below are retained as historical context.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an experimental, installable-on-demand Goal-First Workflow Skill that initializes a portable, auditable task workspace inside another project.

**Architecture:** The lab contains a concise Skill entrypoint, neutral Markdown assets, a detailed workflow-rules reference, and one Node.js initializer. The initializer copies only static assets into a caller-provided empty destination; the Skill creates task content later from the user's actual goal.

**Tech Stack:** Markdown, Node.js standard library (ESM), Python `unittest` for this repository's existing test harness.

**Spec:** `docs/superpowers/specs/2026-10-12-goal-first-workflow-design.md`

## Global Constraints

- Source lives only in `labs/goal-first-workflow/`; it is not added to `install.sh --all` or a Plugin manifest.
- All distributed templates are neutral: no Qv2ray, provider, host, personal path, credential, or example-project references.
- Generated task YAML contains only `status` with values `pending`, `running`, `review`, `done`, or `blocked`.
- The initializer takes exactly one destination, refuses a non-empty destination, performs no Git/network operation, and does not create tasks.
- Preserve all pre-existing dirty worktree changes and stage only files belonging to this plan.

## Review Focus

- A destination inside a missing parent directory should be created safely without requiring the caller to pre-create it.
- A non-empty destination must remain untouched and yield a non-zero exit status.
- Generated files must contain no absolute workstation path or real-case terms.
- The lab must remain excluded from the active-skill audit and default bulk installer.
- The instructions must distinguish planning a task from authorization to execute it.

---

### Task 1: Establish initializer contract tests

**Files:**
- Create: `tests/test_goal_first_workflow.py`

**Interfaces:**
- Consumes: `node labs/goal-first-workflow/scripts/init-goal-project.mjs <destination>`
- Produces: executable contract for the initializer and generated workspace layout.

- [ ] **Step 1: Write tests for successful initialization, nested destination creation, argument validation, and non-empty destination protection**

Use `tempfile.TemporaryDirectory`, `subprocess.run`, and the repository-relative script path. Assert the successful run creates `AGENTS.md`, `PROMPT.md`, `problem.md`, and an empty `tasks/`; assert a rerun against a destination containing a sentinel file fails without changing that sentinel; assert missing or extra arguments fail.

- [ ] **Step 2: Run the new test module and verify it fails because the initializer does not exist**

Run: `python3 -m unittest tests/test_goal_first_workflow.py -v`

Expected: FAIL with a missing-script or non-zero initialization error.

### Task 2: Implement neutral templates and the Node initializer

**Files:**
- Create: `labs/goal-first-workflow/assets/project-template/AGENTS.template.md`
- Create: `labs/goal-first-workflow/assets/project-template/PROMPT.template.md`
- Create: `labs/goal-first-workflow/assets/project-template/problem.template.md`
- Create: `labs/goal-first-workflow/assets/project-template/task-index.template.md`
- Create: `labs/goal-first-workflow/assets/project-template/task-prompt.template.md`
- Create: `labs/goal-first-workflow/scripts/init-goal-project.mjs`

**Interfaces:**
- Consumes: one positional destination argument.
- Produces: `<destination>/AGENTS.md`, `<destination>/PROMPT.md`, `<destination>/problem.md`, and `<destination>/tasks/`.

- [ ] **Step 1: Implement `init-goal-project.mjs` using only Node standard-library modules**

Validate exactly one argument. Resolve it relative to the caller's current directory. If it exists and contains any directory entry, print a concise refusal to stderr and exit 1. Otherwise create the destination and `tasks/`, copy the three root templates with runtime filenames, and print the created location and `problem.md` as the next action. Do not copy task templates into the generated workspace; they remain assets for the Skill when it later creates a task.

- [ ] **Step 2: Write the five neutral Markdown templates**

Keep root templates focused on the goal, task ownership, status values, evidence placement, feedback records, and authorization boundaries. Keep task templates generic and use `status: pending` as the only YAML field. Do not include a fixed task count, domain-specific instructions, or real user data.

- [ ] **Step 3: Run the focused contract test module and verify it passes**

Run: `python3 -m unittest tests/test_goal_first_workflow.py -v`

Expected: PASS with all Goal-First initializer tests green.

### Task 3: Add the Skill entrypoint, rules reference, and lab discovery documentation

**Files:**
- Create: `labs/goal-first-workflow/SKILL.md`
- Create: `labs/goal-first-workflow/references/workflow-rules.md`
- Modify: `labs/README.md`
- Modify: `tests/test_goal_first_workflow.py`

**Interfaces:**
- Consumes: the template assets and initializer from Task 2.
- Produces: a discoverable, explicit lab workflow and regression coverage for template neutrality.

- [ ] **Step 1: Extend the test module with a generated-content neutrality check**

Initialize a temporary workspace and assert all generated Markdown combined has no `/Users/`, no `Qv2ray`, and no proxy-provider-specific terms. The test must inspect the generated output rather than only source assets.

- [ ] **Step 2: Write `SKILL.md` as a thin, discriminating entrypoint**

Use name `goal-first-workflow`. Describe when it applies and excludes. Direct the agent to read `references/workflow-rules.md` before initializing or maintaining a workspace; use the initializer only after destination approval; collect or preserve the user's problem statement before task generation; create task directories as needed using the assets; and maintain evidence and authority boundaries.

- [ ] **Step 3: Write `references/workflow-rules.md`**

Define the project-local file layout, task naming, status lifecycle, task artifact routing, feedback/FAQ/source/idea records, task branching, and stop conditions. Keep it focused on decisions that affect workflow behavior, not generic Markdown advice.

- [ ] **Step 4: Add Goal-First Workflow to `labs/README.md`**

Add it to the experimental workflow list and document individual manual preview installation with `j-skills link ./labs/goal-first-workflow` and a corresponding `j-skills install` command. Do not edit the root installer or Plugin manifests.

- [ ] **Step 5: Run focused regression tests and the repository audit**

Run: `python3 -m unittest tests/test_goal_first_workflow.py -v && python3 scripts/audit_skills.py --scan-shared-content`

Expected: all focused tests pass; audit reports zero errors.

### Task 4: Verify full repository contract and commit only owned files

**Files:**
- Modify: only files created or modified in Tasks 1–3 if verification reveals an issue.

**Interfaces:**
- Consumes: completed lab files and repository validation tools.
- Produces: verified commit(s) limited to this workflow.

- [ ] **Step 1: Run complete required validation**

Run: `python3 -m unittest discover -s tests -p 'test_*.py' -v && python3 scripts/audit_skills.py --scan-shared-content && bash -n install.sh && claude plugin validate --strict .`

Expected: every command exits 0. If `claude` is unavailable, record that exact missing prerequisite and still report the result of all runnable checks.

- [ ] **Step 2: Review the diff and staged files**

Run: `git diff --check`, `git diff -- labs/goal-first-workflow labs/README.md tests/test_goal_first_workflow.py`, and `git status --short`. Confirm neither the pre-existing dirty changes nor unrelated files are staged.

- [ ] **Step 3: Commit the implementation**

Stage only `labs/goal-first-workflow/`, `labs/README.md`, and `tests/test_goal_first_workflow.py`; commit with `feat: add goal-first workflow lab`.
