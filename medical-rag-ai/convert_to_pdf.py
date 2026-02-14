"""
Helper script to convert sample text files to PDFs for testing
Requires: pip install reportlab
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os


def text_to_pdf(text_file, pdf_file):
    """Convert text file to PDF"""
    # Read text file
    with open(text_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                           leftMargin=inch, rightMargin=inch,
                           topMargin=inch, bottomMargin=inch)
    
    # Styles
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']
    
    # Build PDF content
    story = []
    
    # Split content into paragraphs
    paragraphs = content.split('\n\n')
    
    for para in paragraphs:
        if para.strip():
            # Clean up the text
            para = para.replace('\n', ' ')
            p = Paragraph(para, normal_style)
            story.append(p)
            story.append(Spacer(1, 0.2*inch))
    
    # Build PDF
    doc.build(story)
    print(f"✓ Created {pdf_file}")


if __name__ == "__main__":
    print("Converting sample medical documents to PDF...")
    
    # Check if reportlab is installed
    try:
        import reportlab
    except ImportError:
        print("\n❌ reportlab not installed!")
        print("Install it with: pip install reportlab")
        print("\nAlternative: Use online converters like:")
        print("- https://www.pdf2go.com/txt-to-pdf")
        print("- https://www.online-convert.com/")
        exit(1)
    
    docs_dir = 'data/documents'
    
    # Convert text files
    text_files = [
        'diabetes_overview.txt',
        'hypertension_guidelines.txt'
    ]
    
    for text_file in text_files:
        text_path = os.path.join(docs_dir, text_file)
        pdf_path = os.path.join(docs_dir, text_file.replace('.txt', '.pdf'))
        
        if os.path.exists(text_path):
            text_to_pdf(text_path, pdf_path)
        else:
            print(f"⚠️  File not found: {text_path}")
    
    print("\n✅ PDF conversion complete!")
    print("You can now upload these PDFs through the Streamlit app.")
