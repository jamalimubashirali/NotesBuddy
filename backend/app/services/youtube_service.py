import re
from typing import Optional
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import HTTPException

class YouTubeService:
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        Extracts the video ID from a YouTube URL.
        Supports various formats:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        """
        # Regular expression for YouTube video ID
        regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
        match = re.search(regex, url)
        if match:
            return match.group(1)
        return None

    @staticmethod
    def get_transcript(video_id: str) -> str:
        """
        Fetches the transcript for a given video ID.
        Returns the transcript as a single string.
        """
        try:
            # transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            ytt_api = YouTubeTranscriptApi()
            transcript_list = ytt_api.fetch(video_id)
            
            # Combine all text parts into one string
            # The fetch method returns a list of FetchedTranscriptSnippet objects which have a .text attribute
            transcript_text = " ".join([snippet.text for snippet in transcript_list])
            return transcript_text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not retrieve transcript: {str(e)}")
