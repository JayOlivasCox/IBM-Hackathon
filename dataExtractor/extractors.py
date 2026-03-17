from dotenv import load_dotenv
load_dotenv()

import anthropic
import fitz  # PyMuPDF
import base64
from pathlib import Path

client = anthropic.Anthropic()

def extract_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF — uses PyMuPDF for native text, Claude for scanned pages."""
    doc = fitz.open(pdf_path)
    full_text = []

    for page_num, page in enumerate(doc):
        text = page.get_text().strip()

        if len(text) > 50:
            full_text.append(text)
        else:
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            img_b64 = base64.b64encode(img_bytes).decode()

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2048,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": "image/png", "data": img_b64}
                        },
                        {"type": "text", "text": "Extract all text from this page. Output only the text, preserving structure."}
                    ]
                }]
            )
            full_text.append(response.content[0].text)

    return "\n\n".join(full_text)


def extract_from_image(image_path: str) -> str:
    """Extract text from an image using Claude vision."""
    import filetype

    with open(image_path, "rb") as f:
        img_data = f.read()
        img_b64 = base64.b64encode(img_data).decode()

    # Detect actual image format regardless of extension
    kind = filetype.guess(img_data)
    media_type = kind.mime if kind else "image/png"

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": img_b64}
                },
                {"type": "text", "text": "Extract all text from this image. Output only the extracted text, preserving its structure."}
            ]
        }]
    )
    return response.content[0].text


def extract_text(file_path: str) -> str:
    """Read plain text files."""
    return Path(file_path).read_text(encoding="utf-8")


def extract_any(file_path: str) -> str:
    """Auto-detect file type and extract text."""
    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        return extract_from_pdf(file_path)
    elif ext in {".png", ".jpg", ".jpeg", ".webp"}:
        return extract_from_image(file_path)
    elif ext in {".txt", ".md"}:
        return extract_text(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")