from pathlib import Path
from dataExtractor.extractors import extract_any
from dataExtractor.chunker import chunk_text
from dataExtractor.embedder import embed_chunks
import json
import os

VECTORS_FILE = "vectors.json"


def load_existing() -> list:
    """Load existing records from vectors.json if it exists."""
    if os.path.exists(VECTORS_FILE):
        with open(VECTORS_FILE, "r") as f:
            data = json.load(f)
            return data.get("documents", [])
    return []


def ingest(file_path: str, metadata: dict = {}) -> list[dict]:
    """Extract → chunk → embed → save to vectors.json."""
    path = Path(file_path)

    # 1. Extract
    text = extract_any(file_path)

    # 2. Chunk
    chunks = chunk_text(text)

    # 3. Embed
    records = embed_chunks(chunks)

    # 4. Attach metadata
    for r in records:
        r["metadata"] = {
            "source": path.name,
            "file_type": path.suffix.lower(),
            **metadata
        }

    # 5. Load existing and append
    existing = load_existing()
    existing.append({
        "source": path.name,
        "file_type": path.suffix.lower(),
        "chunks": records
    })

    # 6. Save to vectors.json
    with open(VECTORS_FILE, "w") as f:
        json.dump({"documents": existing}, f, indent=2)

    print(f"✅ Added {path.name} → {len(records)} chunks | Total documents: {len(existing)}")
    return records