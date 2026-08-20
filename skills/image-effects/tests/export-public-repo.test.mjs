import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { exportPublicRepository } from "../scripts/export-public-repo.mjs";
import { publicTemplatePath } from "../scripts/public-layout.mjs";
import { EXPECTED_CATALOG as FIXED_REFS } from "./catalog-fixture.mjs";

const execFile = promisify(execFileCallback);
const SKILL_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const SCRIPT_PATH = path.join(SKILL_ROOT, "scripts/export-public-repo.mjs");
const MANIFEST_NAME = ".image-effects-export.json";
const LICENSE_NOTICE_NAMES = [
  "conardli-garden-skills-mit.txt",
  "gathered-scenes-zine-contributors-mit.txt",
  "happy-coder-contributors-mit.txt",
  "liamgvchi-mit.txt",
];
const SAFE_PUBLIC_FILES = {
  "README.md": "# Image Effects\n\nSafe public fixture.\n",
  "README_CN.md": "# 图像效果\n\n安全公开测试。\n",
  LICENSE: "MIT License\n\nCopyright (c) 2026 wangjs-jacky\n",
  THIRD_PARTY_NOTICES: "# Third-Party Notices\n\nFixture notice.\n",
  ".gitignore": "node_modules/\n",
  "pages.yml": "name: Pages\n",
  "THIRD_PARTY_NOTICES.header.md": "# Third-Party Notices\n\nGenerated from pinned notices.\n",
};

const EXPECTED_EXPORT_PATHS = [
  ".github/workflows/pages.yml",
  ".gitignore",
  "LICENSE",
  "README.md",
  "README_CN.md",
  "SKILL.md",
  "THIRD_PARTY_NOTICES.md",
  "THIRD_PARTY_NOTICES.header.md",
  "agents/openai.yaml",
  "assets/previews/example.png",
  "gallery/index.html",
  "package-lock.json",
  "package.json",
  "references/INDEX.md",
  ...LICENSE_NOTICE_NAMES.map((name) => `references/licenses/${name}`),
  ...FIXED_REFS.flatMap(([ref, extension]) => [
    `gallery/media/${ref}${extension}`,
    `gallery/source/${ref}.md`,
  ]),
  "scripts/run.mjs",
  "tests/run.test.mjs",
].sort();

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function run(command, args, options = {}) {
  return execFile(command, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    ...options,
  });
}

async function git(root, ...args) {
  return run("git", ["-C", root, ...args]);
}

async function writeRelative(root, relativePath, content) {
  const absolutePath = path.join(root, ...relativePath.split("/"));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
}

async function commitAll(root, message = "fixture") {
  await git(root, "add", "--all");
  await git(root, "commit", "-m", message);
}

async function makeSourceFixture() {
  const root = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-source-")
  );
  await git(root, "init", "-b", "main");
  await git(root, "config", "user.name", "Fixture");
  await git(root, "config", "user.email", "fixture@example.test");
  await git(
    root,
    "remote",
    "add",
    "origin",
    "git@github.com:wangjs-jacky/jacky-skills.git"
  );

  const files = {
    "skills/image-effects/SKILL.md":
      "---\nname: image-effects\ndescription: Fixture\n---\n",
    "skills/image-effects/agents/openai.yaml":
      "interface:\n  display_name: Image Effects\n",
    "skills/image-effects/references/INDEX.md": "# Index\n",
    "skills/image-effects/assets/previews/example.png": Buffer.from([
      0x89, 0x50, 0x4e, 0x47,
    ]),
    "skills/image-effects/gallery/index.html":
      "<!doctype html><title>Gallery</title>\n",
    "skills/image-effects/scripts/run.mjs": "export const ok = true;\n",
    "skills/image-effects/tests/run.test.mjs":
      "import test from 'node:test';\ntest('ok', () => {});\n",
    "skills/image-effects/package.json": '{"name":"fixture","type":"module"}\n',
    "skills/image-effects/package-lock.json":
      '{"name":"fixture","lockfileVersion":3}\n',
    "skills/image-effects/assets/public-repo/README.md":
      SAFE_PUBLIC_FILES["README.md"],
    "skills/image-effects/assets/public-repo/README_CN.md":
      SAFE_PUBLIC_FILES["README_CN.md"],
    "skills/image-effects/assets/public-repo/LICENSE":
      SAFE_PUBLIC_FILES.LICENSE,
    "skills/image-effects/assets/public-repo/THIRD_PARTY_NOTICES.md":
      SAFE_PUBLIC_FILES.THIRD_PARTY_NOTICES,
    "skills/image-effects/assets/public-repo/.gitignore":
      SAFE_PUBLIC_FILES[".gitignore"],
    "skills/image-effects/assets/public-repo/.github/workflows/pages.yml":
      SAFE_PUBLIC_FILES["pages.yml"],
    "skills/image-effects/assets/public-repo/THIRD_PARTY_NOTICES.header.md":
      SAFE_PUBLIC_FILES["THIRD_PARTY_NOTICES.header.md"],
    "skills/image-effects/assets/public-repo/private.txt": "must not leak\n",
    "skills/image-effects/assets/internal.txt": "must not leak\n",
    "skills/image-effects/experience.local.md": "must not leak\n",
    "unrelated.txt": "must not leak\n",
  };
  for (const noticeName of LICENSE_NOTICE_NAMES) {
    files[`skills/image-effects/references/licenses/${noticeName}`] =
      `MIT License\n\nCopyright fixture ${noticeName}\n`;
  }
  for (const [ref, extension] of FIXED_REFS) {
    files[`skills/image-effects/gallery/media/${ref}${extension}`] =
      Buffer.from(`preview ${ref}\n`);
    files[`skills/image-effects/gallery/source/${ref}.md`] = `# ${ref}\n`;
  }
  for (const [relativePath, content] of Object.entries(files)) {
    await writeRelative(root, relativePath, content);
  }
  await commitAll(root, "initial fixture");
  return root;
}

