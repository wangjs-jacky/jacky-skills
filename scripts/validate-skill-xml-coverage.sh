#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_ROOT="$ROOT/plugins"

status=0

echo "file,role,purpose,trigger,gsd_workflow"
while IFS= read -r file; do
  role=0
  purpose=0
  trigger=0
  workflow=0

  rg -q "<role>" "$file" && role=1 || true
  rg -q "<purpose>" "$file" && purpose=1 || true
  rg -q "<trigger>" "$file" && trigger=1 || true
  rg -q "<gsd:workflow" "$file" && workflow=1 || true

  echo "$file,$role,$purpose,$trigger,$workflow"

  if [[ "$role" -eq 0 || "$purpose" -eq 0 || "$trigger" -eq 0 || "$workflow" -eq 0 ]]; then
    status=1
  fi
done < <(find "$SKILLS_ROOT" -name SKILL.md | sort)

if [[ "$status" -eq 0 ]]; then
  echo "OK: all SKILL.md files have XML core blocks"
else
  echo "FAILED: some SKILL.md files are missing XML core blocks"
fi

exit "$status"
