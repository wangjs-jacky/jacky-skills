import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INITIALIZER = ROOT / "labs/goal-first-workflow/scripts/init-goal-project.mjs"


class GoalFirstWorkflowInitializerTests(unittest.TestCase):
    def run_initializer(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["node", str(INITIALIZER), *arguments],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_initializes_nested_destination_with_root_workspace_files(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "nested" / "goal"

            result = self.run_initializer(str(destination))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertTrue((destination / "AGENTS.md").is_file())
            self.assertTrue((destination / "PROMPT.md").is_file())
            self.assertTrue((destination / "problem.md").is_file())
            self.assertTrue((destination / "tasks").is_dir())
            self.assertEqual(list((destination / "tasks").iterdir()), [])

    def test_refuses_to_overwrite_a_non_empty_destination(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "goal"
            destination.mkdir()
            sentinel = destination / "keep.txt"
            sentinel.write_text("preserve me", encoding="utf-8")

            result = self.run_initializer(str(destination))

            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(sentinel.read_text(encoding="utf-8"), "preserve me")
            self.assertFalse((destination / "AGENTS.md").exists())

    def test_requires_exactly_one_destination_argument(self):
        self.assertNotEqual(self.run_initializer().returncode, 0)
        self.assertNotEqual(self.run_initializer("one", "two").returncode, 0)

    def test_generated_workspace_is_neutral_and_portable(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "goal"

            result = self.run_initializer(str(destination))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            generated_markdown = "\n".join(
                file.read_text(encoding="utf-8")
                for file in sorted(destination.rglob("*.md"))
            ).lower()
            for forbidden in ("/users/", "qv2ray", "cloudflare", "xray"):
                self.assertNotIn(forbidden, generated_markdown)

    def test_skill_allows_redacted_project_specific_context(self):
        skill = (ROOT / "labs/goal-first-workflow/SKILL.md").read_text(
            encoding="utf-8"
        )

        self.assertIn("可复用 Skill、静态模板和规则必须保持领域中性", skill)
        self.assertIn("工作区可以保存必要且脱敏的项目上下文", skill)


if __name__ == "__main__":
    unittest.main()
