#!/usr/bin/env node

import { execFile as execFileCallback } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { createHash } from "node:crypto";
import {
  chmod,
  copyFile,
  link,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const MANIFEST_NAME = ".image-effects-export.json";
const MANIFEST_SCHEMA_VERSION = 1;
const SKILL_PREFIX = "skills/image-effects/";
const PUBLIC_TEMPLATE_PREFIX = `${SKILL_PREFIX}assets/public-repo/`;
const PUBLIC_TEMPLATE_MAP = new Map([
  ["README.md", "README.md"],
  ["README_CN.md", "README_CN.md"],
  ["LICENSE", "LICENSE"],
  ["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
  ["THIRD_PARTY_NOTICES.header.md", "THIRD_PARTY_NOTICES.header.md"],
  [".gitignore", ".gitignore"],
  [".github/workflows/pages.yml", ".github/workflows/pages.yml"],
]);
const EXACT_SKILL_FILES = new Set([
  "SKILL.md",
  "package.json",
  "package-lock.json",
]);
const SOURCE_ONLY_SKILL_FILES = new Set([
  "tests/downstream-sync-workflow.test.mjs",
]);
const SKILL_DIRECTORY_PREFIXES = [
  "agents/",
  "references/",
  "assets/previews/",
  "gallery/",
  "scripts/",
  "tests/",
];
const MANAGED_ROOT_FILES = new Set([
  "README.md",
  "README_CN.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "THIRD_PARTY_NOTICES.header.md",
  ".gitignore",
  "SKILL.md",
  "package.json",
  "package-lock.json",
]);
const MANAGED_ROOT_DIRECTORIES = new Set([
  ".github",
  "agents",
  "references",
  "assets",
  "gallery",
  "scripts",
  "tests",
]);
const MANAGED_NESTED_PREFIXES = [
  "agents/",
  "references/",
  "assets/previews/",
  "gallery/",
  "scripts/",
  "tests/",
];
// This lock serializes public-export maintenance only. Image generation has no global lock.
const EXPORT_LOCK_SUFFIX = ".image-effects-export.lock";
const ALLOWED_SYSTEM_ROOT_LINKS = new Set(["/etc", "/tmp", "/var"]);
const BINARY_PUBLIC_IMAGE_PATTERN =
  /^(?:assets\/previews|gallery\/media)\/.+\.(?:jpe?g|png)$/i;

function compareAscii(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`))
  );
}

function overlaps(left, right) {
  return isInside(left, right) || isInside(right, left);
}

async function pathExists(candidate) {
  try {
    await lstat(candidate);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function runGit(repositoryRoot, args, options = {}) {
  try {
    return await execFile("git", ["-C", repositoryRoot, ...args], {
      encoding: options.binary ? "buffer" : "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const wrapped = new Error(
      `Git command failed while preparing the public export: ${args[0]}`
    );
    wrapped.cause = error;
    throw wrapped;
  }
}

async function discoverSource(cwd) {
  const start = path.resolve(cwd);
  const repositoryRoot = (
    await runGit(start, ["rev-parse", "--show-toplevel"])
  ).stdout.trim();
  const canonicalRepositoryRoot = await realpath(repositoryRoot);
  const skillRoot = path.join(
    canonicalRepositoryRoot,
    ...SKILL_PREFIX.slice(0, -1).split("/")
  );
  const sourceCommit = (
    await runGit(canonicalRepositoryRoot, ["rev-parse", "HEAD"])
  ).stdout.trim();
  const statusOutput = (
    await runGit(canonicalRepositoryRoot, [
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
    ])
  ).stdout;
  if (statusOutput.length > 0) {
    throw new Error(
      "Source worktree must be completely clean before public export"
    );
  }

  const origin = (
    await runGit(canonicalRepositoryRoot, ["remote", "get-url", "origin"])
  ).stdout.trim();
  const sourceRepository = normalizeGitHubRepository(origin);
  return {
    repositoryRoot: canonicalRepositoryRoot,
    skillRoot,
    sourceCommit,
    sourceRepository,
  };
}

function normalizeGitHubRepository(origin) {
  const patterns = [
    /^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?$/,
    /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/,
    /^ssh:\/\/git@github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?$/,
  ];
  for (const pattern of patterns) {
    const match = origin.match(pattern);
    if (match) return `${match[1]}/${match[2]}`;
  }
  throw new Error("Origin must be a canonical GitHub owner/repository remote");
}

function mapSourcePath(sourcePath) {
  if (!sourcePath.startsWith(SKILL_PREFIX)) return null;
  const relativePath = sourcePath.slice(SKILL_PREFIX.length);
  if (relativePath.startsWith("assets/public-repo/")) {
    return (
      PUBLIC_TEMPLATE_MAP.get(
        relativePath.slice("assets/public-repo/".length)
      ) ?? null
    );
  }
  if (SOURCE_ONLY_SKILL_FILES.has(relativePath)) return null;
  if (EXACT_SKILL_FILES.has(relativePath)) return relativePath;
  if (
    SKILL_DIRECTORY_PREFIXES.some((prefix) => relativePath.startsWith(prefix))
  ) {
    return relativePath;
  }
  return null;
}

function assertSafeManagedPath(
  relativePath,
  label = "managed path",
  { allowDirectoryRoot = false, allowExportManifest = false } = {}
) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error(`Unsafe ${label}: path must be a non-empty string`);
  }
  if (
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath) ||
    relativePath.includes("\\") ||
    relativePath.includes("%") ||
    /[:*<>|?]/.test(relativePath) ||
    relativePath.includes("#") ||
    /["\u0000-\u001f]/.test(relativePath)
  ) {
    throw new Error(`Unsafe ${label}: ${JSON.stringify(relativePath)}`);
  }
  const segments = relativePath.split("/");
  if (
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        /[. ]$/.test(segment) ||
        /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment)
    )
  ) {
    throw new Error(`Unsafe ${label}: ${JSON.stringify(relativePath)}`);
  }
  const allowed =
    MANAGED_ROOT_FILES.has(relativePath) ||
    (allowExportManifest && relativePath === MANIFEST_NAME) ||
    relativePath === ".github/workflows/pages.yml" ||
    MANAGED_NESTED_PREFIXES.some((prefix) => relativePath.startsWith(prefix)) ||
    (allowDirectoryRoot &&
      (MANAGED_ROOT_DIRECTORIES.has(relativePath) ||
        ".github/workflows/pages.yml".startsWith(`${relativePath}/`) ||
        MANAGED_NESTED_PREFIXES.some((prefix) =>
          prefix.startsWith(`${relativePath}/`)
        )));
  if (!allowed) {
    throw new Error(`Unsafe ${label}: path is outside the export namespace`);
  }
  return relativePath;
}

function scanPublicContent(relativePath, bytes) {
  if (BINARY_PUBLIC_IMAGE_PATTERN.test(relativePath)) return;
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    const wrapped = new Error(
      `Unsafe public text in ${relativePath}: content must be valid UTF-8`
    );
    wrapped.cause = error;
    throw wrapped;
  }
  const withoutHttpUrls = text.replace(
    /(?<![A-Za-z0-9+.-])https?:\/\/[^\s"'`<>?#]+/gi,
    (candidate) => {
      if (!/^https?:\/\/[^/\\?#]+(?:\/[^\\?#]*)?$/i.test(candidate)) {
        return candidate;
      }
      try {
        const parsed = new URL(candidate);
        if (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          parsed.host !== ""
        ) {
          return " ".repeat(candidate.length);
        }
      } catch {
        // 仅排除 URL 解析确认含 authority 的 HTTP(S) 片段。
      }
      return candidate;
    }
  );
  const rules = [
    {
      pattern: /[\\/](?:Users|home)[\\/][^\\/\s"'`<>]+(?:[\\/]|$)/i,
      message: "absolute user path",
      content: withoutHttpUrls,
    },
    {
      pattern:
        /(?:^|[^A-Za-z0-9_/])[A-Za-z]:[\\/]Users[\\/][^\\/\s"'`<>]+(?:[\\/]|$)/im,
      message: "absolute user path",
      content: withoutHttpUrls,
    },
    {
      pattern: /(?:sandbox:)?\/mnt\/data\/|attachment:\/\//i,
      message: "attachment path",
    },
    {
      pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
      message: "private key",
    },
    {
      pattern:
        /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
      message: "secret token",
    },
    {
      pattern:
        /\bAKIA[0-9A-Z]{16}\b|\bsk-[A-Za-z0-9_-]{20,}\b|\bnpm_[A-Za-z0-9]{20,}\b|\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
      message: "secret token",
    },
  ];
  for (const rule of rules) {
    if (rule.pattern.test(rule.content ?? text)) {
      throw new Error(
        `Unsafe public content in ${relativePath}: ${rule.message}`
      );
    }
  }
  const forbiddenAttributes = [
    ["Trip", ".", "com"].join(""),
    ["Ct", "rip"].join(""),
    ["x", "Taro"].join(""),
    ["Test", "Hub"].join(""),
    ["jest", "-", "utils"].join(""),
    ["C", "R", "N"].join(""),
  ];
  const lowerText = text.toLowerCase();
  if (
    forbiddenAttributes.some((term) => lowerText.includes(term.toLowerCase()))
  ) {
    throw new Error(
      `Unsafe public content in ${relativePath}: forbidden company or internal attribute`
    );
  }
}

async function readSourceTree(source) {
  const treeOutput = (
    await runGit(
      source.repositoryRoot,
      [
        "ls-tree",
        "-r",
        "-z",
        source.sourceCommit,
        "--",
        SKILL_PREFIX.slice(0, -1),
      ],
      { binary: true }
    )
  ).stdout;
  const entries = [];
  for (const rawEntry of treeOutput.toString("utf8").split("\0")) {
    if (!rawEntry) continue;
    const match = rawEntry.match(/^(\d+) ([^ ]+) ([0-9a-f]+)\t([\s\S]+)$/);
    if (!match) throw new Error("Unexpected git ls-tree output");
    const [, mode, type, , sourcePath] = match;
    const outputPath = mapSourcePath(sourcePath);
    if (outputPath === null) continue;
    assertSafeManagedPath(outputPath, "export path");
    if (type !== "blob" || (mode !== "100644" && mode !== "100755")) {
      throw new Error(
        `Selected source entry must be a regular Git file, not a symbolic link or mode ${mode}: ${sourcePath}`
      );
    }
    entries.push({ sourcePath, outputPath, mode });
  }

  const requiredSourcePaths = [
    `${SKILL_PREFIX}SKILL.md`,
    ...[...PUBLIC_TEMPLATE_MAP.keys()].map(
      (relativePath) => `${PUBLIC_TEMPLATE_PREFIX}${relativePath}`
    ),
  ];
  for (const requiredPath of requiredSourcePaths) {
    if (!entries.some(({ sourcePath }) => sourcePath === requiredPath)) {
      throw new Error(
        `Required public export source is missing from HEAD: ${requiredPath}`
      );
    }
  }

  entries.sort((left, right) =>
    compareAscii(left.outputPath, right.outputPath)
  );
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1].outputPath === entries[index].outputPath) {
      throw new Error(
        `Duplicate public export path: ${entries[index].outputPath}`
      );
    }
  }

  const files = [];
  for (const entry of entries) {
    const bytes = (
      await runGit(
        source.repositoryRoot,
        ["show", `${source.sourceCommit}:${entry.sourcePath}`],
        { binary: true }
      )
    ).stdout;
    scanPublicContent(entry.outputPath, bytes);
    files.push({
      path: entry.outputPath,
      bytes,
      mode: entry.mode === "100755" ? 0o755 : 0o644,
      sha256: sha256(bytes),
    });
  }
  return files;
}

function renderManifest(source, files) {
  return Buffer.from(
    `${JSON.stringify(
      {
        schemaVersion: MANIFEST_SCHEMA_VERSION,
        sourceRepository: source.sourceRepository,
        sourceCommit: source.sourceCommit,
        files: files.map(({ path: filePath, sha256: digest }) => ({
          path: filePath,
          sha256: digest,
        })),
      },
      null,
      2
    )}\n`
  );
}

async function nearestExistingPath(candidate) {
  const missingSegments = [];
  let current = candidate;
  while (!(await pathExists(current))) {
    const parent = path.dirname(current);
    if (parent === current) throw new Error("Unable to resolve target parent");
    missingSegments.unshift(path.basename(current));
    current = parent;
  }
  return { existing: current, missingSegments };
}

async function assertNoUserSymlinkComponents(candidate) {
  const root = path.parse(candidate).root;
  let current = root;
  const relative = path.relative(root, candidate);
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    let stats;
    try {
      stats = await lstat(current);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return;
      throw error;
    }
    if (stats.isSymbolicLink() && !ALLOWED_SYSTEM_ROOT_LINKS.has(current)) {
      throw new Error(
        `Target path contains a symbolic link component: ${current}`
      );
    }
  }
}

