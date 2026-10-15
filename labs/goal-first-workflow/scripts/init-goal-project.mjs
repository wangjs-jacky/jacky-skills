#!/usr/bin/env node

import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const argumentsAfterScript = process.argv.slice(2);

if (argumentsAfterScript.length !== 1) {
  console.error("用法：node init-goal-project.mjs <目标目录>");
  process.exit(2);
}

const destination = resolve(argumentsAfterScript[0]);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const templateDirectory = resolve(scriptDirectory, "../assets/project-template");

try {
  const destinationMetadata = await stat(destination);
  if (!destinationMetadata.isDirectory()) {
    throw new Error(`目标位置已存在且不是目录：${destination}`);
  }

  const entries = await readdir(destination);
  if (entries.length > 0) {
    throw new Error(`拒绝覆盖非空目标目录：${destination}`);
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

console.log(`已创建目标工作区：${destination}`);
console.log("下一步：阅读 PROMPT.md，保存或复用有效目标确认；准备并展示完整任务草案后结束本轮，等待用户明确选择执行，仅推进授权范围。任务模板已保存在本地 templates/，不会自动创建任务或业务产物。");
