#!/bin/bash
# ============================================
# Manual Deployment Script (Run on Server)
# ============================================
# SSH into your server first: ssh root@167.172.112.115
# Then run this script
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - Manual Deployment on Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Navigate to app directory
APP_DIR="/opt/ggds"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}→${NC} Creating application directory..."
    mkdir -p $APP_DIR
fi

cd $APP_DIR
echo -e "${GREEN}✓${NC} Working in: $APP_DIR"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}→${NC} Cloning repository..."
    cd /opt
    rm -rf ggds
    git clone https://github.com/misocho/ggds-benevolent.git ggds
    cd ggds
    echo -e "${GREEN}✓${NC} Repository cloned"
else
    echo -e "${YELLOW}→${NC} Pulling latest changes..."
    git pull origin main
    echo -e "${GREEN}✓${NC} Repository updated"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC}  .env file not found!"
    echo -e "${YELLOW}→${NC} Checking for .env.production..."

    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo -e "${GREEN}✓${NC} Copied .env.production to .env"
    else
        echo -e "${RED}❌ Error: No environment file found!${NC}"
        echo -e "${YELLOW}Please create .env file with required variables${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Environment file configured"

# Stop existing containers if running
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo -e "${YELLOW}→${NC} Stopping existing containers..."
    docker-compose down
    echo -e "${GREEN}✓${NC} Containers stopped"
fi

# Build images
echo -e "${YELLOW}→${NC} Building Docker images (this may take 5-10 minutes)..."
docker-compose build --no-cache

# Start containers
echo -e "${YELLOW}→${NC} Starting containers..."
docker-compose up -d

# Wait for services
echo -e "${YELLOW}→${NC} Waiting for services to start..."
sleep 15

# Initialize database (create tables)
echo -e "${YELLOW}→${NC} Initializing database..."
./init-db.sh

# Check status
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}→${NC} Container Status:"
docker-compose ps

# Check health
echo ""
echo -e "${YELLOW}→${NC} Checking health..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Services are running!"

    # Show logs
    echo ""
    echo -e "${YELLOW}→${NC} Recent logs (last 20 lines):"
    echo -e "${BLUE}--- Backend ---${NC}"
    docker-compose logs --tail=20 backend
    echo ""
    echo -e "${BLUE}--- Frontend ---${NC}"
    docker-compose logs --tail=20 frontend
else
    echo -e "${RED}❌ Some services failed to start${NC}"
    echo -e "${YELLOW}→${NC} Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Deployment Successful!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Frontend: ${GREEN}http://167.172.112.115:3000${NC}"
echo -e "Backend:  ${GREEN}http://167.172.112.115:8000${NC}"
echo -e "API Docs: ${GREEN}http://167.172.112.115:8000/docs${NC}"
echo ""
