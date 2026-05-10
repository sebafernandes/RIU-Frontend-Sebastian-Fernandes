# Riu-Frontend - Superhero Manager

Angular 21 SPA for browsing and maintaining a superhero roster. Hero data is loaded from the open [Superhero API](https://akabab.github.io/superhero-api/), cached in `HeroService`, with create/update/delete kept in memory on top of that list.

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

Runs Vitest through the Angular CLI with coverage. Thresholds are configured in `angular.json` 

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
