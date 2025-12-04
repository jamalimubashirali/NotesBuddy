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
    def get_transcript(video_id: str, language: str = "en") -> str:
        """
        Fetches the transcript for a given video ID.
        Returns the transcript as a single string.
        """
        try:
            print(f"DEBUG: Getting transcript for {video_id} in {language}")
            ytt_api = YouTubeTranscriptApi()
            transcript_list = ytt_api.list(video_id)
            
            transcript = None
            
            # 1. Try fetching transcript in requested language
            try:
                print(f"DEBUG: Step 1 - Trying {language}")
                transcript = transcript_list.find_transcript([language])
                print("DEBUG: Step 1 success")
            except Exception as e:
                print(f"DEBUG: Step 1 failed: {e}")
                # 2. If not found, try English
                try:
                    print("DEBUG: Step 2 - Trying English")
                    transcript = transcript_list.find_transcript(['en', 'en-US'])
                    print("DEBUG: Step 2 success")
                except Exception as e:
                    print(f"DEBUG: Step 2 failed: {e}")
                    # 3. If not found, just take the first available one
                    try:
                        print("DEBUG: Step 3 - Trying any available")
                        # iterate to get the first one
                        for t in transcript_list:
                            transcript = t
                            break
                        if transcript:
                            print(f"DEBUG: Step 3 success: Found {transcript.language_code}")
                    except Exception as e:
                        print(f"DEBUG: Step 3 failed: {e}")
                        raise Exception("No transcripts available for this video.")
            
            if not transcript:
                 raise Exception("No transcripts available for this video.")

            # Fetch the actual transcript data
            # transcript.fetch() returns a list of FetchedTranscriptSnippet objects
            fetched_transcript = transcript.fetch()
            
            transcript_text = " ".join([snippet.text for snippet in fetched_transcript])
            return transcript_text
        except Exception as e:
            print(f"DEBUG: Outer exception: {e}")
            raise HTTPException(status_code=400, detail=f"Could not retrieve transcript: {str(e)}")
