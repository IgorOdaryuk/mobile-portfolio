#!/usr/bin/env bash
# Capture per-screen portfolio screenshots from the running Expo web build.
# The app draws its own iPhone frame on a transparent backdrop, so headless
# Chrome with a transparent default background yields clean framed PNGs.
# Server must be running on :8082 (npm run web).
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:8082"
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

echo "Capturing Solva screens…"
shoot 01-shop     "tab=Shop"
shoot 02-product  "product=p01"
shoot 03-category "tab=Search&cat=all"
shoot 04-cart     "tab=Bag&seedcart=1"
shoot 05-checkout "checkout=1&seedcart=1"
shoot 06-saved    "tab=Saved&seedwish=1"
echo "Done."
