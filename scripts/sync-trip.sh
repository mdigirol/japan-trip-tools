#!/usr/bin/env bash
# Runs the itinerary's export script (read-only use of its index.html) and copies the
# public-safe trip.json into this repo. Then validates it with the same checks as the tests.
#
# Usage: npm run sync-trip            (ITINERARY_DIR overrides ~/Documents/japan-trip-itinerary)
set -euo pipefail

ITIN="${ITINERARY_DIR:-$HOME/Documents/japan-trip-itinerary}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/src/data/trip.json"

if [ ! -f "$ITIN/scripts/export-trip.mjs" ]; then
  echo "!! $ITIN/scripts/export-trip.mjs not found" >&2; exit 1
fi

node "$ITIN/scripts/export-trip.mjs" --out "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
echo "Wrote $OUT"

cd "$HERE"
npx vitest run tests/unit/trip.test.ts
