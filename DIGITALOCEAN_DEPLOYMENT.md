# Digital Ocean Deployment Guide
## GGDS Benevolent Fund Application

This guide will help you deploy the GGDS Benevolent Fund application to Digital Ocean App Platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- [ ] A Digital Ocean account ([Sign up here](https://cloud.digitalocean.com/registrations/new))
- [ ] Your code in a GitHub repository (or GitLab/Bitbucket)
- [ ] Access to required third-party services:
  - Hostinger email account with SMTP credentials
  - Digital Ocean Spaces for file storage
- [ ] Admin email address for the system

---

## Project Structure

```
ggds/
├── .do/
│   └── app.yaml              # Digital Ocean App Platform configuration
├── ggds-backend/             # FastAPI backend
│   ├── Dockerfile           # Backend container configuration
│   ├── requirements.txt     # Python dependencies
│   └── app/                 # Application code
├── ggds-benevolent-fund/    # Next.js frontend
│   ├── Dockerfile           # Frontend container configuration
│   ├── package.json         # Node.js dependencies
│   └── app/                 # Next.js pages
└── README.md
```

---

## Quick Start

### Option 1: Deploy via Digital Ocean Dashboard

1. **Login to Digital Ocean**
   - Go to [Digital Ocean Cloud](https://cloud.digitalocean.com)
   - Navigate to **Apps** in the left sidebar

2. **Create New App**
   - Click **"Create App"**
   - Choose **"GitHub"** as your source
   - Authorize Digital Ocean to access your repository
   - Select your repository: `your-username/ggds`
   - Select branch: `main`

3. **Configure App**
   - Digital Ocean will auto-detect the `app.yaml` file
   - Click **"Next"** to use the configuration
   - Review the detected services:
     - `ggds-backend` (Web Service)
     - `ggds-frontend` (Web Service)
     - `ggds-postgres` (Database)

4. **Set Environment Variables**
   - See [Environment Variables](#environment-variables) section below
   - Set all required SECRET variables in the dashboard

5. **Choose Region**
   - Recommended: `Frankfurt (fra)` for European users
   - Or choose region closest to your users

6. **Review and Deploy**
   - Review pricing (starts at ~$12/month for basic setup)
   - Click **"Create Resources"**
   - Wait for initial deployment (10-15 minutes)

### Option 2: Deploy via doctl CLI

```bash
# Install doctl
# macOS:
brew install doctl

# Linux:
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz
tar xf doctl-1.94.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create app from spec
cd /path/to/ggds
doctl apps create --spec .do/app.yaml

# Get app ID
doctl apps list

# Monitor deployment
doctl apps logs <APP_ID> --type=BUILD
```

---

## Detailed Setup

### Step 1: Prepare Your Repository

Ensure your repository is properly configured:

```bash
# Verify files are present
git status

# You should see:
# - .do/app.yaml
# - ggds-backend/Dockerfile
# - ggds-benevolent-fund/Dockerfile

# Commit and push if needed
git add .do/ ggds-backend/Dockerfile ggds-benevolent-fund/Dockerfile
git commit -m "Add Digital Ocean deployment configuration"
git push origin main
```

### Step 2: Create PostgreSQL Database

The database is automatically created via `app.yaml`, but you can also create it manually:

1. Go to **Databases** in Digital Ocean dashboard
2. Click **"Create Database"**
3. Choose **PostgreSQL 15**
4. Select plan (Starter - $15/month)
5. Choose region (same as app - `fra`)
6. Name: `ggds-postgres`
7. Click **"Create Database"**

### Step 3: Configure Backend Service

The backend service configuration in `.do/app.yaml`:

```yaml
- name: ggds-backend
  type: web
  dockerfile_path: ggds-backend/Dockerfile
  source_dir: ggds-backend
  http_port: 8080
```

Key features:
- ✅ Runs database migrations automatically on startup
- ✅ Health checks on `/health` endpoint
- ✅ Auto-scaling capable
- ✅ Automatic HTTPS

### Step 4: Configure Frontend Service

The frontend service configuration:

```yaml
- name: ggds-frontend
  type: web
  dockerfile_path: ggds-benevolent-fund/Dockerfile
  source_dir: ggds-benevolent-fund
  http_port: 3000
```

Key features:
- ✅ Next.js standalone build for optimal performance
- ✅ Automatic HTTPS
- ✅ CDN integration
- ✅ SSR and API routes support

---

## Environment Variables

### Required Environment Variables

#### Backend (`ggds-backend`)

Set these in the Digital Ocean dashboard under **App Settings > Environment Variables**:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `SECRET_KEY` | Secret | JWT secret key (generate secure random string) | `openssl rand -hex 32` |
| `SMTP_USERNAME` | Secret | Hostinger email username | `lifeline@ggdi.net` |
| `SMTP_PASSWORD` | Secret | Hostinger email password | `your-password` |
| `SPACES_ACCESS_KEY` | Secret | Digital Ocean Spaces access key | `DO00XXXXXXXXXXXXX` |
| `SPACES_SECRET_KEY` | Secret | Digital Ocean Spaces secret key | `xxxxxxxxxxxxxxxxxxxxx` |

**Auto-configured (no action needed):**
- `DATABASE_URL` - Auto-populated from database
- `FRONTEND_URL` - Auto-populated from frontend service
- `EMAIL_FROM` - Set to `lifeline@ggdi.net` in app.yaml
- `ADMIN_EMAIL` - Set to `lifeline@ggdi.net` in app.yaml
- `APP_NAME`, `APP_ENV`, `DEBUG`, etc. - Set in app.yaml

#### Frontend (`ggds-frontend`)

**Auto-configured (no action needed):**
- `NEXT_PUBLIC_API_URL` - Auto-populated from backend service
- `NODE_ENV` - Set to production
- `NEXT_PUBLIC_SITE_NAME` - Set in app.yaml

### Generating Secrets

Generate secure random secrets:

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Setting Up Hostinger SMTP

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Navigate to **Email Accounts**
3. Ensure the email account `lifeline@ggdi.net` exists (or create it)
4. Note the **password** for this email account
5. SMTP settings:
   - **Host**: `smtp.hostinger.com`
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Username**: `lifeline@ggdi.net`
   - **Password**: Your email password
   - **Encryption**: TLS

**Note**: Both the sender email (EMAIL_FROM) and admin notification email (ADMIN_EMAIL) are configured as `lifeline@ggdi.net`

### Setting Up Digital Ocean Spaces

1. Go to [Digital Ocean Spaces](https://cloud.digitalocean.com/spaces)
2. Click **"Create Space"**
3. Configure:
   - **Region**: Frankfurt (fra1) or closest to your users
   - **Name**: `ggds-benevolent-fund-files` (must be globally unique)
   - **File Listing**: Private (Restricted)
   - **CDN**: Enable for faster file delivery (recommended)
4. Click **"Create Space"**
5. Generate API Keys:
   - Go to [API > Spaces Keys](https://cloud.digitalocean.com/account/api/spaces)
   - Click **"Generate New Key"**
   - Name: "GGDS Backend"
   - **Save the Access Key and Secret Key** (you won't see the secret again!)
6. Optional: Configure CORS if frontend needs direct access
   - Go to Space > Settings > CORS Configurations
   - Add your frontend domain

### Setting Environment Variables via Dashboard

1. Go to your app in Digital Ocean dashboard
2. Click **Settings** tab
3. Scroll to **Environment Variables**
4. Click **Edit** next to the component (backend/frontend)
5. Click **Add Variable**
6. Enter key, value, and mark as **Encrypted** for secrets
7. Click **Save**
8. Your app will automatically redeploy

### Setting Environment Variables via CLI

```bash
# Set a single variable
doctl apps update <APP_ID> \
  --env "SECRET_KEY=type=SECRET,value=your-secret-here"

# Or update the app.yaml and redeploy
doctl apps update <APP_ID> --spec .do/app.yaml
```

---

## Post-Deployment

### Verify Deployment

1. **Check Build Logs**
   ```bash
   doctl apps logs <APP_ID> --type=BUILD
   ```

2. **Check Runtime Logs**
   ```bash
   doctl apps logs <APP_ID> --type=RUN
   ```

3. **Test Health Endpoints**
   ```bash
   # Backend health
   curl https://ggds-backend-xxxxx.ondigitalocean.app/health

   # Frontend
   curl https://ggds-frontend-xxxxx.ondigitalocean.app/
   ```

### Create Initial Admin User

After deployment, create your first admin user:

```bash
# SSH into backend container
doctl apps exec <APP_ID> --component ggds-backend -- /bin/sh

# Create admin user (when admin creation script is available)
python scripts/create_admin.py --email admin@ggds.org --name "Admin User"
```

Or use the API directly:

```bash
curl -X POST https://ggds-backend-xxxxx.ondigitalocean.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ggds.org",
    "password": "secure-password",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

### Configure Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Click **Add Domain**
3. Enter your domain: `benevolent.ggds.org`
4. Add DNS records as instructed by Digital Ocean:
   ```
   Type: CNAME
   Name: benevolent
   Value: ggds-frontend-xxxxx.ondigitalocean.app
   ```
5. Wait for DNS propagation (5-30 minutes)
6. SSL certificate will be auto-provisioned

---

## Monitoring & Maintenance

### Application Metrics

View metrics in the Digital Ocean dashboard:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Database Monitoring

1. Go to **Databases** in the dashboard
2. Select `ggds-postgres`
3. View:
   - Connection pool usage
   - Query performance
   - Disk usage
   - Slow queries

### Setting Up Alerts

1. Go to **Monitoring** > **Alerts**
2. Create alert policies:
   - High CPU usage (>80% for 5 minutes)
   - High memory usage (>90% for 5 minutes)
   - High error rate (>5% for 5 minutes)
   - Database connection errors

### Backup Strategy

**Database Backups:**
- Daily automatic backups (enabled by default)
- Retained for 7 days on starter plan
- Manual backups available

**Create Manual Backup:**
```bash
doctl databases backup create <DATABASE_ID>
```

**Restore from Backup:**
1. Go to **Databases** > `ggds-postgres` > **Backups**
2. Select backup
3. Click **Restore**
4. Choose to restore to new cluster or existing

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom:** App fails to build

**Solutions:**
```bash
# Check build logs
doctl apps logs <APP_ID> --type=BUILD

# Common issues:
# - Missing dependencies in requirements.txt or package.json
# - Dockerfile syntax errors
# - Out of memory during build (upgrade plan)
```

#### 2. Database Connection Errors

**Symptom:** Backend can't connect to database

**Solutions:**
```bash
# Verify DATABASE_URL is set correctly
doctl apps env list <APP_ID> --component ggds-backend

# Check database is running
doctl databases list

# Check database connection pool
doctl databases connection-pool list <DATABASE_ID>
```

#### 3. CORS Errors

**Symptom:** Frontend can't communicate with backend

**Solutions:**
1. Verify `FRONTEND_URL` environment variable in backend
2. Check backend CORS settings in `app/main.py`
3. Ensure both services are deployed and accessible

#### 4. Migration Failures

**Symptom:** Alembic migrations fail on startup

**Solutions:**
```bash
# SSH into backend container
doctl apps exec <APP_ID> --component ggds-backend -- /bin/sh

# Check migration status
alembic current

# View migration history
alembic history

# Manually run migrations
alembic upgrade head

# If stuck, stamp to current version
alembic stamp head
```

#### 5. Frontend Build Errors

**Symptom:** Next.js build fails

**Solutions:**
```bash
# Check build logs
doctl apps logs <APP_ID> --type=BUILD --component ggds-frontend

# Common issues:
# - Missing NEXT_PUBLIC_API_URL
# - Node version mismatch (ensure using Node 18)
# - TypeScript errors (run local type check)
```

### Getting Help

1. **Digital Ocean Documentation**
   - [App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
   - [Managed Databases](https://docs.digitalocean.com/products/databases/)

2. **View Application Logs**
   ```bash
   # All logs
   doctl apps logs <APP_ID> --follow

   # Backend only
   doctl apps logs <APP_ID> --component ggds-backend --follow

   # Frontend only
   doctl apps logs <APP_ID> --component ggds-frontend --follow
   ```

3. **Digital Ocean Support**
   - Open a ticket in the dashboard
   - Community forums: [DigitalOcean Community](https://www.digitalocean.com/community)

---

## Cost Estimation

### Starter Configuration

| Service | Plan | Cost/Month |
|---------|------|------------|
| Backend (Web) | Basic XXS (512MB RAM, 1 vCPU) | $5 |
| Frontend (Web) | Basic XXS (512MB RAM, 1 vCPU) | $5 |
| PostgreSQL | Starter (1GB RAM, 1 vCPU, 10GB disk) | $15 |
| **Total** | | **~$25/month** |

### Production Configuration

| Service | Plan | Cost/Month |
|---------|------|------------|
| Backend (Web) | Basic XS (1GB RAM, 1 vCPU) | $12 |
| Frontend (Web) | Basic XS (1GB RAM, 1 vCPU) | $12 |
| PostgreSQL | Basic (2GB RAM, 1 vCPU, 25GB disk) | $60 |
| Bandwidth | Included (1TB) | $0 |
| **Total** | | **~$84/month** |

*Note: Prices subject to change. Check [Digital Ocean Pricing](https://www.digitalocean.com/pricing) for current rates.*

---

## Scaling

### Horizontal Scaling

Increase the number of instances:

```bash
# Scale backend to 3 instances
doctl apps update <APP_ID> \
  --component-scale ggds-backend:3

# Scale frontend to 2 instances
doctl apps update <APP_ID> \
  --component-scale ggds-frontend:2
```

### Vertical Scaling

Upgrade instance size:

1. Go to **App Settings** > **Resources**
2. Select component (backend or frontend)
3. Click **Edit Plan**
4. Choose larger plan (e.g., Basic XS, Basic S)
5. Click **Save**

### Database Scaling

Upgrade database plan:

1. Go to **Databases** > `ggds-postgres`
2. Click **Resize**
3. Choose new plan
4. Click **Resize Database**
5. Zero downtime migration will be performed

---

## Security Checklist

- [ ] All secret environment variables marked as encrypted
- [ ] Database connections use SSL (enabled by default)
- [ ] HTTPS enabled for all services (automatic)
- [ ] Regular security updates (automatic with container rebuilds)
- [ ] Database backups enabled
- [ ] Access logs reviewed regularly
- [ ] Admin email 2FA enabled
- [ ] AWS S3 bucket properly secured
- [ ] CORS properly configured (not allowing all origins in production)

---

## Next Steps

1. ✅ Deploy to Digital Ocean
2. ✅ Configure environment variables
3. ✅ Verify health endpoints
4. ✅ Create admin user
5. ✅ Configure custom domain
6. ✅ Test end-to-end functionality
7. ✅ Set up monitoring alerts
8. ✅ Document any customizations
9. ✅ Train admin users
10. ✅ Go live! 🚀

---

## Additional Resources

- [GGDS Backend API Documentation](https://ggds-backend-xxxxx.ondigitalocean.app/docs)
- [Project Repository](https://github.com/your-username/ggds)
- [Digital Ocean Community](https://www.digitalocean.com/community)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Questions or Issues?**

Contact the development team or create an issue in the GitHub repository.
