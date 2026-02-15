# Frontend – Vehicles SPA

Vue 3 + Quasar + Pinia + Vue Router + TypeScript. i18n: en, sr-lat, sr-cyr.

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to backend URL (e.g. `http://localhost:4000`)
3. Optional: `VITE_DEV_AUTH=1` to show Dev login form

## Run

- Dev: `npm run dev`
- Test: `npm run test`
- Build: `npm run build`
- Preview: `npm run preview`

## Structure

- `src/api/` – API clients
- `src/stores/` – Pinia stores (auth)
- `src/views/` – Pages (Login, Dashboard)
- `src/layouts/` – MainLayout
- `src/locales/` – en, sr-lat, sr-cyr
- `src/router/` – Routes and auth guard
