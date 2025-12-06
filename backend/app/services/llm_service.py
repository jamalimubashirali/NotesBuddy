import os
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableBranch, RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings

class LLMService:
    def __init__(self):
        # OpenRouter Configuration
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = "https://openrouter.ai/api/v1"

        if not self.api_key:
            print("WARNING: OPENROUTER_API_KEY is missing. LLM service might fail.")
        
        self.llm = ChatOpenAI(
            model=self.model,
            openai_api_key=self.api_key,
            openai_api_base=self.base_url,
            temperature=0.7
        )
        
        # 1. Classification Chain
        classifier_prompt = ChatPromptTemplate.from_template(
            """
            Analyze the following transcript. Is it educational, academic, or technically informative?
            
            CRITERIA FOR "NON_ACADEMIC":
            - Music videos / Song lyrics
            - Gaming / Let's Play
            - Vlogs / Personal stories without educational value
            - Pranks / Comedy sketches
            - Pure entertainment
            
            Answer ONLY with "YES" if it is academic/educational, or "NO" if it is non-academic.
            
            Transcript:
            {transcript}
            """
        )
        classifier_chain = classifier_prompt | self.llm | StrOutputParser()

        # 2. Generation Chain
        generator_prompt = ChatPromptTemplate.from_template(
            """
            You are an expert academic assistant. Your goal is to create comprehensive, well-structured notes from the provided video transcript.
            
            Transcript:
            {transcript}
            
            Please generate notes in {language} language with a "{style}" style.
            
            If style is "detailed":
            - Provide comprehensive explanations.
            - Include examples if available.
            
            If style is "summary":
            - Provide a concise overview.
            - Focus on main points only.
            
            If style is "bullet points":
            - Use bullet points for almost everything.
            - Keep it structured and easy to scan.
            
            Structure the notes as follows:
            # Title
            ## Summary
            ## Key Concepts
            ## Detailed Notes
            ## Conclusion
            """
        )
        generator_chain = generator_prompt | self.llm | StrOutputParser()

        # 3. Branching Logic
        # If classifier says "NO", return "NON_ACADEMIC_CONTENT"
        # If classifier says "YES", run generator_chain
        
        branch = RunnableBranch(
            (lambda x: "NO" in x["classification"].upper(), RunnableLambda(lambda x: "NON_ACADEMIC_CONTENT")),
            generator_chain
        )

        # 4. Final Chain
        # We need to pass the transcript to both classifier and the branch
        self.chain = (
            RunnablePassthrough.assign(classification=classifier_chain)
            | branch
        )

    def check_transcript_length(self, transcript: str) -> None:
        # Approx 4 chars per token. Limit to ~30k tokens for safety
        if len(transcript) > 120000:
            raise ValueError("Transcript is too long (approx > 30k tokens). Please use a shorter video.")

    async def chat_with_note(self, note_id: int, note_content: str, user_message: str):
        """Chat with a note using RAG to retrieve relevant context."""
        from app.services.vector_service import VectorService
        
        vector_service = VectorService()
        
        # Retrieve relevant chunks from the note
        relevant_chunks = vector_service.retrieve_relevant_chunks(note_id, user_message, n_results=3)
        
        # Build context from relevant chunks
        if relevant_chunks:
            context = "\n\n".join([f"Relevant excerpt {i+1}:\n{chunk}" for i, (chunk, score) in enumerate(relevant_chunks)])
        else:
            # Fallback to full note if no chunks found (first time)
            context = note_content
        
        prompt = ChatPromptTemplate.from_template(
            """You are a helpful assistant. You have access to the following notes:
            
{context}

User Question: {user_message}

Answer the question based on the notes provided. Be concise and specific."""
        )
        
        chain = prompt | self.llm | StrOutputParser()
        
        async for chunk in chain.astream({"context": context, "user_message": user_message}):
            yield chunk

    async def generate_notes_stream(self, transcript: str, language: str = "en", style: str = "detailed"):
        self.check_transcript_length(transcript)
        async for chunk in self.chain.astream({
            "transcript": transcript,
            "language": language,
            "style": style
        }):
            yield chunk

    async def generate_notes(self, transcript: str, language: str = "en", style: str = "detailed") -> str:
        self.check_transcript_length(transcript)
        return await self.chain.ainvoke({
            "transcript": transcript,
            "language": language,
            "style": style
        })
