#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

status=0
if grep -rnE '__[A-Z_]+__' --include='*.html' --include='*.xml' --include='*.txt' --include='*.conf' .; then
  echo "Error: replace every placeholder before publishing."
  status=1
fi

pages="index.html privacy/index.html support/index.html terms/index.html 404.html apps/milo/index.html apps/milo/support/index.html apps/milo/privacy/index.html apps/pip/index.html apps/pip/support/index.html apps/pip/privacy/index.html apps/pip/terms/index.html apps/nudge/index.html apps/nudge/support/index.html apps/nudge/privacy/index.html apps/nudge/terms/index.html nudge/index.html nudge/support/index.html nudge/privacy/index.html nudge/terms/index.html"

for required in $pages assets/styles.css assets/pip.css assets/site.js assets/favicon.svg assets/milo-icon.jpg assets/unloop-logo.png assets/fonts/Fraunces.woff2 assets/fonts/Figtree.woff2 assets/pip/pip-room.svg assets/pip/pip-icon.png assets/pip/pip-icon-1024.png assets/pip/apple-touch-icon.png assets/pip/favicon-64.png apps/nudge/review/nudge-review-feed.ics apps/pip/review/pip-review-feed.ics robots.txt sitemap.xml; do
  if [[ ! -s "$required" ]]; then
    echo "Error: required file is missing or empty: $required"
    status=1
  fi
done

for page in $pages; do
  if ! grep -qE '<title>[^<]+</title>' "$page"; then echo "Error: missing title in $page"; status=1; fi
  if ! grep -q 'name="viewport"' "$page"; then echo "Error: missing viewport in $page"; status=1; fi
done

# Old Nudge URLs must keep redirecting to the matching Pip page.
for old in apps/nudge nudge; do
  for sub in "" support/ privacy/ terms/; do
    if ! grep -qF "http-equiv=\"refresh\" content=\"0; url=/apps/pip/${sub}\"" "$old/${sub}index.html"; then
      echo "Error: $old/${sub}index.html does not redirect to /apps/pip/${sub}"; status=1
    fi
  done
done

# Every local file a page references must exist (commented-out markup is ignored).
while IFS= read -r ref; do
  path="${ref#*=\"}"; path="${path%\"}"; path="${path%%\#*}"; path="${path%%\?*}"
  [[ -z "$path" || "$path" == "/" ]] && continue
  target=".${path}"; [[ "$path" == */ ]] && target=".${path}index.html"
  if [[ ! -e "$target" ]]; then echo "Error: missing local reference $path"; status=1; fi
done < <(find . -name '*.html' -not -path './.git/*' -exec perl -0pe 's/<!--.*?-->//gs' {} + | grep -oE '(src|href)="/[^"]*"' | sort -u)

if [[ "$status" -ne 0 ]]; then exit "$status"; fi
echo "Site checks passed."
