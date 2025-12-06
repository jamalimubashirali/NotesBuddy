from pydantic import BaseModel, HttpUrl
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

class Notes(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, nullable=False, index=True) # Removed unique=True to allow multiple notes per video (diff lang/style)
    title = Column(String, nullable=False)
    notes = Column(String, nullable=False)
    language = Column(String, default="en")
    style = Column(String, default="detailed")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NoteCreate(BaseModel):
    video_id: str
    title: str
    notes: str
    language: str = "en"
    style: str = "detailed"

class NoteUpdate(BaseModel):
    title: str | None = None
    notes: str | None = None

class NoteInDB(NoteCreate):
    id: int
    created_at: datetime
    updated_at: datetime

class NoteRequest(BaseModel):
    url: str
    language: str = "en"
    style: str = "detailed"

class NoteResponse(BaseModel):
    id: int
    video_id: str
    title: str
    notes: str
    language: str
    style: str
    created_at: datetime
