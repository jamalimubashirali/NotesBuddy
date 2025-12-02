from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user_pref_model import Base

# Use DATABASE_URL from settings, fallback to SQLite if not set
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL or "sqlite:///./notebuddy.db"

# Create SQLAlchemy engine
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
