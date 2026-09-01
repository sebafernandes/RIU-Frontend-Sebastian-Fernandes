# Riu-Frontend - Superhero Manager

Angular 21 SPA for browsing and maintaining a superhero roster.

Heroes are fetched from the public Superhero API (`https://akabab.github.io/superhero-api/api/all.json`) and kept in memory. There is no backend: create, edit and delete only change that list. If the API is down, the app falls back to a small local seed.

## Stack

- Angular 21
- TypeScript 5.9
- RxJS 7
- Vitest via `@angular/build:unit-test`
- Docker + nginx for static production (SPA fallback on refresh)

## Structure (Atomic-style)

- `atoms/` — button, input, select
- `molecules/` — hero-card, hero-table, hero-form, pagination
- `organisms/` — hero-sidebar, hero-editor-modal
- `pages/` — heroes (root route)
- `services/`, `models/`, `directives/`

## Local setup

```bash
npm install
npm start
```

Open **http://localhost:4200/**

Path alias: imports use `@app/...` (see `tsconfig.json`).

## Tests and coverage

```bash
npm test
```

## Production build

```bash
npm run build
```

Browser output: `dist/Riu-Frontend/browser`.

## Docker

```bash
docker build -t superhero-app .
docker compose up
```

App: **http://localhost:8080** (SPA fallback in `nginx.conf` for direct URL refreshes).
