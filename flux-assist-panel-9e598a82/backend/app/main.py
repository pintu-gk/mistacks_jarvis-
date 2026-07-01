"""Jarvis Reader backend."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app import database
from app.routes import reader, chat   # ✅ chat added

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("jarvis")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all required folders exist BEFORE mounting
    os.makedirs("static/audio", exist_ok=True)
    os.makedirs("static/pdfs", exist_ok=True)
    await database.init()
    logger.info("Jarvis backend ready")
    yield
    logger.info("Jarvis backend shutting down")


app = FastAPI(
    title="Jarvis Reader Backend",
    description="PDF -> speech with SSE progress",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ This line is crucial – creates the root static directory
os.makedirs("static", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(reader.router)
app.include_router(chat.router)        # ✅ chat router added


@app.get("/")
async def root():
    return {"status": "Jarvis Reader Backend Running"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})