async function resolveTarget(target, source) {
  if (typeof target !== "string" || !path.isAbsolute(target)) {
    throw new Error("Target must be an absolute path");
  }
  if (path.resolve(target) !== target) {
    throw new Error(
      "Target must be a canonical absolute path without dot segments or trailing separators"
    );
  }
  await assertNoUserSymlinkComponents(target);
  const { existing, missingSegments } = await nearestExistingPath(target);
  const existingStats = await lstat(existing);
  if (existingStats.isSymbolicLink()) {
    throw new Error(
      "Target and its nearest existing parent must not be a symbolic link"
    );
  }
  if (!existingStats.isDirectory()) {
    throw new Error("Target parent must be a directory");
  }
  const canonicalExisting = await realpath(existing);
  const canonicalTarget = path.join(canonicalExisting, ...missingSegments);
  const filesystemRoot = path.parse(canonicalTarget).root;
  const canonicalHome = await realpath(homedir());
  if (canonicalTarget === filesystemRoot)
    throw new Error("Unsafe target: filesystem root");
  if (canonicalTarget === canonicalHome)
    throw new Error("Unsafe target: home directory");
  if (
    overlaps(canonicalTarget, source.repositoryRoot) ||
    overlaps(canonicalTarget, source.skillRoot)
  ) {
    throw new Error(
      "Unsafe target: target overlaps the source repository or Skill source"
    );
  }
  return {
    target,
    canonicalTarget,
    parent: path.dirname(target),
  };
}

