#!/usr/bin/env bash
set -euo pipefail
MODEL_OPS_SCRIPT_DIR="$(cd -P -- "$(dirname -- "$0")" && pwd)"
exec python3 "$MODEL_OPS_SCRIPT_DIR/launch.py" "$@"
