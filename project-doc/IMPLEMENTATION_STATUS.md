# Implementation Status vs project-doc (PRD, BRD, Roadmap)

Pregled šta je implementirano u odnosu na PRD, BRD i `node_ts_roadmap.md` (MVP Phase 1 i Phase 2 stavke).

**Poslednji update:** Seed proširen na **5 organizacija**, u svakoj po **150 vozila, 150 vozača, 150 prikolica, 150 vožnji**, 30 lokacija, 200 fuel, 150 dokumenata, login audit; skripta **`npm run db:reset`** (db push --force-reset + seed) za punu bazu (projekat koristi `db push`, ne migracije).

---

## ✅ Implementirano (MVP Phase 1 + dopune)

### Backend
| Zahtev (PRD / roadmap) | Status | Napomena |
|------------------------|--------|----------|
| Node.js + TypeScript + Express | ✅ | `backend/` |
| PostgreSQL (Prisma) | ✅ | Prisma schema, migracije / db push |
| Auth: registracija, login (email/password) | ✅ | `auth.routes.ts` |
| Auth: OAuth Google & Facebook | ✅ | `loginWithGoogle`, `loginWithFacebook` |
| JWT, RBAC (Admin, Driver, Auditor) | ✅ | `middleware/auth.ts`, User.role |
| Login audit log | ✅ | Model `LoginAudit`, snimanje pri loginu |
| **Login audit API (admin)** | ✅ | `GET /api/auth/audit`, `listLoginAudit` u auth.service |
| Forgot / Reset password | ✅ | Tokeni, email (ako je konfigurisan) |
| Vehicle CRUD + status (active/paused/frozen/in service) | ✅ | `vehicle.routes`, Prisma Vehicle |
| **Trailer CRUD** | ✅ | `trailer.routes`, `trailer.service`, Prisma Trailer |
| Driver CRUD + status | ✅ | `driver.routes`, Driver model |
| Trip lifecycle (create, update, delete) | ✅ | `trip.routes`, Trip–vehicle–driver |
| Fuel records (create, list, delete) | ✅ | `fuel.routes`, FuelRecord |
| Parking & Service (Locations) CRUD | ✅ | `location.routes`, Location (type PARKING/SERVICE) |
| Document API (list, create, link to trip/vehicle/driver, delete) | ✅ | `document.routes.ts` |
| **File integrity / tampering detection (PRD 4.11)** | ✅ | `contentHash` na Document, `DocumentIntegrityLog`, `GET /api/documents/:id/verify-integrity` |
| **Reports API** | ✅ | `report.routes`, `report.service` – GET /api/reports/summary, /fuel, /trips |
| GPS API (pozicije vozila) | ✅ | `gps.routes.ts` – mock pozicije za MVP |
| Swagger / API docs | ✅ | `/api-docs` |
| Unit & integration tests | ✅ | Vitest, `__tests__/` |
| **Seed (baza puna podataka)** | ✅ | `prisma/seed.ts` – **5 org**, u svakoj 150 vehicles/drivers/trailers/trips, 30 locations, 200 fuel, 150 docs, login audit; pun reseed: `npm run db:reset` (db push + seed) |

