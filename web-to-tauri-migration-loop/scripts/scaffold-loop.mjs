#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {
    feature: "",
    webRoot: "packages/web/src",
    tauriRoot: "src-tauri/src",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--feature") args.feature = argv[++i] || "";
    else if (item === "--web-root") args.webRoot = argv[++i] || args.webRoot;
    else if (item === "--tauri-root") args.tauriRoot = argv[++i] || args.tauriRoot;
    else if (item === "--dry-run") args.dryRun = true;
    else if (item === "--help" || item === "-h") args.help = true;
  }
  return args;
}

function usage() {
  return `Usage:
  npx web-to-tauri-migration-loop-scaffold --feature <feature-name> [options]

Options:
  --web-root <path>      default: packages/web/src
  --tauri-root <path>    default: src-tauri/src
  --dry-run              print files only, no writes
  -h, --help             show help

Example:
  npx web-to-tauri-migration-loop-scaffold --feature registry-sync
`;
}

function assertFeatureName(name) {
  if (!name || !/^[a-z0-9-]+$/.test(name)) {
    throw new Error("feature name must match /^[a-z0-9-]+$/ (example: registry-sync)");
  }
}

function toCamelCase(kebab) {
  return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnakeCase(kebab) {
  return kebab.replace(/-/g, "_");
}

function writeFileSafe(filePath, content, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] ${filePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    console.log(`[skip] exists: ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`[create] ${filePath}`);
}

function renderTemplates({ feature, camel, snake, webRoot, tauriRoot }) {
  const featureDir = path.join(webRoot, "features", feature, "api");
  const tauriCommandPath = path.join(tauriRoot, "commands", `${feature}.rs`);
  const tauriTestPath = path.join(path.dirname(tauriRoot), "tests", `${feature}_smoke.rs`);
  const e2ePath = path.join("e2e", `${feature}.tauri-smoke.spec.ts`);

  const files = new Map();

  files.set(
    path.join(featureDir, "contract.ts"),
    `export interface ${camel[0].toUpperCase()}${camel.slice(1)}Input {
  // TODO: define input shape
}

export interface ${camel[0].toUpperCase()}${camel.slice(1)}Output {
  // TODO: define output shape
}

export interface ${camel[0].toUpperCase()}${camel.slice(1)}Api {
  run(input: ${camel[0].toUpperCase()}${camel.slice(1)}Input): Promise<${camel[0].toUpperCase()}${camel.slice(1)}Output>
}
`
  );

  files.set(
    path.join(featureDir, "transport.tauri.ts"),
    `import { invoke } from "@tauri-apps/api/core";
import type {
  ${camel[0].toUpperCase()}${camel.slice(1)}Api,
  ${camel[0].toUpperCase()}${camel.slice(1)}Input,
  ${camel[0].toUpperCase()}${camel.slice(1)}Output,
} from "./contract";

export const ${camel}TauriTransport: ${camel[0].toUpperCase()}${camel.slice(1)}Api = {
  async run(input: ${camel[0].toUpperCase()}${camel.slice(1)}Input): Promise<${camel[0].toUpperCase()}${camel.slice(1)}Output> {
    return invoke("${snake}", { input });
  },
};
`
  );

  files.set(
    path.join(featureDir, "transport.http.ts"),
    `import ky from "ky";
import type {
  ${camel[0].toUpperCase()}${camel.slice(1)}Api,
  ${camel[0].toUpperCase()}${camel.slice(1)}Input,
  ${camel[0].toUpperCase()}${camel.slice(1)}Output,
} from "./contract";

const client = ky.create({ prefixUrl: "/api" });

export const ${camel}HttpTransport: ${camel[0].toUpperCase()}${camel.slice(1)}Api = {
  async run(input: ${camel[0].toUpperCase()}${camel.slice(1)}Input): Promise<${camel[0].toUpperCase()}${camel.slice(1)}Output> {
    return client.post("${feature}", { json: input }).json<${camel[0].toUpperCase()}${camel.slice(1)}Output>();
  },
};
`
  );

  files.set(
    path.join(featureDir, "client.ts"),
    `import type { ${camel[0].toUpperCase()}${camel.slice(1)}Api } from "./contract";
import { ${camel}HttpTransport } from "./transport.http";
import { ${camel}TauriTransport } from "./transport.tauri";

function isTauriRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const runtime = window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
  return Boolean(runtime.__TAURI__ || runtime.__TAURI_INTERNALS__);
}

function assertNoSilentFallback(): void {
  if (isTauriRuntime() && typeof ${camel}TauriTransport.run !== "function") {
    throw new Error(
      "Tauri runtime detected but invoke transport unavailable. Stop instead of falling back to HTTP."
    );
  }
}

function resolveTransport(): ${camel[0].toUpperCase()}${camel.slice(1)}Api {
  assertNoSilentFallback();
  return isTauriRuntime() ? ${camel}TauriTransport : ${camel}HttpTransport;
}

export const ${camel}Api: ${camel[0].toUpperCase()}${camel.slice(1)}Api = {
  run(input) {
    return resolveTransport().run(input);
  },
};
`
  );

  files.set(
    path.join(featureDir, "__tests__", "runtime-selection.test.ts"),
    `import { describe, expect, it } from "vitest";

describe("${feature} runtime selection", () => {
  it("placeholder", () => {
    expect(true).toBe(true);
  });
});
`
  );

  files.set(
    tauriCommandPath,
    `use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ${camel[0].toUpperCase()}${camel.slice(1)}Input {
    // TODO: define input fields
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ${camel[0].toUpperCase()}${camel.slice(1)}Output {
    // TODO: define output fields
}

#[tauri::command]
pub async fn ${snake}(input: ${camel[0].toUpperCase()}${camel.slice(1)}Input) -> Result<${camel[0].toUpperCase()}${camel.slice(1)}Output, String> {
    let _ = input;
    Err("TODO: implement command body".to_string())
}
`
  );

  files.set(
    tauriTestPath,
    `#[test]
fn ${snake}_smoke_placeholder() {
    assert!(true);
}
`
  );

  files.set(
    e2ePath,
    `import { test, expect } from "@playwright/test";

test("${feature} tauri smoke placeholder", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page).toHaveTitle(/j-skills/i);
});
`
  );

  return files;
}

function printNextSteps(feature, snake) {
  console.log("");
  console.log("Next steps:");
  console.log(`1) Implement Rust command body in src-tauri/src/commands/${feature}.rs`);
  console.log(`2) Register command '${snake}' in src-tauri/src/main.rs generate_handler![]`);
  console.log(`3) Wire page/store usage to features/${feature}/api/client.ts only`);
  console.log("4) Add contract + command tests before extending e2e coverage");
  console.log("5) Run gates:");
  console.log("   cargo check --manifest-path src-tauri/Cargo.toml");
  console.log("   pnpm --filter @wangjs-jacky/j-skills-web build");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  assertFeatureName(args.feature);
  const feature = args.feature;
  const camel = toCamelCase(feature);
  const snake = toSnakeCase(feature);

  const files = renderTemplates({
    feature,
    camel,
    snake,
    webRoot: args.webRoot,
    tauriRoot: args.tauriRoot,
  });

  for (const [filePath, content] of files.entries()) {
    writeFileSafe(filePath, content, args.dryRun);
  }

  printNextSteps(feature, snake);
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
