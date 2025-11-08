#!/bin/bash
# ============================================
# GGDS Deployment Script
# ============================================
# Deploys the GGDS Benevolent Fund application to production server
#
# Usage:
#   ./deploy.sh                 # Deploy to production
#   ./deploy.sh --build-only    # Only build images, don't deploy
#   ./deploy.sh --logs          # View logs after deployment
#

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER=${DEPLOY_USER:-root}
SERVER_IP=${SERVER_IP:-167.172.112.115}
APP_DIR=${APP_DIR:-/opt/ggds}
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Parse arguments
BUILD_ONLY=false
SHOW_LOGS=false

for arg in "$@"; do
    case $arg in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        *)
            ;;
    esac
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS Benevolent Fund - Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production from .env.production.template${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment file found"

# Load environment variables
set -a
source .env.production
set +a

echo -e "${GREEN}✓${NC} Environment variables loaded"

# Check if deploying locally or remotely
if [ "$BUILD_ONLY" = true ]; then
    echo -e "${YELLOW}→${NC} Building Docker images locally..."
    docker-compose build --no-cache
    echo -e "${GREEN}✓${NC} Docker images built successfully"
    exit 0
fi

# Deploy to remote server
echo ""
echo -e "${YELLOW}→${NC} Deploying to: ${GREEN}${DEPLOY_USER}@${SERVER_IP}${NC}"
echo ""

# Create deployment package
echo -e "${YELLOW}→${NC} Creating deployment package..."
# Use --no-xattrs to prevent macOS extended attributes from corrupting files
COPYFILE_DISABLE=1 tar -czf /tmp/ggds-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='venv' \
    --exclude='__pycache__' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='.env.local' \
    docker-compose.yml \
    .env.production \
    migrate.sh \
    ggds-backend \
    ggds-benevolent-fund

echo -e "${GREEN}✓${NC} Deployment package created"

# Copy to server
echo -e "${YELLOW}→${NC} Uploading to server..."
scp /tmp/ggds-deploy.tar.gz ${DEPLOY_USER}@${SERVER_IP}:/tmp/

# Deploy on server
echo -e "${YELLOW}→${NC} Deploying on server..."
ssh ${DEPLOY_USER}@${SERVER_IP} << 'ENDSSH'
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}→${NC} Extracting deployment package..."
mkdir -p /opt/ggds
cd /opt/ggds
tar -xzf /tmp/ggds-deploy.tar.gz
rm /tmp/ggds-deploy.tar.gz

echo -e "${GREEN}✓${NC} Package extracted"

# Rename .env.production to .env for docker-compose to read
if [ -f .env.production ]; then
    cp .env.production .env
    echo -e "${GREEN}✓${NC} Environment file configured"
else
    echo -e "${RED}✗${NC} Warning: .env.production not found"
fi

# Stop existing containers
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo -e "${YELLOW}→${NC} Stopping existing containers..."
    docker-compose down
    echo -e "${GREEN}✓${NC} Containers stopped"
fi

# Build and start containers
echo -e "${YELLOW}→${NC} Building Docker images..."
docker-compose build --no-cache

echo -e "${YELLOW}→${NC} Starting containers..."
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}→${NC} Waiting for services to be healthy..."
sleep 10

# Run migrations
echo -e "${YELLOW}→${NC} Running database migrations..."
./migrate.sh

# Check health
if docker-compose ps | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} All services are healthy!"
else
    echo -e "${YELLOW}⚠${NC}  Some services may still be starting..."
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

ENDSSH

# Clean up
rm /tmp/ggds-deploy.tar.gz

# Show logs if requested
if [ "$SHOW_LOGS" = true ]; then
    echo ""
    echo -e "${YELLOW}→${NC} Showing application logs..."
    ssh ${DEPLOY_USER}@${SERVER_IP} "cd /opt/ggds && docker-compose logs -f"
fi

echo ""
echo -e "${GREEN}✓${NC} Deployment completed successfully!"
echo ""
