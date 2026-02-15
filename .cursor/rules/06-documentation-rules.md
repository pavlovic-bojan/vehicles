# Documentation Rules

> **⚠️ CRITICAL**: Always apply **100% best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Documentation Rules

### Code Comments

- Use JSDoc for functions and classes
- Explain "why" not "what" in comments
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

### JSDoc Example

```typescript
/**
 * Creates a new trip with the provided data
 * @param data - Trip creation data
 * @param prisma - Prisma client instance
 * @returns Created trip with relations
 * @throws {ApiError} If vehicle or driver not found
 */
export async function createTrip(
  data: CreateTripDto,
  prisma: PrismaClient
): Promise<Trip> {
  // Implementation
}
```

## README Files

- Each workspace (backend, frontend, tests) should have its own README.md
- Root README.md should link to all sub-project READMEs
- Include setup instructions, API documentation links, and examples

## Project Documentation Structure (project-doc/)

- **`project-doc/PRD.md`**: Product Requirements Document – user stories, acceptance criteria, MVP vs Phase 2
- **`project-doc/BRD.md`**: Business Requirements Document – vision, KPIs, fleet/driver/trip management, real-time GPS, documents, compliance
- **`project-doc/clean_architecture.md`**: Clean Architecture blueprint – backend (domain, usecases, infrastructure, interfaces), frontend (domain, services, components, views), mobile (driver app)
- **`project-doc/node_ts_roadmap.md`**: Node.js + TypeScript architecture and roadmap – modules, stack (Express, PostgreSQL, Redis, BullMQ, Vue3, Quasar), testing (Vitest/Jest, Playwright, k6), CI/CD
- **`project-doc/qa_flow.md`**: QA flow and test structure – unit, integration, API validation, E2E (Playwright), mocks (Google Maps API, OAuth)
- **`LOCAL_SETUP.md`**: Local development setup guide
- **`CI-CD.md`** (if present): CI/CD and deployment documentation

## User Documentation

- User manual in `user-manual/` folder with language subfolders (en, sr-lat, sr-cyr)
- All user-facing documentation must be translated to all three languages
- User manual is accessible in-app through the profile dropdown menu

### User Manual Structure

```
user-manual/
├── en/              # English documentation
├── sr-lat/          # Serbian Latin documentation
├── sr-cyr/          # Serbian Cyrillic documentation
└── images/          # Shared images
```

## API Documentation

- All API endpoints must be documented with Swagger/OpenAPI
- Use Swagger annotations in route files
- Keep API documentation up-to-date with code changes
- Include request/response examples

### Swagger Documentation Example

```typescript
/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 */
router.get('/', authenticate, getVehicles);
```

## Documentation Updates Workflow

**When implementing new features or updating existing ones:**

1. **User Manual**: Update `user-manual/` folder in all three languages
2. **README Files**: Update relevant README.md files
3. **Setup Documentation**: Update `LOCAL_SETUP.md` if dependencies or setup changed
4. **Swagger Documentation**: Update API docs if API changed
5. **PRD/BRD**: Update `project-doc/PRD.md` or `project-doc/BRD.md` if requirements changed

See [01-development-workflow.md](./01-development-workflow.md) for detailed workflow.

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Documentation in workflow
- [02-backend-rules.md](./02-backend-rules.md) - API documentation
- [03-frontend-rules.md](./03-frontend-rules.md) - User documentation