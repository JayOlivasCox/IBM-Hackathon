import psycopg2
import json
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("NEON_DATABASE_URL"))

def setup_table():
    """Create the documents table if it doesn't exist."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            source TEXT,
            note_name TEXT,
            file_type TEXT,
            chunks JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def save_document(source: str, note_name: str, file_type: str, chunks: list):
    """Save a document and its chunks to Neon."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO documents (source, note_name, file_type, chunks)
        VALUES (%s, %s, %s, %s)
    """, (source, note_name, file_type, json.dumps(chunks)))
    conn.commit()
    cur.close()
    conn.close()

def load_all_documents() -> dict:
    """Load all documents from Neon in the same format as vectors.json."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT source, note_name, file_type, chunks FROM documents")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    documents = []
    for row in rows:
        documents.append({
            "source": row[0],
            "note_name": row[1],
            "file_type": row[2],
            "chunks": row[3]
        })

    return {"documents": documents}