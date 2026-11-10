# Goal First for DeepSeek Harness

A task workbench for DeepSeek Harness: concise goals, delivery agreements, actual files, native conversations, and explicit user approval of individual file versions.

[中文说明](README_CN.md) · [Development and verification](DEVELOPMENT.md)

## Install

Requires Node.js 22 or newer. The current integration targets Harness 0.2.2-rc.1 and uses its public Cordis interfaces.

From this package directory:

```sh
npm run check
npm test
npm run build
```

Install the package directory with the Harness plugin manager. Build before installing: the package exports point to the generated versioned runtime. No additional npm dependencies or installation scripts are required.

For an existing installation, follow the plugin manager's upgrade response. If the same local package is already installed, remove its installation registration and install the new directory. Keep only one Goal First implementation enabled because its tools share names. Project records and session associations live outside this package.

## Use

- Open **All projects**, choose a project, then select a task card. Cards keep the task's concise source summary, expected delivery, actual files, and approval state distinct.
- **New conversation** opens a blank native conversation in the task directory. It does not submit the task. **Execute task** is an explicit execution action; **View execution** returns to the original execution without resubmitting it.
- **Adjust with AI** opens a task-scoped discussion and a read-only proposal. Only the user's confirmation archives the revised goal, deliverables, and review criteria.
- Browse the native file tree and open files in the workbench. For the full installed file-rendering capabilities, choose **Open in native reader**. Both embedded chat and the main interface use the same session identity.
- Approvals belong to a concrete file's content and the current agreement. File or agreement changes invalidate old approval; a stale displayed preview cannot silently inherit a newer approval token.

Running cards and task details have a surrounding highlight, with a static alternative for reduced motion. The running filter uses the same execution facts. Images that fail to load show a recovery message; updated deliveries offer a visible **View latest version** action.

## Data and boundaries

Task status comes from the task index frontmatter. Alignment, execution submission, and delivery approval are separate facts. Legacy task documents and their authorization remain in place; thin task navigation stays concise, with the complete revised agreement appended to the original task instructions.

Source libraries can be configured in the workbench. Removing a library from the view does not delete it. The file service restricts reads to discovered task paths, rejects symbolic links, and bounds previews; unsupported formats can be handed to installed native renderers.

The package includes no personal project records, machine profiles, authentication material, or private acceptance logs. See [NOTICE](NOTICE) and [LICENSE](LICENSE) for provenance and licensing.
