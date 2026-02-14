# Medical RAG AI - Setup and Testing Guide

## Quick Start

### 1. Install Dependencies

```bash
cd medical-rag-ai

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2. Prepare Sample Documents

We've included two sample medical documents in `data/documents/`:
- `diabetes_overview.txt` - Comprehensive diabetes information
- `hypertension_guidelines.txt` - Hypertension clinical guidelines

For testing with PDFs, you can:
- Convert these .txt files to PDF using online converters
- Or use your own medical PDFs (research papers, clinical guidelines)

### 3. Run the Application

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## How to Use

### First Time Setup

1. **Initialize System**
   - Click "🚀 Initialize System" in the sidebar
   - Wait for BioBERT model to download (first time only, ~400MB)
   - System will be ready when you see "✅ System Ready"

2. **Upload Documents**
   - Convert sample .txt files to PDF or use your own PDFs
   - Click "Upload Medical PDFs" in sidebar
   - Select one or more PDF files
   - Click "🔄 Process Documents"
   - Wait for processing and indexing to complete

3. **Ask Questions**
   - Enter a medical question in the text area
   - Adjust "Number of sources" slider if needed
   - Click "🔍 Search"
   - View retrieved sources with relevance scores

### Sample Questions to Try

After uploading the sample documents:

**About Diabetes:**
- What are the symptoms of diabetes?
- How is diabetes diagnosed?
- What are the complications of diabetes?
- What medications are used to treat Type 2 diabetes?
- What lifestyle changes help manage diabetes?

**About Hypertension:**
- What causes high blood pressure?
- What are the blood pressure classifications?
- What medications treat hypertension?
- What is the DASH diet?
- What are hypertensive emergencies?

**General Medical:**
- What is the relationship between diabetes and hypertension?
- How does obesity affect these conditions?
- What lifestyle modifications help both conditions?

## Project Structure

```
medical-rag-ai/
├── app.py                          # Main Streamlit application
├── requirements.txt                # Python dependencies
├── src/
│   ├── document_processor.py      # PDF text extraction & chunking
│   ├── embeddings.py              # BioBERT embedding generation
│   ├── vector_store.py            # FAISS index management
│   └── rag_pipeline.py            # RAG query processing
├── data/
│   └── documents/                 # PDF storage
│       ├── diabetes_overview.txt
│       └── hypertension_guidelines.txt
└── faiss_index/                   # FAISS index files (created after processing)
    ├── faiss.index
    └── documents.pkl
```

## Features Demonstrated

✅ **Document Processing**
- PDF text extraction
- Text preprocessing and cleaning
- Smart chunking with overlap
- Metadata tracking

✅ **BioBERT Embeddings**
- Medical domain-specific embeddings
- 768-dimensional vectors
- Batch processing
- GPU support (if available)

✅ **FAISS Vector Search**
- Fast similarity search
- Persistent index storage
- Scalable to 1000+ documents

✅ **RAG Pipeline**
- Query embedding generation
- Top-k retrieval
- Source citation tracking
- Relevance scoring

✅ **Interactive UI**
- Document upload interface
- Real-time query processing
- Source visualization
- Query history
- System statistics

## Performance Metrics

Expected performance (with sample documents):
- **Initialization**: ~30 seconds (first time with model download)
- **Document Processing**: ~5-10 seconds per document
- **Query Response**: <2 seconds
- **Retrieval Accuracy**: High relevance for medical queries

## Troubleshooting

### Model Download Issues
If BioBERT model fails to download:
```python
# Pre-download manually
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb')
```

### Memory Issues
If you encounter memory errors:
- Reduce `chunk_size` in document_processor.py
- Process fewer documents at once
- Use CPU instead of GPU if GPU memory is limited

### FAISS Installation Issues
Windows users may need:
```bash
pip install faiss-cpu --no-cache
```

### PDF Extraction Issues
If PDFs won't process:
- Ensure PDFs are text-based (not scanned images)
- Try alternative: `pdfplumber` or `pypdf`

## Next Steps

### For Production Deployment

1. **Add LLM Integration**
   - Integrate GPT-4, Claude, or local LLM
   - Generate natural language answers from retrieved context
   - Currently shows retrieved passages only

2. **Deploy to Streamlit Cloud**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Medical RAG AI Assistant"
   git push origin main
   
   # Deploy at share.streamlit.io
   ```

3. **Enhancements**
   - Add authentication
   - Implement caching
   - Add more medical documents
   - Fine-tune retrieval parameters
   - Add conversation history
   - Implement query suggestions

### Testing Individual Components

Test document processor:
```bash
cd src
python document_processor.py
```

Test embeddings:
```bash
cd src
python embeddings.py
```

Test vector store:
```bash
cd src
python vector_store.py
```

## Tech Stack Summary

- **Python 3.9+**: Core language
- **Streamlit**: Web interface
- **BioBERT**: Medical embeddings (via sentence-transformers)
- **FAISS**: Vector similarity search
- **PyPDF2**: PDF text extraction
- **PyTorch**: Deep learning backend
- **NumPy**: Numerical computations

## Demo Screenshots

(After running the app, take screenshots for your portfolio)

Recommended screenshots:
1. Main interface with uploaded documents
2. Query results with sources
3. System statistics sidebar
4. Retrieved passages with relevance scores

## Support

For issues or questions:
- Check the code comments
- Review error messages in terminal
- Verify all dependencies are installed
- Ensure sample documents exist in data/documents/

## License

MIT License - Free to use and modify for your portfolio

---

**Note**: This is a demonstration project showcasing RAG architecture with medical NLP. For production medical applications, ensure compliance with healthcare regulations (HIPAA, etc.) and proper validation.
