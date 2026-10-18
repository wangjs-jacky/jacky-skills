#!/usr/bin/env python3
"""审计仓库中的 Skill 元数据与 Plugin 清单一致性。"""

from __future__ import annotations

import argparse
import json
import os
import re
import stat
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable

import yaml


KEBAB_CASE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
IGNORED_PARTS = {"archived", "node_modules", ".git"}
ALLOWED_FRONTMATTER_KEYS = {
    "allowed-tools",
    "description",
    "license",
    "metadata",
    "name",
}
HARDCODED_USER_PATH = re.compile(r"(?<![\w])/(?:Users|home)/[A-Za-z0-9._-]+/")
OBVIOUS_SECRET_PATTERNS = (
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bAKIA[A-Z0-9]{16}\b"),
    re.compile(r"\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b", re.IGNORECASE),
    re.compile(
        r"\b(?:api[_-]?key|access[_-]?token|password)\s*[:=]\s*"
        r"[\"'](?![<$])[A-Za-z0-9._~+/=-]{20,}[\"']",
        re.IGNORECASE,
    ),
)
PROHIBITED_COMPANY_TERMS = (
    chr(0x643A) + chr(0x7A0B),
    "Trip" + ".com",
    "C" + "trip",
    "x" + "Taro",
    "Test" + "Hub",
    "@" + "c" + "trip/",
    "c" + "trip" + "corp",
    "mock" + "-business",
)
PROHIBITED_COMPANY_CONTENT = re.compile(
    "|".join(re.escape(term) for term in PROHIBITED_COMPANY_TERMS)
    + r"|\b"
    + re.escape("h" + "ta")
    + r"(?:\.config\.js)?\b",
    re.IGNORECASE,
)
SHARED_SCAN_EXCLUDED = {
    "plugins/skill-stats/skill-stats/tests/test_skill_usage_log.py",
    "tests/test_audit_skills.py",
}


@dataclass(frozen=True)
class Issue:
    code: str
    path: str
    message: str


@dataclass
class AuditResult:
    repo: Path
    skills: int = 0
    plugins: int = 0
    errors: list[Issue] | None = None
    warnings: list[Issue] | None = None

    def __post_init__(self) -> None:
        if self.errors is None:
            self.errors = []
        if self.warnings is None:
            self.warnings = []

    def error(self, code: str, path: Path | str, message: str) -> None:
        assert self.errors is not None
        self.errors.append(Issue(code, self.relative_path(path), message))

    def warning(self, code: str, path: Path | str, message: str) -> None:
        assert self.warnings is not None
        self.warnings.append(Issue(code, self.relative_path(path), message))

    def relative_path(self, path: Path | str) -> str:
        candidate = Path(path)
        try:
            return candidate.resolve().relative_to(self.repo).as_posix()
        except (OSError, ValueError):
            return candidate.as_posix()

    def payload(self) -> dict[str, Any]:
        errors = sorted(self.errors or [], key=lambda item: (item.path, item.code))
        warnings = sorted(self.warnings or [], key=lambda item: (item.path, item.code))
        return {
            "repo": str(self.repo),
            "errors": [asdict(item) for item in errors],
            "warnings": [asdict(item) for item in warnings],
            "summary": {
                "skills": self.skills,
                "plugins": self.plugins,
                "errors": len(errors),
                "warnings": len(warnings),
            },
        }


def is_active_path(path: Path, repo: Path) -> bool:
    try:
        parts = path.relative_to(repo).parts
    except ValueError:
        return False
    return not any(part in IGNORED_PARTS for part in parts)


def find_active_skill_files(repo: Path, plugins: Iterable[Path]) -> list[Path]:
    skill_files: list[Path] = []
    roots = [repo / "skills", repo / "harness", *plugins]
    for root in roots:
        try:
            metadata = root.lstat()
        except OSError:
            continue
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode):
            continue
        for directory, children, filenames in os.walk(root):
            children[:] = [
                name for name in children if name not in IGNORED_PARTS
            ]
            skill_file = Path(directory) / "SKILL.md"
            if "SKILL.md" not in filenames or not skill_file.is_file():
                continue
            if is_active_path(skill_file, repo):
                skill_files.append(skill_file)
            if root in (repo / "skills", repo / "harness"):
                # A Skill owns its goal archives and embedded source examples.
                children[:] = []
    return sorted(set(skill_files))


