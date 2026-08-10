# Baker Studios website

A fast, dependency-free company website and future app hub. It is plain HTML, CSS, and a tiny amount of JavaScript, so it needs no build process, database, Node.js runtime, or container. Nginx can serve it comfortably on DigitalOcean's smallest Droplet.

## Current configuration

This copy is configured for:

- Website: `https://apps.bakerstudios.net`
- Legal entity: Baker Studios LLC
- Support and privacy contact: `apps@bakerstudios.net`
- Business location: Barrington, Illinois, United States
- Current app: Milo

Run `./scripts/check-site.sh` after every content update. The site is intentionally configured only once; `configure-site.sh` remains as a record of the original setup mechanism.

Apple requires an organization's website to be public, functional, and associated with the organization. Apple also requires the enrollment email to use the organization's domain. A city/state-level business location avoids unnecessarily publishing a home street address; ask a qualified attorney whether your circumstances require a full address.

Review the privacy policy before launch. It accurately describes this tracker-free static site, but it is a starting point rather than legal advice. Before publishing any app, update the policy with that app's actual data collection, SDKs, sharing, retention/deletion, and consent practices. Apple requires a privacy-policy URL in App Store Connect and an accessible privacy link inside every app.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Using a local server matters because links beginning with `/` do not work correctly when an HTML file is opened directly.

## Put it on GitHub

Create an empty private or public GitHub repository, then from this folder:

```sh
git init
git add .
git commit -m "Launch Baker Studios website"
git branch -M main
git remote add origin git@github.com:YOUR_ACCOUNT/baker-studios-web.git
git push -u origin main
```

## First-time DigitalOcean setup

These steps assume Ubuntu and a DNS `A` record for `apps.bakerstudios.net` pointing to the Droplet's public IPv4 address.

1. Install the small web-server packages:

   ```sh
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. Create the deployment directory and give a non-root deployment user ownership:

   ```sh
   sudo mkdir -p /var/www/baker-studios-web
   sudo chown -R "$USER":"$USER" /var/www/baker-studios-web
   ```

3. Copy `deploy/nginx.conf` to the server, then enable it:

   ```sh
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/baker-studios-web
   sudo ln -s /etc/nginx/sites-available/baker-studios-web /etc/nginx/sites-enabled/baker-studios-web
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. After DNS resolves, enable HTTPS:

   ```sh
   sudo certbot --nginx -d apps.bakerstudios.net
   ```

Certbot configures automatic certificate renewal. The supplied Nginx configuration adds strong security headers and caches static assets. Deployment is manual; pushing to GitHub does not build or publish the website.

## App-launch checklist

For each released app:

1. Update the app’s development status with its accurate availability and App Store link.
2. Keep its stable product page, such as `/apps/milo/`, current.
3. Keep its product-specific support page, such as `/apps/milo/support/`, current.
4. Update its app-specific privacy page, such as `/apps/milo/privacy/`, to match the app and every embedded third-party SDK.
5. Use the HTTPS support and privacy URLs in App Store Connect.
6. Add the same privacy link inside the app in an easy-to-find location.
7. Keep the company name, contact details, and app claims truthful and current.

## Resource profile

The public site is roughly a few dozen kilobytes plus HTML and has no server-side process. Nginx generally uses only a small fraction of the RAM available on a 512 MB / $4-class Droplet. The setup intentionally avoids Docker, a CMS, and a JavaScript framework to minimize memory use, updates, and failure points.
