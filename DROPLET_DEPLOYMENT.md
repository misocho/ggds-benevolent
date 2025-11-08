# Digital Ocean Droplet Deployment Guide
## Manual Deployment to Your Existing Server (167.172.112.115)

This guide will help you deploy GGDS Benevolent Fund to your existing Digital Ocean Droplet.

**Estimated Cost: $6-12/month** (much cheaper than App Platform!)

---

## 📋 What We've Created

✅ **docker-compose.yml** - Multi-container orchestration
✅ **deploy.sh** - One-command deployment script
✅ **server-setup.sh** - Initial server setup automation
✅ **.env.production.template** - Production environment variables
✅ **GitHub Actions workflow** - Automatic deployment on git push

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Server (One-time)

SSH into your droplet and run the setup script:

```bash
# SSH into your server
ssh root@167.172.112.115

# Download and run setup script
curl -sSL https://raw.githubusercontent.com/misocho/ggds-benevolent/main/server-setup.sh | sudo bash
```

This will:
- ✅ Install Docker & Docker Compose
- ✅ Configure firewall
- ✅ Create application directory (/opt/ggds)
- ✅ Generate secure database password
- ✅ Create .env.production file
- ✅ Set up swap space
- ✅ Enable auto-security updates

### Step 2: Deploy Application

From your **local computer** (not the server):

```bash
# Create production environment file locally
cp .env.production.template .env.production

# No need to edit it - it already has your credentials!

# Deploy to server
./deploy.sh
```

That's it! The script will:
- Package your application
- Upload to server (167.172.112.115)
- Build Docker images
- Start all containers
- Run database migrations

### Step 3: Access Your Application

After deployment (takes ~5-10 minutes):

🌐 **Frontend**: http://167.172.112.115:3000
🔧 **Backend API**: http://167.172.112.115:8000
📚 **API Docs**: http://167.172.112.115:8000/docs

---

## 🔄 Option 2: GitHub Actions Auto-Deploy (CI/CD)

For automatic deployment whenever you push to GitHub:

### 1. Generate SSH Key on Your Server

```bash
ssh root@167.172.112.115
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # Copy this private key
```

### 2. Add GitHub Secrets

Go to: https://github.com/misocho/ggds-benevolent/settings/secrets/actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `SSH_PRIVATE_KEY` | (The private key from above) |
| `SERVER_IP` | `167.172.112.115` |
| `DEPLOY_USER` | `root` |

### 3. Copy .env.production to Server

```bash
# From your local machine
scp .env.production root@167.172.112.115:/opt/ggds/
```

### 4. Deploy!

Now every time you push to `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions will **automatically**:
- Build your application
- Deploy to server
- Restart containers
- Check health

View progress at: https://github.com/misocho/ggds-benevolent/actions

---

## 📊 What's Running on Your Server

After deployment, these containers will be running:

```
┌─────────────────────────────────────────┐
│  Container          Port    Purpose     │
├─────────────────────────────────────────┤
│  ggds-postgres      5432    Database    │
│  ggds-backend       8080    API         │
│  ggds-frontend      3000    Web App     │
└─────────────────────────────────────────┘
```

**Total Memory Usage**: ~1-2GB
**Recommended Droplet**: $12/month (2GB RAM, 1 vCPU)

---

## 🛠️ Useful Commands

### Check Status

```bash
ssh root@167.172.112.115
cd /opt/ggds
docker-compose ps
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Database only
docker-compose logs -f postgres
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Application

```bash
docker-compose down
```

### Start Application

```bash
docker-compose up -d
```

### Update Application

```bash
# From your local machine
./deploy.sh
```

---

## 🔒 Security Checklist

After deployment, secure your server:

- [ ] **Change SSH port** from 22 to custom port
- [ ] **Disable root SSH login** (create sudo user)
- [ ] **Enable SSH key-only** authentication (disable password)
- [ ] **Install fail2ban** for brute-force protection
- [ ] **Set up SSL certificate** with Let's Encrypt
- [ ] **Configure custom domain**
- [ ] **Set up database backups**
- [ ] **Monitor logs regularly**

### Quick Security Hardening

```bash
ssh root@167.172.112.115

# Install fail2ban
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Create sudo user
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Copy SSH key to new user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## 🌐 Set Up Custom Domain (Optional)

### 1. Point DNS to Your Droplet

In your DNS provider (e.g., Hostinger), add:

```
Type: A
Name: benevolent (or @)
Value: 167.172.112.115
TTL: 3600
```

### 2. Install SSL Certificate

```bash
ssh root@167.172.112.115

# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d benevolent.ggds.org

# Certificate will be at:
# /etc/letsencrypt/live/benevolent.ggds.org/fullchain.pem
# /etc/letsencrypt/live/benevolent.ggds.org/privkey.pem
```

### 3. Update Nginx Configuration

Update `nginx/nginx.conf` in your repo to use your domain and SSL.

---

## 📦 Database Backups

### Manual Backup

```bash
ssh root@167.172.112.115
cd /opt/ggds

# Backup database
docker-compose exec postgres pg_dump -U ggds_admin ggds_benevolent > backup_$(date +%Y%m%d).sql

# Download backup
exit
scp root@167.172.112.115:/opt/ggds/backup_*.sql ./backups/
```

### Automated Daily Backups

```bash
ssh root@167.172.112.115

# Create backup script
cat > /opt/ggds/backup.sh << 'EOF'
#!/bin/bash
cd /opt/ggds
docker-compose exec -T postgres pg_dump -U ggds_admin ggds_benevolent | gzip > /opt/ggds/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 7 days
find /opt/ggds/backups -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/ggds/backup.sh
mkdir -p /opt/ggds/backups

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/ggds/backup.sh") | crontab -
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check if ports are already in use
netstat -tulpn | grep -E '3000|8000|5432'

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database manually
docker-compose exec postgres psql -U ggds_admin -d ggds_benevolent
```

### Out of Memory

```bash
# Check memory usage
free -h

# Restart services
docker-compose restart

# If persistent, upgrade droplet to 2GB RAM
```

### Cannot Connect to Server

```bash
# Check if containers are running
ssh root@167.172.112.115 "cd /opt/ggds && docker-compose ps"

# Check firewall
ssh root@167.172.112.115 "ufw status"

# Restart services
ssh root@167.172.112.115 "cd /opt/ggds && docker-compose restart"
```

---

## 💰 Cost Comparison

| Option | Cost/Month | Setup Time | Features |
|--------|-----------|------------|----------|
| **DO Droplet** (Your choice) | **$6-12** | 15 min | Full control, cheaper |
| DO App Platform | $25-84 | 5 min | Auto-scaling, managed |

**You chose wisely! Savings: ~$13-72/month** 💸

---

## 📚 Additional Resources

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Digital Ocean Docs**: https://docs.digitalocean.com/products/droplets/
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check GitHub Issues: https://github.com/misocho/ggds-benevolent/issues

---

**Ready to deploy? Run: `./deploy.sh`** 🚀
