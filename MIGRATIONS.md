# Database Migrations Guide

## Overview

This project uses **Alembic** for database migrations. Migrations run automatically on deployment, but you can also run them manually when needed.

---

## How Migrations Work

### Automatic Migrations (Default)

Migrations run automatically when the backend container starts:
- Configured in `ggds-backend/Dockerfile` line 47
- Command: `alembic upgrade head && uvicorn app.main:app ...`
- Runs every time the backend container restarts

### Migration Files Location

```
ggds-backend/alembic/versions/
├── 37e22dfaff85_add_accountability_fields_to_members.py
├── 52b7eddab128_add_receipt_fields_to_contributions.py
└── 8a317fca7c64_pivot_v2_0_add_profile_tracking_and_.py
```

---

## Manual Migration Commands

### Run Migrations Manually

Use the provided script:

```bash
# From project root
./run-migrations.sh
```

Or run directly with docker-compose:

```bash
# Apply all pending migrations
docker-compose exec backend alembic upgrade head

# Check current migration version
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history

# Rollback one migration
docker-compose exec backend alembic downgrade -1

# Rollback to specific version
docker-compose exec backend alembic downgrade <revision_id>
```

---

## Creating New Migrations

### Auto-generate from model changes:

```bash
# 1. Make changes to your SQLAlchemy models in app/models/

# 2. Generate migration
docker-compose exec backend alembic revision --autogenerate -m "description of changes"

# 3. Review the generated file in alembic/versions/

# 4. Apply the migration
docker-compose exec backend alembic upgrade head
```

### Create empty migration (for custom SQL):

```bash
docker-compose exec backend alembic revision -m "custom migration"
```

---

## Deployment Migration Flow

When you deploy:

1. **Build Phase**: Docker image is built with migration files
2. **Startup Phase**: Backend container starts
3. **Migration Phase**: `alembic upgrade head` runs automatically
4. **Application Phase**: FastAPI application starts
5. **Verification**: Deployment script checks migration status

---

## Troubleshooting

### Check if migrations are pending:

```bash
docker-compose exec backend alembic heads
docker-compose exec backend alembic current
```

### View migration logs:

```bash
docker-compose logs backend | grep alembic
```

### Force re-run migrations:

```bash
# Restart backend container (migrations run on startup)
docker-compose restart backend

# Or run manually
docker-compose exec backend alembic upgrade head
```

### Migration failed - what to do:

1. **Check the error**:
   ```bash
   docker-compose logs backend
   ```

2. **Common issues**:
   - Database not ready → Wait a few seconds and restart
   - Syntax error in migration file → Fix the migration file
   - Corrupted migration files → See fix below

3. **Fix corrupted migration files** (if you see "null bytes" error):
   ```bash
   ./fix-server-migrations.sh
   ```

### Reset database (WARNING: deletes all data):

```bash
# Stop containers
docker-compose down -v

# This deletes the database volume!
# Start fresh
docker-compose up -d

# Migrations will run automatically on startup
```

---

## Migration Best Practices

1. **Always review auto-generated migrations** before applying
2. **Test migrations locally** before deploying to production
3. **Keep migrations small and focused** - one change per migration
4. **Never edit applied migrations** - create a new one to fix issues
5. **Backup database** before running migrations in production

---

## Quick Reference

| Task | Command |
|------|---------|
| Apply all migrations | `docker-compose exec backend alembic upgrade head` |
| Check current version | `docker-compose exec backend alembic current` |
| View migration history | `docker-compose exec backend alembic history` |
| Create new migration | `docker-compose exec backend alembic revision --autogenerate -m "message"` |
| Rollback one migration | `docker-compose exec backend alembic downgrade -1` |
| Run migration script | `./run-migrations.sh` |

---

## Migrations in CI/CD

Migrations are handled automatically in the deployment pipeline:

1. GitHub Actions pushes code to server
2. `deploy-manual.sh` builds Docker images
3. Backend container starts
4. Migrations run automatically (`alembic upgrade head`)
5. Application starts serving requests

No manual intervention needed for standard deployments!
