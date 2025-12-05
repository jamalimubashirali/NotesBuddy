import asyncio
from app.services.llm_service import LLMService

async def test_openrouter():
    print("Initializing LLMService...")
    try:
        service = LLMService()
        print("LLMService initialized.")
        
        transcript = "This is a short educational video about photosynthesis. Plants use sunlight to convert carbon dioxide and water into glucose and oxygen."
        print(f"\nTesting generation with transcript: {transcript[:50]}...")
        
        notes = await service.generate_notes(transcript, language="en", style="summary")
        
        print("\n--- Generated Notes ---")
        print(notes)
        print("-----------------------")
        
        if "Error" in notes:
            print("FAILED: Generation returned an error.")
        else:
            print("SUCCESS: Notes generated.")
            
    except Exception as e:
        print(f"FAILED: Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_openrouter())
