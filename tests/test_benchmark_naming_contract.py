import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

BENCHMARK_MIGRATIONS = {
    "plugins/evaluators/harness-evaluator": "plugins/evaluators/harness-benchmark",
    "plugins/obsidian-tools/ob-rate": "plugins/obsidian-tools/ob-benchmark",
    "labs/web-flow/web-flow-review": "labs/web-flow/web-flow-benchmark",
}


def frontmatter_name(skill_file: Path) -> str:
    content = skill_file.read_text(encoding="utf-8")
    match = re.search(r"(?m)^name:\s*[\"']?([^\"'\n]+)[\"']?\s*$", content)
    if not match:
        raise AssertionError(f"{skill_file} 缺少 frontmatter name")
    return match.group(1).strip()


class BenchmarkNamingContractTests(unittest.TestCase):
    def test_scoring_skills_use_benchmark_suffix(self) -> None:
        for legacy_relative, benchmark_relative in BENCHMARK_MIGRATIONS.items():
            with self.subTest(skill=benchmark_relative):
                legacy_dir = ROOT / legacy_relative
                benchmark_dir = ROOT / benchmark_relative
                skill_file = benchmark_dir / "SKILL.md"

                self.assertFalse(legacy_dir.exists(), f"旧 Skill 目录仍存在：{legacy_relative}")
                self.assertTrue(skill_file.is_file(), f"新 Skill 不存在：{benchmark_relative}")
                self.assertTrue(benchmark_dir.name.endswith("-benchmark"))
                self.assertEqual(frontmatter_name(skill_file), benchmark_dir.name)

    def test_claude_documents_benchmark_naming_rule(self) -> None:
        claude = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
        self.assertIn(
            "以量化评分、打分或基准评测为核心职责的 Skill，名称必须使用 `-benchmark` 后缀",
            claude,
        )


if __name__ == "__main__":
    unittest.main()
