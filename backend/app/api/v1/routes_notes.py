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

@router.get("/{note_id}/chat/history")
async def get_chat_history(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat history for a specific note."""
    from app.models.chat_model import ChatMessage
    
    note = db.query(Notes).filter(Notes.id == note_id, Notes.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.note_id == note_id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at).all()
    
    return [{"role": msg.role, "content": msg.content, "created_at": msg.created_at} for msg in messages]

@router.post("/{note_id}/chat")
async def chat_with_note(
    note_id: int,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Chat with a specific note."""
    from app.models.chat_model import ChatMessage
    from app.models.token_usage_model import TokenUsage
    from datetime import date
    from app.core.config import settings
    
    note = db.query(Notes).filter(Notes.id == note_id, Notes.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Check daily token limit
    today = date.today()
    usage = db.query(TokenUsage).filter(
        TokenUsage.user_id == current_user.id,
        TokenUsage.date == today
    ).first()
    
    if usage and usage.tokens_used >= settings.DAILY_TOKEN_LIMIT:
        raise HTTPException(
            status_code=429, 
            detail=f"Daily token limit ({settings.DAILY_TOKEN_LIMIT}) exceeded. Try again tomorrow."
        )
    
    # Estimate input tokens (rough: ~4 chars = 1 token)
    input_tokens = len(chat_request.message) // 4
    
    # Save user message
    user_message = ChatMessage(
        note_id=note_id,
        user_id=current_user.id,
        role="user",
        content=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    # Stream response and collect full content
    async def generate_and_save():
        nonlocal usage  # Fix scope issue
        full_response = ""
        try:
            async for chunk in llm_service.chat_with_note(note.id, note.notes, chat_request.message):
                full_response += chunk
                yield chunk
            
            # Save assistant message
            assistant_message = ChatMessage(
                note_id=note_id,
                user_id=current_user.id,
                role="assistant",
                content=full_response
            )
            db.add(assistant_message)
            
            # Update token usage
            output_tokens = len(full_response) // 4
            total_tokens = input_tokens + output_tokens
            
            if usage:
                usage.tokens_used += total_tokens
            else:
                usage = TokenUsage(
                    user_id=current_user.id,
                    date=today,
                    tokens_used=total_tokens
                )
                db.add(usage)
            
            db.commit()
        except Exception as e:
            db.rollback()
            yield f"\n\nError: {str(e)}"
    
    return StreamingResponse(
        generate_and_save(),
        media_type="text/plain"
    )