function parseManifest(bytes) {
  let manifest;
  try {
    manifest = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("Export manifest is not valid JSON");
  }
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest) ||
    Object.keys(manifest).sort().join(",") !==
      "files,schemaVersion,sourceCommit,sourceRepository" ||
    manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(
      manifest.sourceRepository ?? ""
    ) ||
    !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(manifest.sourceCommit ?? "") ||
    !Array.isArray(manifest.files)
  ) {
    throw new Error("Export manifest has an invalid schema");
  }
  const seen = new Set();
  let previousPath;
  for (const item of manifest.files) {
    if (
      item === null ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      Object.keys(item).sort().join(",") !== "path,sha256" ||
      !/^[0-9a-f]{64}$/.test(item.sha256 ?? "")
    ) {
      throw new Error("Export manifest contains an invalid file entry");
    }
    assertSafeManagedPath(item.path, "manifest path");
    if (seen.has(item.path))
      throw new Error(`Export manifest has a duplicate path: ${item.path}`);
    if (
      previousPath !== undefined &&
      compareAscii(previousPath, item.path) >= 0
    ) {
      throw new Error("Export manifest file paths must be sorted");
    }
    seen.add(item.path);
    previousPath = item.path;
  }
  return manifest;
}

function fileIdentity(stats) {
  return { device: stats.dev, inode: stats.ino };
}

function hasFileIdentity(stats, identity) {
  return stats.dev === identity.device && stats.ino === identity.inode;
}

