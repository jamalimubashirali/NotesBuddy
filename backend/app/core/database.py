from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user_pref_model import Base
import os

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL or "sqlite:///./notebuddy.db"

if SQLALCHEMY_DATABASE_URL != "sqlite:///./notebuddy.db":
    print(f"Using PostgreSQL connection with SSL")
else:
    print(f"Using SQLite fallback")

# SQLAlchemy engine creation
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args
)

# SessionLocal class creation
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all tables in the database if they don't exist."""
    try:
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        # Check if our core tables exist (e.g., 'users')
        if "users" in existing_tables:
            print("Database tables already exist. Skipping creation.")
            return

        print(f"Creating tables for database...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Warning: Database connection failed - {str(e)[:100]}")
        print("Application will continue with limited functionality.")
        print("Please update your .env file with Supabase POOLER connection details.")


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
