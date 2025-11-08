#!/bin/bash
# ============================================
# Run Database Migrations
# ============================================

set -e

# Wait for database to be ready
echo "Waiting for database..."
until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-ggds_admin} 2>/dev/null; do
    sleep 2
done

# Run migrations
echo "Running database migrations..."
docker-compose exec -T backend alembic upgrade head

echo "✓ Migrations completed"