async function runCli(sourceRoot, args, options = {}) {
  try {
    const result = await run(process.execPath, [SCRIPT_PATH, ...args], {
      cwd: sourceRoot,
      ...options,
    });
    return { status: 0, ...result };
  } catch (error) {
    return {
      status: error.code,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

async function listedFiles(root, { ignoreGit = true } = {}) {
  const files = [];
  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (ignoreGit && prefix === "" && entry.name === ".git") continue;
      const relativePath = path.posix.join(prefix, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolutePath, relativePath);
      else files.push(relativePath);
    }
  }
  await visit(root);
  return files.sort();
}

async function topology(root, { ignoreGit = true } = {}) {
  const entries = [];
  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (ignoreGit && prefix === "" && entry.name === ".git") continue;
      const relativePath = path.posix.join(prefix, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        entries.push({
          path: relativePath,
          type: "symlink",
          target: await readlink(absolutePath),
        });
      } else if (entry.isDirectory()) {
        entries.push({ path: relativePath, type: "directory" });
        await visit(absolutePath, relativePath);
      } else if (entry.isFile()) {
        entries.push({
          path: relativePath,
          type: "file",
          sha256: sha256(await readFile(absolutePath)),
        });
      } else {
        entries.push({ path: relativePath, type: "other" });
      }
    }
  }
  await visit(root);
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

async function initTargetRepository(target) {
  await git(target, "init", "-b", "main");
  await git(target, "config", "user.name", "Fixture");
  await git(target, "config", "user.email", "fixture@example.test");
  await commitAll(target, "initial export");
}

async function assertNoMaintenanceArtifacts(parent, target) {
  const basename = path.basename(target);
  const names = await readdir(parent);
  assert.equal(
    names.some(
      (name) =>
        name === `${basename}.image-effects-export.lock` ||
        name.startsWith(`.${basename}.image-effects-export-`)
    ),
    false
  );
}

