"""
RAG Pipeline Module
Combines retrieval and generation for answering medical queries
"""

from typing import List, Dict, Tuple
import numpy as np
from src.embeddings import BioBERTEmbeddings
from src.vector_store import FAISSVectorStore


class RAGPipeline:
    """Retrieval-Augmented Generation pipeline for medical Q&A"""
    
    def __init__(self, embeddings_model: BioBERTEmbeddings, vector_store: FAISSVectorStore):
        """
        Initialize RAG pipeline
        
        Args:
            embeddings_model: BioBERT embeddings model
            vector_store: FAISS vector store
        """
        self.embeddings = embeddings_model
        self.vector_store = vector_store
    
    def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Retrieve relevant context for a query
        
        Args:
            query: User query string
            top_k: Number of relevant passages to retrieve
            
        Returns:
            List of relevant document chunks with metadata
        """
        # Generate query embedding
        query_embedding = self.embeddings.get_query_embedding(query)
        
        # Search vector store
        results = self.vector_store.search(query_embedding, top_k=top_k)
        
        return results
    
    def format_context(self, retrieved_docs: List[Dict]) -> str:
        """
        Format retrieved documents into context string
        
        Args:
            retrieved_docs: List of retrieved document dictionaries
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for i, doc_result in enumerate(retrieved_docs, 1):
            doc = doc_result['document']
            similarity = doc_result['similarity']
            
            context_parts.append(
                f"[Source {i}: {doc['source']}, Chunk {doc['chunk_id'] + 1}, "
                f"Relevance: {similarity:.2f}]\n{doc['text']}"
            )
        
        return "\n\n".join(context_parts)
    
    def generate_answer(self, query: str, context: str) -> str:
        """
        Generate answer based on query and context
        
        Note: This is a simplified version. For production, integrate with
        an LLM (GPT, Claude, or local model) for actual generation.
        
        Args:
            query: User query
            context: Retrieved context
            
        Returns:
            Generated answer
        """
        # Simplified answer generation - extractive approach
        # In production, this would call an LLM with the context
        
        answer = (
            f"Based on the retrieved medical literature:\n\n"
            f"Query: {query}\n\n"
            f"Relevant Information:\n{context}\n\n"
            f"Note: For production use, integrate with GPT-4, Claude, or a local "
            f"medical LLM to generate natural language answers from this context."
        )
        
        return answer
    
    def query(self, user_query: str, top_k: int = 5, return_sources: bool = True) -> Dict:
        """
        Complete RAG query pipeline
        
        Args:
            user_query: User's medical question
            top_k: Number of context passages to retrieve
            return_sources: Whether to return source documents
            
        Returns:
            Dictionary with answer and optional sources
        """
        # Retrieve relevant documents
        retrieved_docs = self.retrieve_context(user_query, top_k=top_k)
        
        # Format context
        context = self.format_context(retrieved_docs)
        
        # Generate answer
        answer = self.generate_answer(user_query, context)
        
        # Prepare response
        response = {
            'query': user_query,
            'answer': answer,
            'num_sources': len(retrieved_docs)
        }
        
        if return_sources:
            response['sources'] = retrieved_docs
        
        return response
    
    def batch_query(self, queries: List[str], top_k: int = 5) -> List[Dict]:
        """
        Process multiple queries in batch
        
        Args:
            queries: List of query strings
            top_k: Number of passages per query
            
        Returns:
            List of response dictionaries
        """
        results = []
        
        for query in queries:
            result = self.query(query, top_k=top_k)
            results.append(result)
        
        return results
    
    def get_similar_questions(self, query: str, top_k: int = 3) -> List[str]:
        """
        Get similar questions from the corpus
        
        Args:
            query: User query
            top_k: Number of similar questions to find
            
        Returns:
            List of similar question texts
        """
        retrieved = self.retrieve_context(query, top_k=top_k)
        
        similar = []
        for doc_result in retrieved:
            # Extract question-like sentences
            text = doc_result['document']['text']
            sentences = text.split('.')
            
            for sentence in sentences:
                sentence = sentence.strip()
                if '?' in sentence or any(q in sentence.lower() for q in ['what', 'how', 'why', 'when', 'where']):
                    similar.append(sentence)
                    break
        
        return similar[:top_k]


if __name__ == "__main__":
    print("RAG Pipeline Test")
    print("Note: This test requires initialized embeddings and vector store")
    print("Run through the main app.py for full functionality")
    
    # Example structure
    print("\nRAG Pipeline Flow:")
    print("1. User asks: 'What are symptoms of diabetes?'")
    print("2. Generate query embedding using BioBERT")
    print("3. Search FAISS index for top-5 relevant passages")
    print("4. Retrieve passages with metadata and relevance scores")
    print("5. Format context with citations")
    print("6. Generate answer (in production: use LLM with context)")
    print("7. Return answer with source citations")
