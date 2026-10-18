"""install.sh 的静态契约测试。"""

import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import textwrap
import unittest


ROOT = Path(__file__).resolve().parents[1]
INSTALL_SCRIPT = (ROOT / "install.sh").read_text(encoding="utf-8")
README = (ROOT / "README.md").read_text(encoding="utf-8")


def skill_name(skill_file: Path) -> str:
    for line in skill_file.read_text(encoding="utf-8").splitlines():
        if line.startswith("name:"):
            return line.split(":", 1)[1].strip().strip('"')
    raise AssertionError(f"{skill_file} 缺少 frontmatter name")


class InstallContractTests(unittest.TestCase):
    def make_install_fixture(
        self, root: Path, *, j_skills_version: str = "0.1.0"
    ) -> tuple[Path, dict[str, str]]:
        repo = root / "checkout"
        repo.mkdir()
        (repo / ".git").mkdir()
        shutil.copy2(ROOT / "install.sh", repo / "install.sh")

        skill_files = {
            "plugin-one": repo / "plugins/dev-tools/plugin-one/SKILL.md",
            "plugin-two": repo / "plugins/dev-tools/plugin-two/SKILL.md",
            "standalone": repo / "skills/standalone/SKILL.md",
            "sample-ops": repo / "harness/sample-ops/SKILL.md",
        }
        for name, skill_file in skill_files.items():
            skill_file.parent.mkdir(parents=True, exist_ok=True)
            skill_file.write_text(
                f'---\nname: {name}\ndescription: "测试 Skill"\n---\n',
                encoding="utf-8",
            )
        dev_tools_manifest = repo / "plugins/dev-tools/.claude-plugin/plugin.json"
        dev_tools_manifest.parent.mkdir(parents=True)
        dev_tools_manifest.write_text(
            json.dumps(
                {
                    "name": "dev-tools",
                    "version": "1.0.0",
                    "skills": ["./plugin-one/", "./plugin-two/"],
                }
            ),
            encoding="utf-8",
        )

        fake_bin = root / "bin"
        fake_bin.mkdir()
        log_file = root / "commands.log"
        real_node = shutil.which("node")
        self.assertIsNotNone(real_node)

        (fake_bin / "node").write_text(
            textwrap.dedent(
                f"""\
                #!/usr/bin/env bash
                if [ "${{1:-}}" = "-p" ]; then
                    case "${{2:-}}" in
                        *process.arch*) echo arm64 ;;
                        *) echo 24 ;;
                    esac
                    exit 0
                fi
                if [ "${{1:-}}" = "-e" ]; then
                    cat >/dev/null
                    exit 0
                fi
                exec "{real_node}" "$@"
                """
            ),
            encoding="utf-8",
        )
        (fake_bin / "j-skills").write_text(
            textwrap.dedent(
                f"""\
                #!/usr/bin/env bash
                echo "j-skills:$*" >> "$TEST_COMMAND_LOG"
                case "${{1:-}}" in
                    --version)
                        echo "j-skills/{j_skills_version} test-arm64 node-v24"
                        ;;
                    link)
                        if [ "${{2:-}}" = "--list" ]; then
                            echo '{{"skills":[]}}'
                        else
                            echo "link:${{2:-}}" >> "$TEST_COMMAND_LOG"
                        fi
                        ;;
                    install)
                        echo "install:${{2:-}}:${{*}}" >> "$TEST_COMMAND_LOG"
                        ;;
                    *)
                        exit 64
                        ;;
                esac
                """
            ),
            encoding="utf-8",
        )
        (fake_bin / "git").write_text(
            textwrap.dedent(
                """\
                #!/usr/bin/env bash
                echo "git:$*" >> "$TEST_COMMAND_LOG"
                echo "本地 checkout 安装不应调用 git" >&2
                exit 97
                """
            ),
            encoding="utf-8",
        )
        (fake_bin / "npm").write_text(
            textwrap.dedent(
                """\
                #!/usr/bin/env bash
                echo "npm:$*" >> "$TEST_COMMAND_LOG"
                exit 98
                """
            ),
            encoding="utf-8",
        )
        for executable in fake_bin.iterdir():
            executable.chmod(0o755)

        env = os.environ.copy()
        env.update(
            {
                "HOME": str(root / "home"),
                "PATH": f"{fake_bin}:{env['PATH']}",
                "TEST_COMMAND_LOG": str(log_file),
            }
        )
        env.pop("JACKY_SKILLS_REPO_DIR", None)
        env.pop("J_SKILLS_VERSION", None)
        return repo, env

    def run_fixture(
        self, repo: Path, env: dict[str, str], *arguments: str
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["bash", str(repo / "install.sh"), *arguments],
            cwd=repo,
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )

    def write_manifest(
        self, plugin: Path, skills: list[str], *, name: str | None = None
    ) -> None:
        manifest = plugin / ".claude-plugin/plugin.json"
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(
            json.dumps(
                {
                    "name": name or plugin.name,
                    "version": "1.0.0",
                    "skills": skills,
                }
            ),
            encoding="utf-8",
        )

    def command_log(self, root: Path) -> str:
        log = root / "commands.log"
        return log.read_text(encoding="utf-8") if log.exists() else ""

    def test_does_not_use_unsupported_link_all(self) -> None:
        self.assertNotIn("j-skills link --all", INSTALL_SCRIPT)

    def test_discovers_plugin_and_standalone_skills(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)

            completed = self.run_fixture(repo, env, "--all")

            self.assertEqual(completed.returncode, 0, completed.stderr)
            command_log = self.command_log(root)
            for relative in (
                "plugins/dev-tools/plugin-one",
                "plugins/dev-tools/plugin-two",
                "skills/standalone",
                "harness/sample-ops",
            ):
                self.assertIn(f"link:{repo.resolve()}/{relative}", command_log)

    def test_install_failures_are_not_swallowed(self) -> None:
        self.assertNotRegex(
            INSTALL_SCRIPT,
            r"j-skills install[^\n]*(?:2>/dev/null\s*)?\|\|\s*true",
        )

    def test_links_each_discovered_skill_directory(self) -> None:
        self.assertRegex(INSTALL_SCRIPT, r'j-skills link "\$skill_dir"')

    def test_linux_uppercase_skill_compatibility_link_is_always_removed(self) -> None:
        self.assertIn('compatibility_link="$skill_dir/skill.md"', INSTALL_SCRIPT)
        self.assertIn('ln -s SKILL.md "$compatibility_link"', INSTALL_SCRIPT)
        self.assertIn('if j-skills link "$skill_dir"; then', INSTALL_SCRIPT)
        self.assertIn('rm -f "$compatibility_link"', INSTALL_SCRIPT)
        self.assertIn('return "$link_status"', INSTALL_SCRIPT)

    def test_defaults_to_claude_code_and_codex(self) -> None:
        self.assertRegex(
            INSTALL_SCRIPT,
            r'INSTALL_ENVS="\$\{J_SKILLS_ENVS:-claude-code,codex\}"',
        )
        self.assertIn('--env "$INSTALL_ENVS"', INSTALL_SCRIPT)

    def test_auto_install_pins_the_supported_j_skills_version(self) -> None:
        self.assertIn(
            'npm install -g "j-skills@$REQUIRED_J_SKILLS_VERSION"',
            INSTALL_SCRIPT,
        )

    def test_checks_native_arm_node_on_macos(self) -> None:
        self.assertIn('uname -s', INSTALL_SCRIPT)
        self.assertIn('uname -m', INSTALL_SCRIPT)
        self.assertIn(
            'if [ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then',
            INSTALL_SCRIPT,
        )
        self.assertIn('process.arch', INSTALL_SCRIPT)
        self.assertRegex(INSTALL_SCRIPT, r"arm64")

    def test_linking_handles_existing_and_conflicting_entries(self) -> None:
        self.assertIn("j-skills link --list --json", INSTALL_SCRIPT)
        self.assertIn('$HOME/.j-skills/linked/$skill_name', INSTALL_SCRIPT)
        self.assertIn('if [ ! -L "$filesystem_link" ]; then', INSTALL_SCRIPT)
        self.assertRegex(INSTALL_SCRIPT, r"已正确链接")
        self.assertRegex(INSTALL_SCRIPT, r"链接冲突")

    def test_running_from_a_checkout_uses_that_checkout_without_git_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)

            completed = self.run_fixture(repo, env, "--all")

            self.assertEqual(completed.returncode, 0, completed.stderr)
            command_log = (root / "commands.log").read_text(encoding="utf-8")
            canonical_repo = repo.resolve()
            self.assertNotIn("git:", command_log)
            self.assertIn(
                f"link:{canonical_repo}/skills/standalone", command_log
            )
            self.assertIn(
                f"link:{canonical_repo}/harness/sample-ops", command_log
            )

    def test_skill_selector_limits_linking_and_installation(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)

            completed = self.run_fixture(repo, env, "--skill", "standalone")

            self.assertEqual(completed.returncode, 0, completed.stderr)
            command_log = (root / "commands.log").read_text(encoding="utf-8")
            self.assertIn(
                f"link:{repo.resolve()}/skills/standalone", command_log
            )
            self.assertIn("install:standalone:", command_log)
            self.assertNotIn("plugin-one", command_log)
            self.assertNotIn("sample-ops", command_log)

    def test_all_install_excludes_skill_sources_inside_goal_archives(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            snapshot = (
                repo / "harness/sample-ops/projects/demo/features/research/original-skill"
            )
            snapshot.mkdir(parents=True)
            (snapshot / "SKILL.md").write_text(
                '---\nname: do-not-install-ops\ndescription: "历史实验副本"\n---\n',
                encoding="utf-8",
            )

            completed = self.run_fixture(repo, env, "--all")

            self.assertEqual(completed.returncode, 0, completed.stderr)
            command_log = self.command_log(root)
            self.assertIn(f"link:{repo.resolve()}/harness/sample-ops", command_log)
            self.assertNotIn("do-not-install-ops", command_log)
            self.assertNotIn("original-skill", command_log)

    def test_plugin_selector_limits_installation_to_that_plugin(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)

            completed = self.run_fixture(repo, env, "--plugin", "dev-tools")

            self.assertEqual(completed.returncode, 0, completed.stderr)
            command_log = (root / "commands.log").read_text(encoding="utf-8")
            self.assertIn("install:plugin-one:", command_log)
            self.assertIn("install:plugin-two:", command_log)
            self.assertNotIn("standalone", command_log)
            self.assertNotIn("sample-ops", command_log)

    def test_plugin_selector_installs_a_declared_shared_root_skill(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/shared-plugin"
            shared_parent = plugin / "skills"
            shared_parent.mkdir(parents=True)
            (shared_parent / "standalone").symlink_to(
                repo / "skills/standalone",
                target_is_directory=True,
            )
            self.write_manifest(plugin, ["./skills/standalone/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertEqual(completed.returncode, 0, completed.stderr)
            command_log = (root / "commands.log").read_text(encoding="utf-8")
            self.assertIn(
                f"link:{(repo / 'skills/standalone').resolve()}",
                command_log,
            )
            self.assertIn("install:standalone:", command_log)

    def test_plugin_selector_rejects_a_declared_shared_skill_outside_repo(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            external_skill = root / "external/escaped"
            external_skill.mkdir(parents=True)
            (external_skill / "SKILL.md").write_text(
                "---\nname: escaped\ndescription: escaped\n---\n",
                encoding="utf-8",
            )
            plugin = repo / "plugins/shared-plugin"
            shared_parent = plugin / "skills"
            shared_parent.mkdir(parents=True)
            (shared_parent / "escaped").symlink_to(
                external_skill,
                target_is_directory=True,
            )
            self.write_manifest(plugin, ["./skills/escaped/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("根 skills/", completed.stderr)
            command_log = self.command_log(root)
            self.assertNotIn("link:", command_log)
            self.assertNotIn("install:", command_log)

    def test_plugin_selector_rejects_traversal_before_any_j_skills_call(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)

            completed = self.run_fixture(repo, env, "--plugin", "../dev-tools")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("kebab-case", completed.stderr)
            self.assertEqual(self.command_log(root), "")

    def test_plugin_selector_rejects_a_plugin_directory_symlink_before_j_skills(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            (repo / "plugins/linked-plugin").symlink_to(
                repo / "plugins/dev-tools",
                target_is_directory=True,
            )

            completed = self.run_fixture(repo, env, "--plugin", "linked-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("真实直接子目录", completed.stderr)
            self.assertEqual(self.command_log(root), "")

    def test_plugin_selector_rejects_a_symlinked_manifest_before_j_skills(self) -> None:
        for symlink_parent in (False, True):
            with self.subTest(symlink_parent=symlink_parent), tempfile.TemporaryDirectory() as tempdir:
                root = Path(tempdir)
                repo, env = self.make_install_fixture(root)
                plugin = repo / "plugins/dev-tools"
                manifest = plugin / ".claude-plugin/plugin.json"
                external_parent = root / "external-manifest"
                external_parent.mkdir()
                external_manifest = external_parent / "plugin.json"
                external_manifest.write_text(
                    manifest.read_text(encoding="utf-8"), encoding="utf-8"
                )
                if symlink_parent:
                    shutil.rmtree(manifest.parent)
                    manifest.parent.symlink_to(external_parent, target_is_directory=True)
                else:
                    manifest.unlink()
                    manifest.symlink_to(external_manifest)

                completed = self.run_fixture(repo, env, "--plugin", "dev-tools")

                self.assertNotEqual(completed.returncode, 0)
                self.assertIn("manifest", completed.stderr)
                self.assertEqual(self.command_log(root), "")

    def test_plugin_selector_rejects_archived_manifest_entry_before_j_skills(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/dev-tools"
            archived = plugin / "archived/old-skill"
            archived.mkdir(parents=True)
            (archived / "SKILL.md").write_text(
                "---\nname: old-skill\ndescription: test\n---\n",
                encoding="utf-8",
            )
            self.write_manifest(plugin, ["./archived/old-skill/"])

            completed = self.run_fixture(repo, env, "--plugin", "dev-tools")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("不在 Plugin 活跃内容中", completed.stderr)
            self.assertEqual(self.command_log(root), "")

    def test_plugin_selector_rejects_newline_path_injection_before_j_skills(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/dev-tools"
            external_skill = root / "external/escaped"
            external_skill.mkdir(parents=True)
            external_skill_file = external_skill / "SKILL.md"
            external_skill_file.write_text(
                "---\nname: escaped\ndescription: escaped\n---\n",
                encoding="utf-8",
            )
            injected_entry = "./skills/line\n" + external_skill.as_posix() + "/"
            injected_directory = plugin / injected_entry
            injected_directory.mkdir(parents=True)
            (injected_directory / "SKILL.md").write_text(
                "---\nname: injected\ndescription: injected\n---\n",
                encoding="utf-8",
            )
            self.write_manifest(plugin, [injected_entry])
            temp_root = root / "tmp"
            temp_root.mkdir()
            env["TMPDIR"] = str(temp_root)

            completed = self.run_fixture(repo, env, "--plugin", "dev-tools")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("不安全字符或路径片段", completed.stderr)
            command_log = self.command_log(root)
            self.assertEqual(command_log, "")
            self.assertNotIn(external_skill_file.as_posix(), command_log)
            self.assertEqual(list(temp_root.iterdir()), [])

    def test_plugin_selector_rejects_control_and_cross_platform_paths_before_j_skills(self) -> None:
        dangerous_entries = (
            "./skills/bad\rname/",
            "./skills/bad\x00name/",
            "./skills/bad\x1bname/",
            ".\\skills\\standalone\\",
            "C:/skills/standalone/",
            "./skills/../standalone/",
        )
        for entry in dangerous_entries:
            with self.subTest(entry=repr(entry)), tempfile.TemporaryDirectory() as tempdir:
                root = Path(tempdir)
                repo, env = self.make_install_fixture(root)
                self.write_manifest(repo / "plugins/dev-tools", [entry])

                completed = self.run_fixture(repo, env, "--plugin", "dev-tools")

                self.assertNotEqual(completed.returncode, 0)
                self.assertIn("不安全字符或路径片段", completed.stderr)
                self.assertEqual(self.command_log(root), "")

    def test_plugin_selector_rejects_a_symlinked_root_skills_directory(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            real_skills = repo / "real-skills"
            (repo / "skills").rename(real_skills)
            (repo / "skills").symlink_to(real_skills, target_is_directory=True)
            plugin = repo / "plugins/shared-plugin"
            shared = plugin / "skills/standalone"
            shared.parent.mkdir(parents=True)
            shared.symlink_to(repo / "skills/standalone", target_is_directory=True)
            self.write_manifest(plugin, ["./skills/standalone/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("根 skills/ 必须是真实目录", completed.stderr)

    def test_plugin_selector_rejects_missing_root_skills_for_ordinary_plugin(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            shutil.rmtree(repo / "skills")

            completed = self.run_fixture(repo, env, "--plugin", "dev-tools")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("根 skills/ 必须是真实目录", completed.stderr)

    def test_plugin_selector_rejects_shared_target_with_symlinked_skill_file(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            skill_file = repo / "skills/standalone/SKILL.md"
            external_file = root / "external-SKILL.md"
            external_file.write_text(skill_file.read_text(encoding="utf-8"), encoding="utf-8")
            skill_file.unlink()
            skill_file.symlink_to(external_file)
            plugin = repo / "plugins/shared-plugin"
            shared = plugin / "skills/standalone"
            shared.parent.mkdir(parents=True)
            shared.symlink_to(repo / "skills/standalone", target_is_directory=True)
            self.write_manifest(plugin, ["./skills/standalone/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("SKILL.md 必须是普通文件", completed.stderr)

    def test_plugin_selector_rejects_shared_link_to_a_file(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/shared-plugin"
            shared = plugin / "skills/standalone"
            shared.parent.mkdir(parents=True)
            shared.symlink_to(repo / "skills/standalone/SKILL.md")
            self.write_manifest(plugin, ["./skills/standalone/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("目标必须是目录", completed.stderr)

    def test_plugin_selector_rejects_an_undeclared_shared_alias(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/shared-plugin"
            shared_parent = plugin / "skills"
            shared_parent.mkdir(parents=True)
            for name in ("standalone", "extra-alias"):
                (shared_parent / name).symlink_to(
                    repo / "skills/standalone", target_is_directory=True
                )
            self.write_manifest(plugin, ["./skills/standalone/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("未在 manifest.skills 声明", completed.stderr)

    def test_plugin_selector_rejects_duplicate_shared_targets(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/shared-plugin"
            shared_parent = plugin / "skills"
            shared_parent.mkdir(parents=True)
            for name in ("standalone", "second-alias"):
                (shared_parent / name).symlink_to(
                    repo / "skills/standalone", target_is_directory=True
                )
            self.write_manifest(
                plugin,
                ["./skills/standalone/", "./skills/second-alias/"],
            )

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("重复指向", completed.stderr)

    def test_plugin_selector_rejects_an_extra_ordinary_skills_entry(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)
            plugin = repo / "plugins/shared-plugin"
            declared = plugin / "skills/declared"
            extra = plugin / "skills/extra"
            for name, directory in (("declared", declared), ("extra", extra)):
                directory.mkdir(parents=True, exist_ok=True)
                (directory / "SKILL.md").write_text(
                    f"---\nname: {name}\ndescription: test\n---\n",
                    encoding="utf-8",
                )
            self.write_manifest(plugin, ["./skills/declared/"])

            completed = self.run_fixture(repo, env, "--plugin", "shared-plugin")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("未在 manifest.skills 声明", completed.stderr)

    def test_rejects_multiple_selectors(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root)

            completed = self.run_fixture(
                repo, env, "--all", "--skill", "standalone"
            )

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("只能选择一个", completed.stderr)

    def test_rejects_an_unverified_j_skills_version(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            repo, env = self.make_install_fixture(root, j_skills_version="9.9.9")

            completed = self.run_fixture(repo, env, "--all")

            self.assertNotEqual(completed.returncode, 0)
            self.assertIn("需要 j-skills 0.1.0", completed.stderr)


class DistributionConsistencyTests(unittest.TestCase):
    def test_root_marketplace_is_the_only_marketplace_source(self) -> None:
        nested_marketplaces = sorted(
            ROOT.glob("plugins/*/.claude-plugin/marketplace.json")
        )
        self.assertEqual(nested_marketplaces, [])

    def test_plugin_manifests_exactly_match_skill_files(self) -> None:
        for manifest_file in sorted(
            ROOT.glob("plugins/*/.claude-plugin/plugin.json")
        ):
            plugin_root = manifest_file.parents[1]
            manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
            declared_directories = [
                Path(os.path.abspath(plugin_root / relative))
                for relative in manifest["skills"]
            ]
            declared = set(declared_directories)
            self.assertEqual(len(declared), len(declared_directories), manifest_file)
            actual = {
                Path(os.path.abspath(path.parent))
                for path in plugin_root.rglob("SKILL.md")
                if "archived" not in path.parts
            }
            nested_root = plugin_root / "skills"
            if nested_root.is_dir() and not nested_root.is_symlink():
                actual.update(
                    Path(os.path.abspath(directory))
                    for directory in nested_root.iterdir()
                    if directory.is_dir() or directory.is_symlink()
                )
            self.assertEqual(declared, actual, manifest_file.as_posix())
            for directory in declared_directories:
                skill_path = directory / "SKILL.md"
                self.assertTrue(skill_path.is_file(), skill_path.as_posix())
                self.assertFalse(skill_path.is_symlink(), skill_path.as_posix())
                if directory.is_symlink():
                    root_skills = ROOT / "skills"
                    self.assertTrue(root_skills.is_dir())
                    self.assertFalse(root_skills.is_symlink())
                    self.assertEqual(
                        directory.resolve().parent,
                        root_skills.resolve(),
                        directory,
                    )

    def test_marketplace_covers_every_plugin_with_matching_version(self) -> None:
        marketplace = json.loads(
            (ROOT / ".claude-plugin/marketplace.json").read_text(encoding="utf-8")
        )
        entries = {entry["name"]: entry for entry in marketplace["plugins"]}
        manifests = {}
        for manifest_file in ROOT.glob("plugins/*/.claude-plugin/plugin.json"):
            manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
            manifests[manifest["name"]] = (manifest_file, manifest)

        self.assertEqual(set(entries), set(manifests))
        for name, (manifest_file, manifest) in manifests.items():
            entry = entries[name]
            self.assertEqual(entry["version"], manifest["version"], name)
            self.assertEqual(
                (ROOT / entry["source"]).resolve(),
                manifest_file.parents[1].resolve(),
                name,
            )

    def test_readme_lists_current_plugins_and_standalone_skills(self) -> None:
        for manifest_file in ROOT.glob("plugins/*/.claude-plugin/plugin.json"):
            manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
            plugin_dir = manifest_file.parents[1].name
            expected_row = (
                f"| [{manifest['name']}](./plugins/{plugin_dir}) | "
                f"{manifest['version']} |"
            )
            self.assertIn(expected_row, README)
            for relative in manifest["skills"]:
                name = skill_name(manifest_file.parents[1] / relative / "SKILL.md")
                self.assertIn(name, README)

        for root_name in ("skills", "harness"):
            for skill_file in ROOT.glob(f"{root_name}/*/SKILL.md"):
                self.assertIn(skill_name(skill_file), README)


if __name__ == "__main__":
    unittest.main()
