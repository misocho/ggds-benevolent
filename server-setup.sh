#!/bin/bash
# ============================================
# GGDS Server Setup Script
# ============================================
# Sets up a fresh Ubuntu server for GGDS deployment
#
# Run this once on your Digital Ocean Droplet:
#   wget -O - https://raw.githubusercontent.com/misocho/ggds-benevolent/main/server-setup.sh | sudo bash
#
# Or manually:
#   sudo ./server-setup.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   GGDS Server Setup - Ubuntu${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Running as root"

# Update system
echo ""
echo -e "${YELLOW}→${NC} Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓${NC} System updated"

# Install required packages
echo -e "${YELLOW}→${NC} Installing required packages..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release
echo -e "${GREEN}✓${NC} Packages installed"

# Install Docker
echo ""
echo -e "${YELLOW}→${NC} Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    echo -e "${GREEN}✓${NC} Docker installed"
else
    echo -e "${GREEN}✓${NC} Docker already installed"
fi

# Verify Docker installation
docker --version

# Install Docker Compose (standalone)
echo ""
echo -e "${YELLOW}→${NC} Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓${NC} Docker Compose installed"
else
    echo -e "${GREEN}✓${NC} Docker Compose already installed"
fi

# Verify Docker Compose
docker-compose --version

# Create application directory
echo ""
echo -e "${YELLOW}→${NC} Creating application directory..."
mkdir -p /opt/ggds
chown -R $USER:$USER /opt/ggds
echo -e "${GREEN}✓${NC} Directory created: /opt/ggds"

# Configure firewall
echo ""
echo -e "${YELLOW}→${NC} Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 3000/tcp  # Frontend
    ufw allow 8000/tcp  # Backend API
    echo "y" | ufw enable || true
    echo -e "${GREEN}✓${NC} Firewall configured"
else
    echo -e "${YELLOW}⚠${NC}  UFW not found, skipping firewall setup"
fi

# Create .env.production file
echo ""
echo -e "${YELLOW}→${NC} Creating environment file template..."
cat > /opt/ggds/.env.production << 'EOF'
# Database
POSTGRES_DB=ggds_benevolent
POSTGRES_USER=ggds_admin
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD

# Security
SECRET_KEY=fbac22bbf5c978719136ce5d09cf5b8fbc3e1d8b78aae09835a57e7f62d713d4

# Email
SMTP_USERNAME=lifeline@ggdi.net
SMTP_PASSWORD=Lifeline@ggdi$1

# Digital Ocean Spaces
SPACES_ACCESS_KEY=DO00LKL62CYFTA3VC39G
SPACES_SECRET_KEY=fa7tnWiTPOtlrtOjpN3Kf2EUiHWHZWjECc2ezdSSERM

# URLs
FRONTEND_URL=http://167.172.112.115:3000
NEXT_PUBLIC_API_URL=http://167.172.112.115:8000
EOF

# Generate random database password
DB_PASSWORD=$(openssl rand -base64 32)
sed -i "s/CHANGE_THIS_PASSWORD/${DB_PASSWORD}/" /opt/ggds/.env.production

echo -e "${GREEN}✓${NC} Environment file created"

# Set up swap (if not exists)
echo ""
if [ ! -f /swapfile ]; then
    echo -e "${YELLOW}→${NC} Setting up swap space (2GB)..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo -e "${GREEN}✓${NC} Swap configured"
else
    echo -e "${GREEN}✓${NC} Swap already exists"
fi

# Enable automatic security updates
echo ""
echo -e "${YELLOW}→${NC} Enabling automatic security updates..."
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
echo -e "${GREEN}✓${NC} Auto-updates enabled"

# Print summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Server Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Docker Version:         $(docker --version)"
echo -e "Docker Compose Version: $(docker-compose --version)"
echo -e "Application Directory:  ${BLUE}/opt/ggds${NC}"
echo -e "Environment File:       ${BLUE}/opt/ggds/.env.production${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Review and update /opt/ggds/.env.production if needed"
echo -e "2. Run deployment: ${BLUE}./deploy.sh${NC} (from your local machine)"
echo -e "3. Or set up GitHub Actions for automatic deployment"
echo ""
echo -e "${YELLOW}Database Password:${NC} ${GREEN}${DB_PASSWORD}${NC}"
echo -e "${YELLOW}(Saved in /opt/ggds/.env.production)${NC}"
echo ""
