import os
from langchain_openai import AzureChatOpenAI
from langchain_core.runnables import RunnableBranch, RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings

class LLMService:
    def __init__(self):
        # Azure OpenAI Configuration
        self.api_key = settings.AZURE_OPENAI_API_KEY
        self.azure_endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.api_version = settings.AZURE_OPENAI_API_VERSION
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME

        if not all([self.api_key, self.azure_endpoint, self.api_version, self.deployment_name]):
            print("WARNING: Azure OpenAI environment variables are missing. LLM service might fail.")
        
        self.llm = AzureChatOpenAI(
            azure_deployment=self.deployment_name,
            openai_api_version=self.api_version,
            api_key=self.api_key,
            azure_endpoint=self.azure_endpoint,
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
            
            Please generate notes in Markdown format with the following structure:
            # Title
            ## Summary
            ## Key Concepts
            - Concept 1
            - Concept 2
            ## Detailed Notes
            (Bulleted list or paragraphs)
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
            {"transcript": RunnablePassthrough(), "classification": classifier_chain}
            | branch
        )

    async def generate_notes(self, transcript: str) -> str:
        try:
            return await self.chain.ainvoke({"transcript": transcript})
        except Exception as e:
            return f"Error generating notes: {str(e)}"
