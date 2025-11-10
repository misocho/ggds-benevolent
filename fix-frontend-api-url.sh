#!/bin/bash
# ============================================
# Fix Frontend API URL and Rebuild
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Fix Frontend API URL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Update .env.production
echo -e "${YELLOW}→${NC} Updating .env.production..."
cat > .env.production << 'EOF'
# Backend API URL (accessible from frontend)
NEXT_PUBLIC_API_URL=https://api.investggds.com

# Frontend URL
FRONTEND_URL=https://investggds.com

# Node Environment
NODE_ENV=production
EOF
echo -e "${GREEN}✓${NC} .env.production updated"
echo ""

# Step 2: Show current environment
echo -e "${YELLOW}→${NC} Current environment variables:"
cat .env.production
echo ""

# Step 3: Stop frontend container
echo -e "${YELLOW}→${NC} Stopping frontend container..."
docker-compose stop frontend
echo ""

# Step 4: Rebuild frontend with new API URL
echo -e "${YELLOW}→${NC} Rebuilding frontend (this may take a few minutes)..."
NEXT_PUBLIC_API_URL=https://api.investggds.com docker-compose build --no-cache frontend
echo -e "${GREEN}✓${NC} Frontend rebuilt"
echo ""

# Step 5: Start frontend with new configuration
echo -e "${YELLOW}→${NC} Starting frontend with new API URL..."
NEXT_PUBLIC_API_URL=https://api.investggds.com docker-compose up -d frontend
sleep 5
echo ""

# Step 6: Verify frontend is running
echo -e "${YELLOW}→${NC} Verifying frontend is running..."
if docker-compose ps frontend | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Frontend is running!"
    echo ""

    # Step 7: Show logs
    echo -e "${YELLOW}→${NC} Recent frontend logs:"
    docker-compose logs --tail=15 frontend
    echo ""

    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ Frontend Fixed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Frontend now configured to use:"
    echo -e "  ${GREEN}✓ API: https://api.investggds.com${NC}"
    echo ""
    echo -e "Access your site at:"
    echo -e "  ${GREEN}✓ http://investggds.com${NC}"
    echo ""
    echo -e "Clear your browser cache and try again!"
else
    echo -e "${RED}✗${NC} Frontend failed to start"
    echo "Check logs: docker-compose logs frontend"
fi
echo ""