async function assertTargetRootIdentity(targetContext, expectedIdentity) {
  await assertNoUserSymlinkComponents(targetContext.target);
  let stats;
  try {
    stats = await lstat(targetContext.target);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("Target root disappeared during export");
    }
    throw error;
  }
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(
      "Target root identity is unsafe: expected a real directory"
    );
  }
  if (
    (await realpath(targetContext.target)) !== targetContext.canonicalTarget
  ) {
    throw new Error("Target canonical path changed during export");
  }
  if (expectedIdentity && !hasFileIdentity(stats, expectedIdentity)) {
    throw new Error("Target root identity changed during export");
  }
  return fileIdentity(stats);
}

async function inspectWithinTarget(
  targetContext,
  relativePath,
  expectedLeaf = "file",
  rootIdentity
) {
  assertSafeManagedPath(relativePath, "managed path", {
    allowDirectoryRoot: expectedLeaf === "directory",
    allowExportManifest: relativePath === MANIFEST_NAME,
  });
  await assertTargetRootIdentity(targetContext, rootIdentity);
  let current = targetContext.target;
  const segments = relativePath.split("/");
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    let stats;
    try {
      stats = await lstat(current);
    } catch (error) {
      if (error.code === "ENOENT") return { exists: false, path: current };
      if (error.code === "ENOTDIR") {
        throw new Error(
          `Unsafe managed path ${relativePath}: parent is not a directory`
        );
      }
      throw error;
    }
    if (stats.isSymbolicLink()) {
      throw new Error(
        `Unsafe managed path ${relativePath}: symbolic links are not allowed`
      );
    }
    const canonical = await realpath(current);
    if (!isInside(targetContext.canonicalTarget, canonical)) {
      throw new Error(
        `Unsafe managed path ${relativePath}: resolved outside target`
      );
    }
    const leaf = index === segments.length - 1;
    if (!leaf && !stats.isDirectory()) {
      throw new Error(
        `Unsafe managed path ${relativePath}: parent is not a directory`
      );
    }
    if (leaf && expectedLeaf === "file" && !stats.isFile()) {
      throw new Error(
        `Unsafe managed path ${relativePath}: expected a regular file`
      );
    }
    if (leaf && expectedLeaf === "directory" && !stats.isDirectory()) {
      throw new Error(
        `Unsafe managed path ${relativePath}: expected a directory`
      );
    }
  }
  return { exists: true, path: current };
}

async function verifyManifestFiles(targetContext, manifest) {
  for (const item of manifest.files) {
    const inspected = await inspectWithinTarget(
      targetContext,
      item.path,
      "file"
    );
    if (!inspected.exists)
      throw new Error(`Export manifest managed file is missing: ${item.path}`);
    const digest = sha256(await readFile(inspected.path));
    if (digest !== item.sha256) {
      throw new Error(
        `Export manifest hash mismatch for managed file: ${item.path}`
      );
    }
  }
}

async function assertTargetGitRepository(target) {
  const gitMarker = path.join(target, ".git");
  let markerStats;
  try {
    markerStats = await lstat(gitMarker);
  } catch (error) {
    if (error.code === "ENOENT")
      throw new Error("Existing export target must contain a .git repository");
    throw error;
  }
  if (
    markerStats.isSymbolicLink() ||
    (!markerStats.isDirectory() && !markerStats.isFile())
  ) {
    throw new Error("Existing export target .git must not be a symbolic link");
  }
  const gitRoot = (
    await runGit(target, ["rev-parse", "--show-toplevel"])
  ).stdout.trim();
  if ((await realpath(gitRoot)) !== (await realpath(target))) {
    throw new Error(
      "Existing export target must be the root of its Git repository"
    );
  }
}

async function preflightTarget(targetContext, desiredFiles, { check }) {
  if (!(await pathExists(targetContext.target))) {
    if (check) throw new Error("Check target does not exist");
    return { kind: "new", manifest: null };
  }
  await assertTargetRootIdentity(targetContext);

  const names = await readdir(targetContext.target);
  if (names.length === 0) {
    if (check) throw new Error("Check target has no export manifest");
    return { kind: "empty", manifest: null };
  }
  const manifestPath = path.join(targetContext.target, MANIFEST_NAME);
  if (!(await pathExists(manifestPath))) {
    throw new Error("Non-empty target requires a valid export manifest");
  }
  const manifestStats = await lstat(manifestPath);
  if (manifestStats.isSymbolicLink() || !manifestStats.isFile()) {
    throw new Error(
      "Export manifest must be a regular file, not a symbolic link"
    );
  }
  const manifest = parseManifest(await readFile(manifestPath));

  if (!check) {
    await assertTargetGitRepository(targetContext.target);
    const statusOutput = (
      await runGit(targetContext.target, [
        "status",
        "--porcelain=v1",
        "-z",
        "--untracked-files=all",
      ])
    ).stdout;
    if (statusOutput.length > 0) {
      throw new Error(
        "Existing target Git worktree must be completely clean before export"
      );
    }
  }
  await verifyManifestFiles(targetContext, manifest);

  const oldPaths = new Set(
    manifest.files.map(({ path: filePath }) => filePath)
  );
  if (!check) {
    for (const file of desiredFiles) {
      const inspected = await inspectWithinTarget(
        targetContext,
        file.path,
        "file"
      );
      if (inspected.exists && !oldPaths.has(file.path)) {
        throw new Error(
          `Refusing to replace unmanaged target path: ${file.path}`
        );
      }
      await inspectDesiredParents(targetContext, file.path);
    }
  }
  return { kind: "existing", manifest };
}