### Frontend
| Zahtev | Status | Napomena |
|--------|--------|----------|
| Vue 3 + Pinia + Vue Router | ✅ | |
| Dashboard (pregled: vehicles, drivers, trips, fuel, locations) | ✅ | `DashboardPage.vue` |
| Vehicles: lista, dodavanje/izmena (drawer), brisanje, sort, pretraga, paginacija | ✅ | `VehiclesPage.vue` |
| **Trailers: CRUD, lista, drawer, brisanje, sort, pretraga, paginacija** | ✅ | `TrailersPage.vue`, `trailers.api.ts`, ruta `/trailers` |
| Drivers: isto | ✅ | `DriversPage.vue` |
| Trips: isto | ✅ | `TripsPage.vue` |
| Fuel: lista, dodavanje, brisanje, sort, pretraga, paginacija | ✅ | `FuelPage.vue` |
| Locations (Parking/Service): CRUD, filter po tipu, pretraga, paginacija | ✅ | `LocationsPage.vue` |
| **Document Management UI** | ✅ | `DocumentsPage.vue`, `documents.api.ts` – list, filter, add link, delete, **contentHash (SHA-256), Verify integrity**, ruta `/documents` |
| **Notifications stranica** | ✅ | `NotificationsPage.vue` – placeholder lista, ruta `/notifications` |
| **Reports stranica** | ✅ | `ReportsPage.vue`, `reports.api.ts` – summary, fuel po vozilu, trips po statusu, export CSV, Save as PDF (print) |
| **Audit log UI (admin)** | ✅ | `AuditLogPage.vue`, `auth.api` getAudit – pregled login audit, ruta `/audit`, nav samo za ADMIN |
| Auth: Login, Register, Forgot, Reset | ✅ | Odgovarajuće stranice |
| OAuth: dugmad Google / Facebook na login stranici | ✅ | `LoginPage.vue` |
| Multilingual (EN, ES, FR, SR latinica, SR ćirilica) | ✅ | vue-i18n, `locales/` |
| Dark / light tema | ✅ | MainLayout + App.vue globalni stilovi (uključujući documents, notifications, reports, audit, trailers) |
| Layout: header, sidebar, main content | ✅ | `MainLayout.vue` |
| Vue DevTools (development) | ✅ | `vite-plugin-vue-devtools` |

---

## ❌ Nije implementirano (prema project-doc)

### Backend
| Zahtev | Status | Referenca |
|--------|--------|-----------|
| Redis + BullMQ (red poslova, notifikacije, reporti) | ❌ | Roadmap: async queue |
| Real Google Maps API integracija | ❌ | GPS je mock; PRD/BRD: Google Maps za rutiranje i lokacije |
| Push / email notifikacije (expiry, service intervals) | ❌ | PRD 4.12, roadmap Phase 2 |

### Frontend
| Zahtev | Status | Referenca |
|--------|--------|-----------|
| Real-time mapa (prikaz vozila na mapi) | ❌ | Backend `/api/gps/positions` (mock) postoji; nema Map view u frontendu |

### Opšte
| Zahtev | Status |
|--------|--------|
| Driver mobilna aplikacija | ❌ | Roadmap: Phase 2 / poseban projekat |
| E2E testovi (Cypress / Playwright) | ❌ | qa_flow.md preporučuje; nisu u repou |
| CI/CD pipeline (GitHub Actions / GitLab CI) | ❌ | Roadmap 5 |

---

## Zaključak

- **MVP Phase 1 i sve planirane dopune (bez E2E, Redis/BullMQ i real-time mape) su implementirane:**
  - Auth (email, OAuth, JWT, RBAC), dashboard, vehicles, drivers, trips, fuel, locations.
  - **Document Management UI** – stranica Documents, API klijent, filter, add link, delete.
  - **Notifications stranica** – placeholder lista na `/notifications`.
  - **Audit log UI** – GET audit API, stranica Audit log za ADMIN na `/audit`.
  - **Reporting** – backend report endpointi (summary, fuel, trips), frontend Reports stranica sa grafovima i export CSV/PDF.
  - **Trailer management** – backend CRUD (Trailer), frontend Trailers stranica (CRUD, tabela, drawer).
  - **Seed** – 5 organizacija, u svakoj 150 vozila/vozača/prikolica/vožnji, 30 lokacija, 200 fuel, 150 dokumenata, login audit; pun reseed: `cd backend && npm run db:reset`.
  - **File integrity / tampering detection (PRD 4.11)** – contentHash na dokumentu, verifikacija (fetch po fileUrl, uporedba SHA-256), audit log provera (`DocumentIntegrityLog`), UI: opciono polje contentHash pri dodavanju, dugme „Verify integrity” za dokumente sa hash-om i URL-om.

- **Ostalo iz project-doc (Phase 2 / izuzeto):**
  1. **Real-time mapa** – Map view u frontendu (Leaflet/Mapbox + `/api/gps/positions`).
  2. **Redis + BullMQ** – red poslova, notifikacije.
  3. **Push / email notifikacije** – expiry, service intervals.
  4. **E2E testovi i CI/CD** – qa_flow, roadmap.

Detaljan plan implementacije (šta je urađeno redom): `project-doc/TODO_IMPLEMENTATION.md`.
