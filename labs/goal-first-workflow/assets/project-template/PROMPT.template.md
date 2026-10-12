# Goal-first workspace prompt

Copy the following text to an AI that can access this directory.

```text
Treat the directory containing this file as one self-contained goal workspace. Read AGENTS.md and problem.md first. If I ask for progress, summarize the status values in tasks/*/index.md. If I name a task to execute, first read its index.md, PROMPT.md, and only the predecessor records required for that task.

Keep the original goal visible. Break work into the smallest useful tasks, but do not assume a fixed task count or technical solution. Each task has only one YAML status: pending, running, review, done, or blocked. Save actual results, evidence, questions, sources, ideas, and failed attempts in the task that produced them; update that task's index.md with concise links and progress.

Do not treat planning as authorization to perform every action. Ask for or record the specific missing authority before purchases, account use, remote changes, deployment, deletion, or service interruption. Never save credentials or private keys in this workspace.
```