async function inspectDesiredParents(
  targetContext,
  relativePath,
  rootIdentity
) {
  const segments = relativePath.split("/");
  for (let index = 1; index < segments.length; index += 1) {
    const parentPath = segments.slice(0, index).join("/");
    const inspected = await inspectWithinTarget(
      targetContext,
      parentPath,
      "directory",
      rootIdentity
    );
    if (!inspected.exists) return;
  }
}

async function listTargetFiles(target) {
  const files = [];
  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (prefix === "" && entry.name === ".git") continue;
      const relativePath = path.posix.join(prefix, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        files.push({ path: relativePath, type: "symlink" });
      } else if (entry.isDirectory()) {
        await visit(absolutePath, relativePath);
      } else if (entry.isFile()) {
        files.push({ path: relativePath, type: "file" });
      } else {
        files.push({ path: relativePath, type: "other" });
      }
    }
  }
  await visit(target);
  return files.sort((left, right) => compareAscii(left.path, right.path));
}

function parseNullTerminatedGitPaths(bytes, label) {
  if (!Buffer.isBuffer(bytes)) {
    throw new Error(`Unexpected ${label} Git path output`);
  }
  const paths = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] !== 0) continue;
    const rawPath = bytes.subarray(start, index);
    if (rawPath.length > 0) {
      try {
        paths.push(new TextDecoder("utf-8", { fatal: true }).decode(rawPath));
      } catch (error) {
        const wrapped = new Error(
          `Unsafe ${label} Git path: path must be valid UTF-8`
        );
        wrapped.cause = error;
        throw wrapped;
      }
    }
    start = index + 1;
  }
  if (start !== bytes.length) {
    throw new Error(`Unexpected non-NUL-terminated ${label} Git path output`);
  }
  return paths;
}

function parseSingleStagedIndexEntry(bytes, expectedPath) {
  if (
    !Buffer.isBuffer(bytes) ||
    bytes.length === 0 ||
    bytes[bytes.length - 1] !== 0
  ) {
    throw new Error(
      `Public export check found a missing or malformed staged index entry: ${expectedPath}`
    );
  }
  const record = bytes.subarray(0, bytes.length - 1);
  if (record.includes(0)) {
    throw new Error(
      `Public export check found multiple staged index entries: ${expectedPath}`
    );
  }
  const separator = record.indexOf(0x09);
  if (separator < 0) {
    throw new Error(
      `Public export check found a malformed staged index entry: ${expectedPath}`
    );
  }

  let header;
  let relativePath;
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    header = decoder.decode(record.subarray(0, separator));
    relativePath = decoder.decode(record.subarray(separator + 1));
  } catch (error) {
    const wrapped = new Error(
      `Public export check found invalid UTF-8 in a staged index entry: ${expectedPath}`
    );
    wrapped.cause = error;
    throw wrapped;
  }

  const match = /^([0-7]{6}) ([0-9a-f]{40,64}) ([0-3])$/.exec(header);
  if (!match || match[3] !== "0" || relativePath !== expectedPath) {
    throw new Error(
      `Public export check found a malformed staged index entry: ${expectedPath}`
    );
  }
  return { mode: match[1] };
}

function expectedGitMode(file) {
  if (file.mode === 0o644) return "100644";
  if (file.mode === 0o755) return "100755";
  throw new Error(`Unsupported expected export mode: ${file.path}`);
}

function filesystemGitMode(stats) {
  return (stats.mode & 0o111) === 0 ? "100644" : "100755";
}

async function assertStagedIndexEntryMatches(target, expectedFile) {
  const indexOutput = (
    await runGit(
      target,
      ["ls-files", "--stage", "-z", "--", `:(literal)${expectedFile.path}`],
      { binary: true }
    )
  ).stdout;
  const entry = parseSingleStagedIndexEntry(indexOutput, expectedFile.path);
  const expectedMode = expectedGitMode(expectedFile);
  if (entry.mode !== expectedMode) {
    throw new Error(
      `Public export check found staged index mode/type mismatch: ${expectedFile.path} (expected ${expectedMode}, found ${entry.mode})`
    );
  }
  await assertStagedIndexBlobMatches(
    target,
    expectedFile.path,
    expectedFile.bytes
  );
}

async function assertStagedIndexBlobMatches(
  target,
  relativePath,
  expectedBytes
) {
  let indexBytes;
  try {
    indexBytes = (
      await runGit(target, ["show", `:${relativePath}`], { binary: true })
    ).stdout;
  } catch (error) {
    const wrapped = new Error(
      `Public export check found a missing or deleted staged index blob: ${relativePath}`
    );
    wrapped.cause = error;
    throw wrapped;
  }
  if (!indexBytes.equals(expectedBytes)) {
    throw new Error(
      `Public export check found staged index content mismatch: ${relativePath}`
    );
  }
}

