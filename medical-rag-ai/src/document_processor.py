"""Document Processor Module

Handles PDF extraction, text preprocessing, and chunking for the RAG pipeline.
PDF support requires the optional dependency PyPDF2.
"""

import os
import re
from typing import Dict, List


class DocumentProcessor:
    """Process medical PDFs and prepare text for embedding generation"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        """
        Initialize document processor
        
        Args:
            chunk_size: Number of characters per chunk
            chunk_overlap: Overlap between consecutive chunks
        """
        if chunk_size <= 0:
            raise ValueError("chunk_size must be > 0")
        if chunk_overlap < 0:
            raise ValueError("chunk_overlap must be >= 0")
        if chunk_overlap >= chunk_size:
            raise ValueError(
                f"chunk_overlap ({chunk_overlap}) must be smaller than chunk_size ({chunk_size})."
            )

        self.chunk_size = int(chunk_size)
        self.chunk_overlap = int(chunk_overlap)
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text content from a PDF file
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text as string
        """
        try:
            try:
                import PyPDF2  # local import so app can still run without it
            except ModuleNotFoundError as e:
                raise ModuleNotFoundError(
                    "PyPDF2 is required for PDF uploads. Install it with: pip install PyPDF2"
                ) from e

            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""

                for page in pdf_reader.pages:
                    page_text = page.extract_text() or ""
                    text += page_text + "\n"

                return text
        except Exception as e:
            raise RuntimeError(f"Error extracting text from {pdf_path}: {str(e)}") from e

    def extract_text_from_txt(self, txt_path: str) -> str:
        """Extract text from a plain text file."""
        try:
            with open(txt_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            raise RuntimeError(f"Error reading text file {txt_path}: {str(e)}") from e
    
    def preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess extracted text
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep medical terminology
        text = re.sub(r'[^\w\s\-.,;:()\[\]/%]', '', text)
        
        # Normalize whitespace
        text = text.strip()
        
        return text
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks for better context preservation
        
        Args:
            text: Preprocessed text
            
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            # Calculate end position
            end = start + self.chunk_size
            
            # If not at the end, try to break at sentence boundary
            if end < text_length:
                # Look for sentence ending punctuation
                last_period = text.rfind('.', start, end)
                last_question = text.rfind('?', start, end)
                last_exclamation = text.rfind('!', start, end)
                
                # Use the last sentence boundary found
                sentence_end = max(last_period, last_question, last_exclamation)
                
                if sentence_end > start:
                    end = sentence_end + 1
            
            # Extract chunk
            chunk = text[start:end].strip()
            
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            next_start = end - self.chunk_overlap
            # Safety guard against misconfiguration causing non-progress.
            if next_start <= start:
                next_start = end
            start = next_start
        
        return chunks
    
    def process_document(self, pdf_path: str) -> List[Dict[str, str]]:
        """
        Complete processing pipeline for a document
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            List of document chunks with metadata
        """
        # Extract text (PDF or TXT)
        ext = os.path.splitext(pdf_path)[1].lower()
        if ext == '.pdf':
            raw_text = self.extract_text_from_pdf(pdf_path)
        elif ext == '.txt':
            raw_text = self.extract_text_from_txt(pdf_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        
        # Preprocess
        clean_text = self.preprocess_text(raw_text)
        
        # Chunk
        chunks = self.chunk_text(clean_text)
        
        # Add metadata
        filename = os.path.basename(pdf_path)
        
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            processed_chunks.append({
                'text': chunk,
                'source': filename,
                'chunk_id': i,
                'total_chunks': len(chunks)
            })
        
        return processed_chunks
    
    def process_directory(self, directory_path: str) -> List[Dict[str, str]]:
        """
        Process all PDF files in a directory
        
        Args:
            directory_path: Path to directory containing PDFs
            
        Returns:
            List of all document chunks with metadata
        """
        all_chunks = []
        
        # Get all supported files
        supported_files = [
            f for f in os.listdir(directory_path)
            if f.lower().endswith('.pdf') or f.lower().endswith('.txt')
        ]

        if not supported_files:
            raise ValueError(f"No .pdf or .txt files found in {directory_path}")
        
        errors: List[str] = []

        # Process each file
        for filename in supported_files:
            pdf_path = os.path.join(directory_path, filename)
            try:
                chunks = self.process_document(pdf_path)
                all_chunks.extend(chunks)
                print(f"✓ Processed {filename}: {len(chunks)} chunks")
            except Exception as e:
                msg = f"{filename}: {type(e).__name__}: {e!r}"
                errors.append(msg)
                print(f"✗ Error processing {msg}")
                continue

        if not all_chunks:
            details = "\n".join(errors) if errors else "(no error details)"
            raise ValueError(
                "No chunks were produced. This usually means files couldn't be read/extracted.\n" + details
            )

        return all_chunks


if __name__ == "__main__":
    # Test the document processor
    processor = DocumentProcessor(chunk_size=500, chunk_overlap=50)
    
    # Test with sample text
    sample_text = """
    Diabetes mellitus is a chronic metabolic disorder characterized by elevated blood glucose levels.
    Type 1 diabetes results from autoimmune destruction of pancreatic beta cells.
    Type 2 diabetes is associated with insulin resistance and relative insulin deficiency.
    Common symptoms include polyuria, polydipsia, and unexplained weight loss.
    Treatment includes lifestyle modifications, oral medications, and insulin therapy.
    """
    
    clean_text = processor.preprocess_text(sample_text)
    chunks = processor.chunk_text(clean_text)
    
    print(f"Processed {len(chunks)} chunks from sample text")
    for i, chunk in enumerate(chunks):
        print(f"\nChunk {i + 1}:")
        print(chunk[:100] + "..." if len(chunk) > 100 else chunk)
