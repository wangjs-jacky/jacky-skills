---
status: pending
---

# NN · Task title

Goal: state the concrete result this task must produce.

## Goal confirmation, review, and execution selection

- Goal confirmation: link to the applicable user quote or traceable confirmation record in problem.md or the original user conversation. Do not invent confirmation.
- Task review: identify the arrangement and full prompt draft shown to the user, with feedback and revisions. State if review or an execution choice is still pending.
- Explicit execution instruction: leave ungranted until the user explicitly asks to run this task or a batch covering it. Record the user's quote or traceable reference, applicable task scope, and execution/model parameters or inheritance rule. Plan approval, added details, reference images, delivery requirements, and receipt of a prompt are not execution instructions.

This is a task draft until execution is selected. Keep `pending` while awaiting that decision; do not use `blocked` for normal waiting. Reuse valid execution authority within its scope without asking again for each ready batch. Material changes return to the affected confirmation gate.

## Directories and allowed changes

- Execution directory: give a workspace-relative path or identify the approved external code/work directory. Resolve workspace-relative paths from the workspace root.
- Records directory: `tasks/NN-short-description/`, relative to the workspace root; replace with this task's actual directory.
- Allowed changes: name the files, directories, or systems this task may modify. Distinguish code changes from task records; state when the task is read-only apart from its records.

## Prerequisites and inputs

Link the predecessor tasks or records and name the required inputs. State what must be available or verified before starting. Explicitly write "None" when there are no prerequisites or additional inputs.

## Acceptance criteria and evidence

State observable conditions for completion, how each will be checked, and which result or evidence will demonstrate it. Record actual verification results and any unchecked conditions before marking the task done.

## Current progress

State what is known, what has actually been done, and what prevents the next step.

## Outputs

Add links to actual records only after they exist, such as `result.md`, `REFERENCES.md`, `evidence/`, `FAQ.md`, or `IDEA.md`.

## Progress and feedback

- YYYY-MM-DD · Record a material status change, user feedback, result, failure, or handoff.