async function assertCheckGitPathsAreManaged(target, expectedFiles) {
  if (!(await pathExists(path.join(target, ".git")))) return;
  await assertTargetGitRepository(target);
  const expectedByPath = new Map(
    expectedFiles.map((file) => [file.path, file])
  );
  const stagedOutput = (
    await runGit(
      target,
      ["diff", "--cached", "--name-only", "--no-renames", "-z", "--"],
      { binary: true }
    )
  ).stdout;
  for (const changedPath of parseNullTerminatedGitPaths(
    stagedOutput,
    "staged index"
  )) {
    const expectedFile = expectedByPath.get(changedPath);
    if (expectedFile === undefined) {
      throw new Error("Public export check found unmanaged staged index path");
    }
    await assertStagedIndexEntryMatches(target, expectedFile);
  }

  const worktreeCommands = [
    {
      label: "unstaged worktree",
      args: ["diff", "--name-only", "--no-renames", "-z", "--"],
    },
    {
      label: "untracked worktree",
      args: ["ls-files", "--others", "--exclude-standard", "-z", "--"],
    },
  ];
  for (const command of worktreeCommands) {
    const output = (
      await runGit(target, command.args, {
        binary: true,
      })
    ).stdout;
    for (const changedPath of parseNullTerminatedGitPaths(
      output,
      command.label
    )) {
      if (!expectedByPath.has(changedPath)) {
        throw new Error(
          `Public export check found unmanaged ${command.label} path`
        );
      }
    }
  }
}

async function checkTarget(targetContext, source, desiredFiles, manifestBytes) {
  const preflight = await preflightTarget(targetContext, desiredFiles, {
    check: true,
  });
  if (preflight.kind !== "existing")
    throw new Error("Check target has no prior export");
  const actualPaths = await listTargetFiles(targetContext.target);
  const expectedPaths = [
    ...desiredFiles.map(({ path: filePath }) => filePath),
    MANIFEST_NAME,
  ].sort(compareAscii);
  const expectedFiles = [
    ...desiredFiles,
    { path: MANIFEST_NAME, bytes: manifestBytes, mode: 0o644 },
  ];
  await assertCheckGitPathsAreManaged(targetContext.target, expectedFiles);
  if (
    actualPaths.some(({ type }) => type !== "file") ||
    actualPaths.map(({ path: filePath }) => filePath).join("\0") !==
      expectedPaths.join("\0")
  ) {
    throw new Error(
      "Public export check found missing, unexpected, or unmanaged target paths"
    );
  }
  for (const file of expectedFiles) {
    const stats = await lstat(
      path.join(targetContext.target, ...file.path.split("/"))
    );
    const actualMode = filesystemGitMode(stats);
    const expectedMode = expectedGitMode(file);
    if (actualMode !== expectedMode) {
      throw new Error(
        `Public export check found worktree executable mode mismatch: ${file.path} (expected ${expectedMode}, found ${actualMode})`
      );
    }
  }
  for (const file of desiredFiles) {
    const actual = await readFile(
      path.join(targetContext.target, ...file.path.split("/"))
    );
    if (!actual.equals(file.bytes)) {
      throw new Error(`Public export check content mismatch: ${file.path}`);
    }
  }
  const actualManifest = await readFile(
    path.join(targetContext.target, MANIFEST_NAME)
  );
  if (!actualManifest.equals(manifestBytes)) {
    throw new Error(
      `Public export check manifest mismatch for source commit ${source.sourceCommit}`
    );
  }
}

async function acquireLock(targetContext) {
  const lockPath = path.join(
    targetContext.parent,
    `${path.basename(targetContext.target)}${EXPORT_LOCK_SUFFIX}`
  );
  let handle;
  try {
    handle = await open(lockPath, "wx", 0o600);
    await handle.writeFile(
      `image-effects public export maintenance ${process.pid}\n`
    );
  } catch (error) {
    await handle?.close().catch(() => {});
    if (error.code === "EEXIST") {
      throw new Error(
        "A public export maintenance lock is already in progress for this target"
      );
    }
    throw error;
  }
  return { lockPath, handle };
}

async function releaseLock(lock) {
  let releaseError;
  try {
    await lock.handle.close();
  } catch (error) {
    releaseError = error;
  }
  try {
    await unlink(lock.lockPath);
  } catch (error) {
    if (error.code !== "ENOENT") releaseError ??= error;
  }
  if (releaseError) throw releaseError;
}

async function writeStage(targetContext, desiredFiles, manifestBytes) {
  const stageRoot = await mkdtemp(
    path.join(
      targetContext.parent,
      `.${path.basename(targetContext.target)}.image-effects-export-`
    )
  );
  const stagedFiles = [
    ...desiredFiles,
    { path: MANIFEST_NAME, bytes: manifestBytes, mode: 0o644 },
  ];
  try {
    for (const file of stagedFiles) {
      const destination = path.join(
        stageRoot,
        "files",
        ...file.path.split("/")
      );
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, file.bytes, { mode: file.mode });
      await chmod(destination, file.mode);
    }
    for (const file of desiredFiles) {
      const staged = await readFile(
        path.join(stageRoot, "files", ...file.path.split("/"))
      );
      if (sha256(staged) !== file.sha256)
        throw new Error(`Staged export hash mismatch: ${file.path}`);
    }
    if (
      !(await readFile(path.join(stageRoot, "files", MANIFEST_NAME))).equals(
        manifestBytes
      )
    ) {
      throw new Error("Staged export manifest mismatch");
    }
    return stageRoot;
  } catch (error) {
    await rm(stageRoot, { recursive: true, force: true });
    throw error;
  }
}

