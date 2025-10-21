# GGDS Benevolent Fund - Backend API

FastAPI backend for the Grand Granite Diaspora Sacco Benevolent Fund application.

## 🚀 Tech Stack

- **Framework**: FastAPI 0.115.0
- **Database**: PostgreSQL (via SQLAlchemy 2.0)
- **Authentication**: JWT (python-jose)
- **Email**: Resend
- **File Storage**: AWS S3 (placeholder, local storage for now)
- **Migrations**: Alembic
- **Deployment**: DigitalOcean App Platform

---

## 📁 Project Structure

```
ggds-backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration & settings
│   ├── database.py                # Database connection
│   ├── models/                    # SQLAlchemy models
│   ├── schemas/                   # Pydantic schemas
│   ├── routers/                   # API endpoints
│   ├── services/                  # Business logic
│   ├── utils/                     # Utilities (security, dependencies)
│   └── middleware/                # Custom middleware
├── alembic/                       # Database migrations
├── tests/                         # Tests
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
├── alembic.ini                    # Alembic configuration
├── Dockerfile                     # Docker configuration
└── README.md                      # This file
```

---

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- pip or poetry

### 1. Clone and Navigate

```bash
cd ggds-backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ggds_benevolent
SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=re_your_key_here  # Optional for now
```

### 5. Initialize Database

**Option A: Auto-create tables (development)**
```bash
# Tables will be created automatically when you run the app in debug mode
python -m app.main
```

**Option B: Use Alembic migrations (recommended)**
```bash
# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Run migration
alembic upgrade head
```

### 6. Run the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use the built-in command
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📝 API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Members
- `POST /api/members` - Create member registration
- `GET /api/members` - List members (paginated)
- `GET /api/members/{id}` - Get member details
- `PATCH /api/members/{id}` - Update member

### Cases
- `POST /api/cases` - Submit new case
- `GET /api/cases` - List cases
- `GET /api/cases/{id}` - Get case details
- `PATCH /api/cases/{id}/status` - Update status (admin)

### Dashboard
- `GET /api/dashboard/stats` - User statistics
- `GET /api/dashboard/cases` - User's cases
- `GET /api/dashboard/profile` - User profile

### Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/{id}` - Get file metadata

### Admin
- `GET /api/admin/cases` - All cases
- `GET /api/admin/members` - All members
- `PATCH /api/admin/cases/{id}/approve` - Approve case

---

## 🗄️ Database Models

- **User** - Authentication credentials
- **Member** - Member registration data
- **FamilyMember** - Nuclear family & siblings
- **NextOfKin** - Emergency contacts
- **Case** - Support case requests
- **VerificationContact** - Village elders, chiefs, referees
- **Document** - File uploads metadata

---

## 🔒 Security

- **Password Hashing**: Bcrypt with salt rounds: 12
- **JWT Tokens**: HS256 algorithm
- **Access Token**: 30 minutes expiry
- **Refresh Token**: 7 days expiry
- **CORS**: Configured for frontend origin
- **Input Validation**: Pydantic schemas
- **SQL Injection**: Protected by SQLAlchemy ORM

---

## 📧 Email Service

Email notifications using Resend:

- Welcome email (member registration)
- Case submission confirmation
- Case status updates
- Admin notifications

**Setup**: Add `RESEND_API_KEY` to `.env` file.

---

## 📦 File Upload (S3 Placeholder)

The upload service has placeholder code for AWS S3 integration.

**Current**: Files saved to local `uploads/` directory

**When ready to use S3**:
1. Add AWS credentials to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   S3_BUCKET_NAME=ggds-documents
   ```
2. Uncomment S3 code in `app/services/upload_service.py`
3. Create S3 bucket and configure CORS

---

## 🚢 Deployment to DigitalOcean

### 1. Create PostgreSQL Database

In DigitalOcean:
1. Go to Databases → Create Database Cluster
2. Choose PostgreSQL 14+
3. Select region and plan (Basic $15/month)
4. Copy connection string

### 2. Create App Platform App

```bash
# Install doctl CLI
brew install doctl  # macOS
# or download from: https://docs.digitalocean.com/reference/doctl/

# Authenticate
doctl auth init

# Deploy app
doctl apps create --spec .do/app.yaml
```

### 3. Set Environment Variables

In DigitalOcean App Platform:
1. Go to Settings → App-Level Environment Variables
2. Add all variables from `.env.example`
3. Set `DATABASE_URL` to your DigitalOcean PostgreSQL connection string

### 4. Run Migrations

Connect to your app console and run:
```bash
alembic upgrade head
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py
```

---

## 🔧 Development Commands

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Format code with black
black app/

# Lint with flake8
flake8 app/

# Type check with mypy
mypy app/
```

---

## 📊 Database Migrations

```bash
# Initialize Alembic (already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

---

## 🐳 Docker

```bash
# Build image
docker build -t ggds-backend .

# Run container
docker run -p 8000:8000 --env-file .env ggds-backend

# With Docker Compose
docker-compose up
```

---

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `FRONTEND_URL` - Frontend URL for CORS

**Optional**:
- `RESEND_API_KEY` - Email service (emails disabled without this)
- `AWS_*` - S3 credentials (local storage used without these)

---

## 🔍 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide interactive API documentation with:
- All endpoints listed
- Request/response schemas
- Try-it-out functionality

---

## 🤝 Contributing

1. Create a new branch
2. Make changes
3. Write/update tests
4. Ensure all tests pass
5. Submit pull request

---

## 📞 Support

For questions or issues:
- **Email**: admin@ggds.org
- **Website**: https://grandgranitediasporasacco.com

---

## 📄 License

MIT License - GGDS Development Team

---

## ✅ Current Status

- ✅ Project structure created
- ✅ All models defined
- ✅ Database connection configured
- ✅ Alembic migrations setup
- ✅ JWT authentication utilities ready
- ✅ Email service integrated (Resend)
- ✅ Upload service (placeholder for S3)
- ✅ Main FastAPI app with CORS
- ⏳ API endpoints (to be implemented)
- ⏳ Tests (to be written)
- ⏳ DigitalOcean deployment config

---

**Built with ❤️ for the GGDS community**
