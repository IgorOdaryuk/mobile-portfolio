#!/usr/bin/env bash
# Capture per-screen portfolio screenshots from the running Expo web build.
# The app draws its own iPhone frame on a transparent backdrop, so headless
# Chrome with a transparent default background yields clean framed PNGs.
#
# Usage:  bash scripts/shoot.sh            (server must be on :8083)
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:8083"
OUT="screenshots"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
mkdir -p "$OUT"

shoot () {
  local name="$1" query="$2"
  local prof; prof="$(mktemp -d)"
  # Dev server keeps a socket open so Chrome won't self-exit; the PNG is written
  # when the virtual-time budget expires, so a hard timeout after it is safe.
  timeout 40 "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=2 \
    --default-background-color=00000000 \
    --window-size=520,990 \
    --virtual-time-budget=7000 \
    --run-all-compositor-stages-before-draw \
    --user-data-dir="$prof" \
    --screenshot="$DIR/$OUT/$name.png" \
    "$BASE/?$query" >/dev/null 2>&1 || true
  rm -rf "$prof"
  echo "  ✓ $OUT/$name.png  ($query)"
}

echo "Capturing Eat2Beat screens…"
shoot 01-today       "tab=Today"
shoot 02-add         "modal=add&meal=lunch&addfood=f08"
shoot 03-diary       "tab=Diary"
shoot 04-trends      "tab=Trends"
shoot 05-food        "food=f12"
shoot 06-search      "modal=add&meal=breakfast"
shoot 07-weight      "tab=Weight"
shoot 08-goals       "screen=goals"
shoot 09-today-dark  "tab=Today&theme=dark"
shoot 10-trends-dark "tab=Trends&theme=dark"
shoot 11-weight-dark "tab=Weight&theme=dark"
echo "Done."
