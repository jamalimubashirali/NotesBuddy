from pydantic import BaseModel, HttpUrl

class NoteRequest(BaseModel):
    url: str

class NoteResponse(BaseModel):
    video_id: str
    notes: str
