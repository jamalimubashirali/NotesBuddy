from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notes_model import NoteRequest, NoteResponse, NoteSummary, Notes
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
from app.models.token_usage_model import TokenUsage
from datetime import date
from app.core.config import settings

def check_token_limit(user_id: int, db: Session):
    today = date.today()
    usage = db.query(TokenUsage).filter(
        TokenUsage.user_id == user_id,
        TokenUsage.date == today
    ).first()
    
    if usage and usage.tokens_used >= settings.DAILY_TOKEN_LIMIT:
        raise HTTPException(
            status_code=429, 
            detail=f"Daily token limit ({settings.DAILY_TOKEN_LIMIT}) exceeded. Try again tomorrow."
        )
    return usage

def update_token_usage(user_id: int, tokens: int, db: Session):
    today = date.today()
    usage = db.query(TokenUsage).filter(
        TokenUsage.user_id == user_id,
        TokenUsage.date == today
    ).first()
    
    if usage:
        usage.tokens_used += tokens
    else:
        usage = TokenUsage(
            user_id=user_id,
            date=today,
            tokens_used=tokens
        )
        db.add(usage)
    db.commit()

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
        # Stream the existing content to match the generation behavior
        async def stream_existing():
            content = existing_note.notes
            chunk_size = 1024
            for i in range(0, len(content), chunk_size):
                yield content[i:i + chunk_size]
        
        return StreamingResponse(stream_existing(), media_type="text/plain")

    # 2. Check Token Limit
    check_token_limit(current_user.id, db)

    # 3. Get Transcript
    try:
        # Pass language preference to YouTube service
        transcript = YouTubeService.get_transcript(video_id, language=request.language)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")
    
    # Estimate input tokens (rough approximation)
    input_tokens = len(transcript) // 4

    # 4. Validate Content (Check if academic)
    try:
        is_academic = await llm_service.classify_content(transcript)
        if not is_academic:
            raise HTTPException(
                status_code=400, 
                detail="The video content does not appear to be academic or educational. Please try a different video."
            )
    except Exception as e:
        # If classification fails (e.g. API error), we might want to fail open or closed.
        # For now, if it's the HTTPException we just raised, re-raise it.
        if isinstance(e, HTTPException):
            raise e
        # Otherwise log and proceed (or fail)? Let's fail safe.
        print(f"Classification error: {e}")
        # Optional: raise HTTPException(status_code=500, detail="Error validating content")
    
    # 5. Generate Notes (Streaming)
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
                    # Extract title from content (first line starting with #)
                    import re
                    title_match = re.search(r'^#\s+(.+)$', full_content, re.MULTILINE)
                    ai_title = title_match.group(1).strip() if title_match else f"Notes for {video_id}"

                    new_note = Notes(
                        video_id=video_id, 
                        title=ai_title, 
                        notes=full_content,
                        transcript=transcript,
                        language=request.language,
                        style=request.style,
                        user_id=current_user.id
                    )
                    db.add(new_note)
                    db.commit()
                    db.refresh(new_note)
                    
                    # Store embeddings for RAG (Background Task)
                    try:
                        from app.services.vector_service import VectorService
                        from fastapi.concurrency import run_in_threadpool
                        import asyncio
                        
                        vector_service = VectorService()
                        # Run in background to avoid blocking the stream completion
                        # Run in background to avoid blocking the stream completion
                        asyncio.create_task(run_in_threadpool(vector_service.store_note_chunks, new_note.id, full_content, transcript))
                    except Exception as vec_e:
                        print(f"Error scheduling embeddings: {vec_e}")
                    
                    # Send the Note ID to the client
                    yield f"\n\n<!-- NOTE_ID: {new_note.id} -->"
                except Exception as db_e:
                    print(f"Error saving notes to DB: {db_e}")
                    
                    # Update token usage
                    output_tokens = len(full_content) // 4
                    total_tokens = input_tokens + output_tokens
                    try:
                        update_token_usage(current_user.id, total_tokens, db)
                    except Exception as token_e:
                        print(f"Error updating token usage: {token_e}")
                    
        except Exception as e:
            yield f"\n\nError generating notes: {str(e)}"

    return StreamingResponse(generate_and_save(), media_type="text/plain")

@router.get("/", response_model=List[NoteSummary])
async def get_user_notes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all notes for the current user with optimized fetching."""
    from sqlalchemy import func
    
    notes = db.query(
        Notes.id,
        Notes.title,
        Notes.video_id,
        Notes.created_at,
        Notes.language,
        Notes.style,
        func.substr(Notes.notes, 1, 200).label('notes_snippet')
    ).filter(
        Notes.user_id == current_user.id
    ).order_by(Notes.created_at.desc()).offset(skip).limit(limit).all()
    
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
    check_token_limit(current_user.id, db)
    
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
        # nonlocal usage  # No longer needed
        full_response = ""
        # Get previous chat history
        previous_messages = db.query(ChatMessage).filter(
            ChatMessage.note_id == note_id,
            ChatMessage.user_id == current_user.id
        ).order_by(ChatMessage.created_at).all()
        
        # Convert to list of dicts for service
        history_list = [{"role": msg.role, "content": msg.content} for msg in previous_messages]

        try:
            async for chunk in llm_service.chat_with_note(note.id, note.notes, chat_request.message, history_list):
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
            
            update_token_usage(current_user.id, total_tokens, db)
        except Exception as e:
            db.rollback()
            yield f"\n\nError: {str(e)}"
    
    return StreamingResponse(
        generate_and_save(),
        media_type="text/plain"
    )
