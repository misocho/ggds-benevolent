# GGDS Backend - Quick Setup Guide

## 🎯 What We've Built

A complete FastAPI backend infrastructure for the GGDS Benevolent Fund with:

✅ **Complete project structure**
✅ **PostgreSQL database models** (7 tables)
✅ **JWT authentication system**
✅ **Alembic migrations setup**
✅ **Email service** (Resend integration)
✅ **File upload service** (S3 placeholder + local storage)
✅ **CORS configured** for Next.js frontend
✅ **Docker deployment** ready
✅ **Comprehensive documentation**

## 🚀 Quick Start (Local Development)

### 1. Setup Environment

```bash
cd ggds-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 2. Configure `.env`

```env
# Minimum required for local development:
DATABASE_URL=postgresql://user:pass@localhost:5432/ggds_benevolent
SECRET_KEY=$(openssl rand -hex 32)
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Local PostgreSQL

**Option A: Using Docker**
```bash
docker run --name ggds-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ggds_benevolent \
  -p 5432:5432 \
  -d postgres:14
```

**Option B: Native PostgreSQL**
```bash
createdb ggds_benevolent
```

### 4. Run Database Migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

### 5. Start the Server

```bash
uvicorn app.main:app --reload
```

Visit:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 📦 What's Inside

### Database Models (7 Tables)

1. **users** - Authentication (email, hashed_password, role)
2. **members** - Member registration data
3. **family_members** - Nuclear family & siblings (up to 27 per member)
4. **next_of_kin** - Emergency contacts (2 per member)
5. **cases** - Support case requests
6. **verification_contacts** - Village elders, chiefs, referees
7. **documents** - File upload metadata

### Security Features

- **Password Hashing**: Bcrypt (12 rounds)
- **JWT Tokens**: Access (30min) + Refresh (7 days)
- **Role-Based Access**: Member & Admin roles
- **Input Validation**: Pydantic schemas
- **CORS**: Configured for frontend

### Services

- **Authentication**: JWT token generation & verification
- **Email**: Welcome, case confirmation, status updates
- **Upload**: Local storage (S3-ready with placeholder code)

---

## 🌐 Deployment to DigitalOcean

### Prerequisites

- DigitalOcean account
- GitHub repository (for auto-deploy)

### Steps

**1. Create PostgreSQL Database**
```
DigitalOcean → Databases → Create
- PostgreSQL 14
- Basic plan ($15/month)
- Copy connection string
```

**2. Create App Platform App**
```
DigitalOcean → Apps → Create
- Source: GitHub repository
- Region: Choose closest to users
- Plan: Basic ($5/month)
```

**3. Configure Environment Variables**

In App Platform settings, add:
```env
DATABASE_URL=<from step 1>
SECRET_KEY=<generate with: openssl rand -hex 32>
FRONTEND_URL=https://your-frontend.vercel.app
RESEND_API_KEY=<optional for now>
APP_ENV=production
DEBUG=False
```

**4. Run Migrations**

After first deployment, open console:
```bash
alembic upgrade head
```

**5. Create First Admin User**

You'll need to run a script or use database client to create the first admin:
```sql
-- Example (run after migrations)
INSERT INTO users (id, email, hashed_password, role, is_active)
VALUES (
  gen_random_uuid(),
  'admin@ggds.org',
  '<bcrypt_hash>',  -- Generate using Python: from passlib.context import CryptContext; CryptContext(schemes=["bcrypt"]).hash("your_password")
  'admin',
  true
);
```

---

## 🔧 Next Steps (API Endpoints)

The infrastructure is ready! Now we need to build the API endpoints:

### Priority 1: Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login & get JWT
- `GET /api/auth/me` - Get current user

### Priority 2: Member Routes
- `POST /api/members` - Create member registration
- `GET /api/members/{id}` - Get member profile
- `PATCH /api/members/{id}` - Update member

### Priority 3: Case Routes
- `POST /api/cases` - Submit new case
- `GET /api/cases` - List user's cases
- `GET /api/cases/{id}` - Get case details

### Priority 4: Dashboard Routes
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/cases` - User's cases with status

### Priority 5: Admin Routes
- `GET /api/admin/cases` - All cases (admin only)
- `PATCH /api/admin/cases/{id}/status` - Approve/reject

Would you like me to implement these endpoints next?

---

## 📧 Email Setup (Optional)

1. Create Resend account: https://resend.com
2. Get API key
3. Add to `.env`: `RESEND_API_KEY=re_...`
4. Emails will automatically work!

Without API key, emails will be logged to console but not sent.

---

## 📦 S3 Setup (Later)

When ready for production file uploads:

1. Create AWS S3 bucket
2. Configure bucket CORS
3. Get AWS credentials
4. Add to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=ggds-documents
   ```
5. Uncomment S3 code in `app/services/upload_service.py`

---

## 🧪 Testing the Setup

```bash
# 1. Health check
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","version":"1.0.0","database":"connected"}

# 2. Check API docs
# Open http://localhost:8000/docs in browser

# 3. Test database connection
python -c "from app.database import engine; from sqlalchemy import text; engine.connect().execute(text('SELECT 1'))"
```

---

## 📊 Database Schema Visualization

```
users (auth)
  ↓
members (registration)
  ├→ family_members (nuclear & siblings)
  ├→ next_of_kin (2 required)
  └→ cases (support requests)
       ├→ verification_contacts (village elder, chiefs, referee)
       └→ documents (file uploads)
```

---

## 🎓 Learn More

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy**: https://docs.sqlalchemy.org
- **Alembic**: https://alembic.sqlalchemy.org
- **Pydantic**: https://docs.pydantic.dev

---

## 🆘 Troubleshooting

**Database connection error?**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string format
# postgresql://user:password@host:port/database
```

**Import errors?**
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Migration errors?**
```bash
# Reset migrations (CAUTION: development only!)
alembic downgrade base
alembic upgrade head
```

---

## 📞 Need Help?

The complete infrastructure is ready. Next step is to implement the API endpoints (routers).

Ready to continue?
