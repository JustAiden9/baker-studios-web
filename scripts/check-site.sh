#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

status=0
if rg -n '__[A-Z_]+__' . -g '*.html' -g '*.xml' -g '*.txt' -g '*.conf'; then
  echo "Error: replace every placeholder before publishing."
  status=1
fi

for required in index.html privacy/index.html support/index.html terms/index.html 404.html apps/milo/index.html apps/milo/support/index.html apps/milo/privacy/index.html apps/nudge/index.html apps/nudge/support/index.html apps/nudge/privacy/index.html apps/nudge/terms/index.html apps/bimble/index.html apps/bimble/support/index.html apps/bimble/privacy/index.html apps/bimble/terms/index.html apps/nudge/guides/index.html apps/nudge/guides/canvas-calendar-feed/index.html apps/nudge/guides/schoology-calendar-feed/index.html apps/nudge/guides/blackboard-calendar-feed/index.html apps/nudge/guides/brightspace-calendar-feed/index.html apps/nudge/guides/moodle-calendar-feed/index.html apps/nudge/guides/sakai-calendar-feed/index.html apps/nudge/guides/managebac-calendar-feed/index.html apps/nudge/guides/veracross-calendar-feed/index.html apps/nudge/guides/blackbaud-calendar-feed/index.html apps/nudge/guides/school-calendar-feed/index.html apps/nudge/guides/stop-missing-assignments/index.html assets/styles.css assets/nudge/nudge-og.jpg llms.txt assets/pacer-icon.jpg assets/pacer-trail.jpg assets/site.js assets/favicon.svg assets/milo-icon.jpg assets/nudge-icon.png assets/unloop-logo.png robots.txt sitemap.xml; do
  if [[ ! -s "$required" ]]; then
    echo "Error: required file is missing or empty: $required"
    status=1
  fi
done

for page in index.html privacy/index.html support/index.html terms/index.html 404.html apps/milo/index.html apps/milo/support/index.html apps/milo/privacy/index.html apps/nudge/index.html apps/nudge/support/index.html apps/nudge/privacy/index.html apps/nudge/terms/index.html apps/bimble/index.html apps/bimble/support/index.html apps/bimble/privacy/index.html apps/bimble/terms/index.html apps/nudge/guides/index.html apps/nudge/guides/canvas-calendar-feed/index.html apps/nudge/guides/schoology-calendar-feed/index.html apps/nudge/guides/blackboard-calendar-feed/index.html apps/nudge/guides/brightspace-calendar-feed/index.html apps/nudge/guides/moodle-calendar-feed/index.html apps/nudge/guides/sakai-calendar-feed/index.html apps/nudge/guides/managebac-calendar-feed/index.html apps/nudge/guides/veracross-calendar-feed/index.html apps/nudge/guides/blackbaud-calendar-feed/index.html apps/nudge/guides/school-calendar-feed/index.html apps/nudge/guides/stop-missing-assignments/index.html; do
  if ! rg -q '<title>[^<]+</title>' "$page"; then echo "Error: missing title in $page"; status=1; fi
  if ! rg -q 'name="viewport"' "$page"; then echo "Error: missing viewport in $page"; status=1; fi
done

# Every JSON-LD block must parse, or search engines ignore it.
if ! python3 - <<'PY'
import json, pathlib, re, sys
bad = 0
for page in pathlib.Path('.').rglob('*.html'):
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page.read_text(), re.S):
        try: json.loads(block)
        except ValueError as error: print(f"Error: invalid JSON-LD in {page}: {error}"); bad = 1
sys.exit(bad)
PY
then status=1; fi

if [[ "$status" -ne 0 ]]; then exit "$status"; fi
echo "Site checks passed."
