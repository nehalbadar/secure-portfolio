@echo off
setlocal

set CONDA=C:\Users\Nasic Badar\anaconda3\Scripts\conda.exe

REM Run Streamlit with the correct conda env
"%CONDA%" run -n medical-rag-ai python -m streamlit run "%~dp0app.py"
