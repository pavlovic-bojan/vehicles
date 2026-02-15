# Implementation Status vs project-doc (PRD, BRD, Roadmap)

Overview of what is implemented relative to PRD, BRD and `node_ts_roadmap.md` (MVP Phase 1 and Phase 2 items).

**Last update:** **Documents** – document list column **"Uploaded by"** (who created the document). (Previously: Audit log – pagination, search, sort; Reports – date range, Trips per org, Fuel/Parking tables with org, sort, pagination.)

---

## ✅ Implemented (MVP Phase 1 + additions)

### Backend
| Requirement (PRD / roadmap) | Status | Note |
|-----------------------------|--------|------|
| Node.js + TypeScript + Express | ✅ | `backend/` |
| PostgreSQL (Prisma) | ✅ | Prisma schema, migrations / db push |
| Auth: registration, login (email/password) | ✅ | `auth.routes.ts` |
| Auth: OAuth Google & Facebook | ✅ | `loginWithGoogle`, `loginWithFacebook` |
| JWT, RBAC (Admin, Driver, Auditor) | ✅ | `middleware/auth.ts`, User.role |
| Login audit log | ✅ | Model `LoginAudit`, recorded on login |
| **Login audit API (admin)** | ✅ | `GET /api/auth/audit` – pagination (page, limit), sort (createdAt, action, ip, userAgent, user), search |
| Forgot / Reset password | ✅ | Tokens, email (if configured) |
| Vehicle CRUD + status (active/paused/frozen/in service) | ✅ | `vehicle.routes`, Prisma Vehicle |
| **Trailer CRUD** | ✅ | `trailer.routes`, `trailer.service`, Prisma Trailer |
| Driver CRUD + status | ✅ | `driver.routes`, Driver model |
| Trip lifecycle (create, update, delete) | ✅ | `trip.routes`, Trip–vehicle–driver |
| Fuel records (create, list, delete) | ✅ | `fuel.routes`, FuelRecord |
| Parking & Service (Locations) CRUD | ✅ | `location.routes`, Location (type PARKING/SERVICE) |
| Document API (list, create, link to trip/vehicle/driver, delete) | ✅ | `document.routes.ts` |
| **File integrity / tampering detection (PRD 4.11)** | ✅ | `contentHash` on Document, `DocumentIntegrityLog`, `GET /api/documents/:id/verify-integrity` |
| **Reports API** | ✅ | GET /api/reports/summary, /fuel, /trips (optional **from/to**); GET /api/reports/locations (parking & service); fuel with **orgName**; trips with **perOrg** (by organization) |
| GPS API (vehicle positions) | ✅ | `gps.routes.ts` – mock positions for MVP |
| Swagger / API docs | ✅ | `/api-docs` |
| Unit & integration tests | ✅ | Vitest, `__tests__/` |
| **Seed (database with data)** | ✅ | `prisma/seed.ts` – **5 orgs**, each with 150 vehicles/drivers/trailers/trips, 30 locations, 200 fuel, 150 docs, login audit; full reseed: `npm run db:reset` (db push + seed) |

