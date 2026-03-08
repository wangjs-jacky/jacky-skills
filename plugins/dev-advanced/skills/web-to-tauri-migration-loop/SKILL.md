---
name: web-to-tauri-migration-loop
description: Drive Web-first to Tauri v2 migration with contract-first architecture, dual transport adapters, fail-fast runtime checks, and loop-based quality gates. Use when user mentions Tauri migration, dev:tauri crash, ECONNREFUSED, invoke/HTTP fallback, TDD strategy, e2e setup, or ralph loop workflows.
---

# Web to Tauri Migration Loop

Use this skill to migrate a Web-first app to Tauri v2 without "last-mile explosion".

## What This Skill Solves

- `pnpm dev:tauri` starts but app crashes or hangs
- Vite proxy `/api` works in web mode but fails in Tauri (`ECONNREFUSED`)
- Frontend pages are complete but Tauri commands are missing
- Type drift between TypeScript models and Rust structs
- Team wants TDD + e2e, but does not know where to place each test

## Core Principle

Do **not** migrate at the end in one shot.
Ship each feature in a **dual-path incremental loop**:

1. Contract first
2. Rust command scaffold
3. Frontend adapter integration
4. Runtime fail-fast guard
5. Layered tests
6. Gate checks before done

## Target Architecture (Final Code Shape)

Frontend pages must never call transport directly.

- `UI layer`: React pages/components
- `Domain API layer`: stable methods like `listSkills()`, `linkSkill()`
- `Transport layer`:
  - `tauriTransport` -> `invoke(...)`
  - `webTransport` -> HTTP client
- `Runtime selection`: one adapter entrypoint decides transport once
- `Rust command layer`: `#[tauri::command]` functions registered in `generate_handler!`

Mandatory rule:
- In Tauri runtime, do not silently fallback to HTTP.
- If Tauri transport unavailable, fail fast with clear error.

## Development Loop (Ralph-Ready)

Copy this checklist each loop iteration:

```txt
Loop Progress
- [ ] L1 Contract defined (request/response/error)
- [ ] L2 Rust command exists and registered
- [ ] L3 Frontend domain API wired to adapter
- [ ] L4 Tauri runtime uses invoke path only (no silent HTTP fallback)
- [ ] L5 Unit tests added (TS + Rust as needed)
- [ ] L6 Smoke e2e for critical path passed
- [ ] L7 Build gates passed (cargo check + web build)
- [ ] L8 Docs/changelog updated for real behavior
```

If any gate fails, do not mark loop complete.

## Step-by-Step Execution

### Step 1: Contract First

For each feature, write:
- method name
- input payload
- output payload
- error cases

Keep TypeScript and Rust names aligned (recommend camelCase on JSON boundary).

### Step 2: Rust First Skeleton

Before UI usage:
- add command in Rust
- register in `tauri::generate_handler![...]`
- return structured result (`Result<T, String>` or serializable app error)

### Step 3: Adapter Integration

Implement in domain API client:
- `if tauri => invoke`
- `else => HTTP`

Never call `invoke` or `fetch` directly in pages.

### Step 4: Fail-Fast Guard

In Tauri runtime:
- if invoke path is unavailable, throw explicit error
- do not fallback to `/api`

This prevents hidden regressions and random `ECONNREFUSED`.

### Step 5: Layered TDD Strategy

Use this test pyramid:

1. **Contract tests (TS, fast)**
   - validate adapter request/response shape
   - validate runtime selection logic
2. **Rust command tests (unit/integration)**
   - command behavior with temp dirs / mock data
3. **UI tests (component)**
   - mock domain API only, not transport
4. **Minimal e2e smoke (few high-value paths)**
   - app boots
   - one read path works (e.g. list)
   - one write path works (e.g. link/install)

Do not start with full e2e matrix. Start with 2-3 smoke cases.

### Step 6: Pre-Complete Gates

Always run:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
pnpm --filter <web-package-name> build
```

And verify:
- no `/api/*` requests when running inside Tauri for migrated features
- no unregistered command invocation errors

## Tauri Migration Anti-Patterns

- "Web feature complete, migrate all later"
- Pages directly using HTTP/invoke
- Runtime auto fallback from Tauri to HTTP
- Rust command implemented but not registered
- TS/Rust schema mismatch discovered only at runtime
- e2e-only strategy without lower-level tests

## Prompt Template for Each Loop

Use this prompt in automation loops:

```txt
Apply web-to-tauri-migration-loop for feature: <feature-name>.
Follow L1-L8 gates strictly.
Constraints:
1) Contract first, then Rust command, then adapter, then UI.
2) In Tauri runtime, forbid silent HTTP fallback.
3) Add tests at contract layer and command layer before e2e.
4) Run cargo check and web build; report exact failures if any.
Output:
- Changed files
- Gate checklist status
- Remaining risks
```

## Scaffold Templates (Executable)

Use the scaffold script to generate feature skeletons for Web + Tauri + tests:

```bash
npx web-to-tauri-migration-loop-scaffold --feature <feature-name>
```

Optional:

```bash
npx web-to-tauri-migration-loop-scaffold \
  --feature <feature-name> \
  --web-root packages/web/src \
  --tauri-root src-tauri/src \
  --dry-run
```

The script creates:
- `packages/web/src/features/<feature>/api/contract.ts`
- `packages/web/src/features/<feature>/api/transport.tauri.ts`
- `packages/web/src/features/<feature>/api/transport.http.ts`
- `packages/web/src/features/<feature>/api/client.ts`
- `packages/web/src/features/<feature>/api/__tests__/runtime-selection.test.ts`
- `src-tauri/src/commands/<feature>.rs`
- `src-tauri/tests/<feature>_smoke.rs`
- `e2e/<feature>.tauri-smoke.spec.ts`

After scaffolding, manually:
- implement command body
- register command in `generate_handler![]`
- wire UI/store to domain client
- pass L1-L8 gates

## Definition of Done

A feature is done only when:

- Same domain API works in both Web and Tauri modes
- Tauri path does not depend on HTTP proxy for migrated behavior
- Commands are registered and callable
- Contract, command, and smoke tests pass
- Build gates pass without manual patching

## Quick Troubleshooting Map

- `ECONNREFUSED /api/...` in Tauri:
  - Tauri runtime fell into HTTP path, fix adapter/runtime guard
- `Command not found`:
  - command missing in `generate_handler!`
- UI works in web, fails in tauri:
  - transport coupling in page or schema drift between TS/Rust
- Frequent loop regressions:
  - missing L1 contract gate or L4 fail-fast gate