def parse_frontmatter(skill_file: Path, result: AuditResult) -> None:
    try:
        content = skill_file.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        result.error("skill_unreadable", skill_file, f"无法读取 SKILL.md：{exc}")
        return

    lines = content.splitlines()
    if len(lines) > 500:
        result.warning(
            "skill_too_long",
            skill_file,
            f"SKILL.md 共 {len(lines)} 行，建议将大段内容拆到 references/ 或 scripts/",
        )

    if not lines or lines[0].strip() != "---":
        result.error("frontmatter_missing", skill_file, "SKILL.md 必须以 YAML frontmatter 开头")
        return

    try:
        closing_index = next(
            index for index, line in enumerate(lines[1:], start=1) if line.strip() == "---"
        )
    except StopIteration:
        result.error("frontmatter_missing", skill_file, "YAML frontmatter 缺少结束分隔符 ---")
        return

    raw_frontmatter = "\n".join(lines[1:closing_index])
    try:
        metadata = yaml.safe_load(raw_frontmatter)
    except yaml.YAMLError as exc:
        result.error("frontmatter_invalid", skill_file, f"YAML frontmatter 无法解析：{exc}")
        return

    if not isinstance(metadata, dict):
        result.error("frontmatter_invalid", skill_file, "YAML frontmatter 必须是键值映射")
        return

    unsupported_keys = sorted(set(metadata) - ALLOWED_FRONTMATTER_KEYS)
    if unsupported_keys:
        result.error(
            "frontmatter_key_unsupported",
            skill_file,
            "frontmatter 包含不支持的字段：" + ", ".join(unsupported_keys),
        )

    name = metadata.get("name")
    description = metadata.get("description")

    if not isinstance(name, str) or not name.strip():
        result.error("name_missing", skill_file, "frontmatter 必须包含非空 name")
    else:
        if not KEBAB_CASE.fullmatch(name):
            result.error("name_invalid", skill_file, "name 必须使用 kebab-case")
        if name != skill_file.parent.name:
            result.error(
                "name_directory_mismatch",
                skill_file,
                f"name '{name}' 必须与目录名 '{skill_file.parent.name}' 一致",
            )
        try:
            relative_parts = skill_file.relative_to(result.repo).parts
        except ValueError:
            relative_parts = ()
        if relative_parts and relative_parts[0] == "harness" and not name.endswith("-ops"):
            result.error(
                "harness_name_invalid",
                skill_file,
                "harness/ 下的 Skill 必须使用 <target>-ops 命名",
            )

    if not isinstance(description, str) or not description.strip():
        result.error("description_missing", skill_file, "frontmatter 必须包含非空 description")
    elif "<" in description or ">" in description:
        result.error(
            "description_invalid",
            skill_file,
            "description 不得包含尖括号占位符",
        )


def plugin_directories(repo: Path, result: AuditResult) -> list[Path]:
    plugins_root = repo / "plugins"
    try:
        root_metadata = plugins_root.lstat()
    except FileNotFoundError:
        return []
    except OSError as exc:
        result.error("plugins_root_invalid", plugins_root, f"无法检查 plugins/：{exc}")
        return []
    if stat.S_ISLNK(root_metadata.st_mode) or not stat.S_ISDIR(root_metadata.st_mode):
        result.error(
            "plugins_root_invalid",
            plugins_root,
            "plugins/ 必须是仓库内的真实目录，不能是软链接",
        )
        return []
    canonical_root = plugins_root.resolve()
    if canonical_root.parent != repo or canonical_root.name != "plugins":
        result.error(
            "plugins_root_invalid",
            plugins_root,
            "plugins/ 的规范路径必须是仓库直接子目录",
        )
        return []

    plugins: list[Path] = []
    for path in sorted(plugins_root.iterdir()):
        if path.name.startswith(".") or path.name == "archived":
            continue
        try:
            metadata = path.lstat()
        except OSError as exc:
            result.error("plugin_directory_invalid", path, f"无法检查 Plugin 目录：{exc}")
            continue
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode):
            result.error(
                "plugin_directory_invalid",
                path,
                "Plugin 必须是 plugins/ 下的真实直接子目录，不能是软链接",
            )
            continue
        canonical_plugin = path.resolve()
        if canonical_plugin.parent != canonical_root:
            result.error(
                "plugin_directory_invalid",
                path,
                "Plugin 的规范路径必须是 plugins/ 的直接子目录",
            )
            continue
        plugins.append(path)
    return plugins


