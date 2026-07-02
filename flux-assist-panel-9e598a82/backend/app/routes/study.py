from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.core.database import db

router = APIRouter(prefix="/api/study", tags=["StudyPlanner"])

# ==================== Models ====================
class SessionItem(BaseModel):
    id: str
    time: str
    subject: str
    task: str

class StudyPlan(BaseModel):
    sessions: List[SessionItem]
    chapters: int
    questions: int
    hours: int
    autoAdjust: bool
    readAloud: bool
    remindBefore: bool
    pushOnSkip: bool

# ==================== Endpoints ====================
@router.get("/plan")
async def get_plan():
    """Get the current study plan (will be a single document)."""
    # We'll store the plan under a fixed ID, e.g., "default"
    doc = await db.find_one("study_plans", {"_id": "default"})
    if not doc:
        # Return default empty plan
        return {
            "sessions": [],
            "chapters": 2,
            "questions": 30,
            "hours": 3,
            "autoAdjust": True,
            "readAloud": True,
            "remindBefore": True,
            "pushOnSkip": False
        }
    # Remove _id from response
    doc.pop("_id", None)
    return JSONResponse(content=doc)

@router.post("/plan")
async def save_plan(plan: StudyPlan):
    """Save the entire study plan."""
    # Convert to dict
    data = plan.dict()
    # Upsert: replace the entire document for "default"
    await db.update_one("study_plans", {"_id": "default"}, data, upsert=True)
    return JSONResponse(content={"message": "Plan saved"})

@router.post("/sessions")
async def add_session(session: SessionItem):
    """Add a new session to the plan."""
    doc = await db.find_one("study_plans", {"_id": "default"})
    if not doc:
        # Create new plan with this session
        new_plan = {
            "_id": "default",
            "sessions": [session.dict()],
            "chapters": 2,
            "questions": 30,
            "hours": 3,
            "autoAdjust": True,
            "readAloud": True,
            "remindBefore": True,
            "pushOnSkip": False
        }
        await db.insert_one("study_plans", new_plan)
        return JSONResponse(content={"message": "Session added"})
    else:
        sessions = doc.get("sessions", [])
        sessions.append(session.dict())
        await db.update_one("study_plans", {"_id": "default"}, {"sessions": sessions})
        return JSONResponse(content={"message": "Session added"})

@router.put("/sessions/{session_id}")
async def update_session(session_id: str, session: SessionItem):
    """Update a specific session by its id."""
    doc = await db.find_one("study_plans", {"_id": "default"})
    if not doc:
        raise HTTPException(404, "Plan not found")
    sessions = doc.get("sessions", [])
    updated = False
    for i, s in enumerate(sessions):
        if s["id"] == session_id:
            sessions[i] = session.dict()
            updated = True
            break
    if not updated:
        raise HTTPException(404, "Session not found")
    await db.update_one("study_plans", {"_id": "default"}, {"sessions": sessions})
    return JSONResponse(content={"message": "Session updated"})

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session by its id."""
    doc = await db.find_one("study_plans", {"_id": "default"})
    if not doc:
        raise HTTPException(404, "Plan not found")
    sessions = doc.get("sessions", [])
    new_sessions = [s for s in sessions if s["id"] != session_id]
    if len(new_sessions) == len(sessions):
        raise HTTPException(404, "Session not found")
    await db.update_one("study_plans", {"_id": "default"}, {"sessions": new_sessions})
    return JSONResponse(content={"message": "Session deleted"})