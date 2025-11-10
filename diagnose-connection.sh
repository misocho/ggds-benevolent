#!/bin/bash
# ============================================
# Diagnose Connection Issues
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - Connection Diagnostics${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Check if Docker is running
echo -e "${YELLOW}1. Checking Docker...${NC}"
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓${NC} Docker is running"
else
    echo -e "${RED}✗${NC} Docker is not running"
    echo -e "${YELLOW}→${NC} Starting Docker..."
    systemctl start docker
fi
echo ""

# 2. Check container status
echo -e "${YELLOW}2. Checking containers...${NC}"
docker-compose ps
echo ""

# 3. Check if ports 80 and 443 are listening
echo -e "${YELLOW}3. Checking if ports are listening...${NC}"
if netstat -tuln | grep -q ":80 "; then
    echo -e "${GREEN}✓${NC} Port 80 is listening"
else
    echo -e "${RED}✗${NC} Port 80 is NOT listening"
fi

if netstat -tuln | grep -q ":443 "; then
    echo -e "${GREEN}✓${NC} Port 443 is listening"
else
    echo -e "${RED}✗${NC} Port 443 is NOT listening"
fi
echo ""

# 4. Check firewall status
echo -e "${YELLOW}4. Checking firewall...${NC}"
if command -v ufw &> /dev/null; then
    echo "UFW status:"
    ufw status
elif command -v firewall-cmd &> /dev/null; then
    echo "Firewalld status:"
    firewall-cmd --list-all
else
    echo -e "${YELLOW}⚠${NC} No firewall detected (ufw/firewalld)"
fi
echo ""

# 5. Test local connectivity
echo -e "${YELLOW}5. Testing local connectivity...${NC}"
echo "Testing port 80 locally:"
timeout 3 curl -s -o /dev/null -w "%{http_code}" http://localhost:80 && echo " - OK" || echo " - Failed"

echo "Testing port 443 locally:"
timeout 3 curl -s -o /dev/null -w "%{http_code}" http://localhost:443 && echo " - OK" || echo " - Failed"
echo ""

# 6. Check Nginx logs
echo -e "${YELLOW}6. Recent Nginx logs...${NC}"
if [ -f "nginx/logs/error.log" ]; then
    echo "Last 10 error log entries:"
    tail -n 10 nginx/logs/error.log 2>/dev/null || echo "No errors logged yet"
else
    echo -e "${YELLOW}⚠${NC} Nginx log file not found"
fi
echo ""

# 7. Check Docker logs
echo -e "${YELLOW}7. Recent Docker container logs...${NC}"
echo "Nginx container:"
docker-compose logs --tail=10 nginx
echo ""
echo "Backend container:"
docker-compose logs --tail=5 backend
echo ""
echo "Frontend container:"
docker-compose logs --tail=5 frontend
echo ""

# 8. Summary and recommendations
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Recommendations${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "If containers are not running:"
echo -e "  ${BLUE}docker-compose up -d${NC}"
echo ""
echo -e "If firewall is blocking:"
echo -e "  ${BLUE}sudo ufw allow 80/tcp${NC}"
echo -e "  ${BLUE}sudo ufw allow 443/tcp${NC}"
echo ""
echo -e "To restart everything:"
echo -e "  ${BLUE}docker-compose down && docker-compose up -d${NC}"
echo ""