def plugin_skill_entries(
    plugin: Path, active_skill_files: Iterable[Path]
) -> dict[Path, Path]:
    entries = {
        Path(os.path.abspath(skill_file.parent)): skill_file
        for skill_file in active_skill_files
        if plugin in skill_file.parents
    }
    nested_root = plugin / "skills"
    if nested_root.is_dir() and not nested_root.is_symlink():
        for candidate in nested_root.iterdir():
            if candidate.is_symlink() or candidate.is_dir():
                lexical_path = Path(os.path.abspath(candidate))
                entries[lexical_path] = candidate / "SKILL.md"
    return entries


def parse_manifest(manifest: Path, result: AuditResult) -> dict[str, Any] | None:
    try:
        data = json.loads(manifest.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        result.error("plugin_json_invalid", manifest, f"Plugin JSON 无法解析：{exc}")
        return None
    if not isinstance(data, dict):
        result.error("plugin_json_invalid", manifest, "Plugin JSON 顶层必须是对象")
        return None
    return data


def is_safe_manifest_skill_entry(entry: object) -> bool:
    if not isinstance(entry, str) or not entry.strip():
        return False
    if re.search(r"[\x00-\x1f\x7f\\]", entry):
        return False
    if not entry.startswith("./"):
        return False
    segments = entry[2:].split("/")
    if segments and segments[-1] == "":
        segments.pop()
    if not segments:
        return False
    windows_device = re.compile(
        r"^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)", re.IGNORECASE
    )
    return all(
        segment not in {"", ".", ".."}
        and not re.search(r'[<>:"|?*]', segment)
        and not segment.endswith((".", " "))
        and not windows_device.match(segment)
        for segment in segments
    )


def validate_root_skills(repo: Path, result: AuditResult) -> Path | None:
    candidate = repo / "skills"
    try:
        metadata = candidate.lstat()
    except OSError:
        metadata = None
    if metadata is None or not stat.S_ISDIR(metadata.st_mode) or candidate.is_symlink():
        result.error(
            "shared_skills_root_invalid",
            candidate,
            "仓库根 skills/ 必须是真实目录，不能是软链接",
        )
        return None
    resolved = candidate.resolve()
    if resolved.parent != repo or resolved.name != "skills":
        result.error(
            "shared_skills_root_invalid",
            candidate,
            "仓库根 skills/ 的规范路径必须是仓库直接子目录",
        )
        return None
    return resolved


def audit_plugin(
    plugin: Path,
    active_skill_files: list[Path],
    result: AuditResult,
    shared_skills_root: Path | None,
) -> None:
    manifest = plugin / ".claude-plugin" / "plugin.json"
    manifest_parent = manifest.parent
    try:
        parent_metadata = manifest_parent.lstat()
    except OSError:
        result.error("plugin_manifest_missing", manifest, "Plugin 缺少 .claude-plugin/plugin.json")
        return
    if (
        stat.S_ISLNK(parent_metadata.st_mode)
        or not stat.S_ISDIR(parent_metadata.st_mode)
        or manifest_parent.resolve() != plugin.resolve() / ".claude-plugin"
    ):
        result.error(
            "plugin_manifest_invalid",
            manifest_parent,
            "Plugin manifest 的父目录必须是 Plugin 内的真实目录",
        )
        return
    try:
        manifest_metadata = manifest.lstat()
    except OSError:
        result.error("plugin_manifest_missing", manifest, "Plugin 缺少 .claude-plugin/plugin.json")
        return
    if stat.S_ISLNK(manifest_metadata.st_mode) or not stat.S_ISREG(manifest_metadata.st_mode):
        result.error(
            "plugin_manifest_invalid",
            manifest,
            "Plugin manifest 必须是普通文件，不能是软链接",
        )
        return

    actual_entries = plugin_skill_entries(plugin, active_skill_files)

    data = parse_manifest(manifest, result)
    if data is None:
        return

    declared_entries = data.get("skills", [])
    if not isinstance(declared_entries, list):
        result.error("plugin_skills_invalid", manifest, "Plugin JSON 的 skills 必须是数组")
        return

    declared_paths: set[Path] = set()
    declared_targets: dict[Path, str] = {}
    plugin_root = Path(os.path.abspath(plugin))
    canonical_plugin_root = plugin.resolve()
    for entry in declared_entries:
        if not is_safe_manifest_skill_entry(entry):
            result.error(
                "manifest_skill_path_invalid",
                manifest,
                "skills 路径包含不安全字符或跨平台危险片段",
            )
            continue

        assert isinstance(entry, str)

        declared_path = Path(os.path.abspath(plugin / entry))
        try:
            declared_path.relative_to(plugin_root)
        except ValueError:
            result.error(
                "manifest_skill_path_invalid",
                manifest,
                f"Skill 路径不能超出 Plugin 目录：{entry}",
            )
            continue
        if declared_path in declared_paths:
            result.error(
                "manifest_skill_path_duplicate",
                manifest,
                f"manifest skills 包含重复入口：{entry}",
            )
            continue
        declared_paths.add(declared_path)

        try:
            metadata = declared_path.lstat()
        except OSError:
            result.error(
                "manifest_skill_path_missing",
                manifest,
                f"manifest 声明的 Skill 路径不存在：{entry}",
            )
            continue

        if stat.S_ISLNK(metadata.st_mode):
            if declared_path.parent != plugin_root / "skills":
                result.error(
                    "manifest_skill_path_invalid",
                    manifest,
                    f"共享 Skill 链接必须位于 Plugin 的 skills/：{entry}",
                )
                continue
            if shared_skills_root is None:
                continue
            try:
                target = declared_path.resolve(strict=True)
                target_metadata = target.stat()
            except OSError:
                result.error(
                    "manifest_skill_path_missing",
                    manifest,
                    f"共享 Skill 链接目标不存在：{entry}",
                )
                continue
            if not stat.S_ISDIR(target_metadata.st_mode):
                result.error(
                    "manifest_skill_path_invalid",
                    manifest,
                    f"共享 Skill 链接目标必须是目录：{entry}",
                )
                continue
            if target.parent != shared_skills_root:
                result.error(
                    "manifest_skill_path_invalid",
                    manifest,
                    f"共享 Skill 必须直接指向仓库根 skills/ 下的 Skill：{entry}",
                )
                continue
        else:
            if not stat.S_ISDIR(metadata.st_mode):
                result.error(
                    "manifest_skill_path_invalid",
                    manifest,
                    f"Plugin Skill 入口必须是目录：{entry}",
                )
                continue
            target = declared_path.resolve()
            try:
                target.relative_to(canonical_plugin_root)
            except ValueError:
                result.error(
                    "manifest_skill_path_invalid",
                    manifest,
                    f"Plugin Skill 入口最终必须位于 Plugin 目录：{entry}",
                )
                continue

        skill_file = target / "SKILL.md"
        try:
            skill_metadata = skill_file.lstat()
        except OSError:
            result.error(
                "manifest_skill_file_missing",
                manifest,
                f"manifest 声明路径中缺少 SKILL.md：{entry}",
            )
            continue
        if stat.S_ISLNK(skill_metadata.st_mode) or not stat.S_ISREG(skill_metadata.st_mode):
            result.error(
                "manifest_skill_file_invalid",
                manifest,
                f"Skill 的 SKILL.md 必须是普通文件：{entry}",
            )
            continue

        previous_entry = declared_targets.get(target)
        if previous_entry is not None:
            result.error(
                "manifest_skill_target_duplicate",
                manifest,
                f"manifest skills 中 {entry} 与 {previous_entry} 重复指向同一 Skill",
            )
            continue
        declared_targets[target] = entry

    for entry_path in sorted(declared_paths - set(actual_entries)):
        result.error(
            "manifest_skill_not_active",
            manifest,
            f"manifest 声明的 Skill 不在 Plugin 活跃内容中：{entry_path.relative_to(plugin_root)}",
        )

    for entry_path in sorted(set(actual_entries) - declared_paths):
        result.error(
            "plugin_skill_undeclared",
            actual_entries[entry_path],
            "Plugin 中的实际 Skill 未在 plugin.json 的 skills 中声明",
        )


def shareable_files(repo: Path, result: AuditResult) -> list[Path]:
    completed = subprocess.run(
        [
            "git",
            "-C",
            str(repo),
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard",
            "-z",
        ],
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        stderr = completed.stderr.decode("utf-8", errors="replace").strip()
        result.error("shareable_file_scan_failed", repo, f"无法读取 Git 可分享文件候选：{stderr}")
        return []
    return [repo / item.decode("utf-8") for item in completed.stdout.split(b"\0") if item]


def scan_shared_content(repo: Path, result: AuditResult) -> None:
    for path in shareable_files(repo, result):
        try:
            relative_path = path.relative_to(repo).as_posix()
        except ValueError:
            relative_path = path.as_posix()
        if relative_path in SHARED_SCAN_EXCLUDED:
            continue
        if path.name == "experience.local.md" or not path.is_file():
            continue
        try:
            raw = path.read_bytes()
        except OSError as exc:
            result.warning("shareable_file_unreadable", path, f"无法读取可分享文件：{exc}")
            continue
        if b"\0" in raw:
            continue
        content = raw.decode("utf-8", errors="replace")
        if HARDCODED_USER_PATH.search(content):
            result.error(
                "hardcoded_user_path",
                path,
                "共享内容包含硬编码用户主目录路径，请改用变量或通用占位符",
            )
        if any(pattern.search(content) for pattern in OBVIOUS_SECRET_PATTERNS):
            result.error(
                "obvious_secret",
                path,
                "共享内容疑似包含明显密钥或访问令牌",
            )
        if PROHIBITED_COMPANY_CONTENT.search(content):
            result.error(
                "company_content",
                path,
                "共享内容包含公司、内部框架或内部平台信息，请移入本地私有文件或改为通用表达",
            )


def audit(repo: Path, *, include_shared_content: bool = False) -> AuditResult:
    repo = repo.resolve()
    result = AuditResult(repo=repo)
    plugins = plugin_directories(repo, result)
    result.plugins = len(plugins)
    shared_skills_root = validate_root_skills(repo, result) if plugins else None

    active_skill_files = find_active_skill_files(repo, plugins)
    result.skills = len(active_skill_files)

    for skill_file in active_skill_files:
        parse_frontmatter(skill_file, result)

    for plugin in plugins:
        audit_plugin(plugin, active_skill_files, result, shared_skills_root)

    if include_shared_content:
        scan_shared_content(repo, result)

    return result


def render_text(result: AuditResult) -> str:
    payload = result.payload()
    lines = [f"Skill audit: {payload['repo']}"]
    for issue in payload["errors"]:
        lines.append(f"ERROR [{issue['code']}] {issue['path']}: {issue['message']}")
    for issue in payload["warnings"]:
        lines.append(f"WARNING [{issue['code']}] {issue['path']}: {issue['message']}")
    summary = payload["summary"]
    lines.append(
        "Summary: "
        f"{summary['skills']} skill(s), {summary['plugins']} plugin(s), "
        f"{summary['errors']} error(s), {summary['warnings']} warning(s)"
    )
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="输出格式（默认：text）",
    )
    parser.add_argument(
        "--scan-shared-content",
        action="store_true",
        help="额外扫描 Git 已跟踪及未忽略新文件中的私有路径、密钥和公司属性内容",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    arguments = build_parser().parse_args(argv)
    result = audit(Path.cwd(), include_shared_content=arguments.scan_shared_content)
    if arguments.format == "json":
        print(json.dumps(result.payload(), ensure_ascii=False, indent=2))
    else:
        print(render_text(result))
    return 1 if result.errors else 0


if __name__ == "__main__":
    sys.exit(main())
