import tiktoken

def chunk_text(text: str, max_tokens: int = 512, overlap: int = 50) -> list[str]:
    """Token-aware chunking with overlap for context continuity."""
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []

    start = 0
    while start < len(tokens):
        end = start + max_tokens
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        start += max_tokens - overlap  # slide with overlap

    return chunks