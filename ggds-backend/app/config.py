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

    # Email (Hostinger SMTP)
    smtp_host: str = "smtp.hostinger.com"
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str
    smtp_use_tls: bool = True
    email_from: str = "lifeline@ggdi.net"
    admin_email: str = "lifeline@ggdi.net"

    # Digital Ocean Spaces (S3 compatible)
    spaces_region: str = "fra1"
    spaces_bucket: str
    spaces_access_key: str
    spaces_secret_key: str
    spaces_endpoint: Optional[str] = None  # Auto-generated from region if not provided

    @property
    def spaces_endpoint_url(self) -> str:
        """Generate Digital Ocean Spaces endpoint URL"""
        if self.spaces_endpoint:
            return self.spaces_endpoint
        return f"https://{self.spaces_region}.digitaloceanspaces.com"

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
