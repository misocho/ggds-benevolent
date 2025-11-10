#!/bin/bash
# ============================================
# Setup SSL Certificates with Let's Encrypt
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS - SSL Certificate Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Domain configuration
DOMAIN="investggds.com"
API_DOMAIN="api.investggds.com"
EMAIL="lifeline@ggdi.net"

echo -e "${YELLOW}→${NC} Setting up SSL for:"
echo -e "   - ${DOMAIN}"
echo -e "   - www.${DOMAIN}"
echo -e "   - ${API_DOMAIN}"
echo ""

# Create required directories
echo -e "${YELLOW}→${NC} Creating directories..."
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/logs

# Download recommended TLS parameters
echo -e "${YELLOW}→${NC} Downloading recommended TLS parameters..."
if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
fi

if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem
fi

echo -e "${GREEN}✓${NC} TLS parameters downloaded"

# Start nginx for certificate challenge
echo -e "${YELLOW}→${NC} Starting nginx for certificate validation..."
docker-compose up -d nginx

# Wait for nginx to start
sleep 5

# Request certificates
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

echo -e "${GREEN}✓${NC} Certificate for ${DOMAIN} obtained"

echo -e "${YELLOW}→${NC} Requesting SSL certificate for ${API_DOMAIN}..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d ${API_DOMAIN}

echo -e "${GREEN}✓${NC} Certificate for ${API_DOMAIN} obtained"

# Reload nginx
echo -e "${YELLOW}→${NC} Reloading nginx with SSL configuration..."
docker-compose exec nginx nginx -s reload

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
