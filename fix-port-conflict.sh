#!/bin/bash
# ============================================
# Fix Port Conflicts (80/443)
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - Port Conflict Resolver${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check what's using port 80
echo -e "${YELLOW}→${NC} Checking port 80..."
PORT_80=$(sudo lsof -ti:80 || echo "")
if [ -n "$PORT_80" ]; then
    echo -e "${RED}✗${NC} Port 80 is in use by process(es): $PORT_80"
    echo -e "${YELLOW}→${NC} Killing process(es) on port 80..."
    sudo kill -9 $PORT_80 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Port 80 freed"
else
    echo -e "${GREEN}✓${NC} Port 80 is available"
fi

# Check what's using port 443
echo -e "${YELLOW}→${NC} Checking port 443..."
PORT_443=$(sudo lsof -ti:443 || echo "")
if [ -n "$PORT_443" ]; then
    echo -e "${RED}✗${NC} Port 443 is in use by process(es): $PORT_443"
    echo -e "${YELLOW}→${NC} Killing process(es) on port 443..."
    sudo kill -9 $PORT_443 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Port 443 freed"
else
    echo -e "${GREEN}✓${NC} Port 443 is available"
fi

# Check for any nginx/apache processes
echo -e "${YELLOW}→${NC} Checking for nginx/apache processes..."
NGINX_PROCS=$(ps aux | grep -E '[n]ginx|[a]pache' | awk '{print $2}' || echo "")
if [ -n "$NGINX_PROCS" ]; then
    echo -e "${YELLOW}→${NC} Found nginx/apache processes: $NGINX_PROCS"
    echo -e "${YELLOW}→${NC} Killing nginx/apache processes..."
    echo "$NGINX_PROCS" | xargs sudo kill -9 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Nginx/Apache processes killed"
else
    echo -e "${GREEN}✓${NC} No nginx/apache processes running"
fi

# Double-check ports are free
echo ""
echo -e "${YELLOW}→${NC} Verifying ports are now free..."
sleep 2

PORT_80_CHECK=$(sudo lsof -ti:80 || echo "")
PORT_443_CHECK=$(sudo lsof -ti:443 || echo "")

if [ -z "$PORT_80_CHECK" ] && [ -z "$PORT_443_CHECK" ]; then
    echo -e "${GREEN}✓${NC} Both ports 80 and 443 are now free!"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ Ports Ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "You can now restart your services:"
    echo -e "  ${BLUE}docker-compose up -d${NC}"
    echo ""
else
    echo -e "${RED}✗${NC} Some ports are still in use:"
    [ -n "$PORT_80_CHECK" ] && echo -e "  Port 80: $PORT_80_CHECK"
    [ -n "$PORT_443_CHECK" ] && echo -e "  Port 443: $PORT_443_CHECK"
    echo ""
    echo -e "${YELLOW}Manual intervention may be required.${NC}"
    echo -e "Run: ${BLUE}sudo lsof -i:80,443${NC} to investigate"
fi
