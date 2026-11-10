// ../deepseek-goal-first-plugin/src/records/catalog.ts
import { readdir as readdir2, realpath, stat as stat3 } from "node:fs/promises";
import { basename as basename2, dirname as dirname2, join as join2, relative as relative2, resolve as resolve2, sep } from "node:path";
import { homedir } from "node:os";

// ../deepseek-goal-first-plugin/src/records/parser.ts
import { readdir, stat as stat2, lstat } from "node:fs/promises";
import { basename, dirname, extname, join, resolve, relative } from "node:path";
import { createHash } from "node:crypto";

// ../deepseek-goal-first-plugin/src/records/authorizedFiles.ts
import { constants } from "node:fs";
import { open, stat } from "node:fs/promises";
async function openAuthorizedFile(root, candidate, maxBytes) {
  const actual = await safePath(root, candidate);
  const handle = await open(actual, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const info = await handle.stat();
    if (!info.isFile()) throw new Error("Not a regular file");
    if (info.size > maxBytes) throw new Error(`File too large (maximum ${maxBytes} bytes)`);
    if (await safePath(root, candidate) !== actual) throw new Error("Source path changed");
    const named = await stat(actual);
    if (named.dev !== info.dev || named.ino !== info.ino || await safePath(root, candidate) !== actual) throw new Error("Source identity changed");
    return { handle, info, actual };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

// ../deepseek-goal-first-plugin/src/records/parser.ts
var MAX_DOCUMENT_BYTES = 256 * 1024;
var MAX_NAVIGATION = 24;
var MAX_TASKS = 200;
var MAX_METADATA_BYTES = 192 * 1024;
var statuses = /* @__PURE__ */ new Set(["pending", "running", "review", "done", "blocked"]);
var clipped = (value) => value.trim().slice(0, 2048);
var digest = (value) => createHash("sha256").update(value).digest("hex").slice(0, 24);
async function readBoundedFile(root, candidate, maxBytes) {
  const { handle, info } = await openAuthorizedFile(root, candidate, maxBytes);
  try {
    const buffer = Buffer.alloc(Math.min(info.size + 1, maxBytes + 1));
    let bytesRead = 0;
    while (bytesRead < buffer.length) {
      const chunk = await handle.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead);
      if (!chunk.bytesRead) break;
      bytesRead += chunk.bytesRead;
    }
    if (bytesRead > maxBytes || bytesRead > info.size) throw new Error("File grew while reading");
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}
async function readDocument(root, path) {
  return (await readBoundedFile(root, path, MAX_DOCUMENT_BYTES)).toString("utf8");
}
function titleOf(source) {
  return clipped(source.match(/^#\s+(.+)$/m)?.[1] || "");
}
function clean(value) {
  return clipped(value.replace(/^['"]|['"]$/g, "").replace(/\*\*/g, ""));
}
function fieldsOf(source, warn) {
  const result = {};
  if (source.startsWith("---\n") || source.startsWith("---\r\n")) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) {
      warn("Malformed task frontmatter");
      return {};
    }
    let listKey;
    let malformed = false;
    for (const line of match[1].split(/\r?\n/)) {
      if (!line.trim() || line.trim().startsWith("#")) continue;
      if (/^\s+-\s/.test(line) && listKey) {
        result[listKey].push(clean(line.replace(/^\s+-\s*/, "")));
        continue;
      }
      const field = line.match(/^([\w\u4e00-\u9fff]+):\s*(.*?)\s*$/);
      if (!field || /[\[\]{}]/.test(field[2])) {
        warn("Malformed or unsupported task frontmatter");
        malformed = true;
        if (field?.[1] === "status") result.status = "unknown";
        listKey = void 0;
        continue;
      }
      listKey = void 0;
      if (field[2] === "") {
        result[field[1]] = [];
        listKey = field[1];
      } else result[field[1]] = clean(field[2]);
    }
    if (malformed) result.status = "unknown";
  }
  for (const line of source.replace(/^---\r?\n[\s\S]*?\r?\n---/, "").split(/\r?\n/)) {
    const field = line.match(/^\s*(?:[-*]\s+)?(?:\*\*)?([\w\u4e00-\u9fff]+)(?:\*\*)?\s*[:：]\s*(.+)$/);
    if (field && field[1] !== "status" && !(field[1] in result)) result[field[1]] = clean(field[2]);
  }
  return result;
}
function scalar(fields, names) {
  for (const name of names) if (typeof fields[name] === "string") return fields[name];
  return void 0;
}
function section(source, names) {
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (!heading || !names.includes(heading[2].trim())) continue;
    let end = i + 1;
    while (end < lines.length && !new RegExp(`^#{1,${heading[1].length}}\\s`).test(lines[end])) end++;
    return clipped(lines.slice(i + 1, end).join("\n")) || void 0;
  }
  return void 0;
}
function items(fields, names, docs, headings) {
  for (const name of names) if (fields[name]) return (Array.isArray(fields[name]) ? fields[name] : [fields[name]]).slice(0, 30).map(clipped);
  for (const doc of docs) {
    const value = section(doc, headings);
    if (value) return value.split("\n").map((line) => line.replace(/^\s*(?:[-*]|\d+[.)、])\s*/, "").trim()).filter(Boolean).slice(0, 30).map(clipped);
  }
  return [];
}
function linksOf(source) {
  const result = [];
  const headings = [];
  for (const line of source.split(/\r?\n/)) {
    const h = line.match(/^(#{1,6})\s+(.+)/);
    if (h) {
      headings.length = h[1].length;
      headings[h[1].length - 1] = h[2];
    }
    const heading = headings.filter(Boolean).join(" / ");
    for (const match of line.matchAll(/(?<!!)\[([^\]]+)\]\((<[^>]+>|[^)]+)\)/g)) {
      const tail = line.slice((match.index || 0) + match[0].length).replace(/^\s*[:：]\s*/, "").trim();
      result.push({ name: clipped(match[1]), target: match[2].replace(/^<|>$/g, "").replace(/\s+"[^"]*"$/, ""), heading, line, description: tail ? clipped(tail) : void 0 });
    }
  }
  return result;
}
function localTarget(parent, target) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) return null;
  try {
    return resolve(dirname(parent), decodeURIComponent(target.split("#")[0]));
  } catch {
    return null;
  }
}
function artifactKind(path) {
  const extension = extname(path).toLowerCase();
  if ([".md", ".mdx", ".txt", ".json", ".jsonl", ".yaml", ".yml", ".csv", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".html", ".css", ".py", ".go", ".rs", ".sh", ".sql", ".toml", ".xml", ".log", ".svg"].includes(extension)) return "text";
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".heic"].includes(extension)) return "image";
  if ([".mp3", ".m4a", ".aac", ".wav", ".ogg", ".flac", ".opus"].includes(extension)) return "audio";
  if ([".mp4", ".webm", ".mov", ".m4v"].includes(extension)) return "video";
  if (extension === ".pdf") return "pdf";
  return "unsupported";
}
async function authorizedSourceParent(root, candidate, directories) {
  if (!within(root, candidate)) return void 0;
  if ((await lstat(candidate).catch(() => void 0))?.isSymbolicLink()) return void 0;
  let parent = dirname(candidate);
  while (within(root, parent)) {
    try {
      const actual = await safePath(root, parent);
      if (!(await stat2(actual)).isDirectory()) return void 0;
      let watched = actual;
      for (let depth = 0; depth < 40 && within(root, watched); depth++) {
        directories.add(watched);
        if (watched === root) break;
        watched = dirname(watched);
      }
      return join(actual, relative(parent, candidate));
    } catch (error) {
      if (error.code !== "ENOENT" || (await lstat(parent).catch(() => void 0))?.isSymbolicLink()) return void 0;
    }
    if (parent === root) break;
    parent = dirname(parent);
  }
  return void 0;
}
async function artifactsOf(root, taskPath, source, directories) {
  const artifacts = [];
  for (const link of linksOf(source)) {
    if (artifacts.length >= 50) break;
    const isContract = /^(PROMPT|AGENTS|problem|PROGRESS)\.md$/i.test(basename(link.target)) || /契约|合同|任务说明|执行依据|历史|参考|基准|计划|预期/.test(link.name) || /历史|参考|输入|契约|计划|预期|\b(?:references?|inputs?|contracts?|historical|baseline|planned|plans?|expected|future|proposals?)\b/i.test(link.heading + " " + link.name);
    const explicitOutput = /当前产物|实际(?:产物|产出|成果|交付)|阶段(?:产物|交付)|已(?:产出|交付|生成)|\b(?:actual\s+(?:outputs?|results?|deliverables?)|produced\s+(?:outputs?|files?|reports?)|outputs?|results?)\b/i.test(link.heading);
    if (/^https?:\/\//i.test(link.target)) {
      artifacts.push({ id: digest(link.target), name: link.name, url: link.target.slice(0, 8192), kind: /\/commit\/[0-9a-f]+/i.test(link.target) ? "commit" : "url", relation: !isContract && explicitOutput ? "output" : "reference", available: true, description: link.description });
      continue;
    }
    const path = localTarget(taskPath, link.target);
    if (!path || path === taskPath) continue;
    if (basename(path) === "index.md" && !within(dirname(taskPath), path)) continue;
    const id = digest(path);
    if (artifacts.some((a) => a.id === id)) continue;
    const relation = !isContract && explicitOutput && within(dirname(taskPath), path) ? "output" : "reference";
    const artifact = { id, kind: artifactKind(path), name: link.name, relation, available: false, description: link.description };
    try {
      const actual = await safePath(root, path);
      const info = await stat2(actual);
      if (info.isFile()) Object.assign(artifact, { path: actual, available: true, size: info.size, modifiedAt: info.mtimeMs });
    } catch {
      const registered = await authorizedSourceParent(root, path, directories);
      if (registered) artifact.path = registered;
    }
    if (artifact.available && artifact.path) await authorizedSourceParent(root, artifact.path, directories);
    artifacts.push(artifact);
  }
  return artifacts;
}
async function parseBoard(entry) {
  const { root, featurePath } = entry;
  const warnings = [];
  const warn = (message) => {
    if (warnings.length < 50 && !warnings.includes(message)) warnings.push(clipped(message));
  };
  const directories = /* @__PURE__ */ new Set([featurePath]);
  let bytesRead = 0;
  const load = async (path) => {
    if (bytesRead >= 8 * 1024 * 1024) throw new Error("Goal document budget exceeded");
    await authorizedSourceParent(root, path, directories);
    const text = await readDocument(root, path);
    bytesRead += Buffer.byteLength(text);
    directories.add(dirname(await safePath(root, path)));
    return text;
  };
  const featureIndex = join(featurePath, "index.md");
  const featureText = await load(featureIndex);
  const docs = [{ path: featureIndex, text: featureText }];
  const tasks = /* @__PURE__ */ new Map();
  const addTask = async (path, line = "") => {
    if (tasks.size >= MAX_TASKS) {
      warn("Task limit reached; board is truncated");
      return;
    }
    try {
      await authorizedSourceParent(root, path, directories);
      const actual = await safePath(root, path);
      if (!actual.includes("/tasks/") || basename(actual) !== "index.md") return;
      if (actual.slice(actual.lastIndexOf("/tasks/") + 7).split("/").length !== 2) return;
      const code = line.match(/\bG\d{2,}\b/)?.[0];
      const existing = tasks.get(actual);
      if (!existing) tasks.set(actual, { path: actual, code, batch: dirname(dirname(dirname(actual))) !== featurePath ? basename(dirname(dirname(dirname(actual)))) : void 0 });
      else if (code && !existing.code) existing.code = code;
    } catch {
      warn(`Unavailable task entry: ${basename(dirname(path))}`);
    }
  };
  for (let i = 0; i < docs.length && i < MAX_NAVIGATION; i++) {
    for (const link of linksOf(docs[i].text)) {
      const path = localTarget(docs[i].path, link.target);
      if (!path) continue;
      if (path.includes("/tasks/") && basename(path) === "index.md") {
        await addTask(path, link.line);
        continue;
      }
      if (path.includes("/tasks/") || extname(path).toLowerCase() !== ".md" || !within(root, path)) continue;
      const navigationName = basename(path);
      const isNavigation = /^(index|PROMPT|problem)\.md$/i.test(navigationName) || /任务(?:地图|总表|安排|导航|清单)|(?:task|goal)[-_ ]?(?:map|list|index|catalog)/i.test(navigationName) || /任务.*(?:地图|安排|导航|清单|候选|总表)/.test(link.name);
      if (!isNavigation) continue;
      if (!path.includes("/features/") || /历史|旧版|历史上下文/.test(link.name + basename(path))) continue;
      if (docs.some((doc) => doc.path === path) || docs.length >= MAX_NAVIGATION) continue;
      try {
        docs.push({ path, text: await load(path) });
      } catch {
        warn(`Unavailable navigation: ${basename(path)}`);
      }
    }
  }
  try {
    const folder = await safePath(root, join(featurePath, "tasks"));
    directories.add(folder);
    for (const name of (await readdir(folder)).sort().slice(0, MAX_TASKS)) if (name !== "templates") await addTask(join(folder, name, "index.md"));
  } catch {
  }
  const parsed = [];
  const allTasks = [...tasks.values()];
  const mappedTasks = allTasks.filter((task) => task.code);
  const seenCodes = /* @__PURE__ */ new Set();
  const authoritative = mappedTasks.length ? mappedTasks.filter((task) => {
    if (seenCodes.has(task.code)) {
      warn(`Duplicate global task mapping: ${task.code}`);
      return false;
    }
    seenCodes.add(task.code);
    return true;
  }) : allTasks;
  const ordered = authoritative.sort((a, b) => (a.code || "\uFFFF" + a.path).localeCompare(b.code || "\uFFFF" + b.path));
  for (const task of ordered) {
    try {
      const index = await load(task.path);
      const fields = fieldsOf(index, (message) => warn(`${basename(dirname(task.path))}: ${message}`));
      const promptPath = await safePath(root, join(dirname(task.path), "PROMPT.md")).catch(() => void 0);
      const prompt = promptPath ? await load(promptPath).catch((error) => {
        warn(`${basename(dirname(task.path))}: ${error.message}`);
        return "";
      }) : "";
      const promptFields = fieldsOf(prompt, () => {
      });
      const problemPath = join(dirname(task.path), "problem.md");
      const problemDoc = await load(problemPath).catch(() => "");
      const code = task.code || index.match(/全局\s*(G\d{2,})/)?.[1];
      const result = {
        id: digest(task.path),
        code,
        indexPath: task.path,
        promptPath,
        title: titleOf(index) || basename(dirname(task.path)),
        status: statuses.has(scalar(fields, ["status"]) || "") ? scalar(fields, ["status"]) : "unknown",
        goal: scalar(fields, ["goal", "\u76EE\u6807\u6458\u8981", "\u76EE\u6807"]) || section(index, ["\u76EE\u6807", "\u76EE\u6807\u6458\u8981"]) || scalar(promptFields, ["goal", "\u76EE\u6807"]) || section(prompt, ["\u76EE\u6807", "\u76EE\u6807\u4E0E\u8303\u56F4"]) || "",
        problem: scalar(fields, ["problem", "\u95EE\u9898", "\u8981\u89E3\u51B3\u7684\u95EE\u9898"]) || section(index, ["\u95EE\u9898", "\u8981\u89E3\u51B3\u7684\u95EE\u9898"]) || section(prompt, ["\u95EE\u9898", "\u8981\u89E3\u51B3\u7684\u95EE\u9898", "\u80CC\u666F\u4E0E\u95EE\u9898"]) || section(problemDoc, ["\u95EE\u9898", "\u8981\u89E3\u51B3\u7684\u95EE\u9898", "\u539F\u59CB\u95EE\u9898"]),
        stage: scalar(fields, ["stage", "\u9636\u6BB5", "\u5F53\u524D\u9636\u6BB5"]) || section(index, ["\u5F53\u524D\u9636\u6BB5", "\u9636\u6BB5"]),
        progress: scalar(fields, ["progress", "\u8FDB\u5EA6"]) || section(index, ["\u8FDB\u5EA6", "\u5F53\u524D\u8FDB\u5C55"]),
        nextStep: scalar(fields, ["nextStep", "next_step", "\u4E0B\u4E00\u6B65"]) || section(index, ["\u4E0B\u4E00\u6B65"]),
        dependencies: items(fields, ["dependencies", "\u4F9D\u8D56"], [index, prompt], ["\u4F9D\u8D56", "\u524D\u7F6E\u6761\u4EF6", "\u524D\u7F6E\u4F9D\u8D56"]),
        expectedDeliverables: items(fields, ["expectedDeliverables", "expected_deliverables", "\u9884\u671F\u4EA4\u4ED8\u7269"], [index, prompt], ["预期交付物","计划交付","预期产物","交付物"]),
        acceptanceCriteria: section(index, ["\u9A8C\u6536", "\u9A8C\u6536\u8981\u6C42", "\u9A8C\u6536\u65B9\u6CD5\u4E0E\u8BC1\u636E", "\u9A8C\u6536\u4E0E\u6743\u9650"]) || section(prompt, ["\u9A8C\u6536", "\u9A8C\u6536\u8981\u6C42", "\u9A8C\u6536\u65B9\u6CD5\u4E0E\u8BC1\u636E", "\u9A8C\u6536\u4E0E\u6743\u9650"]),
        artifacts: await artifactsOf(root, task.path, index, directories),
        batch: scalar(fields, ["batch", "\u6279\u6B21"]) || task.batch
      };
      for (const artifact of result.artifacts) if (artifact.path) directories.add(dirname(artifact.path));
      if (Buffer.byteLength(JSON.stringify(parsed)) + Buffer.byteLength(JSON.stringify(result)) > MAX_METADATA_BYTES) {
        warn("Snapshot size limit reached; board is truncated");
        break;
      }
      parsed.push(result);
    } catch (error) {
      warn(`${basename(dirname(task.path))}: ${error instanceof Error ? error.message : "Unreadable task"}`);
    }
  }
  if (directories.size > 400) warn("Watcher directory limit reached; use explicit refresh for unobserved artifact changes");
  const content = { featurePath, title: entry.title, projectTitle: entry.projectTitle, tasks: parsed, warnings };
  return { snapshot: { ...content, revision: digest(JSON.stringify(content)), updatedAt: Date.now() }, watchDirectories: [...directories].slice(0, 400) };
}

// ../deepseek-goal-first-plugin/src/records/catalog.ts
var MAX_CATALOG = 100;
function within(root, target) {
  const rel = relative2(root, target);
  return rel === "" || rel !== ".." && !rel.startsWith(`..${sep}`) && !rel.startsWith(sep);
}
async function safePath(root, candidate) {
  if (!within(root, resolve2(candidate))) throw new Error("Path escapes authorized Goal root");
  const actual = await realpath(candidate);
  if (!within(root, actual)) throw new Error("Symlink escapes authorized Goal root");
  return actual;
}
async function discoverRoots(workingDirectory, homeDirectory = homedir()) {
  const candidates = /* @__PURE__ */ new Set();
  for (const folder of [".codex/skills", ".claude/skills", ".agents/skills"]) candidates.add(join2(homeDirectory, folder, "goal-first-ops/projects"));
  let current = resolve2(workingDirectory);
  for (let depth = 0; depth < 40; depth++) {
    if (basename2(current) === "goal-first-ops") candidates.add(join2(current, "projects"));
    if (basename2(current) === "projects") candidates.add(current);
    for (const folder of [".codex/skills", ".claude/skills", ".agents/skills"]) candidates.add(join2(current, folder, "goal-first-ops/projects"));
    if (dirname2(current) === current) break;
    current = dirname2(current);
  }
  const roots = /* @__PURE__ */ new Set();
  for (const candidate of candidates) {
    try {
      const actual = await realpath(candidate);
      if ((await stat3(actual)).isDirectory()) roots.add(actual);
    } catch {
    }
  }
  return [...roots].sort();
}
async function readCatalog(roots) {
  const catalog = [];
  for (const root of roots) {
    const projects = (await readdir2(root)).sort().slice(0, MAX_CATALOG);
    for (const project of projects) {
      const projectPath = join2(root, project);
      let features;
      try {
        features = await safePath(root, join2(projectPath, "features"));
      } catch {
        continue;
      }
      let entries;
      try {
        entries = (await readdir2(features)).sort().slice(0, MAX_CATALOG);
      } catch {
        continue;
      }
      const projectText = await readDocument(root, join2(projectPath, "index.md")).catch(() => "");
      for (const feature of entries) {
        if (catalog.length >= MAX_CATALOG) return catalog;
        try {
          const featurePath = await safePath(root, join2(features, feature));
          if (!(await stat3(featurePath)).isDirectory()) continue;
          const source = await readDocument(root, join2(featurePath, "index.md"));
          if (catalog.some((entry) => entry.featurePath === featurePath)) continue;
          catalog.push({ root, featurePath, title: titleOf(source) || feature, projectTitle: titleOf(projectText) || project });
        } catch {
        }
      }
    }
  }
  return catalog;
}

// ../deepseek-goal-first-plugin/src/records/taskPrompt.ts
function goalBoardTaskPrompt(task, featurePath) {
  return [
    "Continue this Goal First task using its authoritative local records.",
    "First read the task index and full PROMPT, verify the existing user authorization, prerequisites and repository instructions. Task selection here does not authorize broader work. Do not change task status merely because this session was created.",
    `Feature: ${featurePath}`,
    `Task: ${task.code ? task.code + " " : ""}${task.title}`,
    `Task index: ${task.indexPath}`,
    task.promptPath ? `Full task instructions: ${task.promptPath}` : "",
    task.goal ? `Goal: ${task.goal}` : "",
    task.problem ? `Problem: ${task.problem}` : "",
    task.dependencies.length ? `Dependencies:
${task.dependencies.join("\n")}` : "",
    task.nextStep ? `Next step: ${task.nextStep}` : "",
    "Actual linked output files:",
    ...task.artifacts.filter((artifact) => artifact.relation === "output").map((artifact) => `${artifact.name}: ${artifact.path || artifact.url || "(unavailable original)"}${artifact.available ? "" : " (unavailable)"}`)
  ].filter(Boolean).join("\n\n").slice(0, 1e5);
}
export {
  digest,
  artifactsOf as readTaskArtifacts,
  discoverRoots,
  goalBoardTaskPrompt,
  parseBoard,
  readCatalog,
  readDocument,
  safePath,
  titleOf
};
