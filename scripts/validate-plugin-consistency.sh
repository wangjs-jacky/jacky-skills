#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGINS_DIR="$ROOT/plugins"
ROOT_PLUGIN_JSON="$ROOT/.claude-plugin/plugin.json"
MARKETPLACE_JSON="$ROOT/.claude-plugin/marketplace.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required"
  exit 2
fi

status=0

tmp_plugin_dirs="$(mktemp)"
tmp_expected_subplugins="$(mktemp)"
tmp_actual_subplugins="$(mktemp)"
tmp_market_names="$(mktemp)"
trap 'rm -f "$tmp_plugin_dirs" "$tmp_expected_subplugins" "$tmp_actual_subplugins" "$tmp_market_names"' EXIT

find "$PLUGINS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort > "$tmp_plugin_dirs"

echo "[1/4] checking per-plugin metadata..."
while IFS= read -r dir; do
  [[ -n "$dir" ]] || continue
  plugin_json="$PLUGINS_DIR/$dir/.claude-plugin/plugin.json"
  if [[ ! -f "$plugin_json" ]]; then
    echo "FAIL: missing $plugin_json"
    status=1
    continue
  fi

  name="$(jq -r '.name // empty' "$plugin_json")"
  homepage="$(jq -r '.homepage // empty' "$plugin_json")"
  if [[ "$name" != "$dir" ]]; then
    echo "FAIL: $plugin_json name=$name expected=$dir"
    status=1
  fi
  if [[ "$homepage" != *"/plugins/$dir" ]]; then
    echo "FAIL: $plugin_json homepage=$homepage expected suffix /plugins/$dir"
    status=1
  fi

  while IFS= read -r rel; do
    [[ -n "$rel" ]] || continue
    path="$PLUGINS_DIR/$dir/${rel#./}"
    if [[ ! -d "$path" ]]; then
      echo "FAIL: $plugin_json skill path not found: $rel"
      status=1
    fi
  done < <(jq -r '.skills[]? // empty' "$plugin_json")
done < "$tmp_plugin_dirs"

echo "[2/4] checking root subPlugins..."
sed 's#^#plugins/#' "$tmp_plugin_dirs" > "$tmp_expected_subplugins"
jq -r '.subPlugins[]? // empty' "$ROOT_PLUGIN_JSON" | sort > "$tmp_actual_subplugins"
if ! diff -u "$tmp_expected_subplugins" "$tmp_actual_subplugins" >/dev/null; then
  echo "FAIL: root subPlugins mismatch"
  echo "  expected:"
  sed 's#^#  - #' "$tmp_expected_subplugins"
  echo "  actual:"
  sed 's#^#  - #' "$tmp_actual_subplugins"
  status=1
fi

echo "[3/4] checking marketplace plugin names/sources..."
jq -r '.plugins[].name' "$MARKETPLACE_JSON" | sort > "$tmp_market_names"
if ! diff -u "$tmp_plugin_dirs" "$tmp_market_names" >/dev/null; then
  echo "FAIL: marketplace plugin names mismatch"
  echo "  expected:"
  sed 's#^#  - #' "$tmp_plugin_dirs"
  echo "  actual:"
  sed 's#^#  - #' "$tmp_market_names"
  status=1
fi

while IFS= read -r line; do
  [[ -n "$line" ]] || continue
  name="${line%% *}"
  source="${line#* }"
  expected="./plugins/$name"
  if [[ "$source" != "$expected" ]]; then
    echo "FAIL: marketplace source mismatch for $name: $source expected $expected"
    status=1
  fi
done < <(jq -r '.plugins[] | "\(.name) \(.source)"' "$MARKETPLACE_JSON")

echo "[4/4] checking plugin version sync..."
while IFS= read -r dir; do
  [[ -n "$dir" ]] || continue
  plugin_json="$PLUGINS_DIR/$dir/.claude-plugin/plugin.json"
  plugin_version="$(jq -r '.version // empty' "$plugin_json")"
  market_version="$(jq -r --arg n "$dir" '.plugins[] | select(.name == $n) | .version // empty' "$MARKETPLACE_JSON")"
  if [[ -z "$market_version" ]]; then
    echo "FAIL: marketplace missing plugin $dir"
    status=1
    continue
  fi
  if [[ "$plugin_version" != "$market_version" ]]; then
    echo "FAIL: version mismatch for $dir: plugin=$plugin_version marketplace=$market_version"
    status=1
  fi
done < "$tmp_plugin_dirs"

if [[ "$status" -eq 0 ]]; then
  echo "OK: plugin metadata is consistent"
else
  echo "FAILED: plugin metadata has inconsistencies"
fi

exit "$status"
