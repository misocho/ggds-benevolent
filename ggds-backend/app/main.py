from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.config import settings
from app.database import engine, Base
from app.schemas.common import HealthCheck

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Backend API for GGDS Benevolent Fund - Supporting members in times of need",
    version="1.0.0",
    debug=settings.debug
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error" if not settings.debug else str(exc)}
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Health check endpoint
@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": db_status
    }


# Import and include routers
from app.routers import auth, members, cases, dashboard, upload, admin, contributions, reports, covered_persons

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(members.router, prefix="/api/members", tags=["Members"])
app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(contributions.router, prefix="/api/contributions", tags=["Contributions"])
app.include_router(reports.router, prefix="/api/admin/reports", tags=["Reports"])
app.include_router(covered_persons.router, prefix="/api/covered-persons", tags=["Covered Persons"])


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print(f"🚀 {settings.app_name} starting...")
    print(f"📝 Environment: {settings.app_env}")
    print(f"🌐 CORS enabled for: {settings.frontend_url}")
    print(f"📚 API Documentation: http://localhost:8000/docs")

    # Create tables (in production, use Alembic migrations instead)
    if settings.debug:
        print("🔧 Debug mode: Creating database tables if they don't exist...")
        Base.metadata.create_all(bind=engine)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print(f"👋 {settings.app_name} shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
