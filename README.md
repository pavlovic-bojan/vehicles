# Vehicles – Fleet & Logistics Management

Cloud-based SaaS for fleet and logistics: vehicles, drivers, trips, fuel tracking, real-time GPS, documents, and compliance.

## Stack

- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL
- **Frontend:** Vue 3, Quasar, Pinia, Vue Router, TypeScript
- **Auth:** Email/password (register, login, forgot/reset) + OAuth (Google, Facebook) + JWT, login audit log

## Quick start

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Database**
   - Create PostgreSQL DB (e.g. `vehicles_db`)
   - Copy `backend/.env.example` → `backend/.env` and set `DATABASE_URL`, `JWT_SECRET`
   - Optional: set `DEV_AUTH_SECRET` for dev-only login
   ```bash
   cd backend && npx prisma migrate dev --name init && npx prisma generate
   ```
   - **Seed users** (optional): after migrations, run `npm run db:seed` (from root) or `cd backend && npm run db:seed` — creates test users; see table below.

3. **Run backend**
   ```bash
   npm run backend:dev
   ```
   API: http://localhost:4000  
   Swagger: http://localhost:4000/api-docs

4. **Run frontend**
   - Copy `frontend/.env.example` → `frontend/.env` (set `VITE_API_URL=http://localhost:4000`)
   - Optional: set `VITE_DEV_AUTH=1` to show Dev login
   ```bash
   npm run frontend:dev
   ```
   App: http://localhost:9000 (or port from Vite)

5. **Login**
   - **Email/password:** Register at `/register`, then sign in at `/login`. Forgot password at `/forgot-password`; reset at `/reset-password?token=...`.
   - **Dev auth:** set `DEV_AUTH_SECRET` in backend `.env` and `VITE_DEV_AUTH=1` in frontend `.env`, then use the Dev login form with that secret.
   - **Google/Facebook:** configure OAuth credentials in backend `.env` and integrate Google/Facebook Sign-In in the frontend.

6. **Dashboard**
   - After login you are redirected to the main dashboard (wireframe-style: header, sidebar, Tickets table). Sidebar links: Dashboard, Vehicles, Drivers, Trips, Notifications. Placeholder routes for Vehicles/Drivers/Trips/Notifications currently render the same dashboard view.

## Seed users (dev)

After running `cd backend && npm run db:seed`, you can log in with:

| Email | Name | Role | Password (dev) |
|-------|------|------|----------------|
| admin@vehicles.local | Admin User | ADMIN | Password123! |
| driver@vehicles.local | Driver One | DRIVER | Password123! |
| auditor@vehicles.local | Auditor User | AUDITOR | Password123! |

## Scripts

| Command | Description |
|--------|--------------|
| `npm run backend:dev` | Start backend (tsx watch) |
| `npm run backend:test` | Run backend tests |
| `npm run frontend:dev` | Start frontend (Vite) |
| `npm run frontend:test` | Run frontend tests |
| `npm run db:migrate` | Run Prisma migrations (from root) |
| `npm run db:seed` | Seed users (run from `backend/`) |

## Project layout

- `backend/` – Express API, Prisma, auth, Clean Architecture
- `frontend/` – Vue 3 + Quasar SPA, i18n (en, sr-lat, sr-cyr)
- `project-doc/` – BRD, PRD, clean architecture, roadmap, QA flow

See `project-doc/PRD.md` and `project-doc/BRD.md` for requirements; `project-doc/clean_architecture.md` for architecture.
