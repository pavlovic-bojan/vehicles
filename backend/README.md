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
- **Vehicles (Fleet Management):** All require `Authorization: Bearer <token>`
  - `GET /api/vehicles` – list vehicles for current org
  - `GET /api/vehicles/:id` – get vehicle by ID
  - `POST /api/vehicles` – create vehicle (make, model, vin?, registration?, mileage?, purchaseDate?, status?)
  - `PUT /api/vehicles/:id` – update vehicle
  - `DELETE /api/vehicles/:id` – delete vehicle
  - Status: ACTIVE | PAUSED | FROZEN | IN_SERVICE
- **Drivers:** `GET/POST /api/drivers`, `GET/PUT/DELETE /api/drivers/:id` – name, licenseNumber?, licenseExpiry?, phone?, userId?, status (ACTIVE | PAUSED | FROZEN)
- **Trips:** `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/:id` – vehicleId, driverId, startAt, startMileage?, endAt?, endMileage?, status (PRE_TRIP | IN_PROGRESS | POST_TRIP | COMPLETED), notes?
- **Fuel records:** `GET/POST /api/fuel-records`, `GET/DELETE /api/fuel-records/:id` – vehicleId, tripId?, amountLiters, costCents?, recordedAt?, notes?
- **Locations (Parking/Service):** `GET/POST /api/locations`, `GET/PUT/DELETE /api/locations/:id` – name, type (PARKING | SERVICE), address?, status (ACTIVE | PAUSED | FROZEN). Query: `?type=PARKING` or `?type=SERVICE`
- **GPS (mock):** `GET /api/gps/positions` – returns mock vehicle positions for current org (for map integration)
- **Documents:** `GET/POST /api/documents`, `GET/DELETE /api/documents/:id` – metadata only (entityType: TRIP | VEHICLE | DRIVER, entityId, fileName, fileUrl?, mimeType?). Query: `?entityType=TRIP&entityId=uuid`
