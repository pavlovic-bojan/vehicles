# Database Rules

> **⚠️ CRITICAL**: Always apply **100% best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Database Rules

### Prisma

- Always run migrations: `npx prisma migrate dev`
- Generate Prisma client after schema changes: `npx prisma generate`
- Use transactions for multi-step operations
- Add indexes for frequently queried fields
- Use enums for fixed value sets
- Document relationships in schema comments

### Migrations

- Never edit existing migrations
- Create new migration for schema changes
- Test migrations on development database first

## Database Environment Variables
### .env (backend):

- DATABASE_URL="postgresql://user:password@localhost:5432/vehicles_db"

### .env.example (committed to git):

- DATABASE_URL="postgresql://username:password@localhost:5432/vehicles_db"

PostgreSQL stores: users, vehicles, drivers, trips, fuel records, parking, services, documents, audit logs (per `project-doc`).

## Prisma Schema Best Practices

### Model Definition

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(DRIVER)
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([orgId])
  @@map("users")
}
```

### Relationships

Multi-tenant: one organization per fleet; users, vehicles, drivers, trips belong to org. Example:

```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String
  users     User[]
  vehicles  Vehicle[]
  drivers   Driver[]
  trips     Trip[]
  @@map("organizations")
}

model Vehicle {
  id        String   @id @default(uuid())
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  name      String
  @@index([orgId])
  @@map("vehicles")
}
```

### Enums (per project-doc)

```prisma
enum UserRole {
  ADMIN
  DRIVER
  AUDITOR
}

model User {
  role UserRole @default(DRIVER)
}
```

## Migration Workflow

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name feature-name`
3. Review generated migration file
4. Test migration on development database
5. Generate Prisma client: `npx prisma generate`
6. Update tests if schema changed (see [04-testing-rules.md](./04-testing-rules.md))

## Database Performance

- Add indexes for frequently queried fields
- Use `select` to limit returned fields
- Use `include` or `select` to avoid N+1 queries
- Use transactions for multi-step operations
- Monitor query performance in development

## Database Security

- Use parameterized queries (Prisma handles this automatically)
- Never expose database credentials
- Use environment variables for `DATABASE_URL`
- Use connection pooling in production

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Database changes in workflow
- [02-backend-rules.md](./02-backend-rules.md) - Backend rules
- [04-testing-rules.md](./04-testing-rules.md) - DB tests