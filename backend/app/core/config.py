from pydantic_settings import BaseSettings
from typing import Optional
import os
import dotenv

dotenv.load_dotenv()


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NotesBuddy"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-powered note-taking and content summarization platform"
    
    # Database Configuration - Individual Parameters (Pydantic will load from .env)
    user: Optional[str] = None
    password: Optional[str] = None
    host: Optional[str] = None
    port: Optional[str] = None
    dbname: Optional[str] = None
    
    # Security Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Token Usage Limits
    DAILY_TOKEN_LIMIT: int = 5000  # 5k tokens per user per day (~4k words)
    MAX_TOKENS_PER_CHAT: int = 2000  # 2k tokens per chat session
    
    # Request Management
    MAX_CONCURRENT_REQUESTS: int = 5  # Max concurrent AI requests
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # OpenRouter
    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    
    @property
    def DATABASE_URL(self) -> Optional[str]:
        """Construct DATABASE_URL from individual parameters with SSL."""
        if all([self.user, self.password, self.host, self.port, self.dbname]):
            return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}?sslmode=require"
        return None
    
    class Config:
        env_file = ".env"
        case_sensitive = False  # Changed to False so 'user' matches 'user' in .env
        extra = "ignore"  # Allow extra fields in .env


# Create global settings instance
settings = Settings()