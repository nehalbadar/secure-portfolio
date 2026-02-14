"""Embeddings Module

Generates BioBERT embeddings for medical text.
"""

_SENTENCE_TRANSFORMERS_IMPORT_ERROR: Exception | None = None
try:
    from sentence_transformers import SentenceTransformer  # type: ignore
except Exception as exc:  # pragma: no cover
    SentenceTransformer = None  # type: ignore
    _SENTENCE_TRANSFORMERS_IMPORT_ERROR = exc
import numpy as np
from typing import List, Union

_TORCH_IMPORT_ERROR: Exception | None = None
try:
    import torch  # type: ignore
except Exception as exc:  # pragma: no cover
    torch = None  # type: ignore
    _TORCH_IMPORT_ERROR = exc


class BioBERTEmbeddings:
    """Generate medical domain-specific embeddings using BioBERT"""
    
    def __init__(self, model_name: str = 'pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb'):
        """
        Initialize BioBERT model for embedding generation
        
        Args:
            model_name: HuggingFace model identifier for BioBERT
        """
        if torch is None:  # pragma: no cover
            raise ModuleNotFoundError(
                "Missing dependency: torch.\n\n"
                "It looks like you're running the app with a different Python (often Python 3.14), "
                "not the 'medical-rag-ai' conda env where torch is installed.\n\n"
                "Fix (recommended):\n"
                "  conda run -n medical-rag-ai python -m streamlit run .\\app.py\n\n"
                "Or install torch into the current Python (not recommended for 3.14):\n"
                "  python -m pip install torch"
            ) from _TORCH_IMPORT_ERROR

        print(f"Loading BioBERT model: {model_name}")
        
        # Check if CUDA is available
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {self.device}")
        
        if SentenceTransformer is None:  # pragma: no cover
            raise ModuleNotFoundError(
                "Missing dependency: sentence-transformers.\n\n"
                "Fix: run the app using the 'medical-rag-ai' conda env:\n"
                "  conda run -n medical-rag-ai python -m streamlit run .\\app.py\n\n"
                "Or install it into the current Python:\n"
                "  python -m pip install sentence-transformers"
            ) from _SENTENCE_TRANSFORMERS_IMPORT_ERROR

        # Load model
        self.model = SentenceTransformer(model_name)
        self.model.to(self.device)
        
        # Get embedding dimension
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"✓ Model loaded. Embedding dimension: {self.embedding_dim}")
    
    def encode_text(
        self,
        text: Union[str, List[str]],
        show_progress: bool = True,
        batch_size: int = 8,
    ) -> np.ndarray:
        """
        Generate embeddings for text or list of texts
        
        Args:
            text: Single text string or list of text strings
            show_progress: Show progress bar for batch encoding
            
        Returns:
            NumPy array of embeddings
        """
        # Ensure input is a list
        if isinstance(text, str):
            text = [text]
        
        # Generate embeddings
        embeddings = self.model.encode(
            text,
            show_progress_bar=show_progress,
            convert_to_numpy=True,
            batch_size=int(batch_size)
        )
        
        return embeddings
    
    def encode_documents(self, documents: List[dict]) -> tuple:
        """
        Encode a list of document chunks with metadata
        
        Args:
            documents: List of document dictionaries with 'text' field
            
        Returns:
            Tuple of (embeddings array, documents list)
        """
        print(f"\nGenerating embeddings for {len(documents)} documents...")
        
        # Extract text from documents
        texts = [doc['text'] for doc in documents]
        
        # Generate embeddings
        embeddings = self.encode_text(texts, show_progress=True)
        
        print(f"✓ Generated {len(embeddings)} embeddings")
        print(f"  Shape: {embeddings.shape}")
        
        return embeddings, documents
    
    def get_query_embedding(self, query: str) -> np.ndarray:
        """
        Generate embedding for a single query
        
        Args:
            query: Query text
            
        Returns:
            Query embedding as NumPy array
        """
        return self.encode_text(query, show_progress=False)[0]
    
    def calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score (0-1)
        """
        # Normalize vectors
        embedding1_norm = embedding1 / np.linalg.norm(embedding1)
        embedding2_norm = embedding2 / np.linalg.norm(embedding2)
        
        # Calculate cosine similarity
        similarity = np.dot(embedding1_norm, embedding2_norm)
        
        return float(similarity)


if __name__ == "__main__":
    # Test the embeddings module
    print("Testing BioBERT Embeddings...")
    
    embedder = BioBERTEmbeddings()
    
    # Test medical texts
    medical_texts = [
        "Diabetes mellitus is characterized by elevated blood glucose levels.",
        "Hypertension is high blood pressure that can lead to heart disease.",
        "Cancer involves uncontrolled cell growth and division."
    ]
    
    print("\nEncoding medical texts...")
    embeddings = embedder.encode_text(medical_texts)
    
    print(f"\nGenerated embeddings shape: {embeddings.shape}")
    print(f"Embedding dimension: {embedder.embedding_dim}")
    
    # Test query
    query = "What causes high blood sugar?"
    query_embedding = embedder.get_query_embedding(query)
    
    print(f"\nQuery embedding shape: {query_embedding.shape}")
    
    # Calculate similarities
    print("\nSimilarity scores:")
    for i, text in enumerate(medical_texts):
        similarity = embedder.calculate_similarity(query_embedding, embeddings[i])
        print(f"  {text[:50]}... → {similarity:.3f}")