test("CLI 只接受 --target <规范绝对路径> 和可选 --check", async (t) => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  try {
    for (const args of [
      [],
      ["--target"],
      ["--target", "relative"],
      ["--target", `${parent}${path.sep}.`],
      ["--target", path.join(parent, "valid"), "--source-commit", "HEAD"],
      ["--target", path.join(parent, "valid"), "--unknown"],
      ["--check"],
    ]) {
      await t.test(args.join(" ") || "missing args", async () => {
        const result = await runCli(sourceRoot, args);
        assert.notEqual(result.status, 0);
        assert.match(
          result.stderr,
          /usage|argument|absolute|canonical|unknown|target/i
        );
      });
    }
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("CLI 通过 symlink 或系统路径别名启动时仍执行导出", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const target = path.join(parent, "public");
  const linkedScript = path.join(parent, "export-public-repo-link.mjs");
  try {
    await symlink(SCRIPT_PATH, linkedScript);
    const result = await run(
      process.execPath,
      [linkedScript, "--target", target],
      { cwd: sourceRoot }
    );
    assert.match(result.stdout, /^Exported /);
    await stat(path.join(target, MANIFEST_NAME));
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("从 HEAD Git 对象导出精确白名单，模板映射到根且清单稳定", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const target = path.join(parent, "public");
  try {
    const committedSkill = (
      await git(sourceRoot, "show", "HEAD:skills/image-effects/SKILL.md")
    ).stdout;
    await git(
      sourceRoot,
      "update-index",
      "--assume-unchanged",
      "skills/image-effects/SKILL.md"
    );
    await writeRelative(
      sourceRoot,
      "skills/image-effects/SKILL.md",
      "WORKTREE CONTENT MUST NEVER BE EXPORTED\n"
    );
    assert.equal(
      (await git(sourceRoot, "status", "--porcelain", "--untracked-files=all"))
        .stdout,
      ""
    );

    const result = await runCli(sourceRoot, ["--target", target]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await readFile(path.join(target, "SKILL.md"), "utf8"),
      committedSkill
    );
    assert.deepEqual(
      (await listedFiles(target)).filter((name) => name !== MANIFEST_NAME),
      EXPECTED_EXPORT_PATHS
    );
    assert.deepEqual(
      (await listedFiles(path.join(target, "gallery/media"))).map(
        (name) => `gallery/media/${name}`
      ),
      FIXED_REFS.map(([ref, extension]) => `gallery/media/${ref}${extension}`).sort()
    );
    assert.deepEqual(
      (await listedFiles(path.join(target, "gallery/source"))).map(
        (name) => `gallery/source/${name}`
      ),
      FIXED_REFS.map(([ref]) => `gallery/source/${ref}.md`).sort()
    );
    assert.deepEqual(
      await listedFiles(path.join(target, "references/licenses")),
      LICENSE_NOTICE_NAMES
    );
    assert.equal(
      await readFile(path.join(target, "THIRD_PARTY_NOTICES.header.md"), "utf8"),
      SAFE_PUBLIC_FILES["THIRD_PARTY_NOTICES.header.md"]
    );

    const manifestBytes = await readFile(path.join(target, MANIFEST_NAME));
    const manifest = JSON.parse(manifestBytes);
    const head = (await git(sourceRoot, "rev-parse", "HEAD")).stdout.trim();
    assert.equal(manifest.schemaVersion, 1);
    assert.equal(manifest.sourceRepository, "wangjs-jacky/jacky-skills");
    assert.equal(manifest.sourceCommit, head);
    assert.deepEqual(
      manifest.files.map(({ path: filePath }) => filePath),
      EXPECTED_EXPORT_PATHS
    );
    for (const file of manifest.files) {
      assert.equal(
        file.sha256,
        sha256(await readFile(path.join(target, file.path)))
      );
    }
    assert.equal(
      manifest.files.some(({ path: filePath }) => filePath === MANIFEST_NAME),
      false
    );
  } finally {
    await git(
      sourceRoot,
      "update-index",
      "--no-assume-unchanged",
      "skills/image-effects/SKILL.md"
    );
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("源仓库任意 untracked、staged 或 unstaged 改动都在目标创建前失败", async (t) => {
  const cases = [
    {
      name: "untracked",
      dirty: (root) => writeRelative(root, "new-file.txt", "dirty\n"),
    },
    {
      name: "staged",
      dirty: async (root) => {
        await writeRelative(root, "skills/image-effects/SKILL.md", "staged\n");
        await git(root, "add", "skills/image-effects/SKILL.md");
      },
    },
    {
      name: "unstaged",
      dirty: (root) =>
        writeRelative(root, "skills/image-effects/SKILL.md", "unstaged\n"),
    },
    {
      name: "staged and unstaged",
      dirty: async (root) => {
        await writeRelative(root, "skills/image-effects/SKILL.md", "staged\n");
        await git(root, "add", "skills/image-effects/SKILL.md");
        await writeRelative(
          root,
          "skills/image-effects/SKILL.md",
          "unstaged too\n"
        );
      },
    },
  ];
  for (const fixture of cases) {
    await t.test(fixture.name, async () => {
      const sourceRoot = await makeSourceFixture();
      const parent = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-targets-")
      );
      const target = path.join(parent, "public");
      try {
        await fixture.dirty(sourceRoot);
        const result = await runCli(sourceRoot, ["--target", target]);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /source.*clean|dirty|worktree/i);
        await assert.rejects(() => lstat(target), /ENOENT/);
        await assertNoMaintenanceArtifacts(parent, target);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(parent, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test("拒绝危险目标、源树重叠以及 target 或父目录 symlink", async (t) => {
  const sourceRoot = await makeSourceFixture();
  const skillSource = path.join(sourceRoot, "skills/image-effects");
  const sourceParent = path.dirname(sourceRoot);
  const safeParent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-safe-parent-")
  );
  const external = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-external-")
  );
  const linkParent = path.join(safeParent, "linked");
  const targetLink = path.join(safeParent, "target-link");
  const existingThroughLink = path.join(linkParent, "existing");
  await mkdir(path.join(external, "existing"));
  await symlink(external, linkParent, "dir");
  await symlink(external, targetLink, "dir");
  const externalBefore = await readdir(external);
  const cases = [
    ["filesystem root", path.parse(sourceRoot).root],
    ["home", homedir()],
    ["source root", sourceRoot],
    ["source child", path.join(sourceRoot, "public")],
    ["skill source", skillSource],
    ["skill child", path.join(skillSource, "public")],
    ["source ancestor", sourceParent],
    ["symlink parent", path.join(linkParent, "public")],
    ["symlink parent with existing target", existingThroughLink],
    ["symlink target", targetLink],
  ];
  try {
    for (const [name, target] of cases) {
      await t.test(name, async () => {
        await assert.rejects(
          () => exportPublicRepository({ target, cwd: sourceRoot }),
          /unsafe|overlap|home|root|symbolic link|symlink/i
        );
      });
    }
    assert.deepEqual(await readdir(external), externalBefore);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(safeParent, { recursive: true, force: true }),
      rm(external, { recursive: true, force: true }),
    ]);
  }
});

test("首次导出只接受不存在或空目录；已有非空目录必须有 manifest 和 Git", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  try {
    const empty = path.join(parent, "empty");
    await mkdir(empty);
    await exportPublicRepository({ target: empty, cwd: sourceRoot });
    assert.equal((await listedFiles(empty)).includes(MANIFEST_NAME), true);

    const nonempty = path.join(parent, "nonempty");
    await writeRelative(nonempty, "note.txt", "existing\n");
    const before = await topology(nonempty);
    await assert.rejects(
      () => exportPublicRepository({ target: nonempty, cwd: sourceRoot }),
      /non-empty.*manifest|manifest.*non-empty/i
    );
    assert.deepEqual(await topology(nonempty), before);

    const noGit = path.join(parent, "no-git");
    await exportPublicRepository({ target: noGit, cwd: sourceRoot });
    const noGitBefore = await topology(noGit);
    await assert.rejects(
      () => exportPublicRepository({ target: noGit, cwd: sourceRoot }),
      /git.*repository|\.git/i
    );
    assert.deepEqual(await topology(noGit), noGitBefore);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("普通更新要求目标 Git clean，仅删除旧 manifest 受管文件并保留未受管文件", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const target = path.join(parent, "public");
  try {
    await writeRelative(
      sourceRoot,
      "skills/image-effects/scripts/retired.mjs",
      "old\n"
    );
    await commitAll(sourceRoot, "add retired file");
    await exportPublicRepository({ target, cwd: sourceRoot });
    await initTargetRepository(target);

    await writeRelative(target, "README.md", "dirty target\n");
    const dirtyBefore = await topology(target);
    await assert.rejects(
      () => exportPublicRepository({ target, cwd: sourceRoot }),
      /target.*clean|dirty|worktree/i
    );
    assert.deepEqual(await topology(target), dirtyBefore);
    await git(target, "restore", "README.md");

    await writeRelative(target, "notes.txt", "keep me\n");
    await commitAll(target, "add unmanaged committed note");
    await rm(path.join(sourceRoot, "skills/image-effects/scripts/retired.mjs"));
    await commitAll(sourceRoot, "retire old file");
    await exportPublicRepository({ target, cwd: sourceRoot });

    await assert.rejects(
      () => stat(path.join(target, "scripts/retired.mjs")),
      /ENOENT/
    );
    assert.equal(
      await readFile(path.join(target, "notes.txt"), "utf8"),
      "keep me\n"
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("旧 manifest 拒绝所有危险路径语法与重复项，且拒绝越界 symlink", async (t) => {
  const invalidPaths = [
    "/absolute.txt",
    "../escape.txt",
    "scripts/../escape.txt",
    "scripts//empty.txt",
    "scripts\\escape.txt",
    "scripts/%2e%2e/escape.txt",
    "scripts/query?.txt",
    "scripts/hash#.txt",
    "scripts/nul\0.txt",
    "scripts/colon:name.mjs",
    "scripts/star*name.mjs",
    "scripts/less<name.mjs",
    "scripts/greater>name.mjs",
    "scripts/pipe|name.mjs",
    'scripts/quote"name.mjs',
    "scripts/new\nline.mjs",
    "scripts/tab\tname.mjs",
    "scripts/unit\u001fseparator.mjs",
    "scripts/CON",
    "scripts/prn.txt",
    "scripts/AuX.json",
    "scripts/NUL.md",
    "scripts/COM1.mjs",
    "scripts/lpt9.test.mjs",
    "scripts/trailing.",
    "scripts/trailing ",
    ".github/CODEOWNERS",
    "assets/private.txt",
  ];
  for (const invalidPath of invalidPaths) {
    await t.test(JSON.stringify(invalidPath), async () => {
      const sourceRoot = await makeSourceFixture();
      const parent = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-targets-")
      );
      const target = path.join(parent, "public");
      try {
        await mkdir(target);
        await writeRelative(
          target,
          MANIFEST_NAME,
          `${JSON.stringify({
            schemaVersion: 1,
            sourceRepository: "wangjs-jacky/jacky-skills",
            sourceCommit: "0".repeat(40),
            files: [{ path: invalidPath, sha256: "0".repeat(64) }],
          })}\n`
        );
        await initTargetRepository(target);
        const before = await topology(target);
        await assert.rejects(
          () => exportPublicRepository({ target, cwd: sourceRoot }),
          /unsafe manifest path/i
        );
        assert.deepEqual(await topology(target), before);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(parent, { recursive: true, force: true }),
        ]);
      }
    });
  }

  await t.test("duplicate", async () => {
    const sourceRoot = await makeSourceFixture();
    const parent = await mkdtemp(
      path.join(tmpdir(), "image-effects-export-targets-")
    );
    const target = path.join(parent, "public");
    try {
      await mkdir(target);
      const item = { path: "README.md", sha256: "0".repeat(64) };
      await writeRelative(
        target,
        MANIFEST_NAME,
        `${JSON.stringify({
          schemaVersion: 1,
          sourceRepository: "wangjs-jacky/jacky-skills",
          sourceCommit: "0".repeat(40),
          files: [item, item],
        })}\n`
      );
      await initTargetRepository(target);
      await assert.rejects(
        () => exportPublicRepository({ target, cwd: sourceRoot }),
        /duplicate|manifest/i
      );
    } finally {
      await Promise.all([
        rm(sourceRoot, { recursive: true, force: true }),
        rm(parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test("managed symlink escape", async () => {
    const sourceRoot = await makeSourceFixture();
    const parent = await mkdtemp(
      path.join(tmpdir(), "image-effects-export-targets-")
    );
    const target = path.join(parent, "public");
    const external = path.join(parent, "outside.txt");
    try {
      await mkdir(target);
      await writeFile(external, "outside\n");
      await symlink(external, path.join(target, "README.md"));
      await writeRelative(
        target,
        MANIFEST_NAME,
        `${JSON.stringify({
          schemaVersion: 1,
          sourceRepository: "wangjs-jacky/jacky-skills",
          sourceCommit: "0".repeat(40),
          files: [
            { path: "README.md", sha256: sha256(Buffer.from("outside\n")) },
          ],
        })}\n`
      );
      await initTargetRepository(target);
      const outsideBefore = await readFile(external, "utf8");
      await assert.rejects(
        () => exportPublicRepository({ target, cwd: sourceRoot }),
        /symbolic link|symlink|unsafe/i
      );
      assert.equal(await readFile(external, "utf8"), outsideBefore);
      assert.equal(
        (await lstat(path.join(target, "README.md"))).isSymbolicLink(),
        true
      );
    } finally {
      await Promise.all([
        rm(sourceRoot, { recursive: true, force: true }),
        rm(parent, { recursive: true, force: true }),
      ]);
    }
  });
});

test("--check 从同一 HEAD 重建，允许纯受管 dirty，并拒绝各种漂移和额外文件", async (t) => {
  async function preparedTarget() {
    const sourceRoot = await makeSourceFixture();
    const parent = await mkdtemp(
      path.join(tmpdir(), "image-effects-export-targets-")
    );
    const target = path.join(parent, "public");
    await exportPublicRepository({ target, cwd: sourceRoot });
    return { sourceRoot, parent, target };
  }

  await t.test("fresh target without Git", async () => {
    const fixture = await preparedTarget();
    try {
      await exportPublicRepository({
        target: fixture.target,
        cwd: fixture.sourceRoot,
        check: true,
      });
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test("managed dirty after update", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      await writeRelative(
        fixture.sourceRoot,
        "skills/image-effects/README-never.md",
        "ignored\n"
      );
      await writeRelative(
        fixture.sourceRoot,
        "skills/image-effects/scripts/run.mjs",
        "export const ok = 2;\n"
      );
      await commitAll(fixture.sourceRoot, "update managed source");
      await exportPublicRepository({
        target: fixture.target,
        cwd: fixture.sourceRoot,
      });
      assert.notEqual(
        (
          await git(
            fixture.target,
            "status",
            "--porcelain",
            "--untracked-files=all"
          )
        ).stdout,
        ""
      );
      await exportPublicRepository({
        target: fixture.target,
        cwd: fixture.sourceRoot,
        check: true,
      });
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test(
    "正确导出内容 git add 后 staged managed paths 通过",
    async () => {
      const fixture = await preparedTarget();
      try {
        await initTargetRepository(fixture.target);
        await writeRelative(
          fixture.sourceRoot,
          "skills/image-effects/scripts/run.mjs",
          "export const ok = 4;\n"
        );
        await commitAll(fixture.sourceRoot, "update export before staging");
        await exportPublicRepository({
          target: fixture.target,
          cwd: fixture.sourceRoot,
        });
        await git(fixture.target, "add", "--all");

        await exportPublicRepository({
          target: fixture.target,
          cwd: fixture.sourceRoot,
          check: true,
        });
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    }
  );

  await t.test(
    "拒绝 staged managed blob 内容漂移，即使工作树已恢复正确",
    async () => {
      const fixture = await preparedTarget();
      try {
        await initTargetRepository(fixture.target);
        const readmePath = path.join(fixture.target, "README.md");
        const expectedReadme = await readFile(readmePath);
        await writeFile(readmePath, "staged managed bytes\n");
        await git(fixture.target, "add", "README.md");
        await writeFile(readmePath, expectedReadme);

        await assert.rejects(
          () =>
            exportPublicRepository({
              target: fixture.target,
              cwd: fixture.sourceRoot,
              check: true,
            }),
          /staged|index|blob|content|mismatch/i
        );
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    }
  );

  await t.test("拒绝 staged blob 正确但 index mode 变为 100755", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      await git(fixture.target, "update-index", "--chmod=+x", "README.md");
      assert.match(
        (await git(fixture.target, "ls-files", "--stage", "README.md")).stdout,
        /^100755 /m
      );

      await assert.rejects(
        () =>
          exportPublicRepository({
            target: fixture.target,
            cwd: fixture.sourceRoot,
            check: true,
          }),
        /index|mode|type|100755/i
      );
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test(
    "拒绝工作树 chmod +x 形成的 unstaged executable mode",
    async () => {
      const fixture = await preparedTarget();
      try {
        await initTargetRepository(fixture.target);
        const readmePath = path.join(fixture.target, "README.md");
        await chmod(readmePath, 0o755);
        assert.notEqual(
          (await git(fixture.target, "diff", "--name-only")).stdout,
          ""
        );

        await assert.rejects(
          () =>
            exportPublicRepository({
              target: fixture.target,
              cwd: fixture.sourceRoot,
              check: true,
            }),
          /worktree|mode|executable|100755/i
        );
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    }
  );

  await t.test("拒绝错误 executable mode 已提交后的 clean target", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      await chmod(path.join(fixture.target, "README.md"), 0o755);
      await commitAll(fixture.target, "commit wrong executable mode");
      assert.equal(
        (
          await git(
            fixture.target,
            "status",
            "--porcelain",
            "--untracked-files=all"
          )
        ).stdout,
        ""
      );

      await assert.rejects(
        () =>
          exportPublicRepository({
            target: fixture.target,
            cwd: fixture.sourceRoot,
            check: true,
          }),
        /worktree|mode|executable|100755/i
      );
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test(
    "拒绝 staged blob 正确但 index type 变为 120000 symlink",
    async () => {
      const fixture = await preparedTarget();
      try {
        await initTargetRepository(fixture.target);
        const scriptPath = path.join(fixture.target, "scripts/run.mjs");
        const expectedScript = await readFile(scriptPath, "utf8");
        await rm(scriptPath);
        await symlink(expectedScript, scriptPath);
        await git(fixture.target, "add", "scripts/run.mjs");
        await rm(scriptPath);
        await writeFile(scriptPath, expectedScript);
        assert.match(
          (await git(fixture.target, "ls-files", "--stage", "scripts/run.mjs"))
            .stdout,
          /^120000 /m
        );

        await assert.rejects(
          () =>
            exportPublicRepository({
              target: fixture.target,
              cwd: fixture.sourceRoot,
              check: true,
            }),
          /index|mode|type|120000|symlink/i
        );
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    }
  );

  await t.test("拒绝 staged managed path 变为 160000 gitlink", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      const targetHead = (
        await git(fixture.target, "rev-parse", "HEAD")
      ).stdout.trim();
      await git(
        fixture.target,
        "update-index",
        "--add",
        "--cacheinfo",
        `160000,${targetHead},scripts/run.mjs`
      );
      assert.match(
        (await git(fixture.target, "ls-files", "--stage", "scripts/run.mjs"))
          .stdout,
        /^160000 /m
      );

      await assert.rejects(
        () =>
          exportPublicRepository({
            target: fixture.target,
            cwd: fixture.sourceRoot,
            check: true,
          }),
        /index|mode|type|160000|gitlink/i
      );
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test(
    "拒绝 staged managed delete，即使工作树文件仍是正确导出内容",
    async () => {
      const fixture = await preparedTarget();
      try {
        await initTargetRepository(fixture.target);
        const readmePath = path.join(fixture.target, "README.md");
        const expectedReadme = await readFile(readmePath);
        await git(fixture.target, "rm", "README.md");
        await writeFile(readmePath, expectedReadme);

        await assert.rejects(
          () =>
            exportPublicRepository({
              target: fixture.target,
              cwd: fixture.sourceRoot,
              check: true,
            }),
          /staged|index|delete|missing|mismatch/i
        );
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    }
  );

  await t.test("拒绝两个 managed paths 之间的 staged rename", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      const readmePath = path.join(fixture.target, "README.md");
      const readmeCnPath = path.join(fixture.target, "README_CN.md");
      const expectedReadme = await readFile(readmePath);
      const expectedReadmeCn = await readFile(readmeCnPath);
      await git(fixture.target, "mv", "-f", "README.md", "README_CN.md");
      await writeFile(readmePath, expectedReadme);
      await writeFile(readmeCnPath, expectedReadmeCn);

      await assert.rejects(
        () =>
          exportPublicRepository({
            target: fixture.target,
            cwd: fixture.sourceRoot,
            check: true,
          }),
        /staged|index|rename|missing|mismatch/i
      );
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test("拒绝 git add 后工作树删除形成的 unmanaged AD", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      await writeRelative(fixture.target, "manual.txt", "index only\n");
      await git(fixture.target, "add", "manual.txt");
      await rm(path.join(fixture.target, "manual.txt"));
      assert.match(
        (
          await git(
            fixture.target,
            "status",
            "--porcelain=v1",
            "--untracked-files=all"
          )
        ).stdout,
        /^AD manual\.txt$/m
      );

      await assert.rejects(
        () =>
          exportPublicRepository({
            target: fixture.target,
            cwd: fixture.sourceRoot,
            check: true,
          }),
        /git|index|unmanaged|unexpected/i
      );
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test("拒绝只存在于 index 的 staged rename 新路径", async () => {
    const fixture = await preparedTarget();
    try {
      await initTargetRepository(fixture.target);
      const readmePath = path.join(fixture.target, "README.md");
      const manualPath = path.join(fixture.target, "manual.txt");
      await git(fixture.target, "mv", "README.md", "manual.txt");
      await writeFile(readmePath, await readFile(manualPath));
      await rm(manualPath);
      assert.match(
        (await git(fixture.target, "diff", "--cached", "--name-status", "-M"))
          .stdout,
        /manual\.txt/
      );

      await assert.rejects(
        () =>
          exportPublicRepository({
            target: fixture.target,
            cwd: fixture.sourceRoot,
            check: true,
          }),
        /git|index|unmanaged|unexpected/i
      );
    } finally {
      await Promise.all([
        rm(fixture.sourceRoot, { recursive: true, force: true }),
        rm(fixture.parent, { recursive: true, force: true }),
      ]);
    }
  });

  await t.test(
    "拒绝仅由 unstaged delete 隐藏的 committed unmanaged path",
    async () => {
      const fixture = await preparedTarget();
      try {
        await initTargetRepository(fixture.target);
        await writeRelative(
          fixture.target,
          "manual.txt",
          "committed unmanaged\n"
        );
        await commitAll(fixture.target, "add unmanaged path");
        await rm(path.join(fixture.target, "manual.txt"));

        await assert.rejects(
          () =>
            exportPublicRepository({
              target: fixture.target,
              cwd: fixture.sourceRoot,
              check: true,
            }),
          /git|worktree|unmanaged|unexpected/i
        );
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    }
  );

  const drifts = [
    [
      "content",
      async ({ target }) => writeRelative(target, "README.md", "drift\n"),
    ],
    ["missing", async ({ target }) => rm(path.join(target, "README.md"))],
    [
      "manifest sourceCommit",
      async ({ target }) => {
        const manifestPath = path.join(target, MANIFEST_NAME);
        const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
        manifest.sourceCommit = "f".repeat(40);
        await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      },
    ],
    [
      "unmanaged",
      async ({ target }) => writeRelative(target, "manual.txt", "extra\n"),
    ],
  ];
  for (const [name, mutate] of drifts) {
    await t.test(name, async () => {
      const fixture = await preparedTarget();
      try {
        await mutate(fixture);
        await assert.rejects(
          () =>
            exportPublicRepository({
              target: fixture.target,
              cwd: fixture.sourceRoot,
              check: true,
            }),
          /check|drift|missing|manifest|unmanaged|unexpected|mismatch/i
        );
      } finally {
        await Promise.all([
          rm(fixture.sourceRoot, { recursive: true, force: true }),
          rm(fixture.parent, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test("源 Git tree 中选中的 symlink 或非 regular entry 会被拒绝", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const target = path.join(parent, "public");
  try {
    await symlink(
      "../SKILL.md",
      path.join(sourceRoot, "skills/image-effects/agents/link.yaml")
    );
    await commitAll(sourceRoot, "add source symlink");
    await assert.rejects(
      () => exportPublicRepository({ target, cwd: sourceRoot }),
      /source.*symbolic link|source.*regular|mode 120000/i
    );
    await assert.rejects(() => lstat(target), /ENOENT/);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("源 Git tree 的导出路径拒绝双引号和 ASCII 控制字符", async (t) => {
  const invalidNames = [
    'quote"name.mjs',
    "new\nline.mjs",
    "tab\tname.mjs",
    "unit\u001fseparator.mjs",
  ];
  for (const invalidName of invalidNames) {
    await t.test(JSON.stringify(invalidName), async () => {
      const sourceRoot = await makeSourceFixture();
      const parent = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-targets-")
      );
      const target = path.join(parent, "public");
      try {
        await writeRelative(
          sourceRoot,
          `skills/image-effects/scripts/${invalidName}`,
          "export const unsafe = true;\n"
        );
        await commitAll(sourceRoot, "add unsafe Git path");
        await assert.rejects(
          () => exportPublicRepository({ target, cwd: sourceRoot }),
          /unsafe export path/i
        );
        await assert.rejects(() => lstat(target), /ENOENT/);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(parent, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test("内容扫描拒绝用户绝对路径、附件路径、secret 与禁止属性内容", async (t) => {
  const forbiddenContents = [
    `/${"Users"}/private-user/project/file.md\n`,
    `Private:/${"Users"}/private-user/project/file.md\n`,
    `Location:/${"Users"}/private-user/project/file.md\n`,
    `Source:/${"home"}/private-user/project/file.md\n`,
    `https:///${"Users"}/private-user/project/file.md\n`,
    `https:////${"Users"}/private-user/project/file.md\n`,
    `http:///${"home"}/private-user/project/file.md\n`,
    `https://\\${"Users"}\\private-user\\project\\file.md\n`,
    `https:\\\\${"Users"}\\private-user\\project\\file.md\n`,
    `https://example.com/docs?local=/${"Users"}/private-user/project/file.md\n`,
    `\`/${"Users"}/private-user/project/file.md\`\n`,
    `file:///${"Users"}/private-user/project/file.md\n`,
    `${"C:"}\\${"Users"}\\private-user\\project\\file.md\n`,
    `${"c:"}\\${"uSeRs"}\\private-user\\project\\file.md\n`,
    `path=${"D:"}/${"users"}/private-user/project/file.md\n`,
    `/${"mnt"}/data/uploaded-image.png\n`,
    `ghp_${"abcdefghijklmnopqrstuvwxyz1234567890"}\n`,
    `-----BEGIN ${"PRIVATE"} KEY-----\n`,
    `${"Trip"}.com internal implementation\n`,
  ];
  for (const content of forbiddenContents) {
    await t.test(content.trim().slice(0, 24), async () => {
      const sourceRoot = await makeSourceFixture();
      const parent = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-targets-")
      );
      const target = path.join(parent, "public");
      try {
        await writeRelative(
          sourceRoot,
          "skills/image-effects/assets/public-repo/README.md",
          content
        );
        await commitAll(sourceRoot, "add forbidden public content");
        await assert.rejects(
          () => exportPublicRepository({ target, cwd: sourceRoot }),
          /public content|private|secret|attachment|absolute|forbidden/i
        );
        await assert.rejects(() => lstat(target), /ENOENT/);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(parent, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test("内容扫描不误报合法 URL 与未包含个人目录的普通文本", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const target = path.join(parent, "public");
  try {
    await writeRelative(
      sourceRoot,
      "skills/image-effects/assets/public-repo/README.md",
      [
        `https://example.com/${"Users"}/guide/reference`,
        `https://example.com/docs/C:/${"Users"}/guide/reference`,
        `[macOS guide](https://example.com/${"Users"}/guide/reference)`,
        `\`https://example.com/${"home"}/guide/reference\``,
        `HTTPS://example.com/${"home"}/guide/reference`,
        `https://example.com:8443/${"Users"}/guide/reference`,
        "The /Users directory contains account folders.",
        "Windows uses a Users directory and drive letters such as C:.",
        "A project may document home/example without an absolute path.",
        "",
      ].join("\n")
    );
    await commitAll(sourceRoot, "add safe path discussion");
    await exportPublicRepository({ target, cwd: sourceRoot });
    assert.equal(
      (await readFile(path.join(target, "README.md"), "utf8")).includes(
        `https://example.com/${"Users"}/guide/reference`
      ),
      true
    );
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("内容扫描拒绝文本文件中的非法 UTF-8，不能把解码失败当作 binary", async (t) => {
  const cases = [
    {
      name: "standalone invalid UTF-8 Markdown",
      relativePath: "skills/image-effects/assets/public-repo/README.md",
      content: Buffer.from([0x23, 0x20, 0x80, 0x0a]),
    },
    {
      name: "secret followed by invalid UTF-8 JavaScript",
      relativePath: "skills/image-effects/scripts/run.mjs",
      content: Buffer.concat([
        Buffer.from(`ghp_${"abcdefghijklmnopqrstuvwxyz1234567890"}\n`),
        Buffer.from([0xff]),
      ]),
    },
  ];
  for (const fixture of cases) {
    await t.test(fixture.name, async () => {
      const sourceRoot = await makeSourceFixture();
      const parent = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-targets-")
      );
      const target = path.join(parent, "public");
      try {
        await writeRelative(sourceRoot, fixture.relativePath, fixture.content);
        await commitAll(sourceRoot, "add invalid UTF-8 text");
        await assert.rejects(
          () => exportPublicRepository({ target, cwd: sourceRoot }),
          /UTF-8|text/i
        );
        await assert.rejects(() => lstat(target), /ENOENT/);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(parent, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test("交换中普通异常完整回滚，目标逐文件/目录/symlink 拓扑不变且不留维护产物", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const external = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-external-")
  );
  const target = path.join(parent, "public");
  try {
    await exportPublicRepository({ target, cwd: sourceRoot });
    await initTargetRepository(target);
    await writeRelative(target, "notes/value.txt", "unmanaged\n");
    await symlink(external, path.join(target, "unmanaged-link"), "dir");
    await commitAll(target, "add unmanaged topology");
    await writeRelative(
      sourceRoot,
      "skills/image-effects/scripts/run.mjs",
      "export const ok = 2;\n"
    );
    await commitAll(sourceRoot, "change export");
    const before = await topology(target);

    await assert.rejects(
      () =>
        exportPublicRepository({
          target,
          cwd: sourceRoot,
          transactionHooks: {
            beforeExchange: async ({ index }) => {
              if (index === 3) throw new Error("injected exchange failure");
            },
          },
        }),
      /injected exchange failure/
    );
    assert.deepEqual(await topology(target), before);
    await assertNoMaintenanceArtifacts(parent, target);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
      rm(external, { recursive: true, force: true }),
    ]);
  }
});

test("beforeExchange 后目标根被替换为 symlink 时拒绝写入外部目录", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const external = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-external-")
  );
  const target = path.join(parent, "public");
  const displaced = path.join(parent, "displaced-target");
  const externalReadme = path.join(external, "README.md");
  try {
    await exportPublicRepository({ target, cwd: sourceRoot });
    await initTargetRepository(target);
    await writeFile(externalReadme, "external sentinel\n");

    await assert.rejects(
      () =>
        exportPublicRepository({
          target,
          cwd: sourceRoot,
          transactionHooks: {
            beforeExchange: async ({ relativePath }) => {
              if (relativePath !== "README.md") return;
              await rename(target, displaced);
              await symlink(external, target, "dir");
            },
          },
        }),
      /target|identity|symbolic link|symlink|unsafe|rollback/i
    );
    assert.equal(await readFile(externalReadme, "utf8"), "external sentinel\n");
    await assertNoMaintenanceArtifacts(parent, target);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
      rm(external, { recursive: true, force: true }),
    ]);
  }
});

test("beforeExchange 后受管父目录或 leaf 被替换时拒绝外部覆盖", async (t) => {
  for (const attack of ["parent", "leaf"]) {
    await t.test(attack, async () => {
      const sourceRoot = await makeSourceFixture();
      const parent = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-targets-")
      );
      const external = await mkdtemp(
        path.join(tmpdir(), "image-effects-export-external-")
      );
      const target = path.join(parent, "public");
      const displaced = path.join(parent, `displaced-${attack}`);
      const externalScript = path.join(external, "run.mjs");
      try {
        await exportPublicRepository({ target, cwd: sourceRoot });
        await initTargetRepository(target);
        await writeFile(externalScript, "external sentinel\n");

        await assert.rejects(
          () =>
            exportPublicRepository({
              target,
              cwd: sourceRoot,
              transactionHooks: {
                beforeExchange: async ({ relativePath, targetPath }) => {
                  if (relativePath !== "scripts/run.mjs") return;
                  if (attack === "parent") {
                    await rename(path.dirname(targetPath), displaced);
                    await symlink(external, path.dirname(targetPath), "dir");
                  } else {
                    await rm(targetPath);
                    await symlink(externalScript, targetPath);
                  }
                },
              },
            }),
          /managed path|identity|symbolic link|symlink|unsafe|rollback/i
        );
        assert.equal(
          await readFile(externalScript, "utf8"),
          "external sentinel\n"
        );
        await assertNoMaintenanceArtifacts(parent, target);
      } finally {
        await Promise.all([
          rm(sourceRoot, { recursive: true, force: true }),
          rm(parent, { recursive: true, force: true }),
          rm(external, { recursive: true, force: true }),
        ]);
      }
    });
  }
});

test("rollback 遇到受管父目录 symlink 时不向外部恢复 backup", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const external = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-external-")
  );
  const target = path.join(parent, "public");
  const displaced = path.join(parent, "displaced-scripts");
  const externalRun = path.join(external, "run.mjs");
  try {
    await writeRelative(
      sourceRoot,
      "skills/image-effects/scripts/stale.mjs",
      "export const stale = true;\n"
    );
    await commitAll(sourceRoot, "add stale export");
    await exportPublicRepository({ target, cwd: sourceRoot });
    await initTargetRepository(target);
    await rm(path.join(sourceRoot, "skills/image-effects/scripts/stale.mjs"));
    await commitAll(sourceRoot, "remove stale export");
    await writeFile(externalRun, "external sentinel\n");

    await assert.rejects(
      () =>
        exportPublicRepository({
          target,
          cwd: sourceRoot,
          transactionHooks: {
            afterStaleDelete: async () => {
              await rename(path.join(target, "scripts"), displaced);
              await symlink(external, path.join(target, "scripts"), "dir");
              throw new Error("injected unsafe rollback");
            },
          },
        }),
      /rollback|symbolic link|symlink|unsafe/i
    );
    assert.equal(await readFile(externalRun, "utf8"), "external sentinel\n");
    await assert.rejects(
      () => lstat(path.join(external, "stale.mjs")),
      /ENOENT/
    );
    await assertNoMaintenanceArtifacts(parent, target);
  } finally {
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
      rm(external, { recursive: true, force: true }),
    ]);
  }
});

test("同一 target 并发导出由独立维护锁 fail-fast，首个事务完成且锁最终清理", async () => {
  const sourceRoot = await makeSourceFixture();
  const parent = await mkdtemp(
    path.join(tmpdir(), "image-effects-export-targets-")
  );
  const target = path.join(parent, "public");
  let entered;
  let release;
  const enteredPromise = new Promise((resolve) => {
    entered = resolve;
  });
  const releasePromise = new Promise((resolve) => {
    release = resolve;
  });
  try {
    await exportPublicRepository({ target, cwd: sourceRoot });
    await initTargetRepository(target);
    await writeRelative(
      sourceRoot,
      "skills/image-effects/scripts/run.mjs",
      "export const ok = 3;\n"
    );
    await commitAll(sourceRoot, "change for concurrent export");

    const first = exportPublicRepository({
      target,
      cwd: sourceRoot,
      transactionHooks: {
        beforeExchange: async ({ index }) => {
          if (index === 0) {
            entered();
            await releasePromise;
          }
        },
      },
    });
    await enteredPromise;
    await assert.rejects(
      () => exportPublicRepository({ target, cwd: sourceRoot }),
      /export.*(?:lock|progress)|(?:lock|progress).*export/i
    );
    release();
    await first;
    await exportPublicRepository({ target, cwd: sourceRoot, check: true });
    await assertNoMaintenanceArtifacts(parent, target);
  } finally {
    release?.();
    await Promise.all([
      rm(sourceRoot, { recursive: true, force: true }),
      rm(parent, { recursive: true, force: true }),
    ]);
  }
});

test("公开仓库模板保留安装、调用、Gallery 与 Pages 机器契约", async () => {
  const readme = await readFile(
    publicTemplatePath(SKILL_ROOT, "README.md"),
    "utf8"
  );
  const readmeCn = await readFile(
    publicTemplatePath(SKILL_ROOT, "README_CN.md"),
    "utf8"
  );
  const workflow = await readFile(
    publicTemplatePath(SKILL_ROOT, ".github/workflows/pages.yml"),
    "utf8"
  );
  const combined = `${readme}\n${readmeCn}`;

  assert.equal(
    combined.includes("npx skills add wangjs-jacky/image-effects"),
    true
  );
  assert.equal(
    combined.includes(
      "Use $image-effects effect healing-anime-scribble-v3@1.0.0 on my uploaded image."
    ),
    true
  );
  assert.equal(
    combined.includes("https://wangjs-jacky.github.io/image-effects/"),
    true
  );
  await Promise.all([
    stat(publicTemplatePath(SKILL_ROOT, "LICENSE")),
    stat(publicTemplatePath(SKILL_ROOT, "THIRD_PARTY_NOTICES.md")),
  ]);

  assert.match(workflow, /push:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /group:\s*pages/);
  assert.match(workflow, /actions\/checkout@v4/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /path:\s*gallery/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /environment:\s*\n\s*name:\s*github-pages/);
  assert.match(
    workflow,
    /url:\s*\$\{\{\s*steps\.deployment\.outputs\.page_url\s*\}\}/
  );
});