async function ensureDestinationDirectories(
  targetContext,
  relativePath,
  createdDirectories,
  rootIdentity
) {
  const segments = relativePath.split("/").slice(0, -1);
  let relative = "";
  for (const segment of segments) {
    relative = relative ? `${relative}/${segment}` : segment;
    const inspected = await inspectWithinTarget(
      targetContext,
      relative,
      "directory",
      rootIdentity
    );
    if (inspected.exists) continue;
    await assertTargetRootIdentity(targetContext, rootIdentity);
    await mkdir(inspected.path);
    const created = await inspectWithinTarget(
      targetContext,
      relative,
      "directory",
      rootIdentity
    );
    createdDirectories.push({
      path: created.path,
      relativePath: relative,
      identity: fileIdentity(await lstat(created.path)),
    });
  }
}

async function backupFile(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    await link(source, destination);
  } catch (error) {
    if (
      !["EPERM", "EACCES", "ENOTSUP", "EOPNOTSUPP", "EXDEV"].includes(
        error.code
      )
    )
      throw error;
    await copyFile(source, destination, fsConstants.COPYFILE_EXCL);
  }
}

async function assertManagedLeafState(
  targetContext,
  rootIdentity,
  relativePath,
  { exists, identity, expectedLeaf = "file" }
) {
  const inspected = await inspectWithinTarget(
    targetContext,
    relativePath,
    expectedLeaf,
    rootIdentity
  );
  if (inspected.exists !== exists) {
    throw new Error(
      `Managed path state changed during export: ${relativePath}`
    );
  }
  if (exists && identity) {
    const stats = await lstat(inspected.path);
    if (!hasFileIdentity(stats, identity)) {
      throw new Error(
        `Managed path identity changed during export: ${relativePath}`
      );
    }
  }
  return inspected;
}

async function rollbackTransaction({
  targetContext,
  rootIdentity,
  replacements,
  staleMoves,
  createdDirectories,
  createdTarget,
}) {
  const rollbackErrors = [];
  for (const stale of [...staleMoves].reverse()) {
    try {
      await assertManagedLeafState(
        targetContext,
        rootIdentity,
        stale.relativePath,
        { exists: false }
      );
      await rename(stale.backup, stale.target);
    } catch (error) {
      rollbackErrors.push(error);
    }
  }
  for (const replacement of [...replacements].reverse()) {
    try {
      await assertManagedLeafState(
        targetContext,
        rootIdentity,
        replacement.relativePath,
        { exists: true, identity: replacement.installedIdentity }
      );
      if (replacement.backup) {
        await rename(replacement.backup, replacement.target);
      } else {
        await unlink(replacement.target);
      }
    } catch (error) {
      rollbackErrors.push(error);
    }
  }
  for (const directory of [...createdDirectories].reverse()) {
    try {
      await assertManagedLeafState(
        targetContext,
        rootIdentity,
        directory.relativePath,
        {
          exists: true,
          identity: directory.identity,
          expectedLeaf: "directory",
        }
      );
      await rmdir(directory.path);
    } catch (error) {
      if (error.code !== "ENOENT") rollbackErrors.push(error);
    }
  }
  if (createdTarget) {
    try {
      await assertTargetRootIdentity(targetContext, rootIdentity);
      await rmdir(createdTarget.path);
    } catch (error) {
      if (error.code !== "ENOENT") rollbackErrors.push(error);
    }
  }
  if (rollbackErrors.length > 0) {
    throw new AggregateError(rollbackErrors, "Public export rollback failed");
  }
}

async function exchangeStage({
  targetContext,
  stageRoot,
  desiredFiles,
  previousManifest,
  transactionHooks = {},
}) {
  const createdDirectories = [];
  const replacements = [];
  const staleMoves = [];
  let createdTarget = null;
  let rootIdentity;
  try {
    if (!(await pathExists(targetContext.target))) {
      await mkdir(targetContext.target);
      createdTarget = { path: targetContext.target };
    }
    rootIdentity = await assertTargetRootIdentity(targetContext);

    const exchangeFiles = [
      ...desiredFiles,
      { path: MANIFEST_NAME, bytes: null, mode: 0o644 },
    ];
    const oldPaths = new Set(
      previousManifest?.files.map(({ path: filePath }) => filePath) ?? []
    );
    oldPaths.add(MANIFEST_NAME);

    for (let index = 0; index < exchangeFiles.length; index += 1) {
      const file = exchangeFiles[index];
      await ensureDestinationDirectories(
        targetContext,
        file.path,
        createdDirectories,
        rootIdentity
      );
      const targetPath = path.join(
        targetContext.target,
        ...file.path.split("/")
      );
      const stagePath = path.join(stageRoot, "files", ...file.path.split("/"));
      let backup = null;
      const inspectedBefore = await inspectWithinTarget(
        targetContext,
        file.path,
        "file",
        rootIdentity
      );
      let originalIdentity = null;
      if (inspectedBefore.exists) {
        const targetStats = await lstat(inspectedBefore.path);
        originalIdentity = fileIdentity(targetStats);
        if (!oldPaths.has(file.path)) {
          throw new Error(
            `Refusing to replace unmanaged target path: ${file.path}`
          );
        }
        backup = path.join(
          stageRoot,
          "backups",
          "replaced",
          ...file.path.split("/")
        );
        await backupFile(targetPath, backup);
      }
      await transactionHooks.beforeExchange?.({
        index,
        relativePath: file.path,
        targetPath,
      });
      await assertTargetRootIdentity(targetContext, rootIdentity);
      await inspectDesiredParents(targetContext, file.path, rootIdentity);
      await assertManagedLeafState(targetContext, rootIdentity, file.path, {
        exists: inspectedBefore.exists,
        identity: originalIdentity,
      });
      await rename(stagePath, targetPath);
      const installed = await inspectWithinTarget(
        targetContext,
        file.path,
        "file",
        rootIdentity
      );
      replacements.push({
        target: targetPath,
        backup,
        relativePath: file.path,
        installedIdentity: fileIdentity(await lstat(installed.path)),
      });
      await transactionHooks.afterExchange?.({
        index,
        relativePath: file.path,
        targetPath,
      });
    }

    const desiredPaths = new Set(
      desiredFiles.map(({ path: filePath }) => filePath)
    );
    const stalePaths = (previousManifest?.files ?? [])
      .map(({ path: filePath }) => filePath)
      .filter((filePath) => !desiredPaths.has(filePath))
      .sort(compareAscii);
    for (const stalePath of stalePaths) {
      const inspected = await inspectWithinTarget(
        targetContext,
        stalePath,
        "file",
        rootIdentity
      );
      if (!inspected.exists)
        throw new Error(`Stale managed path disappeared: ${stalePath}`);
      const backup = path.join(
        stageRoot,
        "backups",
        "stale",
        ...stalePath.split("/")
      );
      await mkdir(path.dirname(backup), { recursive: true });
      const staleIdentity = fileIdentity(await lstat(inspected.path));
      const finalStale = await assertManagedLeafState(
        targetContext,
        rootIdentity,
        stalePath,
        { exists: true, identity: staleIdentity }
      );
      await rename(finalStale.path, backup);
      staleMoves.push({
        target: finalStale.path,
        backup,
        relativePath: stalePath,
      });
    }
    await transactionHooks.afterStaleDelete?.({ stalePaths });
  } catch (error) {
    try {
      await rollbackTransaction({
        targetContext,
        rootIdentity,
        replacements,
        staleMoves,
        createdDirectories,
        createdTarget,
      });
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        "Public export failed and rollback was incomplete"
      );
    }
    throw error;
  }
}

