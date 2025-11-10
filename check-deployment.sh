#!/bin/bash
# Quick deployment checker script

SERVER_IP="167.172.112.115"
SERVER_USER="root"

echo "🔍 Checking deployment status on ${SERVER_IP}..."
echo ""

# Check if we can connect
echo "1️⃣ Testing SSH connection..."
if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'Connected'" 2>/dev/null; then
    echo "   ✅ SSH connection successful"
else
    echo "   ❌ Cannot connect to server via SSH"
    exit 1
fi

echo ""
echo "2️⃣ Checking if Docker is installed..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
if command -v docker &> /dev/null; then
    echo "   ✅ Docker is installed: $(docker --version)"
else
    echo "   ❌ Docker is NOT installed"
    echo "   👉 Run: ./server-setup.sh on the server first"
    exit 1
fi
ENDSSH

echo ""
echo "3️⃣ Checking if application directory exists..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
if [ -d /opt/ggds ]; then
    echo "   ✅ Application directory exists"
    ls -la /opt/ggds/ | head -10
else
    echo "   ❌ Application directory NOT found"
    echo "   👉 Run deployment first: ./deploy.sh"
    exit 1
fi
ENDSSH

echo ""
echo "4️⃣ Checking Docker containers..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /opt/ggds 2>/dev/null || exit 1

if [ -f docker-compose.yml ]; then
    echo "   ✅ docker-compose.yml found"
    echo ""
    echo "   Container Status:"
    docker-compose ps
else
    echo "   ❌ docker-compose.yml NOT found"
    exit 1
fi
ENDSSH

echo ""
echo "5️⃣ Checking container logs (last 20 lines)..."
echo ""
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /opt/ggds

echo "━━━ Backend Logs ━━━"
docker-compose logs --tail=20 backend 2>/dev/null || echo "Backend container not running"

echo ""
echo "━━━ Frontend Logs ━━━"
docker-compose logs --tail=20 frontend 2>/dev/null || echo "Frontend container not running"

echo ""
echo "━━━ Database Logs ━━━"
docker-compose logs --tail=20 postgres 2>/dev/null || echo "Database container not running"
ENDSSH

echo ""
echo "✅ Diagnostic complete!"
