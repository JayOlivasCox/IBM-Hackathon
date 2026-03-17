from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pipeline import ingest
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import anthropic
import numpy as np
import shutil
import json
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()
model = SentenceTransformer("all-MiniLM-L6-v2")


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def get_relevant_chunks(question: str, data: dict, top_k: int = 5) -> str:
    """Embed the question and find the most similar chunks using cosine similarity."""
    question_embedding = model.encode(question).tolist()

    scored_chunks = []
    for doc in data.get("documents", []):
        note_name = doc.get("note_name", doc.get("source", "unknown"))
        for chunk in doc.get("chunks", []):
            embedding = chunk.get("embedding")
            if not embedding:
                continue
            score = cosine_similarity(question_embedding, embedding)
            scored_chunks.append({
                "text": chunk["text"],
                "note_name": note_name,
                "score": score
            })

    # Sort by similarity score and take top_k
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = scored_chunks[:top_k]

    # Build context from top chunks
    context = ""
    for chunk in top_chunks:
        context += f"--- {chunk['note_name']} (relevance: {chunk['score']:.2f}) ---\n"
        context += chunk["text"] + "\n\n"

    return context


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), note_name: str = Form("")):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    name = note_name if note_name else file.filename
    records = ingest(temp_path, metadata={"note_name": name, "source": file.filename})

    os.remove(temp_path)

    return {
        "status": "success",
        "filename": file.filename,
        "note_name": name,
        "chunks": len(records)
    }


@app.post("/chat")
async def chat(request: dict):
    message = request.get("message")

    if not os.path.exists("vectors.json"):
        return {"response": "No documents uploaded yet. Please upload a file first."}

    with open("vectors.json", "r") as f:
        data = json.load(f)

    # Use cosine similarity to find only the most relevant chunks
    context = get_relevant_chunks(message, data, top_k=5)

    if not context:
        return {"response": "No content found in uploaded documents."}

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""You are a helpful study buddy. Use the following context from the user's uploaded documents to answer their question.

Rules:
- When quizzing the student, ask questions one at a time and wait for their answer before moving on
- Do NOT give answers or answer keys unless the student explicitly asks for them
- If the student answers a question, tell them if they are right or wrong and explain why
- If the student says "I don't know" or asks for the answer, then you can reveal it
- Keep responses concise and encouraging
- If the answer is not in the context, say so

Context:
{context}

Question: {message}"""
        }]
    )

    return {"response": response.content[0].text}