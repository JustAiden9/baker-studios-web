#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "Usage: ./configure-site.sh DOMAIN LEGAL_ENTITY SUPPORT_EMAIL PRIVACY_EMAIL BUSINESS_LOCATION"
  echo "Example: ./configure-site.sh bakerstudios.com 'Baker Studios LLC' hello@bakerstudios.com privacy@bakerstudios.com 'Austin, Texas, United States'"
  exit 1
fi

site_domain="$1"
legal_entity="$2"
support_email="$3"
privacy_email="$4"
business_location="$5"

if [[ ! "$site_domain" =~ ^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$ ]]; then
  echo "Error: DOMAIN must look like example.com and must not include https:// or a path."
  exit 1
fi

support_domain="${support_email##*@}"
privacy_domain="${privacy_email##*@}"
if [[ ! "$support_email" =~ ^[^[:space:]@]+@[^[:space:]@]+$ ]] || \
   [[ ! "$privacy_email" =~ ^[^[:space:]@]+@[^[:space:]@]+$ ]] || \
   [[ "$site_domain" != "$support_domain" && "$site_domain" != *".${support_domain}" ]] || \
   [[ "$site_domain" != "$privacy_domain" && "$site_domain" != *".${privacy_domain}" ]]; then
  echo "Error: both email addresses must use the website domain or its parent domain."
  exit 1
fi

for value in "$legal_entity" "$business_location"; do
  if [[ -z "$value" || "$value" == *"|"* || "$value" == *"&"* ]]; then
    echo "Error: legal entity and location must be non-empty and cannot contain | or &."
    exit 1
  fi
done

if ! rg -q '__DOMAIN__|__LEGAL_ENTITY__|__SUPPORT_EMAIL__|__PRIVACY_EMAIL__|__BUSINESS_LOCATION__' . \
  -g '*.html' -g '*.xml' -g '*.txt' -g '*.conf'; then
  echo "This site has already been configured. Review the current values before making manual changes."
  exit 1
fi

while IFS= read -r -d '' file; do
  sed -i.bak \
    -e "s|__DOMAIN__|${site_domain}|g" \
    -e "s|__LEGAL_ENTITY__|${legal_entity}|g" \
    -e "s|__SUPPORT_EMAIL__|${support_email}|g" \
    -e "s|__PRIVACY_EMAIL__|${privacy_email}|g" \
    -e "s|__BUSINESS_LOCATION__|${business_location}|g" \
    "$file"
  rm "${file}.bak"
done < <(find . -type f \( -name '*.html' -o -name '*.xml' -o -name '*.txt' -o -name '*.conf' \) -print0)

echo "Configured for https://${site_domain}"
echo "Next: review every page, then run ./scripts/check-site.sh"
