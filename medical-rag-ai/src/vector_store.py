"""Vector Store Module

Uses FAISS when available; falls back to a NumPy brute-force search when FAISS
isn't installed (common on Windows pip). The public API stays the same.
"""

from __future__ import annotations

try:
    import faiss  # type: ignore
    _HAS_FAISS = True
except Exception:
    faiss = None  # type: ignore
    _HAS_FAISS = False

import numpy as np
import pickle
import os
from typing import List, Tuple, Dict


class FAISSVectorStore:
    """FAISS-based vector store for semantic search"""
    
    def __init__(self, embedding_dim: int = 768):
        """
        Initialize FAISS vector store
        
        Args:
            embedding_dim: Dimension of embedding vectors
        """
        self.embedding_dim = embedding_dim
        self.index = None
        self.documents = []
        self._embeddings = None  # used for NumPy fallback
        self.is_trained = False
    
    def create_index(self, embeddings: np.ndarray, documents: List[Dict]):
        """
        Create FAISS index from embeddings
        
        Args:
            embeddings: NumPy array of embeddings
            documents: List of document dictionaries
        """
        print(f"\nCreating FAISS index...")
        print(f"  Embeddings shape: {embeddings.shape}")
        print(f"  Number of documents: {len(documents)}")
        
        # Ensure embeddings are float32
        embeddings = embeddings.astype('float32')

        if _HAS_FAISS:
            # Create index - using IndexFlatL2 for exact search
            # For larger datasets, consider IndexIVFFlat for approximate search
            self.index = faiss.IndexFlatL2(self.embedding_dim)  # type: ignore[attr-defined]
            self.index.add(embeddings)
        else:
            # NumPy fallback (exact brute-force L2). Fine for demos/small corpora.
            self.index = None
            self._embeddings = embeddings
        
        # Store documents
        self.documents = documents
        self.is_trained = True

        total = int(self.index.ntotal) if _HAS_FAISS else int(self._embeddings.shape[0])
        engine = "FAISS" if _HAS_FAISS else "NumPy"
        print(f"✓ Vector index created with {total} vectors ({engine})")
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict]:
        """
        Search for similar documents using query embedding
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of top results to return
            
        Returns:
            List of dictionaries with results and scores
        """
        if not self.is_trained:
            raise ValueError("Index not created. Call create_index() first.")
        
        # Ensure query embedding is float32
        query_embedding = query_embedding.astype('float32').reshape(-1)

        if _HAS_FAISS:
            query_2d = query_embedding.reshape(1, -1)
            distances, indices = self.index.search(query_2d, top_k)
            distances = distances[0]
            indices = indices[0]
        else:
            if self._embeddings is None:
                raise ValueError("Index not created. Call create_index() first.")
            # Compute L2 distances to all vectors
            diffs = self._embeddings - query_embedding.reshape(1, -1)
            distances_all = np.sum(diffs * diffs, axis=1)
            indices = np.argsort(distances_all)[:top_k]
            distances = distances_all[indices]
        
        # Prepare results
        results = []
        for i, (distance, idx) in enumerate(zip(distances, indices)):
            if idx < len(self.documents):
                result = {
                    'rank': i + 1,
                    'document': self.documents[idx],
                    'distance': float(distance),
                    'similarity': float(1 / (1 + distance))  # Convert distance to similarity
                }
                results.append(result)
        
        return results
    
    def save_index(self, directory: str):
        """
        Save FAISS index and documents to disk
        
        Args:
            directory: Directory to save index files
        """
        if not self.is_trained:
            raise ValueError("Index not created. Nothing to save.")
        
        # Create directory if it doesn't exist
        os.makedirs(directory, exist_ok=True)
        
        if _HAS_FAISS:
            index_path = os.path.join(directory, 'faiss.index')
            faiss.write_index(self.index, index_path)  # type: ignore[attr-defined]
        else:
            embeddings_path = os.path.join(directory, 'embeddings.npy')
            if self._embeddings is None:
                raise ValueError("No embeddings present to save.")
            np.save(embeddings_path, self._embeddings)
        
        # Save documents
        docs_path = os.path.join(directory, 'documents.pkl')
        with open(docs_path, 'wb') as f:
            pickle.dump(self.documents, f)

        engine = "FAISS" if _HAS_FAISS else "NumPy"
        print(f"✓ Index saved to {directory} ({engine})")
    
    def load_index(self, directory: str):
        """
        Load FAISS index and documents from disk
        
        Args:
            directory: Directory containing index files
        """
        if _HAS_FAISS and os.path.exists(os.path.join(directory, 'faiss.index')):
            index_path = os.path.join(directory, 'faiss.index')
            self.index = faiss.read_index(index_path)  # type: ignore[attr-defined]
            self._embeddings = None
        else:
            embeddings_path = os.path.join(directory, 'embeddings.npy')
            if not os.path.exists(embeddings_path):
                raise FileNotFoundError(
                    f"No saved index found in {directory}. Expected 'faiss.index' or 'embeddings.npy'."
                )
            self._embeddings = np.load(embeddings_path).astype('float32')
            self.index = None
        
        # Load documents
        docs_path = os.path.join(directory, 'documents.pkl')
        with open(docs_path, 'rb') as f:
            self.documents = pickle.load(f)
        
        self.is_trained = True

        total = int(self.index.ntotal) if _HAS_FAISS and self.index is not None else int(self._embeddings.shape[0])
        engine = "FAISS" if _HAS_FAISS and self.index is not None else "NumPy"
        print(f"✓ Index loaded from {directory} ({engine})")
        print(f"  Total vectors: {total}")
        print(f"  Total documents: {len(self.documents)}")
    
    def get_stats(self) -> Dict:
        """
        Get statistics about the vector store
        
        Returns:
            Dictionary with store statistics
        """
        if not self.is_trained:
            return {"status": "not_initialized"}
        
        total_vectors = (
            int(self.index.ntotal)
            if _HAS_FAISS and self.index is not None
            else (int(self._embeddings.shape[0]) if self._embeddings is not None else 0)
        )
        index_type = (type(self.index).__name__ if self.index is not None else "NumPyBruteForce")

        return {
            "status": "initialized",
            "total_vectors": total_vectors,
            "total_documents": len(self.documents),
            "embedding_dimension": self.embedding_dim,
            "index_type": index_type
        }


if __name__ == "__main__":
    # Test the vector store
    print("Testing FAISS Vector Store...")
    
    # Create sample embeddings and documents
    np.random.seed(42)
    sample_embeddings = np.random.randn(10, 768).astype('float32')
    
    sample_docs = [
        {'text': f'Document {i}', 'source': f'doc{i}.pdf', 'chunk_id': i}
        for i in range(10)
    ]
    
    # Create vector store
    store = FAISSVectorStore(embedding_dim=768)
    store.create_index(sample_embeddings, sample_docs)
    
    # Test search
    query_embedding = np.random.randn(768).astype('float32')
    results = store.search(query_embedding, top_k=3)
    
    print("\nSearch results:")
    for result in results:
        print(f"  Rank {result['rank']}: {result['document']['text']} "
              f"(similarity: {result['similarity']:.3f})")
    
    # Test save/load
    test_dir = 'test_index'
    store.save_index(test_dir)
    
    new_store = FAISSVectorStore(embedding_dim=768)
    new_store.load_index(test_dir)
    
    print("\nVector store stats:")
    print(new_store.get_stats())
    
    # Cleanup
    import shutil
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir)
        print(f"\n✓ Cleaned up test directory")
