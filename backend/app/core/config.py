from pydantic_settings import BaseSettings
from typing import Optional


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
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Azure OpenAI
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_VERSION: Optional[str] = None
    AZURE_OPENAI_DEPLOYMENT_NAME: Optional[str] = None
    
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