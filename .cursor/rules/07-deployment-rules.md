# Deployment Rules

> **⚠️ CRITICAL**: Always apply **100% best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Deployment Rules

See `project-doc/node_ts_roadmap.md` for CI/CD and deployment targets.

### CI/CD

- All environments (dev, test, staging, production); Contabo VPS or target (e.g. DigitalOcean ECS, Kubernetes)
- Use Docker + Docker Compose for containerization
- GitHub Actions / GitLab CI for CI/CD pipelines
- Never commit secrets to repository
- Use environment-specific `.env` files
- Deploy to staging → smoke tests → deploy to production on approval

### Docker

- Multi-stage builds for production
- Use .dockerignore to exclude unnecessary files
- Health checks for all services (backend, Redis, queue workers)
- Proper logging configuration; Redis queue + job failure alerting (Sentry / Grafana)

## Performance Rules

### Backend Performance

- Use database indexes for frequently queried fields (see [05-database-rules.md](./05-database-rules.md))
- Implement pagination for list endpoints
- Use Redis for caching (e.g. map/session data, temporary tokens per doc)
- Optimize database queries (avoid N+1 problems)
- Rate-limit and retry/backoff for Google Maps API and external services

### Frontend Performance

- Lazy load routes
- Code splitting for large components
- Optimize images and assets
- Minimize bundle size

## Environment-Specific Configuration

### Development

- Hot reload enabled
- Detailed error messages
- Verbose logging
- Development database

### Test

- Test database
- Test data fixtures
- Automated test execution

### Staging

- Production-like environment
- Staging database
- Pre-production testing

### Production

- Optimized builds
- Production database (PostgreSQL)
- Redis for BullMQ queues; monitor job failures and queue depth
- **99.9% uptime target** (per project-doc); health / status dashboard or public status page
- Error tracking (e.g. Sentry)
- Performance monitoring (e.g. Grafana)
- Security hardening

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (see [04-testing-rules.md](./04-testing-rules.md))
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Documentation updated (see [06-documentation-rules.md](./06-documentation-rules.md))
- [ ] Backup strategy in place
- [ ] Rollback plan prepared

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Deployment in workflow
- [02-backend-rules.md](./02-backend-rules.md) - Backend security
- [05-database-rules.md](./05-database-rules.md) - Database migrations