from sqlalchemy import Column, Integer, Date, ForeignKey, Index
from datetime import datetime, date
from app.core.database import Base

class TokenUsage(Base):
    """Model for tracking daily token usage per user."""
    __tablename__ = "token_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    tokens_used = Column(Integer, default=0, nullable=False)
    
    # Composite index for fast lookups
    __table_args__ = (
        Index('ix_token_usage_user_date', 'user_id', 'date', unique=True),
    )
