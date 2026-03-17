from fastapi import FastAPI, UploadFile
from pipeline import ingest
import shutil
import os

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    records = ingest(temp_path, metadata={"source": file.filename})
    os.remove(temp_path)

    return {"records": len(records), "status": "ok"}