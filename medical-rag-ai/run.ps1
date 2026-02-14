$ErrorActionPreference = "Stop"

$conda = "C:\Users\Nasic Badar\anaconda3\Scripts\conda.exe"

# Run Streamlit with the correct interpreter (avoids missing-module issues when base Anaconda is active)
& $conda run -n medical-rag-ai python -m streamlit run .\app.py
