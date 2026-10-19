import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "audit_skills.py"


class AuditSkillsCliTest(unittest.TestCase):
    def run_audit(self, repo: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT), *arguments],
            cwd=repo,
            capture_output=True,
            text=True,
            check=False,
        )

    def write_skill(
        self,
        repo: Path,
        relative_directory: str,
        *,
        name: str | None = None,
        description: str = "Demo skill",
        body: str = "# Demo\n",
    ) -> Path:
        skill_dir = repo / relative_directory
        skill_dir.mkdir(parents=True)
        skill_name = name if name is not None else skill_dir.name
        skill_file = skill_dir / "SKILL.md"
        skill_file.write_text(
            f"---\nname: {skill_name}\ndescription: {description}\n---\n\n{body}",
            encoding="utf-8",
        )
        return skill_file

    def write_manifest(self, repo: Path, plugin: str, skills: list[str]) -> Path:
        (repo / "skills").mkdir(parents=True, exist_ok=True)
        manifest = repo / "plugins" / plugin / ".claude-plugin" / "plugin.json"
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(
            json.dumps({"name": plugin, "version": "1.0.0", "skills": skills}),
            encoding="utf-8",
        )
        return manifest

    def test_valid_root_skill_passes(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "skills/demo-skill")

            result = self.run_audit(repo)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("0 error(s)", result.stdout)

    def test_valid_harness_ops_skill_passes(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "harness/demo-ops")

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(payload["summary"]["skills"], 1)

    def test_harness_goal_archives_are_not_discovered_as_active_skills(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "harness/demo-ops")
            self.write_skill(
                repo,
                "harness/demo-ops/projects/demo/features/research/original-skill",
                name="archived-experiment",
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(payload["summary"]["skills"], 1)
        self.assertEqual(payload["errors"], [])

    def test_harness_skill_requires_ops_suffix(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "harness/demo-harness")

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "harness_name_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_json_output_is_machine_readable(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "skills/demo-skill")

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(payload["summary"]["skills"], 1)
        self.assertEqual(payload["summary"]["errors"], 0)
        self.assertEqual(payload["errors"], [])

    def test_frontmatter_and_name_errors_fail_the_audit(self):
        cases = {
            "missing-frontmatter": ("# Demo\n", "frontmatter_missing"),
            "invalid-yaml": ("---\nname: [broken\n---\n", "frontmatter_invalid"),
            "missing-name": ("---\ndescription: Demo\n---\n", "name_missing"),
            "missing-description": ("---\nname: demo-skill\n---\n", "description_missing"),
            "invalid-name": (
                "---\nname: Demo_Skill\ndescription: Demo\n---\n",
                "name_invalid",
            ),
            "mismatched-name": (
                "---\nname: other-skill\ndescription: Demo\n---\n",
                "name_directory_mismatch",
            ),
            "unexpected-field": (
                "---\nname: demo-skill\ndescription: Demo\nargument-hint: demo\n---\n",
                "frontmatter_key_unsupported",
            ),
            "angle-description": (
                "---\nname: demo-skill\ndescription: Use <path>\n---\n",
                "description_invalid",
            ),
        }

        for label, (content, expected_code) in cases.items():
            with self.subTest(label=label), tempfile.TemporaryDirectory() as directory:
                repo = Path(directory)
                skill_dir = repo / "skills" / "demo-skill"
                skill_dir.mkdir(parents=True)
                (skill_dir / "SKILL.md").write_text(content, encoding="utf-8")

                result = self.run_audit(repo, "--format", "json")
                payload = json.loads(result.stdout)

                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertIn(expected_code, {item["code"] for item in payload["errors"]})

    def test_archived_skills_are_not_active(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            archived = repo / "archived" / "Bad_Name" / "SKILL.md"
            archived.parent.mkdir(parents=True)
            archived.write_text("not frontmatter", encoding="utf-8")

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(payload["summary"]["skills"], 0)

    def test_invalid_plugin_json_fails_the_audit(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            manifest = repo / "plugins" / "demo-plugin" / ".claude-plugin" / "plugin.json"
            manifest.parent.mkdir(parents=True)
            manifest.write_text("{not-json", encoding="utf-8")

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn("plugin_json_invalid", {item["code"] for item in payload["errors"]})

    def test_audit_rejects_symlinked_plugins_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = root / "repo"
            external_plugins = root / "external-plugins"
            self.write_skill(external_plugins, "demo-plugin/demo-skill")
            (repo / "skills").mkdir(parents=True)
            repo.mkdir(exist_ok=True)
            (repo / "plugins").symlink_to(external_plugins, target_is_directory=True)

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("plugins_root_invalid", {item["code"] for item in payload["errors"]})

    def test_audit_rejects_symlinked_plugin_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = root / "repo"
            external_plugin = root / "external-plugin"
            self.write_skill(external_plugin, "demo-skill")
            (repo / "skills").mkdir(parents=True)
            (repo / "plugins").mkdir(parents=True)
            (repo / "plugins/demo-plugin").symlink_to(
                external_plugin, target_is_directory=True
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("plugin_directory_invalid", {item["code"] for item in payload["errors"]})

    def test_audit_rejects_symlinked_manifest_and_manifest_parent(self):
        for symlink_parent in (False, True):
            with self.subTest(symlink_parent=symlink_parent), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                repo = root / "repo"
                plugin = repo / "plugins/demo-plugin"
                plugin.mkdir(parents=True)
                (repo / "skills").mkdir()
                external_parent = root / "external-manifest"
                external_parent.mkdir()
                external_manifest = external_parent / "plugin.json"
                external_manifest.write_text(
                    json.dumps({"name": "demo-plugin", "version": "1.0.0", "skills": []}),
                    encoding="utf-8",
                )
                manifest_parent = plugin / ".claude-plugin"
                if symlink_parent:
                    manifest_parent.symlink_to(external_parent, target_is_directory=True)
                else:
                    manifest_parent.mkdir()
                    (manifest_parent / "plugin.json").symlink_to(external_manifest)

                result = self.run_audit(repo, "--format", "json")
                payload = json.loads(result.stdout)

            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn(
                "plugin_manifest_invalid",
                {item["code"] for item in payload["errors"]},
            )

    def test_plugin_manifest_detects_missing_and_undeclared_skills(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "plugins/demo-plugin/actual-skill")
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./missing-skill/"],
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)
            codes = {item["code"] for item in payload["errors"]}

        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn("manifest_skill_path_missing", codes)
        self.assertIn("plugin_skill_undeclared", codes)

    def test_plugin_manifest_rejects_archived_declaration(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "plugins/demo-plugin/archived/old-skill")
            self.write_manifest(repo, "demo-plugin", ["./archived/old-skill/"])

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "manifest_skill_not_active",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_control_and_cross_platform_paths(self):
        dangerous_entries = (
            "./skills/line\nname/",
            "./skills/line\rname/",
            "./skills/bad\x00name/",
            "./skills/bad\x1bname/",
            ".\\skills\\demo-skill\\",
            "C:/skills/demo-skill/",
            "./skills/../demo-skill/",
        )
        for entry in dangerous_entries:
            with self.subTest(entry=repr(entry)), tempfile.TemporaryDirectory() as directory:
                repo = Path(directory)
                self.write_manifest(repo, "demo-plugin", [entry])

                result = self.run_audit(repo, "--format", "json")
                payload = json.loads(result.stdout)

            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn(
                "manifest_skill_path_invalid",
                {item["code"] for item in payload["errors"]},
            )

    def test_plugin_manifest_accepts_both_supported_skill_layouts(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "plugins/demo-plugin/direct-skill")
            self.write_skill(repo, "plugins/demo-plugin/skills/nested-skill")
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./direct-skill/", "./skills/nested-skill/"],
            )

            result = self.run_audit(repo)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_plugin_manifest_requires_real_root_skills_for_ordinary_plugin(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "plugins/demo-plugin/direct-skill")
            self.write_manifest(repo, "demo-plugin", ["./direct-skill/"])
            (repo / "skills").rmdir()

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "shared_skills_root_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_accepts_declared_link_to_root_skill(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            root_skill = self.write_skill(repo, "skills/demo-skill")
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(root_skill.parent, target_is_directory=True)
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./skills/demo-skill/"],
            )

            result = self.run_audit(repo, "--format", "json")

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_plugin_manifest_rejects_shared_link_outside_repo(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = root / "repo"
            (repo / "skills").mkdir(parents=True)
            external_skill = self.write_skill(root, "external/demo-skill")
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(external_skill.parent, target_is_directory=True)
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./skills/demo-skill/"],
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "manifest_skill_path_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_shared_link_to_non_skills_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            (repo / "skills").mkdir(parents=True)
            harness_skill = self.write_skill(repo, "harness/demo-ops")
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(harness_skill.parent, target_is_directory=True)
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./skills/demo-skill/"],
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "manifest_skill_path_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_undeclared_shared_skill_link(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            root_skill = self.write_skill(repo, "skills/demo-skill")
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(root_skill.parent, target_is_directory=True)
            self.write_manifest(repo, "demo-plugin", [])

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "plugin_skill_undeclared",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_undeclared_alias_to_declared_target(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            root_skill = self.write_skill(repo, "skills/demo-skill")
            shared_parent = repo / "plugins/demo-plugin/skills"
            shared_parent.mkdir(parents=True)
            for name in ("demo-skill", "extra-alias"):
                (shared_parent / name).symlink_to(
                    root_skill.parent, target_is_directory=True
                )
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./skills/demo-skill/"],
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "plugin_skill_undeclared",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_duplicate_shared_targets(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            root_skill = self.write_skill(repo, "skills/demo-skill")
            shared_parent = repo / "plugins/demo-plugin/skills"
            shared_parent.mkdir(parents=True)
            for name in ("demo-skill", "second-alias"):
                (shared_parent / name).symlink_to(
                    root_skill.parent, target_is_directory=True
                )
            self.write_manifest(
                repo,
                "demo-plugin",
                ["./skills/demo-skill/", "./skills/second-alias/"],
            )

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "manifest_skill_target_duplicate",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_symlinked_root_skills_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            root_skill = self.write_skill(repo, "real-skills/demo-skill")
            (repo / "skills").symlink_to(
                root_skill.parent.parent, target_is_directory=True
            )
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(
                repo / "skills/demo-skill", target_is_directory=True
            )
            self.write_manifest(repo, "demo-plugin", ["./skills/demo-skill/"])

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "shared_skills_root_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_symlinked_skill_file(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = root / "repo"
            root_skill = self.write_skill(repo, "skills/demo-skill")
            external = root / "external-SKILL.md"
            external.write_text(root_skill.read_text(encoding="utf-8"), encoding="utf-8")
            root_skill.unlink()
            root_skill.symlink_to(external)
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(root_skill.parent, target_is_directory=True)
            self.write_manifest(repo, "demo-plugin", ["./skills/demo-skill/"])

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "manifest_skill_file_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_shared_link_to_file(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            root_skill = self.write_skill(repo, "skills/demo-skill")
            plugin_skill = repo / "plugins/demo-plugin/skills/demo-skill"
            plugin_skill.parent.mkdir(parents=True)
            plugin_skill.symlink_to(root_skill)
            self.write_manifest(repo, "demo-plugin", ["./skills/demo-skill/"])

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "manifest_skill_path_invalid",
            {item["code"] for item in payload["errors"]},
        )

    def test_plugin_manifest_rejects_extra_ordinary_skills_entry(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "plugins/demo-plugin/skills/declared")
            self.write_skill(repo, "plugins/demo-plugin/skills/extra")
            self.write_manifest(repo, "demo-plugin", ["./skills/declared/"])

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(
            "plugin_skill_undeclared",
            {item["code"] for item in payload["errors"]},
        )

    def test_skill_over_500_lines_is_warning_only(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            self.write_skill(repo, "skills/long-skill", body="line\n" * 501)

            result = self.run_audit(repo, "--format", "json")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("skill_too_long", {item["code"] for item in payload["warnings"]})

    def test_shared_content_scan_checks_tracked_and_untracked_nonignored_files(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
            (repo / "notes.md").write_text(
                "/"
                + "Users/alice/private\n"
                + "ghp_"
                + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij\n"
                + "Trip"
                + ".com internal framework\n",
                encoding="utf-8",
            )
            (repo / "experience.local.md").write_text(
                "/"
                + "Users/ignored/private\n"
                + "ghp_"
                + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij\n",
                encoding="utf-8",
            )
            (repo / "untracked.md").write_text(
                "/" + "Users/untracked/private\n",
                encoding="utf-8",
            )
            (repo / "ignored.md").write_text(
                "/" + "Users/ignored/private\n",
                encoding="utf-8",
            )
            (repo / ".gitignore").write_text("ignored.md\n", encoding="utf-8")
            subprocess.run(
                [
                    "git",
                    "-C",
                    str(repo),
                    "add",
                    "notes.md",
                    "experience.local.md",
                    ".gitignore",
                ],
                check=True,
            )

            result = self.run_audit(repo, "--format", "json", "--scan-shared-content")
            payload = json.loads(result.stdout)
            paths = {item["path"] for item in payload["errors"]}
            codes = {item["code"] for item in payload["errors"]}

        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(paths, {"notes.md", "untracked.md"})
        self.assertEqual(
            codes,
            {"hardcoded_user_path", "obvious_secret", "company_content"},
        )

    def test_shared_content_scan_allows_environment_variable_references(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
            (repo / "config.js").write_text(
                "const apiKey = process.env.DATA_API_KEY;\n",
                encoding="utf-8",
            )
            subprocess.run(
                ["git", "-C", str(repo), "add", "config.js"],
                check=True,
            )

            result = self.run_audit(repo, "--format", "json", "--scan-shared-content")
            payload = json.loads(result.stdout)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(payload["errors"], [])


if __name__ == "__main__":
    unittest.main()