### Frontend
| Requirement | Status | Note |
|-------------|--------|------|
| Vue 3 + Pinia + Vue Router | ✅ | |
| Dashboard (overview: vehicles, drivers, trips, fuel, locations) | ✅ | `DashboardPage.vue` |
| Vehicles: list, add/edit (drawer), delete, sort, search, pagination | ✅ | `VehiclesPage.vue` |
| **Trailers: CRUD, list, drawer, delete, sort, search, pagination** | ✅ | `TrailersPage.vue`, `trailers.api.ts`, route `/trailers` |
| Drivers: same | ✅ | `DriversPage.vue` |
| Trips: same | ✅ | `TripsPage.vue` |
| Fuel: list, add, delete, sort, search, pagination | ✅ | `FuelPage.vue` |
| Locations (Parking/Service): CRUD, filter by type, search, pagination | ✅ | `LocationsPage.vue` |
| **Document Management UI** | ✅ | `DocumentsPage.vue` – list (column **Uploaded by** – who created), filter, add link, delete, contentHash, Verify integrity, route `/documents` |
| **Notifications page** | ✅ | `NotificationsPage.vue` – placeholder list, route `/notifications` |
| **Reports page** | ✅ | Date/time From–To, Load report, export CSV/PDF; **Trips by status** + table "Trips by organization"; **Fuel by vehicle** (Organization column, sort, pagination); **Parking & Service** (locations table, sort, pagination); Summary cards |
| **Audit log UI (admin)** | ✅ | `AuditLogPage.vue` – search (debounce), sortable columns, pagination (rows per page), route `/audit`, nav for ADMIN only |
| Auth: Login, Register, Forgot, Reset | ✅ | Corresponding pages |
| OAuth: Google / Facebook buttons on login page | ✅ | `LoginPage.vue` |
| Multilingual (EN, ES, FR, SR Latin, SR Cyrillic) | ✅ | vue-i18n, `locales/` |
| Dark / light theme | ✅ | MainLayout + App.vue global styles (including documents, notifications, reports, audit, trailers) |
| Layout: header, sidebar, main content | ✅ | `MainLayout.vue` |
| Vue DevTools (development) | ✅ | `vite-plugin-vue-devtools` |

---

## ❌ Not implemented (per project-doc)

### Backend
| Requirement | Status | Reference |
|-------------|--------|-----------|
| Redis + BullMQ (job queue, notifications, reports) | ❌ | Roadmap: async queue |
| Real Google Maps API integration | ❌ | GPS is mock; PRD/BRD: Google Maps for routing and locations |
| Push / email notifications (expiry, service intervals) | ❌ | PRD 4.12, roadmap Phase 2 |

### Frontend
| Requirement | Status | Reference |
|-------------|--------|-----------|
| Real-time map (vehicle positions on map) | ❌ | Backend `/api/gps/positions` (mock) exists; no Map view in frontend |

### General
| Requirement | Status |
|-------------|--------|
| Driver mobile app | ❌ | Roadmap: Phase 2 / separate project |
| E2E tests (Cypress / Playwright) | ❌ | qa_flow.md recommends; not in repo |
| CI/CD pipeline (GitHub Actions / GitLab CI) | ❌ | Roadmap 5 |

---

## Conclusion

- **MVP Phase 1 and all planned additions (excluding E2E, Redis/BullMQ and real-time map) are implemented:**
  - Auth (email, OAuth, JWT, RBAC), dashboard, vehicles, drivers, trips, fuel, locations.
  - **Document Management UI** – Documents page, API client, filter, add link, delete.
  - **Notifications page** – placeholder list at `/notifications`.
  - **Audit log UI** – GET audit with pagination, sort and search; Audit log page for ADMIN (search as you type, sortable columns, rows per page).
  - **Reporting** – summary, fuel, trips (from/to), **locations** (parking & service); fuel with Organization column; trips with **perOrg** (table by organization); Reports page: date range, export CSV/PDF, Fuel and Parking & Service tables with sort and pagination.
  - **Trailer management** – backend CRUD (Trailer), frontend Trailers page (CRUD, table, drawer).
  - **Seed** – 5 organizations, each with 150 vehicles/drivers/trailers/trips, 30 locations, 200 fuel, 150 documents, login audit; full reseed: `cd backend && npm run db:reset`.
  - **File integrity / tampering detection (PRD 4.11)** – contentHash on document, verification (fetch by fileUrl, SHA-256 compare), audit check (`DocumentIntegrityLog`), UI: optional contentHash field on add, "Verify integrity" button for documents with hash and URL; document list column **Uploaded by** (who created the document).

- **Remaining from project-doc (Phase 2 / out of scope):**
  1. **Real-time map** – Map view in frontend (Leaflet/Mapbox + `/api/gps/positions`).
  2. **Redis + BullMQ** – job queue, notifications.
  3. **Push / email notifications** – expiry, service intervals.
  4. **E2E tests and CI/CD** – qa_flow, roadmap.

Detailed implementation plan: `project-doc/TODO_IMPLEMENTATION.md`.
