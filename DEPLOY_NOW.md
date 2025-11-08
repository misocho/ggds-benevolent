# 🚀 Deploy GGDS Application - Ready to Go!

All Docker Compose compatibility issues have been fixed. Choose your deployment method below:

---

## ✅ Option 1: Direct Deployment on Server (RECOMMENDED)

This is the easiest method - deploy directly on the server.

### Step 1: SSH into your server
```bash
ssh root@167.172.112.115
```

### Step 2: Run the manual deployment script
```bash
# If /opt/ggds doesn't exist yet:
cd /opt
git clone https://github.com/misocho/ggds-benevolent.git ggds
cd ggds

# If /opt/ggds already exists:
cd /opt/ggds
git pull origin main

# Make sure .env.production exists
# (Copy it from your local machine if needed)
# scp .env.production root@167.172.112.115:/opt/ggds/

# Run deployment
./deploy-manual.sh
```

**What it does:**
- Pulls latest code
- Copies .env.production to .env
- Stops old containers
- Builds fresh Docker images
- Starts all services (PostgreSQL, Backend, Frontend)
- Shows status and logs

---

## Option 2: Deploy from Local Machine

Requires SSH key authentication to be set up.

### Step 1: Set up SSH key (one-time)
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "deployment"

# Copy to server
ssh-copy-id root@167.172.112.115
```

### Step 2: Deploy
```bash
./deploy.sh
```

---

## Option 3: Manual Step-by-Step (Troubleshooting)

If you prefer to run commands manually:

```bash
# 1. SSH to server
ssh root@167.172.112.115

# 2. Navigate to app directory
cd /opt/ggds

# 3. Pull latest code
git pull origin main

# 4. Ensure environment file exists
cp .env.production .env

# 5. Stop containers
docker-compose down

# 6. Build images (takes 5-10 minutes)
docker-compose build --no-cache

# 7. Start containers
docker-compose up -d

# 8. Check status
docker-compose ps

# 9. View logs
docker-compose logs -f
```

---

## 📋 What Was Fixed

All Docker Compose compatibility issues resolved:

✅ Changed version from `3.8` to `3.3` (compatible with older docker-compose)
✅ Removed unsupported `start_period` from healthchecks
✅ Fixed `depends_on` format (array instead of object)
✅ Commented out nginx service (used unsupported `profiles`)
✅ Fixed tar command in deploy.sh
✅ Added .env.production → .env copy logic

---

## 🌐 Access Your Application

After deployment completes (5-10 minutes):

- **Frontend**: http://167.172.112.115:3000
- **Backend API**: http://167.172.112.115:8000
- **API Documentation**: http://167.172.112.115:8000/docs

---

## ⚠️ Important Notes

1. **Environment File**: Make sure `/opt/ggds/.env.production` exists on server with all credentials

2. **First Deployment**: Initial build takes 5-10 minutes (subsequent deployments are faster)

3. **Check Status**: Use `docker-compose ps` to verify all containers are "Up"

4. **View Logs**: Use `docker-compose logs -f` to monitor application logs

5. **If Build Fails**: Run `docker-compose logs` to see detailed error messages

---

## 🔍 Verify Deployment

Run this from your local machine to check deployment status:

```bash
./check-deployment.sh
```

Or manually check:

```bash
# Check if services are responding
curl http://167.172.112.115:8000/health
curl http://167.172.112.115:3000

# Check API docs
open http://167.172.112.115:8000/docs
```

---

## 🆘 Troubleshooting

### Services won't start
```bash
ssh root@167.172.112.115
cd /opt/ggds
docker-compose logs
```

### Database connection errors
```bash
docker-compose logs postgres
docker-compose restart backend
```

### Out of memory
```bash
free -h
docker-compose restart
```

### Need to rebuild everything
```bash
docker-compose down -v  # WARNING: Deletes database!
docker-compose build --no-cache
docker-compose up -d
```

---

## ✅ Recommended: Use Option 1 (deploy-manual.sh)

Just SSH to the server and run `./deploy-manual.sh` 🚀
