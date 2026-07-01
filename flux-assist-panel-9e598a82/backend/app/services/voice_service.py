"""Text-to-speech via gTTS."""
from __future__ import annotations

import os
import uuid
from typing import Literal

from gtts import gTTS

Lang = Literal["en", "hi"]

AUDIO_DIR = os.path.join("static", "audio")


def ensure_dir() -> None:
    os.makedirs(AUDIO_DIR, exist_ok=True)


def synthesize(text: str, language: Lang = "en") -> str:
    """Generate an MP3 from text and return the relative URL path."""
    ensure_dir()
    fname = f"{uuid.uuid4().hex}.mp3"
    fpath = os.path.join(AUDIO_DIR, fname)
    # gTTS chokes on very long strings; cap to ~4500 chars per request.
    safe = text[:4500] if len(text) > 4500 else text
    tts = gTTS(text=safe, lang=language)
    tts.save(fpath)
    return f"/static/audio/{fname}"
