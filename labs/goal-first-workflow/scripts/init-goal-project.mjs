#!/usr/bin/env node

import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const argumentsAfterScript = process.argv.slice(2);

if (argumentsAfterScript.length !== 1) {
  console.error("Usage: node init-goal-project.mjs <destination-directory>");
  process.exit(2);
}

const destination = resolve(argumentsAfterScript[0]);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const templateDirectory = resolve(scriptDirectory, "../assets/project-template");

try {
  const destinationMetadata = await stat(destination);
  if (!destinationMetadata.isDirectory()) {
    throw new Error(`Destination exists and is not a directory: ${destination}`);
  }

  const entries = await readdir(destination);
  if (entries.length > 0) {
    throw new Error(`Refusing to overwrite non-empty destination: ${destination}`);
  }
} catch (error) {
  if (error.code !== "ENOENT") {
    console.error(error.message);
    process.exit(1);
  }
}

await mkdir(destination, { recursive: true });
await mkdir(resolve(destination, "tasks"));
await mkdir(resolve(destination, "templates"));

for (const [source, output] of [
  ["AGENTS.template.md", "AGENTS.md"],
  ["PROMPT.template.md", "PROMPT.md"],
  ["problem.template.md", "problem.md"],
  ["task-index.template.md", "templates/task-index.template.md"],
  ["task-prompt.template.md", "templates/task-prompt.template.md"],
]) {
  await cp(resolve(templateDirectory, source), resolve(destination, output));
}

console.log(`Created goal workspace: ${destination}`);
console.log("Next: read PROMPT.md; verify goal confirmation before task preparation, show full task drafts and wait for the user's next step, then execute only tasks covered by an explicit user execution instruction.");
