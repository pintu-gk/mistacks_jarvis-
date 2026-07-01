"""AI Reader routes: SSE upload, history, delete."""
from __future__ import annotations

import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import AsyncGenerator

import aiofiles
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app import database
from app.services.pdf_service import extract_pdf
from app.services.voice_service import AUDIO_DIR, synthesize

router = APIRouter(prefix="/api", tags=["reader"])

PDF_DIR = os.path.join("static", "pdfs")


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event)}\n\n"


@router.post("/upload-stream")
async def upload_stream(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    os.makedirs(PDF_DIR, exist_ok=True)
    os.makedirs(AUDIO_DIR, exist_ok=True)

    file_id = uuid.uuid4().hex
    pdf_path = os.path.join(PDF_DIR, f"{file_id}.pdf")

    # Save upload to disk first so we can stream progress.
    content = await file.read()
    async with aiofiles.open(pdf_path, "wb") as f:
        await f.write(content)

    lang = "hi" if language == "hi" else "en"

    async def gen() -> AsyncGenerator[str, None]:
        try:
            yield _sse({"status": "uploading", "progress": 10, "message": "Uploading PDF..."})
            await asyncio.sleep(0)

            yield _sse({"status": "extracting", "progress": 40, "message": "Extracting text..."})
            total_pages, chunks = await asyncio.to_thread(extract_pdf, pdf_path, 5)

            if not chunks:
                # cleanup
                try:
                    os.remove(pdf_path)
                except OSError:
                    pass
                yield _sse({"status": "error", "progress": 0, "message": "No text found in PDF"})
                return

            audio_urls: list[str] = []
            n = len(chunks)
            for i, chunk in enumerate(chunks, start=1):
                progress = 40 + int((i / n) * 50)  # 40 -> 90
                yield _sse({
                    "status": "voicing",
                    "progress": progress,
                    "message": f"Generating voice {i}/{n}...",
                })
                url = await asyncio.to_thread(synthesize, chunk, lang)
                audio_urls.append(url)

            yield _sse({"status": "saving", "progress": 95, "message": "Saving history..."})
            record = {
                "file_id": file_id,
                "filename": file.filename,
                "language": lang,
                "total_pages": total_pages,
                "chunks": n,
                "audio_urls": audio_urls,
                "pdf_path": pdf_path,
                "created_at": datetime.utcnow().isoformat(),
            }
            await database.add_record(record)

            yield _sse({
                "status": "ready",
                "progress": 100,
                "message": "Ready",
                "file_id": file_id,
                "filename": file.filename,
                "total_pages": total_pages,
                "audio_urls": audio_urls,
            })
        except Exception as e:
            yield _sse({"status": "error", "progress": 0, "message": str(e)})

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/history")
async def get_history():
    return {"items": await database.list_records()}


@router.delete("/delete-pdf/{file_id}")
async def delete_pdf(file_id: str):
    record = await database.get_record(file_id)
    if not record:
        raise HTTPException(status_code=404, detail="Not found")

    # Delete audio files
    for url in record.get("audio_urls", []):
        try:
            rel = url.lstrip("/")
            if os.path.exists(rel):
                os.remove(rel)
        except OSError:
            pass

    # Delete PDF
    pdf_path = record.get("pdf_path") or os.path.join(PDF_DIR, f"{file_id}.pdf")
    try:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
    except OSError:
        pass

    await database.delete_record(file_id)
    return {"ok": True, "file_id": file_id}
