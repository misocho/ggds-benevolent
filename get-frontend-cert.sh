#!/bin/bash
# ============================================
# Get Frontend SSL Certificate (Simple)
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Get Frontend SSL Certificate${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOMAIN="investggds.com"
EMAIL="lifeline@ggdi.net"

# Step 1: Create directories
echo -e "${YELLOW}→${NC} Creating directories..."
mkdir -p certbot/conf/live
mkdir -p certbot/conf/archive
mkdir -p certbot/conf/renewal
mkdir -p certbot/www/.well-known/acme-challenge
echo ""

# Step 2: Stop certbot container if running
echo -e "${YELLOW}→${NC} Stopping certbot container..."
docker-compose stop certbot 2>/dev/null || true
echo ""

# Step 3: Remove any existing certificate
echo -e "${YELLOW}→${NC} Cleaning up any existing certificates..."
rm -rf certbot/conf/live/${DOMAIN}
rm -rf certbot/conf/live/www.${DOMAIN}
rm -rf certbot/conf/archive/${DOMAIN}
rm -rf certbot/conf/archive/www.${DOMAIN}
rm -f certbot/conf/renewal/${DOMAIN}.conf
rm -f certbot/conf/renewal/www.${DOMAIN}.conf
echo ""

# Step 4: Test if Nginx is serving ACME challenge directory
echo -e "${YELLOW}→${NC} Testing Nginx ACME challenge access..."
echo "test" > certbot/www/.well-known/acme-challenge/test.txt
sleep 2

if curl -f http://${DOMAIN}/.well-known/acme-challenge/test.txt &>/dev/null; then
    echo -e "${GREEN}✓${NC} Nginx ACME challenge directory is accessible"
else
    echo -e "${RED}✗${NC} Warning: ACME challenge directory may not be accessible"
    echo "Continuing anyway..."
fi
rm -f certbot/www/.well-known/acme-challenge/test.txt
echo ""

# Step 5: Request certificate with proper entrypoint override
echo -e "${YELLOW}→${NC} Requesting certificate for ${DOMAIN} and www.${DOMAIN}..."
echo ""

docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot \
    certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --cert-name ${DOMAIN} \
    --non-interactive \
    -d ${DOMAIN} \
    -d www.${DOMAIN}

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Certificate obtained successfully!"

    # Verify certificate files exist
    if [ -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
        echo -e "${GREEN}✓${NC} Certificate files verified"
        echo ""

        # Set proper permissions
        echo -e "${YELLOW}→${NC} Setting permissions..."
        chmod -R 755 certbot/conf/live
        chmod -R 755 certbot/conf/archive
        echo ""

        # Restart Nginx
        echo -e "${YELLOW}→${NC} Restarting Nginx..."
        docker-compose restart nginx
        sleep 5

        # Check Nginx status
        if docker-compose ps nginx | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} Nginx is running!"
            echo ""
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}   ✓ Frontend SSL Configured!${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "Your frontend is now available at:"
            echo -e "  ${GREEN}✓ https://${DOMAIN}${NC}"
            echo -e "  ${GREEN}✓ https://www.${DOMAIN}${NC}"
            echo ""
            echo -e "Your API is available at:"
            echo -e "  ${GREEN}✓ https://api.${DOMAIN}${NC}"
            echo ""
        else
            echo -e "${RED}✗${NC} Nginx failed to start"
            echo "Checking logs..."
            docker-compose logs --tail=20 nginx
        fi

        # Restart certbot container
        echo -e "${YELLOW}→${NC} Restarting certbot container for auto-renewal..."
        docker-compose up -d certbot

    else
        echo -e "${RED}✗${NC} Certificate files not found at certbot/conf/live/${DOMAIN}/"
        echo "Listing contents:"
        ls -la certbot/conf/live/ 2>/dev/null || echo "Directory doesn't exist"
    fi
else
    echo ""
    echo -e "${RED}✗${NC} Failed to obtain certificate"
    echo ""
    echo "Possible reasons:"
    echo "1. DNS not fully propagated"
    echo "2. Port 80 not accessible from internet"
    echo "3. Nginx not serving ACME challenge directory correctly"
    echo ""
    echo "Check Nginx logs:"
    echo "  docker-compose logs nginx"
fi
echo ""
