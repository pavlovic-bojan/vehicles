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
   - **Order:** run migrations first, then seed, then start backend and frontend.
   ```bash
   cd backend
   npx prisma migrate dev --name init   # use npx prisma (Prisma is in node_modules)
   npx prisma generate
   npm run db:seed
   ```
   - **If you get P3014 (permission denied to create database):** PostgreSQL user cannot create the shadow database. Two options:
     1. **Shadow database:** Create an empty database (e.g. `createdb vehicles_db_shadow`), in `backend/prisma/schema.prisma` in the `datasource db` block add: `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")`, in `backend/.env` add `SHADOW_DATABASE_URL="postgresql://user:pass@localhost:5432/vehicles_db_shadow"` (same user/pass as DATABASE_URL), then run `npx prisma migrate dev --name init` again.
     2. **Without migrate (schema only):** use `npx prisma db push` instead of `migrate dev` – applies schema without migration files (enough for local dev); then `npm run db:seed`.
   - Seed creates **5 organizations**, each with **150 vehicles (trucks), 150 drivers, 150 trailers, 150 trips**, 30 locations, 200 fuel records, 150 documents and login audit. Login: **admin@vehicles.local** or **admin@org1.vehicles.local** … **admin@org5.vehicles.local** (password: **Password123!**). To reseed (drops all, applies schema, runs seed): `cd backend && npm run db:reset`. (Project uses `db push`, not migrations – `migrate reset` would not create tables.)

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

After running `cd backend && npm run db:seed` (or `npx prisma migrate reset`), you can log in with:

| Email | Role | Password |
|-------|------|----------|
| admin@vehicles.local | ADMIN (org 1) | Password123! |
| admin@org1.vehicles.local … admin@org5.vehicles.local | ADMIN | Password123! |
| driver@org1.vehicles.local … driver@org5.vehicles.local | DRIVER | Password123! |

Seed: **5 organizations**, each with **150 vehicles, 150 drivers, 150 trailers, 150 trips**, 30 locations, 200 fuel, 150 documents.

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
