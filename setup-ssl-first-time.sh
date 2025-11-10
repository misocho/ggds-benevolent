#!/bin/bash
# ============================================
# First-Time SSL Setup (fixes chicken-egg problem)
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - First-Time SSL Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOMAIN="investggds.com"
API_DOMAIN="api.investggds.com"
EMAIL="lifeline@ggdi.net"

# Step 1: Switch to HTTP-only configs
echo -e "${YELLOW}→${NC} Switching to HTTP-only Nginx configs..."
cp nginx/sites/investggds.conf nginx/sites/investggds.conf.ssl-backup
cp nginx/sites/api.investggds.conf nginx/sites/api.investggds.conf.ssl-backup
cp nginx/sites/investggds.conf.http-only nginx/sites/investggds.conf
cp nginx/sites/api.investggds.conf.http-only nginx/sites/api.investggds.conf
echo -e "${GREEN}✓${NC} Switched to HTTP-only configs"
echo ""

# Step 2: Restart Nginx with HTTP-only configs
echo -e "${YELLOW}→${NC} Restarting Nginx..."
docker-compose restart nginx
sleep 5
echo -e "${GREEN}✓${NC} Nginx restarted"
echo ""

# Step 3: Verify Nginx is running
echo -e "${YELLOW}→${NC} Verifying Nginx is running..."
if docker-compose ps nginx | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Nginx is running"
else
    echo -e "${RED}✗${NC} Nginx failed to start"
    echo -e "${YELLOW}→${NC} Restoring SSL configs..."
    cp nginx/sites/investggds.conf.ssl-backup nginx/sites/investggds.conf
    cp nginx/sites/api.investggds.conf.ssl-backup nginx/sites/api.investggds.conf
    exit 1
fi
echo ""

# Step 4: Create required directories
echo -e "${YELLOW}→${NC} Creating directories..."
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/logs
echo ""

# Step 5: Download TLS parameters
echo -e "${YELLOW}→${NC} Downloading recommended TLS parameters..."
if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
fi

if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem
fi
echo -e "${GREEN}✓${NC} TLS parameters downloaded"
echo ""

# Step 6: Request certificates
echo -e "${YELLOW}→${NC} Requesting SSL certificate for ${DOMAIN}..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d ${DOMAIN} \
    -d www.${DOMAIN}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Certificate for ${DOMAIN} obtained"
else
    echo -e "${RED}✗${NC} Failed to obtain certificate for ${DOMAIN}"
    echo -e "${YELLOW}→${NC} Restoring SSL configs..."
    cp nginx/sites/investggds.conf.ssl-backup nginx/sites/investggds.conf
    cp nginx/sites/api.investggds.conf.ssl-backup nginx/sites/api.investggds.conf
    exit 1
fi
echo ""

echo -e "${YELLOW}→${NC} Requesting SSL certificate for ${API_DOMAIN}..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d ${API_DOMAIN}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Certificate for ${API_DOMAIN} obtained"
else
    echo -e "${RED}✗${NC} Failed to obtain certificate for ${API_DOMAIN}"
    echo -e "${YELLOW}→${NC} Restoring SSL configs..."
    cp nginx/sites/investggds.conf.ssl-backup nginx/sites/investggds.conf
    cp nginx/sites/api.investggds.conf.ssl-backup nginx/sites/api.investggds.conf
    exit 1
fi
echo ""

# Step 7: Restore full SSL configs
echo -e "${YELLOW}→${NC} Restoring full SSL Nginx configs..."
cp nginx/sites/investggds.conf.ssl-backup nginx/sites/investggds.conf
cp nginx/sites/api.investggds.conf.ssl-backup nginx/sites/api.investggds.conf
echo -e "${GREEN}✓${NC} SSL configs restored"
echo ""

# Step 8: Restart Nginx with SSL
echo -e "${YELLOW}→${NC} Restarting Nginx with SSL configuration..."
docker-compose restart nginx
sleep 5
echo ""

# Step 9: Verify Nginx is running with SSL
echo -e "${YELLOW}→${NC} Verifying Nginx is running with SSL..."
if docker-compose ps nginx | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Nginx is running with SSL!"
else
    echo -e "${RED}✗${NC} Nginx failed to start with SSL"
    echo "Check logs: docker-compose logs nginx"
    exit 1
fi
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ SSL Certificates Installed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Your sites are now available at:"
echo -e "  ${GREEN}https://${DOMAIN}${NC}"
echo -e "  ${GREEN}https://www.${DOMAIN}${NC}"
echo -e "  ${GREEN}https://${API_DOMAIN}${NC}"
echo ""
echo -e "SSL certificates will auto-renew every 12 hours."
echo ""
