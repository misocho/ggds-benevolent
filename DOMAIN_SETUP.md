# Domain Setup Guide for investggds.com

This guide walks you through connecting your application to the domain **investggds.com** hosted on Hostinger.

## Prerequisites

- Domain: investggds.com (hosted on Hostinger)
- Server: 167.172.112.115 (Digital Ocean Droplet)
- Email: lifeline@ggdi.net (for SSL notifications)

---

## Step 1: Configure DNS on Hostinger

Log in to your Hostinger control panel and add the following DNS records:

### A Records (Point domain to your server)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 167.172.112.115 | 14400 |
| A | www | 167.172.112.115 | 14400 |
| A | api | 167.172.112.115 | 14400 |

**What this does:**
- `@` → Makes investggds.com point to your server
- `www` → Makes www.investggds.com point to your server
- `api` → Makes api.investggds.com point to your server

**DNS Propagation:** DNS changes can take up to 24-48 hours to propagate globally, but usually happen within 1-2 hours.

---

## Step 2: Verify DNS Propagation

Before deploying, verify that DNS is working:

```bash
# Check main domain
nslookup investggds.com

# Check www subdomain
nslookup www.investggds.com

# Check api subdomain
nslookup api.investggds.com
```

All should return: `167.172.112.115`

Alternative verification:
```bash
ping investggds.com
ping www.investggds.com
ping api.investggds.com
```

---

## Step 3: Update Server Environment

SSH into your server:

```bash
ssh root@167.172.112.115
cd /root/ggds
```

Pull the latest code:

```bash
git pull origin main
```

Update `.env.production` with domain URLs:

```bash
nano .env.production
```

Ensure these lines are set:
```bash
FRONTEND_URL=https://investggds.com
NEXT_PUBLIC_API_URL=https://api.investggds.com
```

Save and exit (Ctrl+X, then Y, then Enter).

---

## Step 4: Deploy with Domain Configuration

Make scripts executable:

```bash
chmod +x deploy-manual.sh setup-ssl.sh
```

Run deployment:

```bash
./deploy-manual.sh
```

This will:
- Build and start all services (PostgreSQL, Backend, Frontend, Nginx, Certbot)
- Create database tables
- Seed superuser account
- Start Nginx on ports 80 (HTTP) and 443 (HTTPS)

---

## Step 5: Set Up SSL Certificates

Once Nginx is running and DNS is propagated, obtain SSL certificates:

```bash
./setup-ssl.sh
```

This script will:
1. Download TLS parameters from Let's Encrypt
2. Request SSL certificates for investggds.com, www.investggds.com, and api.investggds.com
3. Configure Nginx to use HTTPS
4. Set up automatic renewal every 12 hours

**Note:** This step will fail if DNS is not fully propagated. If you get an error, wait 30 minutes and try again.

---

## Step 6: Verify Deployment

### Check Services

```bash
docker-compose ps
```

All services should show "Up" status:
- ggds-postgres
- ggds-backend
- ggds-frontend
- ggds-nginx
- ggds-certbot

### Check Logs

```bash
# Check Nginx logs
docker-compose logs nginx

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend
```

### Test HTTPS Access

Open in browser:
- https://investggds.com (Frontend)
- https://www.investggds.com (Frontend with www)
- https://api.investggds.com/docs (Backend API documentation)

All should:
- Load successfully
- Show a green padlock (valid SSL certificate)
- NOT show any certificate warnings

### Test Login

1. Go to https://investggds.com
2. Log in with:
   - Email: `lifeline@ggdi.net`
   - Password: `adminggds`
3. You should be redirected to `/admin/dashboard`

---

## Architecture Overview

### Domain Routing

```
investggds.com (Port 80) ──→ Redirect to HTTPS
investggds.com (Port 443) ──→ Nginx ──→ Frontend (Next.js on :3000)

api.investggds.com (Port 80) ──→ Redirect to HTTPS
api.investggds.com (Port 443) ──→ Nginx ──→ Backend (FastAPI on :8080)
```

### Services

- **PostgreSQL** (postgres:5432): Database
- **Backend** (backend:8080): FastAPI API
- **Frontend** (frontend:3000): Next.js web app
- **Nginx** (ports 80/443): Reverse proxy with SSL termination
- **Certbot**: Automatic SSL certificate renewal

### SSL Certificate Renewal

Certbot runs in a loop and checks for renewal every 12 hours. Certificates are automatically renewed when they have 30 days or less remaining.

---

## Troubleshooting

### DNS Not Resolving

**Symptom:** `nslookup investggds.com` doesn't return your server IP

**Solution:**
1. Double-check DNS records on Hostinger
2. Wait for DNS propagation (up to 2 hours)
3. Clear your local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemd-resolve --flush-caches
   ```

### SSL Certificate Request Fails

**Symptom:** `setup-ssl.sh` fails with "Could not validate domain"

**Solution:**
1. Ensure DNS is fully propagated first
2. Check Nginx is running: `docker-compose ps nginx`
3. Check port 80 is accessible: `curl http://investggds.com/.well-known/acme-challenge/test`
4. Wait 30 minutes and try again

### Nginx 502 Bad Gateway

**Symptom:** Browser shows "502 Bad Gateway" error

**Solution:**
1. Check backend is running: `docker-compose ps backend`
2. Check backend logs: `docker-compose logs backend`
3. Restart services: `docker-compose restart backend frontend`

### Certificate Already Exists Error

**Symptom:** Certbot says certificates already exist

**Solution:**
- Remove existing certificates: `sudo rm -rf certbot/conf/live/investggds.com certbot/conf/archive/investggds.com`
- Run `./setup-ssl.sh` again

### Frontend Shows Connection Error

**Symptom:** Frontend loads but shows "Network Error" when trying to use features

**Solution:**
1. Check that `NEXT_PUBLIC_API_URL` is set correctly in docker-compose.yml
2. Rebuild frontend: `docker-compose up -d --build frontend`
3. Check browser console for the exact API URL being called

---

## Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart nginx
```

### Force SSL Renewal (for testing)

```bash
docker-compose run --rm certbot renew --force-renewal
docker-compose exec nginx nginx -s reload
```

### Check SSL Certificate Expiration

```bash
docker-compose run --rm certbot certificates
```

---

## Security Notes

- All HTTP traffic is automatically redirected to HTTPS
- SSL certificates are from Let's Encrypt (trusted by all browsers)
- Security headers are configured in Nginx (X-Frame-Options, X-Content-Type-Options, etc.)
- Backend API is only accessible via Nginx proxy (internal port 8080 not exposed)
- Frontend is only accessible via Nginx proxy (internal port 3000 not exposed)

---

## Next Steps

Once deployment is complete:

1. Update email templates to use https://investggds.com URLs
2. Test all major features:
   - Member registration
   - Profile completion
   - Case reporting
   - File uploads
   - Admin dashboard
3. Configure monitoring/alerting for production
4. Set up database backups
5. Document operational procedures

---

## Support

For issues:
1. Check logs: `docker-compose logs [service]`
2. Verify DNS: `nslookup investggds.com`
3. Check SSL: `docker-compose run --rm certbot certificates`
4. Review nginx config: `docker-compose exec nginx nginx -t`
