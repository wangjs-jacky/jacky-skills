#!/usr/bin/env python3
"""Lightweight audit for GitHub README files produced by readme-craft."""

from __future__ import annotations

import os
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

IMG_SIZE_WARN_BYTES = 2 * 1024 * 1024  # 2 MB
RELATIVE_VIDEO_EXTS = {".mp4", ".mov", ".webm", ".m4v"}


def extract_refs(md_text: str) -> list[tuple[str, str]]:
    refs: list[tuple[str, str]] = []
    # HTML img/video/a src/href
    for kind, url in re.findall(r'(src|href)="([^"]+)"', md_text):
        refs.append((kind, url))
    # Markdown images and links ![alt](url) / [text](url)
    for is_img, label, url in re.findall(r'(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)', md_text):
        refs.append(("md-img" if is_img else "md-link", url))
    return refs


def check_svg(svg_path: Path) -> list[str]:
    issues: list[str] = []
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
    except ET.ParseError as exc:
        return [f"SVG XML parse error in {svg_path.name}: {exc}"]

    raw = svg_path.read_text(encoding="utf-8", errors="ignore")
    if "<foreignObject" in raw:
        issues.append(f"{svg_path.name}: contains <foreignObject> (stripped by GitHub)")
    if "<script" in raw:
        issues.append(f"{svg_path.name}: contains <script> (stripped by GitHub)")
    if re.search(r'href="(?!data:|#)[^"]+\.(?:png|jpg|jpeg|webp)"', raw, re.I):
        issues.append(f"{svg_path.name}: references external/relative raster image inside SVG (unreliable on GitHub)")
    # Count non-empty text characters inside SVG to catch text-heavy diagram regressions
    text_chars = sum(len((el.text or "").strip()) for el in root.iter() if el.tag.endswith("text") or el.tag.endswith("tspan"))
    if text_chars > 260:
        issues.append(f"{svg_path.name}: high text density ({text_chars} chars) — consider Hybrid visual with less text")
    return issues


def audit(readme_path: Path) -> int:
    if not readme_path.exists():
        print(f"ERROR: file not found: {readme_path}", file=sys.stderr)
        return 2

    repo_root = readme_path.parent
    text = readme_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    errors: list[str] = []
    warnings: list[str] = []

    refs = extract_refs(text)
    seen_local: set[Path] = set()
    img_count = 0

    for kind, raw_url in refs:
        url = raw_url.split("#", 1)[0].split("?", 1)[0].strip()
        if not url or url.startswith(("http://", "https://", "mailto:", "#")):
            continue
        target = (repo_root / url).resolve()
        if not target.exists():
            errors.append(f"Missing local target ({kind}): {raw_url}")
            continue

        ext = target.suffix.lower()
        if ext in RELATIVE_VIDEO_EXTS:
            warnings.append(
                f"Relative video link ({raw_url}): GitHub will not play relative videos inline; "
                "use a standalone GitHub user-attachments URL paragraph instead."
            )

        if kind in ("src", "md-img"):
            img_count += 1
            if target not in seen_local:
                seen_local.add(target)
                size = target.stat().st_size
                if size > IMG_SIZE_WARN_BYTES:
                    warnings.append(f"Large image ({size / 1024 / 1024:.2f} MB): {raw_url}")
                if ext == ".svg":
                    warnings.extend(check_svg(target))

    # Check HTML <img> missing alt
    for img_tag in re.findall(r"<img\b[^>]*>", text, re.I):
        if not re.search(r'\balt="[^"]+"', img_tag, re.I):
            warnings.append(f"<img> missing descriptive alt attribute: {img_tag[:80]}")

    # Check native GitHub video embeds
    gh_videos = re.findall(r"^https://github\.com/user-attachments/assets/[0-9a-f-]+\s*$", text, re.M)

    # Check private local path leaks
    if re.search(r"(/Users/|/Volumes/|C:\\Users\\)", text):
        errors.append("Detected absolute local filesystem path inside README.md")

    print(f"README: {readme_path}")
    print(f"Lines: {len(lines)} | Local images: {img_count} | GitHub native videos: {len(gh_videos)}")

    if errors:
        print("\nERRORS:")
        for e in errors:
            print(f"  - {e}")
    if warnings:
        print("\nWARNINGS:")
        for w in warnings:
            print(f"  - {w}")
    if not errors and not warnings:
        print("\nPASS: No errors or warnings found.")

    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 audit_readme.py /path/to/README.md", file=sys.stderr)
        sys.exit(2)
    sys.exit(audit(Path(sys.argv[1])))
