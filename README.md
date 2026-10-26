# Baker Studios website

A fast, dependency-free company website and future app hub. It is plain HTML, CSS, and a tiny amount of JavaScript, so it needs no build process, database, Node.js runtime, or container. It is served as a static site on DigitalOcean App Platform, straight from this repository.

## Current configuration

This copy is configured for:

- Website: `https://apps.bakerstudios.net`
- Legal entity: Baker Studios LLC
- Support and privacy contact: `apps@bakerstudios.net`
- Business location: Barrington, Illinois, United States
- Current apps: Nudge, Bimble and Milo

Run `./scripts/check-site.sh` before pushing any content update — pushes deploy automatically. The site is intentionally configured only once; `configure-site.sh` remains as a record of the original setup mechanism.

Apple requires an organization's website to be public, functional, and associated with the organization. Apple also requires the enrollment email to use the organization's domain. A city/state-level business location avoids unnecessarily publishing a home street address; ask a qualified attorney whether your circumstances require a full address.

Review the privacy policy before launch. It accurately describes this tracker-free static site, but it is a starting point rather than legal advice. Before publishing any app, update the policy with that app's actual data collection, SDKs, sharing, retention/deletion, and consent practices. Apple requires a privacy-policy URL in App Store Connect and an accessible privacy link inside every app.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Using a local server matters because links beginning with `/` do not work correctly when an HTML file is opened directly.

## Publishing

**Deployment is automatic.** The site is a DigitalOcean App Platform static site connected to this
GitHub repository, so pushing to `main` publishes it — there is no build step, no server to log into
and no files to copy by hand:

```sh
git add .
git commit -m "Describe the change"
git push
```

App Platform picks up the push, deploys it, and serves it at `https://apps.bakerstudios.net`. The
custom domain and its TLS certificate, including renewal, are managed there too. A deploy takes a
minute or so; watch it in the App Platform dashboard, and give it a moment before assuming a new
page or file is missing.

Because every push goes live, run `./scripts/check-site.sh` *before* pushing rather than after.

`deploy/nginx.conf` is kept as a record of the original Droplet setup, alongside
`configure-site.sh`. It is not what serves the site, so its cache and security headers are not in
effect; anything equivalent has to be configured on App Platform.

## App-launch checklist

For each released app:

1. Update the app’s development status with its accurate availability and App Store link.
2. Keep its stable product page, such as `/apps/nudge/`, current.
3. Keep its product-specific support page, such as `/apps/nudge/support/`, current.
4. Update its app-specific privacy and terms pages, such as `/apps/nudge/privacy/` and `/apps/nudge/terms/`, to match the app and every embedded third-party SDK.
5. Use the HTTPS support and privacy URLs in App Store Connect.
6. Add the same privacy link inside the app in an easy-to-find location.
7. Keep the company name, contact details, and app claims truthful and current.

## Resource profile

The public site is roughly a few dozen kilobytes plus HTML and has no server-side process, so it sits comfortably inside App Platform's smallest static-site tier. The setup intentionally avoids Docker, a CMS, and a JavaScript framework to minimize build time, updates, and failure points.

## Search and AI visibility

- `sitemap.xml` lists every public page with a `lastmod` date. Update the date when a page changes.
- Nudge pages carry JSON-LD (app, organization, breadcrumbs, FAQ). `check-site.sh` fails if any block stops parsing.
- `llms.txt` is a plain-text fact sheet for AI assistants. Keep it in step with the Nudge page.
- The `<hex>.txt` file at the root is the IndexNow key. After a deploy, ping changed URLs to Bing and other IndexNow engines:
  `curl -s -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json' -d '{"host":"apps.bakerstudios.net","key":"dfd21347e166706982bd140c24691fca","urlList":["https://apps.bakerstudios.net/apps/nudge/"]}'`
- `/nudge/` is the share page for friends and family (noindex, so it never competes with `/apps/nudge/`). `/nudge/privacy/`, `/nudge/terms/`, `/nudge/support/` and `/nudge/guides/` redirect to `/apps/nudge/…` for older links.
