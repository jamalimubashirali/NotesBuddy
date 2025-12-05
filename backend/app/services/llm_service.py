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

    async def generate_notes(self, transcript: str, language: str = "en", style: str = "detailed") -> str:
        # Let exceptions propagate to the controller for proper error handling
        return await self.chain.ainvoke({
            "transcript": transcript,
            "language": language,
            "style": style
        })
