#!/usr/bin/env bash
# Capture per-screen portfolio screenshots from the running Expo web build.
# The app draws its own iPhone frame on a transparent backdrop, so headless
# Chrome with a transparent default background yields clean framed PNGs.
# Server must be running on :8081 (npm run web -- --port 8081).
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:8081"
OUT="screenshots"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
mkdir -p "$OUT"

shoot () {
  local name="$1" query="$2"
  local prof; prof="$(mktemp -d)"
  # Dev server keeps a socket open so Chrome won't self-exit; the PNG is written
  # when the virtual-time budget expires, so a hard timeout after it is safe.
  # NOTE: never `pkill Chrome` here — only this temp profile is ever touched.
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

echo "Capturing Client Hub screens…"
shoot 01-home          "tab=Home"
shoot 02-clients       "tab=Clients"
shoot 03-board         "tab=Board"
shoot 04-tasks         "tab=Tasks"
shoot 05-client-detail "client=c031"
shoot 06-new-client    "tab=Clients&modal=new"
echo "Done."
