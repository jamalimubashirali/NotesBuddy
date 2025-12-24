from typing import List, Tuple
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import os

class VectorService:
    """Service for document chunking and vector storage using ChromaDB."""
    
    def __init__(self):
        # Initialize sentence transformer for embeddings
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"WARNING: Failed to load embedding model: {e}")
            self.embedding_model = None
        
        # Initialize ChromaDB client with persistent storage
        chroma_path = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
        os.makedirs(chroma_path, exist_ok=True)
        
        self.chroma_client = chromadb.Client(Settings(
            persist_directory=chroma_path,
            anonymized_telemetry=False
        ))
        
        # Initialize text splitter for document chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def chunk_document(self, text: str) -> List[str]:
        """Split a document into chunks."""
        chunks = self.text_splitter.split_text(text)
        return chunks
    
    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for a list of texts."""
        if not self.embedding_model:
            return []
        embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    
    def store_note_chunks(self, note_id: int, note_content: str, transcript: str = None) -> None:
        """Chunk a note (and optional transcript) and store it in ChromaDB with embeddings."""
        if not self.embedding_model:
            print("Skipping vector storage: Embedding model not loaded.")
            return

        # Create or get collection for this note
        collection_name = f"note_{note_id}"
        
        # Delete existing collection if it exists
        try:
            self.chroma_client.delete_collection(name=collection_name)
        except:
            pass
        
        collection = self.chroma_client.create_collection(
            name=collection_name,
            metadata={"note_id": note_id}
        )
        
        # 1. Process Note Content
        note_chunks = self.chunk_document(note_content)
        note_embeddings = self.create_embeddings(note_chunks)
        
        # Store Note Chunks
        if note_chunks:
            collection.add(
                embeddings=note_embeddings,
                documents=note_chunks,
                metadatas=[{"source": "note", "type": "summary"} for _ in note_chunks],
                ids=[f"note_chunk_{i}" for i in range(len(note_chunks))]
            )
            
        # 2. Process Transcript (if provided)
        if transcript:
            transcript_chunks = self.chunk_document(transcript)
            transcript_embeddings = self.create_embeddings(transcript_chunks)
            
            if transcript_chunks:
                collection.add(
                    embeddings=transcript_embeddings,
                    documents=transcript_chunks,
                    metadatas=[{"source": "transcript", "type": "raw"} for _ in transcript_chunks],
                    ids=[f"transcript_chunk_{i}" for i in range(len(transcript_chunks))]
                )
    
    def retrieve_relevant_chunks(
        self, 
        note_id: int, 
        query: str, 
        n_results: int = 3
    ) -> List[Tuple[str, float]]:
        """Retrieve the most relevant chunks for a query."""
        collection_name = f"note_{note_id}"
        
        try:
            collection = self.chroma_client.get_collection(name=collection_name)
        except:
            # Collection doesn't exist, return empty list
            return []
        
        # Create query embedding
        if not self.embedding_model:
            return []
            
        query_embedding = self.create_embeddings([query])[0]
        
        # Query the collection
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, collection.count())
        )
        
        # Return chunks with their distances
        chunks_with_scores = []
        if results['documents'] and len(results['documents']) > 0:
            for doc, distance in zip(results['documents'][0], results['distances'][0]):
                chunks_with_scores.append((doc, 1 - distance))  # Convert distance to similarity
        
        return chunks_with_scores
    
    def delete_note_collection(self, note_id: int) -> None:
        """Delete the vector collection for a note."""
        collection_name = f"note_{note_id}"
        try:
            self.chroma_client.delete_collection(name=collection_name)
        except:
            pass
