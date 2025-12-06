from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notes_model import NoteRequest, NoteResponse, Notes
from app.services.youtube_service import YouTubeService
from app.services.llm_service import LLMService
from datetime import datetime

router = APIRouter()
llm_service = LLMService()

from typing import List
from app.core.auth import get_current_user
# from app.services.user_service import get_user_by_id
from app.models.user_pref_model import User

from fastapi.responses import StreamingResponse
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

@router.post("/generate")
async def generate_notes(
    request: NoteRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Extract Video ID
    video_id = YouTubeService.extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # Check DB for existing notes for THIS user
    existing_note = db.query(Notes).filter(
        Notes.video_id == video_id,
        Notes.language == request.language,
        Notes.style == request.style,
        Notes.user_id == current_user.id
    ).first()
    
    if existing_note:
        # If exists, we can't stream it easily in the same format as generation
        # So we'll just return it as a JSON response, but frontend needs to handle this.
        # Ideally, we should stream the existing content too for consistency, or handle it in frontend.
        # For now, let's return a JSON response and let frontend check content-type.
        return existing_note

    # 2. Get Transcript
    try:
        # Pass language preference to YouTube service
        transcript = YouTubeService.get_transcript(video_id, language=request.language)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")
    
    # 3. Generate Notes (Streaming)
    async def generate_and_save():
        full_content = ""
        try:
            async for chunk in llm_service.generate_notes_stream(
                transcript, 
                language=request.language, 
                style=request.style
            ):
                full_content += chunk
                yield chunk
            
            # After streaming is done, save to DB
            if "NON_ACADEMIC_CONTENT" not in full_content:
                try:
                    new_note = Notes(
                        video_id=video_id, 
                        title=f"Notes for {video_id}", 
                        notes=full_content,
                        language=request.language,
                        style=request.style,
                        user_id=current_user.id
                    )
                    db.add(new_note)
                    db.commit()
                    db.refresh(new_note)
                    
                    # Store embeddings for RAG
                    try:
                        from app.services.vector_service import VectorService
                        vector_service = VectorService()
                        vector_service.store_note_chunks(new_note.id, full_content)
                    except Exception as vec_e:
                        print(f"Error storing embeddings: {vec_e}")
                except Exception as db_e:
                    print(f"Error saving notes to DB: {db_e}")
                    
        except Exception as e:
            yield f"\n\nError generating notes: {str(e)}"

    return StreamingResponse(generate_and_save(), media_type="text/plain")

@router.get("/", response_model=List[NoteResponse])
async def get_user_notes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all notes for the current user."""
    notes = db.query(Notes).filter(Notes.user_id == current_user.id).offset(skip).limit(limit).all()
    return notes

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific note by ID."""
    note = db.query(Notes).filter(Notes.id == note_id, Notes.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.post("/{note_id}/chat")
async def chat_with_note(
    note_id: int,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Chat with a specific note."""
    note = db.query(Notes).filter(Notes.id == note_id, Notes.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    return StreamingResponse(
        llm_service.chat_with_note(note.id, note.notes, chat_request.message),
        media_type="text/plain"
    )
