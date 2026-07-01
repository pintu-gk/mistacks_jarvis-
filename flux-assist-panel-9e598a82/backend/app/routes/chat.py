from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.cohere_service import CohereService

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


@router.post("/chat")
async def chat(request: ChatRequest):

    if not request.message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    cohere_service = CohereService()

    history = None
    if request.history:
        history = [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in request.history
        ]

    reply = cohere_service.get_response(
        request.message,
        history
    )

    return {
        "reply": reply
    }