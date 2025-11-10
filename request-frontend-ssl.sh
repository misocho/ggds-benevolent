#!/bin/bash
# ============================================
# Request Frontend SSL Certificate Only
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Request Frontend SSL Certificate${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOMAIN="investggds.com"
EMAIL="lifeline@ggdi.net"

# Remove any existing certificate
echo -e "${YELLOW}→${NC} Removing existing certificate if any..."
rm -rf certbot/conf/live/${DOMAIN}
rm -rf certbot/conf/archive/${DOMAIN}
rm -f certbot/conf/renewal/${DOMAIN}.conf
echo ""

# Request new certificate
echo -e "${YELLOW}→${NC} Requesting certificate for ${DOMAIN} and www.${DOMAIN}..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --cert-name ${DOMAIN} \
    -d ${DOMAIN} \
    -d www.${DOMAIN}

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Certificate obtained successfully!"
    echo ""

    # Verify certificate files exist
    echo -e "${YELLOW}→${NC} Verifying certificate files..."
    if [ -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
        echo -e "${GREEN}✓${NC} Certificate files found"

        # Restart Nginx
        echo ""
        echo -e "${YELLOW}→${NC} Restarting Nginx..."
        docker-compose restart nginx
        sleep 3

        if docker-compose ps nginx | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} Nginx restarted successfully!"
            echo ""
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}   ✓ Frontend SSL Configured!${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "Frontend is now available at:"
            echo -e "  ${GREEN}https://${DOMAIN}${NC}"
            echo -e "  ${GREEN}https://www.${DOMAIN}${NC}"
        else
            echo -e "${RED}✗${NC} Nginx failed to start"
            echo "Check logs: docker-compose logs nginx"
        fi
    else
        echo -e "${RED}✗${NC} Certificate files not found"
    fi
else
    echo ""
    echo -e "${RED}✗${NC} Failed to obtain certificate"
    echo "Check certbot logs: docker-compose logs certbot"
fi
echo ""
