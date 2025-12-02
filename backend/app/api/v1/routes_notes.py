from fastapi import APIRouter, HTTPException, Depends
from app.models.notes_model import NoteRequest, NoteResponse
from app.services.youtube_service import YouTubeService
from app.services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()

@router.post("/generate", response_model=NoteResponse)
async def generate_notes(request: NoteRequest):
    # 1. Extract Video ID
    video_id = YouTubeService.extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # 2. Get Transcript
    try:
        transcript = YouTubeService.get_transcript(video_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")
    
    # 3. Generate Notes
    notes = await llm_service.generate_notes(transcript)

    if "NON_ACADEMIC_CONTENT" in notes:
        raise HTTPException(
            status_code=422, 
            detail="This video does not appear to be academic or educational. NotesBuddy only generates notes for educational content."
        )

    return NoteResponse(video_id=video_id, notes=notes)
