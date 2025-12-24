import os
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableBranch, RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.prompts.llm_prompts import (
    CLASSIFICATION_PROMPT,
    NOTE_GENERATION_PROMPT,
    CHUNK_GENERATION_PROMPT,
    COMBINE_PROMPT,
    CHAT_WITH_NOTES_PROMPT
)

import asyncio

class LLMService:
    def __init__(self):
        # OpenRouter Configuration
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = "https://openrouter.ai/api/v1"
        
        # Concurrency Control
        self.semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_REQUESTS)

        if not self.api_key:
            print("WARNING: OPENROUTER_API_KEY is missing. LLM service might fail.")
        
        self.llm = ChatOpenAI(
            model=self.model,
            openai_api_key=self.api_key,
            openai_api_base=self.base_url,
            temperature=0.7
        )
        
        # 1. Classification Chain
        # 1. Classification Chain
        classifier_prompt = ChatPromptTemplate.from_template(CLASSIFICATION_PROMPT)
        self.classifier_chain = classifier_prompt | self.llm | StrOutputParser()

        # 2. Generation Chain
        # 2. Generation Chain (for short videos)
        generator_prompt = ChatPromptTemplate.from_template(NOTE_GENERATION_PROMPT)
        self.generator_chain = generator_prompt | self.llm | StrOutputParser()

        # 3. Chunk Processing Chain
        chunk_prompt = ChatPromptTemplate.from_template(CHUNK_GENERATION_PROMPT)
        self.chunk_chain = chunk_prompt | self.llm | StrOutputParser()

        # 4. Combination Chain
        combine_prompt = ChatPromptTemplate.from_template(COMBINE_PROMPT)
        self.combine_chain = combine_prompt | self.llm | StrOutputParser()

    async def classify_content(self, transcript: str) -> bool:
        """
        Classify if the content is academic/educational.
        Returns True if academic, False otherwise.
        """
        async with self.semaphore:
            result = await self.classifier_chain.ainvoke({"transcript": transcript})
            return "YES" in result.upper()

    def check_transcript_length(self, transcript: str) -> None:
        # Approx 4 chars per token. Limit to ~30k tokens for safety
        if len(transcript) > 120000:
            raise ValueError("Transcript is too long (approx > 30k tokens). Please use a shorter video.")

    def chunk_transcript(self, transcript: str, chunk_size: int = 15000, overlap: int = 1000) -> list[str]:
        """Split transcript into overlapping chunks."""
        chunks = []
        start = 0
        while start < len(transcript):
            end = start + chunk_size
            chunks.append(transcript[start:end])
            start = end - overlap
        return chunks

    async def process_chunk(self, chunk: str, index: int, total: int, language: str) -> str:
        """Process a single chunk asynchronously."""
        async with self.semaphore:
            return await self.chunk_chain.ainvoke({
                "transcript": chunk,
                "chunk_index": index + 1,
                "total_chunks": total,
                "language": language
            })

    async def chat_with_note(self, note_id: int, note_content: str, user_message: str, chat_history: list = []):
        """Chat with a note using RAG to retrieve relevant context."""
        async with self.semaphore:
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
            
            # Format chat history
            formatted_history = ""
            for msg in chat_history:
                role = "Student" if msg["role"] == "user" else "Assistant"
                formatted_history += f"{role}: {msg['content']}\n"
            
            if not formatted_history:
                formatted_history = "No previous history."

            prompt = ChatPromptTemplate.from_template(CHAT_WITH_NOTES_PROMPT)
            
            chain = prompt | self.llm | StrOutputParser()
            
            async for chunk in chain.astream({
                "context": context, 
                "user_message": user_message,
                "chat_history": formatted_history
            }):
                yield chunk

    async def generate_notes_stream(self, transcript: str, language: str = "en", style: str = "detailed"):
        self.check_transcript_length(transcript)
        
        # 2. Generate Notes
        async with self.semaphore:
            async for chunk in self.generator_chain.astream({
                "transcript": transcript,
                "language": language,
                "style": style
            }):
                yield chunk

    async def generate_notes(self, transcript: str, language: str = "en", style: str = "detailed") -> str:
        self.check_transcript_length(transcript)
        self.check_transcript_length(transcript)
        
        # Determine if chunking is needed (e.g., > 15k chars)
        if len(transcript) > 15000:
            chunks = self.chunk_transcript(transcript)
            total_chunks = len(chunks)
            print(f"Transcript length: {len(transcript)}. Splitting into {total_chunks} chunks.")
            
            # Process chunks in parallel
            tasks = [self.process_chunk(chunk, i, total_chunks, language) for i, chunk in enumerate(chunks)]
            chunk_results = await asyncio.gather(*tasks)
            
            # Combine results
            combined_text = "\n\n".join(chunk_results)
            
            async with self.semaphore:
                return await self.combine_chain.ainvoke({
                    "combined_text": combined_text,
                    "language": language,
                    "style": style
                })
        else:
            # Process as a single unit
            async with self.semaphore:
                return await self.generator_chain.ainvoke({
                    "transcript": transcript,
                    "language": language,
                    "style": style
                })
