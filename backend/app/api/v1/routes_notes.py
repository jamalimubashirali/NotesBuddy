from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notes_model import NoteRequest, NoteResponse, Notes
from app.services.youtube_service import YouTubeService
from app.services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()

@router.post("/generate", response_model=NoteResponse)
async def generate_notes(request: NoteRequest, db: Session = Depends(get_db)):
    # 1. Extract Video ID
    video_id = YouTubeService.extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # Check DB for existing notes
    existing_note = db.query(Notes).filter(
        Notes.video_id == video_id,
        Notes.language == request.language,
        Notes.style == request.style
    ).first()
    
    if existing_note:
        return NoteResponse(
            video_id=video_id, 
            notes=existing_note.notes,
            language=existing_note.language,
            style=existing_note.style
        )

    # 2. Get Transcript
    try:
        # Pass language preference to YouTube service
        transcript = YouTubeService.get_transcript(video_id, language=request.language)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")
    
    # 3. Generate Notes
    try:
        notes_content = await llm_service.generate_notes(
            transcript, 
            language=request.language, 
            style=request.style
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notes: {str(e)}")

    if "NON_ACADEMIC_CONTENT" in notes_content:
        raise HTTPException(
            status_code=422, 
            detail="This video does not appear to be academic or educational. NotesBuddy only generates notes for educational content."
        )

    # Save to DB
    try:
        new_note = Notes(
            video_id=video_id, 
            title=f"Notes for {video_id}", 
            notes=notes_content,
            language=request.language,
            style=request.style
        )
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
    except Exception as e:
        print(f"Error saving notes to DB: {e}")
        # Continue even if save fails, so user gets their notes

    return NoteResponse(
        video_id=video_id, 
        notes=notes_content,
        language=request.language,
        style=request.style
    )
