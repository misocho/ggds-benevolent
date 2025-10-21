from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "GGDS Benevolent Fund API"
    app_env: str = "development"
    debug: bool = True

    # Database
    database_url: str

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Frontend CORS
    frontend_url: str = "http://localhost:3000"

    # Email
    resend_api_key: Optional[str] = None
    email_from: str = "noreply@ggds.org"
    admin_email: str = "admin@ggds.org"

    # AWS S3
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "eu-west-1"
    aws_s3_bucket: str

    # Optional
    sentry_dsn: Optional[str] = None
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Create global settings instance
settings = Settings()
