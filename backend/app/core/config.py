from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union, List
import os
import dotenv

dotenv.load_dotenv()


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = os.getenv("API_V1_STR")
    PROJECT_NAME: str = os.getenv("PROJECT_NAME")
    VERSION: str = os.getenv("VERSION")
    DESCRIPTION: str = os.getenv("DESCRIPTION")
    
    # Database Configuration - Individual Parameters (Pydantic will load from .env)
    user: Optional[str] = os.getenv("user")
    password: Optional[str] = os.getenv("password")
    host: Optional[str] = os.getenv("host")
    port: Optional[str] = os.getenv("port")
    dbname: Optional[str] = os.getenv("dbname")
    
    # Security Configuration
    ACCESS_TOKEN_SECRET_KEY: str = os.getenv("ACCESS_TOKEN_SECRET_KEY")
    REFRESH_TOKEN_SECRET_KEY: str = os.getenv("REFRESH_TOKEN_SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE")
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE")
    
    # MVP Limits (One-time token allocation per user, not daily)
    TOTAL_TOKEN_LIMIT: int = os.getenv("TOTAL_TOKEN_LIMIT", 1500)  # One-time token allocation per user
    MAX_TOKENS_PER_CHAT: int = os.getenv("MAX_TOKENS_PER_CHAT")  # 2k tokens per chat session for all users
    MAX_NOTES_COUNT: int = os.getenv("MAX_NOTES_COUNT")  # Maximum number of notes per user
    
    # Request Management
    MAX_CONCURRENT_REQUESTS: int = os.getenv("MAX_CONCURRENT_REQUESTS")  # Max concurrent AI requests
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip().strip("/") for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return [i.strip().strip("/") for i in v]
        raise ValueError(v)
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT")
    DEBUG: bool = os.getenv("DEBUG")

    # OpenRouter
    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL")
    
    # YouTube Proxy
    YOUTUBE_PROXY: Optional[str] = os.getenv("YOUTUBE_PROXY")
    
    @property
    def DATABASE_URL(self) -> Optional[str]:
        """Construct DATABASE_URL from individual parameters."""
        # If DATABASE_URL is explicitly set in environment, use it
        if os.getenv("DATABASE_URL"):
            return os.getenv("DATABASE_URL")
            
        if all([self.user, self.password, self.host, self.port, self.dbname]):
            ssl_mode = "require" if self.ENVIRONMENT != "local" else "disable"
            return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}?sslmode={ssl_mode}"
        return None
    
    class Config:
        env_file = ".env"
        case_sensitive = False  # Changed to False so 'user' matches 'user' in .env
        extra = "ignore"  # Allow extra fields in .env


# Create global settings instance
settings = Settings()