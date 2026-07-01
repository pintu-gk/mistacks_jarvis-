import json
import re
import webbrowser
from typing import Any

import google.generativeai as genai

from app.config import get_settings

SYSTEM_PROMPT = """You are Jarvis, a helpful personal AI assistant for Abhi.
You are concise, friendly, and proactive. Keep replies under 150 words unless asked for detail.
You can help with scheduling, study, smart-home ideas, and general questions."""


COMMAND_PARSER_PROMPT = """You are a command parser for a desktop/voice assistant named Jarvis.
Convert the user's natural language command into a JSON object.

Supported actions:
- open_app: open a website or application (target = app name, e.g. youtube, gmail, google)
- search: web search (target = search engine, query = search terms)
- chat: general conversation (query = the user's message)
- reminder: set a reminder (target = time or label, query = reminder text)
- unknown: when you cannot map the command

Respond with ONLY valid JSON, no markdown. Example:
{"action":"open_app","target":"youtube"}
{"action":"search","target":"google","query":"weather in Delhi"}
{"action":"chat","query":"what is on my schedule today"}"""


def _configure_genai() -> None:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.")
    genai.configure(api_key=settings.gemini_api_key)


def _get_model(system_instruction: str | None = None) -> genai.GenerativeModel:
    _configure_genai()
    settings = get_settings()
    kwargs: dict[str, Any] = {"model_name": settings.gemini_model}
    if system_instruction:
        kwargs["system_instruction"] = system_instruction
    return genai.GenerativeModel(**kwargs)


def _strip_json_fences(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


async def chat(message: str, history: list[dict[str, str]] | None = None) -> str:
    model = _get_model(SYSTEM_PROMPT)
    chat_session = model.start_chat(
        history=[
            {"role": "user" if m.get("role") == "user" else "model", "parts": [m["content"]]}
            for m in (history or [])
            if m.get("content")
        ]
    )
    response = chat_session.send_message(message)
    return (response.text or "").strip()


async def parse_command(command: str) -> tuple[dict[str, Any] | None, str]:
    model = _get_model(COMMAND_PARSER_PROMPT)
    response = model.generate_content(command)
    raw = (response.text or "").strip()
    cleaned = _strip_json_fences(raw)
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed, raw
    except json.JSONDecodeError:
        pass
    return None, raw
