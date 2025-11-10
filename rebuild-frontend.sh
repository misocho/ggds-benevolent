#!/bin/bash
# ============================================
# Rebuild Frontend with Correct API URL
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Rebuild Frontend with Correct API URL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

API_URL="https://api.investggds.com"

echo -e "${YELLOW}→${NC} API URL: ${API_URL}"
echo ""

# Step 1: Create .env file in frontend directory
echo -e "${YELLOW}→${NC} Creating .env file..."
cat > ggds-benevolent-fund/.env << EOF
NEXT_PUBLIC_API_URL=${API_URL}
NODE_ENV=production
EOF
echo -e "${GREEN}✓${NC} .env file created"
echo ""

# Step 2: Stop frontend
echo -e "${YELLOW}→${NC} Stopping frontend container..."
docker-compose stop frontend
echo ""

# Step 3: Remove old build
echo -e "${YELLOW}→${NC} Removing old build..."
docker-compose rm -f frontend
echo ""

# Step 4: Rebuild with NO CACHE
echo -e "${YELLOW}→${NC} Rebuilding frontend (this takes 2-3 minutes)..."
docker-compose build --no-cache --build-arg NEXT_PUBLIC_API_URL=${API_URL} frontend
echo -e "${GREEN}✓${NC} Frontend rebuilt"
echo ""

# Step 5: Start with environment variable
echo -e "${YELLOW}→${NC} Starting frontend..."
docker-compose up -d frontend
sleep 5
echo ""

# Step 6: Check status
echo -e "${YELLOW}→${NC} Checking frontend status..."
if docker-compose ps frontend | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Frontend is running!"
    echo ""

    # Show recent logs
    echo -e "${YELLOW}→${NC} Recent logs:"
    docker-compose logs --tail=10 frontend
    echo ""

    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ Frontend Rebuilt Successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "API URL configured: ${GREEN}${API_URL}${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT:${NC} Clear your browser cache!"
    echo -e "  Chrome/Firefox: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)"
    echo -e "  Or: Open in Incognito/Private mode"
    echo ""
    echo -e "Then visit: ${GREEN}https://investggds.com${NC}"
else
    echo -e "${RED}✗${NC} Frontend failed to start"
    echo "Check logs:"
    docker-compose logs frontend
fi
echo ""
