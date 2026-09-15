# Form / Function

A mobile-first personal workout guide built for practical use between gym sets. It combines a seven-day upper/lower program, a 112-exercise encyclopedia, curated local start/finish imagery, equipment-aware alternatives, offline access, and optional account sync.

## What is included

- Today's workout based on the visitor's local weekday
- Complete Day 1–7 program with sets, reps, rest, and RIR targets
- 112 statically generated exercise detail pages
- 224 locally stored start/finish exercise images
- Instant search across exercise, muscle, equipment, and movement pattern
- Muscle, equipment, movement, and difficulty filters
- Machine, cable, free-weight, and bodyweight alternatives
- Setup, instructions, breathing, cues, common mistakes, and machine adjustments
- Calendar training journal for planning any workout group on any date, with live completion progress and a dated session logbook
- Shared dated sessions across Today, the workout view, exercise form guides, and the journal
- Session renaming, date corrections, deletion, and multiple sessions on the same date
- Custom workouts with library exercises or your own named movements
- Automatically saved working sets, with up to 20 sets per exercise
- History-based alternative suggestions that preserve exercises already logged
- Set-by-set weight, reps, RIR, reflections, exercise swaps, favorites, notes, recent lifts, and automatic next-session targets
- Optional username/email and password accounts backed by PostgreSQL; guest records merge on sign-in
- JSON record export/import and a Favorites/Recently Viewed dashboard
- Background-safe rest timer with vibration, sound, and optional system notification
- Installable PWA with offline caching for the complete encyclopedia and local images
- Per-exercise SEO metadata, sitemap, robots, social card, and health endpoint
- Next.js standalone output and a production multi-stage Docker image

An account is optional. Without PostgreSQL configuration, all training features still work privately in the browser. Production account sync requires PostgreSQL.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui primitives powered by Base UI
- Lucide icons
- Static typed exercise and workout data
- Next/Image with local assets
- Better Auth + PostgreSQL for optional accounts

## Local development

Requirements: Node.js 20.19 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` to the site origin. To enable accounts, set `DATABASE_URL` and a random `BETTER_AUTH_SECRET` of at least 32 characters. Without them, the guide remains fully usable in device-only mode.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run test:lighthouse
npm run start
```

Health check:

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

## Docker

```bash
docker build -t personal-workout-guide .
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e BETTER_AUTH_SECRET=replace-with-a-long-random-secret \
  -e DATABASE_URL=postgresql://user:password@database:5432/workout \
  personal-workout-guide
```

The image uses Next.js standalone output and runs as an unprivileged `nextjs` user.

## Coolify

Connect the GitHub repository, select the `main` branch, and deploy with the included Dockerfile. Configure:

- Port: `3000`
- Health path: `/api/health`
- Environment variable: `NEXT_PUBLIC_SITE_URL=https://your-domain.example`
- Runtime secrets: `DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the complete GitHub → Coolify procedure.

## Architecture

```text
src/
  app/                  App Router pages, metadata, sitemap, and health route
  components/           Server and focused client components, tracking, account, and PWA registration
  data/
    exercises.ts        Typed exercise model, specific setup rules, imported guidance, alternatives
    workouts.ts         Seven-day weekly program
    image-attribution.json
public/exercises/       Local start/finish imagery by stable exercise slug
scripts/                Repeatable image import pipeline
tests/                  Unit, browser, accessibility, responsive, and visual regression tests
docs/                   Deployment documentation
THIRD_PARTY_LICENSES/   Preserved upstream license text
```

All exercise detail URLs are stable at `/exercises/[slug]`. Guest records use one versioned `localStorage` document. When a user signs in, device and account histories merge by stable record IDs and then sync to a private PostgreSQL JSONB aggregate. Authentication tables are migrated by Better Auth; the small app data table is created idempotently before the first account request.

## Updating exercise images

The checked-in site is self-contained; the upstream repository is not needed at build time. To regenerate localized images from a local Free Exercise DB clone:

```bash
git clone --depth 1 https://github.com/yuhonas/free-exercise-db.git ../free-exercise-db
npm run images:import -- ../free-exercise-db
```

The importer copies two images per exercise and regenerates `src/data/image-attribution.json`, including the upstream coaching and whether the illustration is exact or the closest available equivalent. Manually curated aliases prevent unsafe name-only matches.

## Data and image attribution

Exercise imagery is derived from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), which publishes its repository under the Unlicense/public-domain dedication. The exact exercise-to-source mapping appears at `/sources` and in `src/data/image-attribution.json`. A copy of the upstream license is preserved under `THIRD_PARTY_LICENSES/`.

Editorial setup instructions, technique cues, mistakes, prescriptions, and alternative grouping were prepared for this project. See [NOTICE.md](NOTICE.md).

## License

Project code and original editorial content are available under the [MIT License](LICENSE). Third-party assets retain the terms documented in `NOTICE.md` and `THIRD_PARTY_LICENSES/`.
