# Backend Rules

> **⚠️ CRITICAL**: Always apply **100% best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Backend Rules

- Use Clean Architecture (domain → use cases → infrastructure → interfaces) – see `project-doc/clean_architecture.md`
- Use Express with TypeScript
- Prisma ORM for database operations (see [05-database-rules.md](./05-database-rules.md))
- Redis + BullMQ for async jobs (reports, notifications), retry/backoff for external APIs
- Always validate input with express-validator
- Use middleware pattern for reusable logic
- Error handling: Use custom ApiError class
- Authentication: OAuth (Google, Facebook) + JWT; encrypted tokens, auto-refresh
- **MANDATORY: All API endpoints MUST be documented with Swagger/OpenAPI** - see [Swagger Documentation Rules](#swagger-documentation-rules) below
- Use Winston for logging; audit logs and status tracking for trips, vehicles, drivers
- Environment variables: Never commit `.env` files (they contain secrets). Always commit `.env.example` files with all variables documented (with example values, not real secrets)
- **Write tests IMMEDIATELY**: Unit tests for services/utils, Integration tests for API endpoints; mock Google Maps API and OAuth in tests (see [04-testing-rules.md](./04-testing-rules.md))

## Backend Structure (Clean Architecture)

Backend follows **Clean Architecture** as in `project-doc/enterprise_meta_ads_saa_s_clean_architecture.md`:

```
backend/
├── src/
│   ├── __tests__/          # Unit, integration, helpers; mock Meta Ads API
│   ├── domain/             # Entities & business rules (Campaign, AdSet, Ad, Template, Rule, AIRequest)
│   ├── usecases/           # Application logic (BulkDeployCampaigns, EvaluateRules, GenerateAISuggestions, RollbackDeployment)
│   ├── infrastructure/     # PostgreSQL (Prisma), Meta Ads API client, Redis + BullMQ, OpenAI/AI service, logging
│   ├── interfaces/         # Controllers, routes, DTOs
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   └── utils/              # Utility functions
└── prisma/
    └── schema.prisma       # Database schema
```

### Clean Architecture Layers

1. **Domain** – Entities and business rules (no external deps)
2. **Use Cases** – Application logic (orchestrate domain + infrastructure)
3. **Infrastructure** – DB (Prisma), Meta Ads API, Redis/BullMQ queues, AI API, logging
4. **Interfaces** – Controllers, routes, DTOs (HTTP layer)

For feature modules that keep a modular layout (e.g. auth, vehicles, trips), use the same layering: repository interfaces in domain, use cases in usecases, Prisma/API clients in infrastructure, controllers/routes in interfaces. See `backend/CLEAN_ARCHITECTURE.md` if present.

## Backend Environment Variables

**Local Development** (`.env` - not committed):
- Required: `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `REDIS_URL` (for BullMQ)
- Optional: OAuth credentials (Google, Facebook), Google Maps API key
- These are loaded from `.env` file at runtime

**Template** (`.env.example` - committed to git):
- Must include all variables with example values
- Example: `JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"`
- Include comments explaining what each variable does
- Never include real secrets or production values

See [00-project-overview.md](./00-project-overview.md) for general environment variable rules.

## Security Rules

### Backend Security

- Always validate and sanitize user input
- Use parameterized queries (Prisma handles this)
- Implement rate limiting on API endpoints
- Use Helmet.js for security headers
- Never log sensitive data (passwords, tokens)
- Use environment variables for secrets (never hardcode)

## API Design Rules

### RESTful Conventions

- Use proper HTTP methods: GET, POST, PUT, DELETE, PATCH
- Use plural nouns for resources: `/api/vehicles`, `/api/drivers`, `/api/trips`, `/api/fuel-records`
- Use nested resources for relationships: e.g. `/api/vehicles/:id/trips`, `/api/drivers/:id/trips`
- Return appropriate HTTP status codes
- Use consistent response format: `{ data, message, errors? }`

### Error Responses

- Use ApiError class for consistent error handling
- Return validation errors in format: `{ errors: [{ field, message, code }] }`
- Include error codes for client-side handling
- Never expose internal error details in production

## Error Handling

### Backend Error Handling

- Use try-catch blocks for async operations
- Log errors with context (request ID, user ID, etc.)
- Return user-friendly error messages
- Never expose stack traces in production

## Common Patterns

### API Endpoint Pattern

```typescript
// controller.ts
export async function getResource(req: Request, res: Response) {
  try {
    const data = await service.getResource(req.params.id);
    res.json({ data });
  } catch (error) {
    handleError(error, res);
  }
}

// routes.ts
router.get('/:id', authenticate, getResource);
```

### Service Layer Pattern

```typescript
// service.ts
export async function getResource(id: string, prisma: PrismaClient) {
  const resource = await prisma.resource.findUnique({
    where: { id },
  });
  
  if (!resource) {
    throw new ApiError('Resource not found', 404);
  }
  
  return resource;
}
```

### Validation Pattern

```typescript
// routes.ts
import { body, param, validationResult } from 'express-validator';

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... rest of handler
  }
);
```

## Swagger Documentation Rules

**⚠️ CRITICAL: Swagger documentation is MANDATORY for ALL API endpoints.**

### Requirements

- **MANDATORY**: Every API endpoint MUST have Swagger/OpenAPI documentation
- **MANDATORY**: Documentation MUST be added IMMEDIATELY when creating a new endpoint
- **MANDATORY**: Documentation MUST be updated IMMEDIATELY when modifying an existing endpoint
- **MANDATORY**: Documentation must be placed directly above the route definition using `@swagger` JSDoc comments

### Documentation Format

```typescript
/**
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resource:
 *                   $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/:id',
  validateResourceId,
  (req, res, next) => resourceController.getResource(req, res, next)
);
```

### Required Documentation Elements

Every endpoint documentation MUST include:

1. **Path and Method**: `/api/resource/{id}` with HTTP method (get, post, put, delete, patch)
2. **Summary**: Brief description of what the endpoint does
3. **Tags**: Array of tags for grouping (e.g., `[Resource]`, `[Vehicles]`, `[Drivers]`, `[Trips]`)
4. **Security**: Authentication requirements (if applicable)
   - `- bearerAuth: []` for authenticated endpoints
   - Omit for public endpoints
5. **Parameters**: Path, query, and header parameters (if any)
   - Include `in`, `name`, `required`, `schema`, `description`
6. **Request Body**: For POST, PUT, PATCH endpoints
   - Include `required`, `content`, `schema` with properties
7. **Responses**: All possible HTTP status codes
   - At minimum: 200/201 (success), 400 (validation error), 401 (unauthorized), 404 (not found), 403 (forbidden)
   - Include response schemas using `$ref: '#/components/schemas/...'` when available

### Validation Checklist

Before committing any backend changes, verify:

- [ ] Every `router.get()`, `router.post()`, `router.put()`, `router.patch()`, `router.delete()` has a `@swagger` comment above it
- [ ] All path parameters are documented
- [ ] All query parameters are documented
- [ ] Request body is documented (for POST, PUT, PATCH)
- [ ] All response codes are documented
- [ ] Security requirements are specified
- [ ] Tags are correctly assigned
- [ ] Summary clearly describes the endpoint purpose

### Examples

#### GET Endpoint

```typescript
/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PAUSED, FROZEN]
 *     responses:
 *       200:
 *         description: List of vehicles
 */
router.get('/', (req, res, next) => controller.getVehicles(req, res, next));
```

#### POST Endpoint

```typescript
/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - driverId
 *             properties:
 *               vehicleId:
 *                 type: string
 *               driverId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validateCreateTrip, (req, res, next) => controller.createTrip(req, res, next));
```

### Enforcement

- **Code Review**: All pull requests will be rejected if endpoints lack Swagger documentation
- **Pre-commit**: Consider adding a pre-commit hook to verify Swagger documentation (optional)
- **CI/CD**: Consider adding automated checks for Swagger documentation completeness (optional)

**Remember**: Swagger documentation is not optional. It is a requirement for every endpoint, new or existing.

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Development workflow
- [04-testing-rules.md](./04-testing-rules.md) - Testing rules for backend
- [05-database-rules.md](./05-database-rules.md) - Database and Prisma rules
- [06-documentation-rules.md](./06-documentation-rules.md) - API documentation rules