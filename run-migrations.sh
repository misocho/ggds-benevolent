#!/bin/bash
# ============================================
# Database Migration Script
# ============================================
# Run this to apply database migrations
# Can be run standalone or as part of deployment
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - Database Migration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory${NC}"
    exit 1
fi

# Wait for database to be ready
echo -e "${YELLOW}→${NC} Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-ggds_admin} 2>/dev/null; do
    echo -e "${YELLOW}  Waiting for PostgreSQL...${NC}"
    sleep 2
done
echo -e "${GREEN}✓${NC} Database is ready"

# Check current migration status
echo -e "${YELLOW}→${NC} Checking current migration status..."
docker-compose exec -T backend alembic current || echo "No migrations applied yet"

# Show pending migrations
echo -e "${YELLOW}→${NC} Checking for pending migrations..."
docker-compose exec -T backend alembic heads

# Run migrations
echo -e "${YELLOW}→${NC} Running database migrations..."
docker-compose exec -T backend alembic upgrade head

# Verify migration status
echo -e "${YELLOW}→${NC} Verifying migration status..."
docker-compose exec -T backend alembic current

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Database migrations completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
