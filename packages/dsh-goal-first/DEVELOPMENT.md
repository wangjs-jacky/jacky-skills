# Development and verification

This is the maintained source package for the Goal First Cordis integration. Private goal archives and machine-specific acceptance history are not part of the package.

[Package entry](README.md) · [中文入口](README_CN.md)

## Build

```sh
npm run check
npm test
npm run build
npm pack --dry-run --ignore-scripts
```

[The builder](scripts/build.mjs) copies the complete Host module graph into the current version's runtime directory, inlines [shared Client state logic](client-state.js), and records content hashes. Increment the package version for an installed upgrade so that the Host loads a fresh module graph. Generated runtime directories are excluded from Git and included in the npm distribution; build before installing from a checkout.

[The document parser](lib/records.js) is vendored, maintained JavaScript adapted from the Paws implementation credited in [NOTICE](NOTICE). Old source-origin comments identify its provenance; no unavailable TypeScript source or compiler is needed to build this package.

## Responsibilities

- [Host entry](index.js): authenticated route registration, catalog projection, source configuration, and user actions.
- [Task workflow](task-workflow.js): read-only proposals, user confirmation, real delivery versions, conflict checks, and approval evidence.
- [Dialogue runtime](dialogue-runtime.js) and [tools](dialogue-tools.js): task-scoped native conversations and model operations; authority-granting confirmation and approval remain user-only.
- [File service](task-files.js) and [session history](task-sessions.js): bounded task reads and exact-directory native session discovery.
- [Client](client.js): workbench, native file tree, embedded native conversation, file reading, and explicit main-interface handoff.

## Verified by automated regression

The suite covers real temporary files and ProjectStore persistence, the actual HTTP and tool handlers, stale document and content versions, source rollback, task boundaries, symlink and file-size restrictions, exact session ownership, execution idempotency, and loss of submission receipts. User-journey cases cover direct execution recovery, preview after alignment, execution-intent transitions, running filters, image failures, keyboard tab navigation, and late read-only preview responses.

The tests do not start a real Agent or send a provider request. Source-driven callback tests validate state transitions and do not constitute browser or React rendering evidence.

## Runtime acceptance

After installation, verify the manager's application result, the live Host/Client registrations, and display resources. On an authenticated Harness page, exercise the task-to-chat-to-file-to-approval path, keyboard focus, narrow layouts, light/dark themes, and actual native reader handoff. Confirming a proposal must preserve the task status and existing authorization; simply opening history or a file must not submit a task.

Authenticated visual and live-model acceptance is separate from syntax, unit tests, package checks, or slot registration. Report unavailable browser access explicitly and never substitute a mock page screenshot for the installed interface.
