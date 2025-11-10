#!/bin/bash
# ============================================
# Clean Up Old SSL Certificates
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - Clean Up Old Certificates${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}→${NC} Removing old certificate configurations..."

# Remove old certificate directories
docker-compose run --rm certbot bash -c "
rm -rf /etc/letsencrypt/live/grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/live/www.grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/live/api.grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/live/app.grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/live/ggdi.net
rm -rf /etc/letsencrypt/archive/grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/archive/www.grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/archive/api.grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/archive/app.grandgranitediasporasacco.com
rm -rf /etc/letsencrypt/archive/ggdi.net
rm -f /etc/letsencrypt/renewal/grandgranitediasporasacco.com.conf
rm -f /etc/letsencrypt/renewal/www.grandgranitediasporasacco.com.conf
rm -f /etc/letsencrypt/renewal/api.grandgranitediasporasacco.com.conf
rm -f /etc/letsencrypt/renewal/app.grandgranitediasporasacco.com.conf
rm -f /etc/letsencrypt/renewal/ggdi.net.conf
"

echo -e "${GREEN}✓${NC} Old certificates cleaned up"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Cleanup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Now run: ${BLUE}./setup-ssl-first-time.sh${NC}"
echo ""
