import uuid
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

import uuid
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_chunks(chunks: list[str]) -> list[dict]:
    """Generate embeddings locally — no API key needed."""
    embeddings = model.encode(chunks, convert_to_numpy=True)
    records = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        records.append({
            "id": str(uuid.uuid4()),
            "text": chunk,
            "embedding": embedding.tolist(),
            "chunk_index": i,
        })
    return records