export async function exportPublicRepository({
  target,
  check = false,
  cwd = process.cwd(),
  transactionHooks,
} = {}) {
  if (typeof check !== "boolean") throw new Error("check must be a boolean");
  const source = await discoverSource(cwd);
  const desiredFiles = await readSourceTree(source);
  const manifestBytes = renderManifest(source, desiredFiles);
  const targetContext = await resolveTarget(target, source);
  await preflightTarget(targetContext, desiredFiles, { check });
  const lock = await acquireLock(targetContext);
  let operationError;
  let stageRoot;
  try {
    const currentHead = (
      await runGit(source.repositoryRoot, ["rev-parse", "HEAD"])
    ).stdout.trim();
    const currentStatus = (
      await runGit(source.repositoryRoot, [
        "status",
        "--porcelain=v1",
        "-z",
        "--untracked-files=all",
      ])
    ).stdout;
    if (currentHead !== source.sourceCommit || currentStatus.length > 0) {
      throw new Error("Source changed after export preflight");
    }
    const secondPreflight = await preflightTarget(targetContext, desiredFiles, {
      check,
    });
    if (check) {
      await checkTarget(targetContext, source, desiredFiles, manifestBytes);
      return {
        checked: true,
        sourceCommit: source.sourceCommit,
        sourceRepository: source.sourceRepository,
        files: desiredFiles.length,
      };
    }
    stageRoot = await writeStage(targetContext, desiredFiles, manifestBytes);
    await transactionHooks?.afterPreflight?.();
    const exchangePreflight = await preflightTarget(
      targetContext,
      desiredFiles,
      { check: false }
    );
    await exchangeStage({
      targetContext,
      stageRoot,
      desiredFiles,
      previousManifest: exchangePreflight.manifest ?? secondPreflight.manifest,
      transactionHooks,
    });
    return {
      checked: false,
      sourceCommit: source.sourceCommit,
      sourceRepository: source.sourceRepository,
      files: desiredFiles.length,
    };
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    if (stageRoot) {
      try {
        await rm(stageRoot, { recursive: true, force: true });
      } catch (cleanupError) {
        if (!operationError) throw cleanupError;
      }
    }
    try {
      await releaseLock(lock);
    } catch (cleanupError) {
      if (!operationError) throw cleanupError;
    }
  }
}

function parseCliArguments(argv) {
  let target;
  let check = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--target") {
      if (
        target !== undefined ||
        index + 1 >= argv.length ||
        argv[index + 1].startsWith("--")
      ) {
        throw new Error(
          "Usage: export-public-repo.mjs --target <absolute-path> [--check]"
        );
      }
      target = argv[index + 1];
      index += 1;
    } else if (argument === "--check") {
      if (check) throw new Error("Duplicate --check argument");
      check = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (target === undefined) {
    throw new Error(
      "Usage: export-public-repo.mjs --target <absolute-path> [--check]"
    );
  }
  return { target, check };
}

async function isExecutedAsCli() {
  if (!process.argv[1]) return false;
  try {
    return (await realpath(process.argv[1])) === (await realpath(SCRIPT_PATH));
  } catch {
    return false;
  }
}

if (await isExecutedAsCli()) {
  try {
    const options = parseCliArguments(process.argv.slice(2));
    const result = await exportPublicRepository(options);
    process.stdout.write(
      `${result.checked ? "Verified" : "Exported"} ${result.files} files from ${
        result.sourceRepository
      }@${result.sourceCommit}\n`
    );
  } catch (error) {
    process.stderr.write(`Public export failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
