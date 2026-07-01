from fastapi import APIRouter

from app.api.endpoints import jarvis

api_router = APIRouter()
api_router.include_router(jarvis.router, prefix="/api", tags=["jarvis"])
