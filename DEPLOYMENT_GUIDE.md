# GGDS Benevolent Fund - Deployment Guide

## 🚀 Deployment to Render (Recommended)

This guide covers deploying the GGDS Benevolent Fund application to Render as a monolithic service.

### Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **AWS Account**: For S3 file storage
4. **Domain Name** (Optional): For custom domain

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Verify required files exist**:
- `render.yaml` (root directory)
- `ggds-backend/requirements.txt`
- `ggds-benevolent-fund/package.json`
- `ggds-backend/alembic/` (migrations directory)

### Step 2: Create Render Services

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create all services

#### Option B: Manual Setup

If you prefer manual setup or need to customize:

##### 1. Create PostgreSQL Database

1. Click **"New"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `ggds-postgres`
   - **Database**: `ggds_benevolent`
   - **Region**: Choose closest to your users
   - **Plan**: Free (Starter) or Paid
3. Click **"Create Database"**
4. **Save the Internal Database URL** (you'll need this)

##### 2. Create Backend Service

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ggds-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `ggds-backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free (Starter) or Paid

4. **Add Environment Variables** (see section below)

5. Click **"Create Web Service"**

##### 3. Create Frontend Service

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ggds-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `ggds-benevolent-fund`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free (Starter) or Paid

4. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: URL of your backend service (e.g., `https://ggds-backend.onrender.com`)
   - `NODE_ENV`: `production`

5. Click **"Create Web Service"**

### Step 3: Configure Environment Variables

#### Backend Environment Variables

**Required:**
```env
DATABASE_URL=<Internal Database URL from Render>
SECRET_KEY=<Generate random 64-character string>
FRONTEND_URL=https://ggds-frontend.onrender.com
AWS_ACCESS_KEY_ID=<Your AWS Access Key>
AWS_SECRET_ACCESS_KEY=<Your AWS Secret Key>
AWS_S3_BUCKET=ggds-benevolent-fund-files
```

**Optional:**
```env
APP_NAME=GGDS Benevolent Fund API
APP_ENV=production
DEBUG=false
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
AWS_REGION=eu-west-1
RESEND_API_KEY=<Your Resend API Key>
EMAIL_FROM=noreply@ggds.org
ADMIN_EMAIL=admin@ggds.org
LOG_LEVEL=INFO
```

#### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://ggds-backend.onrender.com
NODE_ENV=production
```

### Step 4: Configure Custom Domain (Optional)

1. In Render Dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `api.ggds.org` for backend, `app.ggds.org` for frontend)
4. Update DNS records as instructed by Render
5. Update environment variables to use custom domains

### Step 5: AWS S3 Setup

1. **Create S3 Bucket**:
   - Go to [AWS S3 Console](https://s3.console.aws.amazon.com)
   - Click **"Create bucket"**
   - Name: `ggds-benevolent-fund-files`
   - Region: `eu-west-1` (or your preferred region)
   - **Block all public access**: Checked (use presigned URLs)
   - Click **"Create bucket"**

2. **Create IAM User**:
   - Go to [IAM Console](https://console.aws.amazon.com/iam)
   - Create user with programmatic access
   - Attach policy:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject",
             "s3:GetObject",
             "s3:DeleteObject",
             "s3:ListBucket"
           ],
           "Resource": [
             "arn:aws:s3:::ggds-benevolent-fund-files",
             "arn:aws:s3:::ggds-benevolent-fund-files/*"
           ]
         }
       ]
     }
     ```
   - Save Access Key ID and Secret Access Key

3. **Enable Server-Side Encryption** (recommended):
   - Go to bucket → Properties → Default encryption
   - Enable SSE-S3 or SSE-KMS

### Step 6: Initialize Database

The database will be automatically initialized when the backend starts (via `alembic upgrade head`).

To create an admin user, you can either:

**Option A: Use Render Shell**
1. Go to backend service in Render
2. Click **"Shell"**
3. Run:
```bash
python -c "
from app.database import SessionLocal
from app.models import User, Member
from app.utils.auth import get_password_hash
import uuid
from datetime import date

db = SessionLocal()

# Create admin user
admin_user = User(
    id=uuid.uuid4(),
    email='admin@ggds.org',
    hashed_password=get_password_hash('YOUR_SECURE_PASSWORD_HERE'),
    role='admin',
    is_active=True
)
db.add(admin_user)
db.commit()
print('Admin user created!')
db.close()
"
```

**Option B: Use database migration**
Create a migration script to seed initial admin user.

### Step 7: Post-Deployment Checklist

- [ ] All services are running (green status in Render)
- [ ] Database migrations completed successfully
- [ ] Admin user created and can login
- [ ] Frontend can communicate with backend
- [ ] File uploads working (test with S3)
- [ ] Email sending working (if configured)
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled (automatic with Render)
- [ ] Environment variables set correctly
- [ ] Logs are accessible and monitoring is set up

### Step 8: Monitoring and Maintenance

1. **Set up Health Checks**:
   - Backend: `/health` endpoint (already configured)
   - Frontend: Default Next.js health check

2. **Monitor Logs**:
   - Access logs in Render Dashboard → Service → Logs
   - Set up log alerts for errors

3. **Set up Backups**:
   - Render automatically backs up databases
   - For additional safety, enable point-in-time recovery
   - Backup S3 bucket with versioning:
     ```bash
     aws s3api put-bucket-versioning \
       --bucket ggds-benevolent-fund-files \
       --versioning-configuration Status=Enabled
     ```

4. **Cost Monitoring**:
   - Monitor Render usage in dashboard
   - Monitor AWS costs in AWS Cost Explorer
   - Set up billing alerts

## 🔧 Troubleshooting

### Backend Won't Start

**Check:**
1. Build logs for errors during `pip install`
2. Database connection string is correct
3. All required environment variables are set
4. Migrations run successfully

**Common Issues:**
```bash
# Database connection failed
# Solution: Check DATABASE_URL format and database is running

# Module not found
# Solution: Add missing dependency to requirements.txt

# Alembic migration failed
# Solution: Check migration files for errors
```

### Frontend Won't Start

**Check:**
1. Build logs for npm errors
2. `NEXT_PUBLIC_API_URL` is correctly set
3. Node version compatibility

**Common Issues:**
```bash
# API connection failed
# Solution: Verify backend URL is accessible

# Build failed
# Solution: Run npm install locally to check for errors

# Environment variables not accessible
# Solution: Ensure variables start with NEXT_PUBLIC_
```

### File Uploads Not Working

**Check:**
1. AWS credentials are correct
2. S3 bucket exists and is accessible
3. IAM permissions are sufficient
4. Network connectivity to S3

### Database Migrations Failing

**Check:**
1. Database is accessible
2. Migration files are correct
3. Previous migrations completed successfully

**Fix:**
```bash
# Connect to Render shell
# Check migration status
alembic current

# If stuck, manually set version
alembic stamp head

# Retry migration
alembic upgrade head
```

## 🔄 Updating the Application

### Deploy Updates

1. **Push to GitHub**:
```bash
git add .
git commit -m "Update application"
git push origin main
```

2. **Automatic Deploy**:
   - Render automatically detects changes and redeploys
   - Monitor deployment in Render Dashboard

3. **Manual Deploy** (if auto-deploy disabled):
   - Go to service in Render Dashboard
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

### Database Migrations

1. Create migration locally:
```bash
alembic revision --autogenerate -m "Description"
```

2. Commit and push:
```bash
git add alembic/versions/*
git commit -m "Add database migration"
git push origin main
```

3. Migration runs automatically during deployment

### Rollback

If deployment fails:
1. Go to Render Dashboard → Service
2. Click **"Rollback"** to previous version
3. Or: Revert git commit and push

## 💰 Cost Estimation

### Free Tier (Render + AWS)

- **Render**:
  - Backend: Free (spins down after inactivity)
  - Frontend: Free (spins down after inactivity)
  - Database: Free (expires after 90 days)

- **AWS**:
  - S3: ~$0.023/GB/month
  - Data transfer: First 100GB free/month

**Total**: ~$0-5/month (very low usage)

### Recommended Production Setup

- **Render**:
  - Backend: Starter ($7/month) or Standard ($25/month)
  - Frontend: Starter ($7/month)
  - Database: Starter ($7/month)

- **AWS**:
  - S3: ~$5-10/month (estimated)

**Total**: ~$26-47/month

### Scaling Considerations

As usage grows:
1. Upgrade to Standard plans ($25/month per service)
2. Enable auto-scaling
3. Add CDN (Cloudflare/CloudFront)
4. Implement caching (Redis)
5. Consider dedicated database

## 📊 Performance Optimization

1. **Enable CDN**: Use Cloudflare (free) or AWS CloudFront
2. **Database Connection Pooling**: Already configured
3. **Image Optimization**: Serve images through CDN
4. **Caching**: Add Redis for session management
5. **Monitoring**: Use Render metrics or external tools

## 🆘 Support

For issues:
1. Check Render documentation: https://render.com/docs
2. AWS documentation: https://docs.aws.amazon.com
3. Next.js documentation: https://nextjs.org/docs
4. FastAPI documentation: https://fastapi.tiangolo.com

## 📝 Notes

- **Free tier limitations**: Services spin down after 15 minutes of inactivity (cold starts on first request)
- **Upgrade path**: Start with free tier, upgrade to paid plans as needed
- **Backups**: Render provides automatic backups for paid database plans
- **SSL**: Automatic HTTPS with Render (free)
- **Monitoring**: Built-in metrics in Render Dashboard
