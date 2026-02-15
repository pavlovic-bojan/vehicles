# Backend – Vehicles API

Express + TypeScript API with Prisma (PostgreSQL), JWT auth, OAuth (Google/Facebook), and login audit.

## Setup

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL`, `JWT_SECRET` (min 32 chars)
3. Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` for OAuth
4. Optional: `DEV_AUTH_SECRET` for dev-only login
5. Run migrations: `npx prisma migrate dev`
6. Generate client: `npx prisma generate`

## Run

- Dev: `npm run dev`
- Test: `npm run test`
- Build: `npm run build` then `npm start`

## API

- Base: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`
- Health: `GET /health`
- **Auth (email/password):**
  - `POST /api/auth/register` – name, email, password, role (ADMIN | DRIVER | AUDITOR)
  - `POST /api/auth/login` – email, password
  - `POST /api/auth/forgot-password` – email (returns ok; if user exists, reset token created)
  - `POST /api/auth/reset-password` – token, newPassword
- **Auth (OAuth / dev):** `POST /api/auth/google`, `POST /api/auth/facebook`, `GET /api/auth/me`, `POST /api/auth/dev` (dev only)
