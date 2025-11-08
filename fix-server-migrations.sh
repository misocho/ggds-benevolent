#!/bin/bash
# ============================================
# Fix Corrupted Migration Files on Server
# ============================================
# Run this script ON THE SERVER to fix null byte corruption
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Fix Corrupted Migration Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

APP_DIR="/opt/ggds"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: $APP_DIR not found${NC}"
    exit 1
fi

cd $APP_DIR

echo -e "${YELLOW}→${NC} Stopping containers..."
docker-compose down

echo -e "${YELLOW}→${NC} Removing corrupted migration files..."
rm -rf ggds-backend/alembic/versions/*

echo -e "${YELLOW}→${NC} Pulling fresh code from repository..."
git fetch origin main
git reset --hard origin/main

echo -e "${GREEN}✓${NC} Migration files restored from repository"

echo -e "${YELLOW}→${NC} Checking for null bytes in migration files..."
cd ggds-backend/alembic/versions
for file in *.py; do
    if [ -f "$file" ]; then
        if grep -q $'\x00' "$file" 2>/dev/null; then
            echo -e "${RED}  ❌ Null bytes found in: $file${NC}"
        else
            echo -e "${GREEN}  ✓ Clean: $file${NC}"
        fi
    fi
done

cd /opt/ggds

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Migration files fixed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Now run:${NC} ./deploy-manual.sh"
echo ""
