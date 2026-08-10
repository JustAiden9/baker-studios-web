#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

status=0
if rg -n '__[A-Z_]+__' . -g '*.html' -g '*.xml' -g '*.txt' -g '*.conf'; then
  echo "Error: replace every placeholder before publishing."
  status=1
fi

for required in index.html privacy/index.html support/index.html terms/index.html 404.html apps/milo/index.html apps/milo/support/index.html apps/milo/privacy/index.html assets/styles.css assets/site.js assets/favicon.svg assets/milo-icon.jpg assets/unloop-logo.png robots.txt sitemap.xml; do
  if [[ ! -s "$required" ]]; then
    echo "Error: required file is missing or empty: $required"
    status=1
  fi
done

for page in index.html privacy/index.html support/index.html terms/index.html 404.html apps/milo/index.html apps/milo/support/index.html apps/milo/privacy/index.html; do
  if ! rg -q '<title>[^<]+</title>' "$page"; then echo "Error: missing title in $page"; status=1; fi
  if ! rg -q 'name="viewport"' "$page"; then echo "Error: missing viewport in $page"; status=1; fi
done

if [[ "$status" -ne 0 ]]; then exit "$status"; fi
echo "Site checks passed."
