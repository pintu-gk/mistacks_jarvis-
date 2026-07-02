from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse 
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import db

router = APIRouter(prefix="/api/notes", tags=["Notes"])

class NoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    folder: str = "AI Notes"

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    isFavorite: Optional[bool] = None
    folder: Optional[str] = None

@router.post("/")
async def create_note(note: NoteCreate):
    doc = {
        "title": note.title,
        "content": note.content,
        "tags": note.tags,
        "folder": note.folder,
        "isFavorite": False,
        "isArchived": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "type": "ai-note"
    }
    doc_id = await db.insert_one("notes", doc)
    return JSONResponse(content={"id": doc_id, **doc})

@router.get("/")
async def list_notes():
    items = await db.find_many("notes")
    for item in items:
        item["_id"] = str(item["_id"])
    return JSONResponse(content=items)

@router.put("/{note_id}")
async def update_note(note_id: str, updates: NoteUpdate):
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(400, "No fields to update")
    update_data["updated_at"] = datetime.utcnow()
    await db.update_one("notes", {"_id": note_id}, update_data)
    return JSONResponse(content={"message": "Updated"})

@router.delete("/{note_id}")
async def delete_note(note_id: str):
    await db.delete_one("notes", {"_id": note_id})
    return JSONResponse(content={"message": "Deleted"})