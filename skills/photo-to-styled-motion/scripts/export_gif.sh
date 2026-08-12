#!/bin/zsh

set -euo pipefail

input="${1-}"
output="${2-}"
fps="${3:-10}"
width="${4:-480}"

if [[ -z "$input" || -z "$output" ]]; then
  print -u2 -- "Usage: export_gif.sh input.mp4 output.gif [fps=10] [width=480]"
  exit 1
fi
[[ -f "$input" ]] || { print -u2 -- "Input not found: $input"; exit 1; }
[[ "$fps" == <-> && "$fps" -ge 1 && "$fps" -le 30 ]] || { print -u2 -- "FPS must be 1-30"; exit 1; }
[[ "$width" == <-> && "$width" -ge 160 && "$width" -le 1920 ]] || { print -u2 -- "Width must be 160-1920"; exit 1; }

mkdir -p "${output:h}"
palette="${TMPDIR:-/tmp}/photo-to-styled-motion-palette-$$.png"
trap 'rm -f -- "$palette"' EXIT INT TERM

filters="fps=${fps},scale=${width}:-2:flags=lanczos"
ffmpeg -hide_banner -loglevel error -y -i "$input" -vf "${filters},palettegen=stats_mode=diff" "$palette"
ffmpeg -hide_banner -loglevel error -y -i "$input" -i "$palette" -lavfi "${filters}[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle" -loop 0 "$output"

[[ -s "$output" ]] || { print -u2 -- "GIF export failed: $output"; exit 1; }
print -- "$output"
