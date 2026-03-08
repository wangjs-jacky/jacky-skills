# Reference: Target Layout and Test Plan

## Recommended File Layout

```txt
packages/web/src/
  api/
    contract.ts            # domain types + method signatures
    transport/
      tauri.ts             # invoke-based transport
      http.ts              # web/http transport
    client.ts              # runtime selection + fail-fast guard
  pages/
    ...                    # only call client/domain methods

src-tauri/src/
  commands/
    skills.rs
    config.rs
  services/
    ...
  models/
    ...
  main.rs                  # command registration
```

## Recommended Test Layout

```txt
packages/web/
  src/api/__tests__/
    client.contract.test.ts
    runtime-selection.test.ts
  src/pages/**/__tests__/
    *.test.tsx

src-tauri/
  src/**/tests.rs          # unit tests
  tests/
    commands_smoke.rs      # integration tests

e2e/
  tauri-smoke.spec.ts      # boot + key flow smoke
```

## Minimal Gate Commands

```bash
# Backend correctness
cargo check --manifest-path src-tauri/Cargo.toml

# Frontend correctness
pnpm --filter @wangjs-jacky/j-skills-web build

# Optional tests
pnpm --filter @wangjs-jacky/j-skills-web test
cargo test --manifest-path src-tauri/Cargo.toml
```

## One-Command Scaffold

```bash
npx web-to-tauri-migration-loop-scaffold --feature registry-sync
```

Dry run:

```bash
npx web-to-tauri-migration-loop-scaffold --feature registry-sync --dry-run
```

## Fail-Fast Runtime Guard Example

```ts
function assertTauriTransportReady(isTauri: boolean, hasInvoke: boolean) {
  if (isTauri && !hasInvoke) {
    throw new Error(
      'Tauri runtime detected but invoke transport unavailable. Stop instead of falling back to HTTP.'
    )
  }
}
```

## E2E Scope Advice

- Keep e2e to 2-3 flows initially:
  - app boot
  - one read command
  - one write command
- Move most logic checks to contract/unit tests for speed and stability.
