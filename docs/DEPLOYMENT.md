# Deploying Form / Function with GitHub and Coolify

This project is designed for the path:

```text
GitHub main branch → Coolify → Dockerfile → Next.js standalone server
```

## 1. Push the repository to GitHub

Create a public repository named `personal-workout-guide`, then push this project to its `main` branch. Do not commit `.env.local` or any credentials.

```bash
git remote add origin https://github.com/nfonjeannoel/personal-workout-guide.git
git push -u origin main
```

## 2. Connect GitHub to Coolify

1. Sign in to Coolify.
2. Open **Sources** or create a source while adding a new resource.
3. Choose the GitHub App integration.
4. Authorize the GitHub organization or account that owns the repository.
5. Grant the integration access to `personal-workout-guide`.

Using the GitHub App integration allows Coolify to receive repository events for automatic deployments.

## 3. Create the application resource

1. Open the desired Coolify project and environment.
2. Select **New Resource** → **Public Repository** or **Private Repository (with GitHub App)** as appropriate.
3. Select `personal-workout-guide`.
4. Set the production branch to `main`.
5. Choose **Dockerfile** as the build pack.
6. Leave the Dockerfile location as `/Dockerfile` and build context as the repository root.

The included multi-stage Dockerfile performs `npm ci`, builds the Next.js standalone server, and runs it as a non-root user.

## 4. Configure environment values

Add this production value before the first deployment and expose it to the Docker build as a build argument:

```text
NEXT_PUBLIC_SITE_URL=https://workout.your-domain.example
```

Use the final HTTPS origin without a trailing slash. This value is embedded at build time and is used for canonical metadata, Open Graph images, `robots.txt`, and `sitemap.xml`.

In Coolify, add `NEXT_PUBLIC_SITE_URL` under the application's environment settings and enable its **Build Variable** option. The Dockerfile declares the matching `ARG`, so the production URL is available while Next.js generates static metadata.

Optional runtime values:

```text
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

The Docker image already supplies those optional defaults.

### Add PostgreSQL for optional accounts

1. In the same Coolify project and environment, create a PostgreSQL resource.
2. Use its internal connection URL so traffic stays on the private Coolify network.
3. Add these runtime-only application variables (do not mark secrets as build variables):

```text
DATABASE_URL=postgresql://...
BETTER_AUTH_URL=https://workout.your-domain.example
BETTER_AUTH_SECRET=<at least 32 cryptographically random characters>
```

Generate the secret with a password manager or `openssl rand -base64 32`. Keep the database private; the application is the only resource that needs access. Authentication and personal-record tables are created idempotently on the first account request. The public guide and device-only records continue to work if the database is temporarily unavailable.

## 5. Configure networking and health checks

1. Set the container port to `3000` if Coolify does not detect it automatically.
2. Configure the health-check path as `/api/health`.
3. Expect HTTP status `200` and JSON body `{"status":"ok"}`.
4. Set the startup grace period to **90 seconds**. The complete static encyclopedia is intentionally built ahead of time, and lower-powered hosts may need more than 30 seconds to start after deployment.

## 6. Add the domain and HTTPS

1. In the application resource, add the production domain, for example `https://workout.your-domain.example`.
2. Point the domain's DNS A/AAAA record to the Coolify server as required by your setup.
3. Enable Coolify's automatic HTTPS certificate.
4. Confirm that `NEXT_PUBLIC_SITE_URL` exactly matches the HTTPS domain, then redeploy if it changed.

## 7. Deploy

Select **Deploy**. The deployment should complete these stages:

1. Clone `main`.
2. Build the multi-stage Docker image.
3. Start the standalone Next.js server on port 3000.
4. Pass `/api/health`.
5. Route the configured HTTPS domain to the healthy container.

After deployment, verify:

- `/` loads today's workout.
- `/exercises` search and filters respond immediately.
- An exercise detail page displays both local images.
- `/sitemap.xml` and `/robots.txt` use the production domain.
- `/api/health` returns `{"status":"ok"}`.
- Creating a test account, signing out, and signing back in preserves a test record.

## 8. Enable automatic deployments

With the Coolify GitHub App source, automatic deployment hooks are normally created when the application is connected. In the application settings:

1. Enable automatic deployment for pushes to `main`.
2. Confirm the repository webhook or GitHub App event connection is healthy.
3. Push a documentation-only commit to `main` and confirm Coolify receives the event.

If your Coolify installation uses a generic public repository source instead, copy its deploy webhook URL into the GitHub repository's **Settings → Webhooks** page and subscribe it to push events.

## 9. Back up and roll back

Coolify retains previous deployments according to the server's retention settings. To roll back, select a previously successful deployment and redeploy it. Configure scheduled PostgreSQL backups in Coolify before accepting durable account records. Database changes are additive and idempotent; do not delete the database when rolling back the application.

Device-local workout logs live in each browser's `localStorage` and are unaffected by server deployments. Users can also export their complete record from the Account page.

## Build troubleshooting

- **Metadata points to localhost:** set `NEXT_PUBLIC_SITE_URL` and rebuild; it is a build-time public variable.
- **Health check fails:** confirm port 3000 is exposed and Coolify checks `/api/health`, not `/health`.
- **Images are missing:** make sure the repository contains `public/exercises`; no image download occurs during production builds.
- **Node version mismatch:** use the Dockerfile or Node 20.19+.
- **Sign-in says accounts are unavailable:** confirm `DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`, then verify the application can reach the PostgreSQL resource over Coolify's internal network